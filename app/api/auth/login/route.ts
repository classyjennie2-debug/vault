import { NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/db"
import { verifyPassword, issueToken } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  const { email, password } = await request.json()
  if (!email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }
  const user = getUserByEmail(email)
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }
  if (!user.verified) {
    return NextResponse.json({ error: "Email not verified" }, { status: 403 })
  }
  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }

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
