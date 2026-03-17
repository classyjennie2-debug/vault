import { NextRequest, NextResponse } from "next/server"

// This should match the store from email route in production
const recoveryCodeStore = new Map<string, { code: string; expiresAt: number; userId: string }>()

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required" },
        { status: 400 }
      )
    }

    // Get stored code
    const stored = recoveryCodeStore.get(email)

    if (!stored) {
      return NextResponse.json(
        { error: "No recovery code found. Please request a new one." },
        { status: 404 }
      )
    }

    // Check if code has expired
    if (Date.now() > stored.expiresAt) {
      recoveryCodeStore.delete(email)
      return NextResponse.json(
        { error: "Recovery code has expired. Please request a new one." },
        { status: 401 }
      )
    }

    // Verify code
    if (stored.code !== code) {
      return NextResponse.json(
        { error: "Invalid recovery code" },
        { status: 401 }
      )
    }

    // Code verified - don't delete yet, needed for next step
    return NextResponse.json({
      success: true,
      message: "Email verified. Please provide a backup code.",
      email,
    })
  } catch (error) {
    console.error("Recovery verification error:", error)
    return NextResponse.json(
      { error: "Failed to verify code" },
      { status: 500 }
    )
  }
}
