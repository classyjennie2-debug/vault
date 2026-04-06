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
import { TransactionDetailModal } from "./transaction-detail-modal"
import { useI18n } from "@/hooks/use-i18n"

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
  const { t: tDashboard } = useI18n("dashboardmain")
  const { t: tTransactions } = useI18n("transactions")
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const pageSize = 5

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

  return (
    <Card className="card-professional border-l-4 border-l-accent/30 shadow-elevation-2 overflow-hidden hover:shadow-elevation-3 transition-smooth">
      <CardHeader className="flex flex-row items-center justify-between divider-subtle pb-2 sm:pb-3">
        <CardTitle className="h-section flex items-center gap-2 text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
          <Clock className="h-5 w-5 text-accent flex-shrink-0" />
          <span className="truncate">{tDashboard("recent_transactions")}</span>
        </CardTitle>
        <Link
          href="/dashboard/transactions"
          className="link-professional text-[10px] sm:text-xs font-semibold text-accent hover:text-accent/80 flex items-center gap-0.5 transition-smooth flex-shrink-0"
        >
          {tDashboard("view_all")}
          <Eye className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
        </Link>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 sm:gap-3 pt-3 sm:pt-4 lg:pt-6">
        {loading ? (
          <div className="flex items-center justify-center py-6 sm:py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        ) : userTransactions.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm body-secondary">
            {tTransactions("no_recent_transactions")}
          </div>
        ) : (
          userTransactions.slice(page * pageSize, page * pageSize + pageSize).map((tx, idx) => {
            const Icon = typeIcons[tx.type as keyof typeof typeIcons] || TrendingUp
            const bgColor = typeBgColors[tx.type as keyof typeof typeBgColors] || "bg-primary/10 text-primary"
            const isPositive = tx.type === "deposit" || tx.type === "return"
            const statusColor = statusColors[tx.status as keyof typeof statusColors] || statusColors.approved
            
            // Display deposit status differently: initiated vs approved
            let displayStatus = tx.status
            if (tx.type === "deposit" && tx.status === "pending") {
              displayStatus = tTransactions("initiated")
            }
            
            return (
              <div
                key={tx.id}
                onClick={() => setSelectedTransaction(tx)}
                className="group flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-accent/5 dark:hover:bg-accent/10 border-l-4 border-l-accent/20 hover:border-l-accent/50 transition-smooth cursor-pointer shadow-elevation-1 hover:shadow-elevation-2 animate-fade-in"
                style={{ animationDelay: `${idx * 75}ms` }}
              >
                <div className={`flex h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-lg ${bgColor} group-hover:scale-110 transition-smooth font-bold shadow-elevation-1`}>
                  <Icon className={`h-3.5 w-3.5 sm:h-5 sm:w-5`} />
                </div>
                <div className="flex-1 overflow-hidden min-w-0">
                  <p className="truncate text-xs sm:text-sm font-semibold text-card-foreground group-hover:text-accent transition-smooth">
                    {tTransactions(tx.type)}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground/70 truncate body-secondary">{tx.date}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-1">
                  <p
                    className={`text-xs sm:text-sm font-bold transition-smooth whitespace-nowrap data-value ${
                      isPositive ? "text-emerald-600 dark:text-emerald-500" : "text-slate-900 dark:text-slate-100"
                    }`}
                  >
                    {isPositive ? "+" : "-"}$
                    {(tx.amount || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                  <Badge
                    className={`text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 font-semibold border transition-smooth ${statusColor}`}
                  >
                    {displayStatus}
                  </Badge>
                </div>
              </div>
            )
          })
        )}
        {!loading && userTransactions.length > pageSize && (
          <div className="flex items-center justify-between pt-3 sm:pt-4 divider-subtle border-t">
            <button
              className="text-xs text-muted-foreground hover:text-accent disabled:opacity-40 transition-smooth hover:font-semibold"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              {tTransactions("previous")}
            </button>
            <p className="text-[11px] text-muted-foreground body-secondary">
              {tTransactions("page")} {page + 1} / {Math.ceil(userTransactions.length / pageSize)}
            </p>
            <button
              className="text-xs text-muted-foreground hover:text-accent disabled:opacity-40 transition-smooth hover:font-semibold"
              onClick={() => setPage((p) => (p + 1 < Math.ceil(userTransactions.length / pageSize) ? p + 1 : p))}
              disabled={page + 1 >= Math.ceil(userTransactions.length / pageSize)}
            >
              {tTransactions("next")}
            </button>
          </div>
        )}
      </CardContent>

      <TransactionDetailModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </Card>
  )
}
