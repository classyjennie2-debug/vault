import { NextResponse } from "next/server"
import { sendVerificationCode } from "@/lib/auth"
import { getUserByEmail, canResendVerificationCode } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }

    // Check if user exists
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 })
    }

    // Check if user can resend code (5-minute rate limit)
    const { canResend, nextRetryAt } = await canResendVerificationCode(email)
    if (!canResend) {
      return NextResponse.json(
        { 
          error: "Please wait before requesting a new code",
          nextRetryAt 
        },
        { status: 429 }
      )
    }

    // Send new verification code
    await sendVerificationCode(email)
    
    return NextResponse.json({ 
      message: "Verification code sent to your email",
      success: true 
    })
  } catch (error) {
    console.error("Resend code error:", error)
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
