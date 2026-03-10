import { UnifiedInvestmentDashboard } from "@/components/investments/unified-investment-dashboard"
import { requireAuth } from "@/lib/auth"
import { getInvestmentPlansFromDb, getUserActiveInvestments } from "@/lib/db"

export default async function InvestmentsPage() {
  const user = await requireAuth()
  const plans = await getInvestmentPlansFromDb()
  const investments = await getUserActiveInvestments(user.id)

  return (
    <div className="container mx-auto px-4 py-8">
      <UnifiedInvestmentDashboard plans={plans} investments={investments} />
    </div>
  )
}
