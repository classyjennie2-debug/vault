"use client"

import { useMemo } from "react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Legend,
} from "recharts"
import type { ActiveInvestment } from "@/lib/types"

interface PortfolioPerformanceChartProps {
  investments: ActiveInvestment[]
}

export function PortfolioPerformanceChart({ investments = [] }: PortfolioPerformanceChartProps) {
  const chartData = useMemo(() => {
    if (!investments || investments.length === 0) {
      return []
    }

    // Generate performance data for the last 30 data points
    const dataPoints = 30
    const now = new Date().getTime()
    const dayMs = 24 * 60 * 60 * 1000

    const data = Array.from({ length: dataPoints }, (_, i) => {
      // Calculate date for this data point (going backwards from now)
      const dataIndex = dataPoints - 1 - i
      const daysAgo = dataPoints - 1 - dataIndex
      const pointDate = new Date(now - daysAgo * dayMs)
      const formattedDate = pointDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })

      // Calculate portfolio value at this point in time
      let totalValue = 0
      let totalExpectedProfit = 0
      let activeCount = 0

      investments.forEach((inv) => {
        const startDate = new Date(inv.startDate).getTime()
        const endDate = new Date(inv.endDate).getTime()
        const pointTime = pointDate.getTime()

        // Only include investments that had started by this point
        if (startDate <= pointTime) {
          activeCount++

          // Calculate progress at this point in time
          const totalDuration = endDate - startDate
          const elapsedAtPoint = Math.min(pointTime - startDate, totalDuration)
          const progressAtPoint = totalDuration > 0 ? (elapsedAtPoint / totalDuration) * 100 : 0

          // Calculate accumulated profit at this point
          const expectedProfit = inv.expectedProfit || 0
          const accumulatedAtPoint = expectedProfit * (progressAtPoint / 100)

          totalValue += (inv.amount || 0) + accumulatedAtPoint
          totalExpectedProfit += accumulatedAtPoint
        }
      })

      return {
        date: formattedDate,
        invested: investments.reduce((sum, inv) => {
          const startDate = new Date(inv.startDate).getTime()
          return startDate <= pointDate.getTime() ? sum + (inv.amount || 0) : sum
        }, 0),
        portfolio: totalValue,
        profit: totalExpectedProfit,
        activeCount,
      }
    })

    return data
  }, [investments])

  if (chartData.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center bg-gradient-to-br from-muted/30 to-transparent rounded-lg border-2 border-dashed border-muted/40">
        <div className="text-center px-4">
          <p className="text-muted-foreground font-medium">No performance data yet</p>
          <p className="text-sm text-muted-foreground/70 mt-2">
            Investment data will appear as your investments progress
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            opacity={0.3}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: "12px" }}
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: "12px" }}
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              color: "hsl(var(--card-foreground))",
            }}
            formatter={(value, name) => {
              if (typeof value !== "number") return value
              if (name === "portfolio") {
                return [`$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, "Portfolio Value"]
              }
              if (name === "profit") {
                return [`+$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, "Total Profit"]
              }
              return value
            }}
            labelStyle={{ color: "hsl(var(--card-foreground))" }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: "16px",
              color: "hsl(var(--muted-foreground))",
            }}
          />
          <Area
            type="monotone"
            dataKey="portfolio"
            stroke="hsl(var(--primary))"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorPortfolio)"
            name="Portfolio Value"
            isAnimationActive={true}
            animationDuration={800}
          />
          <Area
            type="monotone"
            dataKey="profit"
            stroke="hsl(var(--accent))"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorProfit)"
            name="Total Profit"
            isAnimationActive={true}
            animationDuration={800}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Chart Legend Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border/30">
        <div className="bg-gradient-to-br from-primary/10 to-transparent rounded-lg p-3 border border-primary/20">
          <p className="text-xs text-muted-foreground mb-1">Latest Portfolio Value</p>
          <p className="text-lg font-bold text-primary">
            ${chartData[chartData.length - 1]?.portfolio.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-gradient-to-br from-accent/10 to-transparent rounded-lg p-3 border border-accent/20">
          <p className="text-xs text-muted-foreground mb-1">Total Accumulated Profit</p>
          <p className="text-lg font-bold text-accent">
            +${chartData[chartData.length - 1]?.profit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-transparent rounded-lg p-3 border border-green-500/20">
          <p className="text-xs text-muted-foreground mb-1">Active Positions</p>
          <p className="text-lg font-bold text-green-600">
            {chartData[chartData.length - 1]?.activeCount}
          </p>
        </div>
      </div>
    </div>
  )
}
