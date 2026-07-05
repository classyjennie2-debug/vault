"use client"

import { useEffect, useState, type ReactNode } from "react"
import { ArrowRight, Download, Lock, MonitorCheck, ShieldCheck, Sparkles, UserRound } from "lucide-react"

const TRAINING_COOKIE_NAME = "employee-training-completed"
const ACCESS_STORAGE_KEY = "employee-access"
const VALID_ACCESS_CODE = "9027843783924"

function isDesktopPc() {
  if (typeof window === "undefined") return true

  const userAgent = window.navigator.userAgent.toLowerCase()
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)

  return !isMobile && /windows|macintosh|linux/i.test(userAgent)
}

export function EmployeeTrainingGate({
  isCompleted,
  userName,
  userId,
  children,
}: {
  isCompleted: boolean
  userName: string
  userId: string
  children: ReactNode
}) {
  const [hasCompletedTraining, setHasCompletedTraining] = useState(isCompleted)
  const [isPc, setIsPc] = useState(true)
  const [accessGranted, setAccessGranted] = useState(false)
  const [displayName, setDisplayName] = useState(userName || "")
  const [accessCode, setAccessCode] = useState("")
  const [accessError, setAccessError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const trainingStorageKey = `${TRAINING_COOKIE_NAME}-${userId}`
    const storedTraining = window.localStorage.getItem(trainingStorageKey)

    if (storedTraining === "true") {
      setHasCompletedTraining(true)
    }

    const accessStorageKey = `${ACCESS_STORAGE_KEY}-${userId}`
    const storedAccess = window.localStorage.getItem(accessStorageKey)

    if (storedAccess) {
      try {
        const parsed = JSON.parse(storedAccess)
        if (parsed?.granted) {
          setAccessGranted(true)
          setDisplayName(parsed?.name || userName || "")
        }
      } catch {
        // Ignore invalid stored access data
      }
    }

    setIsPc(isDesktopPc())
  }, [userId, userName])

  const handleAccessSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setAccessError("")

    const trimmedName = displayName.trim()
    if (!trimmedName) {
      setAccessError("Please enter your name to continue.")
      setIsSubmitting(false)
      return
    }

    if (accessCode !== VALID_ACCESS_CODE) {
      setAccessError("The access code is incorrect. Please try again.")
      setIsSubmitting(false)
      return
    }

    setAccessGranted(true)
    if (typeof window !== "undefined") {
      const accessStorageKey = `${ACCESS_STORAGE_KEY}-${userId}`
      window.localStorage.setItem(accessStorageKey, JSON.stringify({ granted: true, name: trimmedName }))
    }
    setIsSubmitting(false)
  }

  const handleCompleteTraining = () => {
    if (!isPc) return

    setHasCompletedTraining(true)

    if (typeof window !== "undefined") {
      const storageKey = `${TRAINING_COOKIE_NAME}-${userId}`
      window.localStorage.setItem(storageKey, "true")
      document.cookie = `${TRAINING_COOKIE_NAME}=true; path=/; max-age=31536000; SameSite=Lax`
    }
  }

  if (!accessGranted) {
    return (
      <div className="flex flex-col gap-6">
        <div className="overflow-hidden rounded-[28px] border border-border/70 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-[0_20px_70px_-30px_rgba(15,23,42,0.45)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">Employee access portal</p>
              <h2 className="mt-2 text-3xl font-semibold text-foreground">Access required</h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Secure access for approved employees. Enter your name and the access code to continue.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Verified member access
            </div>
          </div>

          <form onSubmit={handleAccessSubmit} className="mt-8 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-2xl border border-border/70 bg-background/80 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-foreground">
                <UserRound className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Employee access</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Before you can view the employee training section, provide your name and your private access code.
              </p>

              <div className="mt-5 space-y-4">
                <label className="block text-sm font-medium text-foreground">
                  Full name
                  <input
                    type="text"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Enter your name"
                  />
                </label>

                <label className="block text-sm font-medium text-foreground">
                  Access code
                  <input
                    type="password"
                    value={accessCode}
                    onChange={(event) => setAccessCode(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Enter access code"
                  />
                </label>
              </div>

              {accessError ? <p className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-700">{accessError}</p> : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Checking access..." : "Continue to training"}
                {!isSubmitting ? <ArrowRight className="h-4 w-4" /> : null}
              </button>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-primary/10 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-primary">
                <ShieldCheck className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Access details</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Your access code will be shared privately with you. Any name is accepted, and the name you enter will be used in the welcome message.
              </p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                This portal is intended for desktop PCs only. Please use a computer to download and complete the training software.
              </p>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-[28px] border border-border/70 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-[0_20px_70px_-30px_rgba(15,23,42,0.45)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">Employee access portal</p>
            <h2 className="mt-2 text-3xl font-semibold text-foreground">
              Welcome{displayName ? `, ${displayName}` : " back"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Follow the steps below to complete onboarding and unlock the employee workspace.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            Secure onboarding
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-primary">
              <MonitorCheck className="h-5 w-5" />
              <h3 className="text-lg font-semibold">PC training setup</h3>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Download the Vault Capital training software, install it on your computer, and complete the onboarding steps. Once the setup is finished, this dashboard will unlock automatically.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href="https://pub-76804685e01344f3b4711cc686545a05.r2.dev/Vault%20Capital%20Training.zip"
                target="_blank"
                rel="noopener noreferrer"
                download
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                <Download className="h-4 w-4" />
                Download training software
              </a>
              <span className="text-sm text-muted-foreground">Desktop PC only · .zip installer</span>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-background/80 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-foreground">
              <ShieldCheck className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Completion check</h3>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              After successful installation and completion, confirm below. Your request will be marked as waiting for employee dashboard access approval.
            </p>
            <button
              type="button"
              onClick={handleCompleteTraining}
              disabled={hasCompletedTraining || !isPc}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary transition hover:bg-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {hasCompletedTraining ? "Training completed" : "I completed the training"}
              <ArrowRight className="h-4 w-4" />
            </button>
            {!isPc && (
              <p className="mt-3 text-sm text-amber-600">
                This training experience is only available on desktop PCs.
              </p>
            )}
          </div>
        </div>
      </div>

      {hasCompletedTraining ? (
        <div className="rounded-[24px] border border-emerald-500/20 bg-emerald-500/10 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-600" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Employee dashboard access approved</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Your training completion has been recorded and your employee dashboard access is now approved.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-[24px] border border-amber-500/20 bg-amber-500/10 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <Lock className="mt-0.5 h-5 w-5 text-amber-600" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Waiting for employee dashboard access</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Complete the training steps above and confirm completion to request employee dashboard access.
              </p>
            </div>
          </div>
        </div>
      )}

      {hasCompletedTraining ? children : null}
    </div>
  )
}
