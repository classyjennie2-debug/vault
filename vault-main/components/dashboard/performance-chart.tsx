"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts"
import { TrendingUp, TrendingDown } from "lucide-react"

interface PerformanceChartProps {
  data: Array<{
    date: string
    value: number
    return?: number
    change?: number
  }>
  title: string
  subtitle?: string
  chartType?: "line" | "area" | "bar" | "composed"
  valuePrefix?: string
  showTrendIndicator?: boolean
  height?: number
}

export function PerformanceChart({
  data,
  title,
  subtitle,
  chartType = "line",
  valuePrefix = "$",
  showTrendIndicator = true,
  height = 400,
}: PerformanceChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    )
  }

  const firstValue = data[0].value
  const lastValue = data[data.length - 1].value
  const change = lastValue - firstValue
  const percentChange = firstValue ? ((change / firstValue) * 100).toFixed(2) : "0"
  const isPositive = change >= 0

  const getChartComponent = () => {
    const chartProps = {
      data,
      margin: { top: 5, right: 30, left: 0, bottom: 5 },
    }

    switch (chartType) {
      case "area":
        return (
          <AreaChart {...chartProps}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={isPositive ? "#10b981" : "#ef4444"}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={isPositive ? "#10b981" : "#ef4444"}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "4px",
              }}
              labelStyle={{ color: "#f3f4f6" }}
              formatter={(value) => `${valuePrefix}${Number(value).toLocaleString()}`}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={isPositive ? "#10b981" : "#ef4444"}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        )

      case "bar":
        return (
          <BarChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "4px",
              }}
              labelStyle={{ color: "#f3f4f6" }}
              formatter={(value) => `${valuePrefix}${Number(value).toLocaleString()}`}
            />
            <Bar
              dataKey="value"
              fill={isPositive ? "#3b82f6" : "#ef4444"}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        )

      case "composed":
        return (
          <ComposedChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "4px",
              }}
              labelStyle={{ color: "#f3f4f6" }}
              formatter={(value) => `${valuePrefix}${Number(value).toLocaleString()}`}
            />
            <Legend />
            <Bar dataKey="value" fill="#3b82f6" name="Value" />
            {data[0].return !== undefined && (
              <Line
                type="monotone"
                dataKey="return"
                stroke="#10b981"
                name="Return"
              />
            )}
          </ComposedChart>
        )

      case "line":
      default:
        return (
          <LineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "4px",
              }}
              labelStyle={{ color: "#f3f4f6" }}
              formatter={(value) => `${valuePrefix}${Number(value).toLocaleString()}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke={isPositive ? "#10b981" : "#ef4444"}
              dot={false}
              strokeWidth={2}
              name="Value"
            />
            {data[0].return !== undefined && (
              <Line
                type="monotone"
                dataKey="return"
                stroke="#3b82f6"
                dot={false}
                strokeWidth={2}
                name="Return"
              />
            )}
          </LineChart>
        )
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle>{title}</CardTitle>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {showTrendIndicator && (
            <div className="flex items-center gap-2">
              {isPositive ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
              <div className="text-right">
                <p className="text-lg font-bold">
                  {isPositive ? "+" : ""}
                  {valuePrefix}
                  {Math.abs(change).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p
                  className={`text-sm ${
                    isPositive
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {percentChange}%
                </p>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          {getChartComponent()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Monthly Performance Summary Chart
export function MonthlyPerformanceChart({
  data,
}: {
  data: Array<{
    month: string
    revenue: number
    expenses: number
    profit: number
  }>
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "4px",
              }}
              labelStyle={{ color: "#f3f4f6" }}
              formatter={(value) => `$${Number(value).toLocaleString()}`}
            />
            <Legend />
            <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
            <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#10b981"
              name="Profit"
              strokeWidth={2}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Year-to-Date Performance
export function YearToDatePerformance({
  ytdData,
  previousYtdData,
}: {
  ytdData: number
  previousYtdData: number
}) {
  const change = ytdData - previousYtdData
  const percentChange =
    previousYtdData > 0 ? ((change / previousYtdData) * 100).toFixed(2) : "0"
  const isPositive = change >= 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Year-to-Date Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Current YTD</span>
            <span className="text-2xl font-bold">${ytdData.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">vs. Previous YTD</span>
            <div className="flex items-center gap-2">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span
                className={`font-semibold ${
                  isPositive
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {isPositive ? "+" : ""}
                {percentChange}%
              </span>
            </div>
          </div>
        </div>

        <div className="w-full bg-muted rounded-full h-2">
          <div
            className={`h-full rounded-full ${
              isPositive ? "bg-green-500" : "bg-red-500"
            }`}
            style={{
              width: `${Math.min(100, Math.abs(parseFloat(percentChange)))}%` as React.CSSProperties['width'],
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
