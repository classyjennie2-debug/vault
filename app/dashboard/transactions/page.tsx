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

  const totalDeposits = userTransactions
    .filter((t) => t.type === "deposit" && t.status === "approved")
    .reduce((sum, t) => sum + t.amount, 0)
  const totalWithdrawals = userTransactions
    .filter((t) => t.type === "withdrawal" && t.status === "approved")
    .reduce((sum, t) => sum + t.amount, 0)
  const totalReturns = userTransactions
    .filter((t) => t.type === "return" && t.status === "approved")
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Transactions
        </h1>
        <p className="text-sm text-muted-foreground">
          View and track all your account activity.
        </p>
      </div>

      {/* Summary cards */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
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
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <ArrowUpRight className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Deposits</p>
                  <p className="text-lg font-bold text-card-foreground">
                    ${totalDeposits.toLocaleString()}
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
                    ${totalWithdrawals.toLocaleString()}
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
                    ${totalReturns.toLocaleString()}
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
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-4">
                    <div className="h-10 w-10 rounded-lg bg-secondary animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-secondary animate-pulse rounded" />
                      <div className="h-3 w-1/2 bg-secondary animate-pulse rounded" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-16 bg-secondary animate-pulse rounded" />
                      <div className="h-5 w-12 bg-secondary animate-pulse rounded" />
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
                    className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-secondary/50"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-secondary">
                      <Icon className={`h-4 w-4 ${color}`} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium text-card-foreground">
                        {tx.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{tx.date}</span>
                        <span>{"/"}</span>
                        <span className="capitalize">{tx.type}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p
                        className={`text-sm font-semibold ${isPositive ? "text-accent" : "text-card-foreground"}`}
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
    </div>
  )
}
