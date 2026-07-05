import { EmployeeTrainingGate } from "@/components/dashboard/employee-training-gate"
import { requireAuth } from "@/lib/auth"

export default async function EmployeeAccessPage() {
  const user = await requireAuth()
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || "Employee"

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="rounded-2xl border border-border/70 bg-card/90 p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
            Vault Capital
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">Employee access portal</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            This is a separate employee-only workspace. Enter the access code and complete the training steps before the employee tools become available.
          </p>
        </div>

        <EmployeeTrainingGate
          isCompleted={Boolean(user.isTrainingCompleted)}
          userName={displayName}
          userId={user.id}
        >
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
            <h2 className="text-xl font-semibold text-foreground">Employee workspace unlocked</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              You can now access the employee tools and resources for this portal.
            </p>
          </div>
        </EmployeeTrainingGate>
      </div>
    </main>
  )
}
