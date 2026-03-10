import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { updateUserSettings } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const settings = await request.json()

    // Update user settings (this would typically update the database)
    // For now, we'll just return success since we're using mock data
    updateUserSettings(user.id, settings)

    return NextResponse.json({ message: "Settings updated successfully" })
  } catch (error) {
    console.error("Settings update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}