"use client"

import { useState } from "react"
import { Copy, Check, Loader2, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CoinIcon } from "@/components/crypto/coin-icon"
import { Badge } from "@/components/ui/badge"
import type { CoinType, NetworkType, WalletAddress } from "@/lib/types"

interface DepositModalProps {
  open: boolean
  onClose: () => void
  coin: CoinType | null
  network: NetworkType | null
  usdAmount: string
  coinAmount: string
  wallet: WalletAddress | null
  onConfirm: () => Promise<void>
  isLoading?: boolean
}

export function DepositModal({
  open,
  onClose,
  coin,
  network,
  usdAmount,
  coinAmount,
  wallet,
  onConfirm,
  isLoading = false,
}: DepositModalProps) {
  const [copiedAddress, setCopiedAddress] = useState(false)
  const [copiedAmount, setCopiedAmount] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCopyAddress = async () => {
    if (!wallet) return
    await navigator.clipboard.writeText(wallet.address)
    setCopiedAddress(true)
    setTimeout(() => setCopiedAddress(false), 2000)
  }

  const handleCopyAmount = async () => {
    await navigator.clipboard.writeText(coinAmount)
    setCopiedAmount(true)
    setTimeout(() => setCopiedAmount(false), 2000)
  }

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      await onConfirm()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-4 sm:p-6">
        <DialogHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg sm:text-xl break-words">Confirm Deposit</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm mt-1">
                Send the exact amount to complete your deposit
              </DialogDescription>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg hover:bg-secondary p-1.5 transition-colors flex-shrink-0"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-6">
          {/* Deposit Summary */}
          <div className="rounded-lg sm:rounded-xl bg-gradient-to-br from-secondary/50 to-secondary/30 p-4 sm:p-6 border border-secondary">
            <div className="space-y-3 sm:space-y-4">
              {/* USD Amount */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  You're Depositing
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1 break-words">
                  ${usdAmount}
                </p>
              </div>

              {/* Coin Amount */}
              <div className="pt-3 sm:pt-4 border-t border-border/50">
                <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    You'll Send
                  </p>
                  <Badge variant="secondary" className="flex items-center gap-1 text-xs whitespace-nowrap">
                    <CoinIcon coin={coin} size={12} />
                    <span className="font-semibold">{coin}</span>
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-2 bg-card/50 rounded-lg p-2 sm:p-3 border border-border">
                  <p className="text-sm sm:text-lg font-semibold text-foreground font-mono break-all min-w-0">
                    {coinAmount}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyAmount}
                    className="h-8 w-8 p-0 flex-shrink-0"
                  >
                    {copiedAmount ? (
                      <Check className="h-4 w-4 text-accent" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Address Section */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs sm:text-sm font-semibold text-foreground">Wallet Address</p>
              <p className="text-xs text-muted-foreground whitespace-nowrap">
                {network} Network
              </p>
            </div>
            <div className="flex items-start gap-2 bg-muted/40 rounded-lg p-2 sm:p-3 border border-border min-h-[44px] sm:min-h-auto">
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs sm:text-sm break-all text-foreground/80 word-break">
                  {wallet?.address}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyAddress}
                className="h-8 w-8 p-0 flex-shrink-0"
                title="Copy address"
              >
                {copiedAddress ? (
                  <Check className="h-4 w-4 text-accent" />
                ) : (
                  <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                )}
              </Button>
            </div>
          </div>

          {/* Warning */}
          <div className="rounded-lg bg-warning/10 border border-warning/30 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-warning font-medium leading-relaxed break-words">
              ⚠️ Send exactly <span className="font-mono font-bold">{coinAmount}</span> {coin}. Sending different amounts or wrong network may result in loss of funds.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 sm:pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting || isLoading}
              className="flex-1 h-10 sm:h-11 text-sm sm:text-base"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isSubmitting || isLoading}
              className="flex-1 h-10 sm:h-11 text-sm sm:text-base bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin flex-shrink-0" />
                  <span className="truncate">Processing...</span>
                </>
              ) : (
                <span className="truncate">I've Sent It</span>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
