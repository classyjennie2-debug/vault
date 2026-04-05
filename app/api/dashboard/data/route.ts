import { NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { 
  getUserStats, 
  generatePortfolioData, 
  getUserActiveInvestmentsWithProfit,
  getUserTransactions,
  pgPool,
  get
} from "@/lib/db"
import { calculateMonthlyMetrics } from "@/lib/monthly-metrics"
import { calculateDailyBalanceChange } from "@/lib/daily-metrics"

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    // Fetch all dashboard data in parallel
    const [stats, monthlyMetrics, dailyMetrics, portfolioData, activeInvestments, transactions] = await Promise.all([
      getUserStats(user.id),
      calculateMonthlyMetrics(user.id),
      calculateDailyBalanceChange(user.id),
      generatePortfolioData(user.id),
      getUserActiveInvestmentsWithProfit(user.id),
      getUserTransactions(user.id),
    ])
    
    // Limit to last 5 transactions for dashboard
    const recentTransactions = transactions.slice(0, 5)

    // Calculate live profit from active investments (accumulated profit)
    let accumulatedProfit = 0
    if (activeInvestments && activeInvestments.length > 0) {
      accumulatedProfit = activeInvestments.reduce((sum, inv) => sum + (inv.accumulatedProfit || 0), 0)
    }

    // Total profit = approved returns + accumulated profit from active investments
    const totalProfitIncludingAccumulated = stats.totalProfit + accumulatedProfit

    // Total balance = available + invested + total profit (including accumulated)
    const totalBalance = stats.availableBalance + stats.totalInvested + totalProfitIncludingAccumulated

    // ROI = (total profit / total invested) * 100
    const totalReturnRate = stats.totalInvested > 0 
      ? ((totalProfitIncludingAccumulated / stats.totalInvested) * 100).toFixed(1)
      : "0"

    // Weekly change = (monthly returns / 4 weeks) / total invested * 100
    const weeklyChange = stats.totalInvested > 0 
      ? ((monthlyMetrics.monthlyReturns / 4) / stats.totalInvested * 100)
      : 0

    return NextResponse.json({
      timestamp: Date.now(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      stats: {
        totalInvested: stats.totalInvested,
        totalProfit: totalProfitIncludingAccumulated,
        availableBalance: stats.availableBalance,
        activeInvestments: stats.activeInvestments,
        pendingDeposits: stats.pendingDeposits,
        totalWithdrawn: stats.totalWithdrawn,
        pendingWithdrawals: stats.pendingWithdrawals || 0,
        totalBalance,
        totalReturnRate: parseFloat(totalReturnRate as string),
      },
      metrics: {
        dailyBalanceChange: dailyMetrics.dailyBalanceChange,
        monthlyReturns: monthlyMetrics.monthlyReturns,
        weeklyChange,
      },
      portfolio: portfolioData,
      activeInvestments: activeInvestments || [],
      recentTransactions: recentTransactions || [],
    })
  } catch (error) {
    console.error("[Dashboard Data] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    )
  }
}
