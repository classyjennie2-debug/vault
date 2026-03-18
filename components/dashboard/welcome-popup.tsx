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
      <DialogContent className="max-w-sm sm:max-w-md md:max-w-lg border-2 border-amber-700/20 shadow-2xl bg-gradient-to-b from-white to-amber-50/30 p-4 sm:p-6 rounded-2xl">
        <DialogHeader className="space-y-3 sm:space-y-4">
          {/* Animated Icon */}
          <div className="flex items-center justify-center mb-1 sm:mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-600/30 via-amber-700/30 to-amber-600/30 rounded-full blur-lg sm:blur-xl animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-amber-700 to-amber-800 rounded-full p-2 sm:p-3 shadow-lg">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-amber-100" />
              </div>
            </div>
          </div>

          {/* Welcome Message */}
          <DialogTitle className="text-center space-y-2 sm:space-y-3">
            <div className="text-sm sm:text-base font-medium text-slate-600">Welcome back,</div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
              {displayName}
            </div>
          </DialogTitle>

          <DialogDescription className="text-center text-sm sm:text-base text-slate-700 leading-relaxed px-1 font-medium">
            Your account is all set. You're ready to start investing and growing your wealth with Vault.
          </DialogDescription>
        </DialogHeader>

        {/* Quick Start Section */}
        <div className="mt-6 sm:mt-8 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <span className="inline-block w-1 h-4 bg-amber-700 rounded-full"></span>
            Key Features
          </h3>
          
          <div className="space-y-2 sm:space-y-3">
            <div className="flex gap-2 sm:gap-3 items-start p-3 sm:p-4 rounded-lg bg-amber-50 border border-amber-200 hover:border-amber-300 transition-colors">
              <CheckCircle2 className="h-5 w-5 text-amber-700 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-semibold text-sm text-slate-900">
                  Diversified Plans
                </p>
                <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                  Multiple investment options with competitive returns
                </p>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 items-start p-3 sm:p-4 rounded-lg bg-amber-50 border border-amber-200 hover:border-amber-300 transition-colors">
              <Lock className="h-5 w-5 text-amber-700 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-semibold text-sm text-slate-900">
                  Bank-Level Security
                </p>
                <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                  Military-grade encryption protecting your assets
                </p>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 items-start p-3 sm:p-4 rounded-lg bg-amber-50 border border-amber-200 hover:border-amber-300 transition-colors">
              <TrendingUp className="h-5 w-5 text-amber-700 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-semibold text-sm text-slate-900">
                  Real-Time Tracking
                </p>
                <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                  Monitor your portfolio with live market updates
                </p>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 items-start p-3 sm:p-4 rounded-lg bg-amber-50 border border-amber-200 hover:border-amber-300 transition-colors">
              <Zap className="h-5 w-5 text-amber-700 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-semibold text-sm text-slate-900">
                  Quick Setup
                </p>
                <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                  Start investing in just a few minutes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-3 pt-6 sm:pt-8">
          <Button
            onClick={() => setOpen(false)}
            className="w-full bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-amber-100 font-semibold h-10 sm:h-12 rounded-lg shadow-lg hover:shadow-amber-700/50 transition-all text-sm sm:text-base"
          >
            Start Exploring Dashboard
          </Button>
          <p className="text-center text-xs text-slate-500">
            Learn more in the Feature Guide
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
