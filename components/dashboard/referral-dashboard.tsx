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
import { Users, Copy, CheckCircle2, TrendingUp, DollarSign, Share2 } from 'lucide-react'
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
  const [language, setLanguage] = useState<string>('en')

  // Simple translation helper for App Router
  const translations: Record<string, Record<string, string>> = {
    en: {
      loading: 'Loading referral data...',
      title: 'Referral Program',
      description: 'Earn 10% commission on every deposit from your referrals ($100+)',
      code: 'Referral Code',
      copyCode: 'Copy Code',
      copiedCode: 'Copied to Clipboard',
      shareWithFriends: 'Share with Friends',
      referralLink: 'Referral Link (includes your code)',
      activeReferrals: 'Active Referrals',
      totalEarned: 'Total Earned',
      availableBalance: 'Available Balance',
      linkClicks: 'Link Clicks',
      signups: 'Signups',
      inviteFriends: 'Invite friends and earn',
    },
    es: {
      loading: 'Cargando datos de referidos...',
      title: 'Programa de Referidos',
      description: 'Gana 10% de comisión en cada depósito de tus referidos ($100+)',
      code: 'Código de Referido',
      copyCode: 'Copiar Código',
      copiedCode: 'Copiado al Portapapeles',
      shareWithFriends: 'Compartir con Amigos',
      referralLink: 'Enlace de Referido (incluye tu código)',
      activeReferrals: 'Referidos Activos',
      totalEarned: 'Total Ganado',
      availableBalance: 'Saldo Disponible',
      linkClicks: 'Clics en Enlace',
      signups: 'Registros',
      inviteFriends: 'Invita amigos y gana',
    },
  }

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key
  }

  useEffect(() => {
    // Load language from localStorage on mount
    const savedLanguage = localStorage.getItem('language') || 'en'
    setLanguage(savedLanguage)
    
    // Listen for storage changes (for multi-tab language switching)
    const handleStorageChange = () => {
      const newLanguage = localStorage.getItem('language') || 'en'
      setLanguage(newLanguage)
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  useEffect(() => {
    fetchReferralStats()
  }, [])

  const fetchReferralStats = async () => {
    try {
      console.log('[REFERRAL-COMPONENT] Fetching referral stats...')
      const response = await fetch('/api/referral/stats')
      if (!response.ok) throw new Error('Failed to fetch stats')
      const data = await response.json()
      console.log('[REFERRAL-COMPONENT] Received stats:', data.data)
      setStats(data.data)
      if (!data.data?.referralCode) {
        console.warn('[REFERRAL-COMPONENT] ⚠️ No referral code in response! Data:', data.data)
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
      // Check if clipboard API is available
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
          setCopiedCode(true)
          setTimeout(() => setCopiedCode(false), 2000)
          toast({
            title: '✓ Copied!',
            description: 'Referral code copied to clipboard',
          })
        }).catch((err) => {
          console.error('Clipboard write error:', err)
          // Fallback to textarea method
          copyUsingTextarea(text)
        })
      } else {
        // Fallback for non-secure contexts or older browsers
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
        title: '✓ Copied!',
        description: 'Referral code copied to clipboard',
      })
    } catch (err) {
      console.error('Fallback copy error:', err)
      toast({
        title: 'Copy Failed',
        description: 'Please try again or share manually',
        variant: 'destructive',
      })
    } finally {
      document.body.removeChild(textarea)
    }
  }

  const handleNativeShare = async () => {
    try {
      if (!stats?.referralCode) {
        toast({
          title: 'Error',
          description: 'Referral code not available',
          variant: 'destructive',
        })
        return
      }

      const referralUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${stats.referralCode.code}`
      
      // Check if native share is available
      if (navigator.share && window.isSecureContext) {
        try {
          await navigator.share({
            title: 'Join Vault Capital',
            text: `Join me on Vault Capital and earn 10% on referral deposits. Use my code: ${stats.referralCode.code}`,
            url: referralUrl,
          })
          toast({
            title: '✓ Shared!',
            description: 'Referral link shared successfully',
          })
        } catch (err: any) {
          // User dismissed the share dialog - this is normal
          if (err.name !== 'AbortError') {
            console.error('Share error:', err)
          }
        }
      } else {
        // Fallback: copy the link
        copyUsingTextarea(referralUrl)
      }
    } catch (error) {
      console.error('Share handler error:', error)
      toast({
        title: 'Error',
        description: 'Failed to share referral link',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="text-muted-foreground">{t('loading')}</div>
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

  const progressPercentage = Math.min(
    ((stats?.stats.totalReferrals || 0) / 10) * 100,
    100
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('description')}
        </p>
      </div>

      {/* Referral Code Section - Clean and Simple */}
      {stats?.referralCode && (
        <Card>
          <CardHeader>
            <CardTitle>{t('code')}</CardTitle>
            <CardDescription>
              {t('inviteFriends')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Code Display - Large and Prominent */}
            <div className="bg-muted p-6 rounded-lg border border-border">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">{t('code')}</p>
                <p className="text-5xl font-bold font-mono tracking-wide mb-4">
                  {stats.referralCode.code}
                </p>
                <Button
                  onClick={() => copyToClipboard(stats.referralCode!.code)}
                  size="lg"
                  className="gap-2 w-full"
                >
                  {copiedCode ? (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      {t('copiedCode')}
                    </>
                  ) : (
                    <>
                      <Copy className="h-5 w-5" />
                      {t('copyCode')}
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Referral Link & Share */}
            <div className="space-y-3">
              <div className="p-4 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">{t('referralLink')}</p>
                <p className="text-sm font-mono break-all text-muted-foreground mb-3">
                  {`${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${stats.referralCode.code}`}
                </p>
              </div>

              {/* Share Button - Opens Native Share or Copies Link */}
              <Button
                onClick={handleNativeShare}
                variant="outline"
                size="lg"
                className="w-full gap-2"
              >
                <Share2 className="h-5 w-5" />
                {t('shareWithFriends')}
              </Button>
            </div>

            {/* Link Performance */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-border rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">{t('linkClicks')}</p>
                <p className="text-2xl font-bold">{stats.referralCode.clicksCount}</p>
              </div>
              <div className="p-4 border border-border rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">{t('signups')}</p>
                <p className="text-2xl font-bold">{stats?.stats.totalReferrals || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid - Simple */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Referrals */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t('activeReferrals')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-4xl font-bold">{stats?.stats.totalReferrals || 0}</div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">To Withdraw</span>
                  <span className="font-semibold">
                    {Math.min(stats?.stats.totalReferrals || 0, 10)}/10
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      stats?.stats.canWithdraw ? 'bg-green-500' : 'bg-black'
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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t('totalEarned')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-4xl font-bold">{formattedEarned}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.stats.totalReferrals || 0} conversions
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Available Balance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {t('availableBalance')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-4xl font-bold">{formattedBalance}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.stats.canWithdraw ? 'Ready to transfer' : 'Locked'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Program Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-black/10 text-black font-bold text-sm">
                1
              </div>
              <h4 className="font-semibold">Share Your Code</h4>
              <p className="text-sm text-muted-foreground">
                Copy your referral code and share it with friends
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-black/10 text-black font-bold text-sm">
                2
              </div>
              <h4 className="font-semibold">They Register</h4>
              <p className="text-sm text-muted-foreground">
                Friends sign up using your code and deposit $100+
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-black/10 text-black font-bold text-sm">
                3
              </div>
              <h4 className="font-semibold">Earn 10%</h4>
              <p className="text-sm text-muted-foreground">
                Automatically earn 10% commission on their deposits
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referrals Table */}
      {stats && stats.referrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Referrals
            </CardTitle>
            <CardDescription>
              {stats.referrals.length} person{stats.referrals.length !== 1 ? 's' : ''} have joined
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr className="text-muted-foreground">
                    <th className="text-left py-3 px-3 font-medium">Name</th>
                    <th className="text-left py-3 px-3 font-medium">Email</th>
                    <th className="text-right py-3 px-3 font-medium">Your Bonus</th>
                    <th className="text-left py-3 px-3 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stats.referrals.map((referral) => (
                    <tr key={referral.id} className="hover:bg-muted/50">
                      <td className="py-3 px-3">{referral.name || 'User'}</td>
                      <td className="py-3 px-3 text-muted-foreground">{referral.email}</td>
                      <td className="py-3 px-3 text-right font-semibold">
                        {referral.earnedBonus > 0 ? `+$${referral.earnedBonus.toFixed(2)}` : '-'}
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
          <CardContent className="pt-12 pb-12 text-center">
            <Users className="h-8 w-8 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Referrals Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start sharing your referral code to earn commissions
            </p>
            <Button onClick={() => copyToClipboard(stats?.referralCode?.code || '')} className="gap-2">
              <Copy className="h-4 w-4" />
              Copy Code & Share
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
