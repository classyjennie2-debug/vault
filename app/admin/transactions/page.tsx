"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Transaction, User } from "@/lib/types"
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
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

type StatusFilter = "all" | "pending" | "approved" | "rejected"

export default function AdminTransactionsPage() {
  const [txList, setTxList] = useState<Transaction[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [filter, setFilter] = useState<StatusFilter>("all")
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txRes, usersRes] = await Promise.all([
          fetch("/api/admin/transactions"),
          fetch("/api/admin/users")
        ])
        
        if (txRes.ok) {
          const txData = await txRes.json()
          setTxList(txData)
        }
        
        if (usersRes.ok) {
          const usersData = await usersRes.json()
          setUsers(usersData)
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filtered =
    filter === "all" ? txList : txList.filter((t) => t.status === filter)

  const pendingCount = txList.filter((t) => t.status === "pending").length
  const approvedCount = txList.filter((t) => t.status === "approved").length
  const rejectedCount = txList.filter((t) => t.status === "rejected").length

  const handleApprove = async (txId: string) => {
    setProcessingId(txId)
    try {
      const res = await fetch("/api/admin/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: txId, approved: true }),
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setTxList((prev) =>
          prev.map((t) => (t.id === txId ? { ...t, status: "approved" as const } : t))
        )
        console.log("Transaction approved successfully:", data)
      } else {
        console.error("Approval failed:", data)
        alert(`Failed to approve: ${data.error || data.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error("Error approving transaction:", error)
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (txId: string) => {
    setProcessingId(txId)
    try {
      const res = await fetch("/api/admin/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: txId, approved: false }),
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setTxList((prev) =>
          prev.map((t) => (t.id === txId ? { ...t, status: "rejected" as const } : t))
        )
        console.log("Transaction rejected successfully:", data)
      } else {
        console.error("Rejection failed:", data)
        alert(`Failed to reject: ${data.error || data.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error("Error rejecting transaction:", error)
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) return <div>Loading transactions...</div>

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Transaction Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Review, approve, or reject user transactions. Deposits will automatically add funds to user accounts.
        </p>
      </div>

      {/* Recommendations Card */}
      <Card className="border-accent/20 bg-accent/5">
        <CardHeader>
          <CardTitle className="text-base text-foreground flex items-center gap-2">
            <span className="text-lg">💡</span> Admin Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• <strong>Deposit approvals</strong> automatically add funds to user balance</li>
            <li>• <strong>Withdrawal requests</strong> must be manually processed</li>
            <li>• <strong>User notifications</strong> are sent when transactions are approved/rejected</li>
            <li>• Always verify transaction details and user identity before approving</li>
            <li>• Use the filters above to focus on pending transactions that need action</li>
          </ul>
        </CardContent>
      </Card>

      {/* Status summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-lg font-bold text-card-foreground">
                  {pendingCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <CheckCircle2 className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Approved</p>
                <p className="text-lg font-bold text-card-foreground">
                  {approvedCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Rejected</p>
                <p className="text-lg font-bold text-card-foreground">
                  {rejectedCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and list */}
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <Filter className="h-4 w-4 text-muted-foreground" />
            All Transactions
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {(["all", "pending", "approved", "rejected"] as const).map(
              (status) => (
                <Button
                  key={status}
                  variant={filter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(status)}
                  className="text-xs capitalize"
                >
                  {status}
                </Button>
              )
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No transactions found for this filter.
              </p>
            ) : (
              filtered.map((tx) => {
                const Icon = typeIcons[tx.type as keyof typeof typeIcons]
                const color = typeColors[tx.type as keyof typeof typeColors]
                const user = users.find((u: User) => u.id === tx.userId)
                const isPositive =
                  tx.type === "deposit" || tx.type === "return"

                return (
                  <div
                    key={tx.id}
                    className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center"
                  >
                    <div className="flex flex-1 items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-secondary">
                        <Icon className={`h-4 w-4 ${color}`} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate text-sm font-medium text-card-foreground">
                          {tx.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {user?.name ?? "Unknown User"}
                          </span>
                          {user?.email && (
                            <>
                              <span>/</span>
                              <span>{user.email}</span>
                            </>
                          )}
                          <span>/</span>
                          <span>{tx.date}</span>
                          <span>/</span>
                          <span className="capitalize">{tx.type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <div className="text-right">
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
                          className="mt-0.5 text-[10px] px-1.5 py-0"
                        >
                          {tx.status}
                        </Badge>
                      </div>

                      {tx.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-accent/30 text-accent hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                            onClick={() => handleApprove(tx.id)}
                            disabled={processingId === tx.id}
                          >
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                            {processingId === tx.id ? "..." : "Approve"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
                            onClick={() => handleReject(tx.id)}
                            disabled={processingId === tx.id}
                          >
                            <XCircle className="mr-1 h-3.5 w-3.5" />
                            {processingId === tx.id ? "..." : "Reject"}
                          </Button>
                        </div>
                      )}
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
