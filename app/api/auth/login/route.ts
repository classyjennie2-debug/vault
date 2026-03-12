import { NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/db"
import { verifyPassword, issueToken } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  const { email, password } = await request.json()
  console.log('login attempt', { email, passwordProvided: !!password })
  if (!email || !password) {
    console.log('missing fields')
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }
  const user = await getUserByEmail(email)
  console.log('user from DB', user ? { email: user.email, verified: user.verified } : null)
  if (!user) {
    console.log('invalid credentials - user not found')
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }
  if (!user.verified) {
    console.log('email not verified')
    return NextResponse.json({ error: "Email not verified" }, { status: 403 })
  }
  const valid = await verifyPassword(password, user.passwordHash)
  console.log('password valid?', valid)
  if (!valid) {
    console.log('invalid credentials - bad password')
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
