import { CheckCircle2, AlertCircle, Clock } from "lucide-react"
import Footer from "@/components/layout/footer"

interface ServiceStatus {
  name: string
  status: "operational" | "degraded" | "maintenance"
  uptime: string
  lastUpdated: string
}

const services: ServiceStatus[] = [
  {
    name: "Web Application",
    status: "operational",
    uptime: "99.98%",
    lastUpdated: "3 minutes ago",
  },
  {
    name: "API Services",
    status: "operational",
    uptime: "99.99%",
    lastUpdated: "5 minutes ago",
  },
  {
    name: "Trading Engine",
    status: "operational",
    uptime: "99.97%",
    lastUpdated: "2 minutes ago",
  },
  {
    name: "Mobile Applications",
    status: "operational",
    uptime: "99.95%",
    lastUpdated: "4 minutes ago",
  },
  {
    name: "Database Services",
    status: "operational",
    uptime: "99.99%",
    lastUpdated: "1 minute ago",
  },
  {
    name: "Payment Processing",
    status: "operational",
    uptime: "99.98%",
    lastUpdated: "6 minutes ago",
  },
]

const incidents = [
  {
    date: "March 10, 2026",
    title: "Scheduled Maintenance Completed",
    description: "Database maintenance completed successfully. No impact on services.",
    duration: "Resolved",
  },
  {
    date: "March 5, 2026",
    title: "Network Optimization",
    description: "Completed infrastructure optimization for improved performance.",
    duration: "Resolved",
  },
]

function getStatusIcon(status: string) {
  switch (status) {
    case "operational":
      return <CheckCircle2 className="w-5 h-5 text-green-500" />
    case "degraded":
      return <AlertCircle className="w-5 h-5 text-yellow-500" />
    case "maintenance":
      return <Clock className="w-5 h-5 text-blue-500" />
    default:
      return null
  }
}

function getStatusText(status: string) {
  switch (status) {
    case "operational":
      return "Operational"
    case "degraded":
      return "Degraded Performance"
    case "maintenance":
      return "Scheduled Maintenance"
    default:
      return "Unknown"
  }
}

export default function StatusPage() {
  const operationalCount = services.filter(s => s.status === "operational").length
  const degradedCount = services.filter(s => s.status === "degraded").length
  const maintenanceCount = services.filter(s => s.status === "maintenance").length

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">System Status</h1>
            <p className="text-lg text-muted-foreground">
              Real-time status of Vault services and infrastructure
            </p>
          </div>

          {/* Overall Status */}
          <div className="mb-12 p-6 border rounded-lg bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold">All Systems Operational</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {operationalCount} of {services.length} services operational
            </p>
          </div>

          {/* Service Status Grid */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Service Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service, index) => (
                <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-3">
                    {getStatusIcon(service.status)}
                    <div className="flex-1">
                      <h3 className="font-semibold">{service.name}</h3>
                      <p className="text-sm text-muted-foreground">{getStatusText(service.status)}</p>
                    </div>
                  </div>
                  <div className="pl-8 space-y-1 text-xs text-muted-foreground">
                    <div>Uptime: <span className="font-medium text-foreground">{service.uptime}</span></div>
                    <div>Updated: {service.lastUpdated}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Incident History */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Recent Incidents</h2>
            <div className="space-y-4">
              {incidents.map((incident, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{incident.title}</h3>
                      <p className="text-sm text-muted-foreground">{incident.date}</p>
                    </div>
                    <span className="text-xs font-medium text-green-600">{incident.duration}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{incident.description}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              For more incident history, visit our <a href="/#" className="text-accent hover:underline">status page</a>
            </p>
          </div>

          {/* Metrics */}
          <div className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 border rounded-lg text-center">
              <p className="text-3xl font-bold text-accent mb-2">{(services.reduce((sum, s) => parseFloat(s.uptime) + sum, 0) / services.length).toFixed(2)}%</p>
              <p className="text-muted-foreground">Average Uptime</p>
              <p className="text-xs text-muted-foreground mt-2">Last 30 days</p>
            </div>
            <div className="p-6 border rounded-lg text-center">
              <p className="text-3xl font-bold text-green-600 mb-2">{operationalCount}</p>
              <p className="text-muted-foreground">Services Operational</p>
              <p className="text-xs text-muted-foreground mt-2">Out of {services.length}</p>
            </div>
            <div className="p-6 border rounded-lg text-center">
              <p className="text-3xl font-bold text-blue-600 mb-2">0</p>
              <p className="text-muted-foreground">Unresolved Incidents</p>
              <p className="text-xs text-muted-foreground mt-2">This month</p>
            </div>
          </div>

          {/* Notifications */}
          <div className="p-6 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              Get Status Updates
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to get real-time notifications about service status changes and scheduled maintenance.
            </p>
            <div className="flex gap-2 flex-wrap">
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium">
                Subscribe via Email
              </button>
              <button className="px-4 py-2 border rounded hover:bg-accent/5 transition-colors text-sm font-medium">
                Subscribe via RSS
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
