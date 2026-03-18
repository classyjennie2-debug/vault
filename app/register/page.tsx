"use client"

import React from "react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, ArrowLeft, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordStrengthMeter, calculatePasswordStrength } from "@/components/auth/password-strength-meter"
import { COUNTRY_CODES_LIST, type CountryCode } from "@/lib/phone-validation"

export default function RegisterPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [phoneCountry, setPhoneCountry] = useState<CountryCode>("US")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState<0 | 1>(0)
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")
  const [canResend, setCanResend] = useState(true)
  const [resendCountdown, setResendCountdown] = useState(0)

  // Countdown timer for resend
  React.useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
    if (resendCountdown === 0 && !canResend) {
      setCanResend(true)
    }
  }, [resendCountdown, canResend])

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setInfo("")
    
    if (!firstName.trim() || !lastName.trim() || !email || !password || !phone.trim() || !dateOfBirth || !phoneCountry) {
      setError("All fields are required")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          firstName, 
          lastName,
          email, 
          password,
          phone,
          phoneCountry,
          dateOfBirth
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Something went wrong")
        setLoading(false)
        console.error("Signup error response:", { status: res.status, data })
        return
      }
      setInfo("Verification code sent to your email")
      setLoading(false)
      setStep(1)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error"
      setError(`Failed to create account: ${message}`)
      setLoading(false)
      console.error("Signup fetch error:", err)
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Invalid code")
        setLoading(false)
        return
      }
      // user is logged in automatically by backend
      // Don't disable loading - keep button locked during redirect
      router.push("/dashboard")
    } catch (_err) {
      setError("An error occurred. Please try again.")
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

  return (
    <div className="flex min-h-screen">
      {/* Left: visual panel */}
      <div className="hidden w-1/2 bg-primary lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-12">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5">
            <Lock className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-primary-foreground">
            Start Your Journey
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-primary-foreground/60">
            Join 50,000+ investors using Vault to build and grow their wealth
            with diversified, institutional-grade strategies.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-4">
              <p className="text-xl font-bold text-primary-foreground">6.5%</p>
              <p className="mt-1 text-xs text-primary-foreground/50">
                Conservative
              </p>
            </div>
            <div className="rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-4">
              <p className="text-xl font-bold text-primary-foreground">
                12.8%
              </p>
              <p className="mt-1 text-xs text-primary-foreground/50">Growth</p>
            </div>
            <div className="rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-4">
              <p className="text-xl font-bold text-primary-foreground">
                22.5%
              </p>
              <p className="mt-1 text-xs text-primary-foreground/50">
                High Yield
              </p>
            </div>
          </div>
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
          Create your account
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Get started with Vault in under 2 minutes
        </p>

        {step === 0 ? (
          <form onSubmit={handleRegister} className="mt-8 flex flex-col gap-5">
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            {info && (
              <p className="text-sm text-green-600">{info}</p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="First"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Last"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex gap-2">
                <select
                  value={phoneCountry}
                  onChange={(e) => setPhoneCountry(e.target.value as CountryCode)}
                  className="flex h-10 w-24 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {COUNTRY_CODES_LIST.map((country) => (
                    <option key={country.countryCode} value={country.countryCode}>
                      {country.flag} {country.code}
                    </option>
                  ))}
                </select>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="flex-1"
                />
              </div>
              {phoneCountry && (
                <p className="text-xs text-muted-foreground">
                  Format: {COUNTRY_CODES_LIST.find(c => c.countryCode === phoneCountry)?.format}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <PasswordStrengthMeter password={password} />
            </div>
            <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading || calculatePasswordStrength(password).score < 2}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="mt-8 flex flex-col gap-5">
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            {info && (
              <p className="text-sm text-green-600">{info}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Enter the verification code we sent to <strong>{email}</strong>
            </p>
            <div className="flex flex-col gap-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
            <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
              {loading ? "Verifying..." : "Verify & Continue"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handleResendCode}
              disabled={!canResend || loading}
            >
              {!canResend && resendCountdown > 0
                ? `Resend in ${Math.floor(resendCountdown / 60)}:${String(resendCountdown % 60).padStart(2, '0')}`
                : "Resend Code"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
