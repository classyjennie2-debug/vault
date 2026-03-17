import { NextResponse } from "next/server"
import { verifySignupCode } from "@/lib/auth"
import { getUserByEmail } from "@/lib/db"
import { issueToken } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json()
    if (!email || !code) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }
    const ok = await verifySignupCode(email, code)
    if (!ok) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 })
    }

    // Get user and verify they exist
    const user = await getUserByEmail(email)
    if (!user) {
      console.error("Verify: User not found after code verification:", email)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Automatically log user in
    const token = issueToken({ id: user.id, email: user.email, role: user.role })
    const cookieStore = await cookies()
    cookieStore.set("vault_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Verify error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}