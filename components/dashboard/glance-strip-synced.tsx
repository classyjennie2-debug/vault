"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Bell, TrendingUp, DollarSign, RefreshCw } from "lucide-react"
import { useDashboard } from "@/contexts/dashboard-context"

export function GlanceStripSynced() {
  const { stats, metrics, isLoading } = useDashboard()
  const [unread, setUnread] = useState<number>(0)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/notifications")
        if (res.ok) {
          const data = await res.json()
          const unreadCount = (data || []).filter((n: any) => !n.isRead).length
          setUnread(unreadCount)
        }
      } catch {
        // silent fail; keep unread as 0
      } finally {
        setLastUpdated(new Date())
      }
    }
    load()
  }, [])

  if (!stats || !metrics) {
    return <div className="h-16 bg-card rounded-lg animate-pulse" />
  }

  const items = [
    {
      label: "Net Balance",
      value: `$${stats.totalBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      tone: "border-primary/30 text-primary bg-primary/5",
    },
    {
      label: "Monthly Delta",
      value: `${metrics.monthlyGain >= 0 ? "+" : ""}$${metrics.monthlyGain.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      icon: TrendingUp,
      tone:
        metrics.monthlyGain >= 0
          ? "border-emerald-400/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
          : "border-rose-400/40 text-rose-600 dark:text-rose-400 bg-rose-500/5",
    },
    {
      label: "Notifications",
      value: unread.toString(),
      icon: Bell,
      tone: "border-orange-400/40 text-orange-600 dark:text-orange-400 bg-orange-500/5",
    },
  ]

  return (
    <div className="w-full">
      <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 auto-rows-min">
        {items.map((item, idx) => {
          const Icon = item.icon
          return (
            <div
              key={idx}
              className={cn(
                "relative overflow-hidden rounded-lg border bg-gradient-to-br from-card/80 to-card/40 p-3 sm:p-4 md:p-5 backdrop-blur-sm transition-all duration-300",
                item.tone,
                isLoading && "opacity-75"
              )}
            >
              <div className="absolute -right-8 -top-8 opacity-10">
                <Icon className="h-24 w-24 sm:h-32 sm:w-32" />
              </div>

              <div className="relative z-10 flex items-start justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-1 sm:mb-2">
                    {item.label}
                  </p>
                  <p className={cn(
                    "text-lg sm:text-xl md:text-2xl font-bold transition-colors duration-300 truncate",
                    idx === 0 && isLoading && "text-emerald-600 dark:text-emerald-500"
                  )}>
                    {item.value}
                  </p>
                  {idx === 0 && isLoading && (
                    <p className="text-[8px] sm:text-xs text-muted-foreground mt-1">Syncing...</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-2 sm:mt-3 flex items-center gap-1">
          <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}
    </div>
  )
}
