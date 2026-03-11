import { NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { getUserTransactions } from "@/lib/db"

export async function GET() {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user
    const transactions = await getUserTransactions(user.id)
    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}