import { NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { getReferralStats } from "@/lib/referral-utils"

export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    // Get referral stats
    const stats = await getReferralStats(user.id)
    
    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('[REFERRAL] Get stats error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get referral stats' },
      { status: 500 }
    )
  }
}
