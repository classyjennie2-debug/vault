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
      <DialogContent className="max-w-lg border border-primary/20 shadow-2xl bg-gradient-to-b from-slate-950/50 to-slate-900/50 backdrop-blur">
        <DialogHeader className="space-y-4">
          {/* Animated Icon */}
          <div className="flex items-center justify-center mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/40 via-accent/40 to-primary/40 rounded-full blur-xl animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-primary to-accent rounded-full p-3 shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          {/* Welcome Message */}
          <DialogTitle className="text-center space-y-2">
            <div className="text-lg text-muted-foreground font-medium">Welcome,</div>
            <div className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {displayName}
            </div>
          </DialogTitle>

          <DialogDescription className="text-center text-base text-muted-foreground/80 leading-relaxed">
            Your account is all set. You're now ready to start building your investment portfolio and grow your wealth with Vault.
          </DialogDescription>
        </DialogHeader>

        {/* Feature Highlights */}
        <div className="space-y-3 py-6">
          <div className="flex gap-3 items-start p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500/50 transition-colors">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-emerald-100">
                Diversified Investment Options
              </p>
              <p className="text-xs text-emerald-200/70 mt-0.5">
                Choose from multiple investment plans with competitive returns
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 hover:border-blue-500/50 transition-colors">
            <Lock className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-blue-100">
                Enterprise Security
              </p>
              <p className="text-xs text-blue-200/70 mt-0.5">
                Your funds protected with bank-level encryption and security protocols
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start p-4 rounded-lg bg-violet-500/10 border border-violet-500/30 hover:border-violet-500/50 transition-colors">
            <TrendingUp className="h-5 w-5 text-violet-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-violet-100">
                Real-Time Portfolio Tracking
              </p>
              <p className="text-xs text-violet-200/70 mt-0.5">
                Monitor your investments and earnings with live updates and detailed analytics
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/50 transition-colors">
            <Zap className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-amber-100">
                Quick Setup
              </p>
              <p className="text-xs text-amber-200/70 mt-0.5">
                Start investing in minutes with our easy-to-use platform
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-3 pt-4">
          <Button
            onClick={() => setOpen(false)}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold h-11 rounded-lg shadow-lg hover:shadow-primary/50 transition-all"
          >
            Start Exploring
          </Button>
          <p className="text-center text-xs text-muted-foreground/60">
            Visit the Feature Guide in your dashboard to learn more
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
