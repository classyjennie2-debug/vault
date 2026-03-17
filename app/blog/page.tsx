import Footer from "@/components/layout/footer"

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
  // 2025 posts
  {
    title: "Predicting Market Movements: Technical Analysis Fundamentals",
    author: "David Kim",
    date: "December 10, 2025",
    category: "Market Analysis",
    excerpt: "Technical analysis helps investors identify patterns and predict potential market movements. Learn the essential tools and indicators every investor should know.",
    readTime: "8 min read",
  },
  {
    title: "ESG Investing: Making Money While Making a Difference",
    author: "Lisa Anderson",
    date: "November 5, 2025",
    category: "Strategy",
    excerpt: "Environmental, Social, and Governance (ESG) criteria are reshaping investment strategies. Discover how to align your portfolio with your values.",
    readTime: "6 min read",
  },
  {
    title: "The Fed's Interest Rate Decisions: What They Mean for Your Portfolio",
    author: "Robert Davis",
    date: "October 20, 2025",
    category: "Market Analysis",
    excerpt: "Understanding Federal Reserve policy is crucial for investors. Learn how interest rate changes impact different asset classes and your investment strategy.",
    readTime: "7 min read",
  },
  {
    title: "Real Estate Investment Trusts (REITs): Passive Income for Everyone",
    author: "Jennifer Lee",
    date: "September 15, 2025",
    category: "Education",
    excerpt: "REITs offer real estate exposure without the hassle of property management. Explore how these instruments can diversify your portfolio and generate income.",
    readTime: "8 min read",
  },
  {
    title: "Cryptocurrency Regulation: Navigating the Changing Landscape",
    author: "Michael Zhang",
    date: "August 22, 2025",
    category: "Crypto",
    excerpt: "Global regulatory frameworks for crypto are evolving rapidly. Stay informed about how new regulations affect your digital asset investments.",
    readTime: "9 min read",
  },
  {
    title: "Index Funds vs Active Management: Which Strategy Wins?",
    author: "Sarah Chen",
    date: "July 18, 2025",
    category: "Strategy",
    excerpt: "The age-old debate continues: passive indexing or active stock picking? We break down the data to help you decide what's best for your goals.",
    readTime: "7 min read",
  },
  // 2024 posts
  {
    title: "Inflation's Impact on Your Investments: Strategies to Protect Your Wealth",
    author: "Marcus Johnson",
    date: "June 10, 2024",
    category: "Education",
    excerpt: "Inflation erodes purchasing power, but certain investments can hedge against it. Learn which assets perform well during inflationary periods.",
    readTime: "8 min read",
  },
  {
    title: "The Psychology of Trading: Why Most Investors Fail",
    author: "Emma Thompson",
    date: "May 15, 2024",
    category: "Psychology",
    excerpt: "Emotional decision-making is the biggest obstacle to investment success. Discover proven techniques to control your emotions and make rational decisions.",
    readTime: "10 min read",
  },
  {
    title: "Bond Market Fundamentals: Fixed Income Investing 101",
    author: "Priya Patel",
    date: "April 8, 2024",
    category: "Education",
    excerpt: "Bonds are essential to a balanced portfolio. Learn how to evaluate bonds, understand yield curves, and build a fixed income strategy.",
    readTime: "9 min read",
  },
  {
    title: "Market Volatility: Opportunities Hidden in Chaos",
    author: "James Wilson",
    date: "March 20, 2024",
    category: "Strategy",
    excerpt: "Market crashes scare most investors, but they create opportunities for the prepared. Learn how to profit from volatility and market dislocations.",
    readTime: "7 min read",
  },
  {
    title: "Tax-Efficient Investing: Keep More of What You Earn",
    author: "Alex Rodriguez",
    date: "February 14, 2024",
    category: "Strategy",
    excerpt: "Taxes can significantly reduce investment returns. Master tax-loss harvesting and other strategies to minimize your tax burden.",
    readTime: "6 min read",
  },
  {
    title: "Starting Your Investment Journey: A Beginner's Roadmap",
    author: "Lisa Anderson",
    date: "January 30, 2024",
    category: "Education",
    excerpt: "First-time investors often feel overwhelmed. This comprehensive guide walks you through each step of building your first portfolio.",
    readTime: "11 min read",
  },
  // 2023 posts
  {
    title: "Emerging Markets: High Risk, High Reward Investment Opportunities",
    author: "David Kim",
    date: "November 5, 2023",
    category: "Market Analysis",
    excerpt: "Emerging markets offer significant growth potential for investors willing to accept higher volatility. Explore opportunities in Asia, Latin America, and Africa.",
    readTime: "8 min read",
  },
  {
    title: "The Great Tech Stock Debate: Bubble or Breakthrough?",
    author: "Robert Davis",
    date: "September 12, 2023",
    category: "Market Analysis",
    excerpt: "Technology stocks have dominated market gains. But are we in a bubble? We analyze the fundamentals and future prospects of major tech companies.",
    readTime: "9 min read",
  },
  {
    title: "Building Wealth Through Dividend Investing",
    author: "Jennifer Lee",
    date: "August 3, 2023",
    category: "Strategy",
    excerpt: "Dividend stocks provide regular income and capital appreciation. Learn how to build a sustainable income stream through dividend investing.",
    readTime: "7 min read",
  },
  {
    title: "Recession Warning Signs: How to Protect Your Portfolio",
    author: "Michael Zhang",
    date: "July 15, 2023",
    category: "Market Analysis",
    excerpt: "Economic downturns are inevitable. Learn the warning signs of recession and defensive strategies to weather financial storms.",
    readTime: "8 min read",
  },
  // 2022 posts
  {
    title: "Value Investing in a Rising Rate Environment",
    author: "Sarah Chen",
    date: "December 1, 2022",
    category: "Strategy",
    excerpt: "Rising interest rates change the investment landscape. Discover how to find value stocks that thrive despite monetary tightening.",
    readTime: "7 min read",
  },
  {
    title: "Cryptocurrency Winter: Lessons from 2022",
    author: "Marcus Johnson",
    date: "October 20, 2022",
    category: "Crypto",
    excerpt: "The crypto market experienced significant turmoil in 2022. Learn what went wrong and how to invest more safely in digital assets.",
    readTime: "8 min read",
  },
  {
    title: "Healthcare Stocks: Defensive Investing During Uncertainty",
    author: "Priya Patel",
    date: "August 30, 2022",
    category: "Sectors",
    excerpt: "Healthcare stocks offer stability during market turbulence. Explore the best defensive healthcare positions for your portfolio.",
    readTime: "6 min read",
  },
  // 2021 posts
  {
    title: "Post-Pandemic Investment Strategy: Building for the Recovery",
    author: "James Wilson",
    date: "June 10, 2021",
    category: "Market Analysis",
    excerpt: "As economies recover from COVID-19, new investment opportunities emerge. Learn which sectors are poised for strong growth in the post-pandemic world.",
    readTime: "9 min read",
  },
  {
    title: "When to Sell: Knowing Your Exit Points",
    author: "Emma Thompson",
    date: "April 15, 2021",
    category: "Strategy",
    excerpt: "Most investors focus on buying but neglect selling discipline. Master the art of knowing when to exit positions for maximum profits.",
    readTime: "8 min read",
  },
  {
    title: "Alternative Investments: Beyond Stocks and Bonds",
    author: "Alex Rodriguez",
    date: "February 22, 2021",
    category: "Education",
    excerpt: "Hedge funds, commodities, and private equity can enhance portfolio returns. Explore the world of alternative investments.",
    readTime: "10 min read",
  },
  {
    title: "The Power of Compound Interest: Albert Einstein's Favorite Formula",
    author: "Lisa Anderson",
    date: "January 8, 2021",
    category: "Education",
    excerpt: "Compound interest is the eighth wonder of the world. Discover how time and consistent investing can build extraordinary wealth.",
    readTime: "5 min read",
  },
  // 2020 posts
  {
    title: "Market Crash Survival Guide: Lessons from March 2020",
    author: "David Kim",
    date: "November 10, 2020",
    category: "Market Analysis",
    excerpt: "The COVID-19 crash tested investors worldwide. Learn the critical lessons and strategies that helped successful investors navigate extreme volatility.",
    readTime: "9 min read",
  },
  {
    title: "Dollar-Cost Averaging: Investing in Crisis Times",
    author: "Robert Davis",
    date: "August 25, 2020",
    category: "Strategy",
    excerpt: "When markets are uncertain, steady investing through dollar-cost averaging can reduce risk and maximize long-term returns.",
    readTime: "7 min read",
  },
  {
    title: "The New Normal: How COVID-19 Changed Investing Forever",
    author: "Jennifer Lee",
    date: "June 5, 2020",
    category: "Market Analysis",
    excerpt: "The global pandemic has fundamentally altered market dynamics. Explore the permanent changes to investment markets and opportunities they create.",
    readTime: "8 min read",
  },
  {
    title: "Getting Started with Vault Capital: Your Investment Journey Begins",
    author: "Michael Zhang",
    date: "April 15, 2020",
    category: "Education",
    excerpt: "Welcome to Vault Capital. This comprehensive guide introduces our platform and shows you how to start building wealth with our expert strategies.",
    readTime: "6 min read",
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
      <Footer />
    </div>
  )
}