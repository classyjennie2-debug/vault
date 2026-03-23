import { NextRequest, NextResponse } from "next/server"
import { getReferralCodeByCode, trackReferral, incrementReferralCodeClicks } from "@/lib/referral-utils"

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json()
    const { referralCode, referredUserId, referrerUserId } = body as {
      referralCode?: string
      referredUserId?: string
      referrerUserId?: string
    }

    if (!referralCode || !referredUserId) {
      return NextResponse.json(
        { error: "Missing referral code or referred user ID" },
        { status: 400 }
      )
    }

    // Get referral code details
    const codeData = await getReferralCodeByCode(referralCode)
    if (!codeData) {
      return NextResponse.json(
        { error: "Invalid referral code" },
        { status: 400 }
      )
    }

    const referrerId = codeData.user_id
    const codeId = codeData.id

    // Increment clicks
    await incrementReferralCodeClicks(codeId)

    // Track the referral
    await trackReferral(referrerId, referredUserId, codeId)

    return NextResponse.json({
      success: true,
      referrerId,
      message: "Referral tracked successfully"
    })
  } catch (error) {
    console.error('[REFERRAL] Track referral error:', error)
    // Don't fail signup if referral tracking fails
    return NextResponse.json(
      { success: true, message: "Referral processing failed but signup completed" },
      { status: 200 }
    )
  }
}
