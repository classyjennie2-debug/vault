import { getCurrentUser } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// Helper to generate base32 encoded secret
function base32Encode(buffer: Buffer): string {
  const base32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
  let bits = 0
  let value = 0
  let output = ""

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i]
    bits += 8
    while (bits >= 5) {
      output += base32Chars[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }

  if (bits > 0) {
    output += base32Chars[(value << (5 - bits)) & 31]
  }

  return output
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Generate 20-byte secret and encode to base32
    const secretBuffer = crypto.randomBytes(20)
    const secret = base32Encode(secretBuffer)

    // Generate QR code URI for authenticator apps
    const issuer = "Vault Capital"
    const accountName = user.email
    const otpAuthUri = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`

    // Generate QR code using simple ASCII representation (for now)
    // In production, use qrcode npm package
    const qrCodeSimple = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(otpAuthUri)}`

    return NextResponse.json({
      secret,
      qrCode: qrCodeSimple,
      otpAuthUri,
      message: "Scan QR code with your authenticator app or enter the secret manually",
    })
  } catch (error) {
    console.error("2FA setup error:", error)
    return NextResponse.json(
      { error: "Failed to setup 2FA" },
      { status: 500 }
    )
  }
}

