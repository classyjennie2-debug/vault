import { NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { getUserById, get, run } from "@/lib/db"
import { apiLogger } from "@/lib/logging"

/**
 * POST /api/user/update-profile
 * Update user profile information (email, phone, phoneCountry)
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    const { email, phone, phoneCountry } = await req.json()

    // Validate inputs
    if (!email && !phone && !phoneCountry) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      )
    }

    const userData = await getUserById(user.id)

    if (!userData) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Validate email if provided
    if (email && email !== userData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        )
      }

      // Check if email already exists
      const existingUser = await get(
        `SELECT id FROM users WHERE email = $1 AND id != $2`,
        [email, user.id]
      )

      if (existingUser) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 409 }
        )
      }
    }

    // Update database
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (email && email !== userData.email) {
      updates.push(`email = $${paramIndex}`)
      values.push(email)
      paramIndex++
    }

    if (phone !== undefined && phone !== userData.phone) {
      // Phone validation already done in settings component
      updates.push(`phone = $${paramIndex}`)
      values.push(phone)
      paramIndex++
    }

    if (phoneCountry !== undefined && phoneCountry !== userData.phoneCountry) {
      updates.push(`phone_country = $${paramIndex}`)
      values.push(phoneCountry)
      paramIndex++
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No changes detected" },
        { status: 400 }
      )
    }

    // Add updated_at timestamp
    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(user.id)

    const updateQuery = `UPDATE users SET ${updates.join(", ")} WHERE id = $${paramIndex}`
    await run(updateQuery, values)

    // Log the update for audit purposes
    const changedFields = []
    if (email && email !== userData.email) changedFields.push("email")
    if (phone !== undefined && phone !== userData.phone) changedFields.push("phone")
    if (phoneCountry !== undefined && phoneCountry !== userData.phoneCountry) changedFields.push("phoneCountry")

    apiLogger.info(`User profile updated: ${changedFields.join(", ")}`, {
      userId: user.id,
      changedFields,
    })

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      updatedFields: changedFields,
    })
  } catch (error) {
    apiLogger.error("Error updating user profile", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}
