import { z } from 'zod'

// ─────────────────────────────────────────────────────────────────────────────
// Authentication Schemas
// ─────────────────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain uppercase, lowercase, number, and special character'
  ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain uppercase, lowercase, number, and special character'
  ),
})

// ─────────────────────────────────────────────────────────────────────────────
// Investment Schemas
// ─────────────────────────────────────────────────────────────────────────────

export const investmentSchema = z.object({
  amount: z.number()
    .positive('Amount must be greater than 0')
    .max(1000000, 'Amount cannot exceed $1,000,000')
    .finite('Amount must be a valid number'),
  planId: z.string().uuid('Invalid plan ID'),
  depositMethod: z.enum(['bank_transfer', 'crypto', 'card']),
})

export const investmentPlanSchema = z.object({
  name: z.string().min(3, 'Plan name must be at least 3 characters'),
  minAmount: z.number().positive('Minimum amount must be greater than 0'),
  maxAmount: z.number().positive('Maximum amount must be greater than 0'),
  returnRate: z.number().positive('Return rate must be greater than 0').max(100),
  duration: z.number().positive('Duration must be greater than 0'),
  durationUnit: z.enum(['days', 'weeks', 'months', 'years']),
  risk: z.enum(['Low', 'Medium', 'High']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
}).refine((data) => data.minAmount <= data.maxAmount, {
  message: "Minimum amount must be less than or equal to maximum amount",
  path: ["minAmount"],
})

// ─────────────────────────────────────────────────────────────────────────────
// Transaction Schemas
// ─────────────────────────────────────────────────────────────────────────────

export const depositSchema = z.object({
  amount: z.number()
    .positive('Deposit amount must be greater than 0')
    .max(100000, 'Maximum deposit is $100,000'),
  method: z.enum(['bank_transfer', 'crypto', 'card']),
  description: z.string().optional(),
})

export const withdrawalSchema = z.object({
  amount: z.number()
    .positive('Withdrawal amount must be greater than 0'),
  depositMethod: z.enum(['bank_transfer', 'crypto']),
  accountDetails: z.string().min(10, 'Account details are required'),
})

export const transactionSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  type: z.enum(['deposit', 'withdrawal', 'investment', 'return']),
  amount: z.number().positive('Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required'),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
})

// ─────────────────────────────────────────────────────────────────────────────
// Wallet Schemas
// ─────────────────────────────────────────────────────────────────────────────

export const walletAddressSchema = z.object({
  coin: z.enum(['bitcoin', 'ethereum', 'usdt', 'usdc']),
  network: z.string().min(1, 'Network is required'),
  address: z.string().regex(
    /^[a-zA-Z0-9]{20,200}$/,
    'Invalid wallet address format'
  ),
})

// ─────────────────────────────────────────────────────────────────────────────
// Notification Schemas
// ─────────────────────────────────────────────────────────────────────────────

export const notificationSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  title: z.string().min(1, 'Title is required').max(200),
  message: z.string().min(1, 'Message is required').max(1000),
  type: z.enum(['success', 'info', 'warning', 'error']),
  actionUrl: z.string().url('Invalid URL').optional(),
})

// ─────────────────────────────────────────────────────────────────────────────
// Admin Schemas
// ─────────────────────────────────────────────────────────────────────────────

export const adminApprovalSchema = z.object({
  transactionId: z.string().min(1, 'Transaction ID is required'),
  approved: z.boolean(),
  notes: z.string().max(500).optional(),
})

// ─────────────────────────────────────────────────────────────────────────────
// Type exports for TypeScript
// ─────────────────────────────────────────────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type InvestmentInput = z.infer<typeof investmentSchema>
export type DepositInput = z.infer<typeof depositSchema>
export type WithdrawalInput = z.infer<typeof withdrawalSchema>
export type TransactionInput = z.infer<typeof transactionSchema>
export type WalletAddressInput = z.infer<typeof walletAddressSchema>
export type NotificationInput = z.infer<typeof notificationSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Validation Result Types
// ─────────────────────────────────────────────────────────────────────────────

export type ValidationResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string; details?: Record<string, string[]> }

// ─────────────────────────────────────────────────────────────────────────────
// Validation Helper
// ─────────────────────────────────────────────────────────────────────────────

export function validate<T>(
  schema: z.Schema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string[]> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        if (!fieldErrors[path]) fieldErrors[path] = []
        fieldErrors[path].push(err.message)
      })
      return {
        success: false,
        error: 'Validation failed',
        details: fieldErrors,
      }
    }
    return { success: false, error: 'Unknown validation error' }
  }
}
