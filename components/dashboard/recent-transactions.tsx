import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getUserTransactions } from "@/lib/db"
import { ArrowUpRight, ArrowDownRight, TrendingUp, RefreshCw, Clock, Eye } from "lucide-react"
import Link from "next/link"

const typeIcons = {
  deposit: ArrowUpRight,
  withdrawal: ArrowDownRight,
  investment: TrendingUp,
  return: RefreshCw,
}

const typeBgColors = {
  deposit: "bg-green-500/20 text-green-600 dark:text-green-400",
  withdrawal: "bg-red-500/20 text-red-600 dark:text-red-400",
  investment: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
  return: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
}

const statusColors = {
  approved: "bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30 shadow-lg shadow-green-500/10",
  pending: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30 shadow-lg shadow-yellow-500/10",
  rejected: "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30 shadow-lg shadow-red-500/10",
}

interface RecentTransactionsProps {
  userId: string
}

export function RecentTransactions({ userId }: RecentTransactionsProps) {
  const userTransactions = getUserTransactions(userId).slice(0, 5)

  return (
    <Card className="border backdrop-blur-lg bg-gradient-to-br from-slate-50/50 to-slate-100/30 dark:from-slate-950/50 dark:to-slate-900/30 animate-in fade-in slide-in-from-right duration-700">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/50">
        <CardTitle className="flex items-center gap-2 text-base text-muted-foreground font-normal">
          <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
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
        {userTransactions.map((tx, idx) => {
          const Icon = typeIcons[tx.type as keyof typeof typeIcons]
          const bgColor = typeBgColors[tx.type as keyof typeof typeBgColors]
          const isPositive = tx.type === "deposit" || tx.type === "return"
          const statusColor = statusColors[tx.status as keyof typeof statusColors] || statusColors.approved
          return (
            <div
              key={tx.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-white/50 hover:to-slate-50/50 dark:hover:from-slate-800/50 dark:hover:to-slate-900/50 transition-all duration-300 group animate-in fade-in slide-in-from-left duration-500"
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
                    isPositive ? "text-green-600 dark:text-green-400" : "text-card-foreground"
                  }`}
                >
                  {isPositive ? "+" : "-"}$
                  {tx.amount.toLocaleString()}
                </p>
                <Badge
                  className={`text-[10px] px-2 py-0.5 font-semibold border ${statusColor}`}
                >
                  {tx.status}
                </Badge>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
