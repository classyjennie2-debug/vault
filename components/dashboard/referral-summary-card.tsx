'use client'

import Link from 'next/link'
import { Users, TrendingUp, Lock, ArrowRight } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useReferralStats } from '@/hooks/use-referral'
import { Skeleton } from '@/components/ui/skeleton'

export function ReferralSummaryCard() {
  const { stats, loading } = useReferralStats()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-full mb-3" />
          <Skeleton className="h-4 w-half" />
        </CardContent>
      </Card>
    )
  }

  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(stats?.stats.referralBalance || 0)

  return (
    <Card className="md:col-span-2 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Referral Program
            </CardTitle>
            <CardDescription>Earn on referrals</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Active Referrals</p>
            <p className="text-2xl font-bold">{stats?.stats.totalReferrals || 0}</p>
            <p className="text-xs text-muted-foreground">
              {stats?.stats.canWithdraw
                ? '✓ Can withdraw'
                : `${stats?.stats.referralsNeeded || 0} more needed`}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Available Balance</p>
            <p className="text-2xl font-bold text-accent">{formattedBalance}</p>
            {stats?.stats.canWithdraw && stats?.stats.referralBalance > 0 && (
              <p className="text-xs text-accent font-semibold">Ready to transfer</p>
            )}
          </div>
        </div>

        <Link href="/dashboard/referrals">
          <Button variant="outline" size="sm" className="w-full gap-2">
            View Details
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
