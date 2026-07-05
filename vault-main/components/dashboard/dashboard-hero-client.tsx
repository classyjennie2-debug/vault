"use client"

import { ArrowUpRight } from "lucide-react"
import { useBalancePolling } from "@/hooks/use-balance-polling"
import { useState, useEffect } from "react"

interface DashboardHeroClientProps {
  user: {
    name: string
    balance: number
    id: string
  }
  initialStats?: {
    totalInvested: number
    totalProfit: number
    availableBalance: number
    activeInvestments: number
    pendingDeposits: number
  }
  monthlyGain?: number
  totalReturnRate?: number
}

export function DashboardHeroClient({
  user,
  initialStats,
  monthlyGain = 0,
  totalReturnRate = 0,
}: DashboardHeroClientProps) {
  const { balance, totalInvested, totalProfit, availableBalance, stats: polledStats, isLoading } = useBalancePolling(5000)
  const [displayBalance, setDisplayBalance] = useState(user.balance)
  const [displayTotalInvested, setDisplayTotalInvested] = useState(initialStats?.totalInvested || 0)
  const [displayTotalProfit, setDisplayTotalProfit] = useState(initialStats?.totalProfit || 0)
  const [displayAvailableBalance, setDisplayAvailableBalance] = useState(initialStats?.availableBalance || 0)
  const [displayActiveInvestments, setDisplayActiveInvestments] = useState(initialStats?.activeInvestments || 0)
  const [displayMonthlyGain, setDisplayMonthlyGain] = useState(monthlyGain)
  const [displayReturnRate, setDisplayReturnRate] = useState(totalReturnRate)

  // Update display values when polled stats change
  useEffect(() => {
    if (polledStats) {
      if (polledStats.balance !== displayBalance) {
        console.log(`[Dashboard] Balance updated: $${displayBalance} → $${polledStats.balance}`)
        setDisplayBalance(polledStats.balance)
      }
      if (polledStats.totalInvested !== displayTotalInvested) {
        setDisplayTotalInvested(polledStats.totalInvested)
      }
      if (polledStats.totalProfit !== displayTotalProfit) {
        setDisplayTotalProfit(polledStats.totalProfit)
        // Recalculate ROI percentage
        const totalBal = displayAvailableBalance + polledStats.totalInvested + polledStats.totalProfit
        if (totalBal > 0) {
          setDisplayReturnRate((polledStats.totalProfit / totalBal) * 100)
        }
      }
      if (polledStats.availableBalance !== displayAvailableBalance) {
        setDisplayAvailableBalance(polledStats.availableBalance)
      }
    }
  }, [polledStats, displayBalance, displayTotalInvested, displayTotalProfit, displayAvailableBalance])

  // Calculate total balance
  const totalBalance = displayAvailableBalance + displayTotalInvested + displayTotalProfit
  const roi = displayTotalInvested > 0 ? ((displayTotalProfit / totalBalance) * 100).toFixed(1) : "0"

  return (
    <div className="w-full mb-3 sm:mb-4 md:mb-6 lg:mb-8">
      {/* Status indicator for balance updates */}
      {isLoading && (
        <div className="mb-2 px-3 py-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs rounded flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          Updating balance...
        </div>
      )}

      {/* Main Hero Banner - Professional Navy & White Design */}
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

            {/* Balance Display - Real-time updates - Hidden on mobile, shown on md and up */}
            <div className="hidden md:flex flex-col items-end gap-3 lg:gap-6 flex-shrink-0">
              <div className="text-right">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Total Balance</p>
                <p className={`text-3xl lg:text-5xl font-bold transition-colors duration-300 ${
                  polledStats && polledStats.balance !== user.balance
                    ? "text-emerald-600 dark:text-emerald-500"
                    : "text-slate-900 dark:text-white"
                }`}>
                  ${totalBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="flex items-center gap-4 lg:gap-7">
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Monthly Gain</p>
                  <p className="flex items-center justify-end gap-1 text-emerald-600 dark:text-emerald-500 font-semibold text-xs sm:text-sm">
                    <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    {displayMonthlyGain >= 0 ? '+' : ''}
                    {displayMonthlyGain > 0
                      ? new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                          minimumFractionDigits: 2,
                        }).format(displayMonthlyGain)
                      : "$0.00"}
                  </p>
                </div>
                <div className="w-px h-8 sm:h-10 bg-slate-300 dark:bg-slate-600" />
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Total Returns</p>
                  <p className="text-slate-900 dark:text-white font-semibold text-xs sm:text-sm">
                    {displayReturnRate >= 0 ? '+' : ''}{displayReturnRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar - Professional Minimal Design with Real-time Updates */}
      <div className="mt-2 sm:mt-3 md:mt-4 lg:mt-6 grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 lg:gap-4">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 sm:p-3 md:p-4 lg:p-5 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md">
          <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-1">Total Profit</p>
          <p className={`text-base sm:text-lg md:text-xl lg:text-2xl font-bold mt-0.5 sm:mt-1.5 transition-colors duration-300 ${
            polledStats && polledStats.totalProfit !== initialStats?.totalProfit
              ? "text-emerald-600 dark:text-emerald-500"
              : "text-emerald-600 dark:text-emerald-500"
          }`}>
            ${displayTotalProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1.5 line-clamp-1">From all investments</p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 sm:p-3 md:p-4 lg:p-5 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md">
          <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-1">Active Plans</p>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-primary mt-0.5 sm:mt-1.5">{displayActiveInvestments}</p>
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1.5 line-clamp-1">Active investments</p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 sm:p-3 md:p-4 lg:p-5 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md">
          <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-1">ROI</p>
          <p className={`text-base sm:text-lg md:text-xl lg:text-2xl font-bold mt-0.5 sm:mt-1.5 transition-colors duration-300 ${
            polledStats && polledStats.totalProfit !== initialStats?.totalProfit
              ? "text-accent"
              : "text-accent"
          }`}>
            {displayTotalProfit >= 0 ? roi : "0"}%
          </p>
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1.5 line-clamp-1">Return on investment</p>
        </div>
      </div>
    </div>
  )
}
