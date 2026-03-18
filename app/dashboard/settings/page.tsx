"use client"

import { useState, useEffect } from "react"
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
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  SettingsIcon,
  User,
  Lock,
  Bell,
  Eye,
  EyeOff,
  Save,
  LogOut,
  Trash2,
  AlertTriangle,
  Activity as ActivityIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ActivityLog, type Activity } from "@/components/dashboard/activity-log"

export default function SettingsPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [saved, setSaved] = useState(false)
  
  // Activities state - fetch from API
  const [activities, setActivities] = useState<Activity[]>([])
  const [allActivities, setAllActivities] = useState<Activity[]>([])
  const [loadingActivities, setLoadingActivities] = useState(true)
  const [activityTab, setActivityTab] = useState<"recent" | "all">("recent")
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")
    setPasswordSuccess("")
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required.")
      return
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.")
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.")
      return
    }
    setIsUpdatingPassword(true)
    const res = await fetch("/api/auth/update-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    const data = await res.json()
    setIsUpdatingPassword(false)
    if (!res.ok) {
      setPasswordError(data.error || "Failed to update password.")
      return
    }
    setPasswordSuccess("Password updated successfully.")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  // Delete account state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteReason, setDeleteReason] = useState("")
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setDeleteError("")

    if (!deleteReason.trim()) {
      setDeleteError("Please provide a reason for deleting your account.")
      return
    }

    setIsDeletingAccount(true)
    try {
      const res = await fetch("/api/user/request-deletion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: deleteReason }),
      })

      if (!res.ok) {
        const data = await res.json()
        setDeleteError(data.error || "Failed to request account deletion.")
        return
      }

      // Show success and redirect
      alert("Your account deletion request has been sent to our admin team for review. You will receive an email confirmation shortly.")
      setShowDeleteDialog(false)
      router.push("/")
    } catch (error) {
      setDeleteError("An error occurred. Please try again.")
      console.error("Delete account error:", error)
    } finally {
      setIsDeletingAccount(false)
    }
  }

  const [userSettings, setUserSettings] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    phoneCountry: "US",
    dateOfBirth: "",
    timezone: "EST",
  })
  const [loadingUser, setLoadingUser] = useState(true)
  const [userError, setUserError] = useState("")
  const [saveLoading, setSaveLoading] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      setLoadingUser(true)
      setUserError("")
      try {
        const res = await fetch("/api/user/current")
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to fetch user info")
        
        const user = data.user
        setUserSettings((prev) => ({
          ...prev,
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
          email: user?.email || "",
          phone: user?.phone || "",
          phoneCountry: user?.phoneCountry || "US",
          dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
        }))
      } catch (e: any) {
        setUserError(e.message || "Failed to fetch user info")
      } finally {
        setLoadingUser(false)
      }
    }
    fetchUser()
  }, [])

  // Fetch activities
  useEffect(() => {
    const fetchActivities = async () => {
      setLoadingActivities(true)
      try {
        // Fetch recent activities
        const recentRes = await fetch("/api/activities")
        if (recentRes.ok) {
          const recentData = await recentRes.json()
          setActivities(recentData)
        }
        
        // Fetch all activities
        const allRes = await fetch("/api/activities/all?limit=100")
        if (allRes.ok) {
          const allData = await allRes.json()
          setAllActivities(allData)
        }
      } catch (error) {
        console.error("Error fetching activities:", error)
      } finally {
        setLoadingActivities(false)
      }
    }
    fetchActivities()
  }, [])

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: true,
    biometricEnabled: false,
    passwordLastChanged: "2026-02-15",
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: true,
    transactionAlerts: true,
    withdrawalAlerts: true,
    investmentUpdates: true,
  })

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "private",
    dataSharing: false,
    activityLogging: true,
  })

  const handleSaveSettings = async () => {
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userSettings,
        securitySettings,
        notificationSettings,
        privacySettings,
      }),
    })
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <SettingsIcon className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your account preferences and security
        </p>
      </div>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name Fields - Read Only */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={userSettings.firstName}
                readOnly
                disabled
                className="mt-1 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={userSettings.lastName}
                readOnly
                disabled
                className="mt-1 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Email - Editable */}
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={userSettings.email}
              onChange={(e) =>
                setUserSettings({ ...userSettings, email: e.target.value })
              }
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">Email is changeable</p>
          </div>

          {/* Phone - Editable */}
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <div className="flex gap-2 mt-1">
              <select
                value={userSettings.phoneCountry}
                onChange={(e) => setUserSettings({ ...userSettings, phoneCountry: e.target.value })}
                className="flex h-10 w-24 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="US">🇺🇸 +1</option>
                <option value="CA">🇨🇦 +1</option>
                <option value="GB">🇬🇧 +44</option>
                <option value="AU">🇦🇺 +61</option>
                <option value="IN">🇮🇳 +91</option>
                <option value="BR">🇧🇷 +55</option>
                <option value="DE">🇩🇪 +49</option>
                <option value="FR">🇫🇷 +33</option>
                <option value="ES">🇪🇸 +34</option>
                <option value="IT">🇮🇹 +39</option>
                <option value="MX">🇲🇽 +52</option>
                <option value="JP">🇯🇵 +81</option>
                <option value="CN">🇨🇳 +86</option>
                <option value="ZA">🇿🇦 +27</option>
                <option value="NG">🇳🇬 +234</option>
                <option value="KE">🇰🇪 +254</option>
              </select>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone number"
                value={userSettings.phone}
                onChange={(e) =>
                  setUserSettings({ ...userSettings, phone: e.target.value })
                }
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Phone and country are changeable</p>
          </div>

          {/* Date of Birth - Read Only */}
          <div>
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={userSettings.dateOfBirth}
              readOnly
              disabled
              className="mt-1 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground mt-1">Date of birth cannot be changed</p>
          </div>

          <Button 
            onClick={handleSaveSettings} 
            className="flex items-center gap-2" 
            disabled={loadingUser || saveLoading}
          >
            <Save className="h-4 w-4" />
            {loadingUser || saveLoading ? "Saving..." : "Save Changes"}
          </Button>

          {userError && (
            <div className="p-3 bg-red-500/10 text-red-600 rounded-lg text-sm">{userError}</div>
          )}
          {saved && (
            <div className="p-3 bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg text-sm">
              ✓ Settings saved successfully
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <div>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your password and security preferences
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Authentication</h3>

            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium text-sm">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground">
                  Add an extra layer of security
                </p>
              </div>
              <Switch
                checked={securitySettings.twoFactorEnabled}
                onCheckedChange={(checked) =>
                  setSecuritySettings({
                    ...securitySettings,
                    twoFactorEnabled: checked,
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium text-sm">Biometric Login</p>
                <p className="text-xs text-muted-foreground">
                  Use fingerprint or face recognition
                </p>
              </div>
              <Switch
                checked={securitySettings.biometricEnabled}
                onCheckedChange={(checked) =>
                  setSecuritySettings({
                    ...securitySettings,
                    biometricEnabled: checked,
                  })
                }
              />
            </div>
          </div>


          <form className="pt-4 border-t border-border space-y-4" onSubmit={handleUpdatePassword}>
            <h3 className="font-semibold text-sm">Change Password</h3>
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative mt-1">
                <Input
                  id="currentPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                className="mt-1"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="mt-1"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>

            {passwordError && (
              <div className="p-2 bg-red-500/10 text-red-600 rounded text-sm">{passwordError}</div>
            )}
            {passwordSuccess && (
              <div className="p-2 bg-green-500/10 text-green-600 rounded text-sm">{passwordSuccess}</div>
            )}

            <Button variant="outline" type="submit" disabled={isUpdatingPassword}>
              {isUpdatingPassword ? "Updating..." : "Update Password"}
            </Button>
          </form>

          <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-sm">
            Last password change: {securitySettings.passwordLastChanged}
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Control how and when you receive updates
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium text-sm">Email Notifications</p>
                <p className="text-xs text-muted-foreground">
                  Receive updates via email
                </p>
              </div>
              <Switch
                checked={notificationSettings.emailNotifications}
                onCheckedChange={(checked) =>
                  setNotificationSettings({
                    ...notificationSettings,
                    emailNotifications: checked,
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium text-sm">Push Notifications</p>
                <p className="text-xs text-muted-foreground">
                  Get instant browser alerts
                </p>
              </div>
              <Switch
                checked={notificationSettings.pushNotifications}
                onCheckedChange={(checked) =>
                  setNotificationSettings({
                    ...notificationSettings,
                    pushNotifications: checked,
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium text-sm">Transaction Alerts</p>
                <p className="text-xs text-muted-foreground">
                  Notifications for deposits and withdrawals
                </p>
              </div>
              <Switch
                checked={notificationSettings.transactionAlerts}
                onCheckedChange={(checked) =>
                  setNotificationSettings({
                    ...notificationSettings,
                    transactionAlerts: checked,
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium text-sm">Investment Updates</p>
                <p className="text-xs text-muted-foreground">
                  Updates on your active investments
                </p>
              </div>
              <Switch
                checked={notificationSettings.investmentUpdates}
                onCheckedChange={(checked) =>
                  setNotificationSettings({
                    ...notificationSettings,
                    investmentUpdates: checked,
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium text-sm">Marketing Emails</p>
                <p className="text-xs text-muted-foreground">
                  Special offers and promotional content
                </p>
              </div>
              <Switch
                checked={notificationSettings.marketingEmails}
                onCheckedChange={(checked) =>
                  setNotificationSettings({
                    ...notificationSettings,
                    marketingEmails: checked,
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy & Data</CardTitle>
          <CardDescription>
            Manage your privacy preferences and data usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="profileVisibility">Profile Visibility</Label>
            <Select value={privacySettings.profileVisibility}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private (Recommended)</SelectItem>
                <SelectItem value="friends">Friends Only</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
            <div>
              <p className="font-medium text-sm">Activity Logging</p>
              <p className="text-xs text-muted-foreground">
                Keep a record of your account activity
              </p>
            </div>
            <Switch
              checked={privacySettings.activityLogging}
              onCheckedChange={(checked) =>
                setPrivacySettings({
                  ...privacySettings,
                  activityLogging: checked,
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-500/30 bg-red-500/5">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that require caution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 border-yellow-500/30 hover:bg-yellow-500/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout from All Devices
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-2 border-red-500/30 hover:bg-red-500/10 text-red-600 dark:text-red-400 hover:text-red-700"
            onClick={() => {
              setShowDeleteDialog(true)
              setDeleteError("")
              setDeleteReason("")
            }}
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </Button>

          {/* Delete Account Dialog */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <DialogTitle>Delete Account</DialogTitle>
                </div>
                <DialogDescription>
                  This action cannot be undone. We'll send your deletion request to our admin team for review.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleDeleteAccount} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="delete-reason" className="text-base font-semibold">
                    Why are you deleting your account?
                  </Label>
                  <Textarea
                    id="delete-reason"
                    placeholder="Please tell us why you're leaving... (minimum 10 characters)"
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                  {deleteReason && (
                    <p className="text-xs text-muted-foreground">
                      {deleteReason.length} characters
                    </p>
                  )}
                </div>

                {deleteError && (
                  <div className="rounded-lg bg-red-50 dark:bg-red-950 p-3 text-sm text-red-700 dark:text-red-400">
                    {deleteError}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDeleteDialog(false)}
                    disabled={isDeletingAccount}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={isDeletingAccount || deleteReason.trim().length < 10}
                    className="flex-1"
                  >
                    {isDeletingAccount ? "Sending request..." : "Request Deletion"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <ActivityIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <div>
              <CardTitle>Account Activity</CardTitle>
              <CardDescription>
                Monitor your account access and actions since account creation
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingActivities ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Tabs defaultValue="recent" value={activityTab} onValueChange={(value: any) => setActivityTab(value)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="recent">Recent Activity (10)</TabsTrigger>
                <TabsTrigger value="all">All Activities ({allActivities.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="recent" className="mt-4">
                <ActivityLog activities={activities} limit={10} expanded={true} />
              </TabsContent>
              
              <TabsContent value="all" className="mt-4">
                <ActivityLog activities={allActivities} limit={100} expanded={true} />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
