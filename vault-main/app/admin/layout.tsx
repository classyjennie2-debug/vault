import { requireAuth } from "@/lib/auth"
import { AdminLayoutClient } from "./admin-layout-client"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth()

  if (user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You do not have permission to access the admin panel.</p>
          <a href="/" className="text-accent hover:underline">
            Return to home
          </a>
        </div>
      </div>
    )
  }

  return <AdminLayoutClient user={user}>{children}</AdminLayoutClient>
}
