import { getCurrentUser } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// TOTP verification using HMAC-SHA1
function verifyTotp(secret: string, token: string, window: number = 1): boolean {
  const base32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
  
  // Decode base32 secret
  let bits = 0
  let value = 0
  const decoded: number[] = []
  
  for (const char of secret) {
    const idx = base32Chars.indexOf(char)
    if (idx === -1) return false
    
    value = (value << 5) | idx
    bits += 5
    
    if (bits >= 8) {
      decoded.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }
  
  const secretBuffer = Buffer.from(decoded)
  
  // Get current time counter
  const now = Math.floor(Date.now() / 1000)
  const counter = Math.floor(now / 30)
  
  // Check token within window
  for (let i = -window; i <= window; i++) {
    const hmac = crypto.createHmac('sha1', secretBuffer)
    const timeBuffer = Buffer.alloc(8)
    
    // Big-endian encoding of counter
    timeBuffer.writeBigInt64BE(BigInt(counter + i), 0)
    
    hmac.update(timeBuffer)
    const hash = hmac.digest()
    
    // Standard TOTP offset calculation
    const offset = hash[hash.length - 1] & 0x0f
    const code = (
      ((hash[offset] & 0x7f) << 24) |
      ((hash[offset + 1] & 0xff) << 16) |
      ((hash[offset + 2] & 0xff) << 8) |
      (hash[offset + 3] & 0xff)
    ) % 1000000
    
    const codeString = code.toString().padStart(6, '0')
    
    if (codeString === token) {
      return true
    }
  }
  
  return false
}

// Generate backup codes
function generateBackupCodes(count: number = 8): string[] {
  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    const code = crypto
      .randomBytes(4)
      .toString('hex')
      .toUpperCase()
      .substring(0, 8)
    codes.push(code)
  }
  return codes
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { secret, code } = await req.json()

    if (!secret || !code) {
      return NextResponse.json(
        { error: "Missing secret or code" },
        { status: 400 }
      )
    }

    // Verify the TOTP code
    if (!verifyTotp(secret, code)) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      )
    }

    // Generate backup codes
    const backupCodes = generateBackupCodes()

    // TODO: Save to database:
    // - Update user twoFactorEnabled = true
    // - Save twoFactorSecret = secret
    // - Save twoFactorBackupCodes = encrypted backup codes
    // - Save twoFactorEnabledAt = current timestamp

    return NextResponse.json({
      success: true,
      message: "Two-factor authentication enabled",
      backupCodes,
      warning: "Save these backup codes in a secure location. You can use them if you lose access to your authenticator app.",
    })
  } catch (error) {
    console.error("2FA verification error:", error)
    return NextResponse.json(
      { error: "Failed to verify code" },
      { status: 500 }
    )
  }
}
