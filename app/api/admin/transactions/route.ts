import { NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { updateTransactionStatus, getUserById, all, run, createNotification } from "@/lib/db"
import { validate, adminApprovalSchema } from "@/lib/validation"
import { mapErrorToResponse, createErrorResponse, AuthorizationError, NotFoundError, ValidationError, TransactionError } from "@/lib/error-handling"
import { transactionLogger, logAuditEvent } from "@/lib/logging"
import { rateLimitConfigs, checkRateLimit, getClientIp } from "@/lib/rate-limiting"
import type { Transaction } from "@/lib/types"

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    // Verify admin access
    if (user.role !== "admin") {
      logAuditEvent(user.id, 'view_transactions', 'admin', 'failure')
      const appError = mapErrorToResponse(new AuthorizationError('Only admins can view all transactions'))
      return createErrorResponse(appError)
    }

    transactionLogger.info('Admin viewing all transactions', {}, user.id)
    const transactions = await all("SELECT * FROM transactions ORDER BY date DESC")
    
    logAuditEvent(user.id, 'view_transactions', 'admin', 'success', {
      changes: {
        transactionCount: { before: 0, after: transactions.length }
      }
    })

    return NextResponse.json(transactions)
  } catch (error) {
    transactionLogger.error("Admin transactions GET error", error as Error, {})
    const appError = mapErrorToResponse(error)
    return createErrorResponse(appError)
  }
}

export async function POST(req: NextRequest) {
  const clientIp = await getClientIp(req)

  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    // Verify admin access
    if (user.role !== "admin") {
      logAuditEvent(user.id, 'approve_transaction', 'transaction', 'failure')
      const appError = mapErrorToResponse(new AuthorizationError('Only admins can approve transactions'))
      return createErrorResponse(appError)
    }

    // Apply rate limiting to admin approvals (prevent abuse)
    const rateLimitKey = `admin_approval_${user.id}`
    const rateLimitResult = await checkRateLimit(rateLimitKey, rateLimitConfigs.transaction)
    if (rateLimitResult.limited) {
      transactionLogger.warn('Admin approval endpoint rate limited', { userId: user.id, ip: clientIp })
      return new Response(
        JSON.stringify({
          error: 'Too many approval requests. Please try again later.',
          retryAfter: rateLimitResult.retryAfter,
        }),
        { status: 429, headers: { 'Retry-After': String(rateLimitResult.retryAfter) } }
      )
    }

    const body = await req.json()

    // Validate input
    const validationResult = validate(adminApprovalSchema, {
      transactionId: body.transactionId,
      approved: body.approved ?? body.status === 'approved',
      notes: body.notes,
    })

    if (!validationResult.success) {
      transactionLogger.warn('Admin approval validation failed', { errors: validationResult.details }, user.id)
      console.error('Validation failed:', validationResult)
      const appError = mapErrorToResponse(new ValidationError('Invalid approval request', validationResult.details))
      return createErrorResponse(appError)
    }

    const { transactionId, approved, notes } = validationResult.data
    const newStatus = approved ? 'approved' : 'rejected'

    // Fetch the transaction
    const txResults: Transaction[] = await all(
      "SELECT * FROM transactions WHERE id = ?",
      [transactionId]
    )
    const transaction = txResults[0]

    if (!transaction) {
      console.error('Transaction not found:', transactionId)
      logAuditEvent(user.id, 'approve_transaction', 'transaction', 'failure')
      const appError = mapErrorToResponse(new NotFoundError('Transaction'))
      return createErrorResponse(appError)
    }

    // Execute approval operations
    try {
      console.log(`\n🔄 Processing transaction approval:`, {
        transactionId,
        status: transaction.status,
        type: transaction.type,
        amount: transaction.amount,
        userId: transaction.userId,
        approved
      })

      // Track response data
      let responseUserBalance = 0
      let responseUserName = "User"
      let responseUserEmail = ""

      // If approving a deposit, add amount to user balance FIRST (before marking as approved)
      if (approved && transaction.type === "deposit") {
        console.log(`💰 Processing deposit approval for user ${transaction.userId}, amount: $${transaction.amount}`)
        
        const userData = await getUserById(transaction.userId)
        if (!userData) {
          throw new Error(`User ${transaction.userId} not found for deposit`)
        }

        console.log(`👤 User found - current balance: $${userData.balance}`)
        const newBalance = userData.balance + transaction.amount
        console.log(`🧮 Calculating new balance: $${userData.balance} + $${transaction.amount} = $${newBalance}`)
        
        // Update the user balance in the database
        await run("UPDATE users SET balance = ? WHERE id = ?", [newBalance, transaction.userId])
        console.log(`✅ Balance updated successfully in database. New balance: $${newBalance}`)

        // Store for response
        responseUserBalance = newBalance
        responseUserName = userData.name
        responseUserEmail = userData.email

        transactionLogger.info('Deposit approved and balance updated', 
          { transactionId, depositAmount: transaction.amount, newBalance, userId: transaction.userId },
          user.id
        )
      } else if (approved && transaction.type !== "deposit") {
        console.log(`ℹ️  Transaction type is "${transaction.type}", not deposit - skipping balance update`)
        // For non-deposits, still fetch user info for response
        const userData = await getUserById(transaction.userId)
        if (userData) {
          responseUserName = userData.name
          responseUserEmail = userData.email
          responseUserBalance = userData.balance
        }
      } else if (!approved) {
        // For rejections, still fetch user info for response
        const userData = await getUserById(transaction.userId)
        if (userData) {
          responseUserName = userData.name
          responseUserEmail = userData.email
          responseUserBalance = userData.balance
        }
      }

      // Update transaction status AFTER balance is updated (for deposits)
      await run("UPDATE transactions SET status = ? WHERE id = ?", [newStatus, transactionId])
      console.log(`✅ Transaction status updated to: ${newStatus}`)

      // Create notification for the user
      const title = approved ? "Transaction Approved" : "Transaction Rejected"
      let message = approved
        ? `Your ${transaction.type} of $${transaction.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} has been approved.`
        : `Your ${transaction.type} of $${transaction.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} has been rejected${notes ? ': ' + notes : '.'}`
      
      // Add balance update info for approved deposits
      if (approved && transaction.type === "deposit" && responseUserBalance > 0) {
        message += ` Your new balance is $${responseUserBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}.`
      }
      
      const notificationType = approved ? "success" : "error"

      try {
        await createNotification({
          userId: transaction.userId,
          title,
          message,
          type: notificationType,
          actionUrl: "/dashboard/transactions"
        })
      } catch (notifError) {
        console.error('⚠️ Failed to create notification:', notifError)
        // Don't fail the entire request if notification fails
      }

      // Audit log the successful approval
      logAuditEvent(
        user.id,
        approved ? 'approve_transaction' : 'reject_transaction',
        'transaction',
        'success',
        {
          resourceId: transactionId,
          changes: {
            status: { before: transaction.status, after: newStatus }
          }
        }
      )

      transactionLogger.info(`Transaction ${newStatus} successfully`, 
        { transactionId, oldStatus: transaction.status, newStatus },
        user.id
      )

      return NextResponse.json({
        success: true,
        message: `Transaction ${newStatus} successfully`,
        transaction: {
          id: transactionId,
          status: newStatus,
          type: transaction.type,
          amount: transaction.amount,
          userId: transaction.userId,
          userName: responseUserName,
          userEmail: responseUserEmail,
          userBalance: responseUserBalance,
          timeProcessed: new Date().toISOString()
        }
      })
    } catch (error: any) {
      const errorMessage = error?.message || String(error) || "Unknown error"
      const errorStack = error?.stack || ""
      
      transactionLogger.error('Transaction approval error', error, { transactionId }, user.id)
      console.error('❌ Approval execution failed:', {
        message: errorMessage,
        transactionId,
        stack: errorStack,
      })
      
      logAuditEvent(user.id, 'approve_transaction', 'transaction', 'failure')
      
      // Return more detailed error response
      return NextResponse.json({
        success: false,
        error: {
          message: errorMessage || 'Failed to process transaction approval',
          type: error?.constructor?.name || 'UnknownError'
        }
      }, { status: 500 })
    }
  } catch (error: unknown) {
    console.error("❌ Admin approval POST error:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    })
    transactionLogger.error("Admin approval POST error", error as Error, {})
    const appError = mapErrorToResponse(error)
    return createErrorResponse(appError)
  }
}