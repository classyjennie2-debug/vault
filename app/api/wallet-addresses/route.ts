import { NextResponse } from "next/server"
import { all } from "@/lib/db"

export async function GET() {
  try {
    const wallets = await all("SELECT * FROM wallet_addresses WHERE assignedTo IS NULL")
    return NextResponse.json(wallets)
  } catch (error) {
    console.error("Error fetching wallet addresses:", error)
    return NextResponse.json({ error: "Failed to fetch wallets" }, { status: 500 })
  }
}