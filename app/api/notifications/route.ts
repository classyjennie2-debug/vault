import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getUserNotifications, markNotificationAsRead } from "@/lib/db"
import type { Notification } from "@/lib/types"

export async function GET() {
  try {
    const user = await requireAuth()
    const notifications = await getUserNotifications(user.id)
    return NextResponse.json(notifications)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAuth()
    const { notificationId } = await request.json()

    if (!notificationId) {
      return NextResponse.json({ error: "Notification ID required" }, { status: 400 })
    }

    // Verify the notification belongs to the user
    const notifications = await getUserNotifications(user.id)
    const notification = notifications.find((n: Notification) => n.id === notificationId)

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    await markNotificationAsRead(notificationId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}