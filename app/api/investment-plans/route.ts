import { NextResponse } from "next/server"
import { getInvestmentPlansFromDb } from "@/lib/db"
import { calculateReturnRate } from "@/lib/investment-utils"

export async function GET() {
  try {
    console.log("[API] /investment-plans: Fetching plans from database...")
    const plans = await getInvestmentPlansFromDb()
    
    console.log(`[API] /investment-plans: Retrieved ${plans.length} plans`)
    
    // Ensure all plans have proper values and planType is set
    const validatedPlans = plans.map((plan, idx) => {
      const validated = {
        ...plan,
        // Extra validation to ensure numbers are always present
        minAmount: Number.isFinite(plan.minAmount) ? plan.minAmount : 1000,
        maxAmount: Number.isFinite(plan.maxAmount) ? plan.maxAmount : 500000,
        returnRate: Number.isFinite(plan.returnRate) ? plan.returnRate : 8,
        duration: Number.isFinite(plan.duration) ? plan.duration : 6,
        // CRITICAL: Ensure planType is present
        planType: plan.planType && plan.planType.trim() ? plan.planType.trim() : "Conservative Bond Fund",
      }
      
      // Log rate calculation for first few plans to verify
      if (idx < 4) {
        const rate7d = calculateReturnRate(7, validated.planType)
        const rate365d = calculateReturnRate(365, validated.planType)
        console.log(`[API] Plan ${plan.id} (${validated.planType}): 7d=${rate7d.toFixed(2)}%, 365d=${rate365d.toFixed(2)}%`)
      }
      
      return validated
    })
    
    console.log(`[API] /investment-plans: Returning ${validatedPlans.length} validated plans`)
    return NextResponse.json(validatedPlans)
  } catch (error) {
    console.error("Error fetching investment plans:", error)
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 })
  }
}