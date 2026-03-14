"use client"

import React from "react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Lock, ArrowLeft, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")
  const [canResend, setCanResend] = useState(true)
  const [resendCountdown, setResendCountdown] = useState(0)
  const [isVerifying, setIsVerifying] = useState(false)
  const from = searchParams?.get("from") || "signup"

  // Get email from URL or session storage
  useEffect(() => {
    const urlEmail = searchParams?.get("email")
    const storedEmail = sessionStorage.getItem("verify_email")
    
    if (urlEmail) {
      setEmail(decodeURIComponent(urlEmail))
      sessionStorage.setItem("verify_email", decodeURIComponent(urlEmail))
    } else if (storedEmail) {
      setEmail(storedEmail)
    }
  }, [searchParams])

  // Countdown timer for resend
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
    if (resendCountdown === 0 && !canResend) {
      setCanResend(true)
    }
  }, [resendCountdown, canResend])

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !code) {
      setError("Please enter the verification code")
      return
    }

    setError("")
    setLoading(true)
    setIsVerifying(true)
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Invalid code")
        setIsVerifying(false)
        return
      }

      // Verification successful
      setInfo("Email verified successfully!")
      sessionStorage.removeItem("verify_email")
      
      setTimeout(() => {
        if (from === "login") {
          // Redirect to dashboard after verification during login
          router.push("/dashboard")
        } else {
          // Redirect to dashboard for signup flow
          router.push("/dashboard")
        }
      }, 1500)
    } finally {
      setLoading(false)
    }
  }

  async function handleResendCode(e: React.FormEvent) {
    e.preventDefault()
    if (!canResend || !email) return

    setError("")
    setInfo("")
    setCanResend(false)
    setResendCountdown(300) // 5 minutes countdown

    try {
      const res = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok) {
        setCanResend(true)
        setResendCountdown(0)
        if (res.status === 429) {
          setError(data.error || "Please wait before requesting a new code")
        } else if (res.status === 404) {
          setError("Email not found")
        } else {
          setError(data.error || "Failed to resend code")
        }
        return
      }

      setInfo("Verification code sent to your email")
    } catch (err) {
      setCanResend(true)
      setResendCountdown(0)
      const message = err instanceof Error ? err.message : "Network error"
      setError(`Failed to resend code: ${message}`)
    }
  }

  if (!email) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      {/* Left: visual panel */}
      <div className="hidden w-1/2 bg-primary lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-12">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5">
            <Lock className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-primary-foreground">
            Verify Your Email
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-primary-foreground/60">
            We've sent a verification code to your email. Enter it below to complete your verification.
          </p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-20">
        <Link
          href="/"
          className="mb-12 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
        <div className="flex items-center gap-2 mb-10">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Lock className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">Vault</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Verify your email
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a code to <span className="font-semibold">{email}</span>
        </p>

        <form onSubmit={handleVerify} className="mt-8 flex flex-col gap-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {info && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              {info}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              className="text-center text-lg tracking-widest"
              disabled={isVerifying}
            />
            <p className="text-xs text-muted-foreground">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          <Button
            type="submit"
            disabled={loading || !code || code.length !== 6}
            className="w-full"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </Button>
        </form>

        <div className="mt-6 border-t pt-6">
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Didn't receive a code?
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResendCode}
              disabled={!canResend || loading}
            >
              {!canResend && resendCountdown > 0 ? (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Resend in {Math.floor(resendCountdown / 60)}:
                  {(resendCountdown % 60).toString().padStart(2, "0")}
                </div>
              ) : (
                "Resend Code"
              )}
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm">
          <p className="text-muted-foreground">
            {from === "login" ? (
              <>
                Want to try a different email?{" "}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                  Back to login
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
