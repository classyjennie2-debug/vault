import { NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { sendAdminNotification } from "@/lib/auth"
import { createTransaction, run, logActivity, getUserById, get } from "@/lib/db"
import { apiLogger } from "@/lib/logging"

export async function POST(req: NextRequest) {
  try {
    console.log("[DEPOSIT] Step 1: Authenticating user...")
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user
    console.log("[DEPOSIT] Step 1 SUCCESS: User authenticated", { userId: user.id })

    console.log("[DEPOSIT] Step 2: Parsing request body...")
    const body = await req.json()
    const { coin, network, amount, coinAmount, walletId } = body as { 
      coin: string; 
      network: string; 
      amount: number; 
      coinAmount?: string;
      walletId: string 
    }
    console.log("[DEPOSIT] Step 2 SUCCESS: Body parsed", { coin, network, amount })

    if (!coin || !network || !amount) {
      console.log("[DEPOSIT] VALIDATION FAILED: Missing required fields", { coin, network, amount })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // NOTE: Wallet is NOT assigned to the user
    // Multiple users can deposit to the same wallet addresses
    // Just verify the wallet exists and is active
    console.log("[DEPOSIT] Step 3: Verifying wallet...")
    try {
      const walletData = await get(
        "SELECT * FROM wallet_addresses WHERE id = $1 AND status = $2",
        [walletId, "active"]
      )
      if (!walletData) {
        return NextResponse.json({ error: "Selected wallet is not available" }, { status: 400 })
      }
      console.log("[DEPOSIT] Step 3 SUCCESS: Wallet verified")
    } catch (err) {
      console.error("[DEPOSIT] Step 3 FAILED: Wallet verification error:", err)
      throw new Error(`Wallet verification failed: ${err instanceof Error ? err.message : String(err)}`)
    }

    // Create a pending deposit transaction
    console.log("[DEPOSIT] Step 4: Creating transaction record...")
    try {
      await createTransaction({
        userId: user.id,
        type: "deposit",
        amount,
        status: "pending",
        description: `${coin} deposit via ${network}${coinAmount ? ` (${coinAmount} ${coin})` : ''}`,
      })
      console.log("[DEPOSIT] Step 4 SUCCESS: Transaction created")
    } catch (err) {
      console.error("[DEPOSIT] Step 4 FAILED: Transaction creation error:", err)
      throw new Error(`Transaction creation failed: ${err instanceof Error ? err.message : String(err)}`)
    }

    // Log activity for this deposit
    console.log("[DEPOSIT] Step 5: Logging activity...")
    try {
      await logActivity(
        user.id,
        "deposit_submitted",
        `Deposit submitted: $${amount.toLocaleString()} via ${coin} (${network})`
      )
      console.log("[DEPOSIT] Step 5 SUCCESS: Activity logged")
    } catch (err) {
      console.error("[DEPOSIT] Step 5 WARNING: Activity logging failed (non-critical):", err)
      // Continue even if activity logging fails
    }

    // Create notification for pending deposit
    console.log("[DEPOSIT] Step 6: Creating user notification...")
    try {
      const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await run(
        "INSERT INTO notifications (id, user_id, title, message, type, read, created_at, action_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
        [
          notificationId,
          user.id,
          "Deposit Submitted",
          `Your ${coin} deposit of $${amount.toLocaleString()} is pending approval. We'll notify you once it's processed.`,
          "info",
          false,
          new Date().toISOString(),
          "/dashboard/transactions"
        ]
      )
      console.log("[DEPOSIT] Step 6 SUCCESS: User notification created")
    } catch (err) {
      console.error("[DEPOSIT] Step 6 FAILED: Notification creation error:", err)
      throw new Error(`Notification creation failed: ${err instanceof Error ? err.message : String(err)}`)
    }

    // Send admin notification about new deposit
    console.log("[DEPOSIT] Step 7: Getting user data for admin notification...")
    try {
      const userData = await getUserById(user.id)
      if (!userData) {
        throw new Error("User data not found for admin notification")
      }
      console.log("[DEPOSIT] Step 7 SUCCESS: User data retrieved")

      console.log("[DEPOSIT] Step 8: Sending admin notification...")
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
      console.log("[DEPOSIT] Step 8 SUCCESS: Admin notification sent")
    } catch (err) {
      console.error("[DEPOSIT] Step 7-8 FAILED: Admin notification error:", err)
      throw new Error(`Admin notification failed: ${err instanceof Error ? err.message : String(err)}`)
    }

    console.log("[DEPOSIT] ALL STEPS SUCCESS: Deposit completed successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[DEPOSIT] CRITICAL ERROR:", error)
    apiLogger.error("Deposit API error", error)
    return NextResponse.json({ error: `Failed to process deposit: ${error instanceof Error ? error.message : String(error)}` }, { status: 500 })
  }
}
