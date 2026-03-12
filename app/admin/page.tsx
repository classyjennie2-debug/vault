"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Users, DollarSign, Clock, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface User {
  id: string
  name: string
  email: string
  balance: number
  role: string
  joinedAt: string
  avatar: string
}

interface Transaction {
  id: string
  userId: string
  amount: number
  type: string
  status: string
  description: string
  date: string
}

export default function AdminOverviewPage() {
  const [users, setUsers] = useState<User[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, txRes] = await Promise.all([
          fetch("/api/admin/users"),
          fetch("/api/admin/transactions"),
        ])

        if (!usersRes.ok || !txRes.ok) {
          throw new Error("Failed to fetch data")
        }

        const usersData = await usersRes.json()
        const txData = await txRes.json()

        setUsers(usersData || [])
        setTransactions(txData || [])
      } catch (err) {
        console.error("Error fetching admin data:", err)
        setError("Failed to load admin data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const totalBalance = users.reduce((sum, u) => sum + u.balance, 0)
  const pendingTx = transactions.filter((t) => t.status === "pending")
  const approvedTx = transactions.filter((t) => t.status === "approved")
  const approvedVolume = approvedTx.reduce((sum, t) => sum + t.amount, 0)

  const stats = [
    {
      label: "Total Users",
      value: users.length.toString(),
      icon: Users,
      color: "text-foreground",
      bg: "bg-secondary",
      href: "/admin/users",
    },
    {
      label: "Total AUM",
      value: `$${(totalBalance / 1000).toFixed(0)}k`,
      icon: DollarSign,
      color: "text-accent",
      bg: "bg-accent/10",
      href: "/admin/users",
    },
    {
      label: "Pending Transactions",
      value: pendingTx.length.toString(),
      icon: Clock,
      color: "text-warning",
      bg: "bg-warning/10",
      href: "/admin/transactions",
    },
    {
      label: "Approved Volume",
      value: `$${(approvedVolume / 1000).toFixed(0)}k`,
      icon: TrendingUp,
      color: "text-accent",
      bg: "bg-accent/10",
      href: "/admin/transactions",
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading admin data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Admin Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitor platform activity and manage users.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="transition-all hover:shadow-md hover:border-accent/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-card-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.bg}`}
                  >
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pending transactions preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base text-foreground">
            Pending Approvals
          </CardTitle>
          <Link
            href="/admin/transactions"
            className="text-xs text-accent hover:underline"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {pendingTx.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No pending transactions.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {pendingTx.slice(0, 5).map((tx) => {
                const user = users.find((u) => u.id === tx.userId)
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-card-foreground">
                        {tx.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user?.name} &middot; {tx.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-card-foreground">
                        ${tx.amount.toLocaleString()}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-warning">
                        {tx.type}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent users */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base text-foreground">
            Platform Users
          </CardTitle>
          <Link
            href="/admin/users"
            className="text-xs text-accent hover:underline"
          >
            Manage users
          </Link>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {users.slice(0, 5).map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-lg border border-border p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-medium text-foreground">
                    {user.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-bold text-card-foreground">
                  ${user.balance.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
