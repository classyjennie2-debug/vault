import { NextResponse } from "next/server"
import { all } from "@/lib/db"

export async function GET() {
  try {
    // Return all active wallets - they are no longer assigned to individual users
    // Multiple users can deposit to the same wallet addresses
    const wallets = await all("SELECT * FROM wallet_addresses WHERE status = $1 ORDER BY createdAt DESC", ["active"])
    return NextResponse.json(wallets)
  } catch (error) {
    console.error("Error fetching wallet addresses:", error)
    return NextResponse.json({ error: "Failed to fetch wallets" }, { status: 500 })
  }
}