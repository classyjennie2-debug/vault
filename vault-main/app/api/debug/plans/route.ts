import { NextResponse } from "next/server"
import { getInvestmentPlansFromDb } from "@/lib/db"

export async function GET() {
  try {
    const plans = await getInvestmentPlansFromDb()
    
    // Return detailed plan data for debugging
    return NextResponse.json({
      count: plans.length,
      plans: plans.map((p) => ({
        id: p.id,
        name: p.name,
        minAmount: p.minAmount,
        maxAmount: p.maxAmount,
        returnRate: p.returnRate,
        duration: p.duration,
        durationUnit: p.durationUnit,
        risk: p.risk,
        description: p.description?.substring(0, 50) + "...",
      })),
    })
  } catch (error) {
    console.error("Debug plans error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch plans" },
      { status: 500 }
    )
  }
}
