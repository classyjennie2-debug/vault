import { ArrowLeft, Shield, Lock, Eye, Trash2, Bell } from "lucide-react"
import Link from "next/link"
import Footer from "@/components/layout/footer"

export default function PrivacyPage() {
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
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Privacy Policy</h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Your privacy is our top priority. We're committed to protecting your personal information with transparent practices and industry-leading security measures.
              </p>
              <p className="text-sm text-muted-foreground mt-4">Last updated: March 2026</p>
            </div>

            {/* Privacy Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {/* Information We Collect */}
              <div className="border rounded-lg p-8 hover:border-primary/50 transition-colors bg-card/50">
                <div className="flex items-start gap-4 mb-4">
                  <Eye className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Information We Collect</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We collect information you willingly provide when creating an account, making transactions, or contacting support. This includes your name, email address, phone number, financial information, and investment preferences. We also collect automated information about your device and how you interact with our platform.
                    </p>
                  </div>
                </div>
              </div>

              {/* How We Use Your Information */}
              <div className="border rounded-lg p-8 hover:border-primary/50 transition-colors bg-card/50">
                <div className="flex items-start gap-4 mb-4">
                  <Bell className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-bold mb-2">How We Use Your Information</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We use your information to provide and improve our services, process transactions, send important communications, detect fraud, and comply with legal obligations. We never sell your information for marketing purposes. You can manage your communication preferences in your account settings.
                    </p>
                  </div>
                </div>
              </div>

              {/* Information Sharing */}
              <div className="border rounded-lg p-8 hover:border-primary/50 transition-colors bg-card/50">
                <div className="flex items-start gap-4 mb-4">
                  <Lock className="h-6 w-6 text-success flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Information Sharing</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We do not sell, trade, or transfer your personal information to third parties without your explicit consent, except as required by law. We may share information with trusted service providers, custodians, and regulatory authorities. All third parties maintain strict confidentiality obligations.
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Security */}
              <div className="border rounded-lg p-8 hover:border-primary/50 transition-colors bg-card/50">
                <div className="flex items-start gap-4 mb-4">
                  <Lock className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Data Security</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We protect your information using encryption, secure servers, and multi-factor authentication. However, no data transmission is 100% secure. We encourage you to use strong passwords, enable 2FA, and never share your login credentials. Report any security concerns immediately to security@vaultcapital.bond.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Sections */}
            <div className="space-y-12 mb-16">
              <div>
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                  <Eye className="h-8 w-8 text-primary" />
                  Your Rights & Choices
                </h2>
                <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                  You have the right to access, update, and delete your personal information. You may request that we limit how we use your data or provide your information in a portable format. Residents of certain regions (including California and Europe) have additional rights under GDPR and CCPA. To exercise your rights, contact privacy@vaultcapital.bond with detailed information about your request.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                  <Bell className="h-8 w-8 text-accent" />
                  Cookies & Similar Technologies
                </h2>
                <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                  We use cookies and similar tracking technologies to enhance your experience, remember your preferences, and analyze platform usage. These help us understand how you use our services and improve functionality. You can control cookie settings through your browser preferences. Note that disabling cookies may impact some features. We do not use cookies for third-party advertising.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                  <Trash2 className="h-8 w-8 text-destructive" />
                  Data Retention
                </h2>
                <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                  We retain your personal information for as long as necessary to provide services and comply with legal obligations. Investment records are maintained for regulatory periods (typically 6-7 years). Deleted account data may be retained in anonymized form for analytics purposes. You can request complete data deletion subject to legal retention requirements.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                  <Shield className="h-8 w-8 text-primary" />
                  Children's Privacy
                </h2>
                <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                  Vault's services are intended for individuals 18 years of age and older. We do not knowingly collect personal information from children under 13. If we become aware that a child has provided us with personal information, we will take steps to delete such information and terminate the child's account.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-6">Changes to This Policy</h2>
                <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                  We may update this privacy policy periodically to reflect changes in our practices or applicable laws. We will notify you of material changes by posting the updated policy on this page and updating the "Last updated" date. Your continued use of our services constitutes acceptance of the updated policy.
                </p>
              </div>
            </div>

            {/* Contact Section */}
            <div className="border-t pt-12">
              <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
              <p className="text-lg text-muted-foreground mb-4">
                If you have questions about this privacy policy or how we handle your information:
              </p>
              <div className="bg-card rounded-lg border p-8">
                <p className="font-semibold mb-4">Privacy Officer</p>
                <p className="text-muted-foreground mb-2">privacy@vaultcapital.bond</p>
                <p className="text-muted-foreground">Response time: Under 15 minutes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}