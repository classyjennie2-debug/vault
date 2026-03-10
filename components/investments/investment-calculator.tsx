"use client"

import { useState } from "react"
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
import { investmentPlans } from "@/lib/mock-data"
import { TrendingUp } from "lucide-react"

export function InvestmentCalculator() {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    investmentPlans[0].id
  )
  const [amount, setAmount] = useState<string>("1000")

  const selectedPlan = investmentPlans.find((p) => p.id === selectedPlanId)
  const investmentAmount = parseFloat(amount) || 0

  if (!selectedPlan) return null

  const expectedProfit = (investmentAmount * selectedPlan.returnRate) / 100
  const totalReturn = investmentAmount + expectedProfit
  const profitPercentage = selectedPlan.returnRate

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
              {investmentPlans.map((plan) => (
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
            Min: ${selectedPlan.minAmount.toLocaleString()} | Max: ${selectedPlan.maxAmount.toLocaleString()}
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
              <span className="text-sm text-muted-foreground">Return Rate:</span>
              <span className="text-lg font-bold text-accent">
                {profitPercentage}%
              </span>
            </div>

            <div className="border-t border-border pt-2 flex items-center justify-between">
              <span className="font-semibold text-card-foreground">
                Expected Profit:
              </span>
              <span className="text-xl font-bold text-accent">
                ${expectedProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between bg-accent/10 p-2 rounded -mx-4 -mb-2 px-4 py-3">
              <span className="font-semibold text-card-foreground">
                Total Return:
              </span>
              <span className="text-2xl font-bold text-accent">
                ${totalReturn.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground pt-2 space-y-1">
            <p>📅 Duration: {selectedPlan.duration} {selectedPlan.durationUnit}</p>
            <p>⚠️ Risk Level: {selectedPlan.risk}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
