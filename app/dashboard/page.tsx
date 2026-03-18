import { DashboardHero } from "@/components/dashboard/dashboard-hero"
import { DashboardCards } from "@/components/dashboard/dashboard-cards"
import { PortfolioChart } from "@/components/dashboard/portfolio-chart"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { EducationTips } from "@/components/dashboard/education-tips"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { ActiveInvestmentsTable } from "@/components/investments/active-investments-table"
import LiveChatButton from "@/components/live-chat-button"
import { GlanceStrip } from "@/components/dashboard/glance-strip"
import { DashboardLayoutClient } from "@/components/dashboard/dashboard-layout-client"
import { requireAuth } from "@/lib/auth"
import { getUserStats, generatePortfolioData, getUserActiveInvestmentsWithProfit, updateLastLogin } from "@/lib/db"
import { calculateMonthlyMetrics, calculateReturnRate } from "@/lib/monthly-metrics"
import { Suspense } from "react"

// Skeleton loader for chart section
function PortfolioChartSkeleton() {
  return <div className="h-96 bg-card rounded-lg animate-pulse" />
}

// Skeleton loader for investments table
function InvestmentsTableSkeleton() {
  return <div className="h-64 bg-card rounded-lg animate-pulse" />
}

// Skeleton loader for recent transactions
function RecentTransactionsSkeleton() {
  return <div className="h-96 bg-card rounded-lg animate-pulse" />
}

export default async function DashboardPage() {
  // Only fetch critical data immediately - user and basic stats
  const user = await requireAuth()
  const stats = await getUserStats(user.id)

  // Determine if this is the user's first dashboard visit
  const isFirstDashboardVisit = !user.lastLogin

  // Update last login for first-time visitors
  if (isFirstDashboardVisit) {
    await updateLastLogin(user.id)
  }

  return (
    <DashboardLayoutClient firstName={user.firstName || ""} lastName={user.lastName || ""} isFirstVisit={isFirstDashboardVisit}>
      <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-6">
        <DashboardHero user={user} stats={stats} />

        <Suspense fallback={<div className="h-24 bg-card rounded-lg animate-pulse" />}>
          <GlanceStripAsync userId={user.id} stats={stats} />
        </Suspense>

        <QuickActions />

        <Suspense fallback={<div className="h-32 bg-card rounded-lg animate-pulse" />}>
          <DashboardCardsAsync userId={user.id} stats={stats} />
        </Suspense>

        <div className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 grid-cols-1 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <Suspense fallback={<PortfolioChartSkeleton />}>
              <PortfolioChartAsync userId={user.id} stats={stats} />
            </Suspense>
          </div>
          <div className="lg:col-span-2">
            <Suspense fallback={<RecentTransactionsSkeleton />}>
              <RecentTransactions />
            </Suspense>
          </div>
        </div>

        <Suspense fallback={<div className="h-64 bg-card rounded-lg animate-pulse" />}>
          <ActiveInvestmentsAsync userId={user.id} />
        </Suspense>

        <EducationTips />

        <div className="pb-4 sm:pb-0">
          <LiveChatButton />
        </div>
      </div>
    </DashboardLayoutClient>
  )
}

// Async component for GlanceStrip
async function GlanceStripAsync({ userId, stats }: { userId: string; stats: any }) {
  const monthlyMetrics = await calculateMonthlyMetrics(userId)
  return <GlanceStrip totalBalance={stats.availableBalance + stats.totalInvested} monthlyGain={monthlyMetrics.monthlyGain} />
}

// Async component for DashboardCards
async function DashboardCardsAsync({ userId, stats }: { userId: string; stats: any }) {
  const monthlyMetrics = await calculateMonthlyMetrics(userId)
  const activeInvestments = await getUserActiveInvestmentsWithProfit(userId)
  
  let liveProfit = 0
  if (activeInvestments && activeInvestments.length > 0) {
    liveProfit = activeInvestments.reduce((sum, inv) => sum + (inv.accumulatedProfit || 0), 0)
  }
  
  const displayProfit = liveProfit > 0 ? liveProfit : stats.totalProfit
  const totalReturnRate = calculateReturnRate(displayProfit, stats.totalInvested)
  const totalBalance = stats.availableBalance + stats.totalInvested + displayProfit
  const weeklyChange = stats.totalInvested > 0 ? ((monthlyMetrics.monthlyReturns / Math.max(stats.totalInvested, 1)) * 100) / 4 : 0

  return (
    <DashboardCards
      totalBalance={totalBalance}
      totalInvested={stats.totalInvested}
      totalProfit={displayProfit}
      availableBalance={stats.availableBalance}
      activeInvestments={stats.activeInvestments}
      pendingDeposits={stats.pendingDeposits}
      totalWithdrawn={stats.totalWithdrawn}
      monthlyGain={monthlyMetrics.monthlyGain}
      monthlyReturns={monthlyMetrics.monthlyReturns}
      totalReturnRate={totalReturnRate}
      weeklyChange={weeklyChange}
    />
  )
}

// Async component for PortfolioChart
async function PortfolioChartAsync({ userId, stats }: { userId: string; stats: any }) {
  const portfolioData = await generatePortfolioData(userId)
  const monthlyMetrics = await calculateMonthlyMetrics(userId)
  const activeInvestments = await getUserActiveInvestmentsWithProfit(userId)
  
  let liveProfit = 0
  if (activeInvestments && activeInvestments.length > 0) {
    liveProfit = activeInvestments.reduce((sum, inv) => sum + (inv.accumulatedProfit || 0), 0)
  }
  
  const displayProfit = liveProfit > 0 ? liveProfit : stats.totalProfit
  const totalBalance = stats.availableBalance + stats.totalInvested + displayProfit
  const monthlyChange = stats.totalInvested > 0 ? Math.round((monthlyMetrics.monthlyGain / stats.totalInvested) * 100 * 100) / 100 : 0

  return (
    <PortfolioChart 
      data={portfolioData} 
      balance={totalBalance}
      monthlyChange={monthlyChange}
    />
  )
}

// Async component for ActiveInvestments
async function ActiveInvestmentsAsync({ userId }: { userId: string }) {
  const activeInvestments = await getUserActiveInvestmentsWithProfit(userId)

  if (!activeInvestments || activeInvestments.length === 0) {
    return null
  }

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">Active Investment Plans</h2>
      <ActiveInvestmentsTable investments={activeInvestments} />
    </div>
  )
}
