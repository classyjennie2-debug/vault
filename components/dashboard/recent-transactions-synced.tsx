"use client"

import { useDashboard } from "@/contexts/dashboard-context"
import { ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { TransactionDetailModal } from "./transaction-detail-modal"
import { formatTransactionStatus } from "@/lib/transaction-utils"

export function RecentTransactionsSynced() {
  const { recentTransactions, isLoading } = useDashboard()
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)

  if (!recentTransactions || recentTransactions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 md:p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        <div className="text-center py-8">
          <p className="text-slate-500 dark:text-slate-400">No transactions yet</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 md:p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
          Recent Transactions
          {isLoading && (
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
              Syncing...
            </span>
          )}
        </h3>
        <div className="space-y-3">
          {recentTransactions.map((tx: any, idx: number) => (
            <button
              key={tx.id || idx}
              onClick={() => setSelectedTransaction(tx)}
              className="w-full text-left flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-all duration-200 group cursor-pointer active:scale-95"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className={`p-2 rounded-lg transition-transform group-hover:scale-110 ${
                  tx.status === 'pending'
                    ? 'bg-yellow-100 dark:bg-yellow-900'
                    : tx.type === 'deposit' || tx.type === 'investment'
                      ? 'bg-emerald-100 dark:bg-emerald-900'
                      : tx.type === 'withdrawal'
                        ? 'bg-blue-100 dark:bg-blue-900'
                        : tx.type === 'return'
                          ? 'bg-amber-100 dark:bg-amber-900'
                          : 'bg-purple-100 dark:bg-purple-900'
                }`}>
                  {tx.type === 'withdrawal' ? (
                    <ArrowDownLeft className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm capitalize group-hover:text-primary transition-colors">{tx.type}</p>
                  <div className="mt-1">
                    <Badge
                      className={`text-xs font-medium ${
                        tx.status === 'approved'
                          ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900'
                          : tx.status === 'pending'
                            ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900'
                            : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900'
                      }`}
                    >
                      {formatTransactionStatus(tx.status)}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold text-sm transition-colors ${
                  tx.type === 'withdrawal'
                    ? 'text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300'
                    : 'text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300'
                }`}>
                  {tx.type === 'withdrawal' ? '-' : '+'}${tx.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {new Date(tx.date || tx.created_at).toLocaleDateString()}, {new Date(tx.date || tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </button>
          ))}
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
