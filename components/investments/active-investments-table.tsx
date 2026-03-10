"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Calendar, DollarSign, Zap, Clock } from "lucide-react"
import type { ActiveInvestment } from "@/lib/types"

export function ActiveInvestmentsTable({ investments }: { investments: ActiveInvestment[] }) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-700 border-green-500/30 shadow-lg shadow-green-500/10"
      case "completed":
        return "bg-blue-500/20 text-blue-700 border-blue-500/30 shadow-lg shadow-blue-500/10"
      case "withdrawn":
        return "bg-gray-500/20 text-gray-700 border-gray-500/30 shadow-lg shadow-gray-500/10"
      default:
        return ""
    }
  }

  const getProgressGradient = (status: string) => {
    switch (status) {
      case "active":
        return "from-green-500 to-emerald-500"
      case "completed":
        return "from-blue-500 to-cyan-500"
      case "withdrawn":
        return "from-gray-500 to-slate-500"
      default:
        return "from-slate-500 to-slate-600"
    }
  }

  // investments passed from parent

  return (
    <Card className="border backdrop-blur-lg bg-gradient-to-br from-slate-50/50 to-slate-100/30 dark:from-slate-950/50 dark:to-slate-900/30 animate-in fade-in slide-in-from-bottom-3 duration-700">
      <CardHeader className="border-b border-border/50">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
          Active Investments
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Track your ongoing positions and investment progress
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border/30">
                <TableHead className="font-semibold text-muted-foreground">Plan Name</TableHead>
                <TableHead className="text-right font-semibold text-muted-foreground">
                  Invested Amount
                </TableHead>
                <TableHead className="text-right font-semibold text-muted-foreground">
                  Expected Profit
                </TableHead>
                <TableHead className="font-semibold text-muted-foreground">Start Date</TableHead>
                <TableHead className="font-semibold text-muted-foreground">End Date</TableHead>
                <TableHead className="font-semibold text-muted-foreground">Progress</TableHead>
                <TableHead className="text-right font-semibold text-muted-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investments.length === 0 ? (
                <TableRow className="hover:bg-transparent border-0">
                  <TableCell colSpan={7} className="text-center py-12">
                    <Zap className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-base font-medium">
                      No active investments yet.
                    </p>
                    <p className="text-sm text-muted-foreground/70">
                      Start investing to see your portfolio grow!
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                investments.map((investment, idx) => (
                  <TableRow 
                    key={investment.id}
                    className="border-b border-border/20 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-300 group animate-in fade-in duration-500"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <TableCell className="font-semibold text-card-foreground group-hover:text-accent transition-colors">
                      {investment.planName}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-card-foreground">
                      <div className="flex items-center justify-end gap-2">
                        <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        ${investment.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-green-700 dark:text-green-300 font-bold">
                      <div className="flex items-center justify-end gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                        +${(investment.expectedProfit || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {formatDate(investment.startDate)}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        {formatDate(investment.endDate)}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[150px]">
                      <div className="space-y-2">
                        <div className="relative h-3 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full overflow-hidden shadow-inner">
                          <div
                            className={`h-full bg-gradient-to-r ${getProgressGradient(investment.status)} rounded-full transition-all duration-1000 ease-out shadow-lg group-hover:shadow-xl`}
                            style={{
                              width: `${investment.progressPercentage}%`,
                              animation: `slideInProgress 0.8s ease-out ${idx * 0.1}s both`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground font-bold">
                          {investment.progressPercentage}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className={`${getStatusColor(investment.status)} font-semibold border`}>
                        {investment.status.charAt(0).toUpperCase() +
                          investment.status.slice(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <style jsx>{`
          @keyframes slideInProgress {
            from {
              width: 0;
              opacity: 0;
            }
            to {
              width: var(--progress-width);
              opacity: 1;
            }
          }
        `}</style>
      </CardContent>
    </Card>
  )
}
