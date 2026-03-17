import { getCurrentUser } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { reason } = await request.json()

    if (!reason || reason.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide a valid reason (at least 10 characters)" },
        { status: 400 }
      )
    }

    // TODO: Store deletion request in database and send notification to admin
    // For now, we'll just log it
    console.log(`[Account Deletion Request] User: ${user.email}, Reason: ${reason}`)

    // In a real implementation, you would:
    // 1. Save the deletion request to a table (deletionRequests or similar)
    // 2. Send an email to the user confirming the request
    // 3. Send an email/notification to admin for approval
    // 4. Set a flag on user account indicating deletion is pending

    return NextResponse.json({
      success: true,
      message: "Your account deletion request has been submitted for review",
    })
  } catch (error) {
    console.error("Error requesting account deletion:", error)
    return NextResponse.json(
      { error: "Failed to process deletion request" },
      { status: 500 }
    )
  }
}
