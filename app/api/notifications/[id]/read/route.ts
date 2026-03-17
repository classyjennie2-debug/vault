import { NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { getUserNotifications, markNotificationAsRead, get } from "@/lib/db"
import { apiLogger } from "@/lib/logging"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Resolve params - Next.js 16 uses promises
    const resolvedParams = await params
    const notificationId = resolvedParams.id

    if (!notificationId) {
      return NextResponse.json({ error: "Notification ID required" }, { status: 400 })
    }

    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    // Verify the notification belongs to the user
    const notifications = await getUserNotifications(user.id)
    const notification = notifications.find((n: Notification) => n.id === notificationId)

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    // Mark the notification as read in database
    const updateSuccess = await markNotificationAsRead(notificationId)
    
    if (!updateSuccess) {
      return NextResponse.json(
        { error: "Failed to update notification" },
        { status: 500 }
      )
    }
    
    // Fetch the updated notification
    const updatedNotification = await get(
      "SELECT * FROM notifications WHERE id = ?",
      [notificationId]
    )

    return NextResponse.json({ success: true, notification: updatedNotification })
  } catch (error) {
    apiLogger.error("Error updating notification", error)
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    apiLogger.debug("[API] POST /api/notifications/[id]/read called")
    
    // Handle both Promise and object params (Next.js version compatibility)
    let notificationId: string
    if (params instanceof Promise) {
      const resolvedParams = await params
      notificationId = resolvedParams.id
    } else {
      notificationId = params.id
    }
    
    apiLogger.debug(`Notification ID`, { notificationId })

    if (!notificationId) {
      apiLogger.warn("No notification ID provided - returning 400")
      return NextResponse.json({ error: "Notification ID required" }, { status: 400 })
    }

    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user
    apiLogger.debug("User attempting to mark notification as read", { userId: user.id })

    // Verify the notification belongs to the user
    const notifications = await getUserNotifications(user.id)
    const notification = notifications.find((n: Notification) => n.id === notificationId)

    if (!notification) {
      apiLogger.warn(`Notification not found for user`, { notificationId, userId: user.id })
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    apiLogger.debug("Found notification", { id: notificationId, isRead: notification.isRead })

    // Mark the notification as read in database
    const updateSuccess = await markNotificationAsRead(notificationId)
    
    if (!updateSuccess) {
      apiLogger.error(`markNotificationAsRead returned false for notification`, { notificationId })
      return NextResponse.json(
        { error: "Failed to update notification - verification failed" },
        { status: 500 }
      )
    }

    apiLogger.info("Successfully marked notification as read", { notificationId })
    return NextResponse.json({ success: true })
  } catch (error) {
    apiLogger.error("[API] Error updating notification:", error)
    return NextResponse.json(
      { error: "Failed to update notification: " + String(error) },
      { status: 500 }
    )
  }
}
