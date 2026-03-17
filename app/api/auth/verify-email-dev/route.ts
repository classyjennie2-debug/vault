import { NextResponse } from "next/server"
import { run, getUserByEmail } from "@/lib/db"

/**
 * Development-only endpoint to verify a user's email
 * Usage: POST /api/auth/verify-email-dev with { email: "user@example.com" }
 */
export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Only available in development" }, { status: 403 })
  }

  const { email } = await request.json()
  
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 })
  }

  try {
    const user = await getUserByEmail(email)
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.verified) {
      return NextResponse.json({ 
        message: "User already verified",
        user: { id: user.id, email: user.email, verified: true }
      })
    }

    // Manually verify the user
    await run("UPDATE users SET verified = TRUE WHERE id = $1", [user.id])

    return NextResponse.json({
      message: "User email verified successfully",
      user: { id: user.id, email: user.email, verified: true }
    })
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
