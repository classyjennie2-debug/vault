import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { getUserByEmail, createUser } from "@/lib/db"
import { hashPassword, sendVerificationCode } from "@/lib/auth"

export async function POST(request: Request) {
  const { name, email, password } = await request.json()
  if (!name || !email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }
  const existing = getUserByEmail(email)
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

  createUser({ id, name, email, passwordHash, avatar })

  // send verification code to email
  await sendVerificationCode(email)

  return NextResponse.json({ success: true })
}