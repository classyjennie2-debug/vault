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

    // Use atomic balance update to prevent race condition
    // This ensures no two concurrent withdrawals can both succeed if balance is insufficient
    const updateResult = await run(
      `UPDATE users SET balance = balance - ? WHERE id = ? AND balance >= ?`,
      [amount, user.id, amount]
    )

    // Check if the update was successful (rows affected > 0)
    const changesResult = await get(
      `SELECT changes() as changedRows`
    ) as any
    
    if (!changesResult || changesResult.changedRows === 0) {
      return NextResponse.json({ error: "Insufficient available balance" }, { status: 400 })
    }

    // Get updated balance for the notification
    const updatedUserData = await getUserById(user.id)
    const updatedBalance = updatedUserData?.balance ?? 0

    if (method === "bank" && !bankAccount) {
      return NextResponse.json({ error: "Bank account required" }, { status: 400 })
    }

    if (method === "crypto" && !cryptoAddress) {
      return NextResponse.json({ error: "Crypto address required" }, { status: 400 })
    }

    // Use transaction to ensure all operations succeed or all fail
    await run(`BEGIN`)
    
    try {
      // Use atomic balance update to prevent race condition
      // This ensures no two concurrent withdrawals can both succeed if balance is insufficient
      const updateResult = await run(
        `UPDATE users SET balance = balance - ? WHERE id = ? AND balance >= ?`,
        [amount, user.id, amount]
      )

      // Check if the update was successful (rows affected > 0)
      const changesResult = await get(
        `SELECT changes() as changedRows`
      ) as any
      
      if (!changesResult || changesResult.changedRows === 0) {
        await run(`ROLLBACK`)
        return NextResponse.json({ error: "Insufficient available balance" }, { status: 400 })
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

      // Create notification for pending withdrawal
      await createNotification({
        userId: user.id,
        title: "Withdrawal Submitted",
        message: `Your withdrawal request of $${amount.toLocaleString()} is pending admin approval. You'll be notified once processed.`,
        type: "warning",
        actionUrl: "/dashboard/transactions"
      })

      await run(`COMMIT`)

      return NextResponse.json({
        message: "Withdrawal request submitted",
        transaction
      })
    } catch (txError) {
      await run(`ROLLBACK`)
      throw txError
    }
  } catch (error) {
    console.error("Withdraw error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}