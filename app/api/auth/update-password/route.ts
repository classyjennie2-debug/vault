import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { requireAuthAPI } from "@/lib/auth"
import { getUserById, setUserPassword } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user
    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 })
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 })
    }

    // Fetch user from DB
    const dbUser = await getUserById(user.id)
    if (!dbUser || !dbUser.passwordHash) {
      return NextResponse.json({ error: "User not found or password not set." }, { status: 404 })
    }

    // Verify current password
    const valid = await bcrypt.compare(currentPassword, dbUser.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 })
    }

    // Hash and update new password
    const hashed = await bcrypt.hash(newPassword, 10)
    await setUserPassword(user.id, hashed)

    return NextResponse.json({ message: "Password updated successfully." })
  } catch (error) {
    console.error("Update password error:", error)
    return NextResponse.json({ error: "Failed to update password." }, { status: 500 })
  }
}
