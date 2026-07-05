import { NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { getUserNotifications } from "@/lib/db"
import type { Notification } from "@/lib/types"
import { apiLogger } from "@/lib/logging"

export async function GET() {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user
    const notifications = await getUserNotifications(user.id)
    
    // Convert SQLite boolean values (0/1) to JavaScript booleans
    const formattedNotifications = notifications.map((raw): Notification => {
      const n = raw as Record<string, unknown>
      return {
        id: String(n.id ?? ""),
        userId: String(n.userId ?? ""),
        title: String(n.title ?? ""),
        message: String(n.message ?? ""),
        type: (n.type as Notification["type"]) || "info",
        isRead: Boolean(n.isRead),
        timestamp: String(n.timestamp ?? new Date().toISOString()),
        actionUrl: n.actionUrl ? String(n.actionUrl) : undefined,
      }
    })
    
    const response = NextResponse.json(formattedNotifications)
    // Prevent caching to ensure fresh data on every fetch
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  } catch (error) {
    apiLogger.error("Error fetching notifications", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}