import { getInvestmentPlansFromDb } from "@/lib/db"
import { LandingClient } from "@/components/landing-client"

export default async function LandingPage() {
  // Fetch real investment plans from database
  const plans = await getInvestmentPlansFromDb()
  
  return <LandingClient plans={plans} />
}
