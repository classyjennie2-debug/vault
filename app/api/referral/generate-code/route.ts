import { NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { getOrCreateReferralCode } from "@/lib/referral-utils"
import { logActivity } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    // Get base URL for referral link
    const origin = req.headers.get('origin') || 'https://vaultcapital.bond'
    
    // Get or create referral code
    const referralCode = await getOrCreateReferralCode(user.id, origin)
    
    // Log activity
    await logActivity(user.id, 'referral_code_generated', `Generated referral code: ${referralCode.code}`)
    
    return NextResponse.json({
      success: true,
      referralCode: referralCode.code,
      referralLink: referralCode.referralLink,
      clicksCount: referralCode.clicksCount || 0
    })
  } catch (error) {
    console.error('[REFERRAL] Generate code error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate referral code' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    // Get base URL for referral link
    const origin = req.headers.get('origin') || 'https://vaultcapital.bond'
    
    // Get or create referral code
    const referralCode = await getOrCreateReferralCode(user.id, origin)
    
    return NextResponse.json({
      success: true,
      referralCode: referralCode.code,
      referralLink: referralCode.referralLink,
      clicksCount: referralCode.clicksCount || 0
    })
  } catch (error) {
    console.error('[REFERRAL] Get code error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get referral code' },
      { status: 500 }
    )
  }
}
