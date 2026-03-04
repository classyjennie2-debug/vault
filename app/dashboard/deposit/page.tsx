"use client"

import { useState, useCallback, useEffect } from "react"
import {
  type CoinType,
  type NetworkType,
  type WalletAddress,
  coinNetworks,
  coinDetails,
  initialWalletAddresses,
} from "@/lib/mock-data"
import { CoinIcon } from "@/components/crypto/coin-icon"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, Loader2, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

const coins: CoinType[] = ["USDT", "BTC", "ETH", "BNB", "TRX", "SOL"]

const networkLabels: Partial<Record<string, string>> = {
  BEP20: "BEP20 (BSC)",
  BTC: "BTC Network",
  SOL: "SOL Network",
  USDT0: "USDT0",
}

export default function DepositPage() {
  const [selectedCoin, setSelectedCoin] = useState<CoinType | null>(null)
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType | null>(
    null
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const [assignedWallet, setAssignedWallet] = useState<WalletAddress | null>(
    null
  )
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [walletPool, setWalletPool] = useState<WalletAddress[]>(() => {
    if (typeof window !== "undefined") {
      const version = localStorage.getItem("vault_wallet_version")
      if (version === "2") {
        const stored = localStorage.getItem("vault_wallet_pool")
        if (stored) return JSON.parse(stored)
      }
      localStorage.setItem("vault_wallet_version", "2")
    }
    return initialWalletAddresses
  })

  // Sync wallet pool to localStorage for cross-page state
  useEffect(() => {
    localStorage.setItem("vault_wallet_pool", JSON.stringify(walletPool))
  }, [walletPool])

  const handleCoinSelect = (coin: CoinType) => {
    setSelectedCoin(coin)
    setSelectedNetwork(null)
    setAssignedWallet(null)
    setError(null)
  }

  const handleNetworkSelect = (network: NetworkType) => {
    setSelectedNetwork(network)
    setAssignedWallet(null)
    setError(null)
  }

  const handleGenerateAddress = useCallback(() => {
    if (!selectedCoin || !selectedNetwork) return

    setIsGenerating(true)
    setError(null)

    // Simulate 5 second loading
    setTimeout(() => {
      const available = walletPool.find(
        (w) =>
          w.coin === selectedCoin &&
          w.network === selectedNetwork &&
          w.assignedTo === null
      )

      if (!available) {
        setError(
          `No available ${selectedCoin} addresses on ${selectedNetwork}. Please try a different network or contact support.`
        )
        setIsGenerating(false)
        return
      }

      // Assign the wallet
      const updated = walletPool.map((w) =>
        w.id === available.id
          ? {
              ...w,
              assignedTo: "u1",
              assignedAt: new Date().toISOString().split("T")[0],
            }
          : w
      )

      setWalletPool(updated)
      setAssignedWallet({
        ...available,
        assignedTo: "u1",
        assignedAt: new Date().toISOString().split("T")[0],
      })
      setIsGenerating(false)
    }, 5000)
  }, [selectedCoin, selectedNetwork, walletPool])

  const handleCopy = async () => {
    if (!assignedWallet) return
    await navigator.clipboard.writeText(assignedWallet.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
            Select a coin and network to generate your unique deposit address.
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
                  {"Make sure you're sending"}{" "}
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

      {/* Step 3 - Generate Address */}
      {selectedCoin && selectedNetwork && !assignedWallet && (
        <Card className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                3
              </span>
              Generate Deposit Address
            </CardTitle>
            <CardDescription>
              Click below to get a unique {selectedCoin} deposit address on{" "}
              {selectedNetwork}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            <Button
              onClick={handleGenerateAddress}
              disabled={isGenerating}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating secure address...
                </>
              ) : (
                "Generate Address"
              )}
            </Button>
            {isGenerating && (
              <div className="mt-4 flex flex-col items-center gap-3">
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-1.5 w-8 overflow-hidden rounded-full bg-secondary"
                    >
                      <div
                        className="h-full rounded-full bg-accent animate-pulse"
                        style={{
                          animationDelay: `${i * 200}ms`,
                          animationDuration: "1s",
                        }}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Securing your unique deposit address...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Assigned Address Result */}
      {assignedWallet && (
        <Card className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 border-accent/30">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent">
                  <Check className="h-3.5 w-3.5 text-accent-foreground" />
                </div>
                Your Deposit Address
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="gap-1.5"
                >
                  <CoinIcon coin={assignedWallet.coin} size={14} />
                  {assignedWallet.coin}
                </Badge>
                <Badge variant="outline">{assignedWallet.network}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 p-4">
              <code className="flex-1 break-all text-sm font-medium text-foreground">
                {assignedWallet.address}
              </code>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="flex-shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-accent" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="sr-only">Copy address</span>
              </Button>
            </div>
            <div className="rounded-lg bg-warning/10 p-3">
              <p className="text-xs font-medium text-warning-foreground">
                Important: Only send{" "}
                <span className="font-bold">{assignedWallet.coin}</span> on the{" "}
                <span className="font-bold">{assignedWallet.network}</span>{" "}
                network to this address. Minimum deposit is $10. Deposits
                typically confirm within 10-30 minutes.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setAssignedWallet(null)
                setSelectedCoin(null)
                setSelectedNetwork(null)
              }}
            >
              Generate Another Address
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
