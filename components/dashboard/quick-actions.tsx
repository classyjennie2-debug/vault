import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  const actions = [
    {
      href: "/dashboard/investments",
      icon: TrendingUp,
      label: "Invest Now",
      color: "text-primary",
    },
    {
      href: "/dashboard/deposit",
      icon: ArrowUpRight,
      label: "Deposit Funds",
      color: "text-emerald-600 dark:text-emerald-500",
    },
    {
      href: "/dashboard/withdraw",
      icon: ArrowDownRight,
      label: "Withdraw",
      color: "text-slate-600 dark:text-slate-500",
    },
  ]

  return (
    <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 animate-in fade-in duration-700">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-3 pt-2">
        {actions.map((action, idx) => {
          const Icon = action.icon
          return (
            <Button
              key={action.label}
              variant="outline"
              className="flex flex-col items-center justify-center gap-2 h-auto py-4 px-3 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-300 animate-in fade-in slide-in-from-left duration-500"
              style={{ animationDelay: `${idx * 100}ms` }}
              asChild
            >
              <Link href={action.href} className="flex flex-col items-center gap-2 w-full">
                <div className="rounded-lg">
                  <Icon className={`h-5 w-5 ${action.color} transition-colors duration-300`} />
                </div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white text-center leading-tight">
                  {action.label}
                </span>
              </Link>
            </Button>
          )
        })}
      </CardContent>
    </Card>
  )
}
