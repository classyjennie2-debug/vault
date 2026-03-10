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
import { Shield, TrendingUp, Zap } from "lucide-react"
import { useState } from "react"

export function InvestmentPlansGrid({ plans }: { plans: InvestmentPlan[] }) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "bg-green-500/20 text-green-700 border-green-500/30 hover:shadow-lg hover:shadow-green-500/20"
      case "Medium":
        return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30 hover:shadow-lg hover:shadow-yellow-500/20"
      case "High":
        return "bg-red-500/20 text-red-700 border-red-500/30 hover:shadow-lg hover:shadow-red-500/20"
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

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-card-foreground">
          Investment Plans
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Choose from our curated investment plans to grow your wealth
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan, index) => (
          <div key={plan.id} className="relative">
            {/* Popular Badge */}
            {isPopular(index) && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 animate-in fade-in slide-in-from-top duration-700">
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg shadow-purple-600/50 uppercase text-xs font-bold tracking-wider">
                  ⭐ Most Popular
                </Badge>
              </div>
            )}

            <Dialog open={selectedPlan === plan.id} onOpenChange={(open) => {
              if (open) setSelectedPlan(plan.id)
              else setSelectedPlan(null)
            }}>
              <Card className={`h-full flex flex-col bg-gradient-to-br ${getBgGradient(index)} hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 border backdrop-blur-lg relative overflow-hidden group ${isPopular(index) ? "ring-2 ring-purple-500/50 lg:scale-105" : ""}`}>
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <CardHeader className="relative z-10">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl ">{plan.name}</CardTitle>
                      <Badge className={`mt-3 ${getRiskColor(plan.risk)}`}>
                        {plan.risk} Risk
                      </Badge>
                    </div>
                    <Shield className="h-6 w-6 text-muted-foreground/50 flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col gap-4 relative z-10">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/50">
                    <div className="bg-white/5 rounded-lg p-3 backdrop-blur-sm">
                      <p className="text-xs text-muted-foreground">Min Investment</p>
                      <p className="text-lg font-bold text-card-foreground mt-1">
                        ${plan.minAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 backdrop-blur-sm">
                      <p className="text-xs text-muted-foreground">Max Investment</p>
                      <p className="text-lg font-bold text-card-foreground mt-1">
                        ${plan.maxAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="text-sm font-semibold text-card-foreground mt-1">
                        {formatDuration(plan.duration, plan.durationUnit)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Return Rate</p>
                      <p className="flex items-center gap-1 text-sm font-semibold text-accent mt-1">
                        <TrendingUp className="h-4 w-4" />
                        {plan.returnRate}%
                      </p>
                    </div>
                  </div>

                  <DialogTrigger asChild className="mt-auto">
                    <Button
                      className={`w-full mt-4 group/btn font-semibold transition-all duration-300 ${
                        isPopular(index)
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-600/50"
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
                  <DialogTitle>Invest in {plan.name}</DialogTitle>
                </DialogHeader>
                <InvestmentForm plan={plan} onSuccess={() => setSelectedPlan(null)} />
              </DialogContent>
            </Dialog>
          </div>
        ))}
      </div>
    </div>
  )
}
