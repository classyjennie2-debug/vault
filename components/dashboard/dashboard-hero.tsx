import { ArrowUpRight } from "lucide-react"
import { calculateMonthlyMetrics, calculateReturnRate } from "@/lib/monthly-metrics"

interface DashboardHeroProps {
  user: {
    name: string
    balance: number
    id: string
  }
  stats?: {
    totalInvested: number
    totalProfit: number
    availableBalance: number
    activeInvestments: number
    pendingDeposits: number
  }
}

export async function DashboardHero({ user, stats }: DashboardHeroProps) {
  // Total balance = available balance (wallet) + invested amount + profit earned
  const availableBalance = stats?.availableBalance || 0
  const totalInvested = stats?.totalInvested || 0
  const totalProfit = stats?.totalProfit || 0
  const totalBalance = availableBalance + totalInvested + totalProfit
  
  const activeInvestments = stats?.activeInvestments || 0

  // Calculate actual monthly metrics from user data
  const monthlyMetrics = await calculateMonthlyMetrics(user.id)
  const monthlyGain = monthlyMetrics.monthlyGain

  // Calculate total return rate percentage
  const totalReturnRate = totalInvested > 0 ? calculateReturnRate(totalProfit, totalInvested) : 0

  return (
    <div className="w-full mb-3 sm:mb-4 md:mb-6 lg:mb-8">
      {/* Main Hero Banner - Professional Navy & White Design */}
      <div className="card-professional relative overflow-hidden rounded-lg sm:rounded-xl bg-gradient-to-br from-accent/5 to-accent/10 dark:from-accent/15 dark:to-accent/20 border border-accent/30 shadow-elevation-2 hover:shadow-elevation-3 transition-smooth">

        {/* Content */}
        <div className="relative z-10 px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-10 lg:py-12 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6 lg:gap-8">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground body-secondary mb-1 sm:mb-2">
                Welcome back,
              </p>
              <h1 className="h-section text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-1 sm:mb-2 line-clamp-2">
                {user.name}
              </h1>
              <p className="body-secondary text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl">
                Your portfolio is performing exceptionally well. Keep investing and watch your wealth grow!
              </p>
            </div>

            {/* Balance Display - Hidden on mobile, shown on md and up */}
            <div className="hidden md:flex flex-col items-end gap-3 lg:gap-6 flex-shrink-0">
              <div className="text-right">
                <p className="text-xs font-medium text-muted-foreground body-secondary mb-1">Total Balance</p>
                <p className="data-value text-3xl lg:text-5xl font-bold text-foreground">
                  ${totalBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="flex items-center gap-4 lg:gap-7">
                <div className="text-right group hover:bg-accent/5 p-2 rounded-md transition-smooth">
                  <p className="text-xs font-medium text-muted-foreground body-secondary mb-1">Monthly Gain</p>
                  <p className="flex items-center justify-end gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-xs sm:text-sm data-value">
                    <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    {monthlyGain >= 0 ? '+' : ''}{monthlyGain > 0 ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(monthlyGain) : '$0.00'}
                  </p>
                </div>
                <div className="w-px h-8 sm:h-10 bg-accent/30" />
                <div className="text-right group hover:bg-accent/5 p-2 rounded-md transition-smooth">
                  <p className="text-xs font-medium text-muted-foreground body-secondary mb-1">Total Returns</p>
                  <p className="text-foreground font-semibold text-xs sm:text-sm data-value">{totalReturnRate >= 0 ? '+' : ''}{totalReturnRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar - Professional Minimal Design */}
      <div className="mt-2 sm:mt-3 md:mt-4 lg:mt-6 grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 lg:gap-4 animate-fade-in" style={{ animationDelay: "100ms" }}>
        <div className="card-professional bg-white dark:bg-slate-800 border-l-4 border-l-emerald-500/40 p-2 sm:p-3 md:p-4 lg:p-5 shadow-elevation-1 hover:shadow-elevation-2 transition-smooth group">
          <p className="text-[10px] sm:text-xs font-medium text-muted-foreground body-secondary line-clamp-1">Total Profit</p>
          <p className="data-value text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-emerald-600 dark:text-emerald-500 mt-0.5 sm:mt-1.5 group-hover:scale-105 transition-smooth">${(totalProfit).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground body-secondary mt-0.5 sm:mt-1.5 line-clamp-1">From all investments</p>
        </div>

        <div className="card-professional bg-white dark:bg-slate-800 border-l-4 border-l-accent/40 p-2 sm:p-3 md:p-4 lg:p-5 shadow-elevation-1 hover:shadow-elevation-2 transition-smooth group">
          <p className="text-[10px] sm:text-xs font-medium text-muted-foreground body-secondary line-clamp-1">Active Plans</p>
          <p className="data-value text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-accent mt-0.5 sm:mt-1.5 group-hover:scale-105 transition-smooth">{activeInvestments}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground body-secondary mt-0.5 sm:mt-1.5 line-clamp-1">Active investments</p>
        </div>

        <div className="card-professional bg-white dark:bg-slate-800 border-l-4 border-l-accent/40 p-2 sm:p-3 md:p-4 lg:p-5 shadow-elevation-1 hover:shadow-elevation-2 transition-smooth group">
          <p className="text-[10px] sm:text-xs font-medium text-muted-foreground body-secondary line-clamp-1">ROI</p>
          <p className="data-value text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-accent mt-0.5 sm:mt-1.5 group-hover:scale-105 transition-smooth">{totalProfit >= 0 ? ((totalProfit / Math.max(totalBalance, 1)) * 100).toFixed(1) : "0"}%</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground body-secondary mt-0.5 sm:mt-1.5 line-clamp-1">Return on investment</p>
        </div>
      </div>
    </div>
  )
}
