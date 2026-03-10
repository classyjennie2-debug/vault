"use client"

import { ArrowUpRight, ArrowDownRight } from "lucide-react"

interface DashboardHeroProps {
  user: {
    name: string
    balance: number
  }
}

export function DashboardHero({ user }: DashboardHeroProps) {
  const totalBalance = user.balance

  return (
    <div className="w-full mb-8 animate-in fade-in slide-in-from-top duration-700">
      {/* Main Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/90 via-purple-600/90 to-pink-600/90 backdrop-blur-xl border border-white/10 shadow-2xl">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        {/* Content */}
        <div className="relative z-10 px-8 py-10">
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1">
              <p className="text-white/80 text-sm font-medium mb-2">
                Welcome back,
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                @{user.name}
              </h1>
              <p className="text-white/70 text-lg max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                Your portfolio is performing exceptionally well. Keep investing and watch your wealth grow!
              </p>
            </div>

            {/* Balance Display */}
            <div className="hidden md:flex flex-col items-end gap-4 animate-in fade-in slide-in-from-right duration-700 delay-300">
              <div className="text-right">
                <p className="text-white/70 text-sm font-medium mb-1">Total Balance</p>
                <p className="text-5xl font-bold text-white">
                  ${totalBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-white/70 text-xs mb-1">Monthly Gain</p>
                  <p className="flex items-center gap-1 text-green-300 font-semibold">
                    <ArrowUpRight className="h-4 w-4" />
                    +$12,450
                  </p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-right">
                  <p className="text-white/70 text-xs mb-1">Total Returns</p>
                  <p className="text-white font-semibold">+25.8%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4 backdrop-blur-lg hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300">
          <p className="text-xs text-muted-foreground">Today's Profit</p>
          <p className="text-xl font-bold text-green-500 mt-1">+$287</p>
          <p className="text-xs text-green-500/70 mt-1">+0.6% today</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-4 backdrop-blur-lg hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
          <p className="text-xs text-muted-foreground">Active Plans</p>
          <p className="text-xl font-bold text-blue-500 mt-1">3</p>
          <p className="text-xs text-blue-500/70 mt-1">$35,000 invested</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4 backdrop-blur-lg hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
          <p className="text-xs text-muted-foreground">Next Maturity</p>
          <p className="text-xl font-bold text-purple-500 mt-1">7 days</p>
          <p className="text-xs text-purple-500/70 mt-1">$1,280 incoming</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border border-orange-500/30 rounded-xl p-4 backdrop-blur-lg hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300">
          <p className="text-xs text-muted-foreground">Success Rate</p>
          <p className="text-xl font-bold text-orange-500 mt-1">100%</p>
          <p className="text-xs text-orange-500/70 mt-1">All investments active</p>
        </div>
      </div>
    </div>
  )
}
