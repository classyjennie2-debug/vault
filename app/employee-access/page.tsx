import { EmployeeTrainingGate } from "@/components/dashboard/employee-training-gate"

export default function EmployeeAccessPage() {
  return (
    <main className="min-h-screen bg-background/90 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[32px] border border-border/70 bg-card/90 p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                Employee access portal
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-foreground">Name & access code required</h1>
              <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
                This is a separate employee-only gateway. Enter your name and provided access code to continue.
              </p>
            </div>
          </div>
        </section>

        <EmployeeTrainingGate
          isCompleted={false}
          userName=""
          userId="employee-guest"
        />
      </div>
    </main>
  )
}
