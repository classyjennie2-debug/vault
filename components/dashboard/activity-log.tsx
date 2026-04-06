import { ArrowUpRight, ArrowDownRight, User, Lock, Settings, Trash2, LogOut, LogIn, Globe, Smartphone } from "lucide-react"
import { useI18n } from "@/hooks/use-i18n"

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
  ip_address?: string
  ipAddress?: string
  user_agent?: string
  metadata?: any
  status: "success" | "pending" | "failed"
  created_at?: string
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

function formatFullDateTime(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleString()
}

interface ActivityLogProps {
  activities?: Activity[]
  limit?: number
  expanded?: boolean
}

export function ActivityLog({ activities = [], limit = 10, expanded = false }: ActivityLogProps) {
  const { t } = useI18n("dashboardmain")
  
  function getActivityLabel(activityType: ActivityType): string {
    const labelMap: Record<ActivityType, string> = {
      login: t("activity_sign_in"),
      logout: t("activity_sign_out"),
      deposit: t("activity_deposit"),
      withdrawal: t("activity_withdrawal"),
      investment: t("activity_investment"),
      password_change: t("activity_password_changed"),
      profile_update: t("activity_profile_updated"),
      account_deletion_request: t("activity_deletion_request"),
    }
    return labelMap[activityType]
  }

  function formatTimeAgo(timestamp: string): string {
    const now = new Date()
    const activityTime = new Date(timestamp)
    const diffMs = now.getTime() - activityTime.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return t("just_now")
    if (diffMins < 60) return `${diffMins} ${t("min_ago")}`
    if (diffHours < 24) return `${diffHours} ${t("hours_ago")}`
    if (diffDays < 30) return `${diffDays} ${t("days_ago")}`
    return activityTime.toLocaleDateString()
  }

  const displayActivities = (activities || []).slice(0, limit)

  return (
    <div className="space-y-2">
      {displayActivities.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8 body-secondary">
          {t("no_recent_activity")}
        </p>
      ) : (
        displayActivities.map((activity, idx) => {
          const timestamp = activity.timestamp || activity.created_at || ""
          const ipAddress = activity.ip_address || activity.ipAddress || ""
          
          return (
            <div
              key={activity.id}
              className="group flex flex-col gap-2 rounded-lg card-professional border-l-4 border-l-accent/30 p-3 shadow-elevation-1 hover:shadow-elevation-2 transition-smooth hover:bg-accent/5 dark:hover:bg-accent/10 animate-fade-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* Main row */}
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent group-hover:bg-accent/30 group-hover:scale-110 transition-smooth font-semibold">
                    {activityIcons[activity.type]}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground group-hover:text-accent transition-smooth">
                    {getActivityLabel(activity.type)}
                  </p>
                  <p className="text-xs text-muted-foreground body-secondary mt-0.5">
                    {activity.description}
                  </p>
                </div>

                {/* Time & Status */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-xs text-muted-foreground body-secondary">
                    {formatTimeAgo(timestamp)}
                  </p>
                  <p className={`text-xs font-semibold mt-1 rounded px-2 py-1 inline-block transition-smooth ${
                    activity.status === "success"
                      ? "status-success"
                      : activity.status === "pending"
                        ? "status-warning"
                        : "status-error"
                  }`}>
                    {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                  </p>
                </div>
              </div>

              {/* Expanded details */}
              {expanded && (
                <div className="ml-11 pt-2 border-t-2 border-accent/20 space-y-1.5 text-xs divider-subtle">
                  <div className="text-muted-foreground body-secondary">
                    <p><strong className="font-semibold">Time:</strong> {formatFullDateTime(timestamp)}</p>
                  </div>
                  {activity.location && (
                    <div className="flex items-center gap-2 text-muted-foreground body-secondary">
                      <Globe className="h-3 w-3 text-accent/60" />
                      <span><strong className="font-semibold">Location:</strong> {activity.location}</span>
                    </div>
                  )}
                  {activity.device && (
                    <div className="flex items-center gap-2 text-muted-foreground body-secondary">
                      <Smartphone className="h-3 w-3 text-accent/60" />
                      <span><strong className="font-semibold">Device:</strong> {activity.device}</span>
                    </div>
                  )}
                  {ipAddress && (
                    <div className="text-muted-foreground body-secondary">
                      <p><strong className="font-semibold">IP Address:</strong> {ipAddress}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
