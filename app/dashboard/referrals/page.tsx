'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useReferralStats } from '@/hooks/use-referral'
import { useI18n } from '@/hooks/use-i18n'
import { ReferralWithdrawModal } from '@/components/dashboard/referral-withdraw-modal'
import {
  Users,
  Copy,
  Share2,
  TrendingUp,
  DollarSign,
  CheckCircle2,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function ReferralPage() {
  const { t } = useI18n('referral')
  const { stats, loading, refetch } = useReferralStats()
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [key, setKey] = useState(0)

  useEffect(() => {
    const handleStorageChange = () => {
      setKey((prev) => prev + 1)
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const copyToClipboard = async (text: string, isLink: boolean = false) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        if (isLink) {
          setCopiedLink(true)
          setTimeout(() => setCopiedLink(false), 2000)
        } else {
          setCopiedCode(true)
          setTimeout(() => setCopiedCode(false), 2000)
        }
        toast({
          title: t('copiedCode'),
          description: isLink ? 'Link copied to clipboard' : 'Code copied to clipboard',
        })
      }
    } catch (error) {
      console.error('Copy error:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
          <p className="text-muted-foreground">{t('loading', 'Loading...')}</p>
        </div>
      </div>
    )
  }

  const referralCode = stats?.referralCode?.code || '—'
  const referralLink = stats?.referralCode?.referralLink || '—'
  const totalReferrals = stats?.stats.totalReferrals ?? 0
  const totalEarned = stats?.stats.totalEarned ?? 0
  const referralBalance = stats?.stats.referralBalance ?? 0
  const clicksCount = stats?.referralCode?.clicksCount ?? 0

  return (
    <div className="w-full space-y-6" key={key}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {t('my_referrals', 'My Referrals')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t(
              'description',
              'Manage your referral program and earn commissions'
            )}
          </p>
        </div>

        {referralBalance > 0 && stats?.stats.canWithdraw && (
          <Button
            onClick={() => setWithdrawOpen(true)}
            size="sm"
            className="gap-2 w-full sm:w-auto"
          >
            <DollarSign className="h-4 w-4" />
            {t('withdraw', 'Withdraw Balance')}
          </Button>
        )}
      </div>

      {/* Referral Code Card - Full Width on Mobile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            {t('shareYourCode', 'Share Your Referral')}
          </CardTitle>
          <CardDescription>
            {t(
              'inviteDescription',
              'Share your code with friends and earn commissions'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Referral Code Section */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground">
              {t('referralCode', 'Your Referral Code')}
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-3 rounded-lg border border-border bg-secondary/50 px-4 py-3">
                <code className="font-mono font-semibold text-sm sm:text-base text-foreground break-all">
                  {referralCode}
                </code>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(referralCode, false)}
                className="gap-2 sm:w-auto w-full"
              >
                <Copy className="h-4 w-4" />
                {copiedCode ? t('copiedCode', 'Copied') : t('copyCode', 'Copy')}
              </Button>
            </div>
          </div>

          {/* Referral Link Section */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground">
              {t('referralLink', 'Your Referral Link')}
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-3 rounded-lg border border-border bg-secondary/50 px-4 py-3 overflow-hidden">
                <span className="text-xs sm:text-sm text-foreground truncate">
                  {referralLink}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(referralLink, true)}
                className="gap-2 sm:w-auto w-full"
              >
                <Share2 className="h-4 w-4" />
                {copiedLink ? t('copiedCode', 'Copied') : t('share', 'Share')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label={t('activeReferrals', 'Active Referrals')}
          value={totalReferrals}
          icon={<Users className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />}
        />
        <StatCard
          label={t('totalEarned', 'Total Earned')}
          value={`$${totalEarned.toFixed(2)}`}
          icon={<DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />}
        />
        <StatCard
          label={t('availableBalance', 'Available Balance')}
          value={`$${referralBalance.toFixed(2)}`}
          icon={<TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
        />
        <StatCard
          label={t('linkClicks', 'Link Clicks')}
          value={clicksCount}
          icon={<CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
        />
      </div>

      {/* Commission Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            {t('howItWorks', 'How Referrals Work')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900 flex-shrink-0">
                <span className="text-sm font-semibold text-cyan-600 dark:text-cyan-400">
                  1
                </span>
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {t('step1Title', 'Share Your Link')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t(
                    'step1Desc',
                    'Share your unique referral link with friends and colleagues'
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900 flex-shrink-0">
                <span className="text-sm font-semibold text-cyan-600 dark:text-cyan-400">
                  2
                </span>
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {t('step2Title', 'They Sign Up')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t(
                    'step2Desc',
                    'When they sign up using your code, they become your referral'
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900 flex-shrink-0">
                <span className="text-sm font-semibold text-cyan-600 dark:text-cyan-400">
                  3
                </span>
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {t('step3Title', 'Earn Commission')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t(
                    'step3Desc',
                    'Earn 10% commission on their investments - recurring on profits'
                  )}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Withdraw Modal */}
      <ReferralWithdrawModal
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        referralBalance={referralBalance}
        canWithdraw={stats?.stats.canWithdraw || false}
        referralsNeeded={stats?.stats.referralsNeeded || 0}
        onSuccess={() => {
          refetch()
        }}
      />
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              {label}
            </p>
            {icon}
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
