import { NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { requireAuthAPI } from "@/lib/auth"
import {
  getInvestmentPlansFromDb,
  run,
  createTransaction,
  getUserById,
} from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user
    
    const body = await req.json()
    const { planId, amount } = body as { planId: string; amount: number }

    // Validate input
    if (!planId || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: "Investment amount must be positive" }, { status: 400 })
    }

    // Get current user to check balance
    const currentUser = await getUserById(user.id)
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check balance
    if ((currentUser.balance || 0) < amount) {
      return NextResponse.json(
        { error: `Insufficient balance. You have $${(currentUser.balance || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}, but investment requires $${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
        { status: 400 }
      )
    }

    // validate plan
    const plans = await getInvestmentPlansFromDb()
    const plan = plans.find((p) => p.id === planId)
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    if (amount < (plan.minAmount || 0) || amount > (plan.maxAmount || Infinity)) {
      return NextResponse.json(
        { error: `Amount must be between $${plan.minAmount} and $${plan.maxAmount}` },
        { status: 400 }
      )
    }

    // compute expected profit based on returnRate
    const expectedProfit = (amount * (plan.returnRate || 0)) / 100

    const startDate = new Date().toISOString()
    // compute end date by adding duration
    const end = new Date()
    if (plan.durationUnit === "months") {
      end.setMonth(end.getMonth() + (plan.duration || 0))
    } else if (plan.durationUnit === "years") {
      end.setFullYear(end.getFullYear() + (plan.duration || 0))
    }
    const endDate = end.toISOString()

    const investmentId = uuidv4()

    // insert active investment
    await run(
      `INSERT INTO active_investments (id, userId, planId, planName, amount, expectedProfit, startDate, endDate, status, progressPercentage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        investmentId,
        user.id,
        plan.id,
        plan.name,
        amount,
        expectedProfit,
        startDate,
        endDate,
        "active",
        0,
      ]
    )

    // deduct from user balance
    await run(`UPDATE users SET balance = balance - ? WHERE id = ?`, [amount, user.id])

    // create corresponding transaction record
    await createTransaction({
      userId: user.id,
      type: "investment",
      amount,
      status: "approved",
      description: `${plan.name} investment`,
    })

    return NextResponse.json({ success: true, investmentId })
  } catch (err: unknown) {
    console.error("investment API error", err)
    const message = err instanceof Error ? err.message : "Something went wrong"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
