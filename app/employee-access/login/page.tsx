"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Lock, ArrowLeft, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/hooks/use-i18n"
import { LanguageSwitcher } from "@/components/language-switcher"

export default function EmployeeLoginPage() {
  const router = useRouter()
  const { t } = useI18n("auth")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.requiresVerification) {
          router.push(`/verify?email=${encodeURIComponent(data.email)}&from=login`)
          return
        }
        setError(data.error || t("invalid_credentials"))
        setLoading(false)
        return
      }

      if (email.includes("admin")) {
        router.push("/admin")
      } else {
        router.push("/employee-access")
      }
    } catch (_err) {
      setError(t("error"))
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex justify-end p-4 lg:p-6">
        <LanguageSwitcher />
      </div>

      <div className="flex flex-1">
        <div className="flex w-full flex-col justify-center px-4 sm:px-6 py-8 sm:py-12 lg:w-1/2 lg:px-16 lg:py-12">
          <Link
            href="/employee-access"
            className="link-professional mb-8 sm:mb-12 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-smooth"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to employee portal
          </Link>

          <div className="flex items-center gap-2 mb-10 animate-fade-in">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent shadow">
              <Lock className="h-4 w-4 text-accent-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">Vault</span>
          </div>

          <h1 className="h-section text-2xl font-bold tracking-tight text-foreground md:text-3xl animate-fade-in">
            Employee sign in
          </h1>
          <p className="body-secondary mt-2 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "100ms" }}>
            Sign in with your employee credentials to access the secure employee dashboard.
          </p>

          <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-5 animate-fade-in" style={{ animationDelay: "200ms" }}>
            {error && (
              <div className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30">
                {error}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="font-semibold">
                {t("email_label")}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t("email_placeholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-professional"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-semibold">
                  {t("password_label")}
                </Label>
                <Link
                  href="/forgot-password"
                  className="link-professional text-xs text-muted-foreground hover:text-accent transition-smooth"
                >
                  {t("forgot_password")}
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("password_placeholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-professional"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent focus-professional"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <Button type="submit" size="lg" className="btn-professional mt-2 w-full shadow-md hover:shadow-lg" disabled={loading}>
              {loading ? t("redirecting") : t("login_button")}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground body-secondary">
            {t("no_account")} {" "}
            <Link
              href="/register"
              className="link-professional font-medium text-accent hover:text-accent/80 transition-smooth"
            >
              {t("sign_up")}
            </Link>
          </p>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Prefer general access? <Link href="/login" className="text-accent hover:underline">Sign in as a user</Link>
          </p>
        </div>

        <div className="hidden w-1/2 bg-gradient-to-br from-accent to-accent/80 lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-12">
          <div className="max-w-sm text-center animate-slide-up">
            <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-accent-foreground/10 bg-accent-foreground/5 shadow-md">
              <Lock className="h-8 w-8 text-accent-foreground" />
            </div>
            <h2 className="h-section text-2xl font-bold text-accent-foreground">Secure & Dedicated</h2>
            <p className="body-secondary mt-4 text-sm leading-relaxed text-accent-foreground/70">
              Employee login is separated from regular user sign-in to keep the employee portal secure and focused.
            </p>
            <div className="mt-10 flex justify-center gap-6">
              <div className="text-center">
                <p className="data-value text-2xl font-bold text-accent-foreground">Employee</p>
                <p className="text-xs text-accent-foreground/50 body-secondary">Only</p>
              </div>
              <div className="h-12 w-px bg-accent-foreground/10" />
              <div className="text-center">
                <p className="data-value text-2xl font-bold text-accent-foreground">Access</p>
                <p className="text-xs text-accent-foreground/50 body-secondary">Portal</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
