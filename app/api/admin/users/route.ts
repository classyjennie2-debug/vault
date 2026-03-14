import { NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { setUserBalance, getUserById, all, deleteUser, run } from "@/lib/db"

export async function GET() {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    // Check if user is admin
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Fetch basic users
    const users = await all("SELECT id, name, email, balance, role, joinedAt, avatar, verified FROM users")
    
    // Enrich with investment and deposit data
    const enrichedUsers = users.map((u: any) => ({
      ...u,
      verified: Boolean(u.verified),
      totalBalance: Number(u.balance || 0),
      totalInvested: 0,
      activeInvestmentsCount: 0,
      totalDeposits: 0,
      totalProfit: 0,
    }))
    
    return NextResponse.json(enrichedUsers)
  } catch (error) {
    console.error("Admin get users error:", error)
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    // Check if user is admin
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { userId, balance, name, email, role } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const targetUser = await getUserById(userId)
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update provided fields
    let updateQuery = "UPDATE users SET "
    const updates: any[] = []
    const params: any[] = []

    if (balance !== undefined && balance >= 0) {
      updates.push("balance = ?")
      params.push(balance)
    }
    if (name) {
      updates.push("name = ?")
      params.push(name)
    }
    if (email) {
      updates.push("email = ?")
      params.push(email)
    }
    if (role && (role === "user" || role === "admin")) {
      updates.push("role = ?")
      params.push(role)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    updateQuery += updates.join(", ") + " WHERE id = ?"
    params.push(userId)

    await run(updateQuery, params)

    return NextResponse.json({ message: "User updated successfully" })
  } catch (error) {
    console.error("Admin update user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    // Check if user is admin
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    // Prevent admin from deleting themselves
    if (userId === user.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    const targetUser = await getUserById(userId)
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete user and all related data
    await deleteUser(userId)

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Admin delete user error:", error)
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}