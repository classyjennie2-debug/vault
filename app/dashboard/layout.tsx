import { requireAuth } from "@/lib/auth"
import DashboardLayoutClient from "@/components/dashboard/DashboardLayoutClient"

// server layout acts as a guard and obtains current user
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth()
  return <DashboardLayoutClient user={user}>{children}</DashboardLayoutClient>
}
