import { all, pgPool } from './db'

/**
 * Calculate daily balance change for the current day based on approved transactions
 * in the last 24 hours
 */
export async function calculateDailyBalanceChange(userId: string) {
  try {
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
    const today = now.toISOString()

    const usePostgres = pgPool !== null

    // Get all approved transactions from last 24 hours
    const transactions = await all<{
      id: string
      type: string
      amount: number
      status: string
      date: string
    }>(
      usePostgres
        ? `SELECT id, type, amount, status, created_at as date FROM transactions 
           WHERE user_id = $1 AND created_at >= $2 AND created_at <= $3 AND status = 'approved'
           ORDER BY created_at ASC`
        : `SELECT id, type, amount, status, date FROM transactions 
           WHERE userId = $1 AND date >= $2 AND date <= $3 AND status = 'approved'
           ORDER BY date ASC`,
      [userId, oneDayAgo, today]
    )

    let dailyDeposits = 0
    let dailyReturns = 0
    let dailyWithdrawals = 0
    let dailyInvestments = 0

    // Sum up transactions by type
    transactions.forEach((tx) => {
      switch (tx.type) {
        case 'deposit':
          dailyDeposits += tx.amount
          break
        case 'return':
          dailyReturns += tx.amount
          break
        case 'withdrawal':
          dailyWithdrawals += tx.amount
          break
        case 'investment':
          dailyInvestments += tx.amount
          break
      }
    })

    // Daily balance change = returns + deposits - withdrawals - investments
    // Returns add to balance (profits)
    // Deposits add to balance (money in)
    // Withdrawals reduce balance (money out)
    // Investments reduce available balance but go to invested
    const dailyBalanceChange = dailyReturns + dailyDeposits - dailyWithdrawals - dailyInvestments

    return {
      dailyBalanceChange: Math.round(dailyBalanceChange * 100) / 100,
      dailyDeposits: Math.round(dailyDeposits * 100) / 100,
      dailyReturns: Math.round(dailyReturns * 100) / 100,
      dailyWithdrawals: Math.round(dailyWithdrawals * 100) / 100,
      dailyInvestments: Math.round(dailyInvestments * 100) / 100,
    }
  } catch (error) {
    console.error("[Daily Metrics] Error:", error)
    return {
      dailyBalanceChange: 0,
      dailyDeposits: 0,
      dailyReturns: 0,
      dailyWithdrawals: 0,
      dailyInvestments: 0,
    }
  }
}
