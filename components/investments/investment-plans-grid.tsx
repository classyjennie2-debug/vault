"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { InvestmentPlan } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { InvestmentForm } from "@/components/investments/investment-form"
import { safeNumber, getPlanAnnualRate } from "@/lib/investment-utils"
import { useI18n } from "@/hooks/use-i18n"
import { Shield, Zap, Flame, Star, Lock, FileText } from "lucide-react"
import { useState } from "react"

const riskMeta = {
  Low: {
    color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    accent: "border-t-2 border-emerald-500/60",
    drawdown: "Est. max drawdown −3%",
  },
  Medium: {
    color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    accent: "border-t-2 border-amber-500/60",
    drawdown: "Est. max drawdown −8%",
  },
  High: {
    color: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20",
    accent: "border-t-2 border-slate-500/60",
    drawdown: "Est. max drawdown −15%",
  },
} as const

const getRiskColor = (risk: string) =>
  riskMeta[(risk as keyof typeof riskMeta) || "Medium"]?.color

const getRiskAccent = (risk: string) =>
  riskMeta[(risk as keyof typeof riskMeta) || "Medium"]?.accent

const getDrawdownCopy = (risk: string) =>
  riskMeta[(risk as keyof typeof riskMeta) || "Medium"]?.drawdown

const formatPlanCopy = (plan: InvestmentPlan) => {
  const map: Record<string, string> = {
    "Conservative Bond Fund": "ETF basket of IG corporates and Treasuries for steady income.",
    "Balanced Growth": "65/35 equity-income tilt with quarterly rebalancing.",
    "Aggressive Growth": "Global equities + factor tilt toward quality and momentum.",
    "Short-Term": "1-3 yr Treasury ladder targeting low volatility cash parking.",
  }
  return plan.description || map[plan.planType || ""] || "Actively managed mix aligned to your stated objective."
}

const factsheetUrl = (plan: InvestmentPlan) => {
  // documentationUrl is not in type, return undefined
  return undefined
}

const currencyFormatter = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 })

export function InvestmentPlansGrid({ plans }: { plans: InvestmentPlan[] }) {
  const { t } = useI18n('investments')
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  // Sort plans by minimum amount (lowest first)
  const sortedPlans = [...plans].sort((a, b) => {
    const minA = a.minAmount || 0
    const minB = b.minAmount || 0
    return minA - minB
  })

  const isPopular = (index: number) => index === 1

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-card-foreground">{t('plans_title')}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t('plans_subtitle')}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 border border-border/60 px-3 py-2 rounded-lg">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <span>Custodied by Apex Clearing; customer funds are held in segregated accounts.</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {["Income", "Growth", "Low Vol", "Short Term"].map((tag) => (
            <Button key={tag} variant="outline" size="sm" className="rounded-full">
              {tag}
            </Button>
          ))}
        </div>
      </div>

      {plans.length === 0 && (
        <Card className="border-dashed border-2 border-border/70 p-6 text-center space-y-2">
          <CardTitle className="text-lg">{t('no_plans_available')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('curating_portfolios')}</p>
          <Button size="sm" className="mt-2">{t('talk_to_advisor')}</Button>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedPlans.map((plan, index) => {
          const minAmount = safeNumber(plan.minAmount, 100)
          const annualRate = getPlanAnnualRate(plan.planType || "Conservative Bond Fund")
          const risk = plan.risk || "Medium"

          return (
            <div key={plan.id} className="relative">
              {isPopular(index) && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-primary text-white border-0 shadow-md uppercase text-xs font-bold tracking-wider flex items-center gap-1">
                    <Star className="h-3 w-3" /> {t('most_popular')}
                  </Badge>
                </div>
              )}

              <Dialog
                open={selectedPlan === plan.id}
                onOpenChange={(open) => {
                  if (open) setSelectedPlan(plan.id)
                  else setSelectedPlan(null)
                }}
              >
                <Card
                  className={`h-full flex flex-col border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 border relative overflow-hidden group ${getRiskAccent(risk)} ${isPopular(index) ? "ring-2 ring-primary/20" : ""}`}
                >
                  <CardHeader className="relative z-10">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl ">{plan.name || "Investment Plan"}</CardTitle>
                        <Badge aria-label={`Risk level: ${risk}`} className={`mt-3 ${getRiskColor(risk)} flex flex-col items-start leading-tight`}>
                          <span className="text-[11px] font-semibold">Risk: {risk}</span>
                          <span className="text-[10px] text-muted-foreground/80">{getDrawdownCopy(risk)}</span>
                        </Badge>
                      </div>
                      <Shield className="h-6 w-6 text-muted-foreground/50 flex-shrink-0 mt-1" />
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col gap-4 relative z-10">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {formatPlanCopy(plan)}
                    </p>

                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/50">
                      <div className="rounded-lg p-3 bg-muted/40">
                        <p className="text-xs text-muted-foreground">Minimum investment</p>
                        <p className="text-lg font-bold text-card-foreground mt-1">
                          {currencyFormatter.format(minAmount)}
                        </p>
                      </div>
                      <div className="rounded-lg p-3 bg-muted/40">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          Estimated 1‑year net APY (after fees)
                        </p>
                        <p className="text-lg font-bold text-accent mt-1">
                          {annualRate.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground border border-dashed border-border/60 rounded-lg p-3">
                      Performance history will appear once the plan provides live data.
                    </div>

                    <div className="mt-4 space-y-2 text-xs text-card-foreground/80">
                      <div className="flex items-start gap-2 p-3 bg-accent/10 rounded-lg border border-accent/20">
                        <Flame className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-accent">Duration: Flexible 7-365 Days</p>
                          <p className="text-muted-foreground">Pick a term; reinvest or withdraw anytime after maturity.</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-lg border border-border/60">
                        <span className="text-muted-foreground font-semibold">Fees</span>
                        <span className="font-bold text-card-foreground">0.30% mgmt • No lockup</span>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2 bg-green-500/10 rounded-lg border border-green-500/20">
                        <span className="text-muted-foreground font-semibold">1-year return (est.)</span>
                        <span className="font-bold text-green-600 dark:text-green-400">{annualRate.toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      {factsheetUrl(plan) ? (
                        <a href={factsheetUrl(plan)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary font-semibold">
                          <FileText className="h-3.5 w-3.5" /> {t('download_factsheet')}
                        </a>
                      ) : (
                        <span className="flex items-center gap-1 text-muted-foreground">{t('factsheet_not_available')}</span>
                      )}
                      <span>{t('no_fees_withdraw_anytime')}</span>
                    </div>

                    <DialogTrigger asChild className="mt-auto">
                      <Button
                        className={`w-full mt-4 group/btn font-semibold transition-all duration-300 ${
                          isPopular(index) ? "bg-primary hover:bg-primary/90" : ""
                        }`}
                        size="sm"
                      >
                        <Zap className="h-4 w-4 mr-2 group-hover/btn:animate-pulse" />
                        {t('review_invest')}
                      </Button>
                    </DialogTrigger>
                  </CardContent>
                </Card>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('invest_in')} {plan.name || t('investment_plan')}</DialogTitle>
                  </DialogHeader>
                  <InvestmentForm plan={plan} onSuccess={() => setSelectedPlan(null)} />
                </DialogContent>
              </Dialog>
            </div>
          )
        })}
      </div>

      <Card className="p-5 bg-muted/40 border-dashed border-2 border-border/70">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <h3 className="font-semibold text-card-foreground">How we select plans</h3>
            <p className="text-sm text-muted-foreground">Every strategy passes a repeatable diligence flow.</p>
          </div>
          {["Screen", "Backtest", "Risk Review"].map((step) => (
            <div key={step} className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <div>
                <p className="font-semibold text-card-foreground">{step}</p>
                <p className="text-sm text-muted-foreground">
                  {step === "Screen" && "We filter for liquidity, fees, and transparency."}
                  {step === "Backtest" && "We model performance vs. peers across regimes."}
                  {step === "Risk Review" && "We set guardrails on drawdowns and exposures."}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
