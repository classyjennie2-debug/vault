import { NextRequest, NextResponse } from "next/server"
import { getUserByEmail, createPasswordResetToken } from "@/lib/db"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const user = await getUserByEmail(email)
    if (user) {
      // Generate a cryptographically secure token (32 bytes = 256 bits)
      const token = crypto.randomBytes(32).toString("hex")
      
      // Store the token in the database with 30-minute expiration
      await createPasswordResetToken(user.id, token, 30)

      // In production, send reset link via email
      // For now, just log it in development
      if (process.env.NODE_ENV === "development") {
        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`
        console.log(`Password reset link for ${email}: ${resetLink}`)
      }
    }

    // Always return same message regardless of whether email exists (don't leak user existence)
    return NextResponse.json({
      message: "If an account with this email exists, we've sent a password reset link."
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}