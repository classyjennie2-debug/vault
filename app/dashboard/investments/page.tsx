import { InvestmentPlansGrid } from "@/components/investments/investment-plans-grid"
import { InvestmentCalculator } from "@/components/investments/investment-calculator"
import { ActiveInvestmentsTable } from "@/components/investments/active-investments-table"
import { requireAuth } from "@/lib/auth"
import { getInvestmentPlansFromDb, getUserActiveInvestments } from "@/lib/db"

export default async function InvestmentsPage() {
  const user = await requireAuth()
  const plans = getInvestmentPlansFromDb()
  const investments = getUserActiveInvestments(user.id)

  return (
    <div className="flex flex-col gap-8">
      <InvestmentPlansGrid plans={plans} />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <InvestmentCalculator />
        </div>
        <div className="lg:col-span-3">
          <ActiveInvestmentsTable investments={investments} />
        </div>
      </div>
    </div>
  )
}
