import { NextRequest, NextResponse } from "next/server"

function getAllowedOrigins() {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
  return [envUrl, vercelUrl].filter(Boolean) as string[]
}

export function validateOrigin(req: NextRequest): NextResponse | null {
  const origin = req.headers.get("origin")
  const allowed = getAllowedOrigins()

  if (!origin || allowed.length === 0) return null // allow in dev/unconfigured

  const ok = allowed.some((o) => origin.toLowerCase().startsWith(o.toLowerCase()))
  if (!ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return null
}
