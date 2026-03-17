"use client"

import { useEffect, useState } from "react"
import { PortfolioDashboard } from "@/components/dashboard/portfolio-dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function PortfolioPage() {
  const [loading, setLoading] = useState(true)
  const [portfolioData, setPortfolioData] = useState({
    totalBalance: 25000,
    totalInvested: 20000,
    totalReturns: 2500,
    totalFees: 100,
    portfolioData: [
      { date: "Jan", balance: 20000, returns: 0 },
      { date: "Feb", balance: 20500, returns: 500 },
      { date: "Mar", balance: 21200, returns: 1200 },
      { date: "Apr", balance: 21800, returns: 1800 },
      { date: "May", balance: 22500, returns: 2500 },
    ],
    allocations: [
      { name: "Conservative Plan", value: 8000, color: "#3b82f6" },
      { name: "Growth Plan", value: 7000, color: "#10b981" },
      { name: "High Yield Plan", value: 5000, color: "#f59e0b" },
    ],
  })

  useEffect(() => {
    // TODO: Fetch real data from API
    // const fetchPortfolioData = async () => {
    //   try {
    //     const response = await fetch("/api/investments")
    //     const data = await response.json()
    //     setPortfolioData(data)
    //   } catch (error) {
    //     console.error("Failed to fetch portfolio data:", error)
    //   } finally {
    //     setLoading(false)
    //   }
    // }
    // fetchPortfolioData()
    
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Portfolio Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          View your complete investment portfolio and performance metrics
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Portfolio data is updated daily. Last update: {new Date().toLocaleDateString()}
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <PortfolioDashboard
            totalBalance={portfolioData.totalBalance}
            totalInvested={portfolioData.totalInvested}
            totalReturns={portfolioData.totalReturns}
            totalFees={portfolioData.totalFees}
            portfolioData={portfolioData.portfolioData}
            allocations={portfolioData.allocations}
          />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Best Performing Asset</p>
                    <p className="text-2xl font-bold">High Yield Plan</p>
                    <p className="text-sm text-green-600">+22.5% YTD</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Volatility</p>
                    <p className="text-2xl font-bold">Low</p>
                    <p className="text-sm text-muted-foreground">Diversified portfolio</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(portfolioData.portfolioData ?? []).slice().reverse().map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{item.date}</p>
                      <p className="text-sm text-muted-foreground">Balance: ${item.balance.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">+${item.returns.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
