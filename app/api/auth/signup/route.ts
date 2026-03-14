import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { getUserByEmail, createUser } from "@/lib/db"
import { hashPassword, sendVerificationCode, sendAdminNotification } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }
    const existing = await getUserByEmail(email)
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }
    const passwordHash = await hashPassword(password)
    const id = uuidv4()
    const avatar = name
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .toUpperCase()


    // Create user as unverified - always send verification code
    await createUser({ id, name, email, passwordHash, avatar, verified: false })

    // Add welcome notification for the new user
    // Import createNotification from db
    const { createNotification } = await import("@/lib/db")
    await createNotification({
      userId: id,
      title: "Welcome to Vault!",
      message: `Hi ${name}, your account has been created. Start exploring investment opportunities and manage your portfolio with Vault.",
      type: "success",
    })

    // Send admin notification about new signup
    const adminEmailHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2563eb;">New User Signup</h2>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Status:</strong> Pending Email Verification</p>
          <hr />
          <p style="font-size: 12px; color: #666;">This is an automated notification from Vault Investment Platform</p>
        </body>
      </html>
    `
    await sendAdminNotification(`New User Signup - ${name}`, adminEmailHtml, "signup")

    // send verification code to email
    try {
      await sendVerificationCode(email)
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError)
      // Still allow signup - user can request code resend later
      // Return success so user can proceed to verification step
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Signup error:", error)
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}