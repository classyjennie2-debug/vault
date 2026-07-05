import Link from "next/link"
import { EmployeeLogoutButton } from "@/components/dashboard/employee-logout-button"
import { EmployeeSidebar } from "@/components/dashboard/employee-sidebar"
import { EmployeeTrainingGate } from "@/components/dashboard/employee-training-gate"
import { getCurrentUser } from "@/lib/auth"

export default async function EmployeeAccessPage() {
  const user = await getCurrentUser()
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || "Employee"
  const isAuthenticated = Boolean(user?.id)

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-background/90 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-6 text-center">
          <div className="rounded-[32px] border border-border/70 bg-card/90 p-10 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Employee access required
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-foreground">Sign in to access the employee dashboard</h1>
            <p className="mt-4 text-sm text-muted-foreground">
              This portal is for approved employees only. Sign in with your corporate credentials to continue.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/login"
                className="inline-flex items-center rounded-xl border border-border/70 bg-primary/10 px-5 py-3 text-sm font-medium text-primary transition hover:bg-primary/15"
              >
                Sign in
              </Link>
              <Link
                href="/"
                className="inline-flex items-center rounded-xl border border-border/70 bg-background px-5 py-3 text-sm font-medium text-foreground transition hover:bg-secondary/10"
              >
                Return home
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background/90 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-[32px] border border-border/70 bg-card/90 p-6 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                Employee dashboard
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-foreground">Vault Capital employee workspace</h1>
              <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
                A secure employee dashboard for training and onboarding. Complete your training to unlock the employee tools and resources.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <EmployeeLogoutButton />
            </div>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[260px_1fr]">
          <aside className="space-y-6">
            <EmployeeSidebar
              links={[
                { href: "#overview", label: "Overview" },
                { href: "#training", label: "Training" },
                { href: "#tools", label: "Tools" },
                { href: "#support", label: "Support" },
              ]}
            />

            <div className="rounded-[32px] border border-border/70 bg-card/90 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground">Quick actions</h2>
              <div className="mt-4 space-y-3">
                <div className="rounded-3xl border border-border/70 bg-background/80 p-4">
                  <p className="text-sm font-semibold text-foreground">Review training steps</p>
                  <p className="mt-2 text-sm text-muted-foreground">Complete the training software and submit the confirmation.</p>
                </div>
                <div className="rounded-3xl border border-border/70 bg-background/80 p-4">
                  <p className="text-sm font-semibold text-foreground">Download materials</p>
                  <p className="mt-2 text-sm text-muted-foreground">Use the download area to get the employee training package.</p>
                </div>
                <div className="rounded-3xl border border-border/70 bg-background/80 p-4">
                  <p className="text-sm font-semibold text-foreground">Contact support</p>
                  <p className="mt-2 text-sm text-muted-foreground">Need help? Reach out to HR or your supervisor for onboarding questions.</p>
                </div>
              </div>
            </div>
          </aside>

          <article className="space-y-6">
            <section id="overview" className="rounded-[32px] border border-border/70 bg-card/90 p-6 shadow-sm">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-border/70 bg-background/80 p-5">
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">Welcome back</p>
                  <h2 className="mt-2 text-2xl font-semibold text-foreground">{displayName}</h2>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Your employee dashboard is designed to feel like a real workplace hub. Training progress and tool access are shown below.
                  </p>
                </div>
                <div className="rounded-3xl border border-border/70 bg-background/80 p-5">
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">Current status</p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl bg-muted px-4 py-3 text-sm text-foreground">Employee access portal</div>
                    <div className="rounded-2xl bg-muted px-4 py-3 text-sm text-foreground">Training steps pending</div>
                    <div className="rounded-2xl bg-muted px-4 py-3 text-sm text-foreground">Tools locked until completion</div>
                  </div>
                </div>
              </div>
            </section>

            <section id="training">
              <EmployeeTrainingGate
                isCompleted={Boolean(user?.isTrainingCompleted)}
                userName={displayName}
                userId={user?.id || "guest"}
              >
                <div className="rounded-[32px] border border-emerald-500/20 bg-emerald-500/10 p-6 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Employee workspace unlocked</h2>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Training is complete and your employee dashboard is ready. The tools below are now available.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <div className="rounded-3xl border border-border/70 bg-background/90 p-5 shadow-sm">
                      <p className="text-sm font-semibold text-foreground">Team directory</p>
                      <p className="mt-2 text-sm text-muted-foreground">Access the employee directory to find teammates and departments.</p>
                    </div>
                    <div className="rounded-3xl border border-border/70 bg-background/90 p-5 shadow-sm">
                      <p className="text-sm font-semibold text-foreground">Secure documents</p>
                      <p className="mt-2 text-sm text-muted-foreground">View internal policies, forms, and onboarding resources.</p>
                    </div>
                    <div className="rounded-3xl border border-border/70 bg-background/90 p-5 shadow-sm">
                      <p className="text-sm font-semibold text-foreground">Task board</p>
                      <p className="mt-2 text-sm text-muted-foreground">Track your next tasks and onboarding milestones.</p>
                    </div>
                  </div>
                </div>
              </EmployeeTrainingGate>
            </section>

            <section id="tools" className="rounded-[32px] border border-border/70 bg-card/90 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground">Employee tools</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-border/70 bg-background/80 p-5">
                  <p className="text-sm font-semibold text-foreground">Policy center</p>
                  <p className="mt-2 text-sm text-muted-foreground">Locked until training completion.</p>
                </div>
                <div className="rounded-3xl border border-border/70 bg-background/80 p-5">
                  <p className="text-sm font-semibold text-foreground">Time tracking</p>
                  <p className="mt-2 text-sm text-muted-foreground">Locked until training completion.</p>
                </div>
                <div className="rounded-3xl border border-border/70 bg-background/80 p-5">
                  <p className="text-sm font-semibold text-foreground">Employee reports</p>
                  <p className="mt-2 text-sm text-muted-foreground">Locked until training completion.</p>
                </div>
                <div className="rounded-3xl border border-border/70 bg-background/80 p-5">
                  <p className="text-sm font-semibold text-foreground">Internal resources</p>
                  <p className="mt-2 text-sm text-muted-foreground">Locked until training completion.</p>
                </div>
              </div>
            </section>

            <section id="support" className="rounded-[32px] border border-border/70 bg-card/90 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground">Support</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                If you need assistance with the onboarding process, reach out to your HR representative or support team.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-border/70 bg-background/80 p-4">
                  <p className="text-sm font-semibold text-foreground">HR support</p>
                  <p className="mt-2 text-sm text-muted-foreground">Questions about employee access or policies.</p>
                </div>
                <div className="rounded-3xl border border-border/70 bg-background/80 p-4">
                  <p className="text-sm font-semibold text-foreground">IT support</p>
                  <p className="mt-2 text-sm text-muted-foreground">Help with training downloads or desktop setup.</p>
                </div>
              </div>
            </section>
          </article>
        </div>
      </div>
    </main>
  )
}
