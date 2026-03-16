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
import { calculateReturnRate, safeNumber, calculateExpectedProfit } from "@/lib/investment-utils"

export function InvestmentCalculator() {
  const [selectedPlanId, setSelectedPlanId] = useState<string>("")
  const [amount, setAmount] = useState<string>("1000")
  const [duration, setDuration] = useState<number>(7)
  const [plans, setPlans] = useState<InvestmentPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
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
  const durationNum = safeNumber(duration, 7)

  if (loading) return <div>Loading calculator...</div>
  if (!selectedPlan) return null

  // plan might not include fees (real data), so default to zero
  const fees = selectedPlan.fees || { management: 0, performance: 0, withdrawal: 0 }

  // Dynamic return rate based on duration and plan type
  const planTypeToUse = selectedPlan.planType || "Conservative Bond Fund"
  const dynamicReturnRate = calculateReturnRate(durationNum, planTypeToUse)
  const grossProfit = calculateExpectedProfit(investmentAmount, dynamicReturnRate)

  // Convert duration to years for fee calculation
  let durationInYears = selectedPlan.duration || 0
  if (selectedPlan.durationUnit === "months") {
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
                  {plan.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration-input" className="text-sm sm:text-base">Investment Duration</Label>
          <select
            id="duration-input"
            value={duration}
            onChange={e => setDuration(Number(e.target.value))}
            className="w-full h-11 sm:h-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-800 text-foreground text-base sm:text-sm"
          >
            <option value={7}>7 Days</option>
            <option value={14}>14 Days (2 weeks)</option>
            <option value={30}>30 Days (1 month)</option>
            <option value={60}>60 Days (2 months)</option>
            <option value={90}>90 Days (3 months)</option>
            <option value={180}>180 Days (6 months)</option>
            <option value={365}>365 Days (1 year)</option>
          </select>
          <p className="text-xs text-muted-foreground">Longer duration = higher profit!</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount-input" className="text-sm sm:text-base">Investment Amount ($)</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm sm:text-base">
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

        <div className="space-y-2">
          <Label className="text-sm sm:text-base">Estimated Returns</Label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Gross Profit:</span>
            <span className="font-bold text-accent text-base">${grossProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Total Return:</span>
            <span className="font-bold text-card-foreground text-base">${totalReturn.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Return Rate:</span>
            <span className="font-bold text-accent text-base">{dynamicReturnRate.toFixed(2)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
