import { NextResponse } from "next/server"
import { all } from "@/lib/db"

export async function GET() {
  try {
    const transactions = await all("SELECT * FROM transactions")
    const users = await all("SELECT id, name, email, role, balance FROM users")
    
    return NextResponse.json({
      transactionCount: transactions.length,
      transactions: transactions.slice(0, 10), // Just first 10 for display
      userCount: users.length,
      users: users.slice(0, 10),
      message: "Debug endpoint - check browser console for full data",
      allTransactions: transactions, // Full list in response body
      allUsers: users,
    })
  } catch (error) {
    console.error("Debug endpoint error:", error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
      errorFull: error,
    }, { status: 500 })
  }
}
