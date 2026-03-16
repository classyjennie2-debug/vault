import { NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { getUserNotifications, markNotificationAsRead } from "@/lib/db"
import type { Notification } from "@/lib/types"

export async function GET() {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user
    const notifications = await getUserNotifications(user.id)
    
    // Convert SQLite boolean values (0/1) to JavaScript booleans
    const formattedNotifications = notifications.map((n: any) => ({
      ...n,
      isRead: Boolean(n.isRead) // Convert 0/1 to false/true
    }))
    
    const response = NextResponse.json(formattedNotifications)
    // Prevent caching to ensure fresh data on every fetch
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user
    const { notificationId } = await request.json()

    if (!notificationId) {
      return NextResponse.json({ error: "Notification ID required" }, { status: 400 })
    }

    // Verify the notification belongs to the user
    const notifications = await getUserNotifications(user.id)
    const notification = notifications.find((n: any) => n.id === notificationId)

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