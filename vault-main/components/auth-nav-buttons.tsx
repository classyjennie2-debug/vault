"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function AuthNavButtons() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/user/current", { cache: "no-store" })
        setIsLoggedIn(response.ok)
      } catch {
        setIsLoggedIn(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        // Clear client-side state
        setIsLoggedIn(false)
        
        // Clear any stored auth data
        localStorage.removeItem("user")
        localStorage.removeItem("token")
        localStorage.removeItem("auth_data")
        sessionStorage.clear()
        
        // Redirect to home
        router.push("/")
        
        // Force page refresh to ensure clean state
        setTimeout(() => {
          window.location.href = "/"
        }, 100)
      }
    } catch (error) {
      console.error("Logout failed:", error)
      // Force redirect even if logout fails
      window.location.href = "/"
    }
  }

  // Don't show loading state - render with default immediately
  if (isLoggedIn) {
    return (
      <>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Log out
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
