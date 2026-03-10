import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { createTransaction, run } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { coin, network, amount, coinAmount, walletId } = body as { 
      coin: string; 
      network: string; 
      amount: number; 
      coinAmount?: string;
      walletId: string 
    }

    if (!coin || !network || !amount || !walletId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Assign the wallet to the user
    await run(
      "UPDATE wallet_addresses SET assignedTo = ?, assignedAt = ? WHERE id = ?",
      [user.id, new Date().toISOString(), walletId]
    )

    // Create a pending deposit transaction
    await createTransaction({
      userId: user.id,
      type: "deposit",
      amount,
      status: "pending",
      description: `${coin} deposit via ${network}${coinAmount ? ` (${coinAmount} ${coin})` : ''}`,
    })

    // Create notification for pending deposit
    const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    await run(
      "INSERT INTO notifications (id, userId, title, message, type, timestamp, actionUrl) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        notificationId,
        user.id,
        "Deposit Submitted",
        `Your ${coin} deposit of $${amount.toLocaleString()} is pending approval. We'll notify you once it's processed.`,
        "info",
        new Date().toISOString(),
        "/dashboard/transactions"
      ]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Deposit API error:", error)
    return NextResponse.json({ error: "Failed to process deposit" }, { status: 500 })
  }
}