import { NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { getUserActivity } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "100")

    // Get all activity logs for the user
    const activities = await getUserActivity(user.id, limit)

    return NextResponse.json(activities)
  } catch (error) {
    console.error("Error fetching activities:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
