import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { updateTransactionStatus } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    // Check if user is admin
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { transactionId, status } = await request.json()

    if (!transactionId || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    updateTransactionStatus(transactionId, status)

    return NextResponse.json({ message: `Transaction ${status} successfully` })
  } catch (error) {
    console.error("Admin update transaction error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}