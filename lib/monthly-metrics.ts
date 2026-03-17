import { all, pgPool } from './db'

/**
 * Calculate metrics for the current month based on actual user transactions
 */
export async function calculateMonthlyMetrics(userId: string) {
  try {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const monthEnd = now.toISOString()

    const usePostgres = pgPool !== null

    // Get all transactions from this month
    const transactions = await all<{
      id: string
      type: string
      amount: number
      status: string
      date: string
    }>(
      usePostgres
        ? `SELECT id, type, amount, status, COALESCE(created_at, date) as date FROM transactions 
           WHERE user_id = $1 AND COALESCE(created_at, date) >= $2 AND COALESCE(created_at, date) <= $3
           ORDER BY COALESCE(created_at, date) ASC`
        : `SELECT id, type, amount, status, date FROM transactions 
           WHERE userId = $1 AND date >= $2 AND date <= $3
           ORDER BY date ASC`,
      [userId, monthStart, monthEnd]
    )

    let monthlyDeposits = 0
    let monthlyReturns = 0
    let monthlyInvestments = 0
    let monthlyWithdrawals = 0

    // Sum up transactions by type
    transactions.forEach((tx) => {
      if (tx.status === 'approved') {
        switch (tx.type) {
          case 'deposit':
            monthlyDeposits += tx.amount
            break
          case 'return':
            monthlyReturns += tx.amount
            break
          case 'investment':
            monthlyInvestments += tx.amount
            break
          case 'withdrawal':
            monthlyWithdrawals += tx.amount
            break
        }
      }
    })

    // FIX: Monthly gain should ONLY be investment returns, not cash flow
    // monthlyReturns = actual profit earned from investments
    // Deposits and withdrawals are cash movement, not profit
    const monthlyGain = monthlyReturns
    const monthlyNetCashFlow = monthlyDeposits - monthlyWithdrawals

    return {
      monthlyGain: Math.round(monthlyGain * 100) / 100,
      monthlyNetCashFlow: Math.round(monthlyNetCashFlow * 100) / 100,
      monthlyDeposits: Math.round(monthlyDeposits * 100) / 100,
      monthlyReturns: Math.round(monthlyReturns * 100) / 100,
      monthlyInvestments: Math.round(monthlyInvestments * 100) / 100,
      monthlyWithdrawals: Math.round(monthlyWithdrawals * 100) / 100,
      transactionCount: transactions.length,
    }
  } catch (error: unknown) {
    console.error('[calculateMonthlyMetrics] Error:', error)
    // Return default values so dashboard doesn't crash
    return {
      monthlyGain: 0,
      monthlyNetCashFlow: 0,
      monthlyDeposits: 0,
      monthlyReturns: 0,
      monthlyInvestments: 0,
      monthlyWithdrawals: 0,
      transactionCount: 0,
    }
  }
}

/**
 * Calculate overall return rate based on total profit vs total invested
 */
export function calculateReturnRate(totalProfit: number, totalInvested: number): number {
  if (totalInvested <= 0) return 0
  return Math.round((totalProfit / totalInvested) * 100 * 100) / 100  // Return as percentage with 2 decimals
}

/**
 * Format number as currency with trend indicator
 */
export function formatCurrencyTrend(amount: number): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  })

  const prefix = amount >= 0 ? '+' : ''
  return `${prefix}${formatter.format(amount)}`
}

/**
 * Format percentage with trend indicator
 */
export function formatPercentageTrend(percent: number): string {
  const prefix = percent >= 0 ? '+' : ''
  return `${prefix}${(Math.round(percent * 100) / 100).toFixed(2)}%`
}

/**
 * Get trend text for display
 */
export function getTrendText(
  label: string,
  value: number,
  isMonthly: boolean = true
): string {
  const timeframe = isMonthly ? 'this month' : 'total'

  if (label.includes('Return')) {
    return `${formatPercentageTrend(value)} return ${timeframe}`
  }

  if (value === 0) {
    return `No activity ${timeframe}`
  }

  return `${formatCurrencyTrend(value)} ${timeframe}`
}
