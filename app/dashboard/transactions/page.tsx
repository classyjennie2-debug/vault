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
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedTransaction(null)}
        >
          <div 
            className="bg-card rounded-lg max-w-md w-full shadow-2xl border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
              <h2 className="text-lg sm:text-xl font-bold">Transaction Details</h2>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 space-y-6">
              {/* Transaction Type and Icon */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = typeIcons[selectedTransaction.type as keyof typeof typeIcons]
                    const color = typeColors[selectedTransaction.type as keyof typeof typeColors]
                    return (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                        <Icon className={`h-6 w-6 ${color}`} />
                      </div>
                    )
                  })()}
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-semibold capitalize">{typeLabels[selectedTransaction.type as keyof typeof typeLabels]}</p>
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Amount
                </p>
                <p className={`text-2xl font-bold ${selectedTransaction.type === "deposit" || selectedTransaction.type === "return" ? "text-accent" : "text-card-foreground"}`}>
                  {selectedTransaction.type === "deposit" || selectedTransaction.type === "return" ? "+" : "-"}
                  ${selectedTransaction.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>

              {/* Withdrawal Fee (if applicable) */}
              {selectedTransaction.type === "withdrawal" && (selectedTransaction as any).withdrawalFee && (
                <div className="space-y-2 p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                  <p className="text-sm font-medium text-destructive">Withdrawal Details</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gross Amount:</span>
                      <span className="font-medium">${selectedTransaction.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                    {(selectedTransaction as any).withdrawalFee && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fee (5%):</span>
                        <span className="font-medium text-destructive">-${((selectedTransaction as any).withdrawalFee).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    {(selectedTransaction as any).amountAfterFee && (
                      <div className="flex justify-between border-t border-destructive/20 pt-1">
                        <span className="text-muted-foreground font-medium">Net Amount:</span>
                        <span className="font-semibold">${((selectedTransaction as any).amountAfterFee).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Cryptocurrency Details (if applicable) */}
              {selectedTransaction.type === "withdrawal" && (selectedTransaction as any).coin && (selectedTransaction as any).coinAmount && (
                <div className="space-y-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200/30 dark:border-blue-800/30">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Cryptocurrency</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Currency:</span>
                      <span className="font-medium">{(selectedTransaction as any).coin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-medium font-mono">{((selectedTransaction as any).coinAmount as number).toFixed(8)} {(selectedTransaction as any).coin}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{selectedTransaction.description}</p>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date
                </p>
                <p className="font-medium">{selectedTransaction.date}</p>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  {selectedTransaction.status === "approved" ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : selectedTransaction.status === "pending" ? (
                    <Clock className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  )}
                  Status
                </p>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      selectedTransaction.status === "approved"
                        ? "secondary"
                        : selectedTransaction.status === "pending"
                          ? "outline"
                          : "destructive"
                    }
                  >
                    {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                  </Badge>
                </div>
              </div>

              {/* Transaction ID */}
              <div className="space-y-1 pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground">Transaction ID</p>
                <p className="font-mono text-xs text-card-foreground break-all">{selectedTransaction.id}</p>
              </div>

              {/* Close Button */}
              <Button
                onClick={() => setSelectedTransaction(null)}
                className="w-full mt-4"
                variant="outline"
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
