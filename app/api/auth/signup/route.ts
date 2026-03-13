import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { getUserByEmail, createUser } from "@/lib/db"
import { hashPassword, sendVerificationCode } from "@/lib/auth"

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

    // In development, auto-verify. In production, require email verification
    const verified = process.env.NODE_ENV === "development"
    await createUser({ id, name, email, passwordHash, avatar, verified })

    // send verification code to email (unless already verified in dev)
    if (!verified) {
      try {
        await sendVerificationCode(email)
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError)
        // Still allow signup - user can request code resend later
        // Return success so user can proceed to verification step
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Signup error:", error)
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}