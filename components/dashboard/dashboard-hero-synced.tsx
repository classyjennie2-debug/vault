"use client"

import { ArrowUpRight } from "lucide-react"
import { useDashboard } from "@/contexts/dashboard-context"

export function DashboardHeroSynced() {
  const { stats, metrics, user, isLoading } = useDashboard()

  if (!stats || !metrics || !user) {
    return (
      <div className="h-32 bg-card rounded-lg animate-pulse" />
    )
  }

  const totalBalance = stats.totalBalance
  const monthlyGain = metrics.monthlyGain
  const totalReturnRate = stats.totalReturnRate

  return (
    <div className="w-full mb-3 sm:mb-4 md:mb-6 lg:mb-8">
      {/* Status indicator for updates */}
      {isLoading && (
        <div className="mb-2 px-3 py-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs rounded flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span>Syncing dashboard...</span>
        </div>
      )}

      {/* Main Hero Banner */}
      <div className="relative overflow-hidden rounded-lg sm:rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 shadow-md transition-all duration-300">
        {/* Content */}
        <div className="relative z-10 px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-10 lg:py-12">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6 lg:gap-8">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 sm:mb-2">
                Welcome back,
              </p>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2 line-clamp-2">
                {user.name}
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                Your portfolio is performing exceptionally well. Keep investing and watch your wealth grow!
              </p>
            </div>

            {/* Balance Display - Real-time updates */}
            <div className="hidden md:flex flex-col items-end gap-3 lg:gap-6 flex-shrink-0">
              <div className="text-right">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Total Balance</p>
                <p className="text-3xl lg:text-5xl font-bold text-slate-900 dark:text-white transition-colors duration-300">
                  ${totalBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="flex items-center gap-4 lg:gap-7">
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Monthly Gain</p>
                  <p className="flex items-center justify-end gap-1 text-emerald-600 dark:text-emerald-500 font-semibold text-xs sm:text-sm">
                    <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    {monthlyGain >= 0 ? '+' : ''}
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 2,
                    }).format(monthlyGain)}
                  </p>
                </div>
                <div className="w-px h-8 sm:h-10 bg-slate-300 dark:bg-slate-600" />
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Total Returns</p>
                  <p className="text-slate-900 dark:text-white font-semibold text-xs sm:text-sm">
                    {totalReturnRate >= 0 ? '+' : ''}{totalReturnRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="mt-2 sm:mt-3 md:mt-4 lg:mt-6 grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 lg:gap-4">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 sm:p-3 md:p-4 lg:p-5 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md">
          <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-1">Total Profit</p>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-emerald-600 dark:text-emerald-500 mt-0.5 sm:mt-1.5 transition-colors duration-300">
            ${stats.totalProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1.5 line-clamp-1">From all investments</p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 sm:p-3 md:p-4 lg:p-5 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md">
          <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-1">Active Plans</p>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-primary mt-0.5 sm:mt-1.5 transition-colors duration-300">
            {stats.activeInvestments}
          </p>
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1.5 line-clamp-1">Active investments</p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 sm:p-3 md:p-4 lg:p-5 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md">
          <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-1">ROI</p>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-accent mt-0.5 sm:mt-1.5 transition-colors duration-300">
            {stats.totalInvested > 0 ? ((stats.totalProfit / stats.totalInvested) * 100).toFixed(1) : "0"}%
          </p>
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1.5 line-clamp-1">Return on investment</p>
        </div>
      </div>
    </div>
  )
}
