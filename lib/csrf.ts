import { NextRequest, NextResponse } from "next/server"

function getAllowedOrigins() {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
  const local = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null
  return [envUrl, vercelUrl, local].filter(Boolean) as string[]
}

export function validateOrigin(req: NextRequest): NextResponse | null {
  const origin = req.headers.get("origin")
  const allowed = getAllowedOrigins()

  // In development or if no origins configured, allow all
  if (process.env.NODE_ENV === 'development' || allowed.length === 0) return null

  if (!origin) return null // allow requests without origin (some clients don't send it)

  const ok = allowed.some((o) => origin.toLowerCase().startsWith(o.toLowerCase()))
  if (!ok) {
    console.warn(`[CSRF] Origin not allowed: ${origin}. Allowed: ${allowed.join(", ")}`) 
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return null
}
