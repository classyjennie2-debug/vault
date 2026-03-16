import { NextResponse } from "next/server"
import { getInvestmentPlansFromDb } from "@/lib/db"
import { calculateReturnRate, getPlanDisplayRate } from "@/lib/investment-utils"

/**
 * DEBUG ENDPOINT: Shows what plans are being returned and their calculated rates
 * Visit: /api/debug/investment-plans
 */
export async function GET() {
  try {
    console.log("[DEBUG] === INVESTMENT PLANS DEBUG ===")
    
    const plans = await getInvestmentPlansFromDb()
    
    console.log(`[DEBUG] Total plans returned: ${plans.length}`)
    
    const debugPlans = plans.map((plan) => {
      const displayRate = getPlanDisplayRate(plan.planType || "Conservative Bond Fund")
      const annualRate = calculateReturnRate(365, plan.planType || "Conservative Bond Fund")
      
      return {
        id: plan.id,
        name: plan.name,
        planType: plan.planType,
        risk: plan.risk,
        minAmount: plan.minAmount,
        maxAmount: plan.maxAmount,
        calculatedRates: {
          "7day": displayRate,
          "30day": calculateReturnRate(30, plan.planType || "Conservative Bond Fund"),
          "365day": annualRate,
        },
        expectedRates: {
          "Conservative Bond Fund": {
            "7day": 21.7,
            "30day": calculateReturnRate(30, "Conservative Bond Fund"),
            "365day": calculateReturnRate(365, "Conservative Bond Fund"),
          },
          "Growth Portfolio": {
            "7day": 35,
            "30day": calculateReturnRate(30, "Growth Portfolio"),
            "365day": calculateReturnRate(365, "Growth Portfolio"),
          },
          "High Yield Equity Fund": {
            "7day": 50,
            "30day": calculateReturnRate(30, "High Yield Equity Fund"),
            "365day": calculateReturnRate(365, "High Yield Equity Fund"),
          },
          "Real Estate Trust": {
            "7day": 40,
            "30day": calculateReturnRate(30, "Real Estate Trust"),
            "365day": calculateReturnRate(365, "Real Estate Trust"),
          },
        }
      }
    })
    
    console.log("[DEBUG] Plans Debug Info:")
    debugPlans.forEach((p) => {
      console.log(`  ${p.id}: ${p.name} (${p.planType}) - 7day: ${p.calculatedRates["7day"].toFixed(2)}%`)
    })
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      plansCount: debugPlans.length,
      plans: debugPlans,
      summary: {
        allPlansHavePlantType: debugPlans.every(p => p.planType && p.planType.trim()),
        allPlansHaveDifferentRates: debugPlans.some(p => p.calculatedRates["7day"] !== debugPlans[0].calculatedRates["7day"]),
        expectedBehavior: "Each plan should have unique 7-day rates: CBF=21.7%, GP=35%, HY=50%, RE=40%"
      }
    })
  } catch (error) {
    console.error("[DEBUG] Error in debug endpoint:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
