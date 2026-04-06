"use client"

import { useState, useEffect } from "react"
import { useI18n } from "@/hooks/use-i18n"
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
  const { t } = useI18n('settings')
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
      setPasswordError(t('allFieldsRequired'))
      return
    }
    if (newPassword.length < 8) {
      setPasswordError(t('passwordMinimum'))
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t('passwordsDoNotMatch'))
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
      setPasswordError(data.error || t('failedUpdatePassword'))
      return
    }
    setPasswordSuccess(t('passwordUpdatedSuccess'))
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
      setDeleteError(t('provideReasonDeletion'))
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
        setDeleteError(data.error || t('failedRequestDeletion'))
        return
      }

      // Show success and redirect
      alert(t('deletionRequestSent'))
      setShowDeleteDialog(false)
      router.push("/")
    } catch (error) {
      setDeleteError(t('errorOccurred'))
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

    // Load language
    const savedLanguage = localStorage.getItem('language') || 'en'
    setLanguage(savedLanguage)

    // Fetch language names
    const LANGUAGES: Record<string, string> = {
      en: 'English',
      es: 'Español',
      pt: 'Português',
      fr: 'Français',
      zh: '中文',
      ar: 'العربية',
      ph: 'Filipino',
    }

    const fetchLanguageNames = async () => {
      const names: Record<string, string> = {}
      
      for (const [code, _] of Object.entries(LANGUAGES)) {
        try {
          const response = await fetch(`/locales/${code}/common.json`)
          const data = await response.json()
          names[code] = data.language || LANGUAGES[code]
        } catch (error) {
          names[code] = LANGUAGES[code]
        }
      }
      
      setLanguageNames(names)
    }
    
    fetchLanguageNames()
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

  const [language, setLanguage] = useState<string>('en')
  const [languageNames, setLanguageNames] = useState<Record<string, string>>({})

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

  const handleLanguageChange = (newLanguage: string) => {
    localStorage.setItem('language', newLanguage)
    setLanguage(newLanguage)
    window.location.reload()
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
          {t('title')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('description')}
        </p>
      </div>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <CardTitle>{t('accountInformation')}</CardTitle>
              <CardDescription>{t('updatePersonalDetails')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name Fields - Read Only */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">{t('firstName')}</Label>
              <Input
                id="firstName"
                value={userSettings.firstName}
                readOnly
                disabled
                className="mt-1 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
              />
            </div>
            <div>
              <Label htmlFor="lastName">{t('lastName')}</Label>
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
            <Label htmlFor="email">{t('emailAddress')}</Label>
            <Input
              id="email"
              type="email"
              value={userSettings.email}
              onChange={(e) =>
                setUserSettings({ ...userSettings, email: e.target.value })
              }
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">{t('emailIsChangeable')}</p>
          </div>

          {/* Phone - Editable */}
          <div>
            <Label htmlFor="phone">{t('phone')}</Label>
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
            <p className="text-xs text-muted-foreground mt-1">{t('phoneIsChangeable')}</p>
          </div>

          {/* Date of Birth - Read Only */}
          <div>
            <Label htmlFor="dateOfBirth">{t('dateOfBirth')}</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={userSettings.dateOfBirth}
              readOnly
              disabled
              className="mt-1 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground mt-1">{t('dateOfBirthCannotChange')}</p>
          </div>

          <Button 
            onClick={handleSaveSettings} 
            className="flex items-center gap-2" 
            disabled={loadingUser || saveLoading}
          >
            <Save className="h-4 w-4" />
            {loadingUser || saveLoading ? t('updating') : t('save')}
          </Button>

          {userError && (
            <div className="p-3 bg-red-500/10 text-red-600 rounded-lg text-sm">{userError}</div>
          )}
          {saved && (
            <div className="p-3 bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg text-sm">
              ✓ {t('saved')}
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
              <CardTitle>{t('securitySettings')}</CardTitle>
              <CardDescription>
                {t('managePasswordDesc')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">{t('authentication')}</h3>

            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium text-sm">{t('twoFactorAuthentication')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('addExtraLayerSecurity')}
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
                <p className="font-medium text-sm">{t('biometricLogin')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('useFingerprintFace')}
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
            <h3 className="font-semibold text-sm">{t('changePassword')}</h3>
            <div>
              <Label htmlFor="currentPassword">{t('currentPassword')}</Label>
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
              <Label htmlFor="newPassword">{t('newPassword')}</Label>
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
              <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
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
              {isUpdatingPassword ? t('updating') : t('updatePassword')}
            </Button>
          </form>

          <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-sm">
            {t('lastPasswordChange')}: {securitySettings.passwordLastChanged}
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <div>
              <CardTitle>{t('notificationSettings')}</CardTitle>
              <CardDescription>
                {t('controlUpdates')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium text-sm">{t('emailNotifications')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('receiveUpdatesEmail')}
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
                <p className="font-medium text-sm">{t('pushNotifications')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('instantBrowserAlerts')}
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
                <p className="font-medium text-sm">{t('transactionAlerts')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('depositsWithdrawals')}
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
                <p className="font-medium text-sm">{t('investmentUpdates')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('updatesActiveInvestments')}
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
                <p className="font-medium text-sm">{t('marketingEmails')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('specialOffersPromo')}
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
          <CardTitle>{t('privacySettings')}</CardTitle>
          <CardDescription>
            {t('managePrivacy')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="profileVisibility">{t('profileVisibility')}</Label>
            <Select value={privacySettings.profileVisibility}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">{t('privateRecommended')}</SelectItem>
                <SelectItem value="friends">{t('friendsOnly')}</SelectItem>
                <SelectItem value="public">{t('public')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
            <div>
              <p className="font-medium text-sm">{t('activityLogging')}</p>
              <p className="text-xs text-muted-foreground">
                {t('keepRecordActivity')}
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

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <SettingsIcon className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            <div>
              <CardTitle>Language Preferences</CardTitle>
              <CardDescription>
                Choose your preferred language
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="language">Language</Label>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="mt-1 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{languageNames['en'] || 'English'}</SelectItem>
                <SelectItem value="es">{languageNames['es'] || 'Español'}</SelectItem>
                <SelectItem value="pt">{languageNames['pt'] || 'Português'}</SelectItem>
                <SelectItem value="fr">{languageNames['fr'] || 'Français'}</SelectItem>
                <SelectItem value="zh">{languageNames['zh'] || '中文'}</SelectItem>
                <SelectItem value="ar">{languageNames['ar'] || 'العربية'}</SelectItem>
                <SelectItem value="ph">{languageNames['ph'] || 'Filipino'}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              The interface will reload in your selected language
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-500/30 bg-red-500/5">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">
            {t('dangerZone')}
          </CardTitle>
          <CardDescription>
            {t('irreversibleActions')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 border-yellow-500/30 hover:bg-yellow-500/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {t('logoutAllDevices')}
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
            {t('deleteAccount')}
          </Button>

          {/* Delete Account Dialog */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <DialogTitle>{t('requestDeletion')}</DialogTitle>
                </div>
                <DialogDescription>
                  {t('deleteAccountWarning')}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleDeleteAccount} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="delete-reason" className="text-base font-semibold">
                    {t('deletionReason')}
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
                    {t('logout')}
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
