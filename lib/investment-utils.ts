/**
 * Investment Utility Functions
 * Handles all calculations for investment progress and accumulated profit
 */

export interface InvestmentCalculation {
  progressPercentage: number
  accumulatedProfit: number
  currentValue: number
  isMatured: boolean
  daysRemaining: number
  daysPassed: number
  totalDays: number
}

/**
 * Safe number conversion with validation
 */
export function safeNumber(value: unknown, defaultValue: number = 0): number {
  if (value == null) return defaultValue
  const num = Number(value)
  return Number.isFinite(num) ? num : defaultValue
}

/**
 * Calculate investment progress percentage based on elapsed time
 * Returns a value between 0 and 100
 */
export function calculateProgressPercentage(
  startDate: string | Date,
  endDate: string | Date
): number {
  try {
    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime()
    const now = Date.now()

    const totalDuration = end - start
    const elapsed = now - start

    if (elapsed <= 0) return 0
    if (elapsed >= totalDuration) return 100

    const percentage = (elapsed / totalDuration) * 100
    return Math.max(0, Math.min(100, Math.round(percentage * 100) / 100)) // Round to 2 decimals
  } catch (error) {
    console.error("Error calculating progress percentage:", error)
    return 0
  }
}

/**
 * Calculate accumulated profit based on expected profit and progress percentage
 */
export function calculateAccumulatedProfit(
  expectedProfit: unknown,
  progressPercentage: unknown
): number {
  const safeProfitRate = safeNumber(expectedProfit, 0)
  const safeProgress = safeNumber(progressPercentage, 0)

  // Clamp progress between 0-100
  const clampedProgress = Math.max(0, Math.min(100, safeProgress))

  // Calculate accumulated: expectedProfit * (progressPercentage / 100)
  const accumulated = safeProfitRate * (clampedProgress / 100)

  return Math.max(0, Math.round(accumulated * 100) / 100) // Round to 2 decimals
}

/**
 * Calculate current investment value (principal + accumulated profit)
 */
export function calculateCurrentValue(
  principalAmount: unknown,
  accumulatedProfit: unknown
): number {
  const principal = safeNumber(principalAmount, 0)
  const profit = safeNumber(accumulatedProfit, 0)
  return Math.max(0, Math.round((principal + profit) * 100) / 100)
}

/**
 * Calculate days remaining for investment
 */
export function calculateDaysRemaining(endDate: string | Date): number {
  try {
    const end = new Date(endDate).getTime()
    const now = Date.now()
    const remaining = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
    return Math.max(0, remaining)
  } catch (error) {
    console.error("Error calculating days remaining:", error)
    return 0
  }
}

/**
 * Calculate days passed since investment start
 */
export function calculateDaysPassed(startDate: string | Date): number {
  try {
    const start = new Date(startDate).getTime()
    const now = Date.now()
    const passed = Math.floor((now - start) / (1000 * 60 * 60 * 24))
    return Math.max(0, passed)
  } catch (error) {
    console.error("Error calculating days passed:", error)
    return 0
  }
}

/**
 * Calculate total days for investment duration
 */
export function calculateTotalDays(startDate: string | Date, endDate: string | Date): number {
  try {
    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime()
    const total = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    return Math.max(0, total)
  } catch (error) {
    console.error("Error calculating total days:", error)
    return 0
  }
}

/**
 * Comprehensive investment calculation
 * Calculates all relevant metrics for an investment at the current time
 */
export function calculateInvestmentMetrics(
  startDate: string | Date,
  endDate: string | Date,
  expectedProfit: unknown
): InvestmentCalculation {
  const progressPercentage = calculateProgressPercentage(startDate, endDate)
  const accumulatedProfit = calculateAccumulatedProfit(expectedProfit, progressPercentage)
  const daysRemaining = calculateDaysRemaining(endDate)
  const daysPassed = calculateDaysPassed(startDate)
  const totalDays = calculateTotalDays(startDate, endDate)
  const isMatured = progressPercentage >= 100

  return {
    progressPercentage,
    accumulatedProfit,
    currentValue: accumulatedProfit, // This will be combined with principal in the component
    isMatured,
    daysRemaining,
    daysPassed,
    totalDays,
  }
}

/**
 * Validate investment amount against plan constraints
 */
export function validateInvestmentAmount(
  amount: unknown,
  minAmount: unknown,
  maxAmount: unknown
): { isValid: boolean; error?: string } {
  const safeAmount = safeNumber(amount)
  const safeMin = safeNumber(minAmount, 0)
  const safeMax = safeNumber(maxAmount, Infinity)

  if (safeAmount <= 0) {
    return { isValid: false, error: "Investment amount must be greater than 0" }
  }

  if (safeAmount < safeMin) {
    return {
      isValid: false,
      error: `Minimum investment is $${safeMin.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
    }
  }

  if (safeAmount > safeMax) {
    return {
      isValid: false,
      error: `Maximum investment is $${safeMax.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
    }
  }

  return { isValid: true }
}

/**
 * Calculate expected profit for a given amount and return rate
 */
export function calculateExpectedProfit(
  amount: unknown,
  returnRate: unknown
): number {
  const safeAmount = safeNumber(amount, 0)
  const safeRate = safeNumber(returnRate, 0)

  // Calculate: amount * (rate / 100)
  const profit = safeAmount * (safeRate / 100)

  return Math.max(0, Math.round(profit * 100) / 100)
}

/**
 * Format investment percentage for display
 */
export function formatPercentage(
  value: unknown,
  decimals: number = 2
): string {
  const num = safeNumber(value, 0)
  const clamped = Math.max(0, Math.min(100, num))
  return clamped.toFixed(decimals)
}

/**
 * Format currency for display
 */
export function formatCurrency(value: unknown): string {
  if (value == null || !Number.isFinite(Number(value))) return "$0.00"
  try {
    return Number(value).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    })
  } catch (e) {
    return "$0.00"
  }
}
