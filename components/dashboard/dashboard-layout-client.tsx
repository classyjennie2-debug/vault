"use client"

import { WelcomePopup } from "@/components/dashboard/welcome-popup"
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
    <>
      <WelcomePopup firstName={firstName} lastName={lastName} isFirstVisit={isFirstVisit} />
      {children}
    </>
  )
}
