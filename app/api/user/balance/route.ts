import { NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { getUserById, get } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    const userData = await getUserById(user.id)
    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Calculate available balance (total balance - invested amount + profits)
    const investedResult = await get(
      "SELECT SUM(amount) as sum FROM transactions WHERE userId = ? AND type = 'investment' AND status = 'approved'",
      [user.id]
    )
    const profitResult = await get(
      "SELECT SUM(amount) as sum FROM transactions WHERE userId = ? AND type = 'return' AND status = 'approved'",
      [user.id]
    )

    const totalInvested = Number(investedResult?.sum ?? 0)
    const totalProfit = Number(profitResult?.sum ?? 0)
    // FIX: User balance is already reduced by investments when they were made
    // Don't double-subtract! Available balance = current balance
    const availableBalance = Math.max(0, userData.balance)

    return NextResponse.json({
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        balance: userData.balance,
        joinedAt: userData.joinedAt,
        avatar: userData.avatar,
      },
      balance: userData.balance,
      totalInvested,
      totalProfit,
      availableBalance,
    })
  } catch (error) {
    console.error("Balance fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
