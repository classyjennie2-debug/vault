export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Investment Insights</h1>
        <p className="text-lg text-muted-foreground text-center mb-12">
          Stay informed with the latest market trends, investment strategies, and financial news.
        </p>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <article className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-3">Market Trends 2026</h3>
            <p className="text-muted-foreground mb-4">
              An analysis of emerging market trends and their impact on investment strategies.
            </p>
            <span className="text-sm text-accent">Coming Soon</span>
          </article>

          <article className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-3">AI in Investing</h3>
            <p className="text-muted-foreground mb-4">
              How artificial intelligence is revolutionizing portfolio management.
            </p>
            <span className="text-sm text-accent">Coming Soon</span>
          </article>

          <article className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-3">Risk Management</h3>
            <p className="text-muted-foreground mb-4">
              Essential strategies for protecting your investments in volatile markets.
            </p>
            <span className="text-sm text-accent">Coming Soon</span>
          </article>
        </div>
      </div>
    </div>
  )
}