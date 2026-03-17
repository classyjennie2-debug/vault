import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { getUserByEmail, createUser } from "@/lib/db"
import { hashPassword, sendVerificationCode, sendAdminNotification } from "@/lib/auth"
import { rateLimitedResponse, rateLimitConfigs, getClientIp } from "@/lib/rate-limiting"

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, password, phone, dateOfBirth } = await request.json()
    const clientIp = await getClientIp(request)

    return await rateLimitedResponse(
      `signup_${clientIp}_${email ?? 'unknown'}`,
      rateLimitConfigs.register,
      async () => {
    if (!firstName || !lastName || !email || !password || !phone || !dateOfBirth) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }
    const existing = await getUserByEmail(email)
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }
    const passwordHash = await hashPassword(password)
    const id = uuidv4()
    const fullName = `${firstName} ${lastName}`
    const avatar = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()

    // Create user as unverified - always send verification code
    await createUser({ 
      id, 
      name: fullName,
      firstName,
      lastName,
      email, 
      passwordHash, 
      avatar, 
      phone,
      dateOfBirth,
      verified: false 
    })

    // Add welcome notification for the new user
    // Import createNotification from db
    const { createNotification } = await import("@/lib/db")
    await createNotification({
      userId: id,
      title: "Welcome to Vault!",
      message: `Hi ${firstName}, your account has been created. Start exploring investment opportunities and manage your portfolio with Vault.`,
      type: "success",
    })

    // Send admin notification about new signup
    const adminEmailHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2563eb;">New User Signup</h2>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Date of Birth:</strong> ${dateOfBirth}</p>
          <p><strong>Status:</strong> Pending Email Verification</p>
          <hr />
          <p style="font-size: 12px; color: #666;">This is an automated notification from Vault Investment Platform</p>
        </body>
      </html>
    `
    await sendAdminNotification(`New User Signup - ${fullName}`, adminEmailHtml, "signup")

    // send verification code to email
    try {
      await sendVerificationCode(email)
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError)
      // Still allow signup - user can request code resend later
      // Return success so user can proceed to verification step
    }

    return NextResponse.json({ success: true })
      }
    )
  } catch (error) {
    console.error("Signup error:", error)
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
