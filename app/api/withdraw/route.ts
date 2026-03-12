import { NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { getUserById, createTransaction, get, run, createNotification } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user
    const { amount, method, bankAccount, cryptoAddress } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const userData = await getUserById(user.id)
    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Calculate available balance (total balance - invested amount + profits)
    let availableBalance = userData.balance
    try {
      const investedResult = await get(
        "SELECT SUM(amount) as sum FROM transactions WHERE userId = ? AND type = 'investment' AND status = 'approved'",
        [user.id]
      )
      const profitResult = await get(
        "SELECT SUM(amount) as sum FROM transactions WHERE userId = ? AND type = 'return' AND status = 'approved'",
        [user.id]
      )
      const totalInvested = typeof investedResult?.sum === 'number' ? investedResult.sum : 0
      const totalProfit = typeof profitResult?.sum === 'number' ? profitResult.sum : 0
      availableBalance = userData.balance - totalInvested + totalProfit
    } catch (e) {
      availableBalance = userData.balance
    }

    if (amount > availableBalance) {
      return NextResponse.json({ error: "Insufficient available balance" }, { status: 400 })
    }

    if (method === "bank" && !bankAccount) {
      return NextResponse.json({ error: "Bank account required" }, { status: 400 })
    }

    if (method === "crypto" && !cryptoAddress) {
      return NextResponse.json({ error: "Crypto address required" }, { status: 400 })
    }

    // Create withdrawal transaction
    const transaction = await createTransaction({
      userId: user.id,
      type: "withdrawal",
      amount,
      status: "pending",
      method,
      bankAccount: method === "bank" ? bankAccount : undefined,
      cryptoAddress: method === "crypto" ? cryptoAddress : undefined,
    })

    // Deduct from user balance (will be returned if withdrawal is rejected)
    await run(`UPDATE users SET balance = balance - ? WHERE id = ?`, [amount, user.id])

    // Create notification for pending withdrawal
    await createNotification({
      userId: user.id,
      title: "Withdrawal Submitted",
      message: `Your withdrawal request of $${amount.toLocaleString()} is pending admin approval. You'll be notified once processed.`,
      type: "warning",
      actionUrl: "/dashboard/transactions"
    })

    return NextResponse.json({
      message: "Withdrawal request submitted",
      transaction
    })
  } catch (error) {
    console.error("Withdraw error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}