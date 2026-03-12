import { headers } from 'next/headers'
import { cookies } from 'next/headers'
import type { UserRow } from './db'
import { get as queryDb } from './db'

// ─────────────────────────────────────────────────────────────────────────────
// Session Type Definition
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Session Storage & Validation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get current session from browser cookies or headers
 * Uses secure, httpOnly cookie approach (set by auth endpoints)
 */
export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')

    if (!sessionCookie?.value) {
      return null
    }

    // Parse and validate session token
    // In production, this should verify a JWT signature
    const session = parseSessionToken(sessionCookie.value)
    
    // Check if session is expired
    if (session && session.expiresAt < Date.now()) {
      // Clear expired session
      cookieStore.delete('session')
      return null
    }

    return session
  } catch (error) {
    console.error('Error retrieving session:', error)
    return null
  }
}

/**
 * Authenticate request with session validation
 * Call this from API routes to ensure user is authenticated
 */
export async function authenticateRequest(): Promise<AuthResponse> {
  const session = await getSession()

  if (!session) {
    return {
      success: false,
      code: 'NO_SESSION',
      message: 'No active session found. Please log in.',
    }
  }

  // Verify session hasn't expired
  if (session.expiresAt < Date.now()) {
    return {
      success: false,
      code: 'SESSION_EXPIRED',
      message: 'Session has expired. Please log in again.',
    }
  }

  // Fetch user from database to verify they still exist
  try {
    const user = await queryDb<UserRow>(
      'SELECT * FROM users WHERE id = ?',
      [session.userId]
    )

    if (!user) {
      return {
        success: false,
        code: 'INVALID_SESSION',
        message: 'User not found. Session is invalid.',
      }
    }

    return {
      success: true,
      session,
      user,
    }
  } catch (error) {
    console.error('Error validating session:', error)
    return {
      success: false,
      code: 'INVALID_SESSION',
      message: 'Error validating session. Please try again.',
    }
  }
}

/**
 * Check if user has required role
 */
export async function requireRole(role: 'user' | 'admin'): Promise<AuthResponse> {
  const auth = await authenticateRequest()

  if (!auth.success) {
    return auth
  }

  if (auth.session.role !== role && auth.session.role !== 'admin') {
    return {
      success: false,
      code: 'UNAUTHORIZED',
      message: `This action requires ${role} role.`,
    }
  }

  return auth as AuthResult
}

// ─────────────────────────────────────────────────────────────────────────────
// Session Token Management
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new session token
 * In production, this should create and sign a JWT
 */
export function createSessionToken(userId: string, email: string, role: 'user' | 'admin', verified: boolean): string {
  const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
  const session: Session = {
    userId,
    email,
    role,
    verified,
    expiresAt,
  }

  // In production, implement JWT creation here
  // For now, create a simple JSON token (NOTE: NOT SECURE - use JWT in production)
  return JSON.stringify(session)
}

/**
 * Parse and validate session token
 */
function parseSessionToken(token: string): Session | null {
  try {
    const session = JSON.parse(token) as Session

    // Validate required fields
    if (!session.userId || !session.email || !session.role) {
      return null
    }

    return session
  } catch (error) {
    console.error('Error parsing session token:', error)
    return null
  }
}

/**
 * Verify user ID matches current session
 * Prevents users from accessing other users' data
 */
export async function verifyOwnResource(requestedUserId: string): Promise<boolean> {
  const auth = await authenticateRequest()

  if (!auth.success) {
    return false
  }

  // Allow admins to access any user's data
  if (auth.session.role === 'admin') {
    return true
  }

  // Users can only access their own data
  return auth.session.userId === requestedUserId
}

// ─────────────────────────────────────────────────────────────────────────────
// Error Responses for API Routes
// ─────────────────────────────────────────────────────────────────────────────

export function unauthorizedResponse(message: string, statusCode = 401) {
  return Response.json(
    { error: message, code: 'UNAUTHORIZED' },
    { status: statusCode }
  )
}

export function forbiddenResponse(message: string) {
  return unauthorizedResponse(message, 403)
}
