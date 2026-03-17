import Link from "next/link"
import { Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Large 404 */}
        <div className="mb-8">
          <h1 className="text-9xl md:text-[120px] font-bold text-accent/20 leading-none">404</h1>
        </div>

        {/* Content */}
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Page Not Found</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. It may have been moved or deleted.
        </p>

        {/* Search Box */}
        <div className="mb-12 p-6 border rounded-lg bg-secondary/20">
          <div className="flex items-center gap-3 mb-4 justify-center">
            <Search className="w-5 h-5 text-accent" />
            <p className="font-semibold">What are you looking for?</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Search our site..."
              className="flex-1 px-4 py-2 border rounded-lg bg-background focus:outline-none focus:border-accent"
            />
            <button className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all font-medium">
              Search
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          <Link
            href="/"
            className="px-4 py-3 border rounded-lg hover:bg-accent/10 hover:border-accent transition-all font-medium"
          >
            ← Back to Home
          </Link>
          <Link
            href="/help"
            className="px-4 py-3 border rounded-lg hover:bg-accent/10 hover:border-accent transition-all font-medium"
          >
            Help & Support →
          </Link>
        </div>

        {/* Helpful Links */}
        <div>
          <p className="text-sm text-muted-foreground mb-6">Explore these pages instead:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/about" className="text-sm text-accent hover:underline">
              About
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/pricing" className="text-sm text-accent hover:underline">
              Pricing
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/blog" className="text-sm text-accent hover:underline">
              Blog
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/faq" className="text-sm text-accent hover:underline">
              FAQ
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/security" className="text-sm text-accent hover:underline">
              Security
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/contact" className="text-sm text-accent hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
