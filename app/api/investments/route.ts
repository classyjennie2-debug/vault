import { NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { requireAuthAPI } from "@/lib/auth"
import {
  getInvestmentPlansFromDb,
  run,
  createTransaction,
  getUserById,
  getUserActiveInvestmentsWithProfit,
  logActivity,
} from "@/lib/db"
import { safeNumber, validateInvestmentAmount, calculateExpectedProfit, calculateReturnRate } from "@/lib/investment-utils"
import { validate, investmentSchema } from "@/lib/validation"
import { mapErrorToResponse, createErrorResponse, InsufficientFundsError, NotFoundError, ValidationError } from "@/lib/error-handling"
import { investmentLogger } from "@/lib/logging"
import { rateLimitConfigs, checkRateLimit, getClientIp } from "@/lib/rate-limiting"

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    // Get active investments with accumulated profit calculations
    const investments = await getUserActiveInvestmentsWithProfit(user.id)

    return NextResponse.json({
      success: true,
      investments,
    })
  } catch (err: unknown) {
    investmentLogger.error("Get investments API error", err)
    const message = err instanceof Error ? err.message : "Something went wrong"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const clientIp = await getClientIp(req)
  
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    // Apply rate limiting
    const rateLimitKey = `investment_${user.id}`
    const rateLimitResult = await checkRateLimit(rateLimitKey, rateLimitConfigs.investment)
    if (rateLimitResult.limited) {
      investmentLogger.warn('Investment endpoint rate limited', { userId: user.id, ip: clientIp })
      return new Response(
        JSON.stringify({
          error: 'Too many investment requests. Please try again later.',
          retryAfter: rateLimitResult.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimitResult.retryAfter),
          },
        }
      )
    }

    const body = await req.json()

    // Validate input using schema
    const validationResult = validate(investmentSchema, {
      amount: body.amount,
      planId: body.planId,
      duration: body.duration,
      depositMethod: body.depositMethod || 'bank_transfer',
    })

    if (!validationResult.success) {
      investmentLogger.warn('Investment validation failed', { userId: user.id, errors: validationResult.details })
      const appError = mapErrorToResponse(new ValidationError('Invalid investment input', validationResult.details))
      return createErrorResponse(appError)
    }

    const { amount, planId, duration } = validationResult.data
    const safeAmount = safeNumber(amount, 0)

    // Get current user to check balance
    const currentUser = await getUserById(user.id)
    if (!currentUser) {
      investmentLogger.error('User not found', new Error('User not found'), {}, user.id)
      const appError = mapErrorToResponse(new NotFoundError('User'))
      return createErrorResponse(appError)
    }

    const userBalance = safeNumber(currentUser.balance, 0)

    // Check balance
    if (userBalance < safeAmount) {
      investmentLogger.warn('Insufficient funds for investment', 
        { userId: user.id, balance: userBalance, required: safeAmount }
      )
      const shortfall = safeAmount - userBalance
      const insufficientError = new InsufficientFundsError(userBalance, safeAmount)
      // Override message for better UX
      insufficientError.message = `Insufficient balance. You need $${shortfall.toLocaleString(undefined, { maximumFractionDigits: 2 })} more to invest this amount.`
      const appError = mapErrorToResponse(insufficientError)
      return createErrorResponse(appError)
    }

    // Validate plan
    const plans = await getInvestmentPlansFromDb()
    const plan = plans.find((p) => p.id === planId)
    if (!plan) {
      investmentLogger.warn('Investment plan not found', { userId: user.id, planId })
      const appError = mapErrorToResponse(new NotFoundError('Investment plan'))
      return createErrorResponse(appError)
    }

    // Safe min/max values with full validation
    const minAmount = safeNumber(plan.minAmount, 0)
    const maxAmount = safeNumber(plan.maxAmount, Infinity)

    // Validate amount against plan constraints
    const amountValidation = validateInvestmentAmount(safeAmount, minAmount, maxAmount)
    if (!amountValidation.isValid) {
      investmentLogger.warn('Investment amount validation failed', 
        { userId: user.id, error: amountValidation.error }
      )
      const appError = mapErrorToResponse(new ValidationError(amountValidation.error || 'Invalid investment amount'))
      return createErrorResponse(appError)
    }

    // Calculate expected profit using dynamic plan rate based on selected duration (days)
    const durationDays = safeNumber(duration, 7)
    const computedReturnRate = calculateReturnRate(durationDays, plan.planType || plan.name || "Conservative Bond Fund")
    const expectedProfit = calculateExpectedProfit(safeAmount, computedReturnRate)

    const startDate = new Date().toISOString()
    
    // Compute end date by adding the user's selected duration (in days)
    const end = new Date()
    end.setDate(end.getDate() + durationDays)
    
    const endDate = end.toISOString()
    const investmentId = uuidv4()

    // Execute operations to create investment with atomicity
    try {
      // FIX: Wrap all operations in a transaction to ensure atomicity
      // If any operation fails, all will be rolled back
      await run('BEGIN')

      // Insert investment into investments table (PostgreSQL)
      // Using snake_case column names for PostgreSQL
      await run(
        `INSERT INTO investments (id, user_id, plan_id, name, amount, status, projected_return, start_date, maturity_date) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          investmentId,
          user.id,
          plan.id,
          plan.name || "Unknown Plan",
          safeAmount,
          "active",
          expectedProfit,
          startDate,
          endDate
        ]
      )

      // Also insert into active_investments for backward compatibility (if needed by other code)
      try {
        await run(
          `INSERT INTO active_investments (id, userId, planId, planName, amount, expectedProfit, startDate, endDate, status, progressPercentage) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            investmentId,
            user.id,
            plan.id,
            plan.name || "Unknown Plan",
            safeAmount,
            expectedProfit,
            startDate,
            endDate,
            "active",
            0
          ]
        )
      } catch (_activeInvError) {
        // active_investments insert might fail if SQLite - that's okay, we have investments table anyway
        console.debug('Could not insert into active_investments, continuing with investments table')
      }

      // Deduct from user balance
      await run(`UPDATE users SET balance = balance - ? WHERE id = ?`, [safeAmount, user.id])

      // Create transaction record using correct column names for PostgreSQL
      const transactionId = uuidv4()
      await run(
        `INSERT INTO transactions (id, user_id, type, amount, status, description, date) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          transactionId,
          user.id,
          'investment',
          safeAmount,
          'approved',
          `${plan.name || "Investment"} - ${computedReturnRate.toFixed(2)}% for ${durationDays} days`,
          new Date().toISOString()
        ]
      )

      await run('COMMIT')
      
      investmentLogger.info('Investment created successfully', 
        { investmentId, planId, amount: safeAmount, expectedProfit },
        user.id
      )

      // Log activity for this investment
      try {
        await logActivity(
          user.id,
          "investment",
          `Investment created: $${safeAmount.toLocaleString()} in ${plan.name || "Investment Plan"} for ${durationDays} days`
        )
      } catch (err) {
        console.error("Failed to log investment activity:", err)
        // Continue even if activity logging fails
      }

      return NextResponse.json({ 
        success: true, 
        investmentId,
        investment: {
          id: investmentId,
          planId,
          amount: safeAmount,
          expectedProfit,
          startDate,
          endDate,
        }
      })
    } catch (error: unknown) {
      // FIX: Rollback transaction if creation fails
      try {
        await run('ROLLBACK')
      } catch (rollbackError: unknown) {
        investmentLogger.error('Rollback failed', rollbackError)
      }
      investmentLogger.error('Investment creation error', error, { planId, amount: safeAmount }, user.id)
      const appError = mapErrorToResponse(error)
      return createErrorResponse(appError)
    }
  } catch (err: unknown) {
    investmentLogger.error("Investment API error", err, {})
    const appError = mapErrorToResponse(err)
    return createErrorResponse(appError)
  }
}
