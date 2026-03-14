import { NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { getUserNotifications, markNotificationAsRead, get } from "@/lib/db"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    const notificationId = params.id

    if (!notificationId) {
      return NextResponse.json({ error: "Notification ID required" }, { status: 400 })
    }

    // Verify the notification belongs to the user
    const notifications = await getUserNotifications(user.id)
    const notification = notifications.find((n: any) => n.id === notificationId)

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    // Mark the notification as read in database
    await markNotificationAsRead(notificationId)
    
    // Verify the update was successful by fetching the notification again
    const updatedNotification = await get(
      "SELECT * FROM notifications WHERE id = ?",
      [notificationId]
    )
    
    if (!updatedNotification || !updatedNotification.isRead) {
      console.error(`Failed to mark notification ${notificationId} as read`)
      return NextResponse.json(
        { error: "Failed to update notification" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, notification: updatedNotification })
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    const notificationId = params.id
    console.log(`[NOTIFICATIONS] Marking notification ${notificationId} as read for user ${user.id}`)

    if (!notificationId) {
      return NextResponse.json({ error: "Notification ID required" }, { status: 400 })
    }

    // Verify the notification belongs to the user
    const notifications = await getUserNotifications(user.id)
    const notification = notifications.find((n: any) => n.id === notificationId)

    if (!notification) {
      console.log(`[NOTIFICATIONS] Notification ${notificationId} not found for user ${user.id}`)
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    console.log(`[NOTIFICATIONS] Before update - isRead: ${notification.isRead}`)

    // Mark the notification as read in database
    const updateSuccess = await markNotificationAsRead(notificationId)
    
    if (!updateSuccess) {
      console.error(`[NOTIFICATIONS] Update failed - no rows affected for notification ${notificationId}`)
      return NextResponse.json(
        { error: "Failed to update notification - no rows affected" },
        { status: 500 }
      )
    }
    
    console.log(`[NOTIFICATIONS] Update successful, verifying...`)
    
    // Verify the update was successful by fetching the notification again
    const updatedNotification = await get(
      "SELECT * FROM notifications WHERE id = ?",
      [notificationId]
    )
    
    console.log(`[NOTIFICATIONS] After update - isRead: ${updatedNotification?.isRead}, full notification:`, updatedNotification)

    if (!updatedNotification) {
      console.error(`[NOTIFICATIONS] Notification ${notificationId} not found after update`)
      return NextResponse.json(
        { error: "Notification not found after update" },
        { status: 500 }
      )
    }

    if (!updatedNotification.isRead) {
      console.error(`[NOTIFICATIONS] Verification failed - isRead is still ${updatedNotification.isRead}`)
      return NextResponse.json(
        { error: "Failed to update notification - verification failed" },
        { status: 500 }
      )
    }

    console.log(`[NOTIFICATIONS] Successfully marked notification ${notificationId} as read`)
    return NextResponse.json({ success: true, notification: updatedNotification })
  } catch (error) {
    console.error("[NOTIFICATIONS] Error updating notification:", error)
    return NextResponse.json(
      { error: "Failed to update notification: " + String(error) },
      { status: 500 }
    )
  }
}
