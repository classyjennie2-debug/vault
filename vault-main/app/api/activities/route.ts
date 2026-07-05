import { NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { getRecentActivities } from "@/lib/db"

export async function GET() {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user
    const activities = await getRecentActivities(user.id)
    return NextResponse.json(activities)
  } catch (error) {
    console.error("Error fetching activities:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}