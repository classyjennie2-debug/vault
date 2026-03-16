import { NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { run, all } from "@/lib/db"

/**
 * ADMIN ONLY: Manually fix all investment plans with correct planType values
 * This is a safety net to ensure database is synced with expected plan types
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    // Check if user is admin
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const planMappings = [
      { id: 'cbf', planType: 'Conservative Bond Fund' },
      { id: 'gp', planType: 'Growth Portfolio' },
      { id: 'hyef', planType: 'High Yield Equity Fund' },
      { id: 'ret', planType: 'Real Estate Trust' },
    ]

    console.log('[FIX_PLANS] Starting plan type fix...')
    const results = []

    // Update each plan using the run() function
    for (const mapping of planMappings) {
      try {
        // Use run() which works with both SQLite and PostgreSQL
        await run(
          'UPDATE investment_plans SET plantype = ? WHERE id = ?',
          [mapping.planType, mapping.id]
        )
        
        console.log(`[FIX_PLANS] Plan ${mapping.id} updated to "${mapping.planType}"`)
        
        results.push({
          id: mapping.id,
          planType: mapping.planType,
          updated: true
        })
      } catch (err) {
        console.error(`[FIX_PLANS] Error updating plan ${mapping.id}:`, err)
        results.push({
          id: mapping.id,
          planType: mapping.planType,
          updated: false,
          error: err instanceof Error ? err.message : String(err)
        })
      }
    }

    // Verify all plans were updated
    const verification = await all<any>(
      'SELECT id, name, plantype FROM investment_plans ORDER BY id'
    )

    console.log('[FIX_PLANS] Final verification:')
    const verificationData = verification.map(row => {
      const displayType = row.plantype || row.planType
      console.log(`  ${row.id}: ${row.name} → "${displayType}"`)
      return {
        id: row.id,
        name: row.name,
        plantype: displayType
      }
    })

    return NextResponse.json({
      success: true,
      message: "Plans updated successfully",
      updated: results,
      verification: verificationData,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[FIX_PLANS] Error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
