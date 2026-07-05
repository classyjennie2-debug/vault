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
  if (process.env.NODE_ENV === 'development' || allowed.length === 0) {
    console.log("[CSRF] Development mode or no origins - allowing all")
    return null
  }

  if (!origin) {
    console.log("[CSRF] No origin header - allowing (mobile/desktop apps)")
    return null
  }

  const ok = allowed.some((o) => origin.toLowerCase().startsWith(o.toLowerCase()))
  if (!ok) {
    console.warn(`[CSRF] Origin blocked: ${origin}. Allowed: ${allowed.join(", ")}`) 
    console.warn("[CSRF] Hint: Set NEXT_PUBLIC_APP_URL in Vercel environment variables")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return null
}
