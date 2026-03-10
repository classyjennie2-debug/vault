"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { TrendingUp, Activity } from "lucide-react"

interface PortfolioChartProps {
  data: { month: string; value: number }[]
  balance: number
  monthlyChange?: number
}

const CustomTooltip = ({ active, payload }: {
  active?: boolean;
  payload?: Array<{
    payload: { month: string };
    value: number;
  }>;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-950 border border-border rounded-lg p-3 shadow-xl">
        <p className="font-semibold text-sm text-card-foreground">
          {payload[0].payload.month}
        </p>
        <p className="text-sm font-bold text-green-600 dark:text-green-400">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    )
  }
  return null
}

export function PortfolioChart({ data, balance, monthlyChange = 8.2 }: PortfolioChartProps) {
  // Calculate 30-day high, low, and average from the data
  const values = data.map(item => item.value)
  const thirtyDayHigh = values.length > 0 ? Math.max(...values) : 0
  const thirtyDayLow = values.length > 0 ? Math.min(...values) : 0
  const avgValue = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0

  return (
    <Card className="border backdrop-blur-lg bg-gradient-to-br from-slate-50/50 to-slate-100/30 dark:from-slate-950/50 dark:to-slate-900/30 animate-in fade-in slide-in-from-left duration-700">
      <CardHeader className="border-b border-border/50">
        <div className="flex items-start justify-between">
        <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-base text-muted-foreground font-normal">
              <Activity className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              Portfolio Performance
            </CardTitle>
            <div className="mt-4">
              <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                ${balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                  +{monthlyChange}% this month
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, bottom: 10, left: 0 }}
            >
              <defs>
                {/* Green gradient for positive trend */}
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="rgb(34, 197, 94)" // green-500
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="rgb(34, 197, 94)"
                    stopOpacity={0.02}
                  />
                </linearGradient>

                {/* Glow effect filter */}
                <filter id="glowEffect">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="oklch(0.90 0.005 75 / 0.5)"
                opacity={0.4}
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "oklch(0.50 0.01 75)", fontSize: 12, fontWeight: 500 }}
                stroke="oklch(0.90 0.005 75 / 0.5)"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "oklch(0.50 0.01 75)", fontSize: 12, fontWeight: 500 }}
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                stroke="oklch(0.90 0.005 75 / 0.5)"
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(34, 197, 94, 0.05)" }} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="rgb(34, 197, 94)"
                strokeWidth={3}
                fill="url(#colorValue)"
                filter="url(#glowEffect)"
                animationDuration={1200}
                animationEasing="ease-in-out"
                className="transition-all duration-500"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Stats footer */}
        <div className="mt-6 grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
          <div>
            <p className="text-xs text-muted-foreground font-medium">30-Day High</p>
            <p className="text-sm font-bold text-card-foreground mt-1">${thirtyDayHigh.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">30-Day Low</p>
            <p className="text-sm font-bold text-card-foreground mt-1">${thirtyDayLow.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Avg Value</p>
            <p className="text-sm font-bold text-card-foreground mt-1">${avgValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
