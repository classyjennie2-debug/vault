import Link from "next/link"
import {
  ArrowRight,
  Shield,
  TrendingUp,
  BarChart3,
  Lock,
  ChevronRight,
  Brain,
  Zap,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { TrustBadges } from "@/components/ui/trust-badges"
import { Logo } from "@/components/ui/logo"
import { LandingCTA } from "@/components/landing-cta"
import { getInvestmentPlansFromDb } from "@/lib/db"
import { getPlanAnnualRate } from "@/lib/investment-utils"

const features = [
  {
    icon: TrendingUp,
    title: "Automated Execution",
    description:
      "Invest with confidence using AI-powered portfolio management that automatically rebalances your holdings for optimal performance.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "Bank-level encryption, 2FA authentication, and cold storage wallets protect your assets 24/7.",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description:
      "Access real-time market insights, detailed performance reports, and AI-driven investment recommendations.",
  },
  {
    icon: Brain,
    title: "Smart Strategies",
    description:
      "Customize investment strategies using machine learning algorithms tailored to your risk profile.",
  },
  {
    icon: Zap,
    title: "Fast Transactions",
    description:
      "Instant deposits, rapid withdrawals, and real-time transaction processing at competitive fees.",
  },
  {
    icon: CheckCircle2,
    title: "Expert Support",
    description:
      "24/7 dedicated support team, educational resources, and personal investment advisors.",
  },
]

const stats = [
  { label: "Assets Under Management", value: "$2.4B+" },
  { label: "Active Investors", value: "50,000+" },
  { label: "Average Annual Return", value: "12.8%" },
  { label: "Countries Served", value: "35+" },
]

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Investor",
    quote: "Vault has completely transformed how I manage my investments. The automated strategies have saved me time and increased my returns.",
    avatar: "SC",
  },
  {
    name: "Marcus Johnson",
    role: "Financial Advisor",
    quote: "I recommend Vault to all my clients. The platform's transparency and security features are unmatched in the industry.",
    avatar: "MJ",
  },
  {
    name: "Priya Patel",
    role: "Business Owner",
    quote: "As a busy entrepreneur, Vault allows me to invest without the complexity. Highly impressed with the results.",
    avatar: "PP",
  },
]

export default async function LandingPage() {
  // Fetch real investment plans from database
  const plans = await getInvestmentPlansFromDb()
  
  // Create plan details mapping
  const planDetails: Record<string, { risk: string; featured: boolean; desc: string }> = {
    "cbf": {
      risk: "Low Risk",
      featured: false,
      desc: "Ideal for risk-averse investors seeking stable, long-term growth."
    },
    "gp": {
      risk: "Medium Risk",
      featured: true,
      desc: "Balanced portfolio combining growth and stability. Our most popular choice."
    },
    "hyef": {
      risk: "High Risk",
      featured: false,
      desc: "Aggressive strategy for experienced investors seeking maximum returns."
    },
    "ret": {
      risk: "Medium-Low Risk",
      featured: false,
      desc: "Real estate-backed investments offering consistent returns."
    }
  }
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
            Features
          </Link>
          <Link
            href="#stats"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Performance
          </Link>
          <Link
            href="#plans"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Plans
          </Link>
          <Link
            href="#testimonials"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Testimonials
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <LandingCTA 
            variant="ghost" 
            size="sm" 
            showText="Log in" 
            showLoggedInText="Dashboard"
            hrefWhenLoggedOut="/login"
            hrefWhenLoggedIn="/dashboard"
          />
          <LandingCTA 
            size="sm" 
            showText="Get Started" 
            showLoggedInText="Start Investing"
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
            Now serving 50,000+ investors worldwide
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
          <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl">
            <span className="text-balance">
              Secure. Transparent.
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent font-serif">
                {" "}Profitable.
              </span>
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Institutional-grade investment management for individual investors. Access
            diversified portfolios, advanced analytics, and AI-powered strategies designed
            to maximize returns while managing risk effectively.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 w-full">
            <LandingCTA 
              size="lg" 
              className="shadow-lg hover:shadow-xl w-full sm:w-auto"
              showText="Start Investing Free"
              showLoggedInText="Browse Plans"
              hrefWhenLoggedOut="/register"
              hrefWhenLoggedIn="/dashboard/plans"
            />
            <LandingCTA 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto"
              showText="View Dashboard"
              showLoggedInText="My Portfolio"
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
              Why Choose Vault Capital
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              <span className="text-balance">
                Everything you need to invest smarter
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              From portfolio management to risk analysis, Vault provides comprehensive tools for investors of all levels.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-7 transition-all duration-300 hover:border-primary/40 dark:hover:border-primary/50 hover:shadow-md hover:shadow-primary/5"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20 group-hover:bg-primary/15 dark:group-hover:bg-primary/25 transition-all">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {feature.description}
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
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Trusted by thousands</h2>
          </div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-bold text-primary md:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                  {stat.label}
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
              Investment Plans
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
              <span className="text-balance">
                Plans for every investor
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
              Start with as little as $1,000 and customize your investment strategy based on your risk tolerance.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const detail = planDetails[plan.id] || { risk: "Medium Risk", featured: false, desc: "Diversified investment opportunity" }
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
                      Most Popular
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
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">annual return*</p>
                  <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {detail.desc}
                  </p>
                  <div className="my-6 border-t border-slate-200 dark:border-slate-700 pt-6">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      <span className="font-semibold text-slate-900 dark:text-white">Min. Investment:</span> ${(plan.minAmount || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="w-full">
                    <LandingCTA
                      variant={detail.featured ? "default" : "outline"}
                      showText="Get Started"
                      showLoggedInText="Invest Now"
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
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-8">*Past performance does not guarantee future results</p>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="px-6 py-20 lg:px-12 lg:py-28 bg-slate-50 dark:bg-slate-900/50">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold tracking-wider text-accent uppercase">
              Success Stories
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
              <span className="text-balance">
                Trusted by investors worldwide
              </span>
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-7 transition-all duration-300 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600"
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 flex-shrink-0">
                    <span className="text-xs font-bold text-primary">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{testimonial.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 italic">
                  "{testimonial.quote}"
                </p>
                <div className="mt-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-amber-400">★</span>
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
            <span className="text-balance">
              Start building wealth today
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/80">
            Join thousands of successful investors who are growing their wealth with Vault. 
            Create your account free and start investing in minutes.
          </p>
          <div className="mt-8">
            <LandingCTA
              size="lg"
              variant="secondary"
              className="shadow-lg hover:shadow-xl"
              showText="Create Free Account"
              showLoggedInText="Get Investing"
              hrefWhenLoggedOut="/register"
              hrefWhenLoggedIn="/dashboard/plans"
            />
          </div>
          <p className="mt-4 text-xs text-white/60">
            No credit card required • Free forever plan • Upgrade anytime
          </p>
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
                <span className="font-semibold text-foreground">
                  Vault
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Institutional-grade investing for everyone.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-4">Platform</p>
              <div className="space-y-2">
                <Link href="#features" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Features</Link>
                <Link href="#plans" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Plans</Link>
                <Link href="/login" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-4">Company</p>
              <div className="space-y-2">
                <Link href="/about" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">About</Link>
                <Link href="/blog" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
                <Link href="/contact" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-4">Legal</p>
              <div className="space-y-2">
                <Link href="/terms" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
                <Link href="/privacy" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
                <Link href="/compliance" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Compliance</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © 2026 Vault Invest. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="https://twitter.com/vaultcapitalbond" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 19H5V8h3v11zm-1.5-12.5c-1 0-1.8-.8-1.8-1.8 0-1 .8-1.8 1.8-1.8 1 0 1.8.8 1.8 1.8 0 1-.8 1.8-1.8 1.8zm12.5 12.5h-3v-6c0-1.4-.5-2.4-1.7-2.4-1 0-1.5.7-1.8 1.3-.1.2-.1.5-.1.7v6.4h-3V8h3v1.5c.4-.7 1.3-1.7 3.2-1.7 2.4 0 4.2 1.6 4.2 5v7.2z" /></svg>
              </a>
              <a href="https://linkedin.com/company/vaultcapitalbond" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.722-2.004 1.418-.103.249-.129.597-.129.946v5.441h-3.554s.047-8.842 0-9.769h3.554v1.383c.433-.667 1.208-1.615 2.938-1.615 2.146 0 3.75 1.404 3.75 4.42v5.581zM5.337 9.433c-1.144 0-1.915-.758-1.915-1.704 0-.951.768-1.704 1.959-1.704 1.188 0 1.913.753 1.932 1.704 0 .946-.744 1.704-1.976 1.704zm1.946 10.019H3.39V9.684h3.893v9.768zM22.224 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.224 0z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
