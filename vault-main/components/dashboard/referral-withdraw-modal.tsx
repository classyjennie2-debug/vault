'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ReferralWithdrawModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  referralBalance: number
  canWithdraw: boolean
  referralsNeeded: number
  onSuccess?: () => void
}

export function ReferralWithdrawModal({
  open,
  onOpenChange,
  referralBalance,
  canWithdraw,
  referralsNeeded,
  onSuccess,
}: ReferralWithdrawModalProps) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const transferAmount = parseFloat(amount)
    if (!transferAmount || transferAmount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      })
      return
    }

    if (transferAmount > referralBalance) {
      toast({
        title: 'Insufficient balance',
        description: 'You cannot transfer more than your referral balance',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/referral/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: transferAmount }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to transfer balance')
      }

      setSuccess(true)
      toast({
        title: 'Success!',
        description: `Successfully transferred $${transferAmount.toFixed(2)} to your main balance`,
      })

      setTimeout(() => {
        setAmount('')
        setSuccess(false)
        onOpenChange(false)
        onSuccess?.()
      }, 1500)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to transfer balance',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(referralBalance)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transfer Referral Balance</DialogTitle>
          <DialogDescription>
            Transfer your referral earnings to your main balance for withdrawal
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-accent mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Transfer Completed!</h3>
            <p className="text-sm text-muted-foreground">
              Your balance has been transferred successfully
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!canWithdraw && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You need {referralsNeeded} more active referrals before you can withdraw. You unlock the ability to transfer at 10 referrals.
                </AlertDescription>
              </Alert>
            )}

            <div>
              <Label>Referral Balance Available</Label>
              <div className="mt-1 p-3 bg-muted rounded-lg">
                <p className="text-lg font-semibold">{formattedBalance}</p>
              </div>
            </div>

            <div>
              <Label htmlFor="amount">Amount to Transfer</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0.01"
                max={referralBalance}
                step="0.01"
                disabled={!canWithdraw || loading}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Available: {formattedBalance}
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!canWithdraw || loading || !amount}
              >
                {loading ? 'Processing...' : 'Transfer Now'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
