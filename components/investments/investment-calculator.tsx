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

  if (loading) return <div>Loading calculator...</div>
  if (!selectedPlan) return null

  // plan might not include fees (real data), so default to zero
  const fees = selectedPlan.fees || { management: 0, performance: 0, withdrawal: 0 }

  // Calculate returns with optional fees
  const grossProfit = (investmentAmount * selectedPlan.returnRate) / 100
  const managementFee =
    investmentAmount * (fees.management / 100) *
    (selectedPlan.duration / (selectedPlan.durationUnit === "months" ? 12 : 365))
  const performanceFee = grossProfit * (fees.performance / 100)
  const totalFees = managementFee + performanceFee
  const netProfit = grossProfit - totalFees
  const totalReturn = investmentAmount + netProfit
  const netReturnRate = investmentAmount > 0 ? (netProfit / investmentAmount) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-accent" />
          Investment Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="plan-select">Select Investment Plan</Label>
          <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
            <SelectTrigger id="plan-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {plans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.name} ({plan.returnRate}% return)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount-input">Investment Amount ($)</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
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
              className="pl-7"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Min: ${(selectedPlan?.minAmount || 0).toLocaleString()} | Max: ${(selectedPlan?.maxAmount || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg p-4 space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Investment Amount:
              </span>
              <span className="text-lg font-bold text-card-foreground">
                ${investmentAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Gross Return Rate:</span>
              <span className="text-lg font-bold text-accent">
                {selectedPlan.returnRate}%
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Management Fee:</span>
              <span className="text-sm text-orange-600">
                -${managementFee.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Performance Fee:</span>
              <span className="text-sm text-orange-600">
                -${performanceFee.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="border-t border-border/50 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Net Return:</span>
                <span className="text-lg font-bold text-green-600">
                  ${netProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })} ({netReturnRate.toFixed(1)}%)
                </span>
              </div>

              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-medium text-muted-foreground">Total Value:</span>
                <span className="text-xl font-bold text-card-foreground">
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
