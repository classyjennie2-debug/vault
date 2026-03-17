import { ArrowUpRight, ArrowDownRight, User, Lock, Settings, Trash2, LogOut, LogIn } from "lucide-react"

export type ActivityType =
  | "login"
  | "logout"
  | "deposit"
  | "withdrawal"
  | "investment"
  | "password_change"
  | "profile_update"
  | "account_deletion_request"

export interface Activity {
  id: string
  type: ActivityType
  description: string
  timestamp: string
  location?: string
  device?: string
  ipAddress?: string
  status: "success" | "pending" | "failed"
}

const activityIcons: Record<ActivityType, React.ReactNode> = {
  login: <LogIn className="h-4 w-4" />,
  logout: <LogOut className="h-4 w-4" />,
  deposit: <ArrowDownRight className="h-4 w-4" />,
  withdrawal: <ArrowUpRight className="h-4 w-4" />,
  investment: <ArrowUpRight className="h-4 w-4" />,
  password_change: <Lock className="h-4 w-4" />,
  profile_update: <User className="h-4 w-4" />,
  account_deletion_request: <Trash2 className="h-4 w-4" />,
}

const activityLabels: Record<ActivityType, string> = {
  login: "Sign In",
  logout: "Sign Out",
  deposit: "Deposit",
  withdrawal: "Withdrawal",
  investment: "Investment",
  password_change: "Password Changed",
  profile_update: "Profile Updated",
  account_deletion_request: "Deletion Request",
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date()
  const activityTime = new Date(timestamp)
  const diffMs = now.getTime() - activityTime.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays < 30) return `${diffDays} days ago`
  return activityTime.toLocaleDateString()
}

interface ActivityLogProps {
  activities: Activity[]
  limit?: number
}

export function ActivityLog({ activities, limit = 10 }: ActivityLogProps) {
  const displayActivities = activities.slice(0, limit)

  return (
    <div className="space-y-3">
      {displayActivities.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No recent activity
        </p>
      ) : (
        displayActivities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 rounded-lg border border-border p-3 hover:bg-secondary/50 transition-colors"
          >
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                {activityIcons[activity.type]}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {activityLabels[activity.type]}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {activity.description}
              </p>
              {activity.location && (
                <p className="text-xs text-muted-foreground mt-1">
                  📍 {activity.location}
                </p>
              )}
            </div>

            {/* Time & Status */}
            <div className="flex-shrink-0 text-right">
              <p className="text-xs text-muted-foreground">
                {formatTimeAgo(activity.timestamp)}
              </p>
              <p className={`text-xs font-medium mt-1 ${
                activity.status === "success"
                  ? "text-green-600 dark:text-green-400"
                  : activity.status === "pending"
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-red-600 dark:text-red-400"
              }`}>
                {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
