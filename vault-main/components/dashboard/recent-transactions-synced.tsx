"use client"

import { useDashboard } from "@/contexts/dashboard-context"
import { ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { useState } from "react"
import { TransactionDetailModal } from "./transaction-detail-modal"
import { formatTransactionStatus } from "@/lib/transaction-utils"
import { useI18n } from "@/hooks/use-i18n"

export function RecentTransactionsSynced() {
  const { recentTransactions, isLoading } = useDashboard()
  const { t } = useI18n("dashboardmain")
  const { t: tTransactions } = useI18n("transactions")
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)

  if (!recentTransactions || recentTransactions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 md:p-6">
        <h3 className="text-lg font-semibold mb-4">{t("recent_transactions")}</h3>
        <div className="text-center py-8">
          <p className="text-slate-500 dark:text-slate-400">{t("no_transactions_yet")}</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    if (status === 'approved') return 'text-emerald-600 dark:text-emerald-400'
    if (status === 'pending') return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getIconColor = (type: string) => {
    if (type === 'withdrawal') return 'text-blue-600 dark:text-blue-400'
    return 'text-emerald-600 dark:text-emerald-400'
  }

  const getTransactionTypeText = (type: string) => {
    // Map to the actual keys in transactions.json
    const typeMap: Record<string, string> = {
      'deposit': 'deposit',
      'withdrawal': 'withdrawal',
      'investment': 'investment',
      'return': 'return'
    }
    return tTransactions(typeMap[type] || type)
  }

  const getTransactionStatusText = (status: string, type?: string) => {
    // Map to the actual keys in transactions.json
    // For pending deposits, show "initiated" 
    if (type === 'deposit' && status === 'pending') {
      return tTransactions('initiated')
    }
    
    const statusMap: Record<string, string> = {
      'approved': 'completed',
      'completed': 'completed',
      'pending': 'pending',
      'failed': 'failed'
    }
    return tTransactions(statusMap[status] || status)
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 md:p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
          {t("recent_transactions")}
          {isLoading && (
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
              {t("syncing_label")}
            </span>
          )}
        </h3>
        <div className="space-y-3">
          {recentTransactions.map((tx: any, idx: number) => (
            <button
              key={tx.id || idx}
              onClick={() => setSelectedTransaction(tx)}
              className="w-full text-left flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200 group cursor-pointer"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                  {tx.type === 'withdrawal' ? (
                    <ArrowDownLeft className={`w-4 h-4 ${getIconColor(tx.type)}`} />
                  ) : (
                    <ArrowUpRight className={`w-4 h-4 ${getIconColor(tx.type)}`} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-slate-900 dark:text-white group-hover:text-accent transition-colors">{getTransactionTypeText(tx.type)}</p>
                  <p className={`text-xs font-medium ${getStatusColor(tx.status)}`}>
                    {getTransactionStatusText(tx.status, tx.type)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold text-sm ${
                  tx.type === 'withdrawal'
                    ? 'text-slate-700 dark:text-slate-300'
                    : 'text-emerald-600 dark:text-emerald-400'
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
