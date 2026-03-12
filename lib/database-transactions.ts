import Database from 'better-sqlite3'
import { Pool } from 'pg'

// ─────────────────────────────────────────────────────────────────────────────
// Transaction Management for SQLite
// ─────────────────────────────────────────────────────────────────────────────

export class SqliteTransaction {
  private db: Database.Database
  private isActive = false

  constructor(db: Database.Database) {
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

// ─────────────────────────────────────────────────────────────────────────────
// Transaction Management for PostgreSQL
// ─────────────────────────────────────────────────────────────────────────────

export class PostgresTransaction {
  private pool: Pool
  private client: any = null
  private isActive = false

  constructor(pool: Pool) {
    this.pool = pool
  }

  async begin(): Promise<void> {
    if (this.isActive) {
      throw new Error('Transaction already in progress')
    }
    this.client = await this.pool.connect()
    await this.client.query('BEGIN')
    this.isActive = true
  }

  async commit(): Promise<void> {
    if (!this.isActive || !this.client) {
      throw new Error('No active transaction')
    }
    try {
      await this.client.query('COMMIT')
    } finally {
      this.client.release()
      this.isActive = false
    }
  }

  async rollback(): Promise<void> {
    if (!this.isActive || !this.client) {
      throw new Error('No active transaction')
    }
    try {
      await this.client.query('ROLLBACK')
    } finally {
      this.client.release()
      this.isActive = false
    }
  }

  isTransactionActive(): boolean {
    return this.isActive
  }

  getClient(): any {
    if (!this.client) {
      throw new Error('No active transaction client')
    }
    return this.client
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Unified Transaction Executor
// ─────────────────────────────────────────────────────────────────────────────

export async function withTransaction<T>(
  db: Database.Database | null,
  pool: Pool | null,
  callback: (
    tx: SqliteTransaction | PostgresTransaction,
    query: (sql: string, params?: unknown[]) => Promise<any> | any
  ) => Promise<T>
): Promise<T> {
  if (pool) {
    // PostgreSQL transaction
    const tx = new PostgresTransaction(pool)
    try {
      await tx.begin()
      const client = tx.getClient()
      const result = await callback(tx, (sql: string, params?: unknown[]) =>
        client.query(adaptSqlForPostgres(sql), params)
      )
      await tx.commit()
      return result
    } catch (error) {
      if (tx.isTransactionActive()) {
        await tx.rollback()
      }
      throw error
    }
  } else if (db) {
    // SQLite transaction
    const tx = new SqliteTransaction(db)
    try {
      tx.begin()
      const result = await callback(tx, (sql: string, params?: unknown[]) =>
        db.prepare(sql).run(...(params || []))
      )
      tx.commit()
      return result
    } catch (error) {
      if (tx.isTransactionActive()) {
        tx.rollback()
      }
      throw error
    }
  } else {
    throw new Error('No database configured')
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SQL Adapter for PostgreSQL Parameter Placeholder
// ─────────────────────────────────────────────────────────────────────────────

function adaptSqlForPostgres(sql: string): string {
  let idx = 0
  return sql.replace(/\?/g, () => `$${++idx}`)
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
