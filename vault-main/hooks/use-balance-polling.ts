"use client"

import { useEffect, useState, useCallback, useRef } from "react"

export interface BalanceData {
  balance: number
  totalInvested: number
  totalProfit: number
  availableBalance: number
  user?: {
    id: string
    name: string
    email: string
  }
}

/**
 * Hook that polls user balance every 5 seconds
 * Updates local state with fresh balance data from the server
 * Useful for displaying real-time balance updates without page refresh
 *
 * Usage:
 * const { balance, stats, isLoading, error, refetch } = useBalancePolling()
 */
export function useBalancePolling(interval: number = 5000) {
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<number>(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchBalance = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/user/balance", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch balance: ${response.status}`)
      }

      const data = await response.json()
      
      // Check if balance has changed
      if (balanceData && balanceData.balance !== data.balance) {
        console.log(`[Balance Polling] Balance changed: ${balanceData.balance} → ${data.balance}`)
        // Dispatch event so other parts of the app can react
        window.dispatchEvent(new CustomEvent("balance-changed", { detail: data }))
      }

      setBalanceData(data)
      setLastUpdate(Date.now())
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error"
      console.error("[Balance Polling] Error:", errorMsg)
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }, [balanceData])

  // Set up polling interval
  useEffect(() => {
    // Fetch immediately on mount
    fetchBalance()

    // Then set up periodic polling
    intervalRef.current = setInterval(() => {
      fetchBalance()
    }, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchBalance, interval])

  return {
    balance: balanceData?.balance || 0,
    totalInvested: balanceData?.totalInvested || 0,
    totalProfit: balanceData?.totalProfit || 0,
    availableBalance: balanceData?.availableBalance || 0,
    stats: balanceData,
    isLoading,
    error,
    lastUpdate,
    refetch: fetchBalance, // Manual refetch if needed
  }
}

/**
 * Hook that triggers a callback when balance changes
 * Listens for balance-changed events
 */
export function useOnBalanceChange(callback: (data: BalanceData) => void) {
  useEffect(() => {
    const handleBalanceChange = (event: Event) => {
      if (event instanceof CustomEvent) {
        callback(event.detail)
      }
    }

    window.addEventListener("balance-changed", handleBalanceChange)

    return () => {
      window.removeEventListener("balance-changed", handleBalanceChange)
    }
  }, [callback])
}
