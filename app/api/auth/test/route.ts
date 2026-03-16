import { NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/db"
import { verifyPassword } from "@/lib/auth"

/**
 * Test endpoint for debugging login issues
 * Usage: POST /api/auth/test with { email: "test@example.com", password: "password123" }
 */
export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Test endpoint only available in development" }, { status: 403 })
  }

  const { email, password } = await request.json()
  
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 })
  }

  try {
    // Step 1: Find user
    const user = await getUserByEmail(email)
    
    if (!user) {
      return NextResponse.json({
        status: "FAILED",
        step: "user_lookup",
        message: "User not found",
        email
      }, { status: 404 })
    }

    // Step 2: Check if verified
    if (!user.verified) {
      return NextResponse.json({
        status: "FAILED",
        step: "email_verification",
        message: "Email not verified",
        user: { id: user.id, email: user.email, verified: user.verified }
      }, { status: 403 })
    }

    // Step 3: Verify password if provided
    if (password) {
      const validPassword = await verifyPassword(password, user.passwordHash)
      if (!validPassword) {
        return NextResponse.json({
          status: "FAILED",
          step: "password_verification",
          message: "Invalid password",
          user: { id: user.id, email: user.email, verified: user.verified, hasPasswordHash: !!user.passwordHash }
        }, { status: 401 })
      }
    }

    // All checks passed
    return NextResponse.json({
      status: "SUCCESS",
      message: "User authenticated successfully",
      user: { id: user.id, email: user.email, name: user.name, verified: user.verified, role: user.role }
    })
  } catch (error) {
    console.error("Test auth error:", error)
    return NextResponse.json({
      status: "ERROR",
      message: error instanceof Error ? error.message : "Unknown error",
      error: String(error)
    }, { status: 500 })
  }
}
