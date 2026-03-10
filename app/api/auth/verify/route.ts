import { NextResponse } from "next/server"
import { verifySignupCode } from "@/lib/auth"
import { getUserByEmail } from "@/lib/db"
import { issueToken } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  const { email, code } = await request.json()
  if (!email || !code) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }
  const ok = await verifySignupCode(email, code)
  if (!ok) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 })
  }

  // automatically log user in
  const user = getUserByEmail(email)
  if (user) {
    const token = issueToken({ id: user.id, email: user.email, role: user.role })
    const cookieStore = await cookies()
    cookieStore.set("vault_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ success: true })
}