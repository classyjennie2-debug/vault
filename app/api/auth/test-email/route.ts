import { NextResponse } from "next/server"
import { sendVerificationCode } from "@/lib/auth"

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

    console.log(`\n🧪 TEST EMAIL SENDING`)
    console.log(`📧 Email: ${email}`)
    console.log(`🔧 Configuration:`)
    console.log(`   HOST: ${process.env.EMAIL_HOST || "NOT SET ❌"}`)
    console.log(`   PORT: ${process.env.EMAIL_PORT || "NOT SET ❌"}`)
    console.log(`   USER: ${process.env.EMAIL_USER ? "SET ✓" : "NOT SET ❌"}`)
    console.log(`   PASS: ${process.env.EMAIL_PASS ? "SET ✓" : "NOT SET ❌"}`)
    console.log(``)

    // Send test email
    await sendVerificationCode(email)
    
    return NextResponse.json({ 
      message: "Test email sent. Check server console logs for details.",
      success: true 
    })
  } catch (error) {
    console.error("Test email error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send test email" },
      { status: 500 }
    )
  }
}
