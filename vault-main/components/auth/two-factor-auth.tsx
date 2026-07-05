"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Copy, Check, Lock } from "lucide-react"

interface TwoFactorSetupProps {
  onSetupComplete?: (backupCodes: string[]) => void
  enabled?: boolean
}

export function TwoFactorSetup({ onSetupComplete, enabled = false }: TwoFactorSetupProps) {
  const [step, setStep] = useState<"initial" | "setup" | "verify" | "backup">("initial")
  const [qrCode, setQrCode] = useState("")
  const [secret, setSecret] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleInitiateSetup = async () => {
    setLoading(true)
    setError("")
    try {
      // Call API to generate QR code and secret
      const response = await fetch("/api/auth/2fa/setup", {
        method: "POST",
      })
      if (!response.ok) throw new Error("Failed to initiate setup")
      const data = await response.json()
      setSecret(data.secret)
      setQrCode(data.qrCode)
      setStep("setup")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Setup failed")
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret,
          code: verificationCode,
        }),
      })
      if (!response.ok) throw new Error("Invalid verification code")
      const data = await response.json()
      setBackupCodes(data.backupCodes)
      setStep("backup")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed")
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteSetup = () => {
    onSetupComplete?.(backupCodes)
    setStep("initial")
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-green-600" />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900">
              <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Two-factor authentication is enabled on your account. Your login is protected with an additional security layer.
              </AlertDescription>
            </Alert>
            <Button variant="outline" className="w-full">
              Manage Backup Codes
            </Button>
            <Button
              variant="destructive"
              className="w-full"
              // onClick={() => handleDisable()}
            >
              Disable Two-Factor Authentication
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Two-Factor Authentication
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

          {step === "initial" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account by enabling two-factor authentication. You'll need an authenticator app like Google Authenticator or Authy.
              </p>
              <Button
                onClick={handleInitiateSetup}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Setting up..." : "Set Up Two-Factor Authentication"}
              </Button>
            </div>
          )}

          {step === "setup" && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg text-center">
                {qrCode && (
                  <>
                    {/* Note: In production, use next/image and proper image rendering */}
                    <div
                      className="mx-auto mb-4"
                      dangerouslySetInnerHTML={{ __html: qrCode }}
                    />
                    <p className="text-xs text-muted-foreground mb-4">
                      Scan this QR code with your authenticator app
                    </p>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Or enter this code manually:</p>
                <div className="flex gap-2">
                  <Input
                    value={secret}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(secret)}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Enter 6-digit code from your authenticator app
                </label>
                <Input
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.slice(0, 6))}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-mono"
                />
              </div>

              <Button
                onClick={handleVerify}
                disabled={loading || verificationCode.length !== 6}
                className="w-full"
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setStep("initial")
                  setVerificationCode("")
                }}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          )}

          {step === "backup" && (
            <div className="space-y-4">
              <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
                </AlertDescription>
              </Alert>

              <div className="bg-muted p-4 rounded-lg space-y-2 font-mono text-sm">
                {backupCodes.map((code, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>{code}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(code)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const text = backupCodes.join("\n")
                    copyToClipboard(text)
                  }}
                >
                  Copy All Codes
                </Button>
              </div>

              <Button onClick={handleCompleteSetup} className="w-full">
                I've Saved My Backup Codes
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function TwoFactorVerification() {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [useBackupCode, setUseBackupCode] = useState(false)

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Two-Factor Authentication
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {useBackupCode
              ? "Enter one of your backup codes"
              : "Enter the 6-digit code from your authenticator app"}
          </p>

          {error && (
            <Alert className="bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-900">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Input
            placeholder={useBackupCode ? "XXXXXXXX" : "000000"}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={useBackupCode ? 8 : 6}
            className="text-center text-2xl tracking-widest font-mono"
          />

          <Button disabled={loading || code.length === 0} className="w-full">
            {loading ? "Verifying..." : "Verify"}
          </Button>

          <Button
            variant="link"
            onClick={() => {
              setUseBackupCode(!useBackupCode)
              setCode("")
            }}
            className="w-full"
          >
            {useBackupCode ? "Use authenticator code instead" : "Use backup code"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
