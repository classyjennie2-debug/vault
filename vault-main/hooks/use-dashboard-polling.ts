"use client"

import { useEffect, useState, useCallback, useRef } from "react"

export interface DashboardDataSnapshot {
  timestamp: number
  user: {
    id: string
    name: string
    email: string
  }
  stats: {
    totalInvested: number
    totalProfit: number
    availableBalance: number
    activeInvestments: number
    pendingDeposits: number
    totalWithdrawn: number
    pendingWithdrawals: number
    totalBalance: number
    totalReturnRate: number
  }
  metrics: {
    dailyBalanceChange: number
    monthlyReturns: number
    weeklyChange: number
  }
  portfolio: any
  activeInvestments: any[]
  recentTransactions: any[]
}

/**
 * Hook that polls all dashboard data every 5 seconds
 * Returns comprehensive dashboard state with automatic updates
 *
 * Usage:
 * const {
 *   stats,
 *   metrics,
 *   portfolio,
 *   activeInvestments,
 *   recentTransactions,
 *   isLoading,
 *   error,
 * } = useDashboardPolling()
 */
export function useDashboardPolling(interval: number = 5000) {
  const [dashboardData, setDashboardData] = useState<DashboardDataSnapshot | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<number>(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const previousDataRef = useRef<DashboardDataSnapshot | null>(null)

  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null)

      const response = await fetch("/api/dashboard/data", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.status}`)
      }

      const data: DashboardDataSnapshot = await response.json()

      // Check what changed
      if (previousDataRef.current) {
        const changes: string[] = []

        if (data.stats.totalBalance !== previousDataRef.current.stats.totalBalance) {
          changes.push(`balance: $${previousDataRef.current.stats.totalBalance} → $${data.stats.totalBalance}`)
        }
        if (data.stats.totalProfit !== previousDataRef.current.stats.totalProfit) {
          changes.push(`profit: $${previousDataRef.current.stats.totalProfit} → $${data.stats.totalProfit}`)
        }
        if (data.stats.activeInvestments !== previousDataRef.current.stats.activeInvestments) {
          changes.push(`active investments: ${previousDataRef.current.stats.activeInvestments} → ${data.stats.activeInvestments}`)
        }
        if (data.stats.pendingDeposits !== previousDataRef.current.stats.pendingDeposits) {
          changes.push(`pending deposits: ${previousDataRef.current.stats.pendingDeposits} → ${data.stats.pendingDeposits}`)
        }
        if (data.metrics.dailyBalanceChange !== previousDataRef.current.metrics.dailyBalanceChange) {
          changes.push(`daily balance change: $${previousDataRef.current.metrics.dailyBalanceChange} → $${data.metrics.dailyBalanceChange}`)
        }

        if (changes.length > 0) {
          console.log("[Dashboard Polling] Data updated:", changes.join(", "))
          // Dispatch event so other parts of the app can react
          window.dispatchEvent(
            new CustomEvent("dashboard-data-changed", {
              detail: { previous: previousDataRef.current, current: data, changes },
            })
          )
        }
      }

      previousDataRef.current = data
      setDashboardData(data)
      setLastUpdate(Date.now())
      setIsLoading(false)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error"
      console.error("[Dashboard Polling] Error:", errorMsg)
      setError(errorMsg)
      // Don't set loading to false on error, keep previous data
    }
  }, [])

  // Set up polling interval
  useEffect(() => {
    // Fetch immediately on mount
    fetchDashboardData()

    // Then set up periodic polling
    intervalRef.current = setInterval(() => {
      fetchDashboardData()
    }, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchDashboardData, interval])

  return {
    stats: dashboardData?.stats,
    metrics: dashboardData?.metrics,
    portfolio: dashboardData?.portfolio,
    activeInvestments: dashboardData?.activeInvestments || [],
    recentTransactions: dashboardData?.recentTransactions || [],
    user: dashboardData?.user,
    isLoading,
    error,
    lastUpdate,
    refetch: fetchDashboardData,
  }
}

/**
 * Hook that triggers a callback when dashboard data changes
 * Listens for dashboard-data-changed events
 */
export function useOnDashboardDataChange(
  callback: (data: {
    previous: DashboardDataSnapshot
    current: DashboardDataSnapshot
    changes: string[]
  }) => void
) {
  useEffect(() => {
    const handleDataChange = (event: Event) => {
      if (event instanceof CustomEvent) {
        callback(event.detail)
      }
    }

    window.addEventListener("dashboard-data-changed", handleDataChange)

    return () => {
      window.removeEventListener("dashboard-data-changed", handleDataChange)
    }
  }, [callback])
}
