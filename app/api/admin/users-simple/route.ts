import { NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { all } from "@/lib/db"
import { apiLogger } from "@/lib/logging"

export async function GET() {
  try {
    apiLogger.debug("=== Simple admin users test ===")
    
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    apiLogger.debug("Fetching base users sample")
    const users = await all("SELECT id, name, email, balance FROM users LIMIT 5")
    apiLogger.debug("Fetched users sample", { count: users.length })
    
    return NextResponse.json({
      success: true,
      userCount: users.length,
      sample: users
    })
  } catch (error) {
    apiLogger.error("Test error", error)
    return NextResponse.json({ 
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
