import { headers } from 'next/headers'
import { cookies } from 'next/headers'
import type { UserRow } from './db'
import { get as queryDb } from './db'
import { verifyToken } from './auth'

export interface Session {
  userId: string
  email: string
  role: 'user' | 'admin'
  verified: boolean
  expiresAt: number
}

export interface AuthResult {
  success: true
  session: Session
  user: UserRow
}

export interface AuthError {
  success: false
  code: 'NO_SESSION' | 'INVALID_SESSION' | 'SESSION_EXPIRED' | 'UNAUTHORIZED'
  message: string
}

export type AuthResponse = AuthResult | AuthError

// Session Storage & Validation
export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('vault_token')?.value
    if (!token) return null

    const payload = verifyToken(token)
    if (!payload) return null

    return {
      userId: payload.id,
      email: payload.email,
      role: (payload.role as 'user' | 'admin') ?? 'user',
      verified: true,
      // JWT expiry is authoritative; this mirrors the 7d max-age
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    }
  } catch (error) {
    console.error('Error retrieving session:', error)
    return null
  }
}

// Authenticate request with session validation
export async function authenticateRequest(): Promise<AuthResponse> {
  const session = await getSession()

  if (!session) {
    return {
      success: false,
      code: 'NO_SESSION',
      message: 'No active session found. Please log in.',
    }
  }

  // Verify session hasn't expired (defensive; JWT is already time-bound)
  if (session.expiresAt < Date.now()) {
    return {
      success: false,
      code: 'SESSION_EXPIRED',
      message: 'Session has expired. Please log in again.',
    }
  }

  try {
    const user = await queryDb<UserRow>('SELECT * FROM users WHERE id = ?', [session.userId])

    if (!user) {
      return {
        success: false,
        code: 'INVALID_SESSION',
        message: 'User not found. Session is invalid.',
      }
    }

    return { success: true, session, user }
  } catch (error) {
    console.error('Error validating session:', error)
    return {
      success: false,
      code: 'INVALID_SESSION',
      message: 'Error validating session. Please try again.',
    }
  }
}

// Role check helper
export async function requireRole(role: 'user' | 'admin'): Promise<AuthResponse> {
  const auth = await authenticateRequest()

  if (!auth.success) return auth

  if (auth.session.role !== role && auth.session.role !== 'admin') {
    return {
      success: false,
      code: 'UNAUTHORIZED',
      message: `This action requires ${role} role.`,
    }
  }

  return auth as AuthResult
}

// Verify user ID matches current session
export async function verifyOwnResource(requestedUserId: string): Promise<boolean> {
  const auth = await authenticateRequest()

  if (!auth.success) return false

  if (auth.session.role === 'admin') return true

  return auth.session.userId === requestedUserId
}

// Error responses for API routes
export function unauthorizedResponse(message: string, statusCode = 401) {
  return Response.json(
    { error: message, code: 'UNAUTHORIZED' },
    { status: statusCode }
  )
}

export function forbiddenResponse(message: string) {
  return unauthorizedResponse(message, 403)
}
