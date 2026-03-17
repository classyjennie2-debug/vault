import { NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { getUserById, all, run, createNotification, pgPool } from "@/lib/db"
import { validate, adminApprovalSchema } from "@/lib/validation"
import { mapErrorToResponse, createErrorResponse, AuthorizationError, NotFoundError, ValidationError } from "@/lib/error-handling"
import { transactionLogger, logAuditEvent } from "@/lib/logging"
import { rateLimitConfigs, checkRateLimit, getClientIp } from "@/lib/rate-limiting"
import { validateOrigin } from "@/lib/csrf"

export async function GET(_req: NextRequest) {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    if (user.role !== "admin") {
      logAuditEvent(user.id, 'view_transactions', 'admin', 'failure')
      const appError = mapErrorToResponse(new AuthorizationError('Only admins can view all transactions'))
      return createErrorResponse(appError)
    }

    const usePostgres = pgPool !== null
    transactionLogger.info('Admin viewing all transactions', {}, user.id)
    const transactionsRaw = await all(
      usePostgres
        ? "SELECT id, user_id as \"userId\", type, amount, status, description, created_at as date FROM transactions ORDER BY created_at DESC"
        : "SELECT id, userId, type, amount, status, description, date FROM transactions ORDER BY date DESC"
    )

    const transactions = transactionsRaw.map((tx: any) => ({
      id: tx.id,
      userId: tx.userId || tx.userid,
      type: tx.type,
      amount: tx.amount,
      status: tx.status,
      description: tx.description,
      date: tx.date,
    }))

    logAuditEvent(user.id, 'view_transactions', 'admin', 'success', {
      changes: { transactionCount: { before: 0, after: transactions.length } }
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
    const csrf = validateOrigin(req)
    if (csrf) return csrf

    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    if (user.role !== "admin") {
      logAuditEvent(user.id, 'approve_transaction', 'transaction', 'failure')
      const appError = mapErrorToResponse(new AuthorizationError('Only admins can approve transactions'))
      return createErrorResponse(appError)
    }

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

    const usePostgres = pgPool !== null
    const txResults: any[] = await all(
      usePostgres
        ? "SELECT id, user_id as \"userId\", type, amount, status, description, created_at as date FROM transactions WHERE id = ?"
        : "SELECT id, userId, type, amount, status, description, date FROM transactions WHERE id = ?",
      [transactionId]
    )
    const txRaw = txResults[0]

    if (!txRaw) {
      logAuditEvent(user.id, 'approve_transaction', 'transaction', 'failure')
      const appError = mapErrorToResponse(new NotFoundError('Transaction'))
      return createErrorResponse(appError)
    }

    const transaction = {
      id: txRaw.id,
      userId: txRaw.userId || txRaw.userid,
      type: txRaw.type,
      amount: txRaw.amount,
      status: txRaw.status,
      description: txRaw.description,
      date: txRaw.date,
    }

    try {
      await run("BEGIN")

      if (!transaction.userId) {
        throw new Error(`Transaction ${transactionId} has no userId field`)
      }

      let responseUserBalance = 0
      let responseUserName = "User"
      let responseUserEmail = ""

      if (approved && transaction.type === "deposit") {
        const userData = await getUserById(transaction.userId)
        if (!userData) {
          throw new Error(`User ${transaction.userId} not found for deposit`)
        }

        const newBalance = userData.balance + transaction.amount
        await run("UPDATE users SET balance = ? WHERE id = ?", [newBalance, transaction.userId])

        responseUserBalance = newBalance
        responseUserName = userData.name
        responseUserEmail = userData.email

        transactionLogger.info('Deposit approved and balance updated', 
          { transactionId, depositAmount: transaction.amount, newBalance, userId: transaction.userId },
          user.id
        )
      } else if (!approved && transaction.type === "withdrawal") {
        // If withdrawal is REJECTED, restore the balance to the user
        const userData = await getUserById(transaction.userId)
        if (!userData) {
          throw new Error(`User ${transaction.userId} not found for withdrawal rejection`)
        }

        const restoredBalance = userData.balance + transaction.amount
        await run("UPDATE users SET balance = ? WHERE id = ?", [restoredBalance, transaction.userId])

        responseUserBalance = restoredBalance
        responseUserName = userData.name
        responseUserEmail = userData.email

        transactionLogger.info('Withdrawal rejected and balance restored', 
          { transactionId, withdrawalAmount: transaction.amount, restoredBalance, userId: transaction.userId },
          user.id
        )
      } else {
        const userData = await getUserById(transaction.userId)
        if (userData) {
          responseUserName = userData.name
          responseUserEmail = userData.email
          responseUserBalance = userData.balance
        }
      }

      await run("UPDATE transactions SET status = ? WHERE id = ?", [newStatus, transactionId])

      const title = approved ? "Transaction Approved" : "Transaction Rejected"
      let message = approved
        ? `Your ${transaction.type} of $${transaction.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} has been approved.`
        : `Your ${transaction.type} of $${transaction.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} has been rejected${notes ? ': ' + notes : '.'}`

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
        console.error('Notification creation failed:', notifError)
      }

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

      const response = NextResponse.json({
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

      await run("COMMIT")
      return response
    } catch (error: any) {
      try {
        await run("ROLLBACK")
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError)
      }

      const errorMessage = error?.message || String(error) || "Unknown error"

      transactionLogger.error('Transaction approval error', error, { transactionId }, user.id)
      logAuditEvent(user.id, 'approve_transaction', 'transaction', 'failure')

      return NextResponse.json({
        success: false,
        error: {
          message: errorMessage || 'Failed to process transaction approval',
          type: error?.constructor?.name || 'UnknownError'
        }
      }, { status: 500 })
    }
  } catch (error: unknown) {
    transactionLogger.error("Admin approval POST error", error as Error, {})
    const appError = mapErrorToResponse(error)
    return createErrorResponse(appError)
  }
}
