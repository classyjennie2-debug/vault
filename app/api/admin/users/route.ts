import { NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { setUserBalance, getUserById, all, deleteUser, run } from "@/lib/db"

export async function GET() {
  try {
    console.log("=== Admin users GET request started ===")
    
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    // Check if user is admin
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    console.log("Admin check passed, fetching users...")
    
    // First try to fetch basic users without enrichment
    let users: any[] = []
    try {
      users = await all("SELECT id, name, email, balance, role, joinedAt, avatar, verified FROM users")
      console.log(`Fetched ${users.length} users`)
    } catch (err) {
      console.error("Error fetching base users:", err)
      throw new Error(`Failed to fetch users: ${String(err)}`)
    }
    
    // Try to add enrichment data
    const enrichedUsers = await Promise.all(
      users.map(async (u: any) => {
        try {
          // Get total invested
          let totalInvested = 0
          try {
            const investmentResult = await all(
              "SELECT SUM(amount) as totalInvested FROM active_investments WHERE userId = ?",
              [u.id]
            )
            totalInvested = investmentResult?.[0]?.totalInvested || 0
            console.log(`User ${u.id}: totalInvested = ${totalInvested}`)
          } catch (err) {
            console.warn(`Failed to get investments for user ${u.id}:`, err)
            totalInvested = 0
          }

          // Get active investment count
          let activeInvestmentsCount = 0
          try {
            const activeInvestmentsResult = await all(
              "SELECT COUNT(*) as count FROM active_investments WHERE userId = ? AND status = 'active'",
              [u.id]
            )
            activeInvestmentsCount = activeInvestmentsResult?.[0]?.count || 0
          } catch (err) {
            console.warn(`Failed to get active investment count for user ${u.id}:`, err)
            activeInvestmentsCount = 0
          }

          // Get total deposits approved
          let totalDeposits = 0
          try {
            const depositsResult = await all(
              "SELECT SUM(amount) as totalDeposits FROM transactions WHERE userId = ? AND type = 'deposit' AND status = 'approved'",
              [u.id]
            )
            totalDeposits = depositsResult?.[0]?.totalDeposits || 0
          } catch (err) {
            console.warn(`Failed to get deposits for user ${u.id}:`, err)
            totalDeposits = 0
          }

          // Get accumulated profit (calculated from expectedProfit * progressPercentage)
          let totalProfit = 0
          try {
            const profitResult = await all(
              "SELECT SUM((expectedProfit * progressPercentage) / 100) as totalProfit FROM active_investments WHERE userId = ?",
              [u.id]
            )
            totalProfit = profitResult?.[0]?.totalProfit || 0
            console.log(`User ${u.id}: totalProfit = ${totalProfit}`)
          } catch (err) {
            console.warn(`Failed to get profit for user ${u.id}:`, err)
            totalProfit = 0
          }

          // Get lastLogin
          let lastLogin = null
          try {
            const loginResult = await all(
              "SELECT lastLogin FROM users WHERE id = ?",
              [u.id]
            )
            lastLogin = loginResult?.[0]?.lastLogin || null
          } catch (err) {
            console.warn(`Failed to get lastLogin for user ${u.id}:`, err)
          }

          // Total balance = cash balance + invested + profit
          const totalBalance = Number(u.balance || 0) + Number(totalInvested || 0) + Number(totalProfit || 0)

          return {
            ...u,
            verified: Boolean(u.verified),
            lastLogin,
            totalInvested: Number(totalInvested) || 0,
            activeInvestmentsCount: Number(activeInvestmentsCount) || 0,
            totalDeposits: Number(totalDeposits) || 0,
            totalProfit: Number(totalProfit) || 0,
            totalBalance: totalBalance,
          }
        } catch (innerErr) {
          console.error(`Error enriching user ${u.id}:`, innerErr)
          // Return basic user data if enrichment fails
          return {
            ...u,
            verified: Boolean(u.verified),
            lastLogin: null,
            totalInvested: 0,
            activeInvestmentsCount: 0,
            totalDeposits: 0,
            totalProfit: 0,
            totalBalance: Number(u.balance || 0),
          }
        }
      })
    )

    console.log("=== Admin users GET completed successfully ===")
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