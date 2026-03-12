import { UnifiedInvestmentDashboard } from "@/components/investments/unified-investment-dashboard"
import { requireAuth } from "@/lib/auth"
import { getInvestmentPlansFromDb, getUserActiveInvestmentsWithProfit } from "@/lib/db"

export default async function InvestmentsPage() {
  try {
    const user = await requireAuth()
    const plans = await getInvestmentPlansFromDb()
    // Use the new function that calculates accumulated profit
    const investments = await getUserActiveInvestmentsWithProfit(user.id)

    return (
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8">
        <UnifiedInvestmentDashboard plans={plans} investments={investments} />
      </div>
    )
  } catch (error) {
    console.error("Error loading investments page:", error)
    const message = error instanceof Error ? error.message : "Failed to load investments"
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Error Loading Investments</h1>
          <p className="text-red-700 mb-2">{message}</p>
          <details className="mt-4 p-3 bg-red-100 rounded text-sm text-red-600">
            <summary className="cursor-pointer font-semibold">Technical Details</summary>
            <pre className="mt-2 overflow-auto">{JSON.stringify(error, null, 2)}</pre>
          </details>
        </div>
      </div>
    )
  }
}
