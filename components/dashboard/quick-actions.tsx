import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownRight, TrendingUp, Zap } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  const actions = [
    {
      href: "/dashboard/investments",
      icon: TrendingUp,
      label: "Invest Now",
      gradient: "from-blue-600 to-cyan-600",
      bgGradient: "group-hover:from-blue-600/10 group-hover:to-cyan-600/10",
      accentClass: "text-blue-600 dark:text-blue-400",
    },
    {
      href: "/dashboard/deposit",
      icon: ArrowUpRight,
      label: "Deposit Funds",
      gradient: "from-green-600 to-emerald-600",
      bgGradient: "group-hover:from-green-600/10 group-hover:to-emerald-600/10",
      accentClass: "text-green-600 dark:text-green-400",
    },
    {
      href: "/dashboard/withdraw",
      icon: ArrowDownRight,
      label: "Withdraw",
      gradient: "from-purple-600 to-pink-600",
      bgGradient: "group-hover:from-purple-600/10 group-hover:to-pink-600/10",
      accentClass: "text-purple-600 dark:text-purple-400",
    },
  ]

  return (
    <Card className="border backdrop-blur-lg bg-gradient-to-br from-slate-50/50 to-slate-100/30 dark:from-slate-950/50 dark:to-slate-900/30 animate-in fade-in duration-700">
      <CardHeader className="border-b border-border/50 pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-normal text-muted-foreground">
          <Zap className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-6">
        {actions.map((action, idx) => {
          const Icon = action.icon
          return (
            <Button
              key={action.label}
              variant="outline"
              className={`w-full justify-start group bg-gradient-to-br ${action.bgGradient} hover:border-accent/40 transition-all duration-300 animate-in fade-in slide-in-from-left duration-500`}
              style={{ animationDelay: `${idx * 100}ms` }}
              asChild
            >
              <Link href={action.href}>
                <div className={`mr-3 p-2 rounded-lg bg-gradient-to-br ${action.gradient} group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 flex items-center justify-center`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className="flex-1 text-left font-semibold group-hover:text-accent transition-colors">
                  {action.label}
                </span>
                <Zap className="h-3 w-3 text-muted-foreground/50 group-hover:text-accent/50 group-hover:animate-pulse" />
              </Link>
            </Button>
          )
        })}
      </CardContent>
    </Card>
  )
}
