"use client"

import Link from "next/link"
import {
  Shield,
  TrendingUp,
  BarChart3,
  Lock,
  ChevronRight,
  Brain,
  Zap,
  CheckCircle2,
} from "lucide-react"
import { useI18n } from "@/hooks/use-i18n"
import { TrustBadges } from "@/components/ui/trust-badges"
import { Logo } from "@/components/ui/logo"
import { LandingCTA } from "@/components/landing-cta"
import { LanguageSwitcher } from "@/components/language-switcher"
import { getPlanAnnualRate } from "@/lib/investment-utils"
import type { InvestmentPlan } from "@/lib/types"

interface LandingClientProps {
  plans: InvestmentPlan[]
}

const defaultFeatures = [
  {
    icon: TrendingUp,
    titleKey: "automated_execution_title",
    descKey: "automated_execution_desc",
  },
  {
    icon: Shield,
    titleKey: "security_title",
    descKey: "security_desc",
  },
  {
    icon: BarChart3,
    titleKey: "analytics_title",
    descKey: "analytics_desc",
  },
  {
    icon: Brain,
    titleKey: "strategies_title",
    descKey: "strategies_desc",
  },
  {
    icon: Zap,
    titleKey: "transactions_title",
    descKey: "transactions_desc",
  },
  {
    icon: CheckCircle2,
    titleKey: "support_title",
    descKey: "support_desc",
  },
]

const defaultStats = [
  { labelKey: "assets_under_management", value: "$2.4B+" },
  { labelKey: "active_investors", value: "50,000+" },
  { labelKey: "average_return", value: "12.8%" },
  { labelKey: "countries_served", value: "35+" },
]

const defaultTestimonials = [
  {
    name: "Dorothy Winters",
    role: "Investor",
    quoteKey: "testimonial_1",
    avatar: "https://i.pravatar.cc/150?img=72",
  },
  {
    name: "Wallace Fitzgerald",
    role: "Financial Advisor",
    quoteKey: "testimonial_2",
    avatar: "https://i.pravatar.cc/150?img=58",
  },
  {
    name: "Harriet Coleman",
    role: "Business Owner",
    quoteKey: "testimonial_3",
    avatar: "https://i.pravatar.cc/150?img=55",
  },
]

const planDetails: Record<string, { risk: string; featured: boolean; desc: string }> = {
  cbf: {
    risk: "Low Risk",
    featured: false,
    desc: "Ideal for risk-averse investors seeking stable, long-term growth.",
  },
  gp: {
    risk: "Medium Risk",
    featured: true,
    desc: "Balanced portfolio combining growth and stability. Our most popular choice.",
  },
  hyef: {
    risk: "High Risk",
    featured: false,
    desc: "Aggressive strategy for experienced investors seeking maximum returns.",
  },
  ret: {
    risk: "Medium-Low Risk",
    featured: false,
    desc: "Real estate-backed investments offering consistent returns.",
  },
}

export function LandingClient({ plans }: LandingClientProps) {
  const { t } = useI18n("landing")

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 z-50 flex w-full items-center justify-between border-b border-border/50 bg-background/80 px-6 py-4 backdrop-blur-md lg:px-12">
        <Logo />
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="#features"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("nav_features")}
          </Link>
          <Link
            href="#stats"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("nav_performance")}
          </Link>
          <Link
            href="#plans"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("nav_plans")}
          </Link>
          <Link
            href="#testimonials"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("nav_testimonials")}
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <LandingCTA
            variant="ghost"
            size="sm"
            showText={t("nav_login")}
            showLoggedInText={t("nav_dashboard")}
            hrefWhenLoggedOut="/login"
            hrefWhenLoggedIn="/dashboard"
          />
          <LandingCTA
            size="sm"
            showText={t("nav_get_started")}
            showLoggedInText={t("nav_investing")}
            hrefWhenLoggedOut="/register"
            hrefWhenLoggedIn="/dashboard/investments"
          />
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-32 pb-20 lg:pt-44 lg:pb-32">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-64 right-0 h-96 w-96 bg-gradient-to-l from-primary/20 to-transparent blur-3xl" />
          <div className="absolute -bottom-64 left-0 h-96 w-96 bg-gradient-to-r from-accent/20 to-transparent blur-3xl" />
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-sm text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {t("hero_badge")}
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
          <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl">
            <span className="text-balance">
              {t("hero_title_part1")}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent font-serif">
                {" "}
                {t("hero_title_part2")}
              </span>
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {t("hero_description")}
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 w-full">
            <LandingCTA
              size="lg"
              className="shadow-lg hover:shadow-xl w-full sm:w-auto"
              showText={t("hero_cta_primary")}
              showLoggedInText={t("hero_cta_primary_logged")}
              hrefWhenLoggedOut="/register"
              hrefWhenLoggedIn="/dashboard/plans"
            />
            <LandingCTA
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              showText={t("hero_cta_secondary")}
              showLoggedInText={t("hero_cta_secondary_logged")}
              hrefWhenLoggedOut="/login"
              hrefWhenLoggedIn="/dashboard"
            />
          </div>

          {/* Trust badges */}
          <div className="mt-12 pt-12 border-t border-border/50">
            <TrustBadges />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-medium tracking-wider text-accent uppercase">
              {t("features_label")}
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              <span className="text-balance">{t("features_title")}</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              {t("features_description")}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {defaultFeatures.map((feature) => (
              <div
                key={feature.titleKey}
                className="group rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-7 transition-all duration-300 hover:border-primary/40 dark:hover:border-primary/50 hover:shadow-md hover:shadow-primary/5"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20 group-hover:bg-primary/15 dark:group-hover:bg-primary/25 transition-all">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {t(feature.descKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section
        id="stats"
        className="border-y border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-6 py-20 lg:px-12 lg:py-28"
      >
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              {t("stats_title")}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {defaultStats.map((stat) => (
              <div key={stat.labelKey} className="text-center">
                <p className="text-4xl font-bold text-primary md:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                  {t(stat.labelKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans preview */}
      <section id="plans" className="px-6 py-20 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold tracking-wider text-accent uppercase">
              {t("plans_label")}
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
              <span className="text-balance">{t("plans_title")}</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
              {t("plans_description")}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const detail =
                planDetails[plan.id] || {
                  risk: "Medium Risk",
                  featured: false,
                  desc: "Diversified investment opportunity",
                }
              const annualRate = getPlanAnnualRate(plan.planType || "Conservative Bond Fund")

              return (
                <div
                  key={plan.id}
                  className={`group relative rounded-lg border p-7 transition-all duration-300 ${
                    detail.featured
                      ? "border-accent bg-gradient-to-br from-accent/5 to-primary/5 dark:from-accent/10 dark:to-primary/10 shadow-xl shadow-accent/10 dark:shadow-accent/20"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md"
                  }`}
                >
                  {detail.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-accent to-primary px-4 py-1 text-xs font-bold text-white">
                      {t("plans_popular")}
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                    {detail.risk}
                  </p>
                  <p className="mt-5 text-5xl font-bold text-slate-900 dark:text-white">
                    {annualRate.toFixed(0)}%
                  </p>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    {t("plans_annual_return")}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {detail.desc}
                  </p>
                  <div className="my-6 border-t border-slate-200 dark:border-slate-700 pt-6">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {t("plans_min_investment")}:
                      </span>{" "}
                      ${(plan.minAmount || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="w-full">
                    <LandingCTA
                      variant={detail.featured ? "default" : "outline"}
                      showText={t("plans_cta")}
                      showLoggedInText={t("plans_invest_now")}
                      className="w-full"
                      planId={plan.id}
                      hrefWhenLoggedOut="/register"
                      hrefWhenLoggedIn={`/dashboard/investments?plan=${plan.id}`}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-8">
            {t("plans_disclaimer")}
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="px-6 py-20 lg:px-12 lg:py-28 bg-slate-50 dark:bg-slate-900/50">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold tracking-wider text-accent uppercase">
              {t("testimonials_label")}
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
              <span className="text-balance">{t("testimonials_title")}</span>
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {defaultTestimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-7 transition-all duration-300 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600"
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 flex-shrink-0 overflow-hidden">
                    {testimonial.avatar.startsWith("http") ? (
                      <img src={testimonial.avatar} alt={testimonial.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-primary">{testimonial.avatar}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 italic">
                  "{t(testimonial.quoteKey)}"
                </p>
                <div className="mt-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-amber-400">
                      ★
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden px-6 py-20 lg:px-12 lg:py-28">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 right-0 h-80 w-80 bg-gradient-to-l from-primary/20 to-transparent blur-3xl" />
          <div className="absolute -bottom-40 left-0 h-80 w-80 bg-gradient-to-r from-accent/20 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto max-w-3xl rounded-xl bg-gradient-to-br from-primary via-primary to-primary/95 p-12 text-center md:p-16 shadow-lg">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            <span className="text-balance">{t("cta_title")}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/80">
            {t("cta_description")}
          </p>
          <div className="mt-8">
            <LandingCTA
              size="lg"
              variant="secondary"
              className="shadow-lg hover:shadow-xl"
              showText={t("cta_button")}
              showLoggedInText={t("cta_button_logged")}
              hrefWhenLoggedOut="/register"
              hrefWhenLoggedIn="/dashboard/plans"
            />
          </div>
          <p className="mt-4 text-xs text-white/60">{t("cta_footnote")}</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-12 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-4 mb-8">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                  <Lock className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <span className="font-semibold text-foreground">Vault</span>
              </div>
              <p className="text-xs text-muted-foreground">{t("footer_tagline")}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-4">{t("footer_platform")}</p>
              <div className="space-y-2">
                <Link href="#features" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer_features")}
                </Link>
                <Link href="#plans" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer_pricing")}
                </Link>
                <Link href="#testimonials" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer_testimonials")}
                </Link>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-4">{t("footer_company")}</p>
              <div className="space-y-2">
                <Link href="/about" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer_about")}
                </Link>
                <Link href="/contact" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer_contact")}
                </Link>
                <Link href="/blog" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer_blog")}
                </Link>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-4">{t("footer_legal")}</p>
              <div className="space-y-2">
                <Link href="/terms" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer_terms")}
                </Link>
                <Link href="/privacy" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {t("footer_privacy")}
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-8">
            <p className="text-center text-xs text-muted-foreground">
              {t("footer_copyright")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
