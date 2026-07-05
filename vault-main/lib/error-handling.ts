/**
 * Centralized Error Handling
 * Provides consistent error responses across the application
 */

export enum ErrorCode {
  // Authentication Errors (400-499)
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',

  // Validation Errors (4001-4020)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  INVALID_PLAN = 'INVALID_PLAN',

  // Database Errors (5001-5020)
  DATABASE_ERROR = 'DATABASE_ERROR',
  RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',
  DUPLICATE_RECORD = 'DUPLICATE_RECORD',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',

  // Server Errors (500-599)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',

  // Unknown
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AppError {
  code: ErrorCode
  message: string
  statusCode: number
  details?: Record<string, unknown>
  stack?: string
}

export interface ErrorResponse {
  error: {
    code: ErrorCode
    message: string
    details?: Record<string, unknown>
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Error Classification
// ─────────────────────────────────────────────────────────────────────────────

export class ValidationError extends Error {
  code = ErrorCode.VALIDATION_ERROR
  statusCode = 400
  details?: Record<string, string[]>

  constructor(message: string, details?: Record<string, string[]>) {
    super(message)
    this.name = 'ValidationError'
    this.details = details
  }
}

export class AuthenticationError extends Error {
  code = ErrorCode.INVALID_CREDENTIALS
  statusCode = 401

  constructor(message = 'Invalid credentials') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends Error {
  code = ErrorCode.FORBIDDEN
  statusCode = 403

  constructor(message = 'Access denied') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends Error {
  code = ErrorCode.RECORD_NOT_FOUND
  statusCode = 404

  constructor(resource: string) {
    super(`${resource} not found`)
    this.name = 'NotFoundError'
  }
}

export class DuplicateError extends Error {
  code = ErrorCode.DUPLICATE_RECORD
  statusCode = 409

  constructor(resource: string) {
    super(`${resource} already exists`)
    this.name = 'DuplicateError'
  }
}

export class InsufficientFundsError extends Error {
  code = ErrorCode.INSUFFICIENT_BALANCE
  statusCode = 400

  constructor(available: number, required: number) {
    super(`Insufficient balance. Available: $${available}, Required: $${required}`)
    this.name = 'InsufficientFundsError'
  }
}

export class DatabaseError extends Error {
  code = ErrorCode.DATABASE_ERROR
  statusCode = 500

  constructor(message = 'Database operation failed', public originalError?: Error) {
    super(message)
    this.name = 'DatabaseError'
  }
}

export class TransactionError extends Error {
  code = ErrorCode.TRANSACTION_FAILED
  statusCode = 500

  constructor(message = 'Transaction failed', public originalError?: Error) {
    super(message)
    this.name = 'TransactionError'
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Error Handling Utilities
// ─────────────────────────────────────────────────────────────────────────────

export function mapErrorToResponse(error: any): AppError {
  // Handle known error types
  if (error instanceof ValidationError) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details ? { fieldErrors: error.details } : undefined,
    }
  }

  if (error instanceof AuthenticationError) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
    }
  }

  if (error instanceof AuthorizationError) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
    }
  }

  if (error instanceof NotFoundError) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
    }
  }

  if (error instanceof DuplicateError) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
    }
  }

  if (error instanceof InsufficientFundsError) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
    }
  }

  if (error instanceof DatabaseError) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      details: process.env.NODE_ENV === 'development' ? { original: error.originalError?.message } : undefined,
    }
  }

  if (error instanceof TransactionError) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
    }
  }

  // Default to generic error
  return {
    code: ErrorCode.INTERNAL_ERROR,
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : error?.message || 'Unknown error',
    statusCode: 500,
    stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
  }
}

export function createErrorResponse(appError: AppError): Response {
  return Response.json(
    {
      error: {
        code: appError.code,
        message: appError.message,
        ...(appError.details && { details: appError.details }),
      },
    },
    { status: appError.statusCode }
  )
}

/**
 * Wrapper for safe async function execution in API routes
 */
export async function safeExecute<T>(
  fn: () => Promise<T>,
  context: string = 'operation'
): Promise<{ success: true; data: T } | { success: false; error: AppError }> {
  try {
    const data = await fn()
    return { success: true, data }
  } catch (error: any) {
    const appError = mapErrorToResponse(error)
    console.error(`Error during ${context}:`, appError)
    return { success: false, error: appError }
  }
}
