import type { Metadata, Viewport } from "next"
import React from "react"
import { Analytics } from "@vercel/analytics/next"
import TawkChat from "@/components/tawk-chat"
import "./globals.css"

// Note: Google Fonts imports removed to prevent build errors during network issues
// Fallback fonts defined in globals.css

export const metadata: Metadata = {
  title: "Vault Capital - Institutional Investment Management",
  description:
    "Secure. Transparent. Profitable. Access institutional-grade investment portfolios with advanced analytics and AI-powered strategies.",
  keywords: ["investment", "wealth management", "portfolio", "financial planning", "retirement", "stocks", "bonds", "crypto"],
  authors: [{ name: "Vault Capital" }],
  creator: "Vault Capital",
  publisher: "Vault Capital",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://vaultcapital.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Vault Capital - Institutional Investment Management",
    description: "Secure. Transparent. Profitable. Access institutional-grade investment portfolios.",
    url: "https://vaultcapital.com",
    siteName: "Vault Capital",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vault Capital - Institutional Investment Management",
    description: "Secure. Transparent. Profitable. Access institutional-grade investment portfolios.",
    creator: "@vaultcapital",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#1a1a18",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
        <TawkChat />
      </body>
    </html>
  )
}
