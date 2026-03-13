"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { InvestmentPlan } from "@/lib/types"
import { AlertCircle, Check } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { safeNumber, validateInvestmentAmount, calculateExpectedProfit } from "@/lib/investment-utils"

interface InvestmentFormProps {
  plan: InvestmentPlan
  onSuccess: () => void
}

export function InvestmentForm({ plan, onSuccess }: InvestmentFormProps) {
  // Safe plan values with proper null checking
  const minAmount = safeNumber(plan.minAmount, 100)
  const maxAmount = safeNumber(plan.maxAmount, Infinity)
  // Ensure initial amount is always at least minAmount and at least 100
  const initialAmount = Math.max(minAmount, 100)
  
  const [amount, setAmount] = useState<string>(initialAmount.toString())
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const amountNum = safeNumber(amount, 0)
  
  // Use the imported validation function for min/max checking
  const validation = validateInvestmentAmount(amountNum, minAmount, maxAmount)
  const isValid = validation.isValid && amountNum > 0

  // Calculate expected profit based on return rate safely using utility function
  const expectedProfit = calculateExpectedProfit(amountNum, plan.returnRate)
  const totalReturn = Math.round((amountNum + expectedProfit) * 100) / 100

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || amountNum <= 0) {
      setError("Please enter a valid investment amount")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const roundedAmount = Math.round(amountNum * 100) / 100
      const res = await fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, amount: roundedAmount, depositMethod: 'bank_transfer' }),
      })
      const data = await res.json()
      if (!res.ok) {
        // Parse error message intelligently
        let errorMsg = "Failed to process your investment"
        
        if (data.error) {
          if (typeof data.error === "string") {
            errorMsg = data.error
          } else if (data.error.message) {
            errorMsg = data.error.message
          }
        }
        
        // Format specific error messages for better UX
        const errorLower = errorMsg.toLowerCase()
        if (errorLower.includes("insufficient balance")) {
          setError("❌ Your account balance is insufficient for this investment. Please deposit more funds first.")
        } else if (errorLower.includes("invalid amount") || errorLower.includes("minimum") || errorLower.includes("maximum")) {
          setError(`❌ Investment amount must be between $${minAmount.toLocaleString()} and $${maxAmount === Infinity ? "unlimited" : maxAmount.toLocaleString()}`)
        } else if (errorLower.includes("not found")) {
          setError("❌ This investment plan is no longer available. Please select another plan.")
        } else if (errorLower.includes("rate limit")) {
          setError("❌ Too many requests. Please wait a moment and try again.")
        } else {
          setError(`❌ ${errorMsg}`)
        }
        return
      }
      setSubmitted(true)
      // Wait for user to see success message before closing dialog
      setTimeout(() => {
        onSuccess()
      }, 1200)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred"
      console.error("investment submit error", err)
      setError(`❌ ${errorMsg}`)
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
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="amount">Investment Amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            $
          </span>
          <Input
            id="amount"
            type="number"
            placeholder={minAmount.toString()}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={minAmount}
            max={maxAmount}
            step="1"
            className="pl-7"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Range: ${minAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} - ${maxAmount === Infinity ? "Unlimited" : maxAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </p>
      </div>

      {!isValid && amount && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {validation.error || "Please enter a valid investment amount"}
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
            <span className="font-medium text-accent">{(plan.returnRate || 0)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Duration:</span>
            <span className="font-medium text-card-foreground">
              {plan.duration || 0} {plan.durationUnit || "months"}
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
