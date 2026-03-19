import { NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { getUserById, createTransaction, get, run, createNotification, logActivity, pgPool, all } from "@/lib/db"
import { apiLogger } from "@/lib/logging"
import { convertUSDToCoin } from "@/lib/crypto-prices"
import type { CoinType } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user
    const { amount, method, bankAccount, cryptoAddress, coin } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const userData = await getUserById(user.id)
    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (method === "bank" && !bankAccount) {
      return NextResponse.json({ error: "Bank account required" }, { status: 400 })
    }

    if (method === "crypto" && !cryptoAddress) {
      return NextResponse.json({ error: "Crypto address required" }, { status: 400 })
    }

    // Calculate 5% withdrawal fee
    const withdrawalFee = Math.round(amount * 0.05 * 100) / 100 // 5% fee
    const amountAfterFee = Math.round((amount - withdrawalFee) * 100) / 100

    // Convert to crypto amount if withdrawal method is crypto
    let coinAmount = amountAfterFee
    if (method === "crypto" && coin) {
      try {
        coinAmount = await convertUSDToCoin(amountAfterFee, coin as CoinType)
        coinAmount = Math.round(coinAmount * 100000000) / 100000000 // Round to 8 decimals
      } catch (err) {
        console.error("Error converting USD to crypto:", err)
        return NextResponse.json({ error: "Failed to convert to cryptocurrency. Please try again." }, { status: 400 })
      }
    }

    // Use atomic balance update to prevent race condition
    // Deduct the full amount (including fee) from user balance
    const updateResult = await run(
      `UPDATE users SET balance = balance - $1 WHERE id = $2 AND balance >= $3`,
      [amount, user.id, amount]
    )

    // Check if the update was successful (run() returns rowCount affected)
    if (updateResult === 0) {
      return NextResponse.json({ error: "Insufficient available balance" }, { status: 400 })
    }

    // Get updated balance for the notification
    const updatedUserData = await getUserById(user.id)
    const updatedBalance = updatedUserData?.balance ?? 0

    try {
      // Create withdrawal transaction with detailed information
      const transactionDescription = method === "crypto" 
        ? `Withdrawal: $${amount} USD → ${coinAmount.toFixed(8)} ${coin} (Fee: $${withdrawalFee.toFixed(2)})`
        : `Bank Withdrawal: $${amount} (Fee: $${withdrawalFee.toFixed(2)})`

      const transaction = await createTransaction({
        userId: user.id,
        type: "withdrawal",
        amount, // Total amount including fee
        status: "pending", // Status only shows after withdrawal is initiated (now)
        method,
        bankAccount: method === "bank" ? bankAccount : undefined,
        cryptoAddress: method === "crypto" ? cryptoAddress : undefined,
        coin: method === "crypto" ? coin : undefined,
        coinAmount: method === "crypto" ? coinAmount : undefined,
        withdrawalFee,
        amountAfterFee,
      })

      // Log activity for this withdrawal
      try {
        const methodLabel = method === "bank" ? "Bank Transfer" : `${coin} Wallet`
        await logActivity(
          user.id,
          "withdrawal_submitted",
          `Withdrawal request: $${amount.toLocaleString()} via ${methodLabel} - Fee: $${withdrawalFee.toFixed(2)}`
        )
      } catch (err) {
        console.error("Failed to log withdrawal activity:", err)
        // Continue even if activity logging fails
      }

      // Create notification for pending withdrawal
      const notificationMessage = method === "crypto"
        ? `Your withdrawal request of $${amount.toLocaleString()} USD (${coinAmount.toFixed(8)} ${coin}) is pending admin approval. Withdrawal fee: $${withdrawalFee.toFixed(2)}`
        : `Your withdrawal request of $${amount.toLocaleString()} is pending admin approval. Withdrawal fee: $${withdrawalFee.toFixed(2)}`

      await createNotification({
        userId: user.id,
        title: "Withdrawal Submitted",
        message: notificationMessage,
        type: "warning",
        actionUrl: "/dashboard/transactions"
      })

      // Send admin email notification about withdrawal
      try {
        const { sendAdminNotification } = await import("@/lib/auth")
        const withdrawalEmailHtml = `
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <h2 style="color: #2563eb;">New Withdrawal Request</h2>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>User:</strong> ${userData.name || userData.email}</p>
              <p><strong>Amount:</strong> $${amount.toLocaleString()}</p>
              <p><strong>Withdrawal Fee:</strong> $${withdrawalFee.toFixed(2)}</p>
              <p><strong>Net Amount:</strong> $${amountAfterFee.toFixed(2)}</p>
              ${method === 'crypto' ? `<p><strong>Crypto:</strong> ${coinAmount.toFixed(8)} ${coin}</p>
              <p><strong>Address:</strong> ${cryptoAddress}</p>` : `<p><strong>Bank Account:</strong> ${bankAccount}</p>`}
              <p><strong>Status:</strong> Pending Approval</p>
              <hr />
              <p style="font-size: 12px; color: #666;">This is an automated notification from Vault Investment Platform</p>
            </body>
          </html>
        `
        await sendAdminNotification(`Withdrawal Request - ${userData.name || userData.email}`, withdrawalEmailHtml, "transaction")
      } catch (emailErr) {
        console.error("Failed to send withdrawal notification email:", emailErr)
      }

      return NextResponse.json({
        message: "Withdrawal request submitted",
        transaction: {
          ...transaction,
          coin: method === "crypto" ? coin : undefined,
          coinAmount: method === "crypto" ? coinAmount : undefined,
          withdrawalFee,
          amountAfterFee,
        }
      })
    } catch (txError) {
      throw txError
    }
  } catch (error) {
    apiLogger.error("Withdraw error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}