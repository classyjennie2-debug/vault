import { NextResponse } from "next/server"
import { run, all } from "@/lib/db"

/**
 * TEMP DEBUG FIX: Public endpoint to set expected plantype values for known plan ids.
 * This is an emergency helper to run on production only. Remove after use.
 */
export async function POST() {
  try {
    const planMappings = [
      { id: 'p1', planType: 'Conservative Bond Fund' },
      { id: 'p2', planType: 'Growth Portfolio' },
      { id: 'p3', planType: 'High Yield Equity Fund' },
      { id: 'p4', planType: 'Real Estate Trust' },
    ]

    const results: any[] = []

    for (const m of planMappings) {
      try {
        await run('UPDATE investment_plans SET plantype = ? WHERE id = ?', [m.planType, m.id])
        results.push({ id: m.id, planType: m.planType, updated: true })
      } catch (err) {
        results.push({ id: m.id, planType: m.planType, updated: false, error: String(err) })
      }
    }

    const verification = await all<any>('SELECT id, name, plantype FROM investment_plans ORDER BY id')

    return NextResponse.json({ success: true, updated: results, verification, timestamp: new Date().toISOString() })
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
