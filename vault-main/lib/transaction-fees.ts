/**
 * Transaction Fee Structure
 */
export const TRANSACTION_FEES = {
  DEPOSIT: {
    rate: 0.01, // 1%
    min: 0,
    max: 50,
  },
  WITHDRAWAL: {
    rate: 0.02, // 2%
    min: 5,
    max: 100,
  },
  INVESTMENT: {
    rate: 0, // No fee
    min: 0,
    max: 0,
  },
  RETURN: {
    rate: 0, // No fee
    min: 0,
    max: 0,
  },
} as const

export type TransactionType = keyof typeof TRANSACTION_FEES

export interface FeeBreakdown {
  subtotal: number
  feeAmount: number
  feePercentage: number
  total: number
  feeStructure: {
    rate: number
    min: number
    max: number
  }
}

/**
 * Calculate transaction fee
 */
export function calculateTransactionFee(
  amount: number,
  type: TransactionType
): FeeBreakdown {
  const feeStructure = TRANSACTION_FEES[type]

  if (feeStructure.rate === 0) {
    return {
      subtotal: amount,
      feeAmount: 0,
      feePercentage: 0,
      total: amount,
      feeStructure,
    }
  }

  let feeAmount = amount * feeStructure.rate

  // Apply min and max constraints
  if (feeStructure.min && feeAmount < feeStructure.min) {
    feeAmount = feeStructure.min
  }
  if (feeStructure.max && feeAmount > feeStructure.max) {
    feeAmount = feeStructure.max
  }

  return {
    subtotal: amount,
    feeAmount: Math.round(feeAmount * 100) / 100,
    feePercentage: feeStructure.rate * 100,
    total: Math.round((amount - feeAmount) * 100) / 100,
    feeStructure,
  }
}

/**
 * Format fee for display
 */
export function formatFee(fee: FeeBreakdown): string {
  if (fee.feeAmount === 0) {
    return "No fee"
  }
  return `$${fee.feeAmount.toFixed(2)} (${fee.feePercentage}%)`
}
