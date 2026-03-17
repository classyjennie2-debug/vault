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
  hrefWhenLoggedOut?: string
  hrefWhenLoggedIn?: string
}

export function LandingCTA({
  variant = "default",
  size = "default",
  className = "",
  showText = "Get Started",
  showLoggedInText = "View Dashboard",
  planId,
  hrefWhenLoggedOut = "/register",
  hrefWhenLoggedIn,
}: LandingCTAProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/user/current")
        setIsLoggedIn(response.ok)
      } catch {
        setIsLoggedIn(false)
      } finally {
        setHasMounted(true)
      }
    }

    checkSession()
  }, [])

  // Render immediately without loading state - use default state
  const isUserLoggedIn = hasMounted ? isLoggedIn : false

  let href: string
  if (isUserLoggedIn) {
    // If logged in and planId provided, go to invest in that plan
    if (hrefWhenLoggedIn) {
      href = hrefWhenLoggedIn
    } else if (planId) {
      href = `/dashboard/investments?plan=${planId}`
    } else {
      href = "/dashboard"
    }
  } else {
    href = hrefWhenLoggedOut
  }

  const text = isUserLoggedIn ? showLoggedInText : showText

  return (
    <Button variant={variant} size={size} asChild className={className}>
      <Link href={href}>
        {text}
        {variant !== "outline" && <ArrowRight className="h-4 w-4" />}
      </Link>
    </Button>
  )
}
