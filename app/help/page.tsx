import Link from "next/link"
import { BookOpen, Users, Zap, Mail, MessageCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Footer from "@/components/layout/footer"

const resources = [
  {
    icon: BookOpen,
    title: "Getting Started Guide",
    description: "Learn the basics of creating an account and making your first investment.",
    link: "/help/getting-started",
  },
  {
    icon: Users,
    title: "Community Forum",
    description: "Connect with other investors and share strategies and tips.",
    link: "/help/community",
  },
  {
    icon: Zap,
    title: "Advanced Strategies",
    description: "In-depth guides for experienced investors looking to maximize returns.",
    link: "/help/strategies",
  },
  {
    icon: Mail,
    title: "API Documentation",
    description: "Technical reference for developers integrating with Vault API.",
    link: "/help/api",
  },
  {
    icon: MessageCircle,
    title: "Live Chat Support",
    description: "Chat with our support team in real-time for immediate assistance.",
    link: "#",
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "Get detailed help via email with response time under 15 minutes.",
    link: "mailto:support@vaultcapital.bond",
  },
]

const categories = [
  {
    title: "Account Management",
    items: [
      "Creating and verifying your account",
      "Managing profile information",
      "Setting up two-factor authentication",
      "Password and security settings",
      "Account recovery options",
    ],
  },
  {
    title: "Investing",
    items: [
      "Understanding investment plans",
      "Making your first investment",
      "Portfolio rebalancing",
      "Risk management strategies",
      "Monitoring performance",
    ],
  },
  {
    title: "Deposits & Withdrawals",
    items: [
      "Funding your account",
      "Deposit methods and fees",
      "Withdrawal processing times",
      "Transaction history",
      "Transfer limits",
    ],
  },
  {
    title: "Technical Support",
    items: [
      "Troubleshooting login issues",
      "Mobile app support",
      "Browser compatibility",
      "Performance optimization",
      "Reporting bugs",
    ],
  },
]

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Help & Documentation</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers, learn how to use Vault, and get support from our team.
            </p>
          </div>

          {/* Quick Resources */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold mb-10">Quick Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource, index) => {
                const Icon = resource.icon
                return (
                  <Link key={index} href={resource.link}>
                    <div className="h-full p-6 border rounded-lg hover:shadow-lg hover:border-accent transition-all cursor-pointer">
                      <Icon className="w-8 h-8 text-accent mb-4" />
                      <h3 className="font-semibold mb-2">{resource.title}</h3>
                      <p className="text-muted-foreground text-sm">{resource.description}</p>
                      <div className="mt-4 text-accent text-sm font-medium">Learn more →</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Documentation Categories */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold mb-10">Documentation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {categories.map((category, index) => (
                <div key={index} className="p-6 border rounded-lg">
                  <h3 className="font-semibold text-lg mb-4">{category.title}</h3>
                  <ul className="space-y-3">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-muted-foreground text-sm flex items-start gap-3">
                        <span className="text-accent font-bold flex-shrink-0">→</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Search Documentation */}
          <div className="mb-20 bg-accent/5 p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-center">Search Documentation</h2>
            <p className="text-muted-foreground text-center mb-6">
              Can't find what you're looking for? Use our search to browse all articles and guides.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button asChild>
                <a href="/contact">Contact Support</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/faq">Browse FAQ</a>
              </Button>
            </div>
          </div>

          {/* Popular Topics */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold mb-8">Popular Topics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-card rounded border hover:border-accent transition-colors cursor-pointer">
                <h3 className="font-semibold mb-2">How do I deposit money?</h3>
                <p className="text-muted-foreground text-sm">Learn about all available deposit methods and processing times.</p>
              </div>
              <div className="p-4 bg-card rounded border hover:border-accent transition-colors cursor-pointer">
                <h3 className="font-semibold mb-2">How are returns calculated?</h3>
                <p className="text-muted-foreground text-sm">Understand how annual returns are computed and displayed.</p>
              </div>
              <div className="p-4 bg-card rounded border hover:border-accent transition-colors cursor-pointer">
                <h3 className="font-semibold mb-2">Is my money safe?</h3>
                <p className="text-muted-foreground text-sm">Learn about our security measures and asset protection.</p>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="text-center p-8 bg-gradient-to-r from-accent/10 to-accent/5 rounded-lg">
            <h3 className="text-2xl font-bold mb-3">Still Need Help?</h3>
            <p className="text-muted-foreground mb-6">
              Our support team is available 24/7 to assist you with any questions or issues.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button asChild>
                <a href="/contact">Email Support</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="tel:+18001234567">Call Us</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="#chat">Live Chat</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
