import { NextRequest, NextResponse } from "next/server"
import { sendNotificationEmail } from "@/lib/email-notifications"
import crypto from "crypto"

// In production, store these in Redis or database with expiration
const recoveryCodeStore = new Map<string, { code: string; expiresAt: number; userId: string }>()

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // TODO: Query database to verify email exists
    // const user = await db.query('SELECT id FROM users WHERE email = $1', [email])
    // if (!user.rows[0]) {
    //   return NextResponse.json({ error: "Email not found" }, { status: 404 })
    // }

    // Generate 6-digit recovery code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Store code with 15-minute expiration
    const expiresAt = Date.now() + 15 * 60 * 1000
    recoveryCodeStore.set(email, {
      code,
      expiresAt,
      userId: "user-id", // TODO: Get from database
    })

    // Send recovery code to email
    await sendNotificationEmail({
      email,
      userName: email.split("@")[0],
      code,
    }).catch(err => console.error("Failed to send email:", err))

    // Clear old codes after 15 minutes
    setTimeout(() => {
      recoveryCodeStore.delete(email)
    }, 15 * 60 * 1000)

    return NextResponse.json({
      success: true,
      message: "Recovery code sent to your email",
      email,
    })
  } catch (error) {
    console.error("Recovery email error:", error)
    return NextResponse.json(
      { error: "Failed to send recovery code" },
      { status: 500 }
    )
  }
}
