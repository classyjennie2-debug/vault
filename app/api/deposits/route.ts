import { NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { sendAdminNotification } from "@/lib/auth"
import { createTransaction, run } from "@/lib/db"
import { getUserById } from "@/lib/db"
import { apiLogger } from "@/lib/logging"

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user
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

    // Send admin notification about new deposit
    const userData = await getUserById(user.id)
    const adminEmailHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2563eb;">New Deposit Received</h2>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>User Name:</strong> ${userData?.name}</p>
          <p><strong>User Email:</strong> ${userData?.email}</p>
          <p><strong>Amount:</strong> $${amount.toLocaleString()}</p>
          <p><strong>Cryptocurrency:</strong> ${coin}</p>
          <p><strong>Network:</strong> ${network}</p>
          ${coinAmount ? `<p><strong>Coin Amount:</strong> ${coinAmount} ${coin}</p>` : ""}
          <p><strong>Status:</strong> Pending Approval</p>
          <hr />
          <p style="font-size: 12px; color: #666;">This is an automated notification from Vault Investment Platform</p>
        </body>
      </html>
    `
    await sendAdminNotification(`New Deposit - ${coin} ${amount} from ${userData?.name}`, adminEmailHtml, "transaction")

    return NextResponse.json({ success: true })
  } catch (error) {
    apiLogger.error("Deposit API error", error)
    return NextResponse.json({ error: "Failed to process deposit" }, { status: 500 })
  }
}