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
import {
  Users,
  Copy,
  CheckCircle2,
  TrendingUp,
  Lock,
  Share2,
  LinkIcon,
  DollarSign,
  Activity,
  Crown,
  ArrowRight,
  QrCode,
  Mail,
} from 'lucide-react'
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
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

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

  const copyToClipboard = (text: string, type: 'code' | 'link') => {
    navigator.clipboard.writeText(text)
    if (type === 'code') {
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    } else {
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
    toast({
      title: 'Copied!',
      description:
        type === 'code'
          ? 'Referral code copied to clipboard'
          : 'Referral link copied to clipboard',
    })
  }

  const shareOnTwitter = () => {
    const text = `Join me on Vault Capital! I'm earning 10% on referral deposits. Sign up with my code: ${stats?.referralCode?.code}`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)} ${encodeURIComponent(stats?.referralCode?.referralLink || '')}`
    window.open(url, '_blank')
  }

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(stats?.referralCode?.referralLink || '')}`
    window.open(url, '_blank')
  }

  const shareViaEmail = () => {
    const subject = 'Join me on Vault Capital - Earn 10% Referral Bonuses'
    const body = `Check out Vault Capital! Use my referral code ${stats?.referralCode?.code} or this link:\n${stats?.referralCode?.referralLink}\n\nEarn 10% commission on every deposit from your referrals!`
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
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

  const conversionRate =
    stats?.referralCode && 'clicksCount' in stats.referralCode && stats.referralCode.clicksCount > 0
      ? ((stats.stats.totalReferrals / (stats.referralCode.clicksCount as number)) * 100).toFixed(1)
      : '0'

  const progressPercentage = Math.min(
    ((stats?.stats.totalReferrals || 0) / 10) * 100,
    100
  )

  return (
    <div className="space-y-8">
      {/* Premium Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-purple-500/10 to-accent/20 blur-3xl" />
        <div className="relative z-10 px-6 py-12 md:py-16">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <Crown className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                    Referral Program
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Grow your earnings by sharing Vault Capital
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Referral Code Section - Premium Card */}
      {stats?.referralCode && (
        <Card className="border-2 border-accent/50 bg-gradient-to-br from-accent/5 via-background to-background overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10" />
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <LinkIcon className="h-6 w-6 text-accent" />
                  Your Referral Code
                </CardTitle>
                <CardDescription className="mt-2">
                  Share with friends to earn 10% on their deposits
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Main Code Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Code Section */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-muted-foreground">
                  REFERRAL CODE
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-accent to-purple-500 rounded-lg blur opacity-25 group-hover:opacity-40 transition" />
                  <div className="relative bg-background p-6 rounded-lg border-2 border-accent/30 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-4xl font-mono font-bold text-accent drop-shadow-lg">
                        {stats.referralCode.code}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Easy to share & remember
                      </p>
                    </div>
                    <Button
                      onClick={() => copyToClipboard(stats.referralCode!.code, 'code')}
                      size="lg"
                      variant={copiedCode ? 'default' : 'outline'}
                      className="gap-2 whitespace-nowrap"
                    >
                      {copiedCode ? (
                        <>
                          <CheckCircle2 className="h-5 w-5" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-5 w-5" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Full Link Section */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-muted-foreground">
                  DIRECT LINK
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-accent rounded-lg blur opacity-25 group-hover:opacity-40 transition" />
                  <div className="relative bg-background p-6 rounded-lg border-2 border-purple-500/30 h-full flex flex-col justify-between">
                    <p className="text-sm font-mono text-muted-foreground break-all mb-3">
                      {stats.referralCode.referralLink}
                    </p>
                    <Button
                      onClick={() => copyToClipboard(stats.referralCode!.referralLink, 'link')}
                      variant={copiedLink ? 'default' : 'outline'}
                      size="sm"
                      className="w-full gap-2"
                    >
                      {copiedLink ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy Link
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <p className="text-xs font-semibold text-muted-foreground mb-2">LINK CLICKS</p>
                <p className="text-2xl font-bold">{stats.referralCode.clicksCount}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  CONVERSION RATE
                </p>
                <p className="text-2xl font-bold text-accent">{conversionRate}%</p>
              </div>
            </div>

            {/* Sharing Buttons */}
            <div className="pt-4 border-t border-border">
              <p className="text-sm font-semibold text-muted-foreground mb-4">
                SHARE YOUR REFERRAL CODE
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  onClick={() => copyToClipboard(stats.referralCode!.code, 'code')}
                  variant="outline"
                  className="gap-2 h-auto py-3"
                >
                  <Copy className="h-4 w-4" />
                  <span className="text-xs">Copy Code</span>
                </Button>
                <Button
                  onClick={shareViaEmail}
                  variant="outline"
                  className="gap-2 h-auto py-3"
                >
                  <Mail className="h-4 w-4" />
                  <span className="text-xs">Email</span>
                </Button>
                <Button
                  onClick={shareOnTwitter}
                  variant="outline"
                  className="gap-2 h-auto py-3"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="text-xs">Twitter</span>
                </Button>
                <Button
                  onClick={shareOnLinkedIn}
                  variant="outline"
                  className="gap-2 h-auto py-3"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="text-xs">LinkedIn</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Referrals */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl" />
          <CardHeader className="pb-4 relative z-10">
            <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2 uppercase">
              <Users className="h-4 w-4 text-blue-500" />
              Active Referrals
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-3">
              <div className="text-4xl font-bold">{stats?.stats.totalReferrals || 0}</div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Milestone</span>
                  <span className="font-semibold">
                    {Math.min(stats?.stats.totalReferrals || 0, 10)}/10
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      stats?.stats.canWithdraw ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                {stats?.stats.canWithdraw
                  ? '✓ Eligible to withdraw'
                  : `${stats?.stats.referralsNeeded || 0} more needed`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total Earned */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-2xl" />
          <CardHeader className="pb-4 relative z-10">
            <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2 uppercase">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Total Earned
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-3">
              <div className="text-4xl font-bold text-green-600">{formattedEarned}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.stats.totalReferrals || 0} successful conversions
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Available Balance */}
        <Card className="relative overflow-hidden border-accent/50">
          <div className="absolute top-0 right-0 w-20 h-20 bg-accent/10 rounded-full blur-2xl" />
          <CardHeader className="pb-4 relative z-10">
            <CardTitle className="text-xs font-semibold text-accent flex items-center gap-2 uppercase">
              <DollarSign className="h-4 w-4" />
              Available
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-3">
              <div className="text-4xl font-bold text-accent">{formattedBalance}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.stats.canWithdraw
                  ? 'Ready to transfer'
                  : 'In referral pool'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total Withdrawn */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl" />
          <CardHeader className="pb-4 relative z-10">
            <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2 uppercase">
              <Activity className="h-4 w-4 text-purple-500" />
              Withdrawn
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-3">
              <div className="text-4xl font-bold">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(stats?.stats.totalWithdrawn || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Transferred to main balance
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-accent" />
            Program Overview
          </CardTitle>
          <CardDescription>
            How your referral program is performing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-muted-foreground">Commission Rate</p>
              <p className="text-3xl font-bold text-accent">10%</p>
              <p className="text-xs text-muted-foreground">Of deposits $100+</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-muted-foreground">Minimum Withdrawal</p>
              <p className="text-3xl font-bold text-accent">10</p>
              <p className="text-xs text-muted-foreground">Active referrals required</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-muted-foreground">Program Status</p>
              <p className="text-3xl font-bold text-green-600">Active</p>
              <p className="text-xs text-muted-foreground">Year-round program</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Referrals Table */}
      {stats && stats.referrals.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-accent" />
                  Your Active Referrals
                </CardTitle>
                <CardDescription className="mt-1">
                  {stats.referrals.length} person{stats.referrals.length !== 1 ? 's' : ''} have
                  joined using your referral code
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-muted-foreground">Total Volume</p>
                <p className="text-2xl font-bold text-accent">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(
                    stats.referrals.reduce((sum, r) => sum + (r.lastDepositAmount || 0), 0)
                  )}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-3 text-sm font-semibold text-muted-foreground">
                      REFERRAL
                    </th>
                    <th className="text-left py-4 px-3 text-sm font-semibold text-muted-foreground">
                      EMAIL
                    </th>
                    <th className="text-right py-4 px-3 text-sm font-semibold text-muted-foreground">
                      DEPOSIT
                    </th>
                    <th className="text-right py-4 px-3 text-sm font-semibold text-muted-foreground">
                      YOUR BONUS
                    </th>
                    <th className="text-center py-4 px-3 text-sm font-semibold text-muted-foreground">
                      STATUS
                    </th>
                    <th className="text-left py-4 px-3 text-sm font-semibold text-muted-foreground">
                      DATE
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stats.referrals.map((referral) => (
                    <tr
                      key={referral.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-4 px-3">
                        <div>
                          <p className="font-medium">{referral.name || 'User'}</p>
                          <p className="text-xs text-muted-foreground">{referral.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <p className="text-sm text-muted-foreground">{referral.email}</p>
                      </td>
                      <td className="py-4 px-3 text-right">
                        <p className="font-semibold">
                          {referral.lastDepositAmount > 0
                            ? `$${referral.lastDepositAmount.toFixed(2)}`
                            : '-'}
                        </p>
                      </td>
                      <td className="py-4 px-3 text-right">
                        {referral.earnedBonus > 0 ? (
                          <span className="inline-flex items-center gap-1 bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-semibold">
                            +${referral.earnedBonus.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">Pending</span>
                        )}
                      </td>
                      <td className="py-4 px-3 text-center">
                        {referral.earnedBonus > 0 ? (
                          <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-600 px-3 py-1 rounded-full text-xs font-semibold">
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-yellow-500/10 text-yellow-600 px-3 py-1 rounded-full text-xs font-semibold">
                            <Activity className="h-3 w-3" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-3 text-sm text-muted-foreground">
                        {new Date(referral.signupDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State - Premium */}
      {stats && stats.referrals.length === 0 && (
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-purple-500/5" />
          <CardContent className="relative z-10 pt-12 pb-12 text-center">
            <div className="inline-flex h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Ready to Start Earning?</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Share your referral code with friends and earn 10% commission on their deposits.
              Your first referral could be just a click away!
            </p>
            <Button
              onClick={() => copyToClipboard(stats?.referralCode?.code || '', 'code')}
              size="lg"
              className="gap-2"
            >
              <Copy className="h-5 w-5" />
              Copy Your Code & Share
              <ArrowRight className="h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* How It Works Section */}
      <Card className="bg-gradient-to-br from-muted/50 to-muted/25">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-accent" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-accent/20 text-accent font-bold text-sm">
                1
              </div>
              <h4 className="font-semibold">Share Your Code</h4>
              <p className="text-sm text-muted-foreground">
                Copy and share your unique referral code {stats?.referralCode?.code} with
                friends
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-accent/20 text-accent font-bold text-sm">
                2
              </div>
              <h4 className="font-semibold">They Register</h4>
              <p className="text-sm text-muted-foreground">
                Friends sign up with your code and make a deposit of $100 or more
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-accent/20 text-accent font-bold text-sm">
                3
              </div>
              <h4 className="font-semibold">Earn 10%</h4>
              <p className="text-sm text-muted-foreground">
                Automatically earn 10% commission on every deposit they make
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
