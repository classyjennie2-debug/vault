"use client"

import { WelcomePopup } from "@/components/dashboard/welcome-popup"
import { ReactNode } from "react"

interface DashboardLayoutClientProps {
  children: ReactNode
  userName?: string
  isFirstVisit?: boolean
}

export function DashboardLayoutClient({
  children,
  userName = "Investor",
  isFirstVisit = false,
}: DashboardLayoutClientProps) {
  return (
    <>
      <WelcomePopup userName={userName} isFirstVisit={isFirstVisit} />
      {children}
    </>
  )
}
