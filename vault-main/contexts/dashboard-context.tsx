"use client"

import React, { createContext, useContext } from "react"
import { useDashboardPolling, DashboardDataSnapshot } from "@/hooks/use-dashboard-polling"

interface DashboardContextType {
  stats: DashboardDataSnapshot["stats"] | undefined
  metrics: DashboardDataSnapshot["metrics"] | undefined
  portfolio: any
  activeInvestments: any[]
  recentTransactions: any[]
  user: DashboardDataSnapshot["user"] | undefined
  isLoading: boolean
  error: string | null
  lastUpdate: number
  refetch: () => Promise<void>
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const dashboardData = useDashboardPolling(5000) // Poll every 5 seconds

  return (
    <DashboardContext.Provider value={dashboardData}>
      {children}
    </DashboardContext.Provider>
  )
}

/**
 * Hook to access dashboard data from context
 * Must be used inside a DashboardProvider
 */
export function useDashboard() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error("useDashboard must be used inside a DashboardProvider")
  }
  return context
}
