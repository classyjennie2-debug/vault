import { BalanceCard } from "@/components/dashboard/balance-card"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { PortfolioChart } from "@/components/dashboard/portfolio-chart"
import { QuickActions } from "@/components/dashboard/quick-actions"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, Alexandra. Here is your portfolio overview.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <BalanceCard />
        <QuickActions />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <PortfolioChart />
        </div>
        <div className="lg:col-span-2">
          <RecentTransactions />
        </div>
      </div>
    </div>
  )
}
