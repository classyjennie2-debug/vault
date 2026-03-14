import { NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { all } from "@/lib/db"

export async function GET() {
  try {
    console.log("=== Simple admin users test ===")
    
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    console.log("Fetching base users...")
    const users = await all("SELECT id, name, email, balance FROM users LIMIT 5")
    console.log("Success! Users:", users)
    
    return NextResponse.json({
      success: true,
      userCount: users.length,
      sample: users
    })
  } catch (error) {
    console.error("Test error:", error)
    return NextResponse.json({ 
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
