"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight, TrendingUp, RefreshCw, Clock, Eye } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import type { Transaction } from "@/lib/types"

const typeIcons = {
  deposit: ArrowUpRight,
  withdrawal: ArrowDownRight,
  investment: TrendingUp,
  return: RefreshCw,
}

const typeBgColors = {
  deposit: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  withdrawal: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  investment: "bg-primary/10 text-primary",
  return: "bg-accent/10 text-accent",
}

const statusColors = {
  approved: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  rejected: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20",
}

export function RecentTransactions() {
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const response = await fetch("/api/transactions")
        if (response.ok) {
          const data = await response.json()
          setUserTransactions(data.slice(0, 5))
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

  return (
    <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 animate-in fade-in slide-in-from-right duration-700">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 dark:border-slate-700">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
          <Clock className="h-4 w-4 text-primary" />
          Recent Transactions
        </CardTitle>
        <Link
          href="/dashboard/transactions"
          className="text-xs font-semibold text-accent hover:text-accent/80 hover:underline flex items-center gap-1 transition-colors duration-300"
        >
          View all
          <Eye className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : userTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No recent transactions
          </div>
        ) : (
          userTransactions.map((tx, idx) => {
            const Icon = typeIcons[tx.type as keyof typeof typeIcons]
            const bgColor = typeBgColors[tx.type as keyof typeof typeBgColors]
            const isPositive = tx.type === "deposit" || tx.type === "return"
            const statusColor = statusColors[tx.status as keyof typeof statusColors] || statusColors.approved
            return (
              <div
                key={tx.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-l-2 hover:border-l-primary transition-all duration-300 group animate-in fade-in slide-in-from-left duration-500"
              style={{ animationDelay: `${idx * 75}ms` }}
            >
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${bgColor} group-hover:scale-110 transition-transform duration-300 font-bold`}>
                <Icon className={`h-5 w-5`} />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-semibold text-card-foreground group-hover:text-accent transition-colors">
                  {tx.description}
                </p>
                <p className="text-xs text-muted-foreground/70">{tx.date}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <p
                  className={`text-sm font-bold transition-colors duration-300 ${
                    isPositive ? "text-emerald-600 dark:text-emerald-500" : "text-slate-900 dark:text-slate-100"
                  }`}
                >
                  {isPositive ? "+" : "-"}$
                  {(tx.amount || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
                <Badge
                  className={`text-[10px] px-2 py-0.5 font-semibold border ${statusColor}`}
                >
                  {tx.status}
                </Badge>
              </div>
            </div>
          )
        })
        )}
      </CardContent>
    </Card>
  )
}
