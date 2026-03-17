import { useMemo } from "react"
import { Check, X } from "lucide-react"

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4
  label: string
  color: string
  percentage: number
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0

  // Length checks
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (password.length >= 16) score++

  // Character variety checks
  if (/[a-z]/.test(password)) score += 0
  if (/[A-Z]/.test(password)) score += 0
  if (/[0-9]/.test(password)) score += 0
  if (/[^a-zA-Z0-9]/.test(password)) score += 0

  // Boost if has multiple character types
  const typeCount = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter((regex) =>
    regex.test(password)
  ).length

  if (typeCount >= 2) score++
  if (typeCount >= 3) score++
  if (typeCount === 4) score++

  // Cap at 4
  score = Math.min(4, score)

  const strengthMap: Record<
    number,
    { label: string; color: string; percentage: number }
  > = {
    0: { label: "Very Weak", color: "bg-red-500", percentage: 20 },
    1: { label: "Weak", color: "bg-orange-500", percentage: 40 },
    2: { label: "Fair", color: "bg-yellow-500", percentage: 60 },
    3: { label: "Strong", color: "bg-lime-500", percentage: 80 },
    4: { label: "Very Strong", color: "bg-green-500", percentage: 100 },
  }

  const strength = strengthMap[score]
  return {
    score: score as 0 | 1 | 2 | 3 | 4,
    ...strength,
  }
}

export function getPasswordRequirements(password: string) {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^a-zA-Z0-9]/.test(password),
  }
}

interface PasswordStrengthMeterProps {
  password: string
  showRequirements?: boolean
}

export function PasswordStrengthMeter({
  password,
  showRequirements = true,
}: PasswordStrengthMeterProps) {
  const strength = useMemo(() => calculatePasswordStrength(password), [password])
  const requirements = useMemo(() => getPasswordRequirements(password), [password])

  if (!password) return null

  return (
    <div className="space-y-3 py-2">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground">
            Password Strength
          </label>
          <span className="text-xs font-semibold text-foreground">
            {strength.label}
          </span>
        </div>
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full ${strength.color} transition-all duration-300`}
            style={{ width: `${strength.percentage}%` }}
          />
        </div>
      </div>

      {/* Requirements */}
      {showRequirements && (
        <div className="space-y-2 pt-2">
          <p className="text-xs font-medium text-muted-foreground">
            Password must contain:
          </p>
          <ul className="space-y-1">
            <li className="flex items-center gap-2 text-xs">
              {requirements.length ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <X className="h-3.5 w-3.5 text-red-500" />
              )}
              <span className={requirements.length ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                At least 8 characters
              </span>
            </li>
            <li className="flex items-center gap-2 text-xs">
              {requirements.uppercase ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <X className="h-3.5 w-3.5 text-red-500" />
              )}
              <span className={requirements.uppercase ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                One uppercase letter (A-Z)
              </span>
            </li>
            <li className="flex items-center gap-2 text-xs">
              {requirements.lowercase ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <X className="h-3.5 w-3.5 text-red-500" />
              )}
              <span className={requirements.lowercase ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                One lowercase letter (a-z)
              </span>
            </li>
            <li className="flex items-center gap-2 text-xs">
              {requirements.number ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <X className="h-3.5 w-3.5 text-red-500" />
              )}
              <span className={requirements.number ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                One number (0-9)
              </span>
            </li>
            <li className="flex items-center gap-2 text-xs">
              {requirements.special ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <X className="h-3.5 w-3.5 text-red-500" />
              )}
              <span className={requirements.special ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                One special character (!@#$%^&*)
              </span>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
