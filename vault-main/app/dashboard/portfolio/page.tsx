"use client"

import { useEffect, useState } from "react"
import { PortfolioDashboard } from "@/components/dashboard/portfolio-dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useI18n } from "@/hooks/use-i18n"

export default function PortfolioPage() {
  const { t } = useI18n('portfolio')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [portfolioData, setPortfolioData] = useState({
    totalBalance: 0,
    totalInvested: 0,
    totalReturns: 0,
    totalFees: 0,
    portfolioData: [
      { date: "Jan", balance: 0, returns: 0 },
    ],
    allocations: [] as Array<{
      name: string
      value: number
      color: string
    }>,
  })

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch("/api/portfolio/data")
        if (!response.ok) {
          throw new Error("Failed to fetch portfolio data")
        }
        const data = await response.json()
        setPortfolioData({
          totalBalance: data.totalBalance || 0,
          totalInvested: data.totalInvested || 0,
          totalReturns: data.totalReturns || 0,
          totalFees: data.totalFees || 0,
          portfolioData: data.portfolioData || [
            { date: "Jan", balance: 0, returns: 0 },
          ],
          allocations: data.allocations || [],
        })
      } catch (error) {
        console.error("Failed to fetch portfolio data:", error)
        setError(error instanceof Error ? error.message : "Failed to load portfolio data")
      } finally {
        setLoading(false)
      }
    }
    fetchPortfolioData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('description')}
        </p>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-700 dark:text-red-300">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {t('last_update')} {new Date().toLocaleDateString()}
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
          <TabsTrigger value="analysis">{t('analysis')}</TabsTrigger>
          <TabsTrigger value="history">{t('history')}</TabsTrigger>
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
              <CardTitle>{t('performance_analysis')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{t('best_performing')}</p>
                    <p className="text-2xl font-bold">High Yield Plan</p>
                    <p className="text-sm text-green-600">+22.5% {t('ytd_return')}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{t('volatility')}</p>
                    <p className="text-2xl font-bold">{t('low')}</p>
                    <p className="text-sm text-muted-foreground">{t('diversified_portfolio')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('portfolio_history')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(portfolioData.portfolioData ?? []).slice().reverse().map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{item.date}</p>
                      <p className="text-sm text-muted-foreground">{t('balance')}: ${item.balance.toLocaleString()}</p>
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
