import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getCurrentUser } from "@/lib/auth"
import { logActivity } from "@/lib/db"

export async function POST() {
  try {
    // Get current user before clearing cookies so we can log their logout
    const user = await getCurrentUser()
    
    // Log logout activity if we have a user
    if (user) {
      try {
        await logActivity(user.id, "logout", "User logged out of the platform")
      } catch (err) {
        console.error("Failed to log logout activity:", err)
        // Continue with logout even if activity logging fails
      }
    }

    // Clear all auth cookies
    const cookieStore = await cookies()
    cookieStore.delete("vault_token")
    cookieStore.set("vault_token", "", { maxAge: 0, path: "/" })
    
    // Also clear any alternate auth cookie names that might exist
    cookieStore.set("auth_token", "", { maxAge: 0, path: "/" })
    cookieStore.set("session", "", { maxAge: 0, path: "/" })
    cookieStore.set("jwt", "", { maxAge: 0, path: "/" })

    return NextResponse.json(
      { success: true, message: "Logged out successfully" },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    )
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json(
      { success: false, error: "Logout failed" },
      { status: 500 }
    )
  }
}