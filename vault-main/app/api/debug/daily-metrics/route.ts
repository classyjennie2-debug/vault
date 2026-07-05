import { NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { calculateDailyBalanceChange } from "@/lib/daily-metrics"
import { getUserTransactions } from "@/lib/db"

export async function GET() {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    // Get all transactions for this user
    const allTransactions = await getUserTransactions(user.id)
    
    // Calculate daily metrics
    const dailyMetrics = await calculateDailyBalanceChange(user.id)

    // Show last 10 transactions
    const recent = allTransactions.slice(0, 10)

    return NextResponse.json({
      userId: user.id,
      totalTransactions: allTransactions.length,
      recentTransactions: recent,
      dailyMetrics,
      debug: {
        now: new Date(),
        oneDayAgo: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 })
  }
}
