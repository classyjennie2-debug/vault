"use client"

import { WelcomePopup } from "@/components/dashboard/welcome-popup"
import { DashboardProvider } from "@/contexts/dashboard-context"
import { ReactNode } from "react"

interface DashboardLayoutClientProps {
  children: ReactNode
  firstName?: string
  lastName?: string
  isFirstVisit?: boolean
}

export function DashboardLayoutClient({
  children,
  firstName = "",
  lastName = "",
  isFirstVisit = false,
}: DashboardLayoutClientProps) {
  return (
    <DashboardProvider>
      <WelcomePopup firstName={firstName} lastName={lastName} isFirstVisit={isFirstVisit} />
      {children}
    </DashboardProvider>
  )
}
