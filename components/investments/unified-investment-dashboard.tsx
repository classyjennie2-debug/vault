"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InvestmentPlan, ActiveInvestment } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { InvestmentForm } from "@/components/investments/investment-form"
import { InvestmentCalculator } from "@/components/investments/investment-calculator"
import { ActiveInvestmentsTable } from "@/components/investments/active-investments-table"
import { PortfolioPerformanceChart } from "@/components/investments/portfolio-performance-chart"
import {
  Shield,
  TrendingUp,
  Zap,
  Calculator,
  BarChart3,
  Target,
  DollarSign,
  Clock,
  Star
} from "lucide-react"
import { getPlanDisplayRate } from "@/lib/investment-utils"
import { TrustBadges, ComplianceFooter } from "@/components/ui/trust-badges"

interface UnifiedInvestmentDashboardProps {
  plans: InvestmentPlan[] | null | undefined
  investments: ActiveInvestment[] | null | undefined
}

export function UnifiedInvestmentDashboard({ plans = [], investments = [] }: UnifiedInvestmentDashboardProps) {
  const safePlans = Array.isArray(plans) ? plans : []
  const safeInvestments = Array.isArray(investments) ? investments : []
  
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("plans")
  const router = useRouter()

  const calculateProgress = (startDate: string, endDate: string, status: string, providedProgress?: number): number => {
    // If progress is provided from the server calculation, use it
    if (providedProgress !== undefined && providedProgress >= 0) {
      return providedProgress
    }
    
    // Fallback to client-side calculation
    if (status === "completed") return 100
    if (status === "withdrawn") return 100
    
    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime()
    const now = new Date().getTime()
    
    if (now <= start) return 0
    if (now >= end) return 100
    
    const progress = ((now - start) / (end - start)) * 100
    return Math.min(100, Math.max(0, Math.round(progress)))
  }

  const formatDate = (date: string) => {
    if (!date) return "N/A"
    try {
      const dateObj = new Date(date)
      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        return "Invalid date"
      }
      return dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch (error) {
      return "Invalid date"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "bg-green-500/20 text-green-700 border-green-500/30"
      case "Medium":
        return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30"
      case "High":
        return "bg-red-500/20 text-red-700 border-red-500/30"
      default:
        return ""
    }
  }

  const formatDuration = (duration: number, unit: string) => {
    return `${duration} ${unit}`
  }

  const isPopular = (index: number) => index === 1

  const calculateROI = (investment: ActiveInvestment): number => {
    // ROI as percentage: (profit / initial amount) * 100
    const amount = investment.amount || 1
    const profit = investment.expectedProfit || 0
    return (profit / amount) * 100
  }

  const calculateAnnualizedROI = (investment: ActiveInvestment): number => {
    // Annualized ROI accounts for time: shows what the return would be if extended to a full year
    const amount = investment.amount || 1
    const profit = investment.expectedProfit || 0
    
    if (amount <= 0 || profit <= 0) return 0
    
    const simpleROI = (profit / amount) * 100
    
    // Calculate investment duration in years
    const startDate = new Date(investment.startDate).getTime()
    const endDate = new Date(investment.endDate).getTime()
    const durationMs = endDate - startDate
    const durationYears = durationMs / (365.25 * 24 * 60 * 60 * 1000)
    
    if (durationYears <= 0 || isNaN(durationYears)) return simpleROI
    // Annualized = simple ROI / (actual duration in years)
    const annualized = simpleROI / durationYears
    return isNaN(annualized) ? simpleROI : annualized
  }

  const totalInvested = safeInvestments.reduce((sum, inv) => sum + (inv?.amount || 0), 0)
  // Use ONLY accumulated profit (not expected)
  const totalAccumulatedProfit = safeInvestments.reduce((sum, inv) => {
    const accumulated = (inv as any)?.accumulatedProfit || 0
    return sum + accumulated
  }, 0)

  return (
    <div className="space-y-6 sm:space-y-8 min-h-screen">
      {/* Header Section - Mobile Responsive */}
      <div className="text-center space-y-3 sm:space-y-4 px-2 pt-4">
        <div className="inline-block">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-card-foreground bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent font-serif">
            Investment Dashboard
          </h1>
          <div className="h-1 w-16 bg-gradient-to-r from-primary to-accent mx-auto mt-3 rounded-full" />
        </div>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover, calculate, and manage your investments all in one place
        </p>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto mt-8">
          <Card className="bg-primary/5 border-primary/20 hover:shadow-md transition-all duration-300 overflow-hidden">
            <CardContent className="p-4 sm:p-6 text-center relative">
              <DollarSign className="h-6 sm:h-8 w-6 sm:w-8 text-primary mx-auto mb-2" />
              <p className="text-lg sm:text-2xl font-bold text-card-foreground">
                ${totalInvested.toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">Total Invested</p>
            </CardContent>
          </Card>

          <Card className="bg-success/5 border-success/20 hover:shadow-md transition-all duration-300 overflow-hidden">
            <CardContent className="p-4 sm:p-6 text-center relative">
              <TrendingUp className="h-6 sm:h-8 w-6 sm:w-8 text-success mx-auto mb-2" />
              <p className="text-lg sm:text-2xl font-bold text-success">
                +${totalAccumulatedProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-muted-foreground">Accumulated Profit</p>
            </CardContent>
          </Card>

          <Card className="bg-accent/5 border-accent/20 hover:shadow-md transition-all duration-300 overflow-hidden">
            <CardContent className="p-4 sm:p-6 text-center relative">
              <Target className="h-6 sm:h-8 w-6 sm:w-8 text-accent mx-auto mb-2" />
              <p className="text-lg sm:text-2xl font-bold text-card-foreground">
                {safeInvestments.length}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">Active Investments</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Trust Badges */}
      <TrustBadges />

      {/* Main Content Tabs - Mobile Responsive */}
      <Card className="border-0 shadow-lg bg-card overflow-hidden">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col">
            {/* Tab Navigation */}
            <div className="border-b border-border px-3 sm:px-6 pt-3 sm:pt-6 relative z-50 pointer-events-auto">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 relative z-50">
                <TabsTrigger
                  value="plans"
                  className="text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 cursor-pointer"
                >
                  <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Investment Plans</span>
                  <span className="sm:hidden">Plans</span>
                </TabsTrigger>
                <TabsTrigger
                  value="active-investments"
                  className="text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 cursor-pointer"
                >
                  <Target className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Active Investments</span>
                  <span className="sm:hidden">Active</span>
                </TabsTrigger>
                <TabsTrigger
                  value="calculator"
                  className="text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 cursor-pointer"
                >
                  <Calculator className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Calculator</span>
                  <span className="sm:hidden">Calc</span>
                </TabsTrigger>
                <TabsTrigger
                  value="portfolio"
                  className="text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 cursor-pointer"
                >
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Portfolio</span>
                  <span className="sm:hidden">Port</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Investment Plans Tab */}
            <TabsContent value="plans" className="p-3 sm:p-6 relative z-0">
              <div className="space-y-6 sm:space-y-8">
                <div className="text-center px-2 space-y-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-card-foreground">
                    Choose Your Investment Plan
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
                    Select from our carefully curated investment options tailored to your goals
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {safePlans.map((plan, index) => (
                    <Dialog key={plan.id} open={selectedPlan === plan.id} onOpenChange={(open) => {
                      if (open) setSelectedPlan(plan.id)
                      else setSelectedPlan(null)
                    }}>
                      <div className="relative group h-full">
                        {/* Popular Badge */}
                        {isPopular(index) && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg shadow-purple-600/50 text-xs font-bold px-3 py-1.5 animate-pulse">
                              <Star className="h-3 w-3 mr-1" />
                              Most Popular
                            </Badge>
                          </div>
                        )}

                        <Card 
                          onClick={() => setSelectedPlan(plan.id)}
                          className={`h-full flex flex-col bg-card border-2 border-border transition-all duration-300 relative overflow-hidden cursor-pointer ${isPopular(index) ? "ring-2 ring-primary/40 shadow-lg" : "hover:border-border/80 hover:shadow-md"}`}>

                          <CardHeader className="pb-3 sm:pb-4">
                            <div className="flex items-start justify-between gap-2 sm:gap-3">
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-base sm:text-lg leading-tight text-card-foreground">{plan.name}</CardTitle>
                                <Badge className={`mt-2 text-xs ${getRiskColor(plan.risk)}`}>
                                  {plan.risk} Risk
                                </Badge>
                              </div>
                              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground/50 flex-shrink-0" />
                            </div>
                          </CardHeader>

                          <CardContent className="flex-1 flex flex-col gap-3 sm:gap-4">
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 group-hover:text-card-foreground/80 transition-colors">
                              {plan.description}
                            </p>

                            <div className="grid grid-cols-2 gap-3 text-center">
                              <div className="bg-muted/50 rounded-lg p-3 border border-border">
                                <p className="text-xs text-muted-foreground">Min</p>
                                <p className="text-base sm:text-lg font-bold text-card-foreground">
                                  ${(plan.minAmount || 0).toLocaleString()}
                                </p>
                              </div>
                              <div className="bg-muted/50 rounded-lg p-3 border border-border">
                                <p className="text-xs text-muted-foreground">Max</p>
                                <p className="text-base sm:text-lg font-bold text-card-foreground">
                                  ${(plan.maxAmount || 0).toLocaleString()}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-sm pt-2 border-t border-white/5">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>{formatDuration(plan.duration, plan.durationUnit)}</span>
                              </div>
                              <div className="flex items-center gap-1 text-accent font-bold">
                                <TrendingUp className="h-4 w-4" />
                                {getPlanDisplayRate(plan.planType || "Conservative Bond Fund").toFixed(2)}%
                              </div>
                            </div>

                            <DialogTrigger asChild className="mt-auto pt-2">
                              <Button
                                className={`w-full font-semibold transition-all duration-300 ${
                                  isPopular(index)
                                    ? "bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg"
                                    : ""
                                }`}
                                size="sm"
                              >
                                <Zap className="h-4 w-4 mr-2" />
                                Invest Now
                              </Button>
                            </DialogTrigger>
                          </CardContent>
                        </Card>
                      </div>

                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Invest in {plan.name}</DialogTitle>
                        </DialogHeader>
                        <InvestmentForm
                          plan={plan}
                          onSuccess={() => {
                            setSelectedPlan(null)
                            router.refresh()
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Active Investments Tab */}
            <TabsContent value="active-investments" className="p-3 sm:p-6 relative z-0">
              <div className="space-y-6 sm:space-y-8">
                {/* Investment Cards - Differentiated View */}
                {safeInvestments.length > 0 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h2 className="text-xl sm:text-2xl font-bold text-card-foreground">
                        Your Active Investments
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Track and monitor your ongoing investment positions
                      </p>
                    </div>
                    <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      {safeInvestments.map((inv, idx) => {
                        const progress = calculateProgress(inv.startDate, inv.endDate, inv.status, inv.progressPercentage)
                        const progressSafe = Math.max(0, Math.min(100, isNaN(progress) ? 0 : progress))
                        
                        // Assign unique colors based on index
                        const colorSchemes = [
                          { bg: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30", text: "text-blue-700 dark:text-blue-300", progress: "from-blue-500 to-cyan-500", icon: "bg-blue-500/20" },
                          { bg: "from-purple-500/20 to-pink-500/20", border: "border-purple-500/30", text: "text-purple-700 dark:text-purple-300", progress: "from-purple-500 to-pink-500", icon: "bg-purple-500/20" },
                          { bg: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/30", text: "text-emerald-700 dark:text-emerald-300", progress: "from-emerald-500 to-teal-500", icon: "bg-emerald-500/20" },
                          { bg: "from-amber-500/20 to-orange-500/20", border: "border-amber-500/30", text: "text-amber-700 dark:text-amber-300", progress: "from-amber-500 to-orange-500", icon: "bg-amber-500/20" },
                          { bg: "from-rose-500/20 to-red-500/20", border: "border-rose-500/30", text: "text-rose-700 dark:text-rose-300", progress: "from-rose-500 to-red-500", icon: "bg-rose-500/20" },
                          { bg: "from-indigo-500/20 to-blue-500/20", border: "border-indigo-500/30", text: "text-indigo-700 dark:text-indigo-300", progress: "from-indigo-500 to-blue-500", icon: "bg-indigo-500/20" },
                        ]
                        const colors = colorSchemes[idx % colorSchemes.length]

                        return (
                          <Card
                            key={inv.id}
                            className={`bg-gradient-to-br ${colors.bg} border-2 ${colors.border} hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col`}
                          >
                            <CardHeader className="pb-3 flex flex-row items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <CardTitle className={`text-base ${colors.text}`}>{inv.planName}</CardTitle>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                  {formatDate(inv.startDate)} – {formatDate(inv.endDate)}
                                </p>
                              </div>
                              <div className={`flex-shrink-0 h-10 w-10 rounded-lg ${colors.icon} flex items-center justify-center`}>
                                <DollarSign className={`h-5 w-5 ${colors.text}`} />
                              </div>
                            </CardHeader>

                            <CardContent className="space-y-4 flex-1 flex flex-col">
                              {/* Amount & Accumulated Profit */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-black/5 dark:bg-white/5 rounded-lg p-3 border border-black/10 dark:border-white/10">
                                  <p className="text-xs text-muted-foreground mb-1">Amount</p>
                                  <p className={`text-base font-bold ${colors.text}`}>
                                    ${(inv.amount || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                  </p>
                                </div>
                                <div className="bg-black/5 dark:bg-white/5 rounded-lg p-3 border border-black/10 dark:border-white/10">
                                  <p className="text-xs text-muted-foreground mb-1">Accumulated</p>
                                  <p className="text-base font-bold text-green-600 dark:text-green-400">
                                    +${((inv as any).accumulatedProfit || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                  </p>
                                </div>
                              </div>

                              {/* Progress Bar */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-semibold text-muted-foreground">Progress</p>
                                  <p className={`text-sm font-bold ${colors.text}`}>{progressSafe}%</p>
                                </div>
                                <div className="relative h-2.5 bg-slate-200/30 dark:bg-slate-700/30 rounded-full overflow-hidden border border-slate-300/20 dark:border-slate-600/20">
                                  <div
                                    className={`h-full bg-gradient-to-r ${colors.progress} rounded-full transition-all duration-700 ease-out shadow-lg shadow-current/20`}
                                    style={{ width: `${progressSafe}%` }}
                                  />
                                </div>
                              </div>

                              {/* ROI */}
                              <div className="bg-black/5 dark:bg-white/5 rounded-lg p-3 border border-black/10 dark:border-white/10 mt-auto">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">Simple ROI</p>
                                    <p className={`text-base font-bold ${colors.text}`}>
                                      {isNaN(calculateROI(inv)) ? '0' : calculateROI(inv).toFixed(2)}%
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">Annualized</p>
                                    <p className="text-base font-bold text-green-600 dark:text-green-400">
                                      {isNaN(calculateAnnualizedROI(inv)) ? '0' : calculateAnnualizedROI(inv).toFixed(2)}%
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Status Badge */}
                              <Badge className={`w-fit capitalize ${colors.text} bg-transparent border border-current/30 hover:bg-current/10 transition-all`}>
                                {inv.status}
                              </Badge>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                )}

                {safeInvestments.length === 0 && (
                  <div className="text-center py-12 sm:py-16 px-2">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                      <Target className="h-8 w-8 text-primary/60" />
                    </div>
                    <h3 className="text-lg font-semibold text-card-foreground mb-2">No Active Investments</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                      You don't have any active investments yet. Start by choosing a plan from the Investment Plans tab to begin growing your portfolio.
                    </p>
                    <Button onClick={() => setActiveTab("plans")} className="hover:scale-105 transition-transform duration-300">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Investment Plans
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Calculator Tab */}
            <TabsContent value="calculator" className="p-3 sm:p-6 relative z-0">
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="text-center space-y-3 px-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-card-foreground">
                    Investment Calculator
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Calculate potential returns and plan your investment strategy
                  </p>
                </div>
                <InvestmentCalculator />
              </div>
            </TabsContent>

            {/* Portfolio Tab */}
            <TabsContent value="portfolio" className="p-3 sm:p-6 relative z-0">
              <div className="space-y-6 sm:space-y-8">
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-card-foreground">
                    Portfolio Performance
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Analyze your investment performance and growth over time
                  </p>
                </div>

                {safeInvestments.length > 0 ? (
                  <>
                    {/* Portfolio Performance Chart */}
                    <Card className="bg-card border-border hover:shadow-md transition-all duration-300">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <TrendingUp className="h-5 w-5 text-accent" />
                          Portfolio Value Over Time
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <PortfolioPerformanceChart investments={safeInvestments} />
                      </CardContent>
                    </Card>

                    {/* Portfolio Stats Grid */}
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                      <Card className="bg-primary/5 border-primary/20 hover:shadow-md transition-all duration-300">
                        <CardContent className="p-6">
                          <p className="text-sm text-muted-foreground mb-3">Total Invested Amount</p>
                          <p className="text-2xl font-bold text-primary">
                            ${totalInvested.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">{safeInvestments.length} active {safeInvestments.length === 1 ? 'position' : 'positions'}</p>
                        </CardContent>
                      </Card>

                      <Card className="bg-success/5 border-success/20 hover:shadow-md transition-all duration-300">
                        <CardContent className="p-6">
                          <p className="text-sm text-muted-foreground mb-3">Accumulated Profit</p>
                          <p className="text-2xl font-bold text-success">
                            +${totalAccumulatedProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-success/70 mt-2">
                            {totalInvested > 0 ? ((totalAccumulatedProfit / Math.max(totalInvested, 1)) * 100).toFixed(1) : '0'}% return on investment
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      <Card className="bg-primary/5 border-primary/20 hover:shadow-md transition-all duration-300 overflow-hidden">
                        <CardContent className="p-6 relative">
                          <h3 className="font-semibold text-card-foreground mb-2">Ready to Invest More?</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Explore our investment plans and grow your portfolio further
                          </p>
                          <Button onClick={() => setActiveTab("plans")} className="w-full">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            View Investment Plans
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="bg-accent/5 border-accent/20 hover:shadow-md transition-all duration-300 overflow-hidden">
                        <CardContent className="p-6 relative">
                          <h3 className="font-semibold text-card-foreground mb-2">View Your Positions</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Review detailed analytics of all your active investment positions
                          </p>
                          <Button onClick={() => setActiveTab("active-investments")} variant="outline" className="w-full">
                            <Target className="h-4 w-4 mr-2" />
                            View Active Investments
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 sm:py-16 px-2">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-accent/10 mb-4">
                      <TrendingUp className="h-8 w-8 text-accent/60" />
                    </div>
                    <h3 className="text-lg font-semibold text-card-foreground mb-2">No Portfolio Data</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                      Start by investing in one of our plans to build your portfolio and see performance analytics.
                    </p>
                    <Button onClick={() => setActiveTab("plans")} className="hover:scale-105 transition-transform duration-300">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Investment Plans
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Compliance Footer */}
      <ComplianceFooter />
    </div>
  )
}