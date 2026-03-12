/**
 * Centralized Logging System
 * Provides structured logging across the application
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  context: string
  message: string
  data?: Record<string, any>
  userId?: string
  requestId?: string
  error?: {
    code?: string
    message: string
    stack?: string
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Logger Implementation
// ─────────────────────────────────────────────────────────────────────────────

class Logger {
  private context: string

  constructor(context: string) {
    this.context = context
  }

  private formatLog(level: LogLevel, message: string, data?: Record<string, any>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      data: data ? sanitizeData(data) : undefined,
    }
  }

  debug(message: string, data?: Record<string, any>): void {
    if (process.env.NODE_ENV === 'development') {
      const log = this.formatLog(LogLevel.DEBUG, message, data)
      console.debug(JSON.stringify(log))
    }
  }

  info(message: string, data?: Record<string, any>, userId?: string): void {
    const log = this.formatLog(LogLevel.INFO, message, data)
    if (userId) log.userId = userId
    console.log(JSON.stringify(log))
  }

  warn(message: string, data?: Record<string, any>, userId?: string): void {
    const log = this.formatLog(LogLevel.WARN, message, data)
    if (userId) log.userId = userId
    console.warn(JSON.stringify(log))
  }

  error(message: string, error?: Error | any, data?: Record<string, any>, userId?: string): void {
    const log = this.formatLog(LogLevel.ERROR, message, data)
    if (userId) log.userId = userId

    if (error) {
      log.error = {
        code: error.code || 'UNKNOWN',
        message: error.message || String(error),
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      }
    }

    console.error(JSON.stringify(log))
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Logger Factory
// ─────────────────────────────────────────────────────────────────────────────

const loggers = new Map<string, Logger>()

export function getLogger(context: string): Logger {
  if (!loggers.has(context)) {
    loggers.set(context, new Logger(context))
  }
  return loggers.get(context)!
}

// ─────────────────────────────────────────────────────────────────────────────
// Audit Logging
// ─────────────────────────────────────────────────────────────────────────────

export interface AuditEvent {
  timestamp: string
  userId: string
  action: string
  resource: string
  resourceId?: string
  changes?: Record<string, { before: any; after: any }>
  status: 'success' | 'failure'
  ipAddress?: string
  userAgent?: string
}

export function logAuditEvent(
  userId: string,
  action: string,
  resource: string,
  status: 'success' | 'failure' = 'success',
  options?: {
    resourceId?: string
    changes?: Record<string, { before: any; after: any }>
    ipAddress?: string
    userAgent?: string
  }
): void {
  const auditLogger = getLogger('AUDIT')
  const event: AuditEvent = {
    timestamp: new Date().toISOString(),
    userId,
    action,
    resource,
    status,
    ...options,
  }

  auditLogger.info(`${action} on ${resource}`, event, userId)
}

// ─────────────────────────────────────────────────────────────────────────────
// Performance Logging
// ─────────────────────────────────────────────────────────────────────────────

export class PerformanceTimer {
  private startTime: number
  private context: string
  private logger: Logger

  constructor(context: string) {
    this.startTime = Date.now()
    this.context = context
    this.logger = getLogger('PERFORMANCE')
  }

  end(message: string, threshold?: number): number {
    const duration = Date.now() - this.startTime

    if (!threshold || duration > threshold) {
      this.logger.info(`${message} [${duration}ms]`, { context: this.context, duration })
    }

    return duration
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Sensitive Data Filtering
// ─────────────────────────────────────────────────────────────────────────────

const SENSITIVE_KEYS = [
  'password',
  'passwordHash',
  'token',
  'accessToken',
  'refreshToken',
  'secret',
  'apiKey',
  'creditCard',
  'ssn',
  'bankAccount',
  'privateKey',
]

function sanitizeData(data: Record<string, any>): Record<string, any> {
  const sanitized = { ...data }

  for (const [key, value] of Object.entries(sanitized)) {
    if (SENSITIVE_KEYS.some((sensitive) => key.toLowerCase().includes(sensitive.toLowerCase()))) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeData(value)
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'object' && item !== null ? sanitizeData(item) : item
      )
    }
  }

  return sanitized
}

// ─────────────────────────────────────────────────────────────────────────────
// Pre-configured Loggers
// ─────────────────────────────────────────────────────────────────────────────

export const authLogger = getLogger('AUTH')
export const dbLogger = getLogger('DATABASE')
export const apiLogger = getLogger('API')
export const investmentLogger = getLogger('INVESTMENT')
export const transactionLogger = getLogger('TRANSACTION')
export const validationLogger = getLogger('VALIDATION')
