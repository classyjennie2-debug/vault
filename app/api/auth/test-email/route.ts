import { NextResponse } from "next/server"
import { sendVerificationCode } from "@/lib/auth"
import { apiLogger } from "@/lib/logging"

export async function POST(request: Request) {
  // Only available in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Only available in development" }, { status: 403 })
  }

  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }

    const emailToken = process.env.EMAIL_TOKEN || process.env.EMAIL_PASS
    apiLogger.debug("TEST EMAIL SENDING", { email, host: !!process.env.EMAIL_HOST, port: !!process.env.EMAIL_PORT, userSet: !!process.env.EMAIL_USER, tokenSet: !!emailToken })

    // Send test email
    await sendVerificationCode(email)
    
    return NextResponse.json({ 
      message: "Test email sent. Check server console logs for details.",
      success: true 
    })
  } catch (error) {
    apiLogger.error("Test email error", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send test email" },
      { status: 500 }
    )
  }
}
