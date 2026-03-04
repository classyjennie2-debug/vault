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
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link href="/dashboard/plans">
            <TrendingUp className="mr-2 h-4 w-4 text-accent" />
            Invest Now
          </Link>
        </Button>
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link href="/dashboard/deposit">
            <ArrowUpRight className="mr-2 h-4 w-4 text-accent" />
            Deposit Funds
          </Link>
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <ArrowDownRight className="mr-2 h-4 w-4 text-muted-foreground" />
          Withdraw
        </Button>
      </CardContent>
    </Card>
  )
}
