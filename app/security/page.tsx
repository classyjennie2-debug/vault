import { Shield, Lock, Zap, Eye, Server, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"

const securityFeatures = [
  {
    icon: Lock,
    title: "Military-Grade Encryption",
    description: "All data is encrypted using AES-256 encryption standard, the same used by financial institutions and government agencies.",
  },
  {
    icon: Zap,
    title: "Two-Factor Authentication",
    description: "Protect your account with 2FA using authenticator apps, SMS, or security keys for an additional layer of protection.",
  },
  {
    icon: Eye,
    title: "Real-Time Monitoring",
    description: "Our AI-powered system continuously monitors for suspicious activity and alerts you immediately if any unusual access is detected.",
  },
  {
    icon: Server,
    title: "Cold Storage Wallets",
    description: "The majority of crypto assets are held in offline cold storage wallets, protected from online threats and hacking attempts.",
  },
  {
    icon: Smartphone,
    title: "Biometric Authentication",
    description: "Use your fingerprint or face ID for quick and secure login on your mobile device.",
  },
  {
    icon: Shield,
    title: "Fraud Detection",
    description: "Advanced machine learning algorithms detect and prevent fraudulent transactions in real-time before they occur.",
  },
]

const complianceItems = [
  {
    title: "SOC 2 Type II Certified",
    description: "Our security controls have been independently audited and certified by a third-party auditor.",
  },
  {
    title: "GDPR Compliant",
    description: "We fully comply with the General Data Protection Regulation and respect your privacy rights.",
  },
  {
    title: "AML/KYC Procedures",
    description: "Anti-Money Laundering and Know Your Customer verification procedures prevent financial crimes.",
  },
  {
    title: "Regular Security Audits",
    description: "Third-party security firms conduct regular penetration testing and vulnerability assessments.",
  },
  {
    title: "Insurance Coverage",
    description: "Your assets are protected by comprehensive insurance against fraud and theft.",
  },
  {
    title: "Data Backup",
    description: "Your data is automatically backed up across multiple secure locations for disaster recovery.",
  },
]

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6">
              <Shield className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Security at Vault</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your security is our top priority. We employ industry-leading security practices and technologies to protect your assets and personal information 24/7.
            </p>
          </div>

          {/* Security Features */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold mb-12">Security Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {securityFeatures.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <Icon className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground text-sm">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Compliance & Certifications */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold mb-12">Compliance & Certifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {complianceItems.map((item, index) => (
                <div key={index} className="p-6 bg-card border rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent" />
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Best Practices */}
          <div className="mb-20 bg-accent/5 p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-6">Security Best Practices</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <span className="text-acc font-bold">✓</span> Protect Your Account
                </h3>
                <ul className="space-y-3 text-muted-foreground text-sm">
                  <li>• Use a strong, unique password</li>
                  <li>• Enable two-factor authentication</li>
                  <li>• Never share your recovery codes</li>
                  <li>• Verify secure connections (HTTPS)</li>
                  <li>• Log out after each session</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <span className="text-accent font-bold">✓</span> Stay Alert
                </h3>
                <ul className="space-y-3 text-muted-foreground text-sm">
                  <li>• Beware of phishing emails</li>
                  <li>• Verify login emails are from @vaultinvest.com</li>
                  <li>• Don't click suspicious links</li>
                  <li>• Use official app or website only</li>
                  <li>• Report suspicious activity immediately</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Incident Response */}
          <div className="mb-20 border rounded-lg p-8">
            <h2 className="text-3xl font-bold mb-6">Security Incident Response</h2>
            <p className="text-muted-foreground mb-6">
              We maintain a comprehensive incident response plan to address any security concerns promptly and effectively.
            </p>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center font-bold text-sm">1</div>
                <div>
                  <h3 className="font-semibold mb-1">Detection</h3>
                  <p className="text-muted-foreground text-sm">Our monitoring systems detect anomalies 24/7</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center font-bold text-sm">2</div>
                <div>
                  <h3 className="font-semibold mb-1">Investigation</h3>
                  <p className="text-muted-foreground text-sm">Immediate investigation and containment procedures</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center font-bold text-sm">3</div>
                <div>
                  <h3 className="font-semibold mb-1">Communication</h3>
                  <p className="text-muted-foreground text-sm">Transparent communication with affected users</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center font-bold text-sm">4</div>
                <div>
                  <h3 className="font-semibold mb-1">Resolution</h3>
                  <p className="text-muted-foreground text-sm">Swift resolution and prevention of future incidents</p>
                </div>
              </div>
            </div>
          </div>

          {/* Report Security Issues */}
          <div className="text-center p-8 bg-gradient-to-r from-accent/10 to-accent/5 rounded-lg">
            <h3 className="text-2xl font-bold mb-3">Found a Security Vulnerability?</h3>
            <p className="text-muted-foreground mb-6">
              We appreciate responsible disclosure. Please report security issues to our security team.
            </p>
            <Button asChild>
              <a href="mailto:security@vaultinvest.com">Report to Security Team</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
