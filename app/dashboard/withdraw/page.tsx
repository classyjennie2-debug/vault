"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  type CoinType,
  coinDetails,
} from "@/lib/types"
import { CoinIcon } from "@/components/crypto/coin-icon"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

const coins: CoinType[] = ["USDT", "BTC", "ETH", "BNB", "TRX", "SOL"]

export default function WithdrawPage() {
  const [selectedCoin, setSelectedCoin] = useState<CoinType | null>(null)
  const [amount, setAmount] = useState<string>("")
  const [cryptoAddress, setCryptoAddress] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string>("")
  const [availableBalance, setAvailableBalance] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchBalance() {
      try {
        const response = await fetch("/api/user/balance")
        if (response.ok) {
          const data = await response.json()
          setAvailableBalance(data.availableBalance)
        }
      } catch (err) {
        console.error("Failed to fetch balance:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchBalance()
  }, [])

  const amountNum = parseFloat(amount) || 0
  const isValidAmount =
    amountNum > 0 && amountNum <= availableBalance && amount !== ""
  const isValid = selectedCoin && cryptoAddress && isValidAmount && !isSubmitting

  const handleCoinSelect = (coin: CoinType) => {
    setSelectedCoin(coin)
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!isValid) {
      setError("Please select a coin, enter a valid amount, and provide a withdrawal address")
      return
    }

    const trimmedAddress = cryptoAddress.trim()
    if (!trimmedAddress || trimmedAddress.length < 20) {
      setError(`Please enter a valid ${selectedCoin} address (min 20 characters)`)
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountNum > 0 ? Math.round(amountNum * 100) / 100 : 0,
          method: "crypto",
          cryptoAddress: trimmedAddress,
          coin: selectedCoin,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Something went wrong")
        return
      }
      setSubmitted(true)
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred. Please try again."
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="flex flex-col gap-3 sm:gap-4 md:gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to dashboard</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Withdraw Crypto
            </h1>
          </div>
        </div>

        <Card className="border-green-500/20 bg-green-50/50 dark:bg-green-950/20">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center gap-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-100">
                  Withdrawal Request Submitted!
                </h3>
                <p className="text-sm text-green-800/70 dark:text-green-200/70 mt-1">
                  Your withdrawal of ${amountNum.toLocaleString()} has been submitted for processing.
                  You'll receive your {selectedCoin} shortly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4 md:gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to dashboard</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Withdraw Crypto
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Select a coin, enter your address, and amount to withdraw.
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-500/50 bg-red-50/50 dark:bg-red-950/20">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Step 1 - Select Coin */}
      <Card>
        <CardHeader className="pb-2 sm:pb-3 md:pb-4">
          <CardTitle className="text-sm sm:text-base">
            <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              1
            </span>
            Select Cryptocurrency
          </CardTitle>
          <CardDescription>
            Choose the cryptocurrency you want to withdraw.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5 md:gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {coins.map((coin) => {
              const details = coinDetails[coin]
              const isSelected = selectedCoin === coin
              return (
                <button
                  key={coin}
                  type="button"
                  onClick={() => handleCoinSelect(coin)}
                  className={`flex flex-col items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl border-2 p-2 sm:p-3 md:p-4 transition-all ${
                    isSelected
                      ? "border-accent bg-accent/5 shadow-sm"
                      : "border-border bg-card hover:border-muted-foreground/30 hover:bg-secondary/50"
                  }`}
                >
                  <CoinIcon coin={coin} size={32} />
                  <div className="text-center">
                    <p
                      className={`text-xs sm:text-sm font-semibold ${isSelected ? "text-foreground" : "text-card-foreground"}`}
                    >
                      {coin}
                    </p>
                    <p className="text-[9px] sm:text-[11px] text-muted-foreground">
                      {details.name}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step 2 - Enter Details */}
      {selectedCoin && (
        <Card className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <CardHeader className="pb-2 sm:pb-3 md:pb-4">
            <CardTitle className="text-sm sm:text-base">
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                2
              </span>
              Withdrawal Details
            </CardTitle>
            <CardDescription>
              Enter your {selectedCoin} address and the amount you want to withdraw.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium">
                Withdrawal Amount (USD)
              </Label>
              <div className="space-y-1.5">
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  max={availableBalance}
                  step="0.01"
                  min="0"
                  className="border-border"
                />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Available: ${availableBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAmount(availableBalance.toString())}
                    className="text-accent hover:text-accent/80 font-medium"
                  >
                    Max
                  </button>
                </div>
              </div>
            </div>

            {/* Crypto Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium">
                {selectedCoin} Withdrawal Address
              </Label>
              <Input
                id="address"
                type="text"
                placeholder={`Enter your ${selectedCoin} address`}
                value={cryptoAddress}
                onChange={(e) => setCryptoAddress(e.target.value)}
                className="border-border font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground/70">
                Make sure this is correct. Withdrawals sent to wrong addresses cannot be recovered.
              </p>
            </div>

            {/* Summary */}
            {isValidAmount && selectedCoin && (
              <div className="mt-6 rounded-lg bg-secondary/50 p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Amount to Withdraw:</span>
                  <span className="font-semibold text-foreground">${amountNum.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Coin:</span>
                  <span className="font-semibold text-foreground">{selectedCoin}</span>
                </div>
                <div className="border-t border-border/30 pt-2 mt-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">Pending Review</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      {selectedCoin && (
        <div className="flex gap-3">
          <Button
            variant="outline"
            asChild
            className="flex-1"
          >
            <Link href="/dashboard">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={!isValid}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Request Withdrawal"
            )}
          </Button>
        </div>
      )}
    </form>
  )
}
