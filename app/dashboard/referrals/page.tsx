'use client'

import { useState, useEffect } from 'react'
import { ReferralDashboard } from '@/components/dashboard/referral-dashboard'
import { ReferralWithdrawModal } from '@/components/dashboard/referral-withdraw-modal'
import { Button } from '@/components/ui/button'
import { useReferralStats } from '@/hooks/use-referral'
import { Loader2 } from 'lucide-react'

export default function ReferralPage() {
  const { stats, loading, refetch } = useReferralStats()
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [key, setKey] = useState(0)

  // Re-render component when language changes
  useEffect(() => {
    const handleStorageChange = () => {
      setKey(prev => prev + 1)
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-4 md:gap-6" key={key}>
      {/* Quick Action Button */}
      {stats?.stats.canWithdraw && stats?.stats.referralBalance > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={() => setWithdrawOpen(true)}
            size="sm"
            className="gap-2 text-xs sm:text-sm"
          >
            Transfer to Main Balance
          </Button>
        </div>
      )}

      {/* Main Dashboard */}
      <ReferralDashboard />

      {/* Withdraw Modal */}
      <ReferralWithdrawModal
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        referralBalance={stats?.stats.referralBalance || 0}
        canWithdraw={stats?.stats.canWithdraw || false}
        referralsNeeded={stats?.stats.referralsNeeded || 0}
        onSuccess={() => {
          refetch()
        }}
      />
    </div>
  )
}
