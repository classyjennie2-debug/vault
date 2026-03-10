import type { CoinType } from "./types"

const coinToCoingeckoId: Record<CoinType, string> = {
  USDT: "tether",
  BTC: "bitcoin",
  ETH: "ethereum",
  BNB: "binancecoin",
  TRX: "tron",
  SOL: "solana",
}

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
 * Fetch the current price of a cryptocurrency in USD using CoinGecko and CoinMarketCap APIs
 * Falls back to mock data if APIs are unavailable
 */
export async function getCryptoPriceInUSD(coin: CoinType): Promise<number> {
  const cacheKey = `price_${coin}`
  
  // Check cache
  if (priceCache[cacheKey] && Date.now() - priceCache[cacheKey].timestamp < CACHE_TTL) {
    return priceCache[cacheKey].price
  }

  try {
    // Try CoinGecko first (free, no API key required)
    const coingeckoId = coinToCoingeckoId[coin]
    const coingeckoResponse = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (coingeckoResponse.ok) {
      const data = await coingeckoResponse.json()
      const price = data[coingeckoId]?.usd
      if (price) {
        // Cache the price
        priceCache[cacheKey] = {
          price,
          timestamp: Date.now(),
        }
        return price
      }
    }

    // Fallback to CoinMarketCap if CoinGecko fails
    // Note: CoinMarketCap requires API key, add CMC_API_KEY to environment variables
    const cmcApiKey = process.env.CMC_API_KEY
    if (cmcApiKey) {
      const cmcSymbol = coinToCmcSymbol[coin]
      const cmcResponse = await fetch(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${cmcSymbol}&convert=USD`, {
        method: "GET",
        headers: {
          "X-CMC_PRO_API_KEY": cmcApiKey,
          "Content-Type": "application/json",
        },
      })

      if (cmcResponse.ok) {
        const data = await cmcResponse.json()
        const price = data.data[cmcSymbol]?.quote?.USD?.price
        if (price) {
          // Cache the price
          priceCache[cacheKey] = {
            price,
            timestamp: Date.now(),
          }
          return price
        }
      }
    }

    throw new Error("Both APIs failed")
  } catch (error) {
    console.error(`Failed to fetch price for ${coin}:`, error)
    
    // Return mock prices as fallback
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
