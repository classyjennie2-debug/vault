import { NextResponse } from "next/server"
import { getInvestmentPlansFromDb } from "@/lib/db"
import { calculateReturnRate } from "@/lib/investment-utils"
import { investmentLogger } from "@/lib/logging"

export async function GET() {
  try {
    investmentLogger.debug("[API] /investment-plans: Fetching plans from database...")
    const plans = await getInvestmentPlansFromDb()

    investmentLogger.info(`/investment-plans retrieved`, { count: plans.length })
    
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
        investmentLogger.debug(`Plan rate preview`, { planId: plan.id, planType: validated.planType, rate7d, rate365d })
      }
      
      return validated
    })
    
    investmentLogger.info("/investment-plans: Returning validated plans", { count: validatedPlans.length })
    return NextResponse.json(validatedPlans)
  } catch (error) {
    investmentLogger.error("Error fetching investment plans", error)
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 })
  }
}