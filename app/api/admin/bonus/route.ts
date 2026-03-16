import { NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { getUserById, setUserBalance, createTransaction, createNotification } from "@/lib/db"
import { validateOrigin } from "@/lib/csrf"

// Admin sends a bonus to a user
export async function POST(request: Request) {
  try {
    const csrf = validateOrigin(request as any)
    if (csrf) return csrf

    const authUser = await requireAuthAPI()
    if (authUser instanceof NextResponse) return authUser

    if (authUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

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
