import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { NextResponse } from "next/server"
import { getUserById, verifyUserEmail, insertVerificationCode, consumeVerificationCode } from "./db"

const JWT_SECRET = process.env.JWT_SECRET
const TOKEN_NAME = "vault_token"

function getJWTSecret(): string {
  if (!JWT_SECRET) {
    if (process.env.NODE_ENV === "development") {
      // fall back to a default in development so the server won't crash
      console.warn("WARNING: JWT_SECRET not set, using fallback development secret")
      return "development-secret"
    }
    throw new Error("JWT_SECRET environment variable is required")
  }
  return JWT_SECRET
}

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
  return jwt.sign(user, getJWTSecret(), { expiresIn: "7d" })
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, getJWTSecret()) as SessionPayload
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_err) {
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

  // process matured investments each time the user is authenticated
  try {
    await import("./db").then((db) => db.processMaturedInvestments(user.id))
  } catch (err) {
    console.error("Error processing matured investments:", err)
  }

  return user
}

// used in API routes
export async function requireAuthAPI() {
  const cookieStore = await cookies()
  const token = cookieStore.get(TOKEN_NAME)?.value
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const payload = verifyToken(token)
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const user = await getUserById(payload.id)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // process matured investments each time the user is authenticated
  try {
    await import("./db").then((db) => db.processMaturedInvestments(user.id))
  } catch (err) {
    console.error("Error processing matured investments:", err)
  }

  return user
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

  // send email using nodemailer
  const nodemailer = await import("nodemailer")

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Verification Code",
    text: `Your verification code is: ${code}. It expires in 10 minutes.`,
    html: `<p>Your verification code is: <strong>${code}</strong></p><p>It expires in 10 minutes.</p>`,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`Verification email sent to ${email}`)
  } catch (error) {
    console.error("Error sending verification email:", error)
    throw new Error("Failed to send verification email")
  }

  // Log verification code in development only
  if (process.env.NODE_ENV === "development") {
    console.log(`Verification code for ${email}: ${code}`)
  }
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
