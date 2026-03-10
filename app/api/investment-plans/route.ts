import { NextResponse } from "next/server"
import { getInvestmentPlansFromDb } from "@/lib/db"

export async function GET() {
  try {
    const plans = await getInvestmentPlansFromDb()
    return NextResponse.json(plans)
  } catch (error) {
    console.error("Error fetching investment plans:", error)
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 })
  }
}