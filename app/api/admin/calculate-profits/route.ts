import { NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { all, run, getUserById } from "@/lib/db"
import type { ActiveInvestment } from "@/lib/types"

/**
 * Calculate and update user profits based on active investments
 * This endpoint recalculates accumulated profit for all users' investments
 * and updates the user's totalProfit field
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    // Check if user is admin
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get all active investments with calculations
    const investments = await all<ActiveInvestment>(
      `SELECT id, userId, planId, planName, amount, expectedProfit, startDate, endDate, status
       FROM active_investments 
       WHERE status = 'active'
       ORDER BY userId`
    )

    let profitsUpdated = 0
    const userProfits: Record<string, number> = {}

    // Calculate accumulated profit for each investment
    for (const inv of investments) {
      const now = new Date().getTime()
      const startTime = new Date(inv.startDate).getTime()
      const endTime = new Date(inv.endDate).getTime()

      const totalDuration = endTime - startTime
      const elapsed = now - startTime

      let progressPercentage = 0
      if (elapsed > 0 && totalDuration > 0) {
        progressPercentage = Math.min(100, (elapsed / totalDuration) * 100)
      }

      // FIX: Persist progress percentage to database
      // This allows historical tracking and avoids recalculating every time
      await run(
        `UPDATE active_investments SET progressPercentage = ? WHERE id = ?`,
        [Math.round(progressPercentage * 100) / 100, inv.id]
      )

      // Calculate accumulated profit based on progress
      const expectedProfit = Number(inv.expectedProfit) || 0
      const accumulatedProfit = Math.max(0, (expectedProfit * progressPercentage) / 100)

      // Round to 2 decimal places
      const roundedProfit = Math.round(accumulatedProfit * 100) / 100

      // Sum profits by user
      if (!userProfits[inv.userId]) {
        userProfits[inv.userId] = 0
      }
      userProfits[inv.userId] += roundedProfit
    }

    // Update each user's total profit in the database
    for (const [userId, totalProfit] of Object.entries(userProfits)) {
      try {
        // FIX: Delete old profit transactions to prevent duplication
        // Each call to this endpoint creates new transactions
        // We need to clear the old ones before creating new ones
        await run(
          `DELETE FROM transactions WHERE userId = ? AND type = 'return' AND description = 'Accumulated profit from active investments'`,
          [userId]
        )

        // Now insert the fresh calculated profit
        await run(
          `INSERT INTO transactions 
           (id, userId, type, amount, status, description, date) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            `profit-${userId}-${Date.now()}`,
            userId,
            "return",
            totalProfit,
            "approved",
            "Accumulated profit from active investments",
            new Date().toISOString().split("T")[0],
          ]
        )
        profitsUpdated++
        console.log(`Updated profit for user ${userId}: $${totalProfit.toFixed(2)}`)
      } catch (error) {
        console.error(`Error updating profit for user ${userId}:`, error)
      }
    }

    return NextResponse.json({
      message: "Profits calculated and updated successfully",
      usersUpdated: profitsUpdated,
      totalUsers: Object.keys(userProfits).length,
    })
  } catch (error) {
    console.error("Error calculating profits:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * GET endpoint to calculate profits for a specific user
 * Used for fetching live profit data for dashboard
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    // Get user's active investments
    const investments = await all<ActiveInvestment>(
      `SELECT id, userId, planId, planName, amount, expectedProfit, startDate, endDate, status
       FROM active_investments 
       WHERE userId = ? AND status = 'active'
       ORDER BY startDate DESC`,
      [user.id]
    )

    let totalAccumulatedProfit = 0

    // Calculate accumulated profit for each investment
    for (const inv of investments) {
      const now = new Date().getTime()
      const startTime = new Date(inv.startDate).getTime()
      const endTime = new Date(inv.endDate).getTime()

      const totalDuration = endTime - startTime
      const elapsed = now - startTime

      let progressPercentage = 0
      if (elapsed > 0 && totalDuration > 0) {
        progressPercentage = Math.min(100, (elapsed / totalDuration) * 100)
      }

      // Calculate accumulated profit based on progress
      const expectedProfit = Number(inv.expectedProfit) || 0
      const accumulatedProfit = Math.max(0, (expectedProfit * progressPercentage) / 100)

      // Round to 2 decimal places
      totalAccumulatedProfit += Math.round(accumulatedProfit * 100) / 100
    }

    return NextResponse.json({
      userId: user.id,
      liveProfit: totalAccumulatedProfit,
      activeInvestments: investments.length,
    })
  } catch (error) {
    console.error("Error fetching profit:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
