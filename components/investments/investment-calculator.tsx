"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { InvestmentPlan } from "@/lib/types"
import { TrendingUp } from "lucide-react"

export function InvestmentCalculator() {
  const [selectedPlanId, setSelectedPlanId] = useState<string>("")
  const [amount, setAmount] = useState<string>("1000")
  import { calculateDynamicReturnRate, safeNumber, calculateExpectedProfit } from "@/lib/investment-utils"
  const [plans, setPlans] = useState<InvestmentPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
    const [duration, setDuration] = useState<number>(7)
        const res = await fetch("/api/investment-plans")
        if (res.ok) {
          const data = await res.json()
          setPlans(data)
          if (data.length > 0) setSelectedPlanId(data[0].id)
        }
      } catch (error) {
        console.error("Failed to fetch plans:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPlans()
  }, [])

  const selectedPlan = plans.find((p) => p.id === selectedPlanId)
  const investmentAmount = parseFloat(amount) || 0

  if (loading) return <div>Loading calculator...</div>
  if (!selectedPlan) return null

    const durationNum = safeNumber(duration, 7)
  // plan might not include fees (real data), so default to zero
  const fees = selectedPlan.fees || { management: 0, performance: 0, withdrawal: 0 }

  // Calculate returns with optional fees
  const grossProfit = (investmentAmount * selectedPlan.returnRate) / 100
  
  // Convert duration to years for fee calculation
  let durationInYears = selectedPlan.duration || 0
    // Dynamic return rate based on duration
    const dynamicReturnRate = calculateDynamicReturnRate(durationNum)
    const grossProfit = calculateExpectedProfit(investmentAmount, dynamicReturnRate)
    durationInYears = selectedPlan.duration / 12
  } else if (selectedPlan.durationUnit === "days") {
    durationInYears = selectedPlan.duration / 365
  }
  // else: duration is already in years
  
  const managementFee =
    investmentAmount * (fees.management / 100) * durationInYears
  const performanceFee = grossProfit * (fees.performance / 100)
  const totalFees = managementFee + performanceFee
  // Net profit is what you actually keep after fees are deducted
  const netProfit = grossProfit - totalFees
  const totalReturn = investmentAmount + netProfit
  // Net return rate shows the effective return after all fees
  const netReturnRate = investmentAmount > 0 ? (netProfit / investmentAmount) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-accent" />
          Investment Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <Label htmlFor="plan-select" className="text-sm sm:text-base">Select Investment Plan</Label>
          <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
            <SelectTrigger id="plan-select" className="h-11 sm:h-10 text-sm sm:text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {plans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id} className="text-sm">
                  {plan.name} ({plan.returnRate}% return)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount-input" className="text-sm sm:text-base">Investment Amount ($)</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm sm:text-base">
          <div className="space-y-2">
            <Label htmlFor="duration-input" className="text-sm sm:text-base">Investment Duration (days)</Label>
            <Input
              id="duration-input"
              type="number"
              min={7}
              max={365}
              step={1}
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              className="h-11 sm:h-10 text-base sm:text-sm"
            />
            <p className="text-xs text-muted-foreground">Minimum: 7 days. Longer duration = higher profit.</p>
          </div>
              $
            </span>
            <Input
              id="amount-input"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="100"
              className="pl-8 h-11 sm:h-10 text-base sm:text-sm"
            />
          </div>
          <p className="text-xs text-muted-foreground whitespace-normal break-words">
            Min: ${(selectedPlan?.minAmount || 0).toLocaleString()} | Max: ${(selectedPlan?.maxAmount || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm gap-2">
              <span className="text-muted-foreground">
                Investment Amount:
              </span>
              <span className="font-bold text-card-foreground">
                ${investmentAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm gap-2">
              <span className="text-muted-foreground">Gross Return Rate:</span>
              <span className="font-bold text-accent">
                {selectedPlan.returnRate}%
              </span>
            </div>
              <span className="font-bold text-accent text-base">{dynamicReturnRate.toFixed(2)}%</span>
            <div className="flex items-center justify-between text-xs sm:text-sm gap-2">
              <span className="text-muted-foreground">Management Fee:</span>
              <span className="text-orange-600">
                -${managementFee.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm gap-2">
              <span className="text-muted-foreground">Performance Fee:</span>
              <span className="text-orange-600">
                -${performanceFee.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="border-t border-border/50 pt-2">
              <div className="flex items-center justify-between text-xs sm:text-sm gap-2 font-medium">
                <span className="text-muted-foreground">Net Return:</span>
                <span className="text-green-600">
                  ${netProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })} ({netReturnRate.toFixed(1)}%)
                </span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-base gap-2 font-medium mt-1">
                <span className="text-muted-foreground">Total Value:</span>
                <span className="text-card-foreground">
                  ${totalReturn.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground pt-2 space-y-1">
            <p>📅 Duration: {selectedPlan.duration} {selectedPlan.durationUnit}</p>
            <p>⚠️ Risk Level: {selectedPlan.risk}</p>
            <p>🏷️ Category: {selectedPlan.category ?? "—"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
