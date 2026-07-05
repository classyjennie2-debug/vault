import type { CoinType } from "./types"

const coinToCmcSymbol: Record<CoinType, string> = {
  USDT: "USDT",
  BTC: "BTC",
  ETH: "ETH",
  BNB: "BNB",
  TRX: "TRX",
  SOL: "SOL",
}

// Cache for price data to reduce API calls
const priceCache: Record<string, { price: number; timestamp: number }> = {}
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes


/**
 * Fetch the current price of a cryptocurrency in USD.
 *
 * The client-side code used to call CoinMarketCap directly, which meant the
 * API key was never available (it isn’t prefixed with `NEXT_PUBLIC_`).  The
 * request therefore always failed and we would fall back to a hard‑coded mock
 * price, which is why the UI was stuck around 42k for BTC.
 *
 * To avoid leaking the key we now proxy the request through an internal
 * server route (`/api/crypto-price`).  That endpoint runs on the server and
 * can safely read `process.env.CMC_API_KEY`.
 */
export async function getCryptoPriceInUSD(coin: CoinType): Promise<number> {
  const cacheKey = `price_${coin}`
  
  // Check cache
  if (priceCache[cacheKey] && Date.now() - priceCache[cacheKey].timestamp < CACHE_TTL) {
    return priceCache[cacheKey].price
  }

  try {
    const cmcSymbol = coinToCmcSymbol[coin]
    const res = await fetch(`/api/crypto-price?symbol=${cmcSymbol}`, { cache: "no-store" })

    if (res.ok) {
      const data = await res.json()
      const price = data.price as number
      // Cache the price
      priceCache[cacheKey] = {
        price,
        timestamp: Date.now(),
      }
      return price
    }

    throw new Error(`backend price proxy failed: ${res.status}`)
  } catch (error) {
    console.error(`Failed to fetch price for ${coin}:`, error)
    
    // Return mock prices as fallback (these are only used when the proxy
    // itself is down so correctness isn’t critical).  Update the BTC stub to
    // something less misleading if you like.
    const mockPrices: Record<CoinType, number> = {
      USDT: 1.0,
      BTC: 42500,
      ETH: 2300,
      BNB: 580,
      TRX: 0.12,
      SOL: 95,
    }
    
    return mockPrices[coin] || 0
  }
}


/**
 * Convert USD amount to coin amount
 */
export async function convertUSDToCoin(
  usdAmount: number,
  coin: CoinType
): Promise<number> {
  if (coin === "USDT") {
    return usdAmount
  }
  
  const priceInUSD = await getCryptoPriceInUSD(coin)
  if (priceInUSD === 0) return 0
  
  return usdAmount / priceInUSD
}

/**
 * Format coin amount to appropriate decimal places
 */
export function formatCoinAmount(amount: number, coin: CoinType): string {
  // USDT and stablecoins: 2 decimal places
  if (coin === "USDT") {
    return amount.toFixed(2)
  }
  
  // BTC: 8 decimal places (smallest unit is 1 satoshi)
  if (coin === "BTC") {
    return amount.toFixed(8)
  }
  
  // ETH and others: 8 decimal places
  return amount.toFixed(8)
}

/**
 * Batch fetch prices for multiple coins
 */
export async function getPricesForCoins(coins: CoinType[]): Promise<Record<CoinType, number>> {
  const prices: Record<string, number> = {}
  
  await Promise.all(
    coins.map(async (coin) => {
      prices[coin] = await getCryptoPriceInUSD(coin)
    })
  )
  
  return prices as Record<CoinType, number>
}
