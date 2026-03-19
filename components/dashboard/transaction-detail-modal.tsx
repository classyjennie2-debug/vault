"use client"

import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatTransactionStatus } from "@/lib/transaction-utils"
import type { Transaction } from "@/lib/types"

const typeIcons = {
  deposit: "ArrowUpRight",
  withdrawal: "ArrowDownRight",
  investment: "TrendingUp",
  return: "RefreshCw",
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

interface TransactionDetailModalProps {
  transaction: Transaction | null
  onClose: () => void
}

export function TransactionDetailModal({ transaction, onClose }: TransactionDetailModalProps) {
  if (!transaction) return null

  const getIcon = (type: string) => {
    const icons: Record<string, any> = {
      deposit: () => <svg className="h-5 w-5 sm:h-7 sm:w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>,
      withdrawal: () => <svg className="h-5 w-5 sm:h-7 sm:w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>,
      investment: () => <svg className="h-5 w-5 sm:h-7 sm:w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
      return: () => <svg className="h-5 w-5 sm:h-7 sm:w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
    }
    return icons[type] ? icons[type]() : null
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-2 sm:p-6"
      onClick={onClose}
    >
      <div 
        className="bg-card rounded-t-2xl sm:rounded-xl max-w-2xl w-full sm:max-h-[90vh] max-h-[95vh] shadow-2xl border border-border overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-card to-secondary/30 p-3 sm:p-6 border-b border-border/50 flex-shrink-0">
          <div className="flex items-start justify-between gap-2 sm:gap-4">
            <div className="flex items-start gap-2 sm:gap-4 flex-1 min-w-0">
              <div className={`flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-lg sm:rounded-xl bg-secondary/60 border border-border/50 flex-shrink-0 ${typeColors[transaction.type as keyof typeof typeColors]}`}>
                {getIcon(transaction.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-2xl font-bold text-foreground capitalize truncate">
                  {typeLabels[transaction.type as keyof typeof typeLabels]}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">{transaction.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors flex-shrink-0 p-2 rounded-lg"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto flex-1">
          <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
            {/* Amount Section */}
            <div className="bg-gradient-to-br from-secondary/50 to-secondary/20 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-border/50">
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">Transaction Amount</p>
              <p className={`text-2xl sm:text-4xl font-bold ${transaction.type === "deposit" || transaction.type === "return" ? "text-accent" : "text-foreground"}`}>
                {transaction.type === "deposit" || transaction.type === "return" ? "+" : "-"}
                ${transaction.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>

            {/* Withdrawal Fee Breakdown */}
            {transaction.type === "withdrawal" && (transaction as any).withdrawalFee && (
              <div className="space-y-2 p-3 sm:p-4 rounded-lg bg-destructive/5 border border-destructive/15">
                <p className="text-xs sm:text-sm font-semibold text-destructive">Fee Breakdown</p>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground">Requested Amount:</span>
                    <span className="font-semibold">${transaction.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground">Withdrawal Fee (5%):</span>
                    <span className="font-semibold text-destructive">-${((transaction as any).withdrawalFee).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                  {(transaction as any).amountAfterFee && (
                    <div className="flex justify-between items-center py-2 border-t border-destructive/20">
                      <span className="text-foreground font-semibold">Net Amount Received:</span>
                      <span className="font-bold">${((transaction as any).amountAfterFee).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cryptocurrency Details */}
            {transaction.type === "withdrawal" && (transaction as any).coin && (transaction as any).coinAmount && (
              <div className="space-y-2 p-3 sm:p-4 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/30 dark:border-blue-800/30">
                <p className="text-xs sm:text-sm font-semibold text-blue-900 dark:text-blue-100">Cryptocurrency Details</p>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Currency:</span>
                    <span className="font-semibold">{(transaction as any).coin.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Crypto Amount:</span>
                    <span className="font-mono font-semibold text-xs">{((transaction as any).coinAmount as number).toFixed(8)} {(transaction as any).coin.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Address Information */}
            {((transaction as any).cryptoAddress || (transaction as any).bankAccount) && (
              <div className="space-y-3 p-3 sm:p-4 rounded-lg bg-slate-50/50 dark:bg-slate-900/20 border border-border/50">
                <p className="text-xs sm:text-sm font-semibold">Address Details</p>
                {(transaction as any).cryptoAddress && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Crypto Address</p>
                    <p className="font-mono text-xs bg-secondary p-2 sm:p-3 rounded border border-border/50 break-all">
                      {(transaction as any).cryptoAddress}
                    </p>
                  </div>
                )}
                {(transaction as any).bankAccount && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Bank Account</p>
                    <p className="font-mono text-xs bg-secondary p-2 sm:p-3 rounded border border-border/50 break-all">
                      {(transaction as any).bankAccount}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-lg bg-secondary/30 border border-border/50">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Date</p>
                <p className="text-xs sm:text-sm font-semibold mt-2">
                  {transaction.date ? new Date(transaction.date).toLocaleDateString('en-US', { 
                    weekday: 'short',
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  }) : 'N/A'}
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg bg-secondary/30 border border-border/50">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Time</p>
                <p className="text-xs sm:text-sm font-semibold mt-2">
                  {transaction.date ? new Date(transaction.date).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                  }) : 'N/A'}
                </p>
              </div>
            </div>

            {/* Status and Method */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Status</p>
                <Badge
                  variant={
                    transaction.status === "approved"
                      ? "secondary"
                      : transaction.status === "pending"
                        ? "outline"
                        : "destructive"
                  }
                  className="w-fit text-xs"
                >
                  <span className={`h-2 w-2 rounded-full mr-2 ${
                    transaction.status === "approved" ? "bg-green-500" :
                    transaction.status === "pending" ? "bg-yellow-500" :
                    "bg-red-500"
                  }`}></span>
                  {formatTransactionStatus(transaction.status)}
                </Badge>
              </div>
              {(transaction as any).method && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Method</p>
                  <p className="text-xs sm:text-sm font-semibold capitalize bg-secondary/50 px-2 sm:px-3 py-2 rounded border border-border/50 w-fit">
                    {(transaction as any).method}
                  </p>
                </div>
              )}
            </div>

            {/* Transaction ID */}
            <div className="border-t border-border/50 pt-3 sm:pt-4">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">Transaction Reference</p>
              <div className="bg-secondary/30 rounded-lg p-2 sm:p-4 border border-border/50">
                <p className="font-mono text-xs text-foreground break-all font-semibold">
                  {transaction.id}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(transaction.id)
                  }}
                  className="text-xs text-accent hover:text-accent/80 mt-2 transition-colors"
                  title="Copy to clipboard"
                >
                  Copy Reference
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="border-t border-border/50 p-3 sm:p-4 flex gap-2 flex-shrink-0 bg-card">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 text-sm"
          >
            Cancel
          </Button>
          <Button
            onClick={onClose}
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-sm"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}
