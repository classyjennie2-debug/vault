// import Database from 'better-sqlite3'
// NOTE: This file is legacy SQLite-specific code. We use PostgreSQL now.

// ─────────────────────────────────────────────────────────────────────────────
// Transaction Management for SQLite (DEPRECATED)
// ─────────────────────────────────────────────────────────────────────────────

/*
export class SqliteTransaction {
  private db: any // Database.Database
  private isActive = false

  constructor(db: any) {
    this.db = db
  }

  begin(): void {
    if (this.isActive) {
      throw new Error('Transaction already in progress')
    }
    this.db.exec('BEGIN TRANSACTION')
    this.isActive = true
  }

  commit(): void {
    if (!this.isActive) {
      throw new Error('No active transaction')
    }
    this.db.exec('COMMIT')
    this.isActive = false
  }

  rollback(): void {
    if (!this.isActive) {
      throw new Error('No active transaction')
    }
    this.db.exec('ROLLBACK')
    this.isActive = false
  }

  isTransactionActive(): boolean {
    return this.isActive
  }
}
*/

// Placeholder export to prevent import errors
export class SqliteTransaction {
  constructor(db: any) {}
  begin(): void {}
  commit(): void {}
  rollback(): void {}
  isTransactionActive(): boolean { return false }
}

// ─────────────────────────────────────────────────────────────────────────────
// Safe Query Execution with Error Handling
// ─────────────────────────────────────────────────────────────────────────────

export interface QueryError {
  code: string
  message: string
  details?: Record<string, unknown>
}

export async function safeQuery<T>(
  fn: () => Promise<T> | T,
  context: string = 'database operation'
): Promise<{ success: true; data: T } | { success: false; error: QueryError }> {
  try {
    const data = await fn()
    return { success: true, data }
  } catch (error: any) {
    const code = error?.code || 'UNKNOWN_ERROR'
    const message = error?.message || `An error occurred during ${context}`

    return {
      success: false,
      error: {
        code,
        message,
        details: error?.detail ? { detail: error.detail } : undefined,
      },
    }
  }
}
