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
import { getUserStats, generatePortfolioData, getUserActiveInvestmentsWithProfit } from "@/lib/db"
import { calculateMonthlyMetrics, calculateReturnRate } from "@/lib/monthly-metrics"

export default async function DashboardPage() {
  // server component can fetch user and stats
  const user = await requireAuth()
  const stats = await getUserStats(user.id)
  const portfolioData = await generatePortfolioData(user.id)
  const activeInvestments = await getUserActiveInvestmentsWithProfit(user.id)
  const monthlyMetrics = await calculateMonthlyMetrics(user.id)
  
  // Calculate live profit from active investments
  let liveProfit = 0
  if (activeInvestments && activeInvestments.length > 0) {
    liveProfit = activeInvestments.reduce((sum, inv) => sum + (inv.accumulatedProfit || 0), 0)
  }
  
  // Use live profit if available, otherwise fallback to stats
  const displayProfit = liveProfit > 0 ? liveProfit : stats.totalProfit
  const totalReturnRate = calculateReturnRate(displayProfit, stats.totalInvested)
  const totalBalance = stats.availableBalance + stats.totalInvested + displayProfit
  const weeklyChange =
    stats.totalInvested > 0
      ? ((monthlyMetrics.monthlyReturns / Math.max(stats.totalInvested, 1)) * 100) / 4
      : 0

  return (
    <DashboardLayoutClient userName={user.firstName || user.email || "Investor"} isFirstVisit={false}>
      <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-6">
        <DashboardHero user={user} stats={stats} />

        <GlanceStrip totalBalance={totalBalance} monthlyGain={monthlyMetrics.monthlyGain} />

        <QuickActions />

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

        <div className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 grid-cols-1 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <PortfolioChart 
              data={portfolioData} 
              balance={totalBalance}
              monthlyChange={stats.totalInvested > 0 ? Math.round((monthlyMetrics.monthlyGain / stats.totalInvested) * 100 * 100) / 100 : 0}
            />
          </div>
          <div className="lg:col-span-2">
            <RecentTransactions />
          </div>
        </div>

        {activeInvestments && activeInvestments.length > 0 && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">Active Investment Plans</h2>
            <ActiveInvestmentsTable investments={activeInvestments} />
          </div>
        )}

        <EducationTips />

        <div className="pb-4 sm:pb-0">
          <LiveChatButton />
        </div>
      </div>
    </DashboardLayoutClient>
  )
}
