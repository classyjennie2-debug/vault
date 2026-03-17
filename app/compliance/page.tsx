import { ArrowLeft, ShieldCheck, FileText, CheckCircle2, Lock } from "lucide-react"
import Link from "next/link"
import Footer from "@/components/layout/footer"

export default function CompliancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 flex flex-col">
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <div className="mb-8">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-16">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <ShieldCheck className="h-6 w-6 text-accent" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Regulatory Compliance</h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Vault Capital is committed to the highest standards of regulatory compliance, transparency, and investor protection.
              </p>
            </div>

            {/* Compliance Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {/* Regulatory Framework */}
              <div className="border rounded-lg p-8 hover:border-accent/50 transition-colors bg-card/50">
                <div className="flex items-start gap-4 mb-4">
                  <ShieldCheck className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Regulatory Framework</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Vault operates in full compliance with all applicable securities laws and regulations. We maintain licenses and registrations with relevant financial authorities, including the SEC and state-level financial regulators. Our compliance team continuously monitors regulatory changes to ensure our operations remain aligned with evolving requirements.
                    </p>
                  </div>
                </div>
              </div>

              {/* AML/KYC Compliance */}
              <div className="border rounded-lg p-8 hover:border-accent/50 transition-colors bg-card/50">
                <div className="flex items-start gap-4 mb-4">
                  <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-bold mb-2">AML/KYC Compliance</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We implement comprehensive Anti-Money Laundering (AML) and Know Your Customer (KYC) procedures to detect and prevent financial crimes. All customers are subject to identity verification, source of funds verification, and ongoing customer due diligence. We maintain detailed transaction records and file Suspicious Activity Reports as required by law.
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Protection */}
              <div className="border rounded-lg p-8 hover:border-accent/50 transition-colors bg-card/50">
                <div className="flex items-start gap-4 mb-4">
                  <Lock className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Data Protection</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We adhere to stringent data protection regulations including GDPR, CCPA, and other applicable privacy laws. Your personal and financial information is protected by military-grade encryption, multi-factor authentication, and strict access controls. We never share your data without explicit consent, except as required by law.
                    </p>
                  </div>
                </div>
              </div>

              {/* Risk Management */}
              <div className="border rounded-lg p-8 hover:border-accent/50 transition-colors bg-card/50">
                <div className="flex items-start gap-4 mb-4">
                  <FileText className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Risk Management</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Our comprehensive risk management framework identifies, assesses, and mitigates investment and operational risks. We maintain capital reserves exceeding regulatory minimums, conduct regular stress testing, and implement controls to protect against fraud, system failures, and market disruptions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Sections */}
            <div className="space-y-12 mb-16">
              <div>
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                  <CheckCircle2 className="h-8 w-8 text-success" />
                  Reporting & Transparency
                </h2>
                <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                  Vault maintains detailed records of all transactions and client activities. We provide regular reporting to regulatory authorities as required by applicable laws and regulations. Client statements are provided quarterly and include detailed performance data, fees, and transaction history. We maintain memorialized supervisory review files and ensure all documentation meets regulatory standards.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                  <Lock className="h-8 w-8 text-primary" />
                  Investor Protection
                </h2>
                <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                  Client assets are held in segregated accounts with qualified custodians and are not commingled with Vault's corporate funds. We maintain errors and omissions insurance and fidelity bonds to protect against operational risks. Our investment recommendations are based on suitability analysis considering each client's financial situation, investment objectives, and risk tolerance.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                  <FileText className="h-8 w-8 text-accent" />
                  Audit & Compliance Monitoring
                </h2>
                <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                  Vault engages independent auditors to conduct annual financial audits and compliance examinations. Our compliance department conducts ongoing reviews and training programs to ensure all employees understand and follow regulatory requirements. We promptly investigate potential violations and implement corrective actions as needed.
                </p>
              </div>
            </div>

            {/* Regulatory Bodies */}
            <div className="border-t border-b py-12 my-12">
              <h2 className="text-3xl font-bold mb-8">Regulatory Oversight</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 bg-card rounded-lg border">
                  <h3 className="font-semibold mb-2">Financial Industry Regulatory Authority</h3>
                  <p className="text-sm text-muted-foreground">Self-regulatory organization overseeing securities firms</p>
                </div>
                <div className="p-6 bg-card rounded-lg border">
                  <h3 className="font-semibold mb-2">Securities and Exchange Commission</h3>
                  <p className="text-sm text-muted-foreground">Federal agency regulating securities markets and exchanges</p>
                </div>
                <div className="p-6 bg-card rounded-lg border">
                  <h3 className="font-semibold mb-2">FinCEN & Banking Regulators</h3>
                  <p className="text-sm text-muted-foreground">Anti-money laundering enforcement and oversight</p>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">For compliance inquiries, please contact:</p>
              <p className="font-semibold">Compliance Department</p>
              <p className="text-muted-foreground">compliance@vaultcapital.bond</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}