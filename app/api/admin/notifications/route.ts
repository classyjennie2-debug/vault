import { NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { createNotification, getUserById } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    // Check if user is admin
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { userId, title, message, type } = await request.json()

    if (!userId || !title || !message || !type) {
      return NextResponse.json(
        { error: "Missing required fields: userId, title, message, type" },
        { status: 400 }
      )
    }

    // Validate type
    if (!["success", "info", "warning", "error"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be one of: success, info, warning, error" },
        { status: 400 }
      )
    }

    // Verify target user exists
    const targetUser = await getUserById(userId)
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create notification
    const notificationId = await createNotification({
      userId,
      title,
      message,
      type,
    })

    return NextResponse.json({
      message: "Notification sent successfully",
      notificationId,
    })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
