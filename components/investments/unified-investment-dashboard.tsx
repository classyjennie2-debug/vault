"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
  plans: InvestmentPlan[]
  investments: ActiveInvestment[]
}

export function UnifiedInvestmentDashboard({ plans, investments }: UnifiedInvestmentDashboardProps) {
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

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0)
  const totalReturns = investments.reduce((sum, inv) => sum + (inv.expectedProfit || 0), 0)

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-card-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-serif">
          Investment Dashboard
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover, calculate, and manage your investments all in one place
        </p>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-8">
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <CardContent className="p-6 text-center">
              <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-card-foreground">
                ${totalInvested.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total Invested</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">
                +${totalReturns.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Expected Returns</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-card-foreground">
                {investments.length}
              </p>
              <p className="text-sm text-muted-foreground">Active Investments</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Trust Badges */}
      <TrustBadges />

      {/* Main Content Tabs */}
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-xl">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-border/50 px-6 pt-6">
              <TabsList className="grid w-full grid-cols-4 bg-secondary/50 backdrop-blur-sm">
                <TabsTrigger
                  value="plans"
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                >
                  <BarChart3 className="h-4 w-4" />
                  Investment Plans
                </TabsTrigger>
                <TabsTrigger
                  value="active-investments"
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                >
                  <Target className="h-4 w-4" />
                  Active Investments
                </TabsTrigger>
                <TabsTrigger
                  value="calculator"
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                >
                  <Calculator className="h-4 w-4" />
                  Calculator
                </TabsTrigger>
                <TabsTrigger
                  value="portfolio"
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                >
                  <TrendingUp className="h-4 w-4" />
                  Portfolio
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Investment Plans Tab */}
            <TabsContent value="plans" className="p-6">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-card-foreground mb-2">
                    Choose Your Investment Plan
                  </h2>
                  <p className="text-muted-foreground">
                    Select from our carefully curated investment options
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {plans.map((plan, index) => (
                    <Dialog key={plan.id} open={selectedPlan === plan.id} onOpenChange={(open) => {
                      if (open) setSelectedPlan(plan.id)
                      else setSelectedPlan(null)
                    }}>
                      <div className="relative group">
                        {/* Popular Badge */}
                        {isPopular(index) && (
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20">
                            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg shadow-purple-600/50 text-xs font-bold px-3 py-1">
                              <Star className="h-3 w-3 mr-1" />
                              Most Popular
                            </Badge>
                          </div>
                        )}

                        <Card 
                          onClick={() => setSelectedPlan(plan.id)}
                          className={`h-full flex flex-col bg-gradient-to-br ${getBgGradient(index)} hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border backdrop-blur-sm relative overflow-hidden cursor-pointer ${isPopular(index) ? "ring-2 ring-purple-500/30" : ""}`}>
                          <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-lg leading-tight">{plan.name}</CardTitle>
                                <Badge className={`mt-2 text-xs ${getRiskColor(plan.risk)}`}>
                                  {plan.risk} Risk
                                </Badge>
                              </div>
                              <Shield className="h-5 w-5 text-muted-foreground/50 flex-shrink-0" />
                            </div>
                          </CardHeader>

                          <CardContent className="flex-1 flex flex-col gap-3">
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                              {plan.description}
                            </p>

                            <div className="grid grid-cols-2 gap-2 text-center">
                              <div className="bg-white/5 rounded-md p-2 backdrop-blur-sm">
                                <p className="text-xs text-muted-foreground">Min</p>
                                <p className="text-sm font-bold text-card-foreground">
                                  ${plan.minAmount.toLocaleString()}
                                </p>
                              </div>
                              <div className="bg-white/5 rounded-md p-2 backdrop-blur-sm">
                                <p className="text-xs text-muted-foreground">Max</p>
                                <p className="text-sm font-bold text-card-foreground">
                                  ${plan.maxAmount.toLocaleString()}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  {formatDuration(plan.duration, plan.durationUnit)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-accent font-semibold">
                                <TrendingUp className="h-4 w-4" />
                                {plan.returnRate}%
                              </div>
                            </div>

                            <DialogTrigger asChild className="mt-auto">
                              <Button
                                className={`w-full font-semibold transition-all duration-300 ${
                                  isPopular(index)
                                    ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-600/50"
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
            <TabsContent value="active-investments" className="p-6">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-card-foreground mb-2">
                    Your Active Investments
                  </h2>
                  <p className="text-muted-foreground">
                    Track and monitor your ongoing investment positions in detail
                  </p>
                </div>

                {/* Active Investments Summary */}
                {investments.length > 0 && (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-1">Total Invested</p>
                        <p className="text-xl font-bold text-blue-600">
                          ${totalInvested.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">{investments.length} active positions</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-1">Expected Returns</p>
                        <p className="text-xl font-bold text-green-600">
                          +${totalReturns.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-green-600/70 mt-2">
                          {((totalReturns / totalInvested) * 100).toFixed(1)}% avg return
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-1">Total Value</p>
                        <p className="text-xl font-bold text-purple-600">
                          ${(totalInvested + totalReturns).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">portfolio balance</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-500/20">
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-1">Avg Progress</p>
                        <p className="text-xl font-bold text-orange-600">
                          {Math.round(
                            investments.reduce((sum, inv) => sum + calculateProgress(inv.startDate, inv.endDate, inv.status), 0) / investments.length
                          )}%
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">completion rate</p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Detailed Investment Cards */}
                {investments.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-card-foreground mb-4">Investment Details</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                      {investments.map((inv) => {
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
                            className="bg-gradient-to-br from-card/80 to-card/40 border-border/50 hover:shadow-lg transition-all duration-300 overflow-hidden group"
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <CardTitle className="text-base">{inv.planName}</CardTitle>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(inv.startDate).toLocaleDateString()} - {new Date(inv.endDate).toLocaleDateString()}
                                  </p>
                                </div>
                                <Badge className="flex-shrink-0 bg-green-500/20 text-green-700 border-green-500/30 capitalize">
                                  {inv.status}
                                </Badge>
                              </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                              {/* Amount & Profit */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white/5 rounded-lg p-3">
                                  <p className="text-xs text-muted-foreground mb-1">Amount Invested</p>
                                  <p className="text-lg font-bold text-blue-600">
                                    ${inv.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                  </p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-3">
                                  <p className="text-xs text-muted-foreground mb-1">Expected Profit</p>
                                  <p className="text-lg font-bold text-green-600">
                                    +${(inv.expectedProfit || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                  </p>
                                </div>
                              </div>

                              {/* Total Value */}
                              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-3 border border-primary/20">
                                <p className="text-xs text-muted-foreground mb-1">Total Value at Maturity</p>
                                <p className="text-lg font-bold text-card-foreground">
                                  ${((inv.amount || 0) + (inv.expectedProfit || 0)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </p>
                              </div>

                              {/* Progress Bar */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-semibold text-muted-foreground">Progress</p>
                                  <p className="text-sm font-bold text-card-foreground">{progress}%</p>
                                </div>
                                <div className="relative h-3 bg-slate-200/50 dark:bg-slate-700/50 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full bg-gradient-to-r ${progressColor} rounded-full transition-all duration-700 ease-out`}
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              </div>

                              {/* ROI */}
                              <div className="bg-white/5 rounded-lg p-3 border border-border/20">
                                <p className="text-xs text-muted-foreground mb-1">Return on Investment</p>
                                <p className="text-base font-bold text-accent">
                                  {((((inv.expectedProfit || 0) / inv.amount) * 100)).toFixed(2)}%
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Table View */}
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-4">All Positions</h3>
                  <ActiveInvestmentsTable investments={investments} />
                </div>

                {investments.length === 0 && (
                  <div className="text-center py-12">
                    <Target className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-card-foreground mb-2">No Active Investments</h3>
                    <p className="text-muted-foreground mb-4">
                      You don't have any active investments yet. Start by choosing a plan from the Investment Plans tab.
                    </p>
                    <Button onClick={() => setActiveTab("plans")} variant="outline">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Investment Plans
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Calculator Tab */}
            <TabsContent value="calculator" className="p-6">
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-card-foreground mb-2">
                    Investment Calculator
                  </h2>
                  <p className="text-muted-foreground">
                    Calculate potential returns and plan your investments
                  </p>
                </div>
                <InvestmentCalculator />
              </div>
            </TabsContent>

            {/* Portfolio Tab */}
            <TabsContent value="portfolio" className="p-6">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-card-foreground mb-2">
                    Portfolio Overview
                  </h2>
                  <p className="text-muted-foreground">
                    High-level view of your investment portfolio performance
                  </p>
                </div>

                {/* Portfolio Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">Total Invested</p>
                      <p className="text-xl font-bold text-blue-600">
                        ${totalInvested.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">across all positions</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">Expected Returns</p>
                      <p className="text-xl font-bold text-green-600">
                        +${totalReturns.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-green-600/70 mt-2">
                        {totalInvested > 0 ? ((totalReturns / totalInvested) * 100).toFixed(1) : 0}% avg return
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">Portfolio Value</p>
                      <p className="text-xl font-bold text-purple-600">
                        ${(totalInvested + totalReturns).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">current valuation</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-500/20">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">Active Positions</p>
                      <p className="text-xl font-bold text-orange-600">
                        {investments.length}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">investments running</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Portfolio Performance Chart Placeholder */}
                <Card className="bg-gradient-to-br from-card/80 to-card/40 border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Portfolio Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-accent/5 rounded-lg border-2 border-dashed border-accent/20">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                        <p className="text-muted-foreground">Portfolio performance chart coming soon</p>
                        <p className="text-sm text-muted-foreground/70 mt-2">
                          Track your investment growth over time
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-card-foreground mb-2">Ready to Invest More?</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Explore our investment plans and grow your portfolio
                      </p>
                      <Button onClick={() => setActiveTab("plans")} className="w-full">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Investment Plans
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-card-foreground mb-2">Monitor Your Investments</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Detailed view of all your active investment positions
                      </p>
                      <Button onClick={() => setActiveTab("active-investments")} variant="outline" className="w-full">
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