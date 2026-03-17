import { Check } from "lucide-react"
import Footer from "@/components/layout/footer"

const plans = [
  {
    name: "Conservative Bond Fund",
    description: "Safe, steady returns with low risk exposure",
    monthlyReturn: "21.7% every 7 days",
    minInvestment: "$100",
    duration: "7-365 days (flexible)",
    features: [
      "Low risk investment",
      "Compound bonus on longer terms",
      "Flexible duration selection",
      "Daily earnings tracking",
      "Email notifications",
      "Mobile-friendly dashboard",
      "Basic analytics",
      "Email support (< 15 min response)",
    ],
    highlighted: false,
  },
  {
    name: "Growth Portfolio",
    description: "Balanced growth strategy for steady wealth building",
    monthlyReturn: "35% every 7 days",
    minInvestment: "$500",
    duration: "7-365 days (flexible)",
    features: [
      "All Conservative features",
      "Higher base returns",
      "Priority support",
      "Advanced analytics",
      "Portfolio optimization",
      "Dedicated account manager",
      "Quarterly performance reports",
      "Compound interest tracking",
    ],
    highlighted: true,
  },
  {
    name: "High Yield Equity Fund",
    description: "Aggressive strategy for experienced investors seeking maximum returns",
    monthlyReturn: "50% every 7 days",
    minInvestment: "$1,000",
    duration: "7-365 days (flexible)",
    features: [
      "All Growth Portfolio features",
      "Aggressive equity exposure",
      "24/7 premium support",
      "Custom investment strategy",
      "Direct portfolio advisor",
      "Weekly performance reviews",
      "Multi-asset diversification",
      "VIP event access",
    ],
    highlighted: false,
  },
]

const comparisonFeatures = [
  { feature: "Minimum Investment", starter: "$100", professional: "$500", premium: "$1,000" },
  { feature: "All-in Return (7 days)", starter: "21.7%", professional: "35%", premium: "50%" },
  { feature: "Annual Potential", starter: "800%", professional: "1200%+", premium: "2000%+" },
  { feature: "Lock-in Period", starter: "7-365 days", professional: "7-365 days", premium: "7-365 days" },
  { feature: "Insurance Coverage", starter: "Basic", professional: "Standard", premium: "Premium+" },
  { feature: "Withdrawals", starter: "Flexible", professional: "Flexible", premium: "Flexible" },
  { feature: "Risk Level", starter: "Low", professional: "Medium", premium: "High" },
  { feature: "Account Manager", starter: "No", professional: "Yes", premium: "Dedicated 24/7" },
  { feature: "Support Response Time", starter: "Under 15 min", professional: "Under 15 min", premium: "Under 15 min" },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      {/* Header */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Investment Plans</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Choose the perfect investment plan that matches your financial goals and risk appetite.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <div className="px-4 py-2 rounded-full bg-accent/10 text-accent font-medium">
              Transparent Pricing
            </div>
            <div className="px-4 py-2 rounded-full bg-accent/10 text-accent font-medium">
              Flexible Terms
            </div>
            <div className="px-4 py-2 rounded-full bg-accent/10 text-accent font-medium">
              Insured Funds
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-lg border-2 overflow-hidden transition-all ${
                plan.highlighted
                  ? "border-accent shadow-2xl scale-105 md:scale-100"
                  : "border-border hover:border-accent/50"
              }`}
            >
              {plan.highlighted && (
                <div className="bg-accent text-white py-2 text-center font-semibold text-sm">
                  MOST POPULAR
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

                {/* Stats */}
                <div className="space-y-3 mb-8 pb-8 border-b">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Return</p>
                    <p className="text-2xl font-bold text-accent">{plan.monthlyReturn}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Minimum Investment</p>
                    <p className="text-xl font-semibold">{plan.minInvestment}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Lock-in Period</p>
                    <p className="text-xl font-semibold">{plan.duration}</p>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    plan.highlighted
                      ? "bg-accent text-white hover:bg-accent/90"
                      : "border border-accent text-accent hover:bg-accent/10"
                  }`}
                >
                  Invest Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-secondary/50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Detailed Comparison</h2>

            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full">
                <thead className="bg-secondary border-b">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Features</th>
                    <th className="px-6 py-4 text-center font-semibold">Starter</th>
                    <th className="px-6 py-4 text-center font-semibold">Professional</th>
                    <th className="px-6 py-4 text-center font-semibold">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((row, index) => (
                    <tr key={index} className="border-t hover:bg-secondary/30">
                      <td className="px-6 py-4 font-medium">{row.feature}</td>
                      <td className="px-6 py-4 text-center text-sm">{row.starter}</td>
                      <td className="px-6 py-4 text-center text-sm font-semibold">
                        {row.professional}
                      </td>
                      <td className="px-6 py-4 text-center text-sm">{row.premium}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Pricing FAQs</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Can I switch plans after investing?</h3>
              <p className="text-muted-foreground">
                Yes, you can upgrade to a higher plan at any time. If you downgrade, it will take effect
                on your next investment cycle.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">What happens if I need to withdraw early?</h3>
              <p className="text-muted-foreground">
                All plans allow flexible withdrawals. Early withdrawals may incur a small admin fee (1-2%), but your
                principal and accrued returns are always accessible.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Are the returns guaranteed?</h3>
              <p className="text-muted-foreground">
                Returns shown are based on historical performance and market conditions. Past performance doesn't
                guarantee future results. All investments carry some level of risk.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Is there a fee beyond the returns?</h3>
              <p className="text-muted-foreground">
                No hidden fees. All costs are transparent and already factored into the returns shown. You only pay
                when you withdraw or switch plans.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">How are returns paid?</h3>
              <p className="text-muted-foreground">
                Daily returns are automatically deposited to your wallet. You can reinvest them for compound growth
                or withdraw anytime.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Do you offer custom plans?</h3>
              <p className="text-muted-foreground">
                Yes! Premium members can work with their dedicated account manager to create a custom investment
                strategy tailored to their specific goals.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-accent/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Investing?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of investors who are building wealth with our transparent and secure platform.
          </p>
          <button className="bg-accent text-white px-8 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-all">
            Create Account & Invest
          </button>
        </div>
      </div>
      <Footer />
    </div>
  )
}
