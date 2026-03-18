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
import { Sparkles, TrendingUp, Lock, Zap } from "lucide-react"

interface WelcomePopupProps {
  userName?: string
  isFirstVisit?: boolean
}

export function WelcomePopup({ userName = "Investor", isFirstVisit = true }: WelcomePopupProps) {
  const [open, setOpen] = useState(isFirstVisit)

  useEffect(() => {
    // Check session storage for whether we've shown the welcome popup this session
    const hasShown = sessionStorage.getItem("vault-welcome-shown")
    if (!hasShown && isFirstVisit) {
      setOpen(true)
      sessionStorage.setItem("vault-welcome-shown", "true")
    }
  }, [isFirstVisit])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg border-2 border-accent/20 shadow-2xl">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/30 rounded-full blur-2xl animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-accent to-accent/80 rounded-full p-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          <DialogTitle className="text-3xl font-bold text-center">
            Welcome to Vault, {userName}! 🚀
          </DialogTitle>
          <DialogDescription className="text-center text-base mt-2">
            You're now part of a community of investors building wealth smarter
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-6">
          {/* Feature highlights */}
          <div className="grid gap-3">
            <div className="flex gap-3 items-start p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/30 dark:border-emerald-800/30">
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-emerald-900 dark:text-emerald-100">
                  Smart Portfolio Growth
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Earn 14-22% annual returns with AI-powered strategies
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/30 dark:border-blue-800/30">
              <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-blue-900 dark:text-blue-100">
                  Bank-Grade Security
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Your funds are protected with advanced encryption tech
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start p-3 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/30 dark:border-purple-800/30">
              <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-purple-900 dark:text-purple-100">
                  Quick Setup
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-300">
                  Start investing in minutes with comprehensive guidance
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-4 space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              Explore your dashboard to start your wealth-building journey
            </p>
            <Button
              onClick={() => setOpen(false)}
              className="w-full bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-white font-semibold py-2 h-auto"
            >
              Let's Get Started →
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
