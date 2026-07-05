"use client"

import { useState, useEffect } from "react"
import type { CoinType, NetworkType, WalletAddress } from "@/lib/types"
import { coinNetworks, coinDetails } from "@/lib/crypto-config"
import { CoinIcon } from "@/components/crypto/coin-icon"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Plus,
  Wallet,
  Trash2,
  User,
  Search,
  AlertCircle,
  X,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const allCoins: CoinType[] = ["USDT", "BTC", "ETH", "BNB", "TRX", "SOL"]

export default function AdminWalletsPage() {
  const [walletPool, setWalletPool] = useState<WalletAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [newCoin, setNewCoin] = useState<CoinType>("USDT")
  const [newNetwork, setNewNetwork] = useState<NetworkType>("TRC20")
  const [newAddress, setNewAddress] = useState("")
  const [filterCoin, setFilterCoin] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [dropConfirmId, setDropConfirmId] = useState<string | null>(null)
  const [statusChangeId, setStatusChangeId] = useState<string | null>(null)
  const [newStatus, setNewStatus] = useState<"active" | "inactive" | "suspended">("active")
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDropping, setIsDropping] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isChangingStatus, setIsChangingStatus] = useState(false)

  // Fetch wallets and users from API on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const walletsRes = await fetch("/api/admin/wallets")
        if (walletsRes.ok) {
          const walletsData = await walletsRes.json()
          setWalletPool(walletsData || [])
        } else {
          setError("Failed to fetch wallets from database")
        }
      } catch (err) {
        console.error("Error fetching wallets:", err)
        setError("Failed to fetch wallets")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAddWallet = async () => {
    if (!newAddress.trim()) {
      setError("Please enter a wallet address")
      return
    }

    setIsAdding(true)
    setError("")
    setSuccess("")

    try {
      const res = await fetch("/api/admin/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          wallet: {
            coin: newCoin,
            network: newNetwork,
            address: newAddress.trim(),
          },
        }),
      })

      if (res.ok) {
        const newWallet = await res.json()
        setWalletPool((prev) => [newWallet, ...prev])
        setNewAddress("")
        setDialogOpen(false)
        setSuccess("Wallet address added successfully")
        setTimeout(() => setSuccess(""), 3000)
      } else {
        const data = await res.json()
        setError(data.error || "Failed to add wallet")
      }
    } catch (err) {
      console.error("Error adding wallet:", err)
      setError("Failed to add wallet")
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeleteWallet = async (id: string) => {
    setIsDeleting(true)
    setError("")

    try {
      const res = await fetch("/api/admin/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          wallet: { id },
        }),
      })

      if (res.ok) {
        setWalletPool((prev) => prev.filter((w) => w.id !== id))
        setDeleteConfirmId(null)
        setSuccess("Wallet deleted successfully")
        setTimeout(() => setSuccess(""), 3000)
      } else {
        const data = await res.json()
        setError(data.error || "Failed to delete wallet")
      }
    } catch (err) {
      console.error("Error deleting wallet:", err)
      setError("Failed to delete wallet")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDropWallet = async (id: string) => {
    setIsDropping(true)
    setError("")

    try {
      const res = await fetch("/api/admin/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "drop",
          wallet: { id },
        }),
      })

      if (res.ok) {
        setWalletPool((prev) =>
          prev.map((w) =>
            w.id === id
              ? { ...w, assignedTo: null, assignedAt: null }
              : w
          )
        )
        setDropConfirmId(null)
        setSuccess("Wallet unassigned successfully")
        setTimeout(() => setSuccess(""), 3000)
      } else {
        const data = await res.json()
        setError(data.error || "Failed to unassign wallet")
      }
    } catch (err) {
      console.error("Error unassigning wallet:", err)
      setError("Failed to unassign wallet")
    } finally {
      setIsDropping(false)
    }
  }

  const handleChangeStatus = async () => {
    if (!statusChangeId) return

    setIsChangingStatus(true)
    setError("")

    try {
      const res = await fetch("/api/admin/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "changeStatus",
          wallet: { id: statusChangeId, status: newStatus },
        }),
      })

      if (res.ok) {
        setWalletPool((prev) =>
          prev.map((w) =>
            w.id === statusChangeId
              ? { ...w, status: newStatus }
              : w
          )
        )
        setStatusChangeId(null)
        setSuccess("Wallet status updated successfully")
        setTimeout(() => setSuccess(""), 3000)
      } else {
        const data = await res.json()
        setError(data.error || "Failed to change wallet status")
      }
    } catch (err) {
      console.error("Error changing wallet status:", err)
      setError("Failed to change wallet status")
    } finally {
      setIsChangingStatus(false)
    }
  }

  const filteredWallets = walletPool.filter((w) => {
    if (filterCoin !== "all" && w.coin !== filterCoin) return false
    if (filterStatus !== "all" && w.status !== filterStatus) return false
    if (
      searchQuery &&
      !w.address.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false
    return true
  })

  const availableWallets = walletPool.filter((w) => !w.assignedTo)
  const assignedWallets = walletPool.filter((w) => w.assignedTo)

  const statsByMCoin = allCoins.map((coin) => {
    const all = walletPool.filter((w) => w.coin === coin)
    const available = all.filter((w) => !w.assignedTo)
    return { coin, total: all.length, available: available.length }
  })

  const getUserName = (userId: string | null) => {
    if (!userId) return null
    return userId
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Status Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-accent/50 bg-accent/10">
          <AlertDescription className="text-accent-foreground">{success}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <Card>
          <CardContent className="flex justify-center py-12">
            <p className="text-muted-foreground">Loading wallets...</p>
          </CardContent>
        </Card>
      ) : (
        <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Wallet Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage deposit wallet addresses for all coins and networks.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Wallet Address
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Wallet Address</DialogTitle>
              <DialogDescription>
                Add a new deposit wallet address to the pool. Users will be
                assigned addresses from this pool.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label>Coin</Label>
                <Select
                  value={newCoin}
                  onValueChange={(v) => {
                    setNewCoin(v as CoinType)
                    // Reset network if not valid for new coin
                    const validNetworks = coinNetworks[v as CoinType]
                    if (!validNetworks.includes(newNetwork)) {
                      setNewNetwork(validNetworks[0])
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allCoins.map((c) => (
                      <SelectItem key={c} value={c}>
                        <div className="flex items-center gap-2">
                          <CoinIcon coin={c} size={16} />
                          <span>
                            {c} - {coinDetails[c].name}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Network</Label>
                <Select
                  value={newNetwork}
                  onValueChange={(v) => setNewNetwork(v as NetworkType)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {coinNetworks[newCoin].map((n) => (
                      <SelectItem key={n} value={n}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Wallet Address</Label>
                <Input
                  placeholder="Enter wallet address..."
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isAdding}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddWallet}
                disabled={!newAddress.trim() || isAdding}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {isAdding ? "Adding..." : "Add Address"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statsByMCoin.map((stat) => (
          <Card key={stat.coin}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {stat.coin} Wallets
                  </p>
                  <p className="mt-1 text-2xl font-bold text-card-foreground">
                    {stat.total}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stat.available} available
                  </p>
                </div>
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: coinDetails[stat.coin].bgColor }}
                >
                  <CoinIcon coin={stat.coin} size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Wallet List */}
      <Tabs defaultValue="all" className="w-full">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="all">
              All ({walletPool.length})
            </TabsTrigger>
            <TabsTrigger value="available">
              Available ({availableWallets.length})
            </TabsTrigger>
            <TabsTrigger value="assigned">
              Assigned ({assignedWallets.length})
            </TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <div className="relative flex-1 sm:w-56 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 font-mono text-xs"
              />
            </div>
            <Select value={filterCoin} onValueChange={setFilterCoin}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Coin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Coins</SelectItem>
                {allCoins.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="all" className="mt-4">
          <WalletTable
            wallets={filteredWallets}
            getUserName={getUserName}
            onDelete={(id) => setDeleteConfirmId(id)}
            onDrop={(id) => setDropConfirmId(id)}
            onStatusChange={(id, status) => {
              setStatusChangeId(id)
              setNewStatus(status)
            }}
          />
        </TabsContent>
        <TabsContent value="available" className="mt-4">
          <WalletTable
            wallets={filteredWallets.filter((w) => !w.assignedTo)}
            getUserName={getUserName}
            onDelete={(id) => setDeleteConfirmId(id)}
            onDrop={(id) => setDropConfirmId(id)}
            onStatusChange={(id, status) => {
              setStatusChangeId(id)
              setNewStatus(status)
            }}
          />
        </TabsContent>
        <TabsContent value="assigned" className="mt-4">
          <WalletTable
            wallets={filteredWallets.filter((w) => w.assignedTo)}
            getUserName={getUserName}
            onDelete={(id) => setDeleteConfirmId(id)}
            onDrop={(id) => setDropConfirmId(id)}
            onStatusChange={(id, status) => {
              setStatusChangeId(id)
              setNewStatus(status)
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirmId}
        onOpenChange={() => setDeleteConfirmId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Wallet Address</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this wallet address from the pool?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDeleteWallet(deleteConfirmId)}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Drop/Unassign Confirmation Dialog */}
      <Dialog
        open={!!dropConfirmId}
        onOpenChange={() => setDropConfirmId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unassign Wallet Address</DialogTitle>
            <DialogDescription>
              Are you sure you want to unassign this wallet from the user? The
              wallet will return to the available pool.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDropConfirmId(null)}
              disabled={isDropping}
            >
              Cancel
            </Button>
            <Button
              onClick={() => dropConfirmId && handleDropWallet(dropConfirmId)}
              disabled={isDropping}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isDropping ? "Unassigning..." : "Unassign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Status Dialog */}
      <Dialog
        open={!!statusChangeId}
        onOpenChange={() => setStatusChangeId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Wallet Status</DialogTitle>
            <DialogDescription>
              Select a new status for this wallet address.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label>Wallet Status</Label>
              <Select
                value={newStatus}
                onValueChange={(v) => setNewStatus(v as "active" | "inactive" | "suspended")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusChangeId(null)}
              disabled={isChangingStatus}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangeStatus}
              disabled={isChangingStatus}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isChangingStatus ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </>
      )}
    </div>
  )
}

function WalletTable({
  wallets,
  getUserName,
  onDelete,
  onDrop,
  onStatusChange,
}: {
  wallets: WalletAddress[]
  getUserName: (id: string | null) => string | null
  onDelete: (id: string) => void
  onDrop: (id: string) => void
  onStatusChange: (id: string, status: "active" | "inactive" | "suspended") => void
}) {
  if (wallets.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Wallet className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No wallet addresses found.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        {/* Desktop Table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Coin
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Network
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Address
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Assigned To
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {wallets.map((wallet) => (
                <tr
                  key={wallet.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <CoinIcon coin={wallet.coin} size={20} />
                      <span className="text-sm font-medium text-card-foreground">
                        {wallet.coin}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-xs">
                      {wallet.network}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs text-muted-foreground">
                      {wallet.address.slice(0, 12)}...{wallet.address.slice(-8)}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          wallet.status === "active"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : wallet.status === "inactive"
                              ? "bg-gray-100 text-gray-700 border-gray-300"
                              : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {wallet.status.charAt(0).toUpperCase() + wallet.status.slice(1)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onStatusChange(wallet.id, wallet.status)}
                        className="p-0 h-auto text-xs text-muted-foreground hover:text-accent"
                        title="Change status"
                      >
                        ⚙️
                      </Button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {wallet.assignedTo ? (
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-card-foreground">
                          {getUserName(wallet.assignedTo)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">--</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {wallet.assignedTo && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDrop(wallet.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-accent"
                          title="Unassign from user"
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Unassign wallet</span>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(wallet.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete wallet</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="flex flex-col gap-3 p-4 md:hidden">
          {wallets.map((wallet) => (
            <div
              key={wallet.id}
              className="flex flex-col gap-3 rounded-lg border border-border p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CoinIcon coin={wallet.coin} size={20} />
                  <span className="text-sm font-medium text-card-foreground">
                    {wallet.coin}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {wallet.network}
                  </Badge>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${
                    wallet.status === "active"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : wallet.status === "inactive"
                        ? "bg-gray-100 text-gray-700 border-gray-300"
                        : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {wallet.status.charAt(0).toUpperCase() + wallet.status.slice(1)}
                </Badge>
              </div>
              <code className="break-all text-xs text-muted-foreground">
                {wallet.address}
              </code>
              <div className="flex items-center justify-between">
                {wallet.assignedTo ? (
                  <div className="flex items-center gap-1.5">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-card-foreground">
                      {getUserName(wallet.assignedTo)}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Unassigned
                  </span>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onStatusChange(wallet.id, wallet.status)}
                    className="h-7 text-xs text-muted-foreground hover:text-accent"
                    title="Change status"
                  >
                    ⚙️ Status
                  </Button>
                  {wallet.assignedTo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDrop(wallet.id)}
                      className="h-7 text-xs text-muted-foreground hover:text-accent"
                      title="Unassign from user"
                    >
                      <X className="mr-1 h-3 w-3" />
                      Unassign
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(wallet.id)}
                    className="h-7 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
