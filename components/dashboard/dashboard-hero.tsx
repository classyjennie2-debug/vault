"use client"

import { ArrowUpRight } from "lucide-react"

interface DashboardHeroProps {
  user: {
    name: string
    balance: number
  }
  stats?: {
    totalInvested: number
    totalProfit: number
    activeInvestments: number
    pendingDeposits: number
  }
}

export function DashboardHero({ user, stats }: DashboardHeroProps) {
  const totalBalance = user.balance
  const activeInvestments = stats?.activeInvestments || 0
  const totalProfit = stats?.totalProfit || 0

  return (
    <div className="w-full mb-8 animate-in fade-in slide-in-from-top duration-700">
      {/* Main Hero Banner - Professional Navy & White Design */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
        {/* Subtle accent gradient overlay */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute -top-32 right-0 w-64 h-64 bg-gradient-to-l from-primary/10 to-transparent blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-r from-accent/10 to-transparent blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 px-8 py-12 md:px-12 md:py-14">
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
                Welcome back,
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                {user.name}
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                Your portfolio is performing exceptionally well. Keep investing and watch your wealth grow!
              </p>
            </div>

            {/* Balance Display */}
            <div className="hidden md:flex flex-col items-end gap-6 animate-in fade-in slide-in-from-right duration-700 delay-300">
              <div className="text-right">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Total Balance</p>
                <p className="text-5xl font-bold text-slate-900 dark:text-white">
                  ${totalBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="flex items-center gap-7">
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Monthly Gain</p>
                  <p className="flex items-center gap-1 text-emerald-600 dark:text-emerald-500 font-semibold text-sm">
                    <ArrowUpRight className="h-4 w-4" />
                    +$12,450
                  </p>
                </div>
                <div className="w-px h-10 bg-slate-300 dark:bg-slate-600" />
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Total Returns</p>
                  <p className="text-slate-900 dark:text-white font-semibold text-sm">+25.8%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar - Professional Minimal Design */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Profit</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-500 mt-2">${(totalProfit).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">From all investments</p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Plans</p>
          <p className="text-2xl font-bold text-primary mt-2">{activeInvestments}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Active investments</p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">ROI</p>
          <p className="text-2xl font-bold text-accent mt-2">{totalProfit >= 0 ? ((totalProfit / Math.max(totalBalance, 1)) * 100).toFixed(1) : "0"}%</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Return on investment</p>
        </div>
      </div>
    </div>
  )
}
