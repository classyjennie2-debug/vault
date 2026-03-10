import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { email, subject, message } = await request.json()

    if (!email || !subject || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // In a real app, this would send an email or create a support ticket
    console.log(`Support request from ${user.email}:`, { email, subject, message })

    return NextResponse.json({ message: "Support request submitted successfully" })
  } catch (error) {
    console.error("Support request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}