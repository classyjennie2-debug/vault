const articles = [
  {
    title: "2026 Investment Outlook: Market Trends to Watch",
    author: "Sarah Chen",
    date: "March 15, 2026",
    category: "Market Analysis",
    excerpt: "As we move through 2026, several key trends are shaping investment opportunities. From AI-driven automation to sustainable investing, discover what might drive market performance this year.",
    readTime: "5 min read",
  },
  {
    title: "How AI is Revolutionizing Portfolio Management",
    author: "Marcus Johnson",
    date: "March 12, 2026",
    category: "Technology",
    excerpt: "Artificial intelligence is changing how investments are managed. Learn how machine learning algorithms optimize portfolios, reduce risk, and improve returns in real-time.",
    readTime: "8 min read",
  },
  {
    title: "The Complete Guide to Risk Management",
    author: "Priya Patel",
    date: "March 8, 2026",
    category: "Education",
    excerpt: "Risk management isn't about avoiding risk—it's about understanding it. Explore proven strategies to protect your investments while still pursuing growth opportunities.",
    readTime: "10 min read",
  },
  {
    title: "Diversification Done Right",
    author: "James Wilson",
    date: "March 5, 2026",
    category: "Strategy",
    excerpt: "A well-diversified portfolio is the foundation of long-term wealth. Discover how to spread your investments across asset classes for maximum protection.",
    readTime: "6 min read",
  },
  {
    title: "Understanding Cryptocurrency Investments",
    author: "Alex Rodriguez",
    date: "March 1, 2026",
    category: "Crypto",
    excerpt: "Cryptocurrencies represent a new asset class with unique characteristics. Learn how to evaluate crypto investments and manage volatility effectively.",
    readTime: "7 min read",
  },
  {
    title: "Behavioral Investing: Master Your Emotions",
    author: "Emma Thompson",
    date: "February 25, 2026",
    category: "Psychology",
    excerpt: "The biggest enemy of investment success isn't market conditions—it's your own psychology. Learn to recognize and overcome common behavioral mistakes.",
    readTime: "9 min read",
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Investment Insights</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Stay informed with the latest market trends, investment strategies, and financial news from our expert team.
            </p>
          </div>

          {/* Articles Grid */}
          <div className="grid gap-8">
            {articles.map((article, index) => (
              <article key={index} className="border rounded-lg p-6 md:p-8 hover:shadow-lg hover:border-accent transition-all cursor-pointer group">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs font-medium text-accent bg-accent/10 px-3 py-1 rounded-full">
                    {article.category}
                  </span>
                </div>
                <h3 className="text-2xl font-semibold mb-3 group-hover:text-accent transition-colors">
                  {article.title}
                </h3>
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {article.excerpt}
                </p>
                <div className="flex flex-wrap items-center justify-between text-sm text-muted-foreground">
                  <div className="space-x-4">
                    <span>By {article.author}</span>
                    <span>•</span>
                    <span>{article.date}</span>
                  </div>
                  <span className="text-xs font-medium">{article.readTime}</span>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-16 flex justify-center gap-2">
            <button className="px-4 py-2 border rounded hover:bg-accent/10 transition-colors">← Previous</button>
            <button className="px-4 py-2 bg-accent text-white rounded">1</button>
            <button className="px-4 py-2 border rounded hover:bg-accent/10 transition-colors">2</button>
            <button className="px-4 py-2 border rounded hover:bg-accent/10 transition-colors">3</button>
            <button className="px-4 py-2 border rounded hover:bg-accent/10 transition-colors">Next →</button>
          </div>
        </div>
      </div>
    </div>
  )
}