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
    name: "Norman Garceau",
    role: "Chief Executive Officer",
    bio: "30+ years in fintech with a track record of building successful investment platforms",
    image: "https://i.pravatar.cc/150?img=65",
  },
  {
    name: "Paul Greenfield",
    role: "Chief Technology Officer",
    bio: "Former Yahoo and IBM architect specializing in scalable financial systems and blockchain",
    image: "https://i.pravatar.cc/150?img=62",
  },
  {
    name: "Lisa Angelo",
    role: "Chief Investment Officer",
    bio: "Portfolio manager with $8B+ AUM and 25 years expertise in crypto and DeFi strategies",
    image: "https://i.pravatar.cc/150?img=47",
  },
  {
    name: "Edward Williamson",
    role: "Head of Compliance",
    bio: "Legal expert with 20 years ensuring regulatory compliance across multiple financial sectors",
    image: "https://i.pravatar.cc/150?img=48",
  },
]

const milestones = [
  {
    year: "2017",
    title: "Founded",
    description: "Vault was established with a vision to democratize investing and make financial growth accessible to everyone",
  },
  {
    year: "2018",
    title: "Beta Launch",
    description: "Launched beta platform with 500 early adopters and initial investment strategies",
  },
  {
    year: "2020",
    title: "Series A Funding",
    description: "Raised $20M in Series A funding to expand technology and product offerings",
  },
  {
    year: "2022",
    title: "$50M Series B",
    description: "Secured $50M Series B funding and expanded to 15 new markets",
  },
  {
    year: "2024",
    title: "10,000+ Users",
    description: "Reached 10,000 active investors with $500M+ AUM across crypto and traditional assets",
  },
  {
    year: "2026",
    title: "Global Expansion",
    description: "Now serving investors in 45+ countries with 24/7 support and AI-powered investment strategies",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 animate-fade-in">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">About Vault</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We're on a mission to democratize investing and create financial opportunities for everyone.
          </p>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="card-professional p-8 border-l-4 border-primary animate-slide-left">
            <h2 className="h-section mb-4 flex items-center gap-2">
              <div className="w-1 h-8 bg-primary rounded-full"></div>
              Our Mission
            </h2>
            <p className="body-secondary leading-relaxed">
              To democratize access to professional-grade investment tools and strategies, making wealth
              accumulation achievable for everyone, regardless of their financial background or experience
              level. We believe financial success should not be limited by geography, resources, or
              prior knowledge.
            </p>
          </div>

          <div className="card-professional p-8 border-l-4 border-accent animate-slide-right">
            <h2 className="h-section mb-4 flex items-center gap-2">
              <div className="w-1 h-8 bg-accent rounded-full"></div>
              Our Vision
            </h2>
            <p className="body-secondary leading-relaxed">
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
            <h2 className="text-3xl font-bold text-center mb-12 h-section">Our Core Values</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <div key={index} className="group card-professional p-6 border-l-4 border-accent/30 hover:border-accent animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="text-accent mb-4 group-hover:scale-110 transition-smooth">{value.icon}</div>
                  <h3 className="h-subsection mb-2 group-hover:text-accent transition-smooth">{value.title}</h3>
                  <p className="body-secondary leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Leadership Team */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 h-section">Leadership Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <div key={index} className="group card-professional p-6 text-center border-l-4 border-accent/30 hover:border-accent animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="relative mb-4 flex justify-center">
                  <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-smooth"></div>
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="relative w-24 h-24 rounded-full mx-auto object-cover ring-2 ring-accent/20 group-hover:ring-accent/50 transition-smooth" 
                  />
                </div>
                <h3 className="h-subsection mb-1">{member.name}</h3>
                <p className="text-sm text-accent font-medium mb-3 uppercase tracking-wide">{member.role}</p>
                <p className="body-secondary line-clamp-3">{member.bio}</p>
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
          <h2 className="text-3xl font-bold text-center mb-12 h-section">By The Numbers</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="card-professional text-center p-8 border-t-4 border-accent group cursor-default animate-fade-in" style={{ animationDelay: '0ms' }}>
              <p className="text-5xl font-bold text-accent mb-3 group-hover:scale-105 transition-smooth">45K+</p>
              <p className="body-secondary uppercase tracking-widest text-xs">Active Investors</p>
            </div>
            <div className="card-professional text-center p-8 border-t-4 border-primary group cursor-default animate-fade-in" style={{ animationDelay: '100ms' }}>
              <p className="text-5xl font-bold text-primary mb-3 group-hover:scale-105 transition-smooth">$2.4B</p>
              <p className="body-secondary uppercase tracking-widest text-xs">Assets Under Management</p>
            </div>
            <div className="card-professional text-center p-8 border-t-4 border-accent group cursor-default animate-fade-in" style={{ animationDelay: '200ms' }}>
              <p className="text-5xl font-bold text-accent mb-3 group-hover:scale-105 transition-smooth">45+</p>
              <p className="body-secondary uppercase tracking-widest text-xs">Countries Served</p>
            </div>
            <div className="card-professional text-center p-8 border-t-4 border-success group cursor-default animate-fade-in" style={{ animationDelay: '300ms' }}>
              <p className="text-5xl font-bold text-success mb-3 group-hover:scale-105 transition-smooth">99.95%</p>
              <p className="body-secondary uppercase tracking-widest text-xs">Uptime Guarantee</p>
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