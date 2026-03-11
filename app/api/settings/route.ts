import { NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { updateUserSettings } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user
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