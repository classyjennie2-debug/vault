'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Copy, CheckCircle2, TrendingUp, Lock } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface ReferralStats {
  referralCode: {
    code: string
    referralLink: string
    clicksCount: number
  } | null
  stats: {
    totalReferrals: number
    totalEarned: number
    referralBalance: number
    totalWithdrawn: number
    canWithdraw: boolean
    referralsNeeded: number
  }
  referrals: any[]
}

export function ReferralDashboard() {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchReferralStats()
  }, [])

  const fetchReferralStats = async () => {
    try {
      const response = await fetch('/api/referral/stats')
      if (!response.ok) throw new Error('Failed to fetch stats')
      const data = await response.json()
      setStats(data.data)
    } catch (error) {
      console.error('Error fetching referral stats:', error)
      toast({
        title: 'Error',
        description: 'Failed to load referral statistics',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast({
      title: 'Copied!',
      description: 'Referral link copied to clipboard',
    })
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="text-muted-foreground">Loading referral data...</div>
      </div>
    )
  }

  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(stats?.stats.referralBalance || 0)

  const formattedEarned = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(stats?.stats.totalEarned || 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Referral Program</h1>
        <p className="text-muted-foreground mt-2">
          Earn 10% bonus on every deposit from your referrals ($100+)
        </p>
      </div>

      {/* Referral Code Card */}
      {stats?.referralCode && (
        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Referral Code
            </CardTitle>
            <CardDescription>
              Share this code with friends to earn commission on their deposits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 bg-background/50 p-4 rounded-lg border border-border">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">Code</div>
                <div className="text-xl font-mono font-bold">{stats.referralCode.code}</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(stats.referralCode!.code)}
                className="gap-2"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background/50 p-3 rounded-lg border border-border">
                <div className="text-xs text-muted-foreground mb-1">Full Link</div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(stats.referralCode!.referralLink)}
                  className="w-full h-auto p-0 justify-start text-left hover:bg-transparent text-xs truncate"
                >
                  {stats.referralCode.referralLink}
                </Button>
              </div>
              <div className="bg-background/50 p-3 rounded-lg border border-border">
                <div className="text-xs text-muted-foreground mb-1">Link Clicks</div>
                <div className="text-lg font-bold">{stats.referralCode.clicksCount}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Referrals */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.stats.totalReferrals || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats?.stats.canWithdraw
                ? '✓ Eligible to withdraw'
                : `${stats?.stats.referralsNeeded || 0} more needed to withdraw`}
            </p>
          </CardContent>
        </Card>

        {/* Total Earned */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formattedEarned}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Lifetime referral bonuses
            </p>
          </CardContent>
        </Card>

        {/* Referral Balance */}
        <Card className={stats?.stats.canWithdraw ? 'border-accent' : ''}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Referral Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{formattedBalance}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats?.stats.canWithdraw ? 'Ready to transfer' : 'Locked until 10 referrals'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Referrals List */}
      {stats && stats.referrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Referrals</CardTitle>
            <CardDescription>
              Showing {stats.referrals.length} active referral
              {stats.referrals.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr className="text-muted-foreground">
                    <th className="text-left py-3 px-3 font-medium">Name</th>
                    <th className="text-left py-3 px-3 font-medium">Email</th>
                    <th className="text-right py-3 px-3 font-medium">Deposit</th>
                    <th className="text-right py-3 px-3 font-medium">Bonus</th>
                    <th className="text-left py-3 px-3 font-medium">Signup Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stats.referrals.map((referral) => (
                    <tr key={referral.id} className="hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-3">{referral.name || 'N/A'}</td>
                      <td className="py-3 px-3 text-muted-foreground">{referral.email}</td>
                      <td className="py-3 px-3 text-right">
                        {referral.lastDepositAmount > 0
                          ? `$${referral.lastDepositAmount.toFixed(2)}`
                          : '-'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {referral.earnedBonus > 0 ? (
                          <span className="text-accent font-semibold">
                            +${referral.earnedBonus.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Pending</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">
                        {new Date(referral.signupDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {stats && stats.referrals.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No referrals yet</p>
            <p className="text-sm text-muted-foreground">
              Share your referral code to get started
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
