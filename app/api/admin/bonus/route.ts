import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { getUserById, setUserBalance, createTransaction, createNotification } from "@/lib/db"

// Admin sends a bonus to a user
export async function POST(request: Request) {
  try {
    const { userId, amount, note } = await request.json()
    if (!userId || !amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid user or amount" }, { status: 400 })
    }
    const user = await getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    // Update user balance
    const newBalance = user.balance + amount
    await setUserBalance(userId, newBalance)
    // Log transaction
    await createTransaction({
      userId,
      type: "deposit",
      amount,
      status: "approved",
      description: note ? `Admin bonus: ${note}` : "Admin bonus credited"
    })
    // Notify user
    await createNotification({
      userId,
      title: "Bonus Credited!",
      message: `A bonus of $${amount} has been added to your account. ${note ? note : ''}`.trim(),
      type: "success"
    })
    return NextResponse.json({ success: true, newBalance })
  } catch (error) {
    console.error("Admin bonus error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
