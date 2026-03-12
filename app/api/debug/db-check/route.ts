import { NextResponse } from "next/server"

export async function GET() {
  const diagnostics: Record<string, any> = {
    env: {
      DATABASE_URL: process.env.DATABASE_URL ? "SET" : "NOT_SET",
      NODE_ENV: process.env.NODE_ENV,
    },
    timestamp: new Date().toISOString(),
  }

  try {
    // Try a simple database operation
    const { all } = await import("@/lib/db")
    const plans = await all("SELECT COUNT(*) as count FROM investment_plans")
    diagnostics.investmentPlans = plans
  } catch (err) {
    diagnostics.investmentPlansError = err instanceof Error ? err.message : String(err)
  }

  try {
    const { all } = await import("@/lib/db")
    const users = await all("SELECT COUNT(*) as count FROM users")
    diagnostics.users = users
  } catch (err) {
    diagnostics.usersError = err instanceof Error ? err.message : String(err)
  }

  return NextResponse.json(diagnostics, { status: 200 })
}
