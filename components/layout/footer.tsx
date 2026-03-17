import Link from "next/link"
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Github } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-secondary/30">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Company Info */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
              <div className="flex h-8 w-8 items-center justify-center">
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
              <span className="font-bold text-lg tracking-tight text-foreground" style={{fontFamily: '"Inter", "Segoe UI", sans-serif'}}>
                Vault Capital
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Democratizing access to professional-grade investment strategies.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              <a href="https://twitter.com/vaultcapital" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-accent transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="https://linkedin.com/company/vaultcapital" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-accent transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="https://facebook.com/vaultcapital" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-accent transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="https://github.com/vaultcapital" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-accent transition-colors">
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/pricing" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/testimonials" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Testimonials
                </Link>
              </li>
              <li>
                <Link href="/status" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Status
                </Link>
              </li>
              <li>
                <Link href="/security" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Security
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/compliance" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Compliance
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/launch-checklist" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Launch Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Section */}
        <div className="border-t border-border pt-8 mb-8">
          <h3 className="font-semibold text-sm mb-4">Get In Touch</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <a href="mailto:support@vaultcapital.bond" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  support@vaultcapital.bond
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <a href="tel:+1234567890" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  +1 (234) 567-890
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Address</p>
                <p className="text-sm text-muted-foreground">San Francisco, CA</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Vault. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-accent transition-colors">
              Privacy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-accent transition-colors">
              Terms
            </Link>
            <span>•</span>
            <a href="/sitemap.xml" className="hover:text-accent transition-colors">
              Site Map
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
