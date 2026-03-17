import { NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { all, getAllUsers, getUserById, deleteUser, run, isPostgres, pgPool } from "@/lib/db"
import { apiLogger } from "@/lib/logging"

export async function GET() {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    // Check if user is admin
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const usePostgres = pgPool !== null

    // Fetch full user records for admin (exclude password hash)
    const users = await getAllUsers()

    // Enrich with investment and deposit data
    const enrichedUsers = users.map((u: any) => {
      return {
        ...u,
        verified: Boolean(u.verified),
        totalBalance: Number(u.balance || 0),
        totalInvested: 0,
        activeInvestmentsCount: 0,
        totalDeposits: 0,
        totalProfit: 0,
      }
    })
    
    // Try to add investment data for each user
    for (const enrichedUser of enrichedUsers) {
      try {
        // Get total invested
        const investmentResult = await all(
          usePostgres
            ? "SELECT SUM(amount) as totalInvested FROM investments WHERE user_id = $1 AND status = 'active'"
            : "SELECT SUM(amount) as totalInvested FROM active_investments WHERE userId = $1",
          [enrichedUser.id]
        )
        if (investmentResult && investmentResult.length > 0) {
          enrichedUser.totalInvested = Number(investmentResult[0]?.totalInvested) || 0
        }

        // Get active investment count
        const countResult = await all(
          usePostgres
            ? "SELECT COUNT(*) as count FROM investments WHERE user_id = $1 AND status = 'active'"
            : "SELECT COUNT(*) as count FROM active_investments WHERE userId = $1 AND status = 'active'",
          [enrichedUser.id]
        )
        if (countResult && countResult.length > 0) {
          enrichedUser.activeInvestmentsCount = Number(countResult[0]?.count) || 0
        }

        // Get total deposits
        const depositsResult = await all(
          usePostgres
            ? "SELECT SUM(amount) as totalDeposits FROM transactions WHERE user_id = $1 AND type = 'deposit' AND status = 'approved'"
            : "SELECT SUM(amount) as totalDeposits FROM transactions WHERE userId = $1 AND type = 'deposit' AND status = 'approved'",
          [enrichedUser.id]
        )
        if (depositsResult && depositsResult.length > 0) {
          enrichedUser.totalDeposits = Number(depositsResult[0]?.totalDeposits) || 0
        }

        // Get accumulated profit
        const profitResult = await all(
          usePostgres
            ? "SELECT SUM(CAST(projected_return AS DECIMAL)) as totalProfit FROM investments WHERE user_id = $1 AND status = 'active'"
            : "SELECT SUM(CAST(expectedProfit AS REAL) * CAST(progressPercentage AS REAL) / 100) as totalProfit FROM active_investments WHERE userId = $1",
          [enrichedUser.id]
        )
        if (profitResult && profitResult.length > 0) {
          enrichedUser.totalProfit = Number(profitResult[0]?.totalProfit) || 0
        }

        // Update totalBalance
        enrichedUser.totalBalance = 
          Number(enrichedUser.balance || 0) + 
          Number(enrichedUser.totalInvested || 0) + 
          Number(enrichedUser.totalProfit || 0)
      } catch (err) {
        apiLogger.warn(`Warning: Failed to enrich user ${enrichedUser.id}`, err)
        // Continue with basic data if enrichment fails
      }
    }
    
    return NextResponse.json(enrichedUsers)
  } catch (error) {
    apiLogger.error("Admin get users error", error)
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

    const { userId, balance, name, firstName, lastName, email, phone, dateOfBirth, role, verified } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const targetUser = await getUserById(userId)
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update provided fields
    const updates: { field: string; value: any }[] = []
    const params: any[] = []
    const usingPostgres = isPostgres()

    // Normalize values
    const canUpdateVerified = typeof verified === "boolean"

    if (balance !== undefined && !Number.isNaN(Number(balance)) && Number(balance) >= 0) {
      updates.push({ field: "balance", value: Number(balance) })
      params.push(Number(balance))
    }
    if (name) {
      updates.push({ field: "name", value: name })
      params.push(name)
    }

    if (firstName) {
      const field = usingPostgres ? "first_name" : "firstName"
      updates.push({ field, value: firstName })
      params.push(firstName)
    }
    if (lastName) {
      const field = usingPostgres ? "last_name" : "lastName"
      updates.push({ field, value: lastName })
      params.push(lastName)
    }
    if (phone) {
      updates.push({ field: "phone", value: phone })
      params.push(phone)
    }
    if (dateOfBirth) {
      const field = usingPostgres ? "date_of_birth" : "dateOfBirth"
      updates.push({ field, value: dateOfBirth })
      params.push(dateOfBirth)
    }
    if (email) {
      updates.push({ field: "email", value: email })
      params.push(email)
    }
    if (role && (role === "user" || role === "admin")) {
      updates.push({ field: "role", value: role })
      params.push(role)
    }
    if (canUpdateVerified) {
      updates.push({ field: "verified", value: verified })
      params.push(verified)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    // Build query with PostgreSQL numbered placeholders ($1, $2, etc)
    let updateQuery = "UPDATE users SET "
    const setParts = updates.map((u, i) => `${u.field} = $${i + 1}`)
    updateQuery += setParts.join(", ") + ` WHERE id = $${params.length + 1}`
    params.push(userId)

    await run(updateQuery, params)

    return NextResponse.json({ message: "User updated successfully" })
  } catch (error) {
    apiLogger.error("Admin update user error", error)
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
    apiLogger.error("Admin delete user error", error)
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}