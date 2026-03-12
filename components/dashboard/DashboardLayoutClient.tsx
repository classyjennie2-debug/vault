"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  TrendingUp,
  History,
  Menu,
  X,
  ArrowDownToLine,
  ArrowUpFromLine,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { UserMenu } from "@/components/dashboard/user-menu"
import { NotificationBell } from "@/components/dashboard/notification-bell"
import { Logo } from "@/components/ui/logo"

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
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/investments", label: "Investments", icon: TrendingUp },
  { href: "/dashboard/deposit", label: "Deposit", icon: ArrowDownToLine },
  { href: "/dashboard/withdraw", label: "Withdraw", icon: ArrowUpFromLine },
  { href: "/dashboard/transactions", label: "Transactions", icon: History },
]

export default function DashboardLayoutClient({ children, user }: Props) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background flex-col">
      {/* Top Header - Desktop Only */}
      <header className="hidden lg:flex h-16 items-center justify-between border-b border-border bg-card px-8 sticky top-0 z-20">
        <div className="flex-1"></div>
        <div className="flex items-center gap-4">
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
            {navItems.map((item) => (
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
              <NotificationBell />
              <UserMenu user={user} />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </Button>
            </div>
          </header>

          {/* Mobile Navigation - Static Menu */}
          {mobileMenuOpen && (
            <div className="border-b border-border bg-card p-3 sm:p-4 lg:hidden">
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 sm:py-2.5 text-sm transition-colors min-h-[44px]",
                      pathname === item.href
                        ? "bg-secondary text-foreground font-medium"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          )}

          {/* Main content */}
          <main className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 lg:p-6 pb-24 sm:pb-20 md:pb-4">{children}</main>
        </div>
      </div>
    </div>
  )
}
