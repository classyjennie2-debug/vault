import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getRecentActivities } from "@/lib/db"
import {
  TrendingUp,
  Award,
  ArrowDown,
  ArrowUp,
  Zap,
  Eye,
} from "lucide-react"

const activityIcons = {
  investment: TrendingUp,
  profit: Award,
  deposit: ArrowDown,
  withdrawal: ArrowUp,
}

const activityBgColors = {
  investment: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
  profit: "bg-green-500/20 text-green-600 dark:text-green-400",
  deposit: "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400",
  withdrawal: "bg-orange-500/20 text-orange-600 dark:text-orange-400",
}

interface RecentActivitiesProps {
  userId: string
}

export function RecentActivities({ userId }: RecentActivitiesProps) {
  const activities = getRecentActivities(userId)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3 border backdrop-blur-lg bg-gradient-to-br from-slate-50/50 to-slate-100/30 dark:from-slate-950/50 dark:to-slate-900/30 animate-in fade-in slide-in-from-bottom duration-700">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/50">
        <CardTitle className="flex items-center gap-2 text-base font-normal text-muted-foreground">
          <Zap className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          Recent Activity
        </CardTitle>
        <a
          href="/dashboard/transactions"
          className="text-xs font-semibold text-accent hover:text-accent/80 hover:underline flex items-center gap-1 transition-colors duration-300"
        >
          View all
          <Eye className="h-3 w-3" />
        </a>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-6">
        {activities.map((tx, idx) => {
          const Icon = activityIcons[tx.type as keyof typeof activityIcons] || TrendingUp
          const bgColor = activityBgColors[tx.type as keyof typeof activityBgColors] || "bg-gray-200"
          return (
            <div
              key={tx.id}
              className="flex items-start gap-4 p-3 rounded-lg hover:bg-gradient-to-r hover:from-white/50 hover:to-slate-50/50 dark:hover:from-slate-800/50 dark:hover:to-slate-900/50 transition-all duration-300 group animate-in fade-in slide-in-from-left duration-500"
              style={{ animationDelay: `${idx * 75}ms` }}
            >
              <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg ${bgColor} group-hover:scale-110 transition-transform duration-300 font-bold border border-white/20 shadow-lg`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-card-foreground group-hover:text-accent transition-colors">
                  {tx.description}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-2">
                  Amount: ${tx.amount.toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <p className="text-xs font-semibold text-muted-foreground/60 whitespace-nowrap group-hover:text-muted-foreground transition-colors">
                  {formatDate(tx.date)}
                </p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
