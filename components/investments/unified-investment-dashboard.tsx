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

  const calculateProgress = (startDate: string, endDate: string, status: string): number => {
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

  const getBgGradient = (index: number) => {
    const gradients = [
      "from-blue-500/10 to-cyan-500/10 border-blue-500/20",
      "from-purple-500/10 to-pink-500/10 border-purple-500/20",
      "from-green-500/10 to-emerald-500/10 border-green-500/20",
      "from-orange-500/10 to-yellow-500/10 border-orange-500/20",
      "from-indigo-500/10 to-blue-500/10 border-indigo-500/20",
    ]
    return gradients[index % gradients.length]
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
    const simpleROI = (profit / amount) * 100
    
    // Calculate investment duration in years
    const startDate = new Date(investment.startDate).getTime()
    const endDate = new Date(investment.endDate).getTime()
    const durationMs = endDate - startDate
    const durationYears = durationMs / (365.25 * 24 * 60 * 60 * 1000)
    
    if (durationYears <= 0) return 0
    // Annualized = simple ROI * (365.25 days / actual duration days)
    return simpleROI / durationYears
  }

  const totalInvested = safeInvestments.reduce((sum, inv) => sum + (inv?.amount || 0), 0)
  // Use accumulated profit if available, otherwise use expected profit
  const totalReturns = safeInvestments.reduce((sum, inv) => {
    const accumulated = (inv as any)?.accumulatedProfit
    return sum + (accumulated != null ? accumulated : (inv?.expectedProfit || 0))
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto mt-6 sm:mt-8">
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 hover:shadow-lg hover:border-blue-500/40 transition-all duration-300 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="p-4 sm:p-6 text-center relative">
              <DollarSign className="h-6 sm:h-8 w-6 sm:w-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
              <p className="text-lg sm:text-2xl font-bold text-card-foreground">
                ${totalInvested.toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">Total Invested</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 hover:shadow-lg hover:border-green-500/40 transition-all duration-300 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="p-4 sm:p-6 text-center relative">
              <TrendingUp className="h-6 sm:h-8 w-6 sm:w-8 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
              <p className="text-lg sm:text-2xl font-bold text-green-600">
                +${totalReturns.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-muted-foreground">Expected Returns</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:shadow-lg hover:border-purple-500/40 transition-all duration-300 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="p-4 sm:p-6 text-center relative">
              <Target className="h-6 sm:h-8 w-6 sm:w-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
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
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-xl overflow-hidden">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col">
            {/* Tab Navigation */}
            <div className="border-b border-border/50 px-3 sm:px-6 pt-3 sm:pt-6 bg-gradient-to-r from-transparent via-card/30 to-transparent">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-secondary/30 hover:bg-secondary/40 backdrop-blur-sm gap-1 sm:gap-0 transition-colors duration-300">
                <TabsTrigger
                  value="plans"
                  className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 py-2 sm:py-3 hover:bg-secondary/50"
                >
                  <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Investment Plans</span>
                  <span className="sm:hidden">Plans</span>
                </TabsTrigger>
                <TabsTrigger
                  value="active-investments"
                  className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 py-2 sm:py-3 hover:bg-secondary/50"
                >
                  <Target className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Active Investments</span>
                  <span className="sm:hidden">Active</span>
                </TabsTrigger>
                <TabsTrigger
                  value="calculator"
                  className="hidden sm:flex flex-row items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 py-3 hover:bg-secondary/50"
                >
                  <Calculator className="h-4 w-4" />
                  Calculator
                </TabsTrigger>
                <TabsTrigger
                  value="portfolio"
                  className="hidden sm:flex flex-row items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 py-3 hover:bg-secondary/50"
                >
                  <TrendingUp className="h-4 w-4" />
                  Portfolio
                </TabsTrigger>
              </TabsList>
              {/* Mobile-only additional tab buttons */}
              <div className="flex gap-1 sm:hidden mt-3 -mx-3 -mb-3 px-3 pb-3">
                <button
                  onClick={() => setActiveTab("calculator")}
                  className={cn(
                    "flex-1 py-2 px-2 rounded text-xs font-medium transition-all duration-300 flex items-center justify-center gap-1",
                    activeTab === "calculator"
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
                  )}
                >
                  <Calculator className="h-3 w-3" />
                  <span>Calc</span>
                </button>
                <button
                  onClick={() => setActiveTab("portfolio")}
                  className={cn(
                    "flex-1 py-2 px-2 rounded text-xs font-medium transition-all duration-300 flex items-center justify-center gap-1",
                    activeTab === "portfolio"
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
                  )}
                >
                  <TrendingUp className="h-3 w-3" />
                  <span>Folio</span>
                </button>
              </div>
            </div>

            {/* Investment Plans Tab */}
            <TabsContent value="plans" className="p-3 sm:p-6">
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
                          className={`h-full flex flex-col bg-gradient-to-br ${getBgGradient(index)} hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] border backdrop-blur-sm relative overflow-hidden cursor-pointer group ${isPopular(index) ? "ring-2 ring-purple-500/40 shadow-purple-500/20 shadow-lg" : "hover:ring-1 hover:ring-primary/50"}`}>
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                          <CardHeader className="pb-3 sm:pb-4">
                            <div className="flex items-start justify-between gap-2 sm:gap-3">
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-base sm:text-lg leading-tight text-card-foreground">{plan.name}</CardTitle>
                                <Badge className={`mt-2 text-xs ${getRiskColor(plan.risk)}`}>
                                  {plan.risk} Risk
                                </Badge>
                              </div>
                              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground/50 flex-shrink-0 group-hover:scale-110 group-hover:text-primary transition-all duration-300" />
                            </div>
                          </CardHeader>

                          <CardContent className="flex-1 flex flex-col gap-3 sm:gap-4">
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 group-hover:text-card-foreground/80 transition-colors">
                              {plan.description}
                            </p>

                            <div className="grid grid-cols-2 gap-3 text-center">
                              <div className="bg-white/5 rounded-lg p-3 group-hover:bg-white/10 transition-colors duration-300 backdrop-blur-sm border border-white/5">
                                <p className="text-xs text-muted-foreground">Min</p>
                                <p className="text-base sm:text-lg font-bold text-card-foreground">
                                  ${(plan.minAmount || 0).toLocaleString()}
                                </p>
                              </div>
                              <div className="bg-white/5 rounded-lg p-3 group-hover:bg-white/10 transition-colors duration-300 backdrop-blur-sm border border-white/5">
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
                                {plan.returnRate}%
                              </div>
                            </div>

                            <DialogTrigger asChild className="mt-auto pt-2">
                              <Button
                                className={`w-full font-semibold transition-all duration-300 ${
                                  isPopular(index)
                                    ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-600/50 hover:scale-105"
                                    : "hover:scale-105"
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


            {/* Active Investments Tab */}
            <TabsContent value="active-investments" className="p-3 sm:p-6">
              <div className="space-y-6 sm:space-y-8">
                <div className="text-center px-2 space-y-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-card-foreground">
                    Your Active Investments
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
                    Track and monitor your ongoing investment positions with comprehensive analytics
                  </p>
                </div>

                {/* Active Investments Summary */}
                {safeInvestments.length > 0 && (
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 hover:border-blue-500/40 hover:shadow-lg transition-all duration-300 group overflow-hidden h-full">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <CardContent className="p-4 relative min-h-fit">
                        <p className="text-xs text-muted-foreground mb-1">Total Invested</p>
                        <p className="text-xl font-bold text-blue-600 group-hover:scale-105 transition-transform duration-300 origin-left">
                          ${totalInvested.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">{safeInvestments.length} active {safeInvestments.length === 1 ? 'position' : 'positions'}</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 hover:border-green-500/40 hover:shadow-lg transition-all duration-300 group overflow-hidden h-full">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <CardContent className="p-4 relative min-h-fit">
                        <p className="text-xs text-muted-foreground mb-1">Expected Returns</p>
                        <p className="text-xl font-bold text-green-600 group-hover:scale-105 transition-transform duration-300 origin-left">
                          +${totalReturns.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-green-600/70 mt-2">
                          {totalInvested > 0 && totalReturns >= 0 ? ((totalReturns / Math.max(totalInvested, 1)) * 100).toFixed(1) : '0'}% avg return
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:border-purple-500/40 hover:shadow-lg transition-all duration-300 group overflow-hidden h-full">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <CardContent className="p-4 relative min-h-fit">
                        <p className="text-xs text-muted-foreground mb-1">Total Value</p>
                        <p className="text-xl font-bold text-purple-600 group-hover:scale-105 transition-transform duration-300 origin-left">
                          ${(totalInvested + totalReturns).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">portfolio balance</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-500/20 hover:border-orange-500/40 hover:shadow-lg transition-all duration-300 group overflow-hidden h-full">
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <CardContent className="p-4 relative min-h-fit">
                        <p className="text-xs text-muted-foreground mb-1">Avg Progress</p>
                        <p className="text-xl font-bold text-orange-600 group-hover:scale-105 transition-transform duration-300 origin-left">
                          {Math.round(
                            safeInvestments.length > 0
                              ? safeInvestments.reduce((sum, inv) => sum + calculateProgress(inv.startDate, inv.endDate, inv.status), 0) / safeInvestments.length
                              : 0
                          )}%
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">completion rate</p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Detailed Investment Cards */}
                {safeInvestments.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 px-2">
                      <div className="h-1 w-1 rounded-full bg-primary" />
                      <h3 className="text-lg font-semibold text-card-foreground">Investment Details</h3>
                    </div>
                    <div className="grid gap-4 sm:gap-5 grid-cols-1 lg:grid-cols-2">
                      {safeInvestments.map((inv) => {
                        const progress = calculateProgress(inv.startDate, inv.endDate, inv.status)
                        const progressColor =
                          progress >= 75
                            ? "from-green-500 to-emerald-500"
                            : progress >= 50
                              ? "from-blue-500 to-cyan-500"
                              : progress >= 25
                                ? "from-yellow-500 to-orange-500"
                                : "from-orange-500 to-red-500"

                        return (
                          <Card
                            key={inv.id}
                            className="bg-gradient-to-br from-card/60 to-card/30 border-border/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 overflow-hidden group h-full flex flex-col"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <CardHeader className="pb-3 relative">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <CardTitle className="text-base text-card-foreground">{inv.planName}</CardTitle>
                                  <p className="text-xs text-muted-foreground mt-2 line-clamp-1">
                                    {new Date(inv.startDate).toLocaleDateString()} – {new Date(inv.endDate).toLocaleDateString()}
                                  </p>
                                </div>
                                <Badge className="flex-shrink-0 bg-green-500/20 text-green-700 border-green-500/30 capitalize transition-all duration-300 group-hover:scale-105">
                                  {inv.status}
                                </Badge>
                              </div>
                            </CardHeader>

                            <CardContent className="space-y-4 relative flex-1 flex flex-col">
                              {/* Amount & Profit */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white/5 hover:bg-white/10 rounded-lg p-3 transition-colors duration-300 border border-white/5 group-hover:border-white/10">
                                  <p className="text-xs text-muted-foreground mb-1">Amount Invested</p>
                                  <p className="text-base sm:text-lg font-bold text-blue-600">
                                    ${(inv.amount || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                  </p>
                                </div>
                                <div className="bg-white/5 hover:bg-white/10 rounded-lg p-3 transition-colors duration-300 border border-white/5 group-hover:border-white/10">
                                  <p className="text-xs text-muted-foreground mb-1">Expected Profit</p>
                                  <p className="text-base sm:text-lg font-bold text-green-600">
                                    +${(inv.expectedProfit || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                  </p>
                                </div>
                              </div>

                              {/* Total Value */}
                              <div className="bg-gradient-to-r from-primary/15 to-accent/15 hover:from-primary/25 hover:to-accent/25 rounded-lg p-3 border border-primary/20 transition-all duration-300">
                                <p className="text-xs text-muted-foreground mb-1">Total Value at Maturity</p>
                                <p className="text-lg font-bold text-card-foreground">
                                  ${((inv.amount || 0) + (inv.expectedProfit || 0)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </p>
                              </div>

                              {/* Progress Bar */}
                              <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-semibold text-muted-foreground">Progress</p>
                                  <p className="text-sm font-bold text-card-foreground group-hover:text-primary transition-colors duration-300">{progress}%</p>
                                </div>
                                <div className="relative h-2.5 bg-slate-200/30 dark:bg-slate-700/30 rounded-full overflow-hidden border border-slate-300/20 dark:border-slate-600/20">
                                  <div
                                    className={`h-full bg-gradient-to-r ${progressColor} rounded-full transition-all duration-700 ease-out shadow-lg shadow-current/20`}
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              </div>

                              {/* ROI */}
                              <div className="bg-white/5 hover:bg-white/10 rounded-lg p-3 border border-border/20 group-hover:border-border/50 transition-all duration-300 mt-auto">
                                <p className="text-xs text-muted-foreground mb-2">Return on Investment</p>
                                <div className="space-y-1.5">
                                  <p className="text-lg font-bold text-accent group-hover:scale-105 transition-transform duration-300 origin-left">
                                    {calculateROI(inv).toFixed(2)}%
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Annualized: {calculateAnnualizedROI(inv).toFixed(2)}%
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Table View */}
                {safeInvestments.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-border/30">
                    <div className="flex items-center gap-2 px-2">
                      <div className="h-1 w-1 rounded-full bg-primary" />
                      <h3 className="text-lg font-semibold text-card-foreground">All Positions</h3>
                    </div>
                    <ActiveInvestmentsTable investments={safeInvestments} />
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
            <TabsContent value="calculator" className="p-3 sm:p-6">
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
            <TabsContent value="portfolio" className="p-3 sm:p-6">
              <div className="space-y-6 sm:space-y-8">
                <div className="text-center px-2 space-y-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-card-foreground">
                    Portfolio Overview
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
                    Comprehensive view of your investment portfolio performance and allocation
                  </p>
                </div>

                {/* Portfolio Summary Cards */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 hover:border-blue-500/40 hover:shadow-lg transition-all duration-300 group overflow-hidden h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardContent className="p-4 relative min-h-fit">
                      <p className="text-xs text-muted-foreground mb-1">Total Invested</p>
                      <p className="text-xl font-bold text-blue-600 group-hover:scale-105 transition-transform duration-300 origin-left">
                        ${totalInvested.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">across all positions</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 hover:border-green-500/40 hover:shadow-lg transition-all duration-300 group overflow-hidden h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardContent className="p-4 relative min-h-fit">
                      <p className="text-xs text-muted-foreground mb-1">Expected Returns</p>
                      <p className="text-xl font-bold text-green-600 group-hover:scale-105 transition-transform duration-300 origin-left">
                        +${totalReturns.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-green-600/70 mt-2">
                        {totalInvested > 0 ? ((totalReturns / totalInvested) * 100).toFixed(1) : 0}% avg return
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:border-purple-500/40 hover:shadow-lg transition-all duration-300 group overflow-hidden h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardContent className="p-4 relative min-h-fit">
                      <p className="text-xs text-muted-foreground mb-1">Portfolio Value</p>
                      <p className="text-xl font-bold text-purple-600 group-hover:scale-105 transition-transform duration-300 origin-left">
                        ${(totalInvested + totalReturns).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">current valuation</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-500/20 hover:border-orange-500/40 hover:shadow-lg transition-all duration-300 group overflow-hidden h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardContent className="p-4 relative min-h-fit">
                      <p className="text-xs text-muted-foreground mb-1">Active Positions</p>
                      <p className="text-xl font-bold text-orange-600 group-hover:scale-105 transition-transform duration-300 origin-left">
                        {safeInvestments.length}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">{safeInvestments.length === 1 ? 'investment' : 'investments'} running</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Portfolio Performance Chart Placeholder */}
                <Card className="bg-gradient-to-br from-card/80 to-card/40 border-border/50 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="h-5 w-5 text-accent" />
                      Portfolio Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gradient-to-br from-accent/5 to-primary/5 rounded-lg border-2 border-dashed border-accent/20 hover:border-accent/40 transition-colors duration-300">
                      <div className="text-center px-4">
                        <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-accent/10 mb-4">
                          <BarChart3 className="h-7 w-7 text-accent/60" />
                        </div>
                        <p className="text-muted-foreground font-medium">Portfolio performance chart coming soon</p>
                        <p className="text-sm text-muted-foreground/70 mt-2">
                          Track your investment growth over time with detailed analytics
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 hover:border-primary/50 hover:shadow-lg transition-all duration-300 group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardContent className="p-6 relative">
                      <h3 className="font-semibold text-card-foreground mb-2">Ready to Invest More?</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Explore our investment plans and grow your portfolio further
                      </p>
                      <Button onClick={() => setActiveTab("plans")} className="w-full hover:scale-105 transition-transform duration-300">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Investment Plans
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/30 hover:border-accent/50 hover:shadow-lg transition-all duration-300 group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/0 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardContent className="p-6 relative">
                      <h3 className="font-semibold text-card-foreground mb-2">Monitor Your Investments</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Review detailed analytics of all your active investment positions
                      </p>
                      <Button onClick={() => setActiveTab("active-investments")} variant="outline" className="w-full hover:scale-105 transition-transform duration-300">
                        <Target className="h-4 w-4 mr-2" />
                        View Active Investments
                      </Button>
                    </CardContent>
                  </Card>
                </div>
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