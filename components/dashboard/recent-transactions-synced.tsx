"use client"

import { useDashboard } from "@/contexts/dashboard-context"
import { ArrowUpRight, ArrowDownLeft, TrendingUp } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { TransactionDetailModal } from "./transaction-detail-modal"
import { formatTransactionStatus } from "@/lib/transaction-utils"

export function RecentTransactionsSynced() {
  const { recentTransactions, isLoading } = useDashboard()
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)

  if (!recentTransactions || recentTransactions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          {isLoading && (
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2.5 py-1.5 rounded-full font-medium">
              Syncing...
            </span>
          )}
        </div>
        <div className="text-center py-12">
          <TrendingUp className="w-10 h-10 text-slate-300 dark:text-slate-500 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">No transactions yet. Start investing to see your activity here.</p>
        </div>
      </div>
    )
  }

  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      deposit: "Deposit",
      withdrawal: "Withdrawal",
      investment: "Investment",
      return: "Return",
    }
    return labels[type] || type
  }

  const getIconColor = (status: string, type: string) => {
    if (status === 'pending') return 'text-amber-600 dark:text-amber-400'
    if (type === 'withdrawal') return 'text-blue-600 dark:text-blue-400'
    return 'text-emerald-600 dark:text-emerald-400'
  }

  const getBackgroundColor = (status: string, type: string) => {
    if (status === 'pending') return 'bg-amber-50 dark:bg-amber-950/30'
    if (type === 'withdrawal') return 'bg-blue-50 dark:bg-blue-950/30'
    return 'bg-emerald-50 dark:bg-emerald-950/30'
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-0 dark:from-slate-700 dark:to-slate-800">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Transactions</h3>
          {isLoading && (
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2.5 py-1.5 rounded-full font-medium">
              Updating...
            </span>
          )}
        </div>

        {/* Transaction List */}
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {recentTransactions.map((tx: any, idx: number) => (
            <button
              key={tx.id || idx}
              onClick={() => setSelectedTransaction(tx)}
              className="w-full px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-150 group text-left focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-inset"
            >
              <div className="flex items-center justify-between gap-4">
                {/* Left: Icon + Transaction Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Icon */}
                  <div className={`flex-shrink-0 p-2.5 rounded-lg ${getBackgroundColor(tx.status, tx.type)}`}>
                    {tx.type === 'withdrawal' ? (
                      <ArrowDownLeft className={`w-5 h-5 ${getIconColor(tx.status, tx.type)}`} />
                    ) : (
                      <ArrowUpRight className={`w-5 h-5 ${getIconColor(tx.status, tx.type)}`} />
                    )}
                  </div>

                  {/* Transaction Type & Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-accent transition-colors">
                      {getTransactionTypeLabel(tx.type)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(tx.date || tx.created_at).toLocaleDateString('en-US', { 
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(tx.date || tx.created_at).toLocaleTimeString([], { 
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: Amount + Status */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  {/* Amount */}
                  <div className="text-right">
                    <p className={`font-semibold text-sm ${
                      tx.type === 'withdrawal'
                        ? 'text-slate-700 dark:text-slate-300'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {tx.type === 'withdrawal' ? '−' : '+'}${tx.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <Badge
                    className={`text-xs font-semibold px-3 py-1 flex-shrink-0 ${
                      tx.status === 'approved'
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                        : tx.status === 'pending'
                          ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                          : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40'
                    }`}
                  >
                    {formatTransactionStatus(tx.status)}
                  </Badge>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-0 dark:from-slate-700/50 dark:to-slate-800 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing {recentTransactions.length} most recent transactions • <a href="/dashboard/transactions" className="text-accent hover:underline">View All</a>
          </p>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </>
  )
}
