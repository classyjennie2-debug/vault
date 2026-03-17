import { Users, Target, Award, TrendingUp } from "lucide-react"
import Footer from "@/components/layout/footer"

const values = [
  {
    icon: <Target className="w-8 h-8" />,
    title: "Transparency",
    description: "No hidden fees, no surprises. Every investment, return, and charge is crystal clear.",
  },
  {
    icon: <Award className="w-8 h-8" />,
    title: "Excellence",
    description: "We strive for the highest standards in security, returns, and customer service.",
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Community",
    description: "We're building a community of investors who support and learn from each other.",
  },
  {
    icon: <TrendingUp className="w-8 h-8" />,
    title: "Innovation",
    description: "Leveraging cutting-edge AI and blockchain technology for better investment outcomes.",
  },
]

const team = [
  {
    name: "Sarah Chen",
    role: "Chief Executive Officer",
    bio: "20+ years in fintech with a track record of building successful investment platforms",
    image: "👩‍💼",
  },
  {
    name: "Marcus Johnson",
    role: "Chief Technology Officer",
    bio: "Former Google engineer specializing in scalable financial systems and blockchain",
    image: "👨‍💻",
  },
  {
    name: "Priya Patel",
    role: "Chief Investment Officer",
    bio: "Portfolio manager with $5B+ AUM and expertise in crypto and DeFi strategies",
    image: "👩‍🔬",
  },
  {
    name: "James Wilson",
    role: "Head of Compliance",
    bio: "Legal expert with 15 years ensuring regulatory compliance in fintech",
    image: "👨‍⚖️",
  },
]

const milestones = [
  {
    year: "2024",
    title: "Founded",
    description: "Vault launches with a mission to revolutionize retail investing",
  },
  {
    year: "2024",
    title: "$50M Series A",
    description: "Secured funding to scale operations and technology",
  },
  {
    year: "2025",
    title: "10,000+ Users",
    description: "Reached 10,000 active investors with $100M+ AUM",
  },
  {
    year: "2026",
    title: "Global Expansion",
    description: "Now serving investors in 45+ countries with 24/7 support",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Vault</h1>
          <p className="text-lg text-muted-foreground">
            We're on a mission to democratize investing and create financial opportunities for everyone.
          </p>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
          <div className="p-8 rounded-lg border bg-card">
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              To democratize access to professional-grade investment tools and strategies, making wealth
              accumulation achievable for everyone, regardless of their financial background or experience
              level. We believe financial success should not be limited by geography, resources, or
              prior knowledge.
            </p>
          </div>

          <div className="p-8 rounded-lg border bg-card">
            <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
            <p className="text-muted-foreground leading-relaxed">
              To create a world where financial prosperity is accessible to all. We envision a future where
              intelligent automation, cutting-edge technology, and expert guidance empower millions to build
              lasting wealth, achieve financial independence, and pursue their dreams without financial constraints.
            </p>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="bg-secondary/30 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Our Core Values</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <div key={index} className="p-6 rounded-lg border bg-card hover:border-accent transition-all">
                  <div className="text-accent mb-4">{value.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Leadership Team */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Leadership Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <div key={index} className="rounded-lg border p-6 text-center hover:shadow-lg transition-all">
                <div className="text-6xl mb-4 block">{member.image}</div>
                <h3 className="font-semibold mb-1">{member.name}</h3>
                <p className="text-sm text-accent font-medium mb-3">{member.role}</p>
                <p className="text-sm text-muted-foreground">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Journey Timeline */}
      <div className="bg-secondary/30 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Our Journey</h2>

            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    {index !== milestones.length - 1 && (
                      <div className="w-1 h-16 bg-accent/30 mt-2"></div>
                    )}
                  </div>
                  <div className="pt-2 pb-8">
                    <p className="text-sm font-semibold text-accent">{milestone.year}</p>
                    <h3 className="text-xl font-bold mt-1">{milestone.title}</h3>
                    <p className="text-muted-foreground mt-2">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">By The Numbers</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6 rounded-lg border bg-card">
              <p className="text-4xl font-bold text-accent mb-2">45K+</p>
              <p className="text-muted-foreground">Active Investors</p>
            </div>
            <div className="text-center p-6 rounded-lg border bg-card">
              <p className="text-4xl font-bold text-accent mb-2">$2.4B</p>
              <p className="text-muted-foreground">Assets Under Management</p>
            </div>
            <div className="text-center p-6 rounded-lg border bg-card">
              <p className="text-4xl font-bold text-accent mb-2">45+</p>
              <p className="text-muted-foreground">Countries Served</p>
            </div>
            <div className="text-center p-6 rounded-lg border bg-card">
              <p className="text-4xl font-bold text-accent mb-2">99.95%</p>
              <p className="text-muted-foreground">Uptime Guarantee</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-accent/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Mission</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Be part of the financial revolution. Start investing with Vault today and take control of your
            financial future.
          </p>
          <button className="bg-accent text-white px-8 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-all">
            Get Started
          </button>
        </div>
      </div>
      <Footer />
    </div>
  )
}