import { ArrowLeft, AlertTriangle, FileText, Lock, CheckCircle2, Gavel } from "lucide-react"
import Link from "next/link"
import Footer from "@/components/layout/footer"

export default function TermsPage() {
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
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <Gavel className="h-6 w-6 text-destructive" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Terms of Service</h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Please read these terms carefully before using Vault Capital's services. By accessing our platform, you agree to be bound by these terms and conditions.
              </p>
              <p className="text-sm text-muted-foreground mt-4">Last updated: March 2026 • Effective Date: April 1, 2026</p>
            </div>

            {/* Quick Overview */}
            <div className="grid md:grid-cols-2 gap-6 mb-16">
              <div className="border rounded-lg p-6 bg-destructive/5">
                <AlertTriangle className="h-6 w-6 text-destructive mb-3" />
                <h3 className="font-bold mb-2">Risk Disclosure</h3>
                <p className="text-sm text-muted-foreground">All investments involve risk. Past performance does not guarantee future results. You may lose part or all of your investment.</p>
              </div>
              <div className="border rounded-lg p-6 bg-primary/5">
                <CheckCircle2 className="h-6 w-6 text-primary mb-3" />
                <h3 className="font-bold mb-2">Account Responsibility</h3>
                <p className="text-sm text-muted-foreground">You are responsible for maintaining account security and password confidentiality. You accept all activities under your account.</p>
              </div>
            </div>

            {/* Main Sections */}
            <div className="space-y-12">
              <section>
                <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                  1. Acceptance of Terms
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  By accessing and using Vault Capital's services, you accept and agree to be bound by these terms and conditions. If you do not agree with any part of these terms, you must not use our services. Vault may modify these terms at any time, and your continued use constitutes acceptance of changes. We will notify you of material changes via email.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
                  <FileText className="h-8 w-8 text-accent" />
                  2. Use License & Restrictions
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  We grant you a limited, non-exclusive, non-transferable license to access our platform for personal, non-commercial investment purposes. You agree not to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
                  <li>Copy, modify, or distribute any content without permission</li>
                  <li>Use automated tools or scripts to access our services</li>
                  <li>Attempt to bypass security measures or access unauthorized areas</li>
                  <li>Engage in any form of fraud, market manipulation, or illegal activity</li>
                  <li>Interfere with platform servers or networks</li>
                </ul>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                  3. Investment Risks & Disclaimers
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  All investments carry risk. Market volatility, economic conditions, and unforeseen events can result in substantial losses. Past performance does not guarantee future results. Vault does not guarantee any specific return or protection of principal. Investment recommendations are provided on a suitability basis, but Vault does not guarantee suitability for your specific situation. You accept all investment risks associated with your decisions.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
                  <Lock className="h-8 w-8 text-primary" />
                  4. Account Security & Responsibility
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  You are solely responsible for maintaining the confidentiality of your account credentials, including username, password, and any transaction verification codes. Vault is not liable for unauthorized access resulting from your failure to protect these credentials. You accept responsibility for all activities conducted under your account, including transactions and communications. You must notify us immediately of any unauthorized account use or suspected security breaches.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
                  <FileText className="h-8 w-8 text-accent" />
                  5. Prohibited Uses
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  You agree not to use Vault's services for any illegal, unethical, or prohibited purpose. This includes money laundering, fraud, market manipulation, insider trading, or violation of sanctions laws. You must comply with all applicable laws in your jurisdiction. Vault reserves the right to terminate accounts and cooperate with authorities regarding suspected illegal activity.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
                  <Gavel className="h-8 w-8 text-destructive" />
                  6. Termination & Suspension
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  Vault may terminate or suspend your account immediately, without prior notice, for any reason whatsoever, including suspected violations of these terms, suspected illegal activity, or business discretion. Upon termination, your right to use the services ceases immediately. You may request withdrawal of remaining funds subject to applicable regulations.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                  7. Limitation of Liability
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  To the fullest extent permitted by law, Vault and its officers, employees, and agents shall not be liable for any indirect, incidental, special, or consequential damages arising from:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4 mb-4">
                  <li>Use of or inability to use our services</li>
                  <li>Investment performance or losses</li>
                  <li>Unauthorized account access or data breaches</li>
                  <li>System interruptions or delays</li>
                  <li>Third-party actions or market conditions</li>
                </ul>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Our total liability for any claim shall not exceed the amounts you have deposited with Vault.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4">8. Indemnification</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  You agree to indemnify, defend, and hold harmless Vault Capital, its affiliates, and their respective officers, employees, and agents from any claims, damages, or costs (including legal fees) arising from your use of the services, violation of these terms, or violation of any applicable law.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4">9. Dispute Resolution</h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  Any disputes shall be resolved through binding arbitration conducted by JAMS or AAA. Arbitration proceedings occur in the jurisdiction of Vault's principal office. By agreeing to arbitration, you waive your right to jury trial and class action litigation.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4">10. Entire Agreement</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  These terms, together with our Privacy Policy and any other policies posted on our platform, constitute the entire agreement between you and Vault Capital regarding your use of our services. These terms supersede all prior or contemporaneous agreements and understandings.
                </p>
              </section>
            </div>

            {/* Contact Section */}
            <div className="border-t pt-12 mt-16">
              <h2 className="text-3xl font-bold mb-6">Questions About These Terms?</h2>
              <div className="bg-card rounded-lg border p-8">
                <p className="text-lg text-muted-foreground mb-4">
                  If you have questions or concerns about these terms and conditions:
                </p>
                <p className="font-semibold mb-2">Legal Department</p>
                <p className="text-muted-foreground">legal@vaultcapital.bond</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}