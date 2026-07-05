import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import Footer from "@/components/layout/footer"

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <Link 
            href="/"
            className="link-professional inline-flex items-center gap-2 text-muted-foreground hover:text-accent transition-smooth group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>
        <h1 className="h-section text-4xl font-bold text-center mb-8 animate-fade-in">Contact Us</h1>
        <p className="body-secondary text-lg text-muted-foreground text-center mb-12 animate-fade-in" style={{ animationDelay: "100ms" }}>
          Get in touch with our team for support, partnerships, or general inquiries.
        </p>

        <div className="grid gap-8 md:grid-cols-2 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <div className="card-professional border-l-4 border-l-accent/30 p-6 shadow-md hover:shadow-lg transition-smooth">
            <h2 className="h-subsection text-2xl font-semibold mb-6">Get in Touch</h2>
            <div className="space-y-6">
              <div className="group hover:bg-accent/5 p-3 rounded-md transition-smooth">
                <h3 className="font-semibold text-accent group-hover:text-accent/80 transition-smooth">Email</h3>
                <p className="text-muted-foreground body-secondary">support@vaultcapital.bond</p>
              </div>
              <div className="group hover:bg-accent/5 p-3 rounded-md transition-smooth">
                <h3 className="font-semibold text-accent group-hover:text-accent/80 transition-smooth">Address</h3>
                <p className="text-muted-foreground body-secondary">
                  123 Investment Street<br />
                  Financial District<br />
                  New York, NY 10001
                </p>
              </div>
            </div>
          </div>

          <div className="card-professional border-l-4 border-l-accent/30 p-6 shadow-md hover:shadow-lg transition-smooth">
            <h2 className="h-subsection text-2xl font-semibold mb-6">Business Hours</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 hover:bg-accent/5 rounded-md transition-smooth group">
                <span className="font-medium group-hover:text-accent transition-smooth">Monday - Friday</span>
                <span className="text-accent font-semibold data-value">9:00 AM - 6:00 PM EST</span>
              </div>
              <div className="flex justify-between items-center p-3 hover:bg-accent/5 rounded-md transition-smooth group">
                <span className="font-medium group-hover:text-accent transition-smooth">Saturday</span>
                <span className="text-accent font-semibold data-value">10:00 AM - 4:00 PM EST</span>
              </div>
              <div className="flex justify-between items-center p-3 hover:bg-accent/5 rounded-md transition-smooth group">
                <span className="font-medium group-hover:text-accent transition-smooth">Sunday</span>
                <span className="text-muted-foreground body-secondary">Closed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}