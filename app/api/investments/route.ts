import { NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { requireAuthAPI } from "@/lib/auth"
import {
  getInvestmentPlansFromDb,
  run,
  createTransaction,
  getUserById,
  getUserActiveInvestmentsWithProfit,
} from "@/lib/db"
import { safeNumber, validateInvestmentAmount, calculateExpectedProfit } from "@/lib/investment-utils"

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
    console.error("Get investments API error", err)
    const message = err instanceof Error ? err.message : "Something went wrong"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user
    
    const body = await req.json()
    const { planId, amount } = body as { planId: string; amount: number }

    // Validate input with safe number conversion
    if (!planId || amount == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const safeAmount = safeNumber(amount, 0)

    if (safeAmount <= 0) {
      return NextResponse.json({ error: "Investment amount must be positive" }, { status: 400 })
    }

    // Get current user to check balance
    const currentUser = await getUserById(user.id)
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userBalance = safeNumber(currentUser.balance, 0)

    // Check balance
    if (userBalance < safeAmount) {
      return NextResponse.json(
        { error: `Insufficient balance. You have $${userBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}, but investment requires $${safeAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
        { status: 400 }
      )
    }

    // Validate plan
    const plans = await getInvestmentPlansFromDb()
    const plan = plans.find((p) => p.id === planId)
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    // Safe min/max values with full validation
    const minAmount = safeNumber(plan.minAmount, 0)
    const maxAmount = safeNumber(plan.maxAmount, Infinity)

    // Validate amount against plan constraints
    const validation = validateInvestmentAmount(safeAmount, minAmount, maxAmount)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error || "Invalid investment amount" },
        { status: 400 }
      )
    }

    // Calculate expected profit safely
    const returnRate = safeNumber(plan.returnRate, 0)
    const expectedProfit = calculateExpectedProfit(safeAmount, returnRate)

    const startDate = new Date().toISOString()
    
    // Compute end date by adding duration safely
    const end = new Date()
    const duration = safeNumber(plan.duration, 0)
    const durationUnit = plan.durationUnit || "months"
    
    if (durationUnit === "months") {
      end.setMonth(end.getMonth() + duration)
    } else if (durationUnit === "years") {
      end.setFullYear(end.getFullYear() + duration)
    } else if (durationUnit === "days") {
      end.setDate(end.getDate() + duration)
    }
    
    const endDate = end.toISOString()

    const investmentId = uuidv4()

    // Insert active investment with initial progress = 0
    await run(
      `INSERT INTO active_investments (id, userId, planId, planName, amount, expectedProfit, startDate, endDate, status, progressPercentage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        0, // Progress starts at 0%
      ]
    )

    // Deduct from user balance
    await run(`UPDATE users SET balance = balance - ? WHERE id = ?`, [safeAmount, user.id])

    // Create corresponding transaction record
    await createTransaction({
      userId: user.id,
      type: "investment",
      amount: safeAmount,
      status: "approved",
      description: `${plan.name || "Investment"} - Investment started`,
    })

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
  } catch (err: unknown) {
    console.error("investment API error", err)
    const message = err instanceof Error ? err.message : "Something went wrong"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
