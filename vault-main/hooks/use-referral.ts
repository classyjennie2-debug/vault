import { useState, useEffect, useCallback } from 'react'
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

export function useReferralStats() {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/referral/stats')
      if (!response.ok) {
        throw new Error('Failed to fetch referral statistics')
      }
      
      const data = await response.json()
      setStats(data.data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error loading referral data'
      setError(message)
      console.error('Error fetching referral stats:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const refetch = useCallback(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, error, refetch }
}

// Hook for manually refreshing referral stats after actions
export function useRefreshReferralStats() {
  const [loading, setLoading] = useState(false)
  
  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/referral/stats', { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to refresh')
      return await response.json()
    } finally {
      setLoading(false)
    }
  }, [])
  
  return { refresh, loading }
}

// Hook to generate or get referral code
export function useReferralCode() {
  const [code, setCode] = useState<string | null>(null)
  const [link, setLink] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateCode = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/referral/generate-code', { method: 'POST' })
      if (!response.ok) {
        throw new Error('Failed to generate referral code')
      }
      
      const data = await response.json()
      setCode(data.referralCode)
      setLink(data.referralLink)
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error generating code'
      setError(message)
      console.error('Error generating referral code:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    generateCode()
  }, [generateCode])

  return { code, link, loading, error, generateCode }
}

// Hook for referral withdrawal
export function useReferralWithdraw() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const withdraw = useCallback(async (amount: number) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/referral/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to withdraw')
      }
      
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error processing withdrawal'
      setError(message)
      console.error('Error withdrawing referral balance:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { withdraw, loading, error }
}
