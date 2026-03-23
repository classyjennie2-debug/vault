'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Copy, CheckCircle2, TrendingUp, DollarSign, Share2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { useI18n } from '@/hooks/use-i18n'

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
  const { t } = useI18n('referral')

  useEffect(() => {
    fetchReferralStats()
  }, [])

  const fetchReferralStats = async () => {
    try {
      const response = await fetch('/api/referral/stats')
      if (!response.ok) throw new Error('Failed to fetch stats')
      const data = await response.json()
      setStats(data.data)
      if (!data.data?.referralCode) {
        console.warn('[REFERRAL-COMPONENT] No referral code in response!', data.data)
      }
    } catch (error) {
      console.error('[REFERRAL-COMPONENT] Error fetching referral stats:', error)
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
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard
          .writeText(text)
          .then(() => {
            setCopiedCode(true)
            setTimeout(() => setCopiedCode(false), 2000)
            toast({
              title: 'Copied!',
              description: t('copiedCode'),
            })
          })
          .catch((err) => {
            console.error('Clipboard write error:', err)
            copyUsingTextarea(text)
          })
      } else {
        copyUsingTextarea(text)
      }
    } catch (error) {
      console.error('Copy error:', error)
      copyUsingTextarea(text)
    }
  }

  const copyUsingTextarea = (text: string) => {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand('copy')
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
      toast({
        title: 'Copied!',
        description: t('copiedCode'),
      })
    } catch (err) {
      console.error('Copy command failed:', err)
      toast({
        title: 'Error',
        description: t('copyCode'),
      })
    } finally {
      document.body.removeChild(textarea)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        {t('loading')}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        {t('noData', 'No referral data available')}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-accent" />
              {t('title')}
            </CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('code')}</p>
                <p className="font-mono font-semibold">{stats?.referralCode?.code || '—'}</p>
              </div>
              {stats?.referralCode?.code && (
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(stats.referralCode!.code)}>
                  <Copy className="h-4 w-4 mr-2" />
                  {copiedCode ? t('copiedCode') : t('copyCode')}
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t('referralLink')}</p>
              <div className="flex items-center justify-between rounded-md border px-3 py-2">
                <span className="text-sm truncate">{stats?.referralCode?.referralLink || '—'}</span>
                {stats?.referralCode?.referralLink && (
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(stats.referralCode!.referralLink)}>
                    <Share2 className="h-4 w-4 mr-1" />
                    {t('shareWithFriends')}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              {t('activeReferrals')}
            </CardTitle>
            <CardDescription>{t('earnCommission')}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <StatCard label={t('activeReferrals')} value={stats?.stats.totalReferrals ?? 0} icon={<Users className="h-5 w-5 text-accent" />} />
            <StatCard label={t('totalEarned')} value={`$${(stats?.stats.totalEarned ?? 0).toFixed(2)}`} icon={<DollarSign className="h-5 w-5 text-accent" />} />
            <StatCard label={t('availableBalance')} value={`$${(stats?.stats.referralBalance ?? 0).toFixed(2)}`} icon={<DollarSign className="h-5 w-5 text-accent" />} />
            <StatCard label={t('linkClicks')} value={stats?.referralCode?.clicksCount ?? 0} icon={<Share2 className="h-5 w-5 text-accent" />} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-accent" />
            {t('inviteFriends')}
          </CardTitle>
          <CardDescription>{t('minimum')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard label={t('signups')} value={stats?.stats.totalReferrals ?? 0} icon={<Users className="h-5 w-5 text-accent" />} />
            <StatCard label={t('totalEarned')} value={`$${(stats?.stats.totalEarned ?? 0).toFixed(2)}`} icon={<DollarSign className="h-5 w-5 text-accent" />} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-3 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  )
}
