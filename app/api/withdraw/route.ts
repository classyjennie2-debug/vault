import { NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { getUserById, createTransaction } from "@/lib/db"

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

    if (amount > userData.balance) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
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

    return NextResponse.json({
      message: "Withdrawal request submitted",
      transaction
    })
  } catch (error) {
    console.error("Withdraw error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}