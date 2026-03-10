"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Lock,
  LayoutDashboard,
  History,
  TrendingUp,
  LogOut,
  Menu,
  X,
  ArrowDownToLine,
  ArrowUpFromLine,
  Bell,
  HelpCircle,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { NotificationBell } from "@/components/dashboard/notification-bell"

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

const footerItems = [
  { href: "/dashboard/support", label: "Support", icon: HelpCircle },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
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
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 flex-shrink-0 border-r border-border bg-card lg:flex lg:flex-col">
          <div className="flex h-16 items-center gap-2 border-b border-border px-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Lock className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">Vault</span>
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

          {/* Footer Items */}
          <div className="border-t border-border p-4 space-y-1">
            {footerItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>

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
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 w-full justify-start text-muted-foreground"
              asChild
            >
              <Link href="/">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Link>
            </Button>
          </div>
        </aside>

        {/* Mobile Header */}
        <div className="flex flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <Lock className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">Vault</span>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </header>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="border-b border-border bg-card p-4 lg:hidden">
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
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
                <div className="border-t border-border my-2 pt-2">
                  {footerItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  ))}
                </div>
                <Link
                  href="/"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Link>
              </nav>
            </div>
          )}

          {/* Main content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
