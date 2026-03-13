"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  TrendingUp,
  History,
  ArrowDownToLine,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/investments", label: "Invest", icon: TrendingUp },
  { href: "/dashboard/deposit", label: "Deposit", icon: ArrowDownToLine },
  { href: "/dashboard/transactions", label: "History", icon: History },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export function BottomNavBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex lg:hidden h-16 border-t border-border bg-card shadow-lg shadow-black/10 z-40">
      <div className="flex w-full items-stretch">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-95",
                isActive
                  ? "text-primary bg-gradient-to-t from-primary/10 to-transparent"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs font-medium leading-none">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
