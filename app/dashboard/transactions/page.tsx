"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Transaction } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  RefreshCw,
  Filter,
  X,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react"

const typeIcons = {
  deposit: ArrowUpRight,
  withdrawal: ArrowDownRight,
  investment: TrendingUp,
  return: RefreshCw,
}

const typeColors = {
  deposit: "text-accent",
  withdrawal: "text-destructive",
  investment: "text-foreground",
  return: "text-accent",
}

const typeLabels = {
  deposit: "Deposit",
  withdrawal: "Withdrawal",
  investment: "Investment",
  return: "Return",
}

type FilterType = "all" | "deposit" | "withdrawal" | "investment" | "return"

export default function TransactionsPage() {
  const [filter, setFilter] = useState<FilterType>("all")
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const response = await fetch("/api/transactions")
        if (response.ok) {
          const data = await response.json()
          setUserTransactions(data)
        } else {
          console.error("Failed to fetch transactions")
        }
      } catch (error) {
        console.error("Error fetching transactions:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchTransactions()
  }, [])

  const filtered =
    filter === "all"
      ? userTransactions
      : userTransactions.filter((t) => t.type === filter)

  // Find header section to add back button
  const totalDeposits = userTransactions
    .filter((t) => t.type === "deposit" && t.status === "approved")
    .reduce((sum, t) => sum + (t.amount || 0), 0)
  const totalWithdrawals = userTransactions
    .filter((t) => t.type === "withdrawal" && t.status === "approved")
    .reduce((sum, t) => sum + (t.amount || 0), 0)
  const totalReturns = userTransactions
    .filter((t) => t.type === "return" && t.status === "approved")
    .reduce((sum, t) => sum + (t.amount || 0), 0)

  return (
    <div className="flex flex-col gap-3 sm:gap-4 md:gap-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Transactions
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          View and track all your account activity.
        </p>
      </div>

      {/* Summary cards */}
      {loading ? (
        <div className="grid gap-2 sm:gap-3 md:gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-secondary animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-3 w-20 bg-secondary animate-pulse rounded" />
                    <div className="h-4 w-16 bg-secondary animate-pulse rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-2 sm:gap-3 md:gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <ArrowUpRight className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Deposits</p>
                  <p className="text-lg font-bold text-card-foreground">
                    ${(totalDeposits || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                  <ArrowDownRight className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Total Withdrawals
                  </p>
                  <p className="text-lg font-bold text-card-foreground">
                    ${(totalWithdrawals || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <RefreshCw className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Returns</p>
                  <p className="text-lg font-bold text-card-foreground">
                    ${(totalReturns || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and list */}
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <Filter className="h-4 w-4 text-muted-foreground" />
            All Transactions
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {(
              ["all", "deposit", "withdrawal", "investment", "return"] as const
            ).map((type) => (
              <Button
                key={type}
                variant={filter === type ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(type)}
                className="text-xs capitalize"
              >
                {type === "all" ? "All" : typeLabels[type]}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-border p-3 sm:p-4 animate-pulse">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="h-10 w-10 rounded-lg bg-secondary flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 bg-secondary rounded" />
                        <div className="h-3 w-1/2 bg-secondary rounded" />
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center justify-between sm:justify-start gap-2">
                      <div className="h-4 w-16 bg-secondary rounded" />
                      <div className="h-5 w-12 bg-secondary rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No transactions found for this filter.
              </p>
            ) : (
              filtered.map((tx) => {
                const Icon = typeIcons[tx.type as keyof typeof typeIcons]
                const color = typeColors[tx.type as keyof typeof typeColors]
                const isPositive =
                  tx.type === "deposit" || tx.type === "return"
                return (
                  <div
                    key={tx.id}
                    onClick={() => setSelectedTransaction(tx)}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-3 rounded-lg border border-border p-3 sm:p-4 transition-all hover:bg-secondary/50 hover:border-accent/50 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-secondary group-hover:bg-secondary/80 transition-colors">
                        <Icon className={`h-4 w-4 ${color}`} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate text-xs sm:text-sm font-medium text-card-foreground group-hover:text-accent transition-colors">
                          {tx.description}
                        </p>
                        
                        {/* Show withdrawal fee if applicable */}
                        {tx.type === "withdrawal" && (tx as any).withdrawalFee && (
                          <p className="text-xs text-destructive/80 mt-0.5">
                            Fee: ${((tx as any).withdrawalFee).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span>{tx.date}</span>
                          <span>{"/"}</span>
                          <span className="capitalize">{tx.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
                      <p
                        className={`text-xs sm:text-sm font-semibold ${isPositive ? "text-accent" : "text-card-foreground"}`}
                      >
                        {isPositive ? "+" : "-"}$
                        {tx.amount.toLocaleString()}
                      </p>
                      <Badge
                        variant={
                          tx.status === "approved"
                            ? "secondary"
                            : tx.status === "pending"
                              ? "outline"
                              : "destructive"
                        }
                        className="text-[10px] px-1.5 py-0"
                      >
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-6"
          onClick={() => setSelectedTransaction(null)}
        >
          <div 
            className="bg-card rounded-xl max-w-2xl w-full shadow-2xl border border-border overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Professional Gradient Background */}
            <div className="bg-gradient-to-r from-card to-secondary/30 p-6 border-b border-border/50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  {(() => {
                    const Icon = typeIcons[selectedTransaction.type as keyof typeof typeIcons]
                    const color = typeColors[selectedTransaction.type as keyof typeof typeColors]
                    return (
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary/60 border border-border/50">
                        <Icon className={`h-7 w-7 ${color}`} />
                      </div>
                    )
                  })()}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold text-foreground capitalize">
                      {typeLabels[selectedTransaction.type as keyof typeof typeLabels]}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">{selectedTransaction.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Amount Section - Prominent Display */}
              <div className="bg-gradient-to-br from-secondary/50 to-secondary/20 rounded-xl p-6 border border-border/50">
                <p className="text-sm text-muted-foreground mb-2">Transaction Amount</p>
                <p className={`text-4xl font-bold ${selectedTransaction.type === "deposit" || selectedTransaction.type === "return" ? "text-accent" : "text-foreground"}`}>
                  {selectedTransaction.type === "deposit" || selectedTransaction.type === "return" ? "+" : "-"}
                  ${selectedTransaction.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>

              {/* Withdrawal Fee Breakdown (if applicable) */}
              {selectedTransaction.type === "withdrawal" && (selectedTransaction as any).withdrawalFee && (
                <div className="space-y-2 p-4 rounded-lg bg-destructive/5 border border-destructive/15">
                  <p className="text-sm font-semibold text-destructive">Fee Breakdown</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-muted-foreground">Requested Amount:</span>
                      <span className="font-semibold">${selectedTransaction.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                    {(selectedTransaction as any).withdrawalFee && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-muted-foreground">Withdrawal Fee (5%):</span>
                        <span className="font-semibold text-destructive">-${((selectedTransaction as any).withdrawalFee).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    {(selectedTransaction as any).amountAfterFee && (
                      <div className="flex justify-between items-center py-2 border-t border-destructive/20">
                        <span className="text-foreground font-semibold">Net Amount Received:</span>
                        <span className="font-bold text-lg">${((selectedTransaction as any).amountAfterFee).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Cryptocurrency Details (if applicable) */}
              {selectedTransaction.type === "withdrawal" && (selectedTransaction as any).coin && (selectedTransaction as any).coinAmount && (
                <div className="space-y-2 p-4 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/30 dark:border-blue-800/30">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Cryptocurrency Details</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Currency:</span>
                      <span className="font-semibold">{(selectedTransaction as any).coin.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Crypto Amount:</span>
                      <span className="font-mono font-semibold">{((selectedTransaction as any).coinAmount as number).toFixed(8)} {(selectedTransaction as any).coin.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Address Information */}
              {((selectedTransaction as any).cryptoAddress || (selectedTransaction as any).bankAccount) && (
                <div className="space-y-3 p-4 rounded-lg bg-slate-50/50 dark:bg-slate-900/20 border border-border/50">
                  <p className="text-sm font-semibold">Address Details</p>
                  {(selectedTransaction as any).cryptoAddress && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Crypto Address</p>
                      <p className="font-mono text-xs bg-secondary p-3 rounded border border-border/50 break-all">
                        {(selectedTransaction as any).cryptoAddress}
                      </p>
                    </div>
                  )}
                  {(selectedTransaction as any).bankAccount && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Bank Account</p>
                      <p className="font-mono text-xs bg-secondary p-3 rounded border border-border/50 break-all">
                        {(selectedTransaction as any).bankAccount}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Date and Time - Separated */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Date</p>
                  <p className="text-sm font-semibold mt-2">
                    {selectedTransaction.date ? new Date(selectedTransaction.date).toLocaleDateString('en-US', { 
                      weekday: 'short',
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    }) : 'N/A'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Time</p>
                  <p className="text-sm font-semibold mt-2">
                    {selectedTransaction.date ? new Date(selectedTransaction.date).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true
                    }) : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Status and Method */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Status</p>
                  <Badge
                    variant={
                      selectedTransaction.status === "approved"
                        ? "secondary"
                        : selectedTransaction.status === "pending"
                          ? "outline"
                          : "destructive"
                    }
                    className="w-fit"
                  >
                    <span className={`h-2 w-2 rounded-full mr-2 ${
                      selectedTransaction.status === "approved" ? "bg-green-500" :
                      selectedTransaction.status === "pending" ? "bg-yellow-500" :
                      "bg-red-500"
                    }`}></span>
                    {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                  </Badge>
                </div>
                {(selectedTransaction as any).method && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Method</p>
                    <p className="text-sm font-semibold capitalize bg-secondary/50 px-3 py-2 rounded border border-border/50 w-fit">
                      {(selectedTransaction as any).method}
                    </p>
                  </div>
                )}
              </div>

              {/* Transaction ID - Reference Number */}
              <div className="border-t border-border/50 pt-4">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">Transaction Reference</p>
                <div className="bg-secondary/30 rounded-lg p-4 border border-border/50 group">
                  <p className="font-mono text-xs text-foreground break-all font-semibold">
                    {selectedTransaction.id}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedTransaction.id)
                    }}
                    className="text-xs text-accent hover:text-accent/80 mt-2 transition-colors"
                    title="Copy to clipboard"
                  >
                    Copy Reference
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <Button
                onClick={() => setSelectedTransaction(null)}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
