"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useI18n } from "@/hooks/use-i18n"

export function QuickActions() {
  const { t } = useI18n("dashboardmain")
  const actions = [
    {
      href: "/dashboard/investments",
      icon: TrendingUp,
      label: t("invest_now"),
      color: "text-primary",
    },
    {
      href: "/dashboard/deposit",
      icon: ArrowUpRight,
      label: t("deposit_funds"),
      color: "text-emerald-600 dark:text-emerald-500",
    },
    {
      href: "/dashboard/withdraw",
      icon: ArrowDownRight,
      label: t("withdraw_funds"),
      color: "text-slate-600 dark:text-slate-500",
    },
  ]

  return (
    <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 animate-in fade-in duration-700">
      <CardHeader className="pb-2 sm:pb-3 lg:pb-4">
        <CardTitle className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
          {t("quick_actions")}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-2 sm:gap-3 pt-1 sm:pt-2 lg:pt-2">
        {actions.map((action, idx) => {
          const Icon = action.icon
          return (
            <Button
              key={action.label}
              variant="outline"
              className="flex flex-col items-center justify-center gap-1 sm:gap-2 h-auto py-3 sm:py-4 lg:py-5 px-2 sm:px-3 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-300 animate-in fade-in slide-in-from-left duration-500 min-h-[48px] sm:min-h-[56px]"
              style={{ animationDelay: `${idx * 100}ms` }}
              asChild
            >
              <Link href={action.href} className="flex flex-col items-center gap-1 sm:gap-2 w-full">
                <div className="rounded-lg">
                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${action.color} transition-colors duration-300`} />
                </div>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-900 dark:text-white text-center leading-tight line-clamp-2">
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
