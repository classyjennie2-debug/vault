import { NextRequest, NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const user = await getUserByEmail(email)
    if (!user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        message: "If an account with this email exists, we've sent a password reset link."
      })
    }

    // Generate a simple reset token (in production, use a proper JWT or secure token)
    const resetToken = `reset_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`

    // In a real application, you would send an email here
    console.log(`Password reset link for ${email}: ${resetLink}`)

    // For demo purposes, we'll log the link
    // In production, you'd use a service like SendGrid, Mailgun, etc.

    return NextResponse.json({
      message: "If an account with this email exists, we've sent a password reset link.",
      // For demo purposes, include the link in the response (remove in production)
      resetLink
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}