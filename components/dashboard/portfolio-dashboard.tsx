"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts"

interface PortfolioDashboardProps {
  totalBalance: number
  totalInvested: number
  totalReturns: number
  totalFees: number
  portfolioData: Array<{
    date: string
    balance: number
    returns: number
  }>
  allocations: Array<{
    name: string
    value: number
    color: string
  }>
}

export function PortfolioDashboard({
  totalBalance,
  totalInvested,
  totalReturns,
  totalFees,
  portfolioData,
  allocations,
}: PortfolioDashboardProps) {
  const safePortfolioData = Array.isArray(portfolioData) ? portfolioData : []
  const safeAllocations = Array.isArray(allocations) ? allocations : []

  const roi = totalInvested > 0 ? ((totalReturns / totalInvested) * 100).toFixed(2) : "0"
  const roiPositive = parseFloat(roi) >= 0
  const netBalance = totalBalance - totalFees

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              ${totalBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Available for investment or withdrawal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Invested
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ${totalInvested.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Capital deployed across plans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Returns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {roiPositive ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
              <div>
                <p className={`text-2xl font-bold ${
                  roiPositive
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}>
                  ${Math.abs(totalReturns).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
                <p className={`text-xs mt-1 ${
                  roiPositive
                    ? "text-green-600/70 dark:text-green-400/70"
                    : "text-red-600/70 dark:text-red-400/70"
                }`}>
                  ROI: {roi}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${totalReturns >= 0 ? "text-accent" : "text-destructive"}`}>
              ${netBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              After fees of ${totalFees.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Performance Chart - Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Portfolio Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={safePortfolioData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "4px",
                  }}
                  labelStyle={{ color: "#f3f4f6" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#3b82f6"
                  dot={false}
                  strokeWidth={2}
                  name="Balance"
                />
                <Line
                  type="monotone"
                  dataKey="returns"
                  stroke="#10b981"
                  dot={false}
                  strokeWidth={2}
                  name="Cumulative Returns"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Portfolio Allocation - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Portfolio Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={safeAllocations}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) =>
                    `${name}: ${((value / allocations.reduce((sum, a) => sum + a.value, 0)) * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {safeAllocations.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "4px",
                    color: "#f3f4f6",
                  }}
                  formatter={(value) => `$${value.toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Returns */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Returns</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={safePortfolioData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "4px",
                }}
                labelStyle={{ color: "#f3f4f6" }}
                formatter={(value) => `$${value.toLocaleString()}`}
              />
              <Bar dataKey="returns" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
