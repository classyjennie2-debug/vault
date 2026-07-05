import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { validatePasswordResetToken, setUserPassword, markResetTokenAsUsed } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    // Validate the reset token against the database
    const resetRecord = await validatePasswordResetToken(token)
    
    if (!resetRecord) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update the user's password
    await setUserPassword(resetRecord.userId, hashedPassword)

    // Mark the token as used so it can't be reused
    await markResetTokenAsUsed(token)

    return NextResponse.json({ message: "Password updated successfully" })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}