"use client"

import { Shield, Lock, Award, CheckCircle, Globe } from "lucide-react"

export function TrustBadges() {
  return (
    <div className="flex flex-wrap items-center gap-3 py-4">
      {/* SSL Certificate */}
      <div className="flex items-center gap-2 bg-green-500/10 text-green-700 px-3 py-1.5 rounded-full border border-green-500/20">
        <Lock className="h-4 w-4" />
        <span className="text-sm font-medium">SSL Secured</span>
      </div>

      {/* Licensed & Regulated */}
      <div className="flex items-center gap-2 bg-blue-500/10 text-blue-700 px-3 py-1.5 rounded-full border border-blue-500/20">
        <Shield className="h-4 w-4" />
        <span className="text-sm font-medium">Licensed & Regulated</span>
      </div>

      {/* FDIC Insured */}
      <div className="flex items-center gap-2 bg-purple-500/10 text-purple-700 px-3 py-1.5 rounded-full border border-purple-500/20">
        <Award className="h-4 w-4" />
        <span className="text-sm font-medium">FDIC Insured</span>
      </div>

      {/* SOC 2 Compliant */}
      <div className="flex items-center gap-2 bg-orange-500/10 text-orange-700 px-3 py-1.5 rounded-full border border-orange-500/20">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm font-medium">SOC 2 Compliant</span>
      </div>

      {/* Global Reach */}
      <div className="flex items-center gap-2 bg-teal-500/10 text-teal-700 px-3 py-1.5 rounded-full border border-teal-500/20">
        <Globe className="h-4 w-4" />
        <span className="text-sm font-medium">Global Reach</span>
      </div>
    </div>
  )
}

export function ComplianceFooter() {
  return (
    <div className="mt-8 p-4 bg-muted/30 rounded-lg border border-border/50">
      <div className="text-xs text-muted-foreground space-y-2">
        <p className="font-medium text-foreground">Regulatory Compliance</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <p>• SEC Registered Investment Advisor (RIA)</p>
          <p>• FINRA Member Firm</p>
          <p>• FDIC Insurance up to $250,000</p>
          <p>• SOC 2 Type II Certified</p>
        </div>
        <p className="text-xs mt-3 pt-2 border-t border-border/50">
          <strong>Risk Disclosure:</strong> Investing involves risk of loss. Past performance does not guarantee future results.
          Please read our <a href="/terms" className="text-accent hover:underline">Terms of Service</a> and
          <a href="/privacy" className="text-accent hover:underline ml-1">Privacy Policy</a>.
        </p>
      </div>
    </div>
  )
}