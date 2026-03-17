"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function AuthNavButtons() {
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
      <>
        <Button variant="ghost" size="sm" disabled>
          Loading...
        </Button>
        <Button size="sm" disabled>
          Loading...
        </Button>
      </>
    )
  }

  if (isLoggedIn) {
    return (
      <>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/api/auth/logout">Log out</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/dashboard">
            Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </>
    )
  }

  return (
    <>
      <Button variant="ghost" size="sm" asChild>
        <Link href="/login">Sign in</Link>
      </Button>
      <Button size="sm" asChild>
        <Link href="/register">Get Started</Link>
      </Button>
    </>
  )
}
