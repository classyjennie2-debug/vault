"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  TrendingUp,
  History,
  ArrowDownToLine,
  ArrowUpFromLine,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { UserMenu } from "@/components/dashboard/user-menu"
import { NotificationBell } from "@/components/dashboard/notification-bell"
import { Logo } from "@/components/ui/logo"
import { BottomNavBar } from "@/components/dashboard/bottom-nav-bar"
import { WelcomePopup } from "@/components/dashboard/welcome-popup"
import { LanguageSwitcher } from "@/components/language-switcher"

interface Props {
  children: React.ReactNode
  user: {
    id: string
    name: string
    email: string
    role: string
    avatar: string
    balance: number
  }
  firstName?: string
  lastName?: string
  isFirstVisit?: boolean
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/investments", label: "Investments", icon: TrendingUp },
  { href: "/dashboard/deposit", label: "Deposit", icon: ArrowDownToLine },
  { href: "/dashboard/withdraw", label: "Withdraw", icon: ArrowUpFromLine },
  { href: "/dashboard/transactions", label: "Transactions", icon: History },
  { href: "/dashboard/referrals", label: "Referrals", icon: Users },
]

const desktopNavItems = navItems // Keep original length for desktop sidebar

export default function DashboardLayoutClient({ children, user, firstName = "", lastName = "", isFirstVisit = false }: Props) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-background flex-col">
      {/* Top Header - Desktop Only */}
      <header className="hidden lg:flex h-16 items-center justify-between border-b border-border bg-card px-8 sticky top-0 z-20">
        <div className="flex-1"></div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <NotificationBell />
          <UserMenu user={user} />
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 flex-shrink-0 border-r border-border bg-card lg:flex lg:flex-col">
          <div className="flex h-16 items-center gap-2 border-b border-border px-6">
            <Logo showText={false} size="sm" />
            <span className="text-lg font-semibold text-foreground font-serif">Vault Capital</span>
          </div>
          <nav className="flex flex-1 flex-col gap-1 p-4">
            {desktopNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  pathname === item.href
                    ? "bg-secondary text-foreground font-medium"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Profile */}
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-secondary text-foreground text-xs">
                  {user.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-foreground">
                  {user.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Header */}
        <div className="flex flex-1 flex-col">
          <header className="flex h-14 sm:h-16 items-center justify-between border-b border-border bg-card px-3 sm:px-4 lg:hidden sticky top-0 z-30">
            <div className="flex items-center gap-2 min-w-0">
              <Logo showText={false} size="sm" />
              <span className="font-semibold text-sm sm:text-base text-foreground font-serif truncate">Vault Capital</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <LanguageSwitcher />
              <NotificationBell />
              <UserMenu user={user} />
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto overflow-x-auto p-2 sm:p-3 md:p-4 lg:p-6 pb-24 lg:pb-4">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNavBar />
      
      {/* Welcome Popup for first-time dashboard visitors */}
      <WelcomePopup 
        firstName={firstName || user.name?.split(' ')[0]} 
        lastName={lastName || user.name?.split(' ').slice(1).join(' ')}
        isFirstVisit={isFirstVisit}
      />
    </div>
  )
}
