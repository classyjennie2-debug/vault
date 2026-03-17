import Link from "next/link"
import { Star, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import Footer from "@/components/layout/footer"

const testimonials = [
  {
    name: "Alex Martinez",
    role: "Portfolio Manager",
    location: "New York, USA",
    image: "👨‍💼",
    text: "Vault's platform transformed how I manage my crypto investments. The analytics dashboard is exceptional, and the 14% monthly returns have exceeded my expectations.",
    returns: "+$45,000",
    period: "8 months",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "Entrepreneur",
    location: "Mumbai, India",
    image: "👩‍💻",
    text: "As someone new to investing, Vault made everything incredibly simple. The AI-driven recommendations and professional support team helped me achieve my financial goals faster.",
    returns: "+$28,500",
    period: "6 months",
    rating: 5,
  },
  {
    name: "James Chen",
    role: "Financial Advisor",
    location: "Singapore",
    image: "👨‍🏫",
    text: "I recommend Vault to all my clients. The transparency, security features, and consistent returns make it the best choice in the market. Their customer service is outstanding.",
    returns: "+$156,800",
    period: "12 months",
    rating: 5,
  },
  {
    name: "Emma Johnson",
    role: "Investment Enthusiast",
    location: "London, UK",
    image: "👩‍🔬",
    text: "The diversity of investment options is fantastic. I've built a well-balanced portfolio mixing crypto, traditional assets, and their AI strategies. Returns are consistently beating the market.",
    returns: "+$67,200",
    period: "10 months",
    rating: 5,
  },
  {
    name: "Rajesh Patel",
    role: "Business Owner",
    location: "Dubai, UAE",
    image: "👨‍💼",
    text: "Five stars doesn't do justice to what Vault offers. The platform is secure, user-friendly, and most importantly, it delivers results. My passive income has increased substantially.",
    returns: "+$89,450",
    period: "9 months",
    rating: 5,
  },
  {
    name: "Sofia Rodriguez",
    role: "Student",
    location: "Barcelona, Spain",
    image: "👩‍🎓",
    text: "I started investing with just $500 as a university student. Now I'm earning consistent returns that help fund my education. Vault made wealth building accessible and achievable.",
    returns: "+$8,900",
    period: "7 months",
    rating: 5,
  },
]

const achievements = [
  {
    stat: "$2.4B+",
    label: "Assets Under Management",
  },
  {
    stat: "45,000+",
    label: "Active Investors",
  },
  {
    stat: "99.95%",
    label: "Platform Uptime",
  },
  {
    stat: "18-22%",
    label: "Avg Annual Returns",
  },
]

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      {/* Header */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Success Stories</h1>
          <p className="text-lg text-muted-foreground">
            See how thousands of investors are building wealth with Vault. Read real stories from real people who've
            achieved their financial goals.
          </p>
        </div>

        {/* Achievements */}
        <div className="grid md:grid-cols-4 gap-6 mb-20 max-w-4xl mx-auto">
          {achievements.map((item, index) => (
            <div key={index} className="text-center p-6 rounded-lg bg-secondary/50 border">
              <p className="text-3xl md:text-4xl font-bold text-accent mb-2">{item.stat}</p>
              <p className="text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials Grid */}
      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="border rounded-lg p-8 hover:shadow-lg hover:border-accent transition-all bg-card hover:bg-secondary/20"
              >
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-foreground mb-6 leading-relaxed italic">"{testimonial.text}"</p>

                {/* Results */}
                <div className="bg-accent/10 rounded-lg p-4 mb-6 border-l-4 border-accent">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    <span className="font-semibold text-accent">{testimonial.returns}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">in {testimonial.period}</p>
                </div>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{testimonial.image}</div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Case Study Section */}
      <div className="bg-secondary/30 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Featured Case Study</h2>

            <div className="bg-card border rounded-lg p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">From Beginner to Successful Investor</h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    James started with just $1,000 and basic investment knowledge. Through Vault's educational
                    resources, AI-powered recommendations, and consistent support, he grew his portfolio to over
                    $156,000 in just 12 months.
                  </p>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    "The platform guided me every step of the way. I never felt lost, and the returns spoke for
                    themselves. Now I'm helping friends and family get started on their investment journey."
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Starting Investment</p>
                      <p className="text-2xl font-bold">$1,000</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Current Portfolio</p>
                      <p className="text-2xl font-bold text-accent">$156,800</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Profit Earned</p>
                      <p className="text-2xl font-bold text-accent">$155,800</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time Period</p>
                      <p className="text-2xl font-bold">12 months</p>
                    </div>
                  </div>

                  <Button variant="outline" asChild>
                    <Link href="/about">
                      Read Full Story →
                    </Link>
                  </Button>
                </div>

                <div className="bg-gradient-to-br from-accent/20 to-accent/5 rounded-lg p-8 border border-accent/30">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-accent mb-4">15556%</div>
                    <p className="text-lg font-semibold mb-2">Return on Investment</p>
                    <p className="text-muted-foreground">In 12 months with consistent investments</p>

                    <div className="mt-8 pt-8 border-t border-accent/20">
                      <p className="text-sm text-muted-foreground mb-4">Investment Breakdown</p>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span>Crypto Assets</span>
                          <span className="font-semibold">35%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>AI Strategies</span>
                          <span className="font-semibold">40%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>Growth Plans</span>
                          <span className="font-semibold">25%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Vault */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Why Investors Choose Vault</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-left p-6 rounded-lg bg-secondary/50 border">
              <div className="text-3xl font-bold text-accent mb-2">✓</div>
              <h3 className="text-lg font-semibold mb-2">Proven Track Record</h3>
              <p className="text-muted-foreground">
                Consistent returns backed by years of market experience and AI-driven strategies.
              </p>
            </div>

            <div className="text-left p-6 rounded-lg bg-secondary/50 border">
              <div className="text-3xl font-bold text-accent mb-2">✓</div>
              <h3 className="text-lg font-semibold mb-2">Best-in-Class Security</h3>
              <p className="text-muted-foreground">
                Military-grade encryption and insurance coverage protect your investments 24/7.
              </p>
            </div>

            <div className="text-left p-6 rounded-lg bg-secondary/50 border">
              <div className="text-3xl font-bold text-accent mb-2">✓</div>
              <h3 className="text-lg font-semibold mb-2">Expert Support</h3>
              <p className="text-muted-foreground">
                Dedicated account managers and 24/7 customer support to guide your journey.
              </p>
            </div>

            <div className="text-left p-6 rounded-lg bg-secondary/50 border">
              <div className="text-3xl font-bold text-accent mb-2">✓</div>
              <h3 className="text-lg font-semibold mb-2">Transparent Platform</h3>
              <p className="text-muted-foreground">
                No hidden fees, real-time analytics, and complete visibility into your investments.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-accent to-accent/80 py-16">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Write Your Success Story?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of successful investors who are achieving their financial goals with Vault.
          </p>
          <Button size="lg" variant="secondary" className="text-accent bg-white hover:bg-gray-100" asChild>
            <Link href="/register">Start Investing Today</Link>
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  )
}
