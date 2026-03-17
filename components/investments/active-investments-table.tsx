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
import { TrendingUp, Calendar, DollarSign, Zap, Clock } from "lucide-react"
import type { ActiveInvestment } from "@/lib/types"

export function ActiveInvestmentsTable({ investments = [] }: { investments?: ActiveInvestment[] | null }) {
  const safeInvestments = Array.isArray(investments) ? investments : []
  
  const formatDate = (date: string) => {
    if (!date) return "N/A"
    try {
      const dateObj = new Date(date)
      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        return "Invalid date"
      }
      return dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch (error) {
      return "Invalid date"
    }
  }

  const calculateProgress = (startDate: string, endDate: string, status: string, providedProgress?: number): number => {
    // If progress is provided from the server calculation, use it
    if (providedProgress !== undefined && providedProgress >= 0) {
      return providedProgress
    }
    
    // Fallback to client-side calculation
    if (status === "completed") return 100
    if (status === "withdrawn") return 100
    
    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime()
    const now = new Date().getTime()
    
    if (now <= start) return 0
    if (now >= end) return 100
    
    const progress = ((now - start) / (end - start)) * 100
    return Math.min(100, Math.max(0, Math.round(progress)))
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

  return (
    <Card className="border backdrop-blur-lg bg-gradient-to-br from-slate-50/50 to-slate-100/30 dark:from-slate-950/50 dark:to-slate-900/30">
      <CardHeader className="border-b border-border/50">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
          Active Investments
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Track your ongoing positions and investment progress
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        {safeInvestments.length === 0 ? (
          <div className="text-center py-12">
            <Zap className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-base font-medium">
              No active investments yet.
            </p>
            <p className="text-sm text-muted-foreground/70">
              Start investing to see your portfolio grow!
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
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
                  {safeInvestments.map((investment, idx) => (
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
                      <TableCell className="text-right">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Expected:</div>
                          <div className="text-sm font-semibold text-green-700 dark:text-green-300">
                            +${(investment.expectedProfit || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </div>
                          {investment.accumulatedProfit != null && investment.accumulatedProfit !== investment.expectedProfit && (
                            <div>
                              <div className="text-xs text-muted-foreground mt-1 mb-0.5">Accumulated:</div>
                              <div className="text-sm font-bold text-accent">
                                +${(investment.accumulatedProfit || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                              </div>
                            </div>
                          )}
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
                          <div className="relative h-3.5 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full overflow-hidden shadow-inner border border-slate-300/30 dark:border-slate-600/30">
                            <div
                              className={`h-full bg-gradient-to-r ${getProgressGradient(investment.status)} rounded-full transition-all duration-1000 ease-out shadow-lg group-hover:shadow-2xl group-hover:shadow-current/40`}
                              style={{
                                width: `${Math.max(0, Math.min(100, investment.progressPercentage ?? calculateProgress(investment.startDate, investment.endDate, investment.status, investment.progressPercentage)))}%`,
                                animation: `slideInProgress 0.8s ease-out ${idx * 0.1}s both`,
                                animationDelay: `${idx * 50}ms`,
                              }}
                            />
                            {/* Shimmer effect for active progress */}
                            {investment.status === "active" && Math.max(0, Math.min(100, investment.progressPercentage ?? calculateProgress(investment.startDate, investment.endDate, investment.status, investment.progressPercentage))) < 100 && (
                              <div
                                className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full opacity-60 animate-pulse"
                                style={{
                                  left: `${Math.max(0, Math.min(100, investment.progressPercentage ?? calculateProgress(investment.startDate, investment.endDate, investment.status, investment.progressPercentage)))}%`,
                                  animation: "slideShimmer 2s infinite",
                                }}
                              />
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground font-bold group-hover:text-card-foreground transition-colors">
                            {Math.max(0, Math.min(100, investment.progressPercentage ?? calculateProgress(investment.startDate, investment.endDate, investment.status, investment.progressPercentage))).toFixed(0)}%
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
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden space-y-4">
              {safeInvestments.map((investment, idx) => (
                <div
                  key={investment.id}
                  className="border border-border/20 rounded-lg p-4 bg-white/50 dark:bg-slate-800/30 hover:bg-white/70 dark:hover:bg-slate-800/50 transition-all duration-300 animate-in fade-in duration-500"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-card-foreground">
                        {investment.planName}
                      </h3>
                      <Badge className={`mt-2 ${getStatusColor(investment.status)} font-semibold border text-xs`}>
                        {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  {/* Investment Amount */}
                  <div className="mb-4 pb-4 border-b border-border/20">
                    <p className="text-xs text-muted-foreground mb-1">Investment Amount</p>
                    <p className="text-lg font-bold text-card-foreground flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      ${investment.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                  </div>

                  {/* Profit */}
                  <div className="mb-4 pb-4 border-b border-border/20">
                    <p className="text-xs text-muted-foreground mb-1">Expected Profit</p>
                    <p className="text-base font-semibold text-green-700 dark:text-green-300">
                      +${(investment.expectedProfit || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                    {investment.accumulatedProfit != null && investment.accumulatedProfit !== investment.expectedProfit && (
                      <div className="mt-2 pt-2 border-t border-border/10">
                        <p className="text-xs text-muted-foreground mb-1">Accumulated Profit</p>
                        <p className="text-base font-bold text-accent">
                          +${(investment.accumulatedProfit || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Dates */}
                  <div className="mb-4 pb-4 border-b border-border/20 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Start Date
                      </p>
                      <p className="text-sm font-medium text-card-foreground">
                        {formatDate(investment.startDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        End Date
                      </p>
                      <p className="text-sm font-medium text-card-foreground">
                        {formatDate(investment.endDate)}
                      </p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-muted-foreground font-medium">Progress</p>
                      <p className="text-sm font-bold text-card-foreground">
                        {Math.max(0, Math.min(100, investment.progressPercentage ?? calculateProgress(investment.startDate, investment.endDate, investment.status, investment.progressPercentage))).toFixed(0)}%
                      </p>
                    </div>
                    <div className="relative h-3.5 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full overflow-hidden shadow-inner border border-slate-300/30 dark:border-slate-600/30">
                      <div
                        className={`h-full bg-gradient-to-r ${getProgressGradient(investment.status)} rounded-full transition-all duration-1000 ease-out shadow-lg hover:shadow-2xl hover:shadow-current/40`}
                        style={{
                          width: `${Math.max(0, Math.min(100, investment.progressPercentage ?? calculateProgress(investment.startDate, investment.endDate, investment.status, investment.progressPercentage)))}%`,
                          animation: `slideInProgress 0.8s ease-out ${idx * 0.1}s both`,
                          animationDelay: `${idx * 50}ms`,
                        }}
                      />
                      {/* Shimmer effect for active progress */}
                      {investment.status === "active" && Math.max(0, Math.min(100, investment.progressPercentage ?? calculateProgress(investment.startDate, investment.endDate, investment.status, investment.progressPercentage))) < 100 && (
                        <div
                          className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full opacity-60 animate-pulse"
                          style={{
                            left: `${Math.max(0, Math.min(100, investment.progressPercentage ?? calculateProgress(investment.startDate, investment.endDate, investment.status, investment.progressPercentage)))}%`,
                            animation: "slideShimmer 2s infinite",
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <style jsx>{`
          @keyframes slideInProgress {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          @keyframes slideShimmer {
            0% {
              transform: translateX(-100%);
              opacity: 0;
            }
            50% {
              opacity: 0.6;
            }
            100% {
              transform: translateX(140px);
              opacity: 0;
            }
          }
        `}</style>
      </CardContent>
    </Card>
  )
}
