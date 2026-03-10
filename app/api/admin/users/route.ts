import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { setUserBalance, getUserById } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    // Check if user is admin
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { userId, balance } = await request.json()

    if (!userId || balance === undefined || balance < 0) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    const targetUser = await getUserById(userId)
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    await setUserBalance(userId, balance)

    return NextResponse.json({ message: "User balance updated successfully" })
  } catch (error) {
    console.error("Admin update user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}