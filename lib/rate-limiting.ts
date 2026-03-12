/**
 * Rate Limiting Middleware
 * Prevents abuse and DoS attacks
 */

import { headers } from 'next/headers'

// ─────────────────────────────────────────────────────────────────────────────
// In-Memory Rate Limit Store
// ─────────────────────────────────────────────────────────────────────────────

interface RateLimitEntry {
  count: number
  resetAt: number
}

class RateLimitStore {
  private store = new Map<string, RateLimitEntry>()
  private cleanupInterval = 60000 // Clean up every minute

  constructor() {
    if (typeof window === 'undefined') {
      // Only set up cleanup on server side
      setInterval(() => this.cleanup(), this.cleanupInterval)
    }
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetAt < now) {
        this.store.delete(key)
      }
    }
  }

  get(key: string): number {
    const entry = this.store.get(key)
    if (!entry) return 0

    if (entry.resetAt < Date.now()) {
      this.store.delete(key)
      return 0
    }

    return entry.count
  }

  increment(key: string, windowMs: number): number {
    const now = Date.now()
    const entry = this.store.get(key)

    if (entry && entry.resetAt > now) {
      entry.count++
      return entry.count
    }

    this.store.set(key, { count: 1, resetAt: now + windowMs })
    return 1
  }
}

const rateLimitStore = new RateLimitStore()

// ─────────────────────────────────────────────────────────────────────────────
// Rate Limit Configurations
// ─────────────────────────────────────────────────────────────────────────────

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
  keyFn?: (req: Request) => string // Function to generate rate limit key
  skipKey?: string // Skip rate limiting if this header is present (for testing)
}

export const rateLimitConfigs = {
  // Auth endpoints: 5 attempts per 15 minutes
  auth: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
  },

  // Login endpoint: 5 attempts per 15 minutes
  login: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
  },

  // Register endpoint: 3 attempts per hour
  register: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 3,
  },

  // Password reset: 3 attempts per hour
  passwordReset: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 3,
  },

  // API endpoints: 100 requests per minute
  api: {
    windowMs: 60 * 1000,
    maxRequests: 100,
  },

  // Investment endpoints: 10 requests per minute
  investment: {
    windowMs: 60 * 1000,
    maxRequests: 10,
  },

  // Deposit/Withdrawal: 5 requests per hour
  transaction: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 5,
  },

  // General API: 1000 requests per hour
  general: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 1000,
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Rate Limit Checker
// ─────────────────────────────────────────────────────────────────────────────

export interface RateLimitResult {
  limited: boolean
  remaining: number
  resetAt: number
  retryAfter?: number
}

export async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = Date.now()
  const count = rateLimitStore.increment(key, config.windowMs)

  const entry = (rateLimitStore as any).store.get(key)
  const resetAt = entry?.resetAt || now + config.windowMs
  const remaining = Math.max(0, config.maxRequests - count)
  const limited = count > config.maxRequests

  return {
    limited,
    remaining,
    resetAt,
    retryAfter: limited ? Math.ceil((resetAt - now) / 1000) : undefined,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Rate Limit Middleware for API Routes
// ─────────────────────────────────────────────────────────────────────────────

export function createRateLimitMiddleware(config: RateLimitConfig) {
  return async (request: Request): Promise<Response | null> => {
    const headersList = await headers()
    const skipKey = headersList.get('x-skip-rate-limit')

    // Allow skipping in development/testing
    if (skipKey === process.env.RATE_LIMIT_SKIP_KEY) {
      return null // Continue to next middleware
    }

    // Generate rate limit key (IP address by default)
    const key = config.keyFn
      ? config.keyFn(request)
      : headersList.get('x-forwarded-for') || 'unknown'

    const result = await checkRateLimit(key, config)

    if (result.limited) {
      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Retry-After': String(result.retryAfter),
            'X-RateLimit-Limit': String(config.maxRequests),
            'X-RateLimit-Remaining': String(result.remaining),
            'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
          },
        }
      )
    }

    // Add rate limit info to headers for logging
    return null // Continue to next middleware
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Response Helper with Rate Limit Headers
// ─────────────────────────────────────────────────────────────────────────────

export async function rateLimitedResponse<T>(
  key: string,
  config: RateLimitConfig,
  fn: () => Promise<Response>
): Promise<Response> {
  const result = await checkRateLimit(key, config)

  if (result.limited) {
    return new Response(
      JSON.stringify({
        error: 'Too many requests',
        retryAfter: result.retryAfter,
      }),
      {
        status: 429,
        headers: {
          'Retry-After': String(result.retryAfter),
          'X-RateLimit-Limit': String(config.maxRequests),
          'X-RateLimit-Remaining': String(result.remaining),
          'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
        },
      }
    )
  }

  const response = await fn()

  // Add rate limit headers to response
  response.headers.set('X-RateLimit-Limit', String(config.maxRequests))
  response.headers.set('X-RateLimit-Remaining', String(result.remaining))
  response.headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)))

  return response
}

// ─────────────────────────────────────────────────────────────────────────────
// Get Client IP
// ─────────────────────────────────────────────────────────────────────────────

export async function getClientIp(request: Request): Promise<string> {
  const headersList = await headers()
  return (
    headersList.get('x-forwarded-for')?.split(',')[0] ||
    headersList.get('x-real-ip') ||
    headersList.get('cf-connecting-ip') ||
    'unknown'
  )
}
