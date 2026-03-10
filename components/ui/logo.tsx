"use client"

import { Shield } from "lucide-react"
import Link from "next/link"

interface LogoProps {
  className?: string
  showText?: boolean
  size?: "sm" | "md" | "lg"
}

export function Logo({ className = "", showText = true, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10"
  }

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  }

  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <div className={`flex items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-lg ${sizeClasses[size]}`}>
        <Shield className="h-4 w-4 text-primary-foreground" />
      </div>
      {showText && (
        <span className={`font-bold tracking-tight text-foreground font-serif ${textSizeClasses[size]}`}>
          Vault Capital
        </span>
      )}
    </Link>
  )
}

export function LogoIcon({ className = "", size = "md" }: Omit<LogoProps, 'showText'>) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10"
  }

  return (
    <div className={`flex items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-lg ${sizeClasses[size]} ${className}`}>
      <Shield className="h-4 w-4 text-primary-foreground" />
    </div>
  )
}