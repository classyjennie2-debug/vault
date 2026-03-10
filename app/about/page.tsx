export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">About Vault</h1>
        <div className="prose prose-lg mx-auto">
          <p className="text-lg text-muted-foreground mb-6">
            Vault is a cutting-edge investment platform that democratizes access to institutional-grade investment strategies.
            Founded in 2024, we believe that everyone should have the opportunity to build wealth through smart, automated investing.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-muted-foreground mb-6">
            To empower individuals with the tools and knowledge to make informed investment decisions,
            using advanced AI and machine learning to optimize portfolio performance.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Our Technology</h2>
          <p className="text-muted-foreground mb-6">
            We leverage state-of-the-art algorithms, real-time market data, and risk management techniques
            to provide personalized investment solutions that adapt to changing market conditions.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Security First</h2>
          <p className="text-muted-foreground mb-6">
            Your security is our top priority. We employ bank-level encryption, multi-factor authentication,
            and cold storage solutions to protect your assets 24/7.
          </p>
        </div>
      </div>
    </div>
  )
}