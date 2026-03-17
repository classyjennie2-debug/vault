"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface LandingCTAProps {
  variant?: "default" | "outline" | "secondary"
  size?: "sm" | "lg" | "default"
  className?: string
  showText?: string
  showLoggedInText?: string
  planId?: string
}

export function LandingCTA({
  variant = "default",
  size = "default",
  className = "",
  showText = "Get Started",
  showLoggedInText = "Go to Dashboard",
  planId,
}: LandingCTAProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/user/current")
        setIsLoggedIn(response.ok)
      } catch {
        setIsLoggedIn(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  if (isLoading) {
    return (
      <Button variant={variant} size={size} disabled className={className}>
        Loading...
      </Button>
    )
  }

  let href: string
  if (isLoggedIn) {
    // If logged in and plan is provided, go to dashboard to invest in that plan
    // Otherwise, go to investments/dashboard
    href = planId ? `/dashboard/investments?plan=${planId}` : "/dashboard/investments"
  } else {
    // If not logged in, go to register
    href = "/register"
  }
  
  const text = isLoggedIn ? showLoggedInText : showText

  return (
    <Button variant={variant} size={size} asChild className={className}>
      <Link href={href}>
        {text}
        {variant !== "outline" && <ArrowRight className="h-4 w-4" />}
      </Link>
    </Button>
  )
}
