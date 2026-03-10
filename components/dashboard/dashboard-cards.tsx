"use client"

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
} from "lucide-react"

interface DashboardCardsProps {
  totalBalance: number
  totalInvested: number
  totalProfit: number
  activeInvestments: number
  pendingDeposits: number
  totalWithdrawn: number
}

const gradients = [
  "from-blue-500/20 to-cyan-500/20 border-blue-500/30 shadow-lg shadow-blue-500/10",
  "from-purple-500/20 to-pink-500/20 border-purple-500/30 shadow-lg shadow-purple-500/10",
  "from-green-500/20 to-emerald-500/20 border-green-500/30 shadow-lg shadow-green-500/10",
  "from-orange-500/20 to-yellow-500/20 border-orange-500/30 shadow-lg shadow-orange-500/10",
  "from-indigo-500/20 to-blue-500/20 border-indigo-500/30 shadow-lg shadow-indigo-500/10",
  "from-rose-500/20 to-red-500/20 border-rose-500/30 shadow-lg shadow-rose-500/10",
]

const iconBgColors = [
  "bg-blue-500/20",
  "bg-purple-500/20",
  "bg-green-500/20",
  "bg-orange-500/20",
  "bg-indigo-500/20",
  "bg-rose-500/20",
]

const iconColors = [
  "text-blue-600",
  "text-purple-600",
  "text-green-600",
  "text-orange-600",
  "text-indigo-600",
  "text-rose-600",
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
    <Card className={`group bg-gradient-to-br ${gradients[gradientIndex]} border hover:shadow-2xl hover:shadow-current transition-all duration-500 hover:scale-105 backdrop-blur-lg`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <div className={`${iconBgColors[gradientIndex]} p-2.5 rounded-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`h-5 w-5 ${iconColors[gradientIndex]}`} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold bg-gradient-to-r from-card-foreground to-card-foreground/80 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-2 duration-700">
          {value}
        </p>
        {trend && (
          <p className={`text-xs mt-2 flex items-center gap-1 ${trendColor || "text-muted-foreground"}`}>
            {trend.includes("+") && <ArrowUpRight className="h-3 w-3" />}
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
  activeInvestments,
  pendingDeposits,
  totalWithdrawn,
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

  const formattedWithdrawn = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(totalWithdrawn)

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-6 animate-in fade-in slide-in-from-top duration-700">
      <StatCard
        icon={Wallet}
        label="Total Balance"
        value={formattedBalance}
        trend="+$12,450 this month"
        trendColor="text-green-500 font-semibold"
        gradientIndex={0}
      />
      <StatCard
        icon={TrendingUp}
        label="Total Invested"
        value={formattedInvested}
        trend="Across all plans"
        gradientIndex={1}
      />
      <StatCard
        icon={Award}
        label="Total Profit"
        value={formattedProfit}
        trend="From investments"
        trendColor="text-green-500 font-semibold"
        gradientIndex={2}
      />
      <StatCard
        icon={Zap}
        label="Active Investments"
        value={activeInvestments.toString()}
        trend="Currently running"
        gradientIndex={3}
      />
      <StatCard
        icon={Clock}
        label="Pending Deposits"
        value={pendingDeposits.toString()}
        trend="Under review"
        trendColor="text-yellow-600 font-semibold"
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
