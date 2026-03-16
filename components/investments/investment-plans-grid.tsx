"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { InvestmentPlan } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { InvestmentForm } from "@/components/investments/investment-form"
import { safeNumber, getPlanDisplayRate, getPlanAnnualRate } from "@/lib/investment-utils"
import { Shield, Zap, Flame } from "lucide-react"
import { useState } from "react"

export function InvestmentPlansGrid({ plans }: { plans: InvestmentPlan[] }) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-500 border-emerald-500/20"
      case "Medium":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-500 border-amber-500/20"
      case "High":
        return "bg-slate-500/10 text-slate-700 dark:text-slate-500 border-slate-500/20"
      default:
        return ""
    }
  }

  const getBgGradient = (index: number) => {
    return "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
  }

  const isPopular = (index: number) => index === 1

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-card-foreground">
          Investment Plans
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Choose from our curated investment plans to grow your wealth
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan, index) => {
          const minAmount = safeNumber(plan.minAmount, 1000)
          const displayRate = getPlanDisplayRate(plan.planType || "Conservative Bond Fund")
          const annualRate = getPlanAnnualRate(plan.planType || "Conservative Bond Fund")
          
          return (
            <div key={plan.id} className="relative">
              {/* Popular Badge */}
              {isPopular(index) && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-primary text-white border-0 shadow-md uppercase text-xs font-bold tracking-wider">
                    ⭐ Most Popular
                  </Badge>
                </div>
              )}

              <Dialog open={selectedPlan === plan.id} onOpenChange={(open) => {
                if (open) setSelectedPlan(plan.id)
                else setSelectedPlan(null)
              }}>
                <Card className={`h-full flex flex-col ${getBgGradient(index)} hover:shadow-md transition-all duration-300 hover:border-primary/30 border relative overflow-hidden group ${isPopular(index) ? "ring-2 ring-primary/20" : ""}`}>

                  <CardHeader className="relative z-10">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl ">{plan.name || "Investment Plan"}</CardTitle>
                        <Badge className={`mt-3 ${getRiskColor(plan.risk || "Medium")}`}>
                          {plan.risk || "Medium"} Risk
                        </Badge>
                      </div>
                      <Shield className="h-6 w-6 text-muted-foreground/50 flex-shrink-0 mt-1" />
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col gap-4 relative z-10">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {plan.description || "Diversified investment opportunity"}
                    </p>

                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/50">
                      <div className="bg-white/5 rounded-lg p-3 backdrop-blur-sm">
                        <p className="text-xs text-muted-foreground">Min Investment</p>
                        <p className="text-lg font-bold text-card-foreground mt-1">
                          ${minAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 backdrop-blur-sm">
                        <p className="text-xs text-muted-foreground">1-Year Return</p>
                        <p className="text-lg font-bold text-accent mt-1">
                          {annualRate.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-xs text-card-foreground/80">
                      <div className="flex items-start gap-2 p-3 bg-accent/10 rounded-lg border border-accent/20">
                        <Flame className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-accent">Duration: Flexible 7-365 Days</p>
                          <p className="text-muted-foreground">Choose your investment period for optimal returns</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2 bg-green-500/10 rounded-lg border border-green-500/20">
                        <span className="text-muted-foreground font-semibold">1-Year Return Rate:</span>
                        <span className="font-bold text-green-600 dark:text-green-400">{annualRate.toFixed(1)}%</span>
                      </div>
                    </div>

                    <DialogTrigger asChild className="mt-auto">
                      <Button
                        className={`w-full mt-4 group/btn font-semibold transition-all duration-300 ${
                          isPopular(index)
                            ? "bg-primary hover:bg-primary/90"
                            : ""
                        }`}
                        size="sm"
                      >
                        <Zap className="h-4 w-4 mr-2 group-hover/btn:animate-pulse" />
                        Invest Now
                      </Button>
                    </DialogTrigger>
                  </CardContent>
                </Card>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invest in {plan.name || "Investment Plan"}</DialogTitle>
                  </DialogHeader>
                  <InvestmentForm plan={plan} onSuccess={() => setSelectedPlan(null)} />
                </DialogContent>
              </Dialog>
            </div>
          )
        })}
      </div>
    </div>
  )
}
