import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const symbol = searchParams.get("symbol")
  if (!symbol) {
    return new Response("Missing symbol", { status: 400 })
  }

  const cmcKey = process.env.CMC_API_KEY
  if (!cmcKey) {
    console.error("CMC_API_KEY not set")
    return new Response("API key not configured", { status: 500 })
  }

  try {
    const cmcRes = await fetch(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbol}&convert=USD`,
      {
        headers: {
          "X-CMC_PRO_API_KEY": cmcKey,
          "Content-Type": "application/json",
        },
      }
    )

    if (!cmcRes.ok) {
      const text = await cmcRes.text()
      return new Response(text, { status: cmcRes.status })
    }

    const data = await cmcRes.json()
    const price = data?.data?.[symbol]?.quote?.USD?.price
    if (typeof price !== "number") {
      return new Response("Price not found", { status: 502 })
    }

    return new Response(JSON.stringify({ price }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    console.error("crypto-price proxy error", err)
    return new Response("Internal error", { status: 500 })
  }
}
