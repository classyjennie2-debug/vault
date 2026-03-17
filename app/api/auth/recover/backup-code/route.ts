import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { email, backupCode } = await req.json()

    if (!email || !backupCode) {
      return NextResponse.json(
        { error: "Email and backup code are required" },
        { status: 400 }
      )
    }

    // TODO: Query database for user's backup codes
    // const user = await db.query(
    //   'SELECT twoFactorBackupCodes FROM users WHERE email = $1',
    //   [email]
    // )
    // const backupCodes = JSON.parse(user.rows[0].twoFactorBackupCodes || '[]')
    // const codeExists = backupCodes.includes(backupCode.toUpperCase())

    // For now, simulate verification
    const codeExists = backupCode.length === 8

    if (!codeExists) {
      return NextResponse.json(
        { error: "Invalid backup code" },
        { status: 401 }
      )
    }

    // TODO: Remove used backup code from database
    // await db.query(
    //   'UPDATE users SET twoFactorBackupCodes = $1 WHERE email = $2',
    //   [excludeUsedCode, email]
    // )

    return NextResponse.json({
      success: true,
      message: "Backup code verified. You can now reset your password.",
      email,
    })
  } catch (error) {
    console.error("Backup code verification error:", error)
    return NextResponse.json(
      { error: "Failed to verify backup code" },
      { status: 500 }
    )
  }
}
