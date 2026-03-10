"use client"

import { useState } from "react"
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
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [saved, setSaved] = useState(false)

  const [userSettings, setUserSettings] = useState({
    fullName: "Alexandra Chen",
    email: "alex@example.com",
    phone: "+1 (555) 123-4567",
    timezone: "EST",
  })

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
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
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
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={userSettings.fullName}
              onChange={(e) =>
                setUserSettings({ ...userSettings, fullName: e.target.value })
              }
              className="mt-1"
            />
          </div>

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
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={userSettings.phone}
              onChange={(e) =>
                setUserSettings({ ...userSettings, phone: e.target.value })
              }
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={userSettings.timezone}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PST">PST (Pacific)</SelectItem>
                <SelectItem value="MST">MST (Mountain)</SelectItem>
                <SelectItem value="CST">CST (Central)</SelectItem>
                <SelectItem value="EST">EST (Eastern)</SelectItem>
                <SelectItem value="GMT">GMT (London)</SelectItem>
                <SelectItem value="CET">CET (Central Europe)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSaveSettings} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>

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

          <div className="pt-4 border-t border-border space-y-4">
            <h3 className="font-semibold text-sm">Change Password</h3>
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative mt-1">
                <Input
                  id="currentPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
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
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="mt-1"
              />
            </div>

            <Button variant="outline">Update Password</Button>
          </div>

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
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
