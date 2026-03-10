import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { getUserById, setUserPassword } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    // In a real application, you would:
    // 1. Validate the reset token from the database
    // 2. Check if it's not expired
    // 3. Find the associated user
    // 4. Update the password
    // 5. Invalidate the token

    // For this demo, we'll simulate with a simple token check
    // In production, you'd have a proper token system
    const tokenParts = token.split('_')
    if (tokenParts.length !== 3 || tokenParts[0] !== 'reset') {
      return NextResponse.json({ error: "Invalid reset token" }, { status: 400 })
    }

    const userId = tokenParts[1]
    const user = getUserById(userId)

    if (!user) {
      return NextResponse.json({ error: "Invalid reset token" }, { status: 400 })
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update the user's password
    setUserPassword(userId, hashedPassword)

    return NextResponse.json({ message: "Password updated successfully" })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}