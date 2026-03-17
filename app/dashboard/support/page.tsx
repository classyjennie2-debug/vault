"use client"

import React from "react"
import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  MessageSquare,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  BookOpen,
  Zap,
} from "lucide-react"

const faqs = [
  {
    id: 1,
    question: "How do I deposit funds?",
    answer:
      "Navigate to the Deposit section in your dashboard. Select your preferred payment method, enter the amount, and follow the secure payment process. Deposits typically process within 24-48 hours.",
    category: "Deposits",
  },
  {
    id: 2,
    question: "What are the minimum and maximum investment amounts?",
    answer:
      "Each investment plan has different minimum and maximum amounts. You can view these limits on the Investment Plans page. Minimums range from $1,000 to $25,000 depending on the plan.",
    category: "Investments",
  },
  {
    id: 3,
    question: "How can I withdraw my funds?",
    answer:
      "Go to the Withdraw section and select your withdrawal method. Standard bank transfers take 3-5 business days. Express withdrawals are available for a small fee with 24-hour processing.",
    category: "Withdrawals",
  },
  {
    id: 4,
    question: "When do I receive investment returns?",
    answer:
      "Returns are calculated based on your investment plan duration. Most plans distribute returns monthly. You can view your estimated profits and maturity dates in your Active Investments section.",
    category: "Investments",
  },
  {
    id: 5,
    question: "Is my account secure?",
    answer:
      "Yes. We use 256-bit SSL encryption, two-factor authentication, and comply with international security standards. Your funds are held in segregated accounts with leading financial institutions.",
    category: "Security",
  },
  {
    id: 6,
    question: "How do I enable two-factor authentication?",
    answer:
      "Go to Settings > Security and enable 2FA. You can choose between authenticator apps or SMS. We recommend using an authenticator app for enhanced security.",
    category: "Security",
  },
]

const categories = ["All", "Deposits", "Withdrawals", "Investments", "Security"]

export default function SupportPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const filteredFaqs =
    selectedCategory === "All"
      ? faqs
      : faqs.filter((faq) => faq.category === selectedCategory)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, subject, message }),
    })
    if (res.ok) {
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        setEmail("")
        setSubject("")
        setMessage("")
      }, 3000)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Support Center
        </h1>
        <p className="text-muted-foreground mt-2">
          Find answers to your questions or contact our support team
        </p>
      </div>

      {/* Contact Options */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-base">Email Support</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p className="mb-2">support@vaultcapital.bond</p>
            <p className="text-xs">Response time: 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-base">Live Chat</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p className="mb-2">Chat with our team</p>
            <p className="text-xs">Mon-Fri 9AM-6PM EST</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Phone className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-base">Phone Support</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p className="mb-2">+1 (800) 123-4567</p>
            <p className="text-xs">Mon-Fri 9AM-6PM EST</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* FAQ Section */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>
                Browse answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* FAQ Items */}
              <div className="space-y-4">
                {filteredFaqs.map((faq) => (
                  <details
                    key={faq.id}
                    className="group border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                  >
                    <summary className="flex items-center justify-between cursor-pointer font-medium">
                      <span className="text-card-foreground">
                        {faq.question}
                      </span>
                      <Zap className="h-4 w-4 text-muted-foreground group-open:text-accent transition-transform" />
                    </summary>
                    <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="lg:h-fit">
          <CardHeader>
            <CardTitle className="text-base">Contact Us</CardTitle>
            <CardDescription>
              Send us a message and we'll respond soon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="How can we help?"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="mt-1 min-h-24 resize-none"
                />
              </div>

              <Button type="submit" className="w-full">
                Send Message
              </Button>

              {submitted && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 p-3 bg-green-500/10 rounded-lg">
                  <CheckCircle className="h-4 w-4" />
                  Message sent successfully!
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Status Banner */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary dark:text-primary" />
            <div>
              <CardTitle className="text-base">Average Response Time</CardTitle>
              <CardDescription>Our team responds within 24 hours</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}
