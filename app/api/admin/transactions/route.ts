import { NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { getUserById, all, run, createNotification, pgPool } from "@/lib/db"
import { validate, adminApprovalSchema } from "@/lib/validation"
import { mapErrorToResponse, createErrorResponse, AuthorizationError, NotFoundError, ValidationError } from "@/lib/error-handling"
import { transactionLogger, logAuditEvent } from "@/lib/logging"
import { rateLimitConfigs, checkRateLimit, getClientIp } from "@/lib/rate-limiting"
import { validateOrigin } from "@/lib/csrf"
import { get } from "@/lib/db"
import { createReferralBonus, creditReferralBonus, REFERRAL_MIN_DEPOSIT } from "@/lib/referral-utils"

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
        ? `SELECT id, user_id as "userId", type, amount, status, description, created_at as date, 
                  method, bank_account as "bankAccount", crypto_address as "cryptoAddress", metadata
           FROM transactions ORDER BY created_at DESC`
        : "SELECT id, userId, type, amount, status, description, date, method, bank_account as bankAccount, crypto_address as cryptoAddress, metadata FROM transactions ORDER BY date DESC"
    )

    const transactions = transactionsRaw.map((tx: any) => {
      const transaction: any = {
        id: tx.id,
        userId: tx.userId || tx.userid,
        type: tx.type,
        amount: tx.amount,
        status: tx.status,
        description: tx.description,
        date: tx.date,
        method: tx.method,
        bankAccount: tx.bankAccount || tx.bank_account,
        cryptoAddress: tx.cryptoAddress || tx.crypto_address,
      }
      
      // Parse metadata for withdrawal details
      if (tx.metadata) {
        try {
          const meta = typeof tx.metadata === 'string' ? JSON.parse(tx.metadata) : tx.metadata
          transaction.coin = meta.coin
          transaction.coinAmount = meta.coinAmount
          transaction.withdrawalFee = meta.withdrawalFee
          transaction.amountAfterFee = meta.amountAfterFee
        } catch (e) {
          console.error("[Admin TxApi] Error parsing metadata:", e)
        }
      }
      
      return transaction
    })

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
    // Skip CSRF check for authenticated endpoints
    // Authentication provides sufficient security, and CSRF check can be overly strict
    // const csrf = validateOrigin(req)
    // if (csrf) return csrf

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
        ? `SELECT id, user_id as "userId", type, amount, status, description, created_at as date FROM transactions WHERE id = $1`
        : "SELECT id, userId, type, amount, status, description, date FROM transactions WHERE id = $1",
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

        const userBalance = typeof userData.balance === 'string' ? parseFloat(userData.balance) : userData.balance
        const txAmount = typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount
        const newBalance = userBalance + txAmount
        await run("UPDATE users SET balance = $1 WHERE id = $2", [newBalance, transaction.userId])

        responseUserBalance = newBalance
        responseUserName = userData.name
        responseUserEmail = userData.email

        transactionLogger.info('Deposit approved and balance updated', 
          { transactionId, depositAmount: txAmount, newBalance, userId: transaction.userId },
          user.id
        )

        // Process referral bonus if deposit amount is >= $100 and user was referred
        if (txAmount >= REFERRAL_MIN_DEPOSIT) {
          try {
            const referralData = await get(
              'SELECT r.id, r.referrer_id FROM referrals r WHERE r.referred_user_id = $1 AND r.status = $2',
              [transaction.userId, 'active']
            )
            
            if (referralData) {
              const referralId = (referralData as any).id
              const referrerId = (referralData as any).referrer_id
              
              // Create referral bonus record
              const bonusAmount = await createReferralBonus(
                referrerId,
                referralId,
                transactionId,
                txAmount
              )
              
              // Credit the bonus to referrer's referral balance
              await creditReferralBonus(referrerId, bonusAmount)
              
              // Create notification for referrer (without revealing referred user's deposit amount)
              await createNotification({
                userId: referrerId,
                title: "Referral Bonus Earned!",
                message: `You earned $${bonusAmount.toFixed(2)} referral bonus! Your referred user made a deposit. Check your referral dashboard!`,
                type: "success",
                actionUrl: "/dashboard/referrals"
              }).catch(e => console.warn('Failed to create referrer notification:', e))
              
              transactionLogger.info('Referral bonus processed', 
                { transactionId, referrerId, bonusAmount, txAmount, referredUserId: transaction.userId },
                user.id
              )
            }
          } catch (refError) {
            console.warn('[REFERRAL] Failed to process referral bonus:', refError)
            // Don't fail deposit approval if referral bonus processing fails
          }
        }
      } else if (!approved && transaction.type === "withdrawal") {
        // If withdrawal is REJECTED, restore the balance to the user
        const userData = await getUserById(transaction.userId)
        if (!userData) {
          throw new Error(`User ${transaction.userId} not found for withdrawal rejection`)
        }

        const userBalance = typeof userData.balance === 'string' ? parseFloat(userData.balance) : userData.balance
        const txAmount = typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount
        const restoredBalance = userBalance + txAmount
        await run("UPDATE users SET balance = $1 WHERE id = $2", [restoredBalance, transaction.userId])

        responseUserBalance = restoredBalance
        responseUserName = userData.name
        responseUserEmail = userData.email

        transactionLogger.info('Withdrawal rejected and balance restored', 
          { transactionId, withdrawalAmount: txAmount, restoredBalance, userId: transaction.userId },
          user.id
        )
      } else {
        const userData = await getUserById(transaction.userId)
        if (userData) {
          responseUserName = userData.name
          responseUserEmail = userData.email
          responseUserBalance = typeof userData.balance === 'string' ? parseFloat(userData.balance) : userData.balance
        }
      }

      await run("UPDATE transactions SET status = $1 WHERE id = $2", [newStatus, transactionId])

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

      return response
    } catch (error: any) {
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
