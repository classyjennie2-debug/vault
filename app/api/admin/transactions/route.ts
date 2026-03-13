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
      changes: { transactionsCount: transactions.length }
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
      logAuditEvent(user.id, 'approve_transaction', 'transaction', 'failure')
      const appError = mapErrorToResponse(new NotFoundError('Transaction'))
      return createErrorResponse(appError)
    }

    // Execute approval operations
    try {
      // Update transaction status
      await run("UPDATE transactions SET status = ? WHERE id = ?", [newStatus, transactionId])

      // If approving a deposit, add amount to user balance
      if (approved && transaction.type === "deposit") {
        const userData = await getUserById(transaction.userId)
        if (!userData) {
          throw new Error('User not found for deposit')
        }

        const newBalance = userData.balance + transaction.amount
        await run("UPDATE users SET balance = ? WHERE id = ?", [newBalance, transaction.userId])

        transactionLogger.info('Deposit approved and balance updated', 
          { transactionId, depositAmount: transaction.amount, newBalance },
          user.id
        )
      }

      // Create notification for the user
      const title = approved ? "Transaction Approved" : "Transaction Rejected"
      const message = approved
        ? `Your ${transaction.type} of $${transaction.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} has been approved.`
        : `Your ${transaction.type} of $${transaction.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} has been rejected${notes ? ': ' + notes : '.'}`
      const notificationType = approved ? "success" : "error"

      await createNotification({
        userId: transaction.userId,
        title,
        message,
        type: notificationType,
        actionUrl: "/dashboard/transactions"
      })

      // Audit log the successful approval
      logAuditEvent(
        user.id,
        approved ? 'approve_transaction' : 'reject_transaction',
        'transaction',
        'success',
        {
          resourceId: transactionId,
          changes: {
            before: { status: transaction.status },
            after: { status: newStatus }
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
          timeProcessed: new Date().toISOString()
        }
      })
    } catch (error: any) {
      transactionLogger.error('Transaction approval error', error, { transactionId }, user.id)
      logAuditEvent(user.id, 'approve_transaction', 'transaction', 'failure')
      const appError = mapErrorToResponse(error)
      return createErrorResponse(appError)
    }
  } catch (error: unknown) {
    transactionLogger.error("Admin approval POST error", error as Error, {})
    const appError = mapErrorToResponse(error)
    return createErrorResponse(appError)
  }
}