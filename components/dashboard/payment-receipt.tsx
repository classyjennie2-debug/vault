"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Copy, Check, X } from "lucide-react"
import { useState } from "react"
import { formatTransactionStatus } from "@/lib/transaction-utils"

interface TransactionDetails {
  id: string
  type: "deposit" | "withdrawal" | "investment"
  amount: number
  fee: number
  total: number
  date: string
  description: string
  walletAddress?: string
  status: "pending" | "completed" | "failed"
  username: string
  email: string
}

interface PaymentReceiptProps {
  transaction: TransactionDetails
}

export function PaymentReceipt({ transaction }: PaymentReceiptProps) {
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const handleCopyReference = () => {
    navigator.clipboard.writeText(transaction.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadPDF = async () => {
    setDownloading(true)
    try {
      const response = await fetch(
        `/api/transactions/${transaction.id}/receipt`,
        {
          method: "GET",
        }
      )
      if (!response.ok) throw new Error("Failed to generate PDF")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `receipt-${transaction.id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("PDF download failed:", error)
    } finally {
      setDownloading(false)
    }
  }

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 dark:text-green-400"
      case "pending":
        return "text-yellow-600 dark:text-yellow-400"
      case "failed":
        return "text-red-600 dark:text-red-400"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      {/* Receipt Header */}
      <CardHeader className="border-b pb-6">
        <div className="space-y-2">
          <CardTitle className="text-2xl">Payment Receipt</CardTitle>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Transaction ID: <span className="font-mono">{transaction.id}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyReference}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy ID
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Transaction Summary */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Account Holder</p>
              <p className="font-semibold">{transaction.username}</p>
              <p className="text-sm text-muted-foreground">{transaction.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Transaction Type</p>
              <p className="font-semibold">{getTypeLabel(transaction.type)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date & Time</p>
              <p className="font-semibold">{new Date(transaction.date).toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className={`font-semibold ${getStatusColor(transaction.status)}`}>
                {formatTransactionStatus(transaction.status)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reference Number</p>
              <p className="font-mono text-sm break-all">{transaction.id}</p>
            </div>
            {transaction.walletAddress && (
              <div>
                <p className="text-sm text-muted-foreground">Wallet Address</p>
                <p className="font-mono text-sm break-all">{transaction.walletAddress}</p>
              </div>
            )}
          </div>
        </div>

        {/* Transaction Details */}
        <div className="border rounded-lg p-4 space-y-3 bg-muted/50">
          <h3 className="font-semibold mb-4">Transaction Details</h3>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Description</span>
            <span className="font-medium">{transaction.description}</span>
          </div>

          <div className="border-t my-3" />

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">${transaction.amount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Transaction Fee</span>
            <span className="font-medium text-orange-600 dark:text-orange-400">
              -${transaction.fee.toFixed(2)}
            </span>
          </div>

          <div className="border-t my-3" />

          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold">Total Amount</span>
            <span className="font-bold text-accent">
              ${transaction.total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Fee Breakdown */}
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 rounded-lg p-4 space-y-2">
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
            Fee Information
          </p>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Transaction fees are applied to help maintain secure infrastructure and provide 
            24/7 customer support for your account.
          </p>
          {transaction.fee > 0 && (
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Fee Rate: {((transaction.fee / transaction.amount) * 100).toFixed(2)}%
            </p>
          )}
        </div>

        {/* Footer Info */}
        <div className="border-t pt-6 text-center space-y-3 text-sm text-muted-foreground">
          <p>Thank you for using Vault Capital Investment Platform</p>
          <p>For support, please contact support@vaultcapital.com</p>
          <p className="text-xs">
            This is an automated receipt. Please retain for your records.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            {downloading ? "Generating PDF..." : "Download as PDF"}
          </Button>
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="flex-1"
          >
            Print Receipt
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Component for displaying receipts list
export function ReceiptsList({
  transactions,
}: {
  transactions: TransactionDetails[]
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Recent Receipts</h2>
      <div className="grid gap-4">
        {transactions.map((transaction) => (
          <Card key={transaction.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString()} •{" "}
                    {transaction.id.slice(0, 8)}...
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-semibold">${transaction.total.toFixed(2)}</p>
                  <p className={`text-sm capitalize ${
                    transaction.status === "completed"
                      ? "text-green-600"
                      : transaction.status === "pending"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}>
                    {transaction.status}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Implement receipt view
                  }}
                >
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
