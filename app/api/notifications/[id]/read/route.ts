import { NextResponse } from "next/server"
import { run } from "@/lib/db"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const notificationId = params.id

    // Update notification read status in database
    await run(
      `UPDATE notifications SET isRead = 1 WHERE id = ?`,
      [notificationId]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    )
  }
}
