"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertCircle,
  Mail,
  Moon,
  Lock,
  BarChart3,
  FileText,
  Activity,
  Key,
  Shield,
  ChevronRight,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FeatureGuide {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  category: "security" | "analytics" | "notifications" | "ui"
  steps: Array<{
    number: number
    title: string
    description: string
  }>
  benefits: string[]
  learnMoreUrl?: string
}

const features: FeatureGuide[] = [
  {
    id: "email-alerts",
    title: "Email Alerts & Notifications",
    description: "Receive instant email notifications for important account activities",
    icon: <Mail className="h-6 w-6" />,
    category: "notifications",
    steps: [
      {
        number: 1,
        title: "Enable Notifications",
        description:
          "Go to Settings > Notifications and toggle Email Alerts on",
      },
      {
        number: 2,
        title: "Choose Alert Types",
        description:
          "Select which events you want to be notified about (signin, deposits, withdrawals)",
      },
      {
        number: 3,
        title: "Verify Your Email",
        description:
          "Confirm your email address to start receiving notifications",
      },
    ],
    benefits: [
      "Stay informed about account activity",
      "Detect unauthorized access immediately",
      "Receive deposit/withdrawal confirmations",
      "Never miss important updates",
    ],
  },
  {
    id: "dark-mode",
    title: "Dark Mode",
    description: "Reduce eye strain with a dark theme optimized for night use",
    icon: <Moon className="h-6 w-6" />,
    category: "ui",
    steps: [
      {
        number: 1,
        title: "Toggle Dark Mode",
        description: "Click the moon/sun icon in the top navigation bar",
      },
      {
        number: 2,
        title: "Auto-Saved Preference",
        description:
          "Your preference is automatically saved and applied on future visits",
      },
      {
        number: 3,
        title: "System Preference Support",
        description:
          "Dark Mode respects your system-wide dark/light preferences",
      },
    ],
    benefits: [
      "Reduced eye strain in low-light environments",
      "Extended battery life on OLED screens",
      "Modern, professional appearance",
      "Improved readability at night",
    ],
  },
  {
    id: "password-strength",
    title: "Password Strength Meter",
    description: "Ensure your password is secure during registration",
    icon: <Key className="h-6 w-6" />,
    category: "security",
    steps: [
      {
        number: 1,
        title: "Create Account",
        description: "Start the registration process by entering your details",
      },
      {
        number: 2,
        title: "Set Strong Password",
        description:
          "Enter a password and watch the strength meter provide real-time feedback",
      },
      {
        number: 3,
        title: "Meet Requirements",
        description:
          "Ensure your password meets all displayed requirements (length, characters, etc.)",
      },
    ],
    benefits: [
      "Visual feedback on password security",
      "Clear requirements checklist",
      "Prevents weak passwords",
      "Protects your account from breaches",
    ],
  },
  {
    id: "two-factor-auth",
    title: "Two-Factor Authentication (2FA)",
    description: "Add an extra layer of security to your account",
    icon: <Shield className="h-6 w-6" />,
    category: "security",
    steps: [
      {
        number: 1,
        title: "Navigate to Security Settings",
        description: "Go to Settings > Security > Enable Two-Factor Authentication",
      },
      {
        number: 2,
        title: "Scan QR Code",
        description:
          "Use an authenticator app (Google Authenticator, Authy) to scan the QR code",
      },
      {
        number: 3,
        title: "Verify Code & Save Backup Codes",
        description:
          "Enter the 6-digit code from your app and securely save the backup codes",
      },
    ],
    benefits: [
      "Prevent unauthorized account access",
      "Use backup codes if you lose your device",
      "Industry-standard security practice",
      "Peace of mind for valuable accounts",
    ],
  },
  {
    id: "portfolio-dashboard",
    title: "Portfolio Dashboard",
    description: "View all your investments in one comprehensive dashboard",
    icon: <BarChart3 className="h-6 w-6" />,
    category: "analytics",
    steps: [
      {
        number: 1,
        title: "Access Portfolio",
        description: "Navigate to Dashboard > Portfolio to view your entire portfolio",
      },
      {
        number: 2,
        title: "View Performance",
        description:
          "See interactive charts showing your balance, returns, and allocations",
      },
      {
        number: 3,
        title: "Analyze Data",
        description:
          "Review monthly performance metrics and year-to-date returns",
      },
    ],
    benefits: [
      "Complete portfolio overview",
      "Visual performance tracking",
      "Allocation breakdown by investment type",
      "Data-driven investment decisions",
    ],
  },
  {
    id: "activity-logs",
    title: "Activity Logs",
    description: "Track all account activities and access history",
    icon: <Activity className="h-6 w-6" />,
    category: "security",
    steps: [
      {
        number: 1,
        title: "View Recent Activities",
        description: "Go to Settings > Activity to see recent account activities",
      },
      {
        number: 2,
        title: "Review Details",
        description:
          "Check login times, device information, location, and action types",
      },
      {
        number: 3,
        title: "Monitor Security",
        description: "Report any suspicious activities immediately",
      },
    ],
    benefits: [
      "Detect unauthorized access attempts",
      "View device and location information",
      "Maintain security compliance",
      "Track important account changes",
    ],
  },
  {
    id: "account-recovery",
    title: "Account Recovery",
    description: "Recover your account if you lose access",
    icon: <AlertCircle className="h-6 w-6" />,
    category: "security",
    steps: [
      {
        number: 1,
        title: "Visit Recovery Page",
        description: "Go to /recovery and enter your registered email",
      },
      {
        number: 2,
        title: "Verify Identity",
        description: "Confirm the verification code sent to your email",
      },
      {
        number: 3,
        title: "Use Backup Code & Reset Password",
        description:
          "Enter a backup code and create a new secure password for your account",
      },
    ],
    benefits: [
      "Regain access to your account",
      "Secure recovery process with verification",
      "Backup codes ensure recovery capability",
      "Quick and easy account restoration",
    ],
  },
  {
    id: "payment-receipts",
    title: "Payment Receipts & Invoices",
    description: "Generate and download receipts for all your transactions",
    icon: <FileText className="h-6 w-6" />,
    category: "notifications",
    steps: [
      {
        number: 1,
        title: "Navigate to Transactions",
        description:
          "Go to Dashboard > Transactions to view all your transaction history",
      },
      {
        number: 2,
        title: "Select Transaction",
        description: "Click on a transaction to view detailed information",
      },
      {
        number: 3,
        title: "Download Receipt",
        description:
          "Click 'Download as PDF' to save a receipt for your records",
      },
    ],
    benefits: [
      "Professional receipts for tax purposes",
      "Transaction documentation",
      "Easy record-keeping",
      "Fee breakdown included",
    ],
  },
]

export function FeatureGuideComponent() {
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const filteredFeatures =
    selectedCategory === "all"
      ? features
      : features.filter((f) => f.category === selectedCategory)

  const categories = [
    { id: "all", label: "All Features" },
    { id: "security", label: "Security" },
    { id: "notifications", label: "Notifications" },
    { id: "analytics", label: "Analytics" },
    { id: "ui", label: "User Experience" },
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Feature Guide</h1>
        <p className="text-muted-foreground">
          Learn about all the new features and how to use them to get the most
          out of Vault Capital
        </p>
      </div>

      {/* Category Filters */}
      <Tabs
        defaultValue="all"
        onValueChange={setSelectedCategory}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-5">
          {categories.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id} className="text-xs">
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Features Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredFeatures.map((feature) => (
          <Card
            key={feature.id}
            className="cursor-pointer transition-all hover:shadow-lg"
            onClick={() =>
              setExpandedFeature(
                expandedFeature === feature.id ? null : feature.id
              )
            }
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="text-primary mt-1">{feature.icon}</div>
                  <div className="space-y-1">
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className={`h-5 w-5 text-muted-foreground transition-transform ${
                    expandedFeature === feature.id ? "rotate-90" : ""
                  }`}
                />
              </div>
            </CardHeader>

            {expandedFeature === feature.id && (
              <CardContent className="space-y-4 border-t pt-4">
                {/* Steps */}
                <div>
                  <h3 className="font-semibold mb-3 text-sm">How to Use</h3>
                  <div className="space-y-3">
                    {feature.steps.map((step) => (
                      <div key={step.number} className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-sm font-semibold">
                            {step.number}
                          </div>
                        </div>
                        <div className="flex-1 pt-1">
                          <p className="font-medium text-sm">{step.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Benefits */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2 text-sm">Benefits</h3>
                  <ul className="space-y-1">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex gap-2">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {feature.learnMoreUrl && (
                  <Button variant="outline" className="w-full text-xs">
                    Learn More
                  </Button>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Getting Started Quick Links */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Start by enabling Two-Factor Authentication and Email Alerts
                for enhanced security and notifications.
              </AlertDescription>
            </Alert>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button variant="outline" size="sm" className="justify-start">
                Enable 2FA
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                Set Up Email Alerts
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                View Portfolio
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                Check Activity Log
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Exportable component for dashboard integration
export function QuickFeatureGuide() {
  const newFeatures = [
    { icon: Mail, title: "Email Alerts", description: "Get notified of important account activities" },
    { icon: Moon, title: "Dark Mode", description: "Easy on the eyes, easy on the battery" },
    { icon: Shield, title: "2FA Security", description: "Protect your account with two-factor auth" },
    { icon: BarChart3, title: "Portfolio Charts", description: "Visual performance tracking" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">New Features</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {newFeatures.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
              >
                <Icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
