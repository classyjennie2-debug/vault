import { NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { run } from "@/lib/db"

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    // Delete all read notifications for the user
    const result = await run(
      "DELETE FROM notifications WHERE userId = ? AND isRead = 1",
      [user.id]
    )

    return NextResponse.json({ 
      success: true,
      deleted: result 
    })
  } catch (error) {
    console.error("Error deleting read notifications:", error)
    return NextResponse.json(
      { error: "Failed to delete read notifications" },
      { status: 500 }
    )
  }
}
