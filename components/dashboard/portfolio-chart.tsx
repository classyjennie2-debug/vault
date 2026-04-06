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
import { useI18n } from "@/hooks/use-i18n"

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
      <div className="card-professional bg-white dark:bg-slate-950 rounded-lg p-3 shadow-lg border-l-4 border-l-accent/30">
        <p className="h-subsection font-semibold text-sm text-card-foreground">
          {payload[0].payload.month}
        </p>
        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1 data-value">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    )
  }
  return null
}

export function PortfolioChart({ data, balance, monthlyChange = 8.2 }: PortfolioChartProps) {
  const { t } = useI18n("dashboardmain")
  
  // Calculate 30-day high, low, and average from the data
  const values = data.map(item => item.value)
  const thirtyDayHigh = values.length > 0 ? Math.max(...values) : 0
  const thirtyDayLow = values.length > 0 ? Math.min(...values) : 0
  const avgValue = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0

  return (
    <Card className="card-professional border-l-4 border-l-accent/30 shadow-md overflow-hidden hover:shadow-lg transition-smooth animate-fade-in">
      <CardHeader className="divider-subtle pb-2 sm:pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="h-section flex items-center gap-2 text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
              <Activity className="h-5 w-5 text-accent flex-shrink-0" />
              <span className="truncate">{t("portfolio_performance")}</span>
            </CardTitle>
            <div className="mt-2 sm:mt-3 lg:mt-4">
              <p className="data-value text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
                ${balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-2 mt-1 sm:mt-2 body-secondary">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-500">
                  +{monthlyChange}% {t("this_month")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-3 sm:pt-4 lg:pt-6">
        <div className="h-40 sm:h-56 md:h-64 lg:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
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
                tick={{ fill: "oklch(0.50 0.01 75)", fontSize: 11, fontWeight: 500 }}
                stroke="oklch(0.90 0.005 75 / 0.5)"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "oklch(0.50 0.01 75)", fontSize: 11, fontWeight: 500 }}
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                stroke="oklch(0.90 0.005 75 / 0.5)"
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(34, 197, 94, 0.05)" }} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="rgb(34, 197, 94)"
                strokeWidth={2}
                fill="url(#colorValue)"
                filter="url(#glowEffect)"
                animationDuration={1200}
                animationEasing="ease-in-out"
                className="transition-all duration-500"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Stats footer - responsive grid */}
        <div className="mt-3 sm:mt-4 lg:mt-6 grid grid-cols-3 gap-2 sm:gap-3 p-2 sm:p-3 lg:p-4 bg-gradient-to-r from-accent/5 to-accent/10 dark:from-accent/10 dark:to-accent/15 rounded-lg border-l-4 border-l-accent/30 shadow">
          <div className="group hover:bg-accent/5 p-2 rounded-md transition-smooth">
            <p className="text-[10px] sm:text-xs text-muted-foreground font-medium body-secondary">30-Day High</p>
            <p className="data-value text-xs sm:text-sm font-bold text-card-foreground mt-0.5 sm:mt-1 break-words group-hover:text-accent transition-smooth">${(thirtyDayHigh || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          </div>
          <div className="group hover:bg-accent/5 p-2 rounded-md transition-smooth">
            <p className="text-[10px] sm:text-xs text-muted-foreground font-medium body-secondary">30-Day Low</p>
            <p className="data-value text-xs sm:text-sm font-bold text-card-foreground mt-0.5 sm:mt-1 break-words group-hover:text-accent transition-smooth">${(thirtyDayLow || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          </div>
          <div className="group hover:bg-accent/5 p-2 rounded-md transition-smooth">
            <p className="text-[10px] sm:text-xs text-muted-foreground font-medium body-secondary">Avg Value</p>
            <p className="data-value text-xs sm:text-sm font-bold text-card-foreground mt-0.5 sm:mt-1 break-words group-hover:text-accent transition-smooth">${(avgValue || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
