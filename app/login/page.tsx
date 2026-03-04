"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (email.includes("admin")) {
      router.push("/admin")
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left: Form */}
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
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to your account to continue
        </p>

        <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-5">
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="#"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" size="lg" className="mt-2 w-full">
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {"Don't have an account? "}
          <Link
            href="/register"
            className="font-medium text-foreground hover:underline"
          >
            Create one
          </Link>
        </p>
        <p className="mt-4 text-center text-xs text-muted-foreground/60">
          Tip: Use &quot;admin&quot; in email to access admin dashboard
        </p>
      </div>

      {/* Right: visual panel */}
      <div className="hidden w-1/2 bg-primary lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-12">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5">
            <Lock className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-primary-foreground">
            Secure & Transparent
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-primary-foreground/60">
            Your investments are protected with bank-level encryption and
            institutional-grade security protocols. Track every transaction in
            real time.
          </p>
          <div className="mt-10 flex justify-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-foreground">256-bit</p>
              <p className="text-xs text-primary-foreground/50">Encryption</p>
            </div>
            <div className="h-12 w-px bg-primary-foreground/10" />
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-foreground">99.99%</p>
              <p className="text-xs text-primary-foreground/50">Uptime</p>
            </div>
            <div className="h-12 w-px bg-primary-foreground/10" />
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-foreground">SOC 2</p>
              <p className="text-xs text-primary-foreground/50">Certified</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
