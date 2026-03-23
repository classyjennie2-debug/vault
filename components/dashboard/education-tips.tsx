"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Lightbulb,
  ChevronRight,
  Zap,
  TrendingUp,
  Shield,
  BookOpen,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useI18n } from "@/hooks/use-i18n"

const educationTips = [
  {
    id: 1,
    icon: TrendingUp,
    categoryKey: "tip_investment_strategy",
    titleKey: "tip_diversification_title",
    descriptionKey: "tip_diversification_desc",
    color: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
  },
  {
    id: 2,
    icon: Zap,
    categoryKey: "tip_market_insight",
    titleKey: "tip_compound_interest_title",
    descriptionKey: "tip_compound_interest_desc",
    color: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
  },
  {
    id: 3,
    icon: Shield,
    categoryKey: "tip_risk_management",
    titleKey: "tip_risk_management_title",
    descriptionKey: "tip_risk_management_desc",
    color: "bg-green-500/20 text-green-600 dark:text-green-400",
  },
  {
    id: 4,
    icon: BookOpen,
    categoryKey: "tip_product_feature",
    titleKey: "tip_auto_reinvestment_title",
    descriptionKey: "tip_auto_reinvestment_desc",
    color: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
  },
  {
    id: 5,
    icon: TrendingUp,
    categoryKey: "tip_investment_strategy",
    titleKey: "tip_dollar_cost_averaging_title",
    descriptionKey: "tip_dollar_cost_averaging_desc",
    color: "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400",
  },
  {
    id: 6,
    icon: Zap,
    categoryKey: "tip_market_insight",
    titleKey: "tip_start_early_title",
    descriptionKey: "tip_start_early_desc",
    color: "bg-rose-500/20 text-rose-600 dark:text-rose-400",
  },
]

export function EducationTips() {
  const { t } = useI18n("dashboardmain")
  const [currentTip, setCurrentTip] = useState(0)
  const [autoRotate, setAutoRotate] = useState(true)

  useEffect(() => {
    if (!autoRotate) return

    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % educationTips.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [autoRotate])

  const tip = educationTips[currentTip]
  const Icon = tip.icon

  const handleNext = () => {
    setCurrentTip((prev) => (prev + 1) % educationTips.length)
    setAutoRotate(false)
    setTimeout(() => setAutoRotate(true), 10000)
  }

  const handlePrev = () => {
    setCurrentTip((prev) => (prev - 1 + educationTips.length) % educationTips.length)
    setAutoRotate(false)
    setTimeout(() => setAutoRotate(true), 10000)
  }

  return (
    <Card className="border backdrop-blur-lg bg-gradient-to-br from-slate-50/50 to-slate-100/30 dark:from-slate-950/50 dark:to-slate-900/30 animate-in fade-in slide-in-from-bottom duration-700">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-3 sm:pb-4">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base font-normal text-muted-foreground">
          <Lightbulb className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <span className="truncate">{t("daily_learning_tip")}</span>
        </CardTitle>
        <div className="text-xs text-muted-foreground">
          {currentTip + 1} / {educationTips.length}
        </div>
      </CardHeader>

      <CardContent className="pt-4 sm:pt-6">
        <div className="space-y-4">
          {/* Tip Card */}
          <div className={`p-4 rounded-lg ${tip.color} border border-current/10`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${tip.color} flex-shrink-0`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wide opacity-75">
                    {t(tip.categoryKey)}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-semibold mb-2">{t(tip.titleKey)}</h3>
                <p className="text-xs sm:text-sm opacity-90 leading-relaxed">
                  {t(tip.descriptionKey)}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-border/50 hover:bg-accent transition-colors"
              aria-label="Previous tip"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
            </button>

            {/* Dot Indicators */}
            <div className="flex justify-center gap-1.5 flex-wrap">
              {educationTips.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentTip(idx)
                    setAutoRotate(false)
                    setTimeout(() => setAutoRotate(true), 10000)
                  }}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentTip
                      ? "w-6 bg-primary"
                      : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  aria-label={`Go to tip ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-border/50 hover:bg-accent transition-colors"
              aria-label="Next tip"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
