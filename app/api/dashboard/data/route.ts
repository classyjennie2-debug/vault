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

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    // Fetch all dashboard data in parallel
    const [stats, monthlyMetrics, portfolioData, activeInvestments, transactions] = await Promise.all([
      getUserStats(user.id),
      calculateMonthlyMetrics(user.id),
      generatePortfolioData(user.id),
      getUserActiveInvestmentsWithProfit(user.id),
      getUserTransactions(user.id),
    ])
    
    // Limit to last 5 transactions for dashboard
    const recentTransactions = transactions.slice(0, 5)

    // Calculate derived data
    const totalBalance = stats.availableBalance + stats.totalInvested + stats.totalProfit
    const totalReturnRate = stats.totalInvested > 0 
      ? ((stats.totalProfit / totalBalance) * 100).toFixed(1)
      : "0"

    // Live profit from active investments
    let liveProfit = 0
    if (activeInvestments && activeInvestments.length > 0) {
      liveProfit = activeInvestments.reduce((sum, inv) => sum + (inv.accumulatedProfit || 0), 0)
    }

    const displayProfit = liveProfit > 0 ? liveProfit : stats.totalProfit
    const weeklyChange = stats.totalInvested > 0 
      ? ((monthlyMetrics.monthlyReturns / Math.max(stats.totalInvested, 1)) * 100) / 4 
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
        totalProfit: stats.totalProfit,
        availableBalance: stats.availableBalance,
        activeInvestments: stats.activeInvestments,
        pendingDeposits: stats.pendingDeposits,
        totalWithdrawn: stats.totalWithdrawn,
        totalBalance,
        totalReturnRate: parseFloat(totalReturnRate as string),
      },
      metrics: {
        monthlyGain: monthlyMetrics.monthlyGain,
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
