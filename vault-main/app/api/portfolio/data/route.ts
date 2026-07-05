import { NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { getUserStats, getUserActiveInvestmentsWithProfit, all, pgPool } from "@/lib/db"

/**
 * GET /api/portfolio/data
 * Fetch complete portfolio data for authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    const stats = await getUserStats(user.id)
    const activeInvestments = await getUserActiveInvestmentsWithProfit(user.id)

    const usePostgres = pgPool !== null

    // Get all completed investments for historical data
    const historicalInvestments = await all<{
      id: string
      userId: string
      planId: string
      planName: string
      amount: number
      expectedProfit: number
      returnRate: number
      startDate: string
      endDate: string
      selectedPlan: string
      status: string
      createdAt: string
    }>(
      usePostgres
        ? `SELECT i.id, i.user_id as "userId", i.plan_id as "planId", p.name as "planName", 
                   i.amount, i.projected_return as "expectedProfit", p.return_rate as "returnRate",
                   i.start_date as "startDate", i.maturity_date as "endDate", p.plan_type as "selectedPlan",
                   i.status, i.created_at as "createdAt"
            FROM investments i
            JOIN investment_plans p ON i.plan_id = p.id
            WHERE i.user_id = $1
            ORDER BY i.created_at DESC`
        : `SELECT id, userId, planId, planName, amount, expectedProfit, returnRate, 
                   startDate, endDate, selectedPlan, status, createdAt
            FROM investments 
            WHERE userId = $1
            ORDER BY createdAt DESC`,
      [user.id]
    )

    // Calculate allocations based on active investments
    const allocations = activeInvestments.map((inv) => ({
      name: inv.planName || "Investment",
      value: inv.amount || 0,
      color: getColorForPlan(inv.planName),
    }))

    // Generate portfolio performance data (last 30 days)
    const portfolioData = generatePortfolioData(activeInvestments)

    // Calculate total fees
    const totalFees = activeInvestments.reduce((sum, inv) => {
      // Estimate fees based on management fee if available
      return sum
    }, 0)

    // Calculate total returns
    const totalReturns = activeInvestments.reduce((sum, inv) => {
      return sum + (inv.accumulatedProfit || 0)
    }, 0)

    return NextResponse.json({
      totalBalance: stats.availableBalance + stats.totalInvested + totalReturns,
      totalInvested: stats.totalInvested,
      totalReturns: totalReturns,
      totalProfit: stats.totalProfit,
      totalFees: totalFees,
      activeInvestmentCount: stats.activeInvestments,
      portfolioData,
      allocations,
      investments: activeInvestments,
      historicalInvestments,
    })
  } catch (error) {
    console.error("[Portfolio API] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch portfolio data" },
      { status: 500 }
    )
  }
}

/**
 * Generate portfolio performance data for the last 30 days
 */
function generatePortfolioData(
  investments: Array<{
    amount?: number
    accumulatedProfit?: number
    startDate?: string
    endDate?: string
  }>
) {
  const dataPoints = 30
  const now = new Date().getTime()
  const dayMs = 24 * 60 * 60 * 1000

  const data = Array.from({ length: dataPoints }, (_, i) => {
    const dataIndex = dataPoints - 1 - i
    const daysAgo = dataPoints - 1 - dataIndex
    const pointDate = new Date(now - daysAgo * dayMs)
    const formattedDate = pointDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })

    let totalBalance = 0
    let totalReturns = 0

    investments.forEach((inv) => {
      if (!inv.startDate || !inv.endDate) return

      const startDate = new Date(inv.startDate).getTime()
      const endDate = new Date(inv.endDate).getTime()
      const pointTime = pointDate.getTime()

      if (startDate <= pointTime) {
        const totalDuration = endDate - startDate
        const elapsedAtPoint = Math.min(pointTime - startDate, totalDuration)
        const progressAtPoint = totalDuration > 0 ? (elapsedAtPoint / totalDuration) * 100 : 0

        // Simplified profit calculation based on time progress
        const amount = inv.amount || 0
        const accumulatedProfit = inv.accumulatedProfit || 0
        
        // Scale accumulated profit based on progress
        const projectedAtPoint = (accumulatedProfit * progressAtPoint) / 100

        totalBalance += amount + projectedAtPoint
        totalReturns += projectedAtPoint
      }
    })

    return {
      date: formattedDate,
      balance: Math.round(totalBalance * 100) / 100,
      returns: Math.round(totalReturns * 100) / 100,
    }
  })

  return data
}

/**
 * Get color for plan type
 */
function getColorForPlan(planName: string): string {
  const colorMap: Record<string, string> = {
    conservative: "#3b82f6",
    growth: "#10b981",
    "high yield": "#f59e0b",
    aggressive: "#ef4444",
  }

  const lowerName = planName?.toLowerCase() || ""
  for (const [key, color] of Object.entries(colorMap)) {
    if (lowerName.includes(key)) {
      return color
    }
  }

  // Default colors if name doesn't match
  const defaultColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]
  return defaultColors[Math.floor(Math.random() * defaultColors.length)]
}
