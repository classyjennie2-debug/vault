"use client"

import { useDashboard } from "@/contexts/dashboard-context"
import {
  TrendingUp,
  Target,
  PieChart,
  Zap,
} from "lucide-react"

export function DashboardCardsSynced() {
  const { stats, metrics } = useDashboard()

  if (!stats || !metrics) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 lg:gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card rounded-lg p-3 md:p-4 animate-pulse h-24" />
        ))}
      </div>
    )
  }

  const cards = [
    {
      icon: TrendingUp,
      label: "Total Invested",
      value: `$${stats.totalInvested.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      change: "+12.5%",
      color: "text-blue-600 dark:text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      icon: Target,
      label: "Available Balance",
      value: `$${stats.availableBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      change: stats.pendingDeposits > 0 ? `${stats.pendingDeposits} pending` : "All verified",
      color: "text-emerald-600 dark:text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-950",
    },
    {
      icon: PieChart,
      label: "Weekly Change",
      value: `${metrics.weeklyChange.toFixed(2)}%`,
      change: metrics.weeklyChange >= 0 ? "↑ Positive" : "↓ Negative",
      color: "text-amber-600 dark:text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-950",
    },
    {
      icon: Zap,
      label: "Pending Deposits",
      value: stats.pendingDeposits.toString(),
      change: `${stats.totalWithdrawn > 0 ? stats.totalWithdrawn : 0} withdrawn`,
      color: "text-purple-600 dark:text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 lg:gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <div
            key={index}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 md:p-4 lg:p-5 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md"
          >
            <div className={`${card.bgColor} w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center mb-2 md:mb-3`}>
              <Icon className={`${card.color} w-5 h-5 md:w-6 md:h-6`} />
            </div>
            <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-1">
              {card.label}
            </p>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mt-0.5 sm:mt-1.5 transition-colors duration-300 line-clamp-1">
              {card.value}
            </p>
            <p className={`text-[9px] sm:text-xs ${card.color} mt-1 sm:mt-1.5 line-clamp-1`}>
              {card.change}
            </p>
          </div>
        )
      })}
    </div>
  )
}
