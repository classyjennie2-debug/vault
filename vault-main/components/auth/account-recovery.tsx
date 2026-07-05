"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Lock, Mail, CheckCircle } from "lucide-react"

type RecoveryStep = "email" | "verify" | "backup-code" | "reset-password" | "success"

interface AccountRecoveryProps {
  onRecoveryComplete?: (email: string) => void
}

export function AccountRecovery({ onRecoveryComplete }: AccountRecoveryProps) {
  const [step, setStep] = useState<RecoveryStep>("email")
  const [email, setEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [backupCode, setBackupCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const handleEmailSubmit = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/auth/recover/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!response.ok) throw new Error("Email not found")
      setMessage("Verification code sent to your email")
      setStep("verify")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyEmail = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/auth/recover/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code: verificationCode,
        }),
      })
      if (!response.ok) throw new Error("Invalid verification code")
      setStep("backup-code")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed")
    } finally {
      setLoading(false)
    }
  }

  const handleBackupCodeSubmit = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/auth/recover/backup-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          backupCode,
        }),
      })
      if (!response.ok) throw new Error("Invalid backup code")
      setStep("reset-password")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid backup code")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/auth/recover/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          newPassword,
        }),
      })
      if (!response.ok) throw new Error("Failed to reset password")
      setStep("success")
      onRecoveryComplete?.(email)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Recover Your Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && (
              <Alert className="bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-900">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900">
                <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {step === "email" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enter your email address to start the account recovery process.
                </p>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button
                  onClick={handleEmailSubmit}
                  disabled={loading || !email}
                  className="w-full"
                >
                  {loading ? "Sending..." : "Send Verification Code"}
                </Button>
              </div>
            )}

            {step === "verify" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  We've sent a verification code to <strong>{email}</strong>. Check your email and enter the code below.
                </p>
                <Input
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
                <Button
                  onClick={handleVerifyEmail}
                  disabled={loading || verificationCode.length !== 6}
                  className="w-full"
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep("email")
                    setVerificationCode("")
                  }}
                  className="w-full"
                >
                  Back
                </Button>
              </div>
            )}

            {step === "backup-code" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  For additional security, please enter one of your backup codes. You should have received these when you enabled two-factor authentication.
                </p>
                <Input
                  placeholder="XXXXXXXX"
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                  maxLength={8}
                  className="text-center text-lg tracking-widest font-mono"
                />
                <Button
                  onClick={handleBackupCodeSubmit}
                  disabled={loading || backupCode.length !== 8}
                  className="w-full"
                >
                  {loading ? "Verifying..." : "Continue"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep("verify")
                    setBackupCode("")
                  }}
                  className="w-full"
                >
                  Back
                </Button>
                <Button
                  variant="link"
                  className="w-full text-sm"
                >
                  Don't have a backup code?
                </Button>
              </div>
            )}

            {step === "reset-password" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enter a new password for your account.
                </p>
                <Input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
                  <p className="font-medium mb-2">Password requirements:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>At least 8 characters</li>
                    <li>Uppercase and lowercase letters</li>
                    <li>Numbers and special characters</li>
                  </ul>
                </div>
                <Button
                  onClick={handleResetPassword}
                  disabled={loading || !newPassword || !confirmPassword}
                  className="w-full"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
              </div>
            )}

            {step === "success" && (
              <div className="space-y-4 text-center">
                <div className="flex justify-center">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="font-semibold">Account Recovery Complete</h3>
                <p className="text-sm text-muted-foreground">
                  Your password has been reset successfully. You can now log in with your new password.
                </p>
                <Button className="w-full" onClick={() => (window.location.href = "/login")}>
                  Go to Login
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Standalone component for recovery page
export function AccountRecoveryPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <AccountRecovery />
    </div>
  )
}
