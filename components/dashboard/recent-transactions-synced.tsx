"use client"

import { useDashboard } from "@/contexts/dashboard-context"
import { ArrowUpRight, ArrowDownLeft } from "lucide-react"

export function RecentTransactionsSynced() {
  const { recentTransactions, isLoading } = useDashboard()

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
          <div
            key={tx.id || idx}
            className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors duration-200"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className={`p-2 rounded-lg ${
                tx.type === 'deposit' || tx.type === 'investment'
                  ? 'bg-emerald-100 dark:bg-emerald-900'
                  : tx.type === 'withdrawal'
                    ? 'bg-blue-100 dark:bg-blue-900'
                    : 'bg-amber-100 dark:bg-amber-900'
              }`}>
                {tx.type === 'withdrawal' ? (
                  <ArrowDownLeft className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                ) : (
                  <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm capitalize">{tx.type}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{tx.status}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-semibold text-sm ${
                tx.type === 'withdrawal'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                {tx.type === 'withdrawal' ? '-' : '+'}${tx.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {new Date(tx.date || tx.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
