import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthNavButtons } from "@/components/auth-nav-buttons"
import { ThemeToggle } from "@/components/theme/theme-toggle"

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Modern Design */}
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center h-8 w-8">
              <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Outer frame */}
                <rect x="15" y="20" width="90" height="80" rx="12" ry="12" stroke="currentColor" strokeWidth="2.5" className="text-accent"/>
                {/* Inner vault door */}
                <rect x="25" y="30" width="70" height="60" rx="8" ry="8" fill="currentColor" fillOpacity="0.05" className="text-accent"/>
                {/* Lock dial */}
                <circle cx="60" cy="60" r="18" stroke="currentColor" strokeWidth="2" className="text-accent"/>
                <circle cx="60" cy="60" r="14" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" className="text-accent opacity-50"/>
                {/* Lock indicator dot */}
                <circle cx="60" cy="48" r="2.5" fill="currentColor" className="text-accent"/>
                {/* Security lines */}
                <line x1="35" y1="90" x2="85" y2="90" stroke="currentColor" strokeWidth="1.5" className="text-accent opacity-60"/>
                <line x1="35" y1="100" x2="85" y2="100" stroke="currentColor" strokeWidth="1" className="text-accent opacity-40"/>
                {/* Top accent bar */}
                <rect x="15" y="18" width="90" height="2" rx="1" fill="currentColor" className="text-accent"/>
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground" style={{fontFamily: '"Inter", "Segoe UI", sans-serif'}}>
              Vault Capital
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </Link>
            <Link href="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Help
            </Link>
            <Link href="/security" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Security
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </nav>

          {/* Right Side: Auth Links */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AuthNavButtons />

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
