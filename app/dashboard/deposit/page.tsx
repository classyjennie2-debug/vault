"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  type CoinType,
  type NetworkType,
  type WalletAddress,
  coinNetworks,
  coinDetails,
} from "@/lib/types"
import { CoinIcon } from "@/components/crypto/coin-icon"
import { DepositModal } from "@/components/dashboard/deposit-modal"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { convertUSDToCoin, formatCoinAmount, getCryptoPriceInUSD } from "@/lib/crypto-prices"

const coins: CoinType[] = ["USDT", "BTC", "ETH", "BNB", "TRX", "SOL"]

const networkLabels: Partial<Record<string, string>> = {
  BEP20: "BEP20 (BSC)",
  BTC: "BTC Network",
  SOL: "SOL Network",
  USDT0: "USDT0",
}

export default function DepositPage() {
  const [selectedCoin, setSelectedCoin] = useState<CoinType | null>(null)
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType | null>(null)
  const [amount, setAmount] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [assignedWallet, setAssignedWallet] = useState<WalletAddress | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [availableWallets, setAvailableWallets] = useState<WalletAddress[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [coinAmount, setCoinAmount] = useState<string>("")
  const [cryptoPrice, setCryptoPrice] = useState<number | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const res = await fetch("/api/wallet-addresses")
        if (res.ok) {
          const data = await res.json()
          setAvailableWallets(data)
        }
      } catch (error) {
        console.error("Failed to fetch wallets:", error)
      }
    }
    fetchWallets()
  }, [])

  // Fetch crypto price when coin is selected
  useEffect(() => {
    if (!selectedCoin) {
      setCryptoPrice(null)
      setCoinAmount("")
      return
    }

    const fetchPrice = async () => {
      try {
        const price = await getCryptoPriceInUSD(selectedCoin)
        setCryptoPrice(price)
      } catch (error) {
        console.error("Failed to fetch crypto price:", error)
        setCryptoPrice(null)
      }
    }

    fetchPrice()
  }, [selectedCoin])

  // Calculate coin amount when amount changes
  useEffect(() => {
    if (!selectedCoin || !amount || parseFloat(amount) <= 0 || !cryptoPrice) {
      setCoinAmount("")
      return
    }

    const calculateAmount = async () => {
      setIsCalculating(true)
      try {
        const coinAmt = await convertUSDToCoin(parseFloat(amount), selectedCoin)
        const formatted = formatCoinAmount(coinAmt, selectedCoin)
        setCoinAmount(formatted)
      } catch (error) {
        console.error("Failed to calculate coin amount:", error)
        setCoinAmount("")
      } finally {
        setIsCalculating(false)
      }
    }

    calculateAmount()
  }, [amount, selectedCoin, cryptoPrice])

  const handleCoinSelect = (coin: CoinType) => {
    setSelectedCoin(coin)
    setSelectedNetwork(null)
    setAssignedWallet(null)
    setCoinAmount("")
    setError(null)
  }

  const handleNetworkSelect = (network: NetworkType) => {
    setSelectedNetwork(network)
    setAssignedWallet(null)
    setError(null)
  }

  const handleGenerateAddress = useCallback(() => {
    if (!selectedCoin || !selectedNetwork || !amount || parseFloat(amount) <= 0 || !coinAmount) {
      setError("Please select coin, network, and enter a valid amount.")
      return
    }

    setIsGenerating(true)
    setError(null)

    // Find available wallet
    const available = availableWallets.find(
      (w) => w.coin === selectedCoin && w.network === selectedNetwork
    )

    if (!available) {
      setError(`No available ${selectedCoin} addresses on ${selectedNetwork}. Please try a different network or contact support.`)
      setIsGenerating(false)
      return
    }

    // Assign the wallet and show modal
    setAssignedWallet(available)
    setShowModal(true)
    setIsGenerating(false)
  }, [selectedCoin, selectedNetwork, amount, coinAmount, availableWallets])

  const handleSubmitDeposit = async () => {
    if (!assignedWallet || !amount) return

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/deposits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coin: selectedCoin,
          network: selectedNetwork,
          amount: parseFloat(amount),
          coinAmount: coinAmount,
          walletId: assignedWallet.id,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to submit deposit")
      
      // Reset form and close modal
      setShowModal(false)
      setAmount("")
      setCoinAmount("")
      setAssignedWallet(null)
      setSelectedCoin(null)
      setSelectedNetwork(null)
      
      router.push("/dashboard")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to dashboard</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Deposit Crypto
          </h1>
          <p className="text-sm text-muted-foreground">
            Select a coin, network, and amount to generate your deposit address.
          </p>
        </div>
      </div>

      {/* Step 1 - Select Coin */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">
            <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              1
            </span>
            Select Coin
          </CardTitle>
          <CardDescription>
            Choose the cryptocurrency you want to deposit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {coins.map((coin) => {
              const details = coinDetails[coin]
              const isSelected = selectedCoin === coin
              return (
                <button
                  key={coin}
                  onClick={() => handleCoinSelect(coin)}
                  className={`flex flex-col items-center gap-2.5 rounded-xl border-2 p-4 transition-all ${
                    isSelected
                      ? "border-accent bg-accent/5 shadow-sm"
                      : "border-border bg-card hover:border-muted-foreground/30 hover:bg-secondary/50"
                  }`}
                >
                  <CoinIcon coin={coin} size={36} />
                  <div className="text-center">
                    <p
                      className={`text-sm font-semibold ${isSelected ? "text-foreground" : "text-card-foreground"}`}
                    >
                      {coin}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {details.name}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step 2 - Select Network */}
      {selectedCoin && (
        <Card className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                2
              </span>
              Select Network
            </CardTitle>
            <CardDescription>
              Choose the blockchain network for your {selectedCoin} deposit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {coinNetworks[selectedCoin].map((network) => {
                const isSelected = selectedNetwork === network
                return (
                  <button
                    key={network}
                    onClick={() => handleNetworkSelect(network)}
                    className={`flex items-center gap-2 rounded-lg border-2 px-5 py-3 text-sm font-medium transition-all ${
                      isSelected
                        ? "border-accent bg-accent/5 text-foreground shadow-sm"
                        : "border-border bg-card text-card-foreground hover:border-muted-foreground/30 hover:bg-secondary/50"
                    }`}
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${isSelected ? "bg-accent" : "bg-muted-foreground/30"}`}
                    />
                    {networkLabels[network] || network}
                  </button>
                )
              })}
            </div>
            {selectedNetwork && (
              <div className="mt-4 rounded-lg bg-secondary/50 p-3">
                <p className="text-xs text-muted-foreground">
                  Make sure you're sending{" "}
                  <span className="font-medium text-foreground">
                    {selectedCoin}
                  </span>{" "}
                  on the{" "}
                  <span className="font-medium text-foreground">
                    {selectedNetwork}
                  </span>{" "}
                  network. Sending tokens on the wrong network may result in
                  permanent loss of funds.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3 - Enter Amount */}
      {selectedNetwork && (
        <Card className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                3
              </span>
              Enter Amount
            </CardTitle>
            <CardDescription>
              Specify the amount you want to deposit.
              {cryptoPrice && (
                <span className="block text-xs mt-1 text-muted-foreground/80">
                  Current {selectedCoin} price: ${cryptoPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Deposit Amount (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  className="pl-7"
                />
              </div>
            </div>

            {/* Coin Amount Preview */}
            {amount && coinAmount && !isCalculating && (
              <div className="rounded-lg bg-accent/5 border border-accent/30 p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  You'll send
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CoinIcon coin={selectedCoin} size={20} />
                    <span className="text-lg font-semibold text-foreground font-mono">
                      {coinAmount}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {selectedCoin}
                  </span>
                </div>
              </div>
            )}

            {isCalculating && (
              <div className="rounded-lg bg-secondary/50 p-4 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Calculating amount...</span>
              </div>
            )}

            <Button
              onClick={handleGenerateAddress}
              disabled={isGenerating || !amount || parseFloat(amount) <= 0 || !coinAmount || isCalculating}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Address...
                </>
              ) : (
                "Generate Deposit Address"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      <DepositModal
        open={showModal}
        onClose={() => {
          setShowModal(false)
          setAssignedWallet(null)
        }}
        coin={selectedCoin}
        network={selectedNetwork}
        usdAmount={amount}
        coinAmount={coinAmount}
        wallet={assignedWallet}
        onConfirm={handleSubmitDeposit}
        isLoading={isSubmitting}
      />

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}