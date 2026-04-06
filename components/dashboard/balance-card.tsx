import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react"
import type { UserRow } from "@/lib/db"

export function BalanceCard({ user }: { user: UserRow }) {
  const formattedBalance = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(user.balance)

  return (
    <Card className="md:col-span-2 lg:col-span-2 card-professional border-l-4 border-l-accent/30 shadow-elevation-2 overflow-hidden hover:shadow-elevation-3 transition-smooth animate-fade-in">
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <CardTitle className="h-subsection text-sm font-medium text-muted-foreground break-words flex-1">
          Total Balance
        </CardTitle>
        <Wallet className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
      </CardHeader>
      <CardContent>
        <p className="data-value text-2xl sm:text-3xl font-bold tracking-tight text-card-foreground break-words">
          {formattedBalance}
        </p>
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm group hover:bg-accent/5 p-2 rounded-md transition-smooth">
            <ArrowUpRight className="h-3.5 w-3.5 text-accent flex-shrink-0 group-hover:scale-110 transition-smooth" />
            <span className="text-accent font-semibold">+$12,450</span>
            <span className="body-secondary text-muted-foreground">this month</span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm group hover:bg-rose-500/5 p-2 rounded-md transition-smooth">
            <ArrowDownRight className="h-3.5 w-3.5 text-destructive flex-shrink-0 group-hover:scale-110 transition-smooth" />
            <span className="text-destructive font-semibold">-$3,000</span>
            <span className="body-secondary text-muted-foreground">withdrawn</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 divider-subtle pt-4">
          <div className="group hover:bg-accent/5 p-2 rounded-md transition-smooth">
            <p className="text-xs text-muted-foreground body-secondary break-words">Invested</p>
            <p className="text-sm font-semibold text-card-foreground break-words data-value">
              $35,000
            </p>
          </div>
          <div className="group hover:bg-accent/5 p-2 rounded-md transition-smooth">
            <p className="text-xs text-muted-foreground body-secondary break-words">Returns</p>
            <p className="text-sm font-semibold text-accent break-words data-value">$4,250.75</p>
          </div>
          <div className="group hover:bg-accent/5 p-2 rounded-md transition-smooth">
            <p className="text-xs text-muted-foreground body-secondary break-words">Available</p>
            <p className="text-sm font-semibold text-card-foreground break-words data-value">
              $9,000
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
