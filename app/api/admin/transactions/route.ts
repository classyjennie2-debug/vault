import { NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { updateTransactionStatus, setUserBalance, getUserById, all, run } from "@/lib/db"
import type { Transaction } from "@/lib/types"

export async function GET() {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const transactions = await all("SELECT * FROM transactions ORDER BY date DESC")
    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Admin transactions API error:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    // Check if user is admin
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { transactionId, status } = await request.json()

    if (!transactionId || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    await updateTransactionStatus(transactionId, status)

    // Get transaction details for notifications
    const tx: Transaction[] = await all("SELECT * FROM transactions WHERE id = ?", [transactionId])
    const transaction = tx[0]

    // If approving a deposit, add to user balance
    if (status === "approved") {
      if (transaction && transaction.type === "deposit") {
        const userData = await getUserById(transaction.userId)
        if (userData) {
          await setUserBalance(transaction.userId, userData.balance + transaction.amount)
        }
      }
    }

    // Create notification for the user
    if (transaction) {
      const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const title = status === "approved" ? "Deposit Approved" : "Deposit Rejected"
      const message = status === "approved" 
        ? `Your deposit of $${transaction.amount.toLocaleString()} has been approved and added to your balance.`
        : `Your deposit of $${transaction.amount.toLocaleString()} has been rejected. Please contact support for more information.`
      const type = status === "approved" ? "success" : "error"

      await run(
        "INSERT INTO notifications (id, userId, title, message, type, timestamp, actionUrl) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [notificationId, transaction.userId, title, message, type, new Date().toISOString(), "/dashboard/transactions"]
      )
    }

    return NextResponse.json({ message: `Transaction ${status} successfully` })
  } catch (error) {
    console.error("Admin update transaction error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}