import Footer from "@/components/layout/footer"

export default function CompliancePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto px-4 py-16 flex-1">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Regulatory Compliance</h1>

        <div className="prose prose-lg max-w-none">
          <h2>Regulatory Framework</h2>
          <p>
            Vault operates in compliance with applicable securities laws and regulations.
            We are committed to maintaining the highest standards of regulatory compliance.
          </p>

          <h2>AML/KYC Compliance</h2>
          <p>
            We implement robust Anti-Money Laundering (AML) and Know Your Customer (KYC)
            procedures to prevent financial crimes and ensure regulatory compliance.
          </p>

          <h2>Data Protection</h2>
          <p>
            We adhere to data protection regulations including GDPR and other applicable
            privacy laws to protect your personal and financial information.
          </p>

          <h2>Risk Management</h2>
          <p>
            Our risk management framework includes comprehensive policies and procedures
            designed to identify, assess, and mitigate investment and operational risks.
          </p>

          <h2>Reporting</h2>
          <p>
            We maintain detailed records and provide regular reporting to regulatory authorities
            as required by applicable laws and regulations.
          </p>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  )
}