"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Bell, TrendingUp, DollarSign, RefreshCw } from "lucide-react"

interface GlanceStripProps {
  totalBalance: number
  monthlyGain: number
}

export function GlanceStrip({ totalBalance, monthlyGain }: GlanceStripProps) {
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

  const items = [
    {
      label: "Net Balance",
      value: `$${totalBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      tone: "border-primary/30 text-primary bg-primary/5",
    },
    {
      label: "Monthly Delta",
      value: `${monthlyGain >= 0 ? "+" : ""}$${monthlyGain.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      icon: TrendingUp,
      tone: monthlyGain >= 0
        ? "border-emerald-400/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
        : "border-rose-400/40 text-rose-600 dark:text-rose-400 bg-rose-500/5",
    },
    {
      label: "Unread Notices",
      value: unread > 99 ? "99+" : unread.toString(),
      icon: Bell,
      tone: unread > 0
        ? "border-amber-400/40 text-amber-700 dark:text-amber-300 bg-amber-500/5"
        : "border-slate-300/50 text-slate-600 dark:text-slate-300 bg-slate-500/5",
    },
    {
      label: "Synced",
      value: lastUpdated ? lastUpdated.toLocaleTimeString() : "—",
      icon: RefreshCw,
      tone: "border-slate-200/60 text-slate-600 dark:text-slate-300 bg-slate-500/5",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
      {items.map(({ label, value, icon: Icon, tone }, idx) => (
        <div
          key={label}
          className={cn(
            "group card-professional px-3 py-2 sm:px-4 sm:py-3 flex items-center justify-between gap-3 text-xs sm:text-sm shadow-elevation-1 transition-smooth hover:shadow-elevation-2",
            "border-l-4 border-l-accent/30 animate-fade-in",
            tone
          )}
          style={{ animationDelay: `${idx * 50}ms` }}
        >
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="h-7 px-2 text-[11px] font-semibold bg-white/40 dark:bg-slate-900/40 group-hover:bg-accent/10 transition-smooth">
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:scale-110 transition-smooth" />
            </Badge>
            <div className="leading-tight">
              <p className="text-[10px] sm:text-xs text-muted-foreground body-secondary">{label}</p>
              <p className="font-semibold text-foreground data-value">{value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
