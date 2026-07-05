"use client"

import React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Wallet,
  TrendingUp,
  Award,
  Zap,
  Clock,
  LogOut,
  ArrowUpRight,
  DollarSign,
} from "lucide-react"

interface DashboardCardsProps {
  totalBalance: number
  totalInvested: number
  totalProfit: number
  availableBalance: number
  activeInvestments: number
  pendingDeposits: number
  totalWithdrawn: number
  monthlyGain?: number
  monthlyReturns?: number
  totalReturnRate?: number
  weeklyChange?: number
}

const gradients = [
  "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-700",
  "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border-purple-200 dark:border-purple-700",
  "bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 border-emerald-200 dark:border-emerald-700",
  "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 border-orange-200 dark:border-orange-700",
  "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 border-amber-200 dark:border-amber-700",
  "bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/30 dark:to-rose-800/30 border-rose-200 dark:border-rose-700",
]

const iconBgColors = [
  "bg-primary/10 dark:bg-primary/20",
  "bg-accent/10 dark:bg-accent/20",
  "bg-emerald-500/10 dark:bg-emerald-500/20",
  "bg-blue-500/10 dark:bg-blue-500/20",
  "bg-amber-500/10 dark:bg-amber-500/20",
  "bg-slate-500/10 dark:bg-slate-500/20",
]

const iconColors = [
  "text-primary",
  "text-accent",
  "text-emerald-600 dark:text-emerald-500",
  "text-blue-600 dark:text-blue-500",
  "text-amber-600 dark:text-amber-500",
  "text-slate-600 dark:text-slate-400",
]

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendColor,
  gradientIndex = 0,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  trend?: string
  trendColor?: string
  gradientIndex?: number
}) {
  return (
    <Card className={`group card-professional overflow-hidden border-l-4 border-l-accent/30 shadow hover:shadow-lg transition-smooth animate-fade-in ${gradients[gradientIndex]}`} style={{ animationDelay: `${(gradientIndex || 0) * 75}ms` }}>
      <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 pt-2 sm:pt-3 px-3 sm:px-4 gap-2">
        <CardTitle className="h-subsection text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 tracking-wide line-clamp-2">
          {label}
        </CardTitle>
        <div className={`p-1 sm:p-1.5 rounded-md flex-shrink-0 transition-smooth group-hover:scale-110 ${iconBgColors[gradientIndex]}`}>
          <Icon className={`h-3 w-3 sm:h-4 sm:w-4 transition-smooth ${iconColors[gradientIndex]}`} />
        </div>
      </CardHeader>
      <CardContent className="pt-0.5 sm:pt-1 pb-2 sm:pb-3 px-3 sm:px-4">
        <p className="data-value text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white leading-tight break-words">
          {value}
        </p>
        {trend && (
          <p className={`text-[10px] sm:text-xs mt-1 sm:mt-2 flex items-center gap-0.5 font-medium body-secondary transition-smooth ${trendColor || "text-slate-600 dark:text-slate-400"}`}>
            {trend.includes("+") && <ArrowUpRight className="h-2 w-2 sm:h-3 sm:w-3 flex-shrink-0" />}
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function DashboardCards({
  totalBalance,
  totalInvested,
  totalProfit,
  availableBalance,
  activeInvestments,
  pendingDeposits,
  totalWithdrawn,
  monthlyGain = 0,
  monthlyReturns = 0,
  totalReturnRate = 0,
  weeklyChange = 0,
}: DashboardCardsProps) {
  const formattedBalance = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(totalBalance)

  const formattedInvested = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(totalInvested)

  const formattedProfit = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(totalProfit)

  const formattedAvailable = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(availableBalance)

  const formattedWithdrawn = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(totalWithdrawn)

  // Format monthly metrics
  const monthlyGainFormatted = monthlyGain >= 0 
    ? `+${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(monthlyGain)}`
    : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(monthlyGain)

  const returnRateFormatted = `${totalReturnRate.toFixed(2)}%`
  const weeklyChangeFormatted = `${weeklyChange >= 0 ? "+" : ""}${weeklyChange.toFixed(2)}%`

  return (
    <div className="grid gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
      <StatCard
        icon={Wallet}
        label="Total Balance"
        value={formattedBalance}
        trend={monthlyGain !== 0 ? `${monthlyGainFormatted} this month` : "No activity this month"}
        trendColor={monthlyGain >= 0 ? "text-emerald-600 dark:text-emerald-500 font-medium" : "text-red-600 dark:text-red-500 font-medium"}
        gradientIndex={0}
      />
      <StatCard
        icon={DollarSign}
        label="Available Balance"
        value={formattedAvailable}
        trend="Ready to withdraw"
        trendColor="text-emerald-600 dark:text-emerald-500 font-medium"
        gradientIndex={1}
      />
      <StatCard
        icon={TrendingUp}
        label="Total Invested"
        value={formattedInvested}
        trend={weeklyChange !== 0 ? `${weeklyChangeFormatted} vs last week` : "Across all plans"}
        trendColor={weeklyChange >= 0 ? "text-emerald-600 dark:text-emerald-500 font-medium" : "text-red-600 dark:text-red-500 font-medium"}
        gradientIndex={2}
      />
      <StatCard
        icon={Award}
        label="Total Profit"
        value={formattedProfit}
        trend={totalReturnRate > 0 ? `${returnRateFormatted} return rate` : "From investments"}
        trendColor={totalReturnRate > 0 ? "text-emerald-600 dark:text-emerald-500 font-medium" : "text-slate-600 dark:text-slate-400"}
        gradientIndex={3}
      />
      <StatCard
        icon={Clock}
        label="Active Investments"
        value={activeInvestments.toString()}
        trend="Currently running"
        gradientIndex={4}
      />
      <StatCard
        icon={LogOut}
        label="Total Withdrawn"
        value={formattedWithdrawn}
        trend="Lifetime total"
        gradientIndex={5}
      />
    </div>
  )
}
