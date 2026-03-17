"use client"

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
    <Link href="/" className={`flex items-center gap-2.5 ${className}`}>
      {/* Modern Vault Logo SVG */}
      <div className={`flex items-center justify-center ${sizeClasses[size]}`}>
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Outer frame - Modern rounded rectangle */}
          <rect x="15" y="20" width="90" height="80" rx="12" ry="12" stroke="currentColor" strokeWidth="2.5" className="text-accent"/>
          
          {/* Inner vault door */}
          <rect x="25" y="30" width="70" height="60" rx="8" ry="8" fill="currentColor" fillOpacity="0.05" className="text-accent"/>
          
          {/* Lock dial - Modern circular */}
          <circle cx="60" cy="60" r="18" stroke="currentColor" strokeWidth="2" className="text-accent"/>
          <circle cx="60" cy="60" r="14" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" className="text-accent opacity-50"/>
          
          {/* Lock indicator dot */}
          <circle cx="60" cy="48" r="2.5" fill="currentColor" className="text-accent"/>
          
          {/* Security lines */}
          <line x1="35" y1="90" x2="85" y2="90" stroke="currentColor" strokeWidth="1.5" className="text-accent opacity-60"/>
          <line x1="35" y1="100" x2="85" y2="100" stroke="currentColor" strokeWidth="1" className="text-accent opacity-40"/>
          
          {/* Top accent bar */}
          <rect x="15" y="18" width="90" height="2" rx="1" fill="currentColor" className="text-accent"/>
        </svg>
      </div>
      
      {showText && (
        <span className={`font-bold tracking-tight text-foreground ${textSizeClasses[size]}`} style={{fontFamily: '"Inter", "Segoe UI", sans-serif', fontWeight: 700, letterSpacing: '-0.02em'}}>
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
    <div className={`flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Outer frame */}
        <rect x="15" y="20" width="90" height="80" rx="12" ry="12" stroke="currentColor" strokeWidth="2.5" className="text-accent"/>
        
        {/* Inner vault door */}
        <rect x="25" y="30" width="70" height="60" rx="8" ry="8" fill="currentColor" fillOpacity="0.05" className="text-accent"/>
        
        {/* Lock dial */}
        <circle cx="60" cy="60" r="18" stroke="currentColor" strokeWidth="2" className="text-accent"/>
        <circle cx="60" cy="60" r="14" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" className="text-accent opacity-50"/>
        
        {/* Lock indicator dot */}
        <circle cx="60" cy="48" r="2.5" fill="currentColor" className="text-accent"/>
        
        {/* Security lines */}
        <line x1="35" y1="90" x2="85" y2="90" stroke="currentColor" strokeWidth="1.5" className="text-accent opacity-60"/>
        <line x1="35" y1="100" x2="85" y2="100" stroke="currentColor" strokeWidth="1" className="text-accent opacity-40"/>
        
        {/* Top accent bar */}
        <rect x="15" y="18" width="90" height="2" rx="1" fill="currentColor" className="text-accent"/>
      </svg>
    </div>
  )
}