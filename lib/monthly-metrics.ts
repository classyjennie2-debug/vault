import { all } from './db'

/**
 * Calculate metrics for the current month based on actual user transactions
 */
export async function calculateMonthlyMetrics(userId: string) {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const monthEnd = now.toISOString()

  // Get all transactions from this month
  const transactions = await all<{
    id: string
    type: string
    amount: number
    status: string
    date: string
  }>(
    `SELECT id, type, amount, status, date FROM transactions 
     WHERE userId = ? AND date >= ? AND date <= ?
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

  // Calculate monthly gain = deposits + returns - withdrawals
  const monthlyGain = monthlyDeposits + monthlyReturns - monthlyWithdrawals

  return {
    monthlyGain: Math.round(monthlyGain * 100) / 100,
    monthlyDeposits: Math.round(monthlyDeposits * 100) / 100,
    monthlyReturns: Math.round(monthlyReturns * 100) / 100,
    monthlyInvestments: Math.round(monthlyInvestments * 100) / 100,
    monthlyWithdrawals: Math.round(monthlyWithdrawals * 100) / 100,
    transactionCount: transactions.length,
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
