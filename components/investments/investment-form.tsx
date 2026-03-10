"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { InvestmentPlan } from "@/lib/types"
import { AlertCircle, Check } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface InvestmentFormProps {
  plan: InvestmentPlan
  onSuccess: () => void
}

export function InvestmentForm({ plan, onSuccess }: InvestmentFormProps) {
  const [amount, setAmount] = useState<string>(plan.minAmount.toString())
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const amountNum = parseFloat(amount) || 0
  const isValid = amountNum >= plan.minAmount && amountNum <= plan.maxAmount

  const expectedProfit = (amountNum * plan.returnRate) / 100
  const totalReturn = amountNum + expectedProfit

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setIsLoading(true)

    try {
      const res = await fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, amount: amountNum }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to invest")
      }
      setSubmitted(true)
      setTimeout(() => {
        onSuccess()
      }, 500)
    } catch (err: unknown) {
      console.error("investment submit error", err)
      // TODO: show error toast
    } finally {
      setIsLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-card-foreground">
            Investment Confirmed!
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Your investment of ${amountNum.toLocaleString()} has been started.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="amount">Investment Amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            $
          </span>
          <Input
            id="amount"
            type="number"
            placeholder={plan.minAmount.toString()}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={plan.minAmount}
            max={plan.maxAmount}
            step="100"
            className="pl-7"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Range: ${plan.minAmount.toLocaleString()} - ${plan.maxAmount.toLocaleString()}
        </p>
      </div>

      {!isValid && amount && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {amountNum < plan.minAmount
              ? `Minimum investment is $${plan.minAmount.toLocaleString()}`
              : `Maximum investment is $${plan.maxAmount.toLocaleString()}`}
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-accent/10 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-sm text-card-foreground">
          Investment Summary
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Investment Amount:</span>
            <span className="font-medium text-card-foreground">
              ${amountNum.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Return Rate:</span>
            <span className="font-medium text-accent">{plan.returnRate}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Duration:</span>
            <span className="font-medium text-card-foreground">
              {plan.duration} {plan.durationUnit}
            </span>
          </div>
          <div className="border-t border-border pt-2 mt-2 flex justify-between">
            <span className="font-semibold text-card-foreground">
              Expected Profit:
            </span>
            <span className="font-bold text-accent">
              ${expectedProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-card-foreground">
              Total Return:
            </span>
            <span className="font-bold text-card-foreground">
              ${totalReturn.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={!isValid || isLoading}
      >
        {isLoading ? "Processing..." : "Confirm Investment"}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Your investment will start immediately after confirmation.
      </p>
    </form>
  )
}
