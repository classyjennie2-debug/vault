import { DashboardHero } from "@/components/dashboard/dashboard-hero"
import { DashboardCards } from "@/components/dashboard/dashboard-cards"
import { PortfolioChart } from "@/components/dashboard/portfolio-chart"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { RecentActivities } from "@/components/dashboard/recent-activities"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { ActiveInvestmentsTable } from "@/components/investments/active-investments-table"
import LiveChatButton from "@/components/live-chat-button"
import { requireAuth } from "@/lib/auth"
import { getUserStats, generatePortfolioData, getUserActiveInvestments } from "@/lib/db"
import { calculateMonthlyMetrics, calculateReturnRate } from "@/lib/monthly-metrics"

export default async function DashboardPage() {
  // server component can fetch user and stats
  const user = await requireAuth()
  const stats = await getUserStats(user.id)
  const portfolioData = await generatePortfolioData(user.id)
  const activeInvestments = await getUserActiveInvestments(user.id)
  const monthlyMetrics = await calculateMonthlyMetrics(user.id)
  const totalReturnRate = calculateReturnRate(stats.totalProfit, stats.totalInvested)

  return (
    <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-6">
      <DashboardHero user={user} stats={stats} />

      <QuickActions />

      <DashboardCards
        totalBalance={user.balance}
        totalInvested={stats.totalInvested}
        totalProfit={stats.totalProfit}
        availableBalance={stats.availableBalance}
        activeInvestments={stats.activeInvestments}
        pendingDeposits={stats.pendingDeposits}
        totalWithdrawn={stats.totalWithdrawn}
        monthlyGain={monthlyMetrics.monthlyGain}
        monthlyReturns={monthlyMetrics.monthlyReturns}
        totalReturnRate={totalReturnRate}
      />

      <div className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 grid-cols-1 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <PortfolioChart data={portfolioData} balance={user.balance} />
        </div>
        <div className="lg:col-span-2">
          <RecentTransactions userId={user.id} />
        </div>
      </div>

      {activeInvestments && activeInvestments.length > 0 && (
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">Active Investment Plans</h2>
          <ActiveInvestmentsTable investments={activeInvestments} />
        </div>
      )}

      <RecentActivities userId={user.id} />

      <div className="pb-4 sm:pb-0">
        <LiveChatButton />
      </div>
    </div>
  )
}
