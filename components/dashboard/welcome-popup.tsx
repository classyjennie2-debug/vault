"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sparkles, TrendingUp, Lock, Zap, CheckCircle2 } from "lucide-react"

interface WelcomePopupProps {
  firstName?: string
  lastName?: string
  isFirstVisit?: boolean
}

export function WelcomePopup({ firstName = "", lastName = "", isFirstVisit = true }: WelcomePopupProps) {
  const [open, setOpen] = useState(false)

  const displayName = firstName && lastName 
    ? `${firstName} ${lastName}` 
    : firstName || lastName || "Investor"

  useEffect(() => {
    // Check local storage for whether we've shown the welcome popup to this user
    // Only show once ever, persists across sessions
    if (typeof window !== 'undefined') {
      const hasShown = localStorage.getItem("vault-welcome-shown")
      if (!hasShown && isFirstVisit) {
        // Small delay to ensure dashboard has rendered
        const timer = setTimeout(() => {
          setOpen(true)
          localStorage.setItem("vault-welcome-shown", "true")
        }, 500)
        return () => clearTimeout(timer)
      }
    }
  }, [isFirstVisit])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm sm:max-w-md md:max-w-lg border border-primary/20 shadow-2xl bg-gradient-to-b from-slate-950/50 to-slate-900/50 backdrop-blur p-4 sm:p-6 rounded-xl">
        <DialogHeader className="space-y-3 sm:space-y-4">
          {/* Animated Icon */}
          <div className="flex items-center justify-center mb-1 sm:mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/40 via-accent/40 to-primary/40 rounded-full blur-lg sm:blur-xl animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-primary to-accent rounded-full p-2 sm:p-3 shadow-lg">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </div>

          {/* Welcome Message */}
          <DialogTitle className="text-center space-y-1 sm:space-y-2">
            <div className="text-sm sm:text-base md:text-lg text-muted-foreground font-medium">Welcome,</div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
              {displayName}
            </div>
          </DialogTitle>

          <DialogDescription className="text-center text-sm sm:text-base text-muted-foreground/80 leading-relaxed px-1">
            Your account is all set. You're now ready to start building your investment portfolio and grow your wealth with Vault.
          </DialogDescription>
        </DialogHeader>

        {/* Feature Highlights */}
        <div className="space-y-2 sm:space-y-3 py-4 sm:py-6">
          <div className="flex gap-2 sm:gap-3 items-start p-3 sm:p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500/50 transition-colors">
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="font-semibold text-xs sm:text-sm text-emerald-100">
                Diversified Investment Options
              </p>
              <p className="text-xs text-emerald-200/70 mt-0.5 leading-snug">
                Choose from multiple plans with competitive returns
              </p>
            </div>
          </div>

          <div className="flex gap-2 sm:gap-3 items-start p-3 sm:p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 hover:border-blue-500/50 transition-colors">
            <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="font-semibold text-xs sm:text-sm text-blue-100">
                Enterprise Security
              </p>
              <p className="text-xs text-blue-200/70 mt-0.5 leading-snug">
                Bank-level encryption to protect your funds
              </p>
            </div>
          </div>

          <div className="flex gap-2 sm:gap-3 items-start p-3 sm:p-4 rounded-lg bg-violet-500/10 border border-violet-500/30 hover:border-violet-500/50 transition-colors">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-violet-500 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="font-semibold text-xs sm:text-sm text-violet-100">
                Real-Time Portfolio Tracking
              </p>
              <p className="text-xs text-violet-200/70 mt-0.5 leading-snug">
                Monitor investments with live updates
              </p>
            </div>
          </div>

          <div className="flex gap-2 sm:gap-3 items-start p-3 sm:p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/50 transition-colors">
            <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="font-semibold text-xs sm:text-sm text-amber-100">
                Quick Setup
              </p>
              <p className="text-xs text-amber-200/70 mt-0.5 leading-snug">
                Start investing in minutes
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4">
          <Button
            onClick={() => setOpen(false)}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold h-9 sm:h-11 rounded-lg shadow-lg hover:shadow-primary/50 transition-all text-sm sm:text-base"
          >
            Start Exploring
          </Button>
          <p className="text-center text-xs text-muted-foreground/60 px-1">
            Visit Feature Guide in dashboard to learn more
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
