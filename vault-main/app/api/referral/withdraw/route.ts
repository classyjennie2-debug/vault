import { NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { transferReferralToMainBalance, canUserWithdrawReferral } from "@/lib/referral-utils"
import { logActivity } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    // Parse request body
    const body = await req.json()
    const { amount } = body as { amount: number }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // Check if user can withdraw
    const canWithdraw = await canUserWithdrawReferral(user.id)
    if (!canWithdraw.canWithdraw) {
      return NextResponse.json(
        { 
          error: canWithdraw.reason || "Cannot withdraw referral balance",
          referralsNeeded: canWithdraw.referralsNeeded
        },
        { status: 400 }
      )
    }

    // Transfer referral balance to main balance
    const result = await transferReferralToMainBalance(user.id, amount)

    // Log activity
    await logActivity(
      user.id,
      'referral_withdrawal',
      `Transferred $${amount} from referral balance to main balance`
    )

    return NextResponse.json({
      success: true,
      message: "Successfully transferred referral balance to main balance",
      data: result
    })
  } catch (error) {
    console.error('[REFERRAL] Withdraw error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process transfer' },
      { status: 500 }
    )
  }
}
