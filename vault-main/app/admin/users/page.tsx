"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { User } from "@/lib/types"

type AdminUser = User & {
  totalBalance?: number
  verified?: boolean
  activeInvestmentsCount?: number
  totalInvested?: number
  totalDeposits?: number
}
import { Search, DollarSign, Edit3, Users, Trash2, AlertCircle, Bell } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [search, setSearch] = useState("")
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [newBalance, setNewBalance] = useState("")
  const [editFirstName, setEditFirstName] = useState("")
  const [editLastName, setEditLastName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editDateOfBirth, setEditDateOfBirth] = useState("")
  const [editRole, setEditRole] = useState<"user" | "admin">("user")
  const [editVerified, setEditVerified] = useState(false)
  const [bonusUser, setBonusUser] = useState<string | null>(null)
  const [bonusAmount, setBonusAmount] = useState("")
  const [notificationUser, setNotificationUser] = useState<string | null>(null)
  const [notificationTitle, setNotificationTitle] = useState("")
  const [notificationMessage, setNotificationMessage] = useState("")
  const [notificationType, setNotificationType] = useState<"info" | "success" | "warning" | "error">("info")
  const [isLoadingNotification, setIsLoadingNotification] = useState(false)
  const [isLoadingBonus, setIsLoadingBonus] = useState(false)
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<string | null>(null)
  const [isLoadingDelete, setIsLoadingDelete] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users")
      if (res.ok) {
        const data = await res.json()
        setUsers(data || [])
      } else {
        setErrorMessage("Failed to fetch users")
      }
    } catch (err) {
      console.error("Error fetching users:", err)
      setErrorMessage("Failed to fetch users")
    }
  }

  // Fetch users on mount
  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  const resetEditState = () => {
    setEditingUser(null)
    setNewBalance("")
    setEditFirstName("")
    setEditLastName("")
    setEditEmail("")
    setEditPhone("")
    setEditDateOfBirth("")
    setEditRole("user")
    setEditVerified(false)
  }

  const openEditUser = (user: AdminUser) => {
    setEditingUser(user.id)
    setNewBalance(user.balance.toString())
    setEditFirstName(user.firstName || "")
    setEditLastName(user.lastName || "")
    setEditEmail(user.email)
    setEditPhone(user.phone || "")
    setEditDateOfBirth(user.dateOfBirth || "")
    setEditRole(user.role || "user")
    setEditVerified(Boolean(user.verified))
  }

  const handleSaveUser = async () => {
    if (!editingUser) return

    const amount = parseFloat(newBalance)
    if (isNaN(amount) || amount < 0) {
      setErrorMessage("Please enter a valid balance")
      setTimeout(() => setErrorMessage(""), 3000)
      return
    }

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: editingUser,
        balance: amount,
        name: `${editFirstName} ${editLastName}`.trim(),
        firstName: editFirstName,
        lastName: editLastName,
        email: editEmail,
        phone: editPhone,
        dateOfBirth: editDateOfBirth,
        role: editRole,
        verified: editVerified,
      }),
    })

    if (res.ok) {
      resetEditState()
      setSuccessMessage("User updated successfully")
      setTimeout(() => setSuccessMessage(""), 3000)
      await fetchUsers()
    } else {
      const data = await res.json().catch(() => null)
      setErrorMessage(data?.error || "Failed to update user")
      setTimeout(() => setErrorMessage(""), 3000)
    }
  }

  const handleSendBonus = async (userId: string) => {
    const amount = parseFloat(bonusAmount)
    if (isNaN(amount) || amount <= 0) {
      setErrorMessage("Please enter a valid bonus amount")
      setTimeout(() => setErrorMessage(""), 3000)
      return
    }

    setIsLoadingBonus(true)
    try {
      const res = await fetch("/api/admin/bonus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, amount }),
      })

      if (res.ok) {
        setSuccessMessage("Bonus sent successfully!")
        setBonusUser(null)
        setBonusAmount("")
        setTimeout(() => setSuccessMessage(""), 3000)
        // Refetch to update balances
        await fetchUsers()
      } else {
        const data = await res.json()
        setErrorMessage(data.error || "Failed to send bonus")
        setTimeout(() => setErrorMessage(""), 3000)
      }
    } catch (error) {
      console.error("Error sending bonus:", error)
      setErrorMessage("Failed to send bonus")
      setTimeout(() => setErrorMessage(""), 3000)
    } finally {
      setIsLoadingBonus(false)
    }
  }

  const handleSendNotification = async () => {
    if (!notificationUser || !notificationTitle || !notificationMessage) {
      setErrorMessage("Please fill in all notification fields")
      setTimeout(() => setErrorMessage(""), 3000)
      return
    }

    setIsLoadingNotification(true)
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: notificationUser,
          title: notificationTitle,
          message: notificationMessage,
          type: notificationType,
        }),
      })

      if (res.ok) {
        setSuccessMessage("Notification sent successfully!")
        setNotificationUser(null)
        setNotificationTitle("")
        setNotificationMessage("")
        setNotificationType("info")
        setTimeout(() => setSuccessMessage(""), 3000)
      } else {
        const data = await res.json()
        setErrorMessage(data.error || "Failed to send notification")
        setTimeout(() => setErrorMessage(""), 3000)
      }
    } catch (error) {
      console.error("Error sending notification:", error)
      setErrorMessage("Failed to send notification")
      setTimeout(() => setErrorMessage(""), 3000)
    } finally {
      setIsLoadingNotification(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    setIsLoadingDelete(true)
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId))
        setDeleteConfirmUser(null)
        setSuccessMessage("User deleted successfully")
        setTimeout(() => setSuccessMessage(""), 3000)
      } else {
        const data = await res.json()
        setErrorMessage(data.error || "Failed to delete user")
        setTimeout(() => setErrorMessage(""), 3000)
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      setErrorMessage("Failed to delete user")
      setTimeout(() => setErrorMessage(""), 3000)
    } finally {
      setIsLoadingDelete(false)
    }
  }

  const totalAUM = users.reduce((sum, u) => sum + (u.totalBalance ?? u.balance), 0)

  // AdminUser type already declared above

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Manage Users
        </h1>
        <p className="text-sm text-muted-foreground">
          View, search, and update user accounts and balances.
        </p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <Alert className="border-green-500/50 bg-green-50/50 dark:bg-green-950/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
      {errorMessage && (
        <Alert className="border-red-500/50 bg-red-50/50 dark:bg-red-950/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Users className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Users</p>
                <p className="text-lg font-bold text-card-foreground">
                  {users.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <DollarSign className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Total Assets Under Management
                </p>
                <p className="text-lg font-bold text-card-foreground">
                  ${totalAUM.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* User list */}
      <div className="flex flex-col gap-4">
        {filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-sm text-muted-foreground">
                No users found matching your search.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id} className="transition-all hover:shadow-sm">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                  {/* User info row */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* User info */}
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium text-foreground">
                        {user.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-card-foreground">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          Joined {user.joinedAt}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium ${user.verified ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                            {user.verified ? "✓ Verified" : "○ Unverified"}
                          </span>
                          {user.activeInvestmentsCount > 0 && (
                            <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-1 text-[10px] font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                              {user.activeInvestmentsCount} Active
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Balance, Investments, and Stats */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Balance</p>
                        <p className="text-lg font-bold text-card-foreground">
                          ${user.balance.toLocaleString()}
                        </p>
                      </div>
                      <div className="hidden text-right sm:block">
                        <p className="text-xs text-muted-foreground">Total Invested</p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          ${(user.totalInvested || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="hidden text-right sm:block">
                        <p className="text-xs text-muted-foreground">Total Deposits</p>
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          ${(user.totalDeposits || 0).toLocaleString()}
                        </p>
                      </div>

                      <Dialog
                        open={editingUser === user.id}
                        onOpenChange={(open) => {
                          if (!open) {
                            resetEditState()
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditUser(user)}
                          >
                            <Edit3 className="mr-1.5 h-3.5 w-3.5" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                            <DialogDescription>
                              Update user details, account status, and balance.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid gap-3 md:grid-cols-2">
                              <div className="flex flex-col gap-2">
                                <Label htmlFor="edit-first-name">First Name</Label>
                                <Input
                                  id="edit-first-name"
                                  value={editFirstName}
                                  onChange={(e) => setEditFirstName(e.target.value)}
                                />
                              </div>
                              <div className="flex flex-col gap-2">
                                <Label htmlFor="edit-last-name">Last Name</Label>
                                <Input
                                  id="edit-last-name"
                                  value={editLastName}
                                  onChange={(e) => setEditLastName(e.target.value)}
                                />
                              </div>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                              <div className="flex flex-col gap-2">
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                  id="edit-email"
                                  type="email"
                                  value={editEmail}
                                  onChange={(e) => setEditEmail(e.target.value)}
                                />
                              </div>
                              <div className="flex flex-col gap-2">
                                <Label htmlFor="edit-phone">Phone</Label>
                                <Input
                                  id="edit-phone"
                                  value={editPhone}
                                  onChange={(e) => setEditPhone(e.target.value)}
                                />
                              </div>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                              <div className="flex flex-col gap-2">
                                <Label htmlFor="edit-dob">Date of Birth</Label>
                                <Input
                                  id="edit-dob"
                                  type="date"
                                  value={editDateOfBirth}
                                  onChange={(e) => setEditDateOfBirth(e.target.value)}
                                />
                              </div>
                              <div className="flex flex-col gap-2">
                                <Label htmlFor="edit-role">Role</Label>
                                <Select value={editRole} onValueChange={(value) => setEditRole(value as "user" | "admin") }>
                                  <SelectTrigger id="edit-role">
                                    <SelectValue placeholder="Role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                              <div className="flex items-center gap-2">
                                <input
                                  id="edit-verified"
                                  type="checkbox"
                                  checked={editVerified}
                                  onChange={(e) => setEditVerified(e.target.checked)}
                                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                                />
                                <Label htmlFor="edit-verified" className="mb-0">
                                  Verified
                                </Label>
                              </div>
                              <div className="flex flex-col gap-2">
                                <Label htmlFor="edit-balance">Balance</Label>
                                <Input
                                  id="edit-balance"
                                  type="number"
                                  value={newBalance}
                                  onChange={(e) => setNewBalance(e.target.value)}
                                  min={0}
                                  step={0.01}
                                />
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <Button onClick={handleSaveUser} className="w-full md:w-auto">
                                Save Changes
                              </Button>
                              <Button
                                variant="outline"
                                className="w-full md:w-auto"
                                onClick={() => resetEditState()}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {/* Actions row */}
                                    {/* Send Bonus Button */}
                                    <Dialog open={bonusUser === user.id} onOpenChange={(open) => {
                                      if (!open) {
                                        setBonusUser(null)
                                        setBonusAmount("")
                                      }
                                    }}>
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => setBonusUser(user.id)}
                                        >
                                          <DollarSign className="mr-1.5 h-3.5 w-3.5" />
                                          Send Bonus
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Send Bonus to {user.name}</DialogTitle>
                                          <DialogDescription>
                                            Credit a bonus amount directly to this user's balance. This will appear in their transaction history and as a notification.
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                          <div className="space-y-2">
                                            <Label htmlFor="bonus-amount">Amount</Label>
                                            <Input
                                              id="bonus-amount"
                                              type="number"
                                              placeholder="Bonus amount"
                                              value={bonusAmount}
                                              onChange={(e) => setBonusAmount(e.target.value)}
                                              min={1}
                                              step={0.01}
                                            />
                                          </div>
                                          <Button
                                            onClick={() => handleSendBonus(user.id)}
                                            disabled={isLoadingBonus}
                                            className="w-full"
                                          >
                                            {isLoadingBonus ? "Sending..." : "Send Bonus"}
                                          </Button>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                  <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                    {/* Send Notification Button */}
                    <Dialog open={notificationUser === user.id} onOpenChange={(open) => {
                      if (!open) {
                        setNotificationUser(null)
                        setNotificationTitle("")
                        setNotificationMessage("")
                        setNotificationType("info")
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setNotificationUser(user.id)}
                        >
                          <Bell className="mr-1.5 h-3.5 w-3.5" />
                          Send Notification
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Send Notification to {user.name}</DialogTitle>
                          <DialogDescription>
                            Create and send a notification message to this user.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="notif-title">Title</Label>
                            <Input
                              id="notif-title"
                              placeholder="Notification title"
                              value={notificationTitle}
                              onChange={(e) => setNotificationTitle(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="notif-message">Message</Label>
                            <Input
                              id="notif-message"
                              placeholder="Notification message"
                              value={notificationMessage}
                              onChange={(e) => setNotificationMessage(e.target.value)}
                              className="min-h-[80px]"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="notif-type">Type</Label>
                            <Select value={notificationType} onValueChange={(val: string) => setNotificationType(val as "info" | "success" | "warning" | "error")}>
                              <SelectTrigger id="notif-type">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="info">Info</SelectItem>
                                <SelectItem value="success">Success</SelectItem>
                                <SelectItem value="warning">Warning</SelectItem>
                                <SelectItem value="error">Error</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            onClick={handleSendNotification}
                            disabled={isLoadingNotification}
                            className="w-full"
                          >
                            {isLoadingNotification ? "Sending..." : "Send"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Delete Button */}
                    <Dialog open={deleteConfirmUser === user.id} onOpenChange={(open) => {
                      if (!open) setDeleteConfirmUser(null)
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteConfirmUser(user.id)}
                        >
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete User</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete <strong>{user.name}</strong>? This action cannot be undone. All user data will be permanently removed.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex gap-3">
                          <Button variant="outline" onClick={() => setDeleteConfirmUser(null)} className="flex-1">
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={isLoadingDelete}
                            className="flex-1"
                          >
                            {isLoadingDelete ? "Deleting..." : "Delete"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
