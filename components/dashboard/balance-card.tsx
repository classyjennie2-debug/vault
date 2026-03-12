import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { currentUser } from "@/lib/mock-data"
import { ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react"

export function BalanceCard() {
  const formattedBalance = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(currentUser.balance)

  return (
    <Card className="md:col-span-2 lg:col-span-2 overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground break-words flex-1">
          Total Balance
        </CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-card-foreground break-words">
          {formattedBalance}
        </p>
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <ArrowUpRight className="h-3.5 w-3.5 text-accent flex-shrink-0" />
            <span className="text-accent font-semibold">+$12,450</span>
            <span className="text-muted-foreground">this month</span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <ArrowDownRight className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
            <span className="text-destructive font-semibold">-$3,000</span>
            <span className="text-muted-foreground">withdrawn</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border pt-4">
          <div>
            <p className="text-xs text-muted-foreground break-words">Invested</p>
            <p className="text-sm font-semibold text-card-foreground break-words">
              $35,000
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground break-words">Returns</p>
            <p className="text-sm font-semibold text-accent break-words">$4,250.75</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground break-words">Available</p>
            <p className="text-sm font-semibold text-card-foreground break-words">
              $9,000
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
