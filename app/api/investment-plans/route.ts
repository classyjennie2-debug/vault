import { NextResponse } from "next/server"
import { getInvestmentPlansFromDb } from "@/lib/db"

export async function GET() {
  try {
    const plans = await getInvestmentPlansFromDb()
    
    // Ensure all plans have proper values
    const validatedPlans = plans.map((plan) => ({
      ...plan,
      // Extra validation to ensure numbers are always present
      minAmount: Number.isFinite(plan.minAmount) ? plan.minAmount : 1000,
      maxAmount: Number.isFinite(plan.maxAmount) ? plan.maxAmount : 500000,
      returnRate: Number.isFinite(plan.returnRate) ? plan.returnRate : 8,
      duration: Number.isFinite(plan.duration) ? plan.duration : 6,
    }))
    
    return NextResponse.json(validatedPlans)
  } catch (error) {
    console.error("Error fetching investment plans:", error)
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 })
  }
}