"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FAQItem {
  question: string
  answer: string
  category: "account" | "investing" | "security" | "payments" | "support"
}

const faqs: FAQItem[] = [
  // Account
  {
    category: "account",
    question: "How do I create an account?",
    answer: "Simply click 'Sign Up' on the landing page, provide your email address, create a secure password, and verify your email. You'll be set up in minutes and ready to start investing.",
  },
  {
    category: "account",
    question: "What information do I need to provide?",
    answer: "To comply with regulations, we require basic personal information including your name, email, phone number, and identity verification. This typically takes 5-10 minutes and is a one-time process.",
  },
  {
    category: "account",
    question: "Can I modify my account settings?",
    answer: "Yes! You can update your profile, change your password, enable/disable 2FA, and manage notification preferences from the Settings section in your dashboard.",
  },
  {
    category: "account",
    question: "What if I forget my password?",
    answer: "Click 'Forgot Password' on the login page. We'll send you a secure password reset link via email. Follow the instructions to create a new password.",
  },

  // Investing
  {
    category: "investing",
    question: "What's the minimum investment amount?",
    answer: "Minimum investment amounts vary by plan. Our Conservative Bond Fund requires $100, while our Growth Portfolio requires $500. Check each plan for specific minimums.",
  },
  {
    category: "investing",
    question: "How does automated portfolio rebalancing work?",
    answer: "Our AI system monitors market conditions 24/7 and automatically rebalances your portfolio to maintain your chosen risk profile. This happens without additional fees and ensures optimal performance.",
  },
  {
    category: "investing",
    question: "Can I withdraw my money anytime?",
    answer: "Yes! You can request a withdrawal anytime through your dashboard. Most withdrawals are processed within 2-3 business days. Certain investment plans may have lock-up periods mentioned in their terms.",
  },
  {
    category: "investing",
    question: "What returns can I expect?",
    answer: "Returns vary by investment plan and market conditions. Our historical data shows an average annual return of 12.8%, but past performance doesn't guarantee future results. Review individual plan details for specific return information.",
  },
  {
    category: "investing",
    question: "How is my portfolio managed?",
    answer: "Your portfolio is managed using AI-powered algorithms that analyze market trends, optimize asset allocation, and execute trades automatically according to your chosen strategy.",
  },

  // Security
  {
    category: "security",
    question: "How is my money protected?",
    answer: "Your assets are protected through bank-level encryption, cold storage wallets for cryptocurrencies, diversified fund management, and comprehensive insurance coverage against fraud.",
  },
  {
    category: "security",
    question: "What security features does Vault offer?",
    answer: "We provide 2-factor authentication, biometric login options, encrypted connections (TLS), regular security audits, and real-time fraud detection system.",
  },
  {
    category: "security",
    question: "Is my data secure on Vault?",
    answer: "Absolutely. We use military-grade encryption for all sensitive data, comply with GDPR and other privacy regulations, and never sell your personal information to third parties.",
  },
  {
    category: "security",
    question: "What should I do if my account is compromised?",
    answer: "Change your password immediately and contact our support team. If you authorized suspicious transactions, we can help investigate and restore your account.",
  },

  // Payments
  {
    category: "payments",
    question: "What payment methods do you accept?",
    answer: "We accept bank transfers, credit/debit cards, digital wallets, and cryptocurrency deposits. Each method has specific fees and processing times.",
  },
  {
    category: "payments",
    question: "Are there fees for deposits and withdrawals?",
    answer: "Deposits are typically free, while withdrawals may have minimal processing fees depending on your chosen method. Cryptocurrency transfers have network-based fees. Check our fees page for complete details.",
  },
  {
    category: "payments",
    question: "How long does it take to withdraw funds?",
    answer: "Standard bank transfers typically take 2-3 business days. Cryptocurrency withdrawals are usually processed within 24 hours. Urgent withdrawals can be prioritized for an additional fee.",
  },
  {
    category: "payments",
    question: "What's your fee structure?",
    answer: "Vault charges competitive management fees ranging from 0.5% to 2% annually depending on your investment plan, plus transaction fees. Full details are available on our pricing page.",
  },

  // Support
  {
    category: "support",
    question: "How can I contact support?",
    answer: "You can reach our support team 24/7 via email (support@vaultinvest.com), live chat on our website, or phone (+1 800-123-4567). Response time is typically under 2 hours.",
  },
  {
    category: "support",
    question: "Do you offer investment advice?",
    answer: "Yes! Our team of certified financial advisors is available to discuss your investment goals and recommend suitable strategies. Schedule a consultation through your dashboard.",
  },
  {
    category: "support",
    question: "Are there educational resources available?",
    answer: "We offer comprehensive educational materials including webinars, tutorials, market analysis, and investment guides. Access them through the Help Center in your dashboard.",
  },
  {
    category: "support",
    question: "What are your business hours?",
    answer: "Our support team works Monday-Friday 9AM-6PM EST, Saturday 10AM-4PM EST. Emergency support is available 24/7 for account security issues.",
  },
]

const categories = [
  { id: "account", label: "Account" },
  { id: "investing", label: "Investing" },
  { id: "security", label: "Security" },
  { id: "payments", label: "Payments" },
  { id: "support", label: "Support" },
]

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("account")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = faqs.filter(faq => faq.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-lg text-muted-foreground">
              Find answers to common questions about Vault. Can't find what you're looking for?{" "}
              <a href="/contact" className="text-accent hover:underline">
                Contact our support team
              </a>
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map(cat => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat.id)}
                className="rounded-full"
              >
                {cat.label}
              </Button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {filtered.map((faq, index) => (
              <div
                key={index}
                className="border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                <button
                  onClick={() => setExpandedId(expandedId === `${index}` ? null : `${index}`)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-card hover:bg-accent/5 transition-colors"
                >
                  <span className="font-semibold text-left">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
                      expandedId === `${index}` ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {expandedId === `${index}` && (
                  <div className="px-6 py-4 bg-muted/30 border-t">
                    <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-16 p-8 bg-accent/10 rounded-lg text-center">
            <h3 className="text-2xl font-semibold mb-3">Still have questions?</h3>
            <p className="text-muted-foreground mb-6">
              Our support team is always ready to help you get the most out of Vault.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="default" asChild>
                <a href="/contact">Contact Support</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/dashboard/support">View Help Center</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
