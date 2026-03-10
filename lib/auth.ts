import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getUserById, getUserByEmail, verifyUserEmail, insertVerificationCode, consumeVerificationCode } from "./db"

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-change-me"
const TOKEN_NAME = "vault_token"

export interface SessionPayload {
  id: string
  email: string
  role: string
}

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(
  password: string,
  hash: string | undefined
) {
  if (!hash) return false
  return bcrypt.compare(password, hash)
}

export function issueToken(user: SessionPayload) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload
  } catch (_) {
    return null
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get(TOKEN_NAME)?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload) return null
  const user = await getUserById(payload.id)
  return user ? { ...user, role: payload.role } : null
}

export async function requireAuth(redirectTo = "/login") {
  const cookieStore = await cookies()
  const token = cookieStore.get(TOKEN_NAME)?.value
  if (!token) redirect(redirectTo)
  const payload = verifyToken(token)
  if (!payload) redirect(redirectTo)
  const user = await getUserById(payload.id)
  if (!user) redirect(redirectTo)
  return user
}

// used in API routes
export async function verifyAdminAuth(request: Request) {
  const token = request.headers.get("authorization")?.split(" ")[1]
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload || payload.role !== "admin") return null
  return await getUserById(payload.id)
}


export async function sendVerificationCode(email: string) {
  // generate 6 digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 1000 * 60 * 10).toISOString()
  // store in DB
  const { v4: uuidv4 } = await import("uuid")
  await insertVerificationCode({
    id: uuidv4(),
    email,
    code,
    expiresAt,
  })

  // send email - placeholder using console
  console.log(`Verification code for ${email}: ${code}`)

  // TODO: integrate actual email delivery (nodemailer or service)
}

// helper to validate code and mark email verified
export async function verifySignupCode(email: string, code: string) {
  try {
    const ok = await consumeVerificationCode(code)
    if (!ok) return false
    await verifyUserEmail(email)
    return true
  } catch (error) {
    console.error("Error verifying signup code:", error)
    return false
  }
}
