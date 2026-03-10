"use client"

import { useState } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"

export default function WithdrawPage() {
  const [amount, setAmount] = useState<string>("")
  const [method, setMethod] = useState<string>("bank")
  const [bankAccount, setBankAccount] = useState<string>("")
  const [cryptoAddress, setCryptoAddress] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string>("")

  const availableBalance = 9000
  const amountNum = parseFloat(amount) || 0
  const isValidAmount =
    amountNum > 0 && amountNum <= availableBalance && amount !== ""

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!isValidAmount) {
      setError("Please enter a valid withdrawal amount")
      return
    }

    if (method === "bank" && !bankAccount) {
      setError("Please enter your bank account information")
      return
    }

    if (method === "crypto" && !cryptoAddress) {
      setError("Please enter a valid crypto address")
      return
    }

    setIsSubmitting(true)
    // Call API
    const res = await fetch("/api/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: amountNum,
        method,
        bankAccount: method === "bank" ? bankAccount : undefined,
        cryptoAddress: method === "crypto" ? cryptoAddress : undefined,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || "Something went wrong")
      setIsSubmitting(false)
      return
    }
    setIsSubmitting(false)
    setSubmitted(true)

    // Reset after 3 seconds
    setTimeout(() => {
      setSubmitted(false)
      setAmount("")
      setBankAccount("")
      setCryptoAddress("")
      setMethod("bank")
    }, 3000)
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-accent hover:underline text-sm mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <Card>
          <CardContent className="pt-12">
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-card-foreground">
                  Withdrawal Pending
                </h2>
                <p className="text-muted-foreground mt-2">
                  Your withdrawal request of ${amountNum.toLocaleString()} has been submitted
                </p>
              </div>

              <Alert className="mt-6 bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Your withdrawal will be processed within 1-2 business days. You'll
                  receive a confirmation email shortly.
                </AlertDescription>
              </Alert>

              <div className="space-y-2 text-sm mt-6 w-full">
                <div className="flex justify-between p-3 bg-secondary rounded">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-semibold">
                    ${amountNum.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-secondary rounded">
                  <span className="text-muted-foreground">Method:</span>
                  <span className="font-semibold capitalize">
                    {method === "bank" ? "Bank Transfer" : "Crypto"}
                  </span>
                </div>
              </div>

              <Link href="/dashboard">
                <Button className="w-full mt-6">Return to Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-accent hover:underline text-sm mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Withdraw Funds</CardTitle>
          <CardDescription>
            Request a withdrawal from your account to your preferred method
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Available Balance */}
            <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-3xl font-bold text-card-foreground mt-1">
                ${availableBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>

            {/* Withdrawal Method */}
            <div className="space-y-2">
              <Label htmlFor="method">Withdrawal Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger id="method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="crypto">Cryptocurrency</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {method === "bank"
                  ? "Funds will be transferred to your bank account within 1-2 business days"
                  : "Send crypto directly to your wallet address"}
              </p>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Withdrawal Amount ($)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  max={availableBalance}
                  step="100"
                  className="pl-7"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Maximum: ${availableBalance.toLocaleString()}
              </p>
            </div>

            {/* Method-specific fields */}
            {method === "bank" ? (
              <div className="space-y-2">
                <Label htmlFor="bank-account">Bank Account Details</Label>
                <Textarea
                  id="bank-account"
                  placeholder="Enter your bank account details (Account Number, Routing Number, Bank Name, Account Holder Name)"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="h-24 resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Your banking information is encrypted and secure
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Select defaultValue="">
                  <SelectTrigger className="mb-2">
                    <SelectValue placeholder="Select cryptocurrency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usdt">USDT</SelectItem>
                    <SelectItem value="btc">Bitcoin</SelectItem>
                    <SelectItem value="eth">Ethereum</SelectItem>
                    <SelectItem value="bnb">BNB</SelectItem>
                  </SelectContent>
                </Select>

                <Label htmlFor="crypto-address">Wallet Address</Label>
                <Input
                  id="crypto-address"
                  placeholder="Enter your crypto wallet address"
                  value={cryptoAddress}
                  onChange={(e) => setCryptoAddress(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Make sure the address matches the cryptocurrency you selected
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Summary */}
            {isValidAmount && (
              <div className="bg-secondary rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-sm text-card-foreground">
                  Withdrawal Summary
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-semibold">
                      ${amountNum.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Processing Fee:</span>
                    <span className="font-semibold">$0</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2">
                    <span className="font-semibold">You'll receive:</span>
                    <span className="font-bold text-accent">
                      ${amountNum.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={!isValidAmount || isSubmitting}
              size="lg"
            >
              {isSubmitting ? "Processing..." : "Request Withdrawal"}
            </Button>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Withdrawals are processed within 1-2 business days. You'll receive a
                confirmation email with the transaction details.
              </AlertDescription>
            </Alert>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
