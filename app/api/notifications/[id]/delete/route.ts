import { NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { getUserNotifications, run } from "@/lib/db"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const notificationId = resolvedParams.id

    if (!notificationId) {
      return NextResponse.json({ error: "Notification ID required" }, { status: 400 })
    }

    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    // Verify the notification belongs to the user
    const notifications = await getUserNotifications(user.id)
    const notification = notifications.find((n: any) => n.id === notificationId)

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    // Delete the notification
    await run("DELETE FROM notifications WHERE id = $1", [notificationId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting notification:", error)
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    )
  }
}
