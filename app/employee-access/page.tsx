"use client"

import { useState } from "react"
import { EmployeeSidebar } from "@/components/dashboard/employee-sidebar"
import { EmployeeTrainingGate } from "@/components/dashboard/employee-training-gate"
import { EmployeeLogoutButton } from "@/components/dashboard/employee-logout-button"

const employeeLinks = [
  { href: "#overview", label: "Overview" },
  { href: "#training", label: "Training" },
  { href: "#resources", label: "Resources" },
  { href: "#support", label: "Support" },
]

function EmployeeDashboardShell() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
      <section className="space-y-6">
        <div className="overflow-hidden rounded-[32px] border border-border/70 bg-card/90 p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Employee dashboard</p>
              <h2 className="mt-3 text-3xl font-semibold text-foreground">Employee work center</h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
                Your employee workspace is unlocked after training completion. Use the sections below to review tasks, resources, and your status.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              Locked until training complete
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[28px] border border-border/70 bg-background/80 p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">Status</p>
            <p className="mt-3 text-2xl font-semibold text-foreground">Pending approval</p>
            <p className="mt-2 text-sm text-muted-foreground">Complete training to unlock your full employee dashboard experience.</p>
          </div>
          <div className="rounded-[28px] border border-border/70 bg-background/80 p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">Tasks</p>
            <p className="mt-3 text-2xl font-semibold text-foreground">3 locked</p>
            <p className="mt-2 text-sm text-muted-foreground">Your task center will unlock once training is confirmed.</p>
          </div>
          <div className="rounded-[28px] border border-border/70 bg-background/80 p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">Resources</p>
            <p className="mt-3 text-2xl font-semibold text-foreground">Secure docs</p>
            <p className="mt-2 text-sm text-muted-foreground">Employee resources become available after your first training approval.</p>
          </div>
        </div>

        <div className="rounded-[32px] border border-border/70 bg-card/90 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Quick actions</p>
              <h3 className="mt-3 text-xl font-semibold text-foreground">Get started</h3>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <button className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-left text-sm text-foreground transition hover:border-primary hover:bg-primary/5">
              <p className="font-semibold">Review training steps</p>
              <span className="mt-2 block text-muted-foreground">See the onboarding checklist.</span>
            </button>
            <button className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-left text-sm text-foreground transition hover:border-primary hover:bg-primary/5">
              <p className="font-semibold">Download resources</p>
              <span className="mt-2 block text-muted-foreground">Access employee materials.</span>
            </button>
            <button className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-left text-sm text-foreground transition hover:border-primary hover:bg-primary/5">
              <p className="font-semibold">Contact support</p>
              <span className="mt-2 block text-muted-foreground">Open a help request.</span>
            </button>
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <EmployeeSidebar links={employeeLinks} />

        <div className="rounded-[32px] border border-border/70 bg-card/90 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Access details</p>
              <h3 className="mt-3 text-xl font-semibold text-foreground">Employee portal</h3>
            </div>
            <EmployeeLogoutButton />
          </div>

          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            You'll stay on this employee portal until you sign out. If you need to leave, use the sign out button to clear your access and return to the access gate.
          </p>
        </div>
      </aside>
    </div>
  )
}

export default function EmployeeAccessPage() {
  const [accessGranted, setAccessGranted] = useState(false)

  return (
    <main className="min-h-screen bg-background/90 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[32px] border border-border/70 bg-card/90 p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                Employee access portal
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-foreground">
                {accessGranted ? "Employee portal access granted" : "Name & access code required"}
              </h1>
              <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
                {accessGranted
                  ? "Your credentials are validated. Continue through the training verification flow to unlock your employee workspace."
                  : "This is a separate employee-only gateway. Enter your name and provided access code to continue."}
              </p>
            </div>
          </div>
        </section>

        <EmployeeTrainingGate
          isCompleted={false}
          userName=""
          userId="employee-guest"
          onAccessGranted={() => setAccessGranted(true)}
        >
          <EmployeeDashboardShell />
        </EmployeeTrainingGate>
      </div>
    </main>
  )
}
