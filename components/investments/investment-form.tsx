"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/hooks/use-i18n"
import type { InvestmentPlan } from "@/lib/types"
import { AlertCircle, Check } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { safeNumber, validateInvestmentAmount, calculateExpectedProfit, calculateReturnRate } from "@/lib/investment-utils"

interface InvestmentFormProps {
  plan: InvestmentPlan
  onSuccess: () => void
}

export function InvestmentForm({ plan, onSuccess }: InvestmentFormProps) {
  const { t } = useI18n('investments')
  // Safe plan values with proper null checking
  const minAmount = safeNumber(plan.minAmount, 100)
  const maxAmount = safeNumber(plan.maxAmount, Infinity)
  // Ensure initial amount is always at least minAmount and at least 100
  const initialAmount = Math.max(minAmount, 100)

  const [amount, setAmount] = useState<string>(initialAmount.toString())
  const [duration, setDuration] = useState<number>(365) // default 1 year
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const amountNum = safeNumber(amount, 0)
  const durationNum = safeNumber(duration, 7)

  // Use the imported validation function for min/max checking
  const validation = validateInvestmentAmount(amountNum, minAmount, maxAmount)
  const isValid = validation.isValid && amountNum > 0 && durationNum >= 7

  // Calculate dynamic return rate based on plan type
  const planTypeToUse = plan.planType || "Conservative Bond Fund"
  const dynamicReturnRate = calculateReturnRate(durationNum, planTypeToUse)
  // Calculate expected profit based on dynamic return rate
  const expectedProfit = calculateExpectedProfit(amountNum, dynamicReturnRate)
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
        body: JSON.stringify({ planId: plan.id, amount: roundedAmount, duration: durationNum, depositMethod: 'bank_transfer' }),
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
            {t('investment_confirmed')}
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Your investment of ${amountNum.toLocaleString()} {t('has_been_started')}.
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
        <Label htmlFor="amount">{t('investmentAmount')}</Label>
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

      <div className="space-y-2">
        <Label htmlFor="duration">{t('duration')}</Label>
        <select
          id="duration"
          value={duration}
          onChange={e => setDuration(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-800 text-foreground"
        >
          <option value={365}>365 Days (12 Months) - Recommended</option>
          <option value={180}>180 Days (6 months)</option>
          <option value={90}>90 Days (3 months)</option>
          <option value={60}>60 Days (2 months)</option>
          <option value={30}>30 Days (1 month)</option>
          <option value={14}>14 Days (2 weeks)</option>
          <option value={7}>7 Days</option>
        </select>
        <p className="text-xs text-muted-foreground">
          Longer duration = higher profit! 12 months gives maximum returns.
        </p>
      </div>

      {!isValid && amount && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {validation.error || "Please enter a valid investment amount and duration (min 7 days)"}
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-accent/10 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-sm text-card-foreground">
          {t('investment_summary')}
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('investment_amount_label')}:</span>
            <span className="font-medium text-card-foreground">
              ${amountNum.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('return_rate')}:</span>
            <span className="font-medium text-accent">{dynamicReturnRate.toFixed(2)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('duration')}:</span>
            <span className="font-medium text-card-foreground">
              {durationNum} days
            </span>
          </div>
          <div className="border-t border-border pt-2 mt-2 flex justify-between">
            <span className="font-semibold text-card-foreground">
              {t('expected_profit')}:
            </span>
            <span className="font-bold text-accent">
              ${expectedProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-card-foreground">
              {t('total_return')}:
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
        {isLoading ? t('processing') : t('confirm_investment')}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        {t('will_start_immediately')}
      </p>
    </form>
  )
}
