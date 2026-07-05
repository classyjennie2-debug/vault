"use client"

import { useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

/**
 * Hook that refreshes the page when balance changes are detected
 * Listens for balance update events from the API
 */
export function useBalanceRefresh() {
  const router = useRouter()

  useEffect(() => {
    // Listen for balance update events
    const handleBalanceUpdate = () => {
      console.log("[Balance] Update detected, refreshing page...")
      // Refresh the router to fetch latest data
      router.refresh()
    }

    // Event listener for balance changes (can be triggered from other components)
    window.addEventListener("balance-updated", handleBalanceUpdate)

    return () => {
      window.removeEventListener("balance-updated", handleBalanceUpdate)
    }
  }, [router])

  const triggerBalanceUpdate = useCallback(() => {
    window.dispatchEvent(new Event("balance-updated"))
  }, [])

  return { triggerBalanceUpdate }
}

/**
 * Hook to trigger balance refresh when a transaction is approved
 */
export function useBalanceRefreshOnEvent() {
  const { triggerBalanceUpdate } = useBalanceRefresh()
  return { triggerBalanceUpdate }
}
