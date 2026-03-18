import type { ActiveInvestment, InvestmentPlan } from "./types"
import type { ActivityType } from "@/components/dashboard/activity-log"

// support PostgreSQL when DATABASE_URL is provided (e.g. Neon on Vercel)
type PgPool = { query: (...args: any[]) => any }
let pgPool: PgPool | null = null
const DATABASE_URL = process.env.DATABASE_URL
let pgInitialized = false

// Legacy stub to keep older imports working while enforcing Postgres-only mode.
// Any call will throw; callers should use run/get/all helpers instead.
function getDb(): never {
  throw new Error('SQLite has been removed. Use PostgreSQL via DATABASE_URL and the async helpers (run/get/all).')
}

function errMessage(err: unknown): string {
  if (!err) return ""
  if (typeof err === 'string') return err
  if (err instanceof Error) return err.message
  try { return JSON.stringify(err) } catch { return String(err) }
}

async function initPostgresPool() {
  if (!DATABASE_URL || pgPool) return

  try {
    const { Pool } = await import('pg')
    pgPool = new Pool({ connectionString: DATABASE_URL, max: 1 })
    await pgPool.query('SELECT 1')
  } catch (err: unknown) {
    const msg = errMessage(err)
    console.error('[DB] PostgreSQL connection failed:', msg)
    throw new Error('PostgreSQL database is required. DATABASE_URL must be set.')
  }
}

let pgInitPromise: Promise<void> | null = null

async function migratePostgresUsers(pool: any) {
  // Check which columns exist in the users table
  try {
    const existingColumns = await pool.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'users'
    `)
    const existingColNames = new Set(existingColumns.rows.map((r: any) => r.column_name))
    const existingColTypes = new Map<string, string>(
      existingColumns.rows.map((r: any) => [r.column_name, r.data_type])
    )

    // If `verified` is stored as an integer, migrate it to a proper boolean column.
    if (existingColTypes.get('verified') === 'integer') {
      try {
        await pool.query(
          "ALTER TABLE users ALTER COLUMN verified TYPE BOOLEAN USING (verified::BOOLEAN)"
        )
        console.log('[Migration] Converted verified column to BOOLEAN')
      } catch (err: unknown) {
        const msg = errMessage(err)
        console.warn('[Migration] Failed to convert verified column to BOOLEAN:', msg)
      }
    }

    // If joined_at is stored as text, convert it to TIMESTAMP to avoid casting issues.
    if (existingColTypes.get('joined_at') === 'text') {
      try {
        await pool.query(
          "ALTER TABLE users ALTER COLUMN joined_at TYPE TIMESTAMP USING (joined_at::TIMESTAMP)"
        )
        console.log('[Migration] Converted joined_at column to TIMESTAMP')
      } catch (err: unknown) {
        const msg = errMessage(err)
        console.warn('[Migration] Failed to convert joined_at column to TIMESTAMP:', msg)
      }
    }

    // Rename old camelCase columns to snake_case to match current app expectations
    // This helps avoid issues where older deployments created columns like `joinedAt` / `passwordHash`.
    const legacyColumnMap: Record<string, string> = {
      joinedat: 'joined_at',
      joineddAt: 'joined_at',
      joinedAt: 'joined_at',
      firstname: 'first_name',
      firstName: 'first_name',
      lastname: 'last_name',
      lastName: 'last_name',
      passwordhash: 'password_hash',
      passwordHash: 'password_hash',
      dateofbirth: 'date_of_birth',
      dateOfBirth: 'date_of_birth',
      lastlogin: 'last_login',
      lastLogin: 'last_login',
      createdat: 'created_at',
      createdAt: 'created_at',
      updatedat: 'updated_at',
      updatedAt: 'updated_at',
      emailverified: 'email_verified',
      emailVerified: 'email_verified',
      twofactorenabled: 'two_factor_enabled',
      twoFactorEnabled: 'two_factor_enabled',
      twofactorsecret: 'two_factor_secret',
      twoFactorSecret: 'two_factor_secret',
      backupcodes: 'backup_codes',
      backupCodes: 'backup_codes',
    }

    for (const [legacy, canonical] of Object.entries(legacyColumnMap)) {
      if (existingColNames.has(legacy) && !existingColNames.has(canonical)) {
        try {
          await pool.query(`ALTER TABLE users RENAME COLUMN "${legacy}" TO "${canonical}"`)
          console.log(`[Migration] Renamed column: ${legacy} -> ${canonical}`)
          existingColNames.add(canonical)
        } catch (err: unknown) {
          const msg = errMessage(err)
          console.warn(`[Migration] Failed to rename column ${legacy} -> ${canonical}: ${msg}`)
        }
      }
    }

    // Define required columns with their SQL definitions (safe defaults for existing rows)
    const requiredColumns: Record<string, string> = {
      'name': 'ALTER TABLE users ADD COLUMN name VARCHAR(255) NOT NULL DEFAULT \'\'',
      'first_name': 'ALTER TABLE users ADD COLUMN first_name VARCHAR(100)',
      'last_name': 'ALTER TABLE users ADD COLUMN last_name VARCHAR(100)',
      'email': 'ALTER TABLE users ADD COLUMN email VARCHAR(255) UNIQUE NOT NULL',
      'password_hash': 'ALTER TABLE users ADD COLUMN password_hash VARCHAR(255)',
      'phone': 'ALTER TABLE users ADD COLUMN phone VARCHAR(20)',
      'phone_country': 'ALTER TABLE users ADD COLUMN phone_country VARCHAR(10)',
      'date_of_birth': 'ALTER TABLE users ADD COLUMN date_of_birth DATE',
      'avatar': 'ALTER TABLE users ADD COLUMN avatar VARCHAR(500)',
      'role': 'ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT \'user\'',
      'balance': 'ALTER TABLE users ADD COLUMN balance NUMERIC(15,2) NOT NULL DEFAULT 0',
      'verified': 'ALTER TABLE users ADD COLUMN verified BOOLEAN NOT NULL DEFAULT FALSE',
      'joined_at': 'ALTER TABLE users ADD COLUMN joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP',
      'last_login': 'ALTER TABLE users ADD COLUMN last_login TIMESTAMP',
      'email_verified': 'ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE',
      'created_at': 'ALTER TABLE users ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP',
      'updated_at': 'ALTER TABLE users ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP',
    }

    // Add missing columns
    for (const [colName, colSql] of Object.entries(requiredColumns)) {
      if (!existingColNames.has(colName)) {
        try {
          await pool.query(colSql)
          console.log(`[Migration] Created column: ${colName}`)
        } catch (err: unknown) {
          const msg = errMessage(err)
          console.warn(`[Migration] Failed to create column ${colName}: ${msg}`)
        }
      }
    }

    // Ensure important timestamp fields are populated for existing rows
    try {
      await pool.query(`UPDATE users SET joined_at = CURRENT_TIMESTAMP WHERE joined_at IS NULL`)
      await pool.query(`UPDATE users SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL`)
      await pool.query(`UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL`)
      
      // Ensure columns have proper defaults (if they were added without defaults)
      try {
        await pool.query(`ALTER TABLE users ALTER COLUMN joined_at SET NOT NULL`)
      } catch (_e) {
        // Column might already be NOT NULL
      }
      try {
        await pool.query(`ALTER TABLE users ALTER COLUMN created_at SET NOT NULL`)
      } catch (_e) {
        // Column might already be NOT NULL
      }
      try {
        await pool.query(`ALTER TABLE users ALTER COLUMN updated_at SET NOT NULL`)
      } catch (_e) {
        // Column might already be NOT NULL
      }
      
      try {
        await pool.query(`ALTER TABLE users ALTER COLUMN joined_at SET DEFAULT CURRENT_TIMESTAMP`)
      } catch (_e) {
        // Might already have default
      }
      try {
        await pool.query(`ALTER TABLE users ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP`)
      } catch (_e) {
        // Might already have default
      }
      try {
        await pool.query(`ALTER TABLE users ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP`)
      } catch (_e) {
        // Might already have default
      }
    } catch (err: unknown) {
      const msg = errMessage(err)
      console.warn('[Migration] Failed to populate/set defaults for timestamp values:', msg)
    }
  } catch (err: unknown) {
    const msg = errMessage(err)
    console.warn('[Migration] Failed to check/migrate users columns:', msg)
  }
}

async function initializePostgres() {
  // If already initializing, wait for it to complete
  if (pgInitPromise) {
    await pgInitPromise
    return
  }
  
  if (pgInitialized || !pgPool) return
  
  // Create the initialization promise to prevent concurrent initializations
  pgInitPromise = (async () => {
    try {
      // Create tables for PostgreSQL (must execute as separate statements)
      const tableDefs = [
        `CREATE TABLE IF NOT EXISTS _meta (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          email VARCHAR(255) UNIQUE NOT NULL,
          phone VARCHAR(20),
          date_of_birth DATE,
          password_hash VARCHAR(255) NOT NULL,
          verified BOOLEAN NOT NULL DEFAULT FALSE,
          role VARCHAR(20) NOT NULL DEFAULT 'user',
          balance NUMERIC(15,2) NOT NULL DEFAULT 0,
          joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          avatar VARCHAR(500),
          last_login TIMESTAMP,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS transactions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          type TEXT NOT NULL,
          amount REAL NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          description TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          date TEXT DEFAULT CURRENT_TIMESTAMP,
          method VARCHAR(50),
          bank_account VARCHAR(255),
          crypto_address VARCHAR(255),
          metadata TEXT,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )`,
        `CREATE TABLE IF NOT EXISTS investment_plans (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          min_amount REAL NOT NULL,
          max_amount REAL NOT NULL,
          return_rate REAL NOT NULL,
          duration INTEGER NOT NULL,
          duration_unit TEXT NOT NULL,
          risk TEXT NOT NULL,
          description TEXT NOT NULL,
          plan_type TEXT NOT NULL DEFAULT 'Conservative Bond Fund'
        )`,
        `CREATE TABLE IF NOT EXISTS investments (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          plan_id TEXT NOT NULL,
          name TEXT,
          amount REAL NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          projected_return REAL NOT NULL DEFAULT 0,
          progress_percentage REAL NOT NULL DEFAULT 0,
          start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          maturity_date TIMESTAMP,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (plan_id) REFERENCES investment_plans(id)
        )`,
        `CREATE TABLE IF NOT EXISTS active_investments (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          planId TEXT NOT NULL,
          planName TEXT NOT NULL,
          amount REAL NOT NULL,
          expectedProfit REAL NOT NULL,
          startDate TEXT NOT NULL,
          endDate TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'active',
          progressPercentage REAL NOT NULL DEFAULT 0,
          FOREIGN KEY (userId) REFERENCES users(id),
          FOREIGN KEY (planId) REFERENCES investment_plans(id)
        )`,
        `CREATE TABLE IF NOT EXISTS wallet_addresses (
          id TEXT PRIMARY KEY,
          coin TEXT NOT NULL,
          network TEXT NOT NULL,
          address TEXT NOT NULL,
          assignedTo TEXT,
          assignedAt TEXT,
          createdAt TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'active',
          FOREIGN KEY (assignedTo) REFERENCES users(id)
        )`,
        `CREATE TABLE IF NOT EXISTS notifications (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          type TEXT NOT NULL,
          read BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          action_url TEXT,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )`,
        `CREATE TABLE IF NOT EXISTS verification_codes (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL,
          code TEXT NOT NULL,
          expiresAt TEXT NOT NULL,
          used INTEGER NOT NULL DEFAULT 0
        )`,
        `CREATE TABLE IF NOT EXISTS password_reset_tokens (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          token TEXT UNIQUE NOT NULL,
          expiresAt TEXT NOT NULL,
          used INTEGER NOT NULL DEFAULT 0,
          createdAt TEXT NOT NULL,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        )`,
        `CREATE TABLE IF NOT EXISTS activity_logs (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          type TEXT NOT NULL,
          description TEXT NOT NULL,
          metadata TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )`,
        `CREATE TABLE IF NOT EXISTS activity_log (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          type TEXT NOT NULL,
          description TEXT NOT NULL,
          metadata TEXT,
          timestamp TEXT NOT NULL,
          FOREIGN KEY (userId) REFERENCES users(id)
        )`
      ]

      for (const sql of tableDefs) {
        try {
          await pgPool.query(sql)
        } catch (err: unknown) {
          const msg = errMessage(err)
          if (!msg.includes('already exists') && !msg.includes('duplicate')) {
            console.warn('[Migration] Error creating table:', msg)
          }
        }
      }

      // Run smart migrations to add missing columns
      try {
        await migratePostgresUsers(pgPool)
      } catch (err: unknown) {
        const msg = errMessage(err)
        console.warn('[Migration] Error running user migrations:', msg)
      }

      // Migration: Rename userId to user_id in transactions table if needed
      try {
        // Check if userId column exists (old schema)
        const checkColumn = await pgPool.query(`
          SELECT column_name FROM information_schema.columns 
          WHERE table_name = 'transactions' AND column_name = 'userId'
        `)
        
        if (checkColumn.rows.length > 0) {
          // Column exists, need to migrate it
          console.log('[Migration] Found userId column in transactions, renaming to user_id...')
          
          // Drop the old foreign key if it exists
          try {
            await pgPool.query(`
              ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_userid_fkey
            `)
          } catch (_e) {
            // Might not exist
          }
          
          // Rename the column
          await pgPool.query(`
            ALTER TABLE transactions RENAME COLUMN "userId" TO user_id
          `)
          
          // Re-create the foreign key
          await pgPool.query(`
            ALTER TABLE transactions 
            ADD CONSTRAINT transactions_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES users(id)
          `)
          
          console.log('[Migration] Successfully renamed userId to user_id in transactions')
        }
      } catch (err: unknown) {
        const msg = errMessage(err)
        console.warn('[Migration] Error migrating transactions columns:', msg)
      }

      try {
        // Add status column to wallet_addresses if it doesn't exist
        await pgPool.query(`
          ALTER TABLE wallet_addresses 
          ADD COLUMN status TEXT NOT NULL DEFAULT 'active'
        `)
      } catch (err: unknown) {
        const msg = errMessage(err)
        if (!msg.includes('already exists') && !msg.includes('duplicate')) {
          // Migration warning logged
        }
      }

      // Migration: Add missing columns to investments table if they don't exist
      // Migration: Ensure all required columns exist in investments table
      try {
        const investmentColumns = await pgPool.query(`
          SELECT column_name FROM information_schema.columns 
          WHERE table_name = 'investments'
        `)
        const colNames = new Set(investmentColumns.rows.map((r: any) => r.column_name))
        
        if (!colNames.has('progress_percentage')) {
          await pgPool.query(`
            ALTER TABLE investments ADD COLUMN progress_percentage REAL NOT NULL DEFAULT 0
          `)
          console.log('[Migration] Added progress_percentage column to investments table')
        }
        
        if (!colNames.has('projected_return')) {
          await pgPool.query(`
            ALTER TABLE investments ADD COLUMN projected_return REAL NOT NULL DEFAULT 0
          `)
          console.log('[Migration] Added projected_return column to investments table')
        }
      } catch (err: unknown) {
        const msg = errMessage(err)
        if (!msg.includes('already exists') && !msg.includes('duplicate')) {
          console.warn('[Migration] Error updating investments table columns:', msg)
        }
      }

      // Migration: Add missing columns to transactions table
      try {
        const txColumns = await pgPool.query(`
          SELECT column_name FROM information_schema.columns 
          WHERE table_name = 'transactions'
        `)
        const txColNames = new Set(txColumns.rows.map((r: any) => r.column_name))
        
        const requiredTxColumns = [
          { name: 'created_at', sql: 'ALTER TABLE transactions ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP' },
          { name: 'method', sql: 'ALTER TABLE transactions ADD COLUMN method VARCHAR(50)' },
          { name: 'bank_account', sql: 'ALTER TABLE transactions ADD COLUMN bank_account VARCHAR(255)' },
          { name: 'crypto_address', sql: 'ALTER TABLE transactions ADD COLUMN crypto_address VARCHAR(255)' },
          { name: 'metadata', sql: 'ALTER TABLE transactions ADD COLUMN metadata JSONB' },
        ]
        
        for (const col of requiredTxColumns) {
          if (!txColNames.has(col.name)) {
            await pgPool.query(col.sql)
            console.log(`[Migration] Added ${col.name} column to transactions table`)
          }
        }

        // Backfill created_at from legacy date column when present
        if (txColNames.has('date')) {
          try {
            await pgPool.query(
              `UPDATE transactions SET created_at = COALESCE(created_at, date::TIMESTAMP) WHERE created_at IS NULL AND date IS NOT NULL`
            )
          } catch (err: unknown) {
            const msg = errMessage(err)
            console.warn('[Migration] Error backfilling transactions.created_at from date:', msg)
          }
        }
      } catch (err: unknown) {
        const msg = errMessage(err)
        if (!msg.includes('already exists') && !msg.includes('duplicate')) {
          console.warn('[Migration] Error updating transactions table columns:', msg)
        }
      }

      // Migration: Add missing columns to investment_plans table
      try {
        const planColumns = await pgPool.query(`
          SELECT column_name FROM information_schema.columns 
          WHERE table_name = 'investment_plans'
        `)
        const planColNames = new Set(planColumns.rows.map((r: any) => r.column_name))
        
        const requiredPlanColumns = [
          { name: 'category', sql: 'ALTER TABLE investment_plans ADD COLUMN category VARCHAR(100)' },
          { name: 'management_fee', sql: 'ALTER TABLE investment_plans ADD COLUMN management_fee NUMERIC(5,2) DEFAULT 0' },
          { name: 'performance_fee', sql: 'ALTER TABLE investment_plans ADD COLUMN performance_fee NUMERIC(5,2) DEFAULT 0' },
          { name: 'withdrawal_fee', sql: 'ALTER TABLE investment_plans ADD COLUMN withdrawal_fee NUMERIC(5,2) DEFAULT 0' },
        ]
        
        for (const col of requiredPlanColumns) {
          if (!planColNames.has(col.name)) {
            await pgPool.query(col.sql)
            console.log(`[Migration] Added ${col.name} column to investment_plans table`)
          }
        }
      } catch (err: unknown) {
        const msg = errMessage(err)
        if (!msg.includes('already exists') && !msg.includes('duplicate')) {
          console.warn('[Migration] Error updating investment_plans table columns:', msg)
        }
      }

      // Migration: Add security columns to users table
      try {
        const userColumns = await pgPool.query(`
          SELECT column_name FROM information_schema.columns 
          WHERE table_name = 'users'
        `)
        const userColNames = new Set(userColumns.rows.map((r: any) => r.column_name))
        
        const securityColumns = [
          { name: 'email_verified', sql: 'ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE' },
          { name: 'two_factor_enabled', sql: 'ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE' },
          { name: 'two_factor_secret', sql: 'ALTER TABLE users ADD COLUMN two_factor_secret VARCHAR(255)' },
          { name: 'backup_codes', sql: 'ALTER TABLE users ADD COLUMN backup_codes TEXT' },
        ]
        
        for (const col of securityColumns) {
          if (!userColNames.has(col.name)) {
            await pgPool.query(col.sql)
            console.log(`[Migration] Added ${col.name} column to users table`)
          }
        }
      } catch (err: unknown) {
        const msg = errMessage(err)
        if (!msg.includes('already exists') && !msg.includes('duplicate')) {
          console.warn('[Migration] Error updating users security columns:', msg)
        }
      }

      // Migration: Create indexes for better query performance
      try {
        const indexDefinitions = [
          `CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)`,
          `CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status)`,
          `CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date)`,
          `CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at)`,
          `CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id)`,
          `CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(status)`,
          `CREATE INDEX IF NOT EXISTS idx_investments_maturity ON investments(maturity_date)`,
          `CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)`,
          `CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id)`,
        ]
        
        for (const indexSql of indexDefinitions) {
          try {
            await pgPool.query(indexSql)
          } catch (_e) {
            // Index might already exist, that's fine
          }
        }
        console.log('[Migration] Database indexes verified/created')
      } catch (err: unknown) {
        const msg = errMessage(err)
        console.warn('[Migration] Error creating indexes:', msg)
      }

      // CRITICAL: Always update existing plans with correct planType
      // This runs EVERY TIME the app starts to ensure data stays in sync
      try {
        const planMappings = [
          { id: 'cbf', planType: 'Conservative Bond Fund' },
          { id: 'gp', planType: 'Growth Portfolio' },
          { id: 'hyef', planType: 'High Yield Equity Fund' },
          { id: 'ret', planType: 'Real Estate Trust' },
        ]
        
        // CRITICAL: Sync investment plan types from mapping
        // Use snake_case column name for PostgreSQL
        for (const mapping of planMappings) {
          await pgPool.query(
            'UPDATE investment_plans SET plan_type = $1 WHERE id = $2',
            [mapping.planType, mapping.id]
          )
        }
        
        // Verify the updates
        const verifyResult = await pgPool.query('SELECT id, plan_type as "planType" FROM investment_plans ORDER BY id')
        if (process.env.NODE_ENV === 'development') {
          console.log('[Migration] Investment plan types:', verifyResult.rows)
        }
      } catch (_err: unknown) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[Migration] Failed to sync plan types', _err)
        }
      }

      // Ensure plans exist in database - insert or update based on our template data
      try {
        await seedDatabasePostgres()
      } catch (seedError: unknown) {
        console.error('Seeding error:', errMessage(seedError as Error))
        // Continue even if seeding fails
      }
      
      pgInitialized = true
    } catch (error: unknown) {
      console.error('Error initializing PostgreSQL:', errMessage(error as Error))
      // Reset the promise so we can try again
      pgInitPromise = null
      throw error
    }
  })()
  
  await pgInitPromise
}

// SQLite fallback removed for production. Only PostgreSQL is supported.

// utility helpers to abstract sqlite / postgres differences
function adaptSql(sql: string) {
  if (!pgPool) return sql
  let idx = 0
  return sql.replace(/\?/g, () => "$" + ++idx)
}

interface DatabaseRow {
  [key: string]: unknown
}

export async function run(sql: string, params: unknown[] = []): Promise<number> {
  console.log(`[RUN] Executing SQL: ${sql.substring(0, 100)}...`)
  console.log(`[RUN] Parameters:`, params)

  await initPostgresPool()

  if (!pgPool) {
    throw new Error('PostgreSQL pool not initialized. DATABASE_URL is required.')
  }

  await initializePostgres()
  const adaptedSql = adaptSql(sql)
  console.log(`[RUN] Adapted SQL: ${adaptedSql.substring(0, 100)}...`)
  const result = await pgPool.query(adaptedSql, params)
  console.log(`[RUN] Rows affected:`, result.rowCount)
  return result.rowCount || 0
}

export async function get<T = DatabaseRow>(sql: string, params: unknown[] = []): Promise<T | undefined> {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[GET] Executing SQL: ${sql}`)
  }

  await initPostgresPool()
  
  if (!pgPool) {
    throw new Error('PostgreSQL pool not initialized. DATABASE_URL is required.')
  }

  await initializePostgres()
  try {
    const res = await pgPool.query(adaptSql(sql), params)
    const result = res.rows[0] as T
    if (process.env.NODE_ENV === 'development') {
      console.log(`[GET] PostgreSQL success`)
    }
    return result
  } catch (err: unknown) {
    console.error(`[GET] PostgreSQL error:`, errMessage(err))
    throw err
  }
}

export async function all<T = DatabaseRow>(sql: string, params: unknown[] = []): Promise<T[]> {
  console.log(`[ALL] Executing SQL: ${sql.substring(0, 100)}...`)
  console.log(`[ALL] Parameters:`, params)

  await initPostgresPool()
  
  if (!pgPool) {
    throw new Error('PostgreSQL pool not initialized. DATABASE_URL is required.')
  }

  await initializePostgres()
  try {
    const adaptedSql = adaptSql(sql)
    console.log(`[ALL] Adapted SQL: ${adaptedSql.substring(0, 100)}...`)
    const res = await pgPool.query(adaptedSql, params)
    console.log(`[ALL] PostgreSQL result rows:`, res.rows.length)
    return res.rows as T[]
  } catch (err: unknown) {
    console.error(`[ALL] PostgreSQL error:`, errMessage(err))
    throw err
  }
}


// Dynamic plan templates (no fixed duration/rate)
// Investment plan presets with fixed durations and plan-specific returns
const planTemplates = [
  // 1. Conservative Bond Fund - Low risk, steady returns
  // Base: 21.7% for 7 days
  // At 365 days (52 cycles): (1.217^52 - 1) * 100 = ~1000% (capped)
  {
    id: "cbf",
    name: "Conservative Bond Fund",
    minAmount: 100,
    maxAmount: 50000,
    returnRate: 0,  // Dynamic based on duration
    duration: 0,  // Duration selector available
    durationUnit: "custom",
    risk: "Low",
    description: "Safe, steady returns. Select 7-365 days. Up to 1000%+ yearly potential.",
    planType: "Conservative Bond Fund"
  },
  
  // 2. Growth Portfolio - Medium risk, higher returns
  // Base: 35% for 7 days
  // At 365 days: (1.35^52 - 1) * 100 = ~1000% (capped)
  {
    id: "gp",
    name: "Growth Portfolio",
    minAmount: 500,
    maxAmount: 100000,
    returnRate: 0,  // Dynamic based on duration
    duration: 0,  // Duration selector available
    durationUnit: "custom",
    risk: "Medium",
    description: "Balanced growth. Select 7-365 days. Potential 1000%+ annually.",
    planType: "Growth Portfolio"
  },
  
  // 3. High Yield Equity Fund - Higher risk, aggressive returns
  // Base: 50% for 7 days
  // At 365 days: (1.50^52 - 1) * 100 = ~1000% (capped)
  {
    id: "hyef",
    name: "High Yield Equity Fund",
    minAmount: 1000,
    maxAmount: 200000,
    returnRate: 0,  // Dynamic based on duration
    duration: 0,  // Duration selector available
    durationUnit: "custom",
    risk: "High",
    description: "Aggressive equity growth. Select 7-365 days. Maximum compound returns.",
    planType: "High Yield Equity Fund"
  },
  
  // 4. Real Estate Trust - Medium-low risk, consistent returns
  // Base: 40% for 7 days
  // At 365 days: (1.40^52 - 1) * 100 = ~1000% (capped)
  {
    id: "ret",
    name: "Real Estate Trust",
    minAmount: 10000,
    maxAmount: 500000,
    returnRate: 0,  // Dynamic based on duration
    duration: 0,  // Duration selector available
    durationUnit: "custom",
    risk: "Medium-Low",
    description: "Real estate backed. Select 7-365 days. Stable compound growth potential.",
    planType: "Real Estate Trust"
  }
]

function seedDatabaseSync(_db: any) {
  throw new Error('SQLite is not supported. Use PostgreSQL only.')
}

async function seedDatabasePostgres() {
  if (!pgPool) return

  const pool = pgPool

  // Seed plan templates with fixed duration and return rates
  for (const tpl of planTemplates) {
    // Use UPSERT to ensure plan_type is always set correctly
    // Use snake_case for PostgreSQL column names
    await pool.query(
      `INSERT INTO investment_plans (id, name, min_amount, max_amount, return_rate, duration, duration_unit, risk, description, plan_type) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       ON CONFLICT (id) DO UPDATE SET 
         name = $2,
         min_amount = $3,
         max_amount = $4,
         return_rate = $5,
         duration = $6,
         duration_unit = $7,
         risk = $8,
         description = $9,
         plan_type = $10`,
      [
        tpl.id,
        tpl.name,
        tpl.minAmount,
        tpl.maxAmount,
        tpl.returnRate,
        tpl.duration,
        tpl.durationUnit,
        tpl.risk,
        tpl.description,
        tpl.planType
      ]
    )
  }

  // Seed admin user
  try {
    const { hashPassword } = await import('./auth')
    const adminEmail = 'admin@vaultcapital.bond'
    const adminPassword = 'F2nny4jj!'
    const adminId = 'admin-user-001'
    
    // Check if admin already exists
    const existingAdmin = await pool.query('SELECT id FROM users WHERE email = $1', [adminEmail])
    
    if (existingAdmin.rows.length === 0) {
      // Create admin user
      const passwordHash = await hashPassword(adminPassword)
      const now = new Date().toISOString()
      
      await pool.query(
        `INSERT INTO users (id, name, email, password_hash, role, verified, balance, joined_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        [
          adminId,
          'Admin User',
          adminEmail,
          passwordHash,
          'admin',
          true,
          0,
          now,
          now,
          now
        ]
      )
      console.log('[Seeding] Admin user created successfully')
    }
  } catch (seedError: unknown) {
    const msg = errMessage(seedError as Error)
    console.warn('[Seeding] Failed to seed admin user:', msg)
  }
}


// --- helper query functions --------------------------------------------------

export interface UserRow {
  id: string
  name: string
  firstName?: string
  lastName?: string
  email: string
  phone?: string
  phone_country?: string
  phoneCountry?: string
  dateOfBirth?: string
  passwordHash?: string
  verified: boolean
  role: string
  balance: number
  joinedAt: string
  lastLogin?: string
  avatar: string
  createdAt?: string
  updatedAt?: string
  emailVerified?: boolean
}

export async function getUserByEmail(email: string): Promise<UserRow | undefined> {
  // Map PostgreSQL snake_case to camelCase for code consistency
  const query = "SELECT id, name, email, password_hash as \"passwordHash\", verified, role, balance, joined_at as \"joinedAt\", avatar, first_name as \"firstName\", last_name as \"lastName\", phone, date_of_birth as \"dateOfBirth\" FROM users WHERE email = $1"
  
  const row = (await get(query, [email])) as UserRow | undefined
  if (row) {
    row.verified = !!row.verified
  }
  return row
}

export async function getUserById(id: string): Promise<UserRow | undefined> {
  const query = "SELECT id, name, first_name as \"firstName\", last_name as \"lastName\", email, phone, date_of_birth as \"dateOfBirth\", password_hash as \"passwordHash\", verified, role, balance, joined_at as \"joinedAt\", last_login as \"lastLogin\", avatar, created_at as \"createdAt\", updated_at as \"updatedAt\" FROM users WHERE id = $1"
  
  const row = (await get(query, [id])) as UserRow | undefined
  if (row) {
    row.verified = !!row.verified
  }
  return row
}

export async function getAllUsers(): Promise<UserRow[]> {
  return all<UserRow>(
    "SELECT id, name, first_name as \"firstName\", last_name as \"lastName\", email, phone, date_of_birth as \"dateOfBirth\", verified, role, balance, joined_at as \"joinedAt\", last_login as \"lastLogin\", avatar, created_at as \"createdAt\", updated_at as \"updatedAt\" FROM users"
  )
}

export async function createUser(user: {
  id: string
  name: string
  firstName?: string
  lastName?: string
  email: string
  phone?: string
  dateOfBirth?: string
  passwordHash?: string
  avatar: string
  verified?: boolean
}): Promise<void> {
  // Ensure the Postgres schema is initialized/migrated before creating users
  await initializePostgres()

  const verifiedValue = user.verified ? 1 : 0

  try {
    const now = new Date().toISOString()
    await pgPool!.query(
      `INSERT INTO users (id, name, first_name, last_name, email, phone, date_of_birth, password_hash, avatar, role, balance, verified, joined_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        user.id,
        user.name,
        user.firstName || null,
        user.lastName || null,
        user.email,
        user.phone || null,
        user.dateOfBirth || null,
        user.passwordHash || null,
        user.avatar,
        'user', // role - default to 'user'
        0, // balance - default to 0
        verifiedValue,
        now, // joined_at
        now, // created_at
        now, // updated_at
      ]
    )
  } catch (err: unknown) {
    const msg = errMessage(err)
    console.error('PostgreSQL createUser error:', msg)
    throw err
  }
}


export async function verifyUserEmail(email: string): Promise<void> {
  await run("UPDATE users SET verified = $1 WHERE email = $2", [true, email])
}

export async function setUserBalance(
  userId: string,
  balance: number
): Promise<void> {
  await run("UPDATE users SET balance = $1 WHERE id = $2", [balance, userId])
}

export async function setUserPassword(
  userId: string,
  passwordHash: string
): Promise<void> {
  await run("UPDATE users SET password_hash = $1 WHERE id = $2", [
    passwordHash,
    userId,
  ])
}

export async function insertVerificationCode(codeObj: {
  id: string
  email: string
  code: string
  expiresAt: string
}): Promise<void> {
  await run(
    "INSERT INTO verification_codes (id, email, code, expiresAt) VALUES ($1, $2, $3, $4)",
    [codeObj.id, codeObj.email, codeObj.code, codeObj.expiresAt]
  )
}

export async function consumeVerificationCode(code: string): Promise<boolean> {
  // Trim the code to ensure whitespace doesn't cause issues
  const trimmedCode = code.trim()
  
  console.log(`[Verify] Looking for code: ${trimmedCode}`)
  
  // Query for valid, unused, non-expired code
  const row = await get(
    "SELECT id FROM verification_codes WHERE code = $1 AND used = FALSE AND expiresAt > NOW() LIMIT 1",
    [trimmedCode]
  )
  
  if (!row) {
    // Check if code exists but is expired or already used
    const expiredRow = await get(
      "SELECT code, used, expiresAt FROM verification_codes WHERE code = $1 LIMIT 1",
      [trimmedCode]
    )
    console.log(`[Verify] Code lookup result - exists: ${!!expiredRow}`, expiredRow)
    return false
  }
  
  console.log(`[Verify] Code found and valid, marking as used`)
  try {
    await run("UPDATE verification_codes SET used = TRUE WHERE code = $1", [trimmedCode])
    return true
  } catch (err) {
    console.error(`[Verify] Error checking code:`, err)
    return false
  }
}

export async function canResendVerificationCode(email: string): Promise<{ canResend: boolean; nextRetryAt?: string }> {
  // Check for the most recent unused verification code for this email
  const row = await get<{ expiresAt: string; created_at: string }>(
    "SELECT expiresAt, created_at FROM verification_codes WHERE email = $1 AND used = FALSE ORDER BY created_at DESC LIMIT 1",
    [email]
  )
  
  if (!row) {
    // No existing code, can send
    return { canResend: true }
  }
  
  // Calculate if 15 seconds have passed since code creation
  const codeCreatedAt = new Date(row.created_at)
  const resendAllowedAt = new Date(codeCreatedAt.getTime() + 15 * 1000) // add 15 seconds
  const now = new Date()
  
  if (now >= resendAllowedAt) {
    return { canResend: true }
  }
  
  return { 
    canResend: false, 
    nextRetryAt: resendAllowedAt.toISOString()
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// Password Reset Token Management
// ───────────────────────────────────────────────────────────────────────────────

export async function createPasswordResetToken(userId: string, tokenString: string, expirationMinutes: number = 30): Promise<string> {
  const { v4: uuidv4 } = await import('uuid')
  const tokenId = uuidv4()
  const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000).toISOString()
  
  await run(
    "INSERT INTO password_reset_tokens (id, userId, token, expiresAt, used, createdAt) VALUES ($1, $2, $3, $4, $5, $6)",
    [tokenId, userId, tokenString, expiresAt, false, new Date().toISOString()]
  )
  
  return tokenString
}

export async function validatePasswordResetToken(token: string): Promise<{ userId: string } | null> {
  const row = await get<{ userId: string; used: number }>(
    "SELECT userId, used FROM password_reset_tokens WHERE token = $1 AND used = FALSE AND expiresAt > $2",
    [token, new Date().toISOString()]
  )
  
  if (!row) return null
  
  // Return user ID but don't mark as used yet - that happens after password is actually updated
  return { userId: row.userId }
}

export async function markResetTokenAsUsed(token: string): Promise<boolean> {
  const changes = await run(
    "UPDATE password_reset_tokens SET used = TRUE WHERE token = $1",
    [token]
  )
  
  return changes > 0
}

export async function getInvestmentPlansFromDb() {
  try {
    // Use different queries for PostgreSQL vs SQLite
    const usePostgres = pgPool !== null
    
    // SQLite uses camelCase (plantype, minAmount, etc.)
    // PostgreSQL uses snake_case (plan_type, min_amount, etc.) with aliases to camelCase
    const query = usePostgres
      ? `
        SELECT 
          id,
          name,
          description,
          plan_type as "planType",
          min_amount as "minAmount",
          max_amount as "maxAmount",
          return_rate as "returnRate",
          duration,
          duration_unit as "durationUnit",
          risk,
          category,
          management_fee as "managementFee",
          performance_fee as "performanceFee",
          withdrawal_fee as "withdrawalFee"
        FROM investment_plans
      `
      : "SELECT * FROM investment_plans"
    
    const rows: InvestmentPlan[] = await all(query)
    
    if (process.env.NODE_ENV === 'development') {
      console.log("[getInvestmentPlansFromDb] Raw DB rows count:", rows.length)
      if (rows.length > 0) {
        console.log("[getInvestmentPlansFromDb] First row raw:", JSON.stringify(rows[0], null, 2))
      }
    }
    
    // Map to include optional fields and ensure correct defaults
    const mappedPlans = rows.map((p: any, idx: number) => {
      const rp = p as Record<string, unknown>
      
      const mapped: InvestmentPlan = {
        ...p,
        // Ensure numeric fields have proper values
        minAmount: (Number.isFinite(Number(rp.minAmount)) && Number(rp.minAmount) > 0) ? Number(rp.minAmount) : 100,
        maxAmount: (Number.isFinite(Number(rp.maxAmount)) && Number(rp.maxAmount) > 0) ? Number(rp.maxAmount) : 500000,
        returnRate: (Number.isFinite(Number(rp.returnRate)) && Number(rp.returnRate) > 0) ? Number(rp.returnRate) : 8,
        duration: (Number.isFinite(Number(rp.duration)) && Number(rp.duration) > 0) ? Number(rp.duration) : 6,
        durationUnit: (rp.durationUnit as string) || "months",
        risk: (rp.risk as string) || "Medium",
        // CRITICAL: Explicitly include planType with proper fallback based on ID
        planType: rp.planType && String(rp.planType).trim() ? String(rp.planType).trim() : getPlanTypeById((rp.id ?? '') as string),
        // Optional fields
        fees: typeof rp.fees === 'object' && rp.fees !== null ? (rp.fees as Record<string, number>) : { management: 0, performance: 0, withdrawal: 0 },
        category: (rp.category as string) || "",
      }
      
      // Normalize duration to avoid plans showing 24+ months in the UI
      // (Some DB seeds may have longer durations, but we want to keep sessions capped at 12 months)
      if (mapped.durationUnit === "months" && mapped.duration > 12) {
        mapped.duration = 12
      }

      // Log each plan to verify planType is correct (dev only)
      if (process.env.NODE_ENV === 'development' && idx < 4) {
        console.log(`[getInvestmentPlansFromDb] Plan ${(rp.id ?? '') as string}: planType="${mapped.planType}"`)
      }
      
      return mapped
    })
    
    if (process.env.NODE_ENV === 'development') {
      console.log("[getInvestmentPlansFromDb] Mapped plans count:", mappedPlans.length)
    }
    return mappedPlans
  } catch (error: unknown) {
    console.error("[getInvestmentPlansFromDb] Error fetching plans:", errMessage(error))
    // Return hardcoded plans if database fails
    return getDefaultPlans()
  }
}

/**
 * Get the correct planType for a plan ID
 * This is a fallback when planType is not in the database
 */
function getPlanTypeById(planId: string): string {
  const typeMap: Record<string, string> = {
    "cbf": "Conservative Bond Fund",
    "gp": "Growth Portfolio",
    "hyef": "High Yield Equity Fund",
    "ret": "Real Estate Trust"
  }
  return typeMap[planId] || "Conservative Bond Fund"
}

/**
 * Get default plans as fallback
 * This ensures the UI always has valid plan data even if DB fails
 */
function getDefaultPlans(): InvestmentPlan[] {
  return [
    {
      id: "cbf",
      name: "Conservative Bond Fund",
      minAmount: 100,
      maxAmount: 50000,
      returnRate: 0,
      duration: 365,
      durationUnit: "days",
      risk: "Low",
      description: "Safe, steady returns. Select 7-365 days. Up to 1000%+ yearly potential.",
      planType: "Conservative Bond Fund"
    },
    {
      id: "gp",
      name: "Growth Portfolio",
      minAmount: 500,
      maxAmount: 100000,
      returnRate: 0,
      duration: 365,
      durationUnit: "days",
      risk: "Medium",
      description: "Balanced growth. Select 7-365 days. Potential 1000%+ annually.",
      planType: "Growth Portfolio"
    },
    {
      id: "hyef",
      name: "High Yield Equity Fund",
      minAmount: 1000,
      maxAmount: 200000,
      returnRate: 0,
      duration: 365,
      durationUnit: "days",
      risk: "High",
      description: "Aggressive equity growth. Select 7-365 days. Maximum compound returns.",
      planType: "High Yield Equity Fund"
    },
    {
      id: "ret",
      name: "Real Estate Trust",
      minAmount: 5000,
      maxAmount: 500000,
      returnRate: 0,
      duration: 365,
      durationUnit: "days",
      risk: "Medium",
      description: "Real estate backed. Select 7-365 days. Stable compound growth potential.",
      planType: "Real Estate Trust"
    }
  ]
}

export async function getInvestmentPlanById(planId: string) {
  const usePostgres = pgPool !== null
  
  const query = usePostgres
    ? `
    SELECT 
      id,
      name,
      description,
      plan_type as planType,
      min_amount as minAmount,
      max_amount as maxAmount,
      return_rate as returnRate,
      duration,
      duration_unit as durationUnit,
      risk,
      category,
      management_fee as managementFee,
      performance_fee as performanceFee,
      withdrawal_fee as withdrawalFee
    FROM investment_plans 
    WHERE id = $1
  `
    : "SELECT * FROM investment_plans WHERE id = $1"
  
  const p: InvestmentPlan | undefined = await get(query, [planId])
  if (!p) {
    console.warn(`[getInvestmentPlanById] Plan ${planId} not found in database`)
    return undefined
  }
  
  // Log for debugging (dev only)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[getInvestmentPlanById] Found plan ${planId}`)
  }
  
  const rp = p as Record<string, unknown>
  const mapped: InvestmentPlan = {
    ...p,
    // CRITICAL: Ensure planType is set with fallback to ID-based mapping
    planType: rp.planType && String(rp.planType).trim() ? String(rp.planType).trim() : getPlanTypeById((rp.id ?? '') as string),
    minAmount: (Number.isFinite(Number(rp.minAmount)) && Number(rp.minAmount) > 0) ? Number(rp.minAmount) : 100,
    maxAmount: (Number.isFinite(Number(rp.maxAmount)) && Number(rp.maxAmount) > 0) ? Number(rp.maxAmount) : 500000,
    returnRate: (Number.isFinite(Number(rp.returnRate)) && Number(rp.returnRate) > 0) ? Number(rp.returnRate) : 8,
    duration: (Number.isFinite(Number(rp.duration)) && Number(rp.duration) > 0) ? Number(rp.duration) : 6,
    durationUnit: (rp.durationUnit as string) || "months",
    fees: typeof rp.fees === 'object' && rp.fees !== null ? (rp.fees as Record<string, number>) : { management: 0, performance: 0, withdrawal: 0 },
    category: (rp.category as string) || "",
  } as InvestmentPlan

  // Normalize duration to avoid showing 24+ months on the investment page
  if (mapped.durationUnit === "months" && mapped.duration > 12) {
    mapped.duration = 12
  }

  return mapped
}

export async function getUserTransactions(userId: string) {
  const usePostgres = pgPool !== null
  const query = usePostgres
    ? `SELECT id, user_id as "userId", type, amount, status, description, created_at as date, 
              method, bank_account as "bankAccount", crypto_address as "cryptoAddress", metadata
       FROM transactions 
       WHERE user_id = $1 
       ORDER BY created_at DESC`
    : "SELECT * FROM transactions WHERE userId = $1 ORDER BY date DESC"
  console.log("[getTx] Fetching transactions for userId:", userId)
  const results = await all(query, [userId])
  console.log("[getTx] Found transactions:", results.length, "records")
  if (results.length > 0) {
    console.log("[getTx] First transaction:", results[0])
  }
  
  // Parse metadata for withdrawal details
  return results.map((tx: any) => {
    let parsed = { ...tx }
    if (tx.metadata) {
      try {
        const meta = typeof tx.metadata === 'string' ? JSON.parse(tx.metadata) : tx.metadata
        parsed = {
          ...parsed,
          coin: meta.coin,
          coinAmount: meta.coinAmount,
          withdrawalFee: meta.withdrawalFee,
          amountAfterFee: meta.amountAfterFee,
        }
      } catch (e) {
        console.error("[getTx] Error parsing metadata:", e)
      }
    }
    return parsed
  })
}

export async function getUserNotifications(userId: string) {
  const usePostgres = pgPool !== null
  const query = usePostgres
    ? "SELECT id, user_id as \"userId\", title, message, type, read as \"isRead\", created_at as timestamp, action_url as \"actionUrl\" FROM notifications WHERE user_id = $1 ORDER BY created_at DESC"
    : "SELECT id, userId, title, message, type, isRead, timestamp, actionUrl FROM notifications WHERE userId = $1 ORDER BY timestamp DESC"
  const notifications = await all(query, [userId])
  // Ensure isRead is properly cast to boolean for consistency
  return notifications.map((n: any) => {
    const rn = n as Record<string, unknown>
    return {
      id: rn.id as string,
      userId: rn.userId as string,
      title: rn.title as string,
      message: rn.message as string,
      type: rn.type as string,
      timestamp: rn.timestamp as string,
      actionUrl: rn.actionUrl as string | undefined,
      isRead: rn.isRead === 1 || rn.isRead === true || rn.isRead === '1'
    }
  })
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    // Use parameterized query to mark notification as read
    const usePostgres = pgPool !== null
    const query = usePostgres
      ? "UPDATE notifications SET read = $1 WHERE id = $2"
      : "UPDATE notifications SET isRead = $1 WHERE id = $2"
    const changes = await run(query, [1, notificationId])
    
    if (changes === 0) {
      console.error(`[Notification] Failed to mark notification as read: ${notificationId}`)
      return false
    }

    return true
  } catch (err) {
    console.error(`[Notification] Error marking as read:`, err)
    throw err
  }
}

export async function getRecentActivities(userId: string) {
  const usePostgres = pgPool !== null
  
  // Get transactions - newest first
  const txQuery = usePostgres
    ? `SELECT id, user_id as "userId", type, status, description, created_at as date 
       FROM transactions 
       WHERE user_id = $1 
       ORDER BY created_at DESC LIMIT 10`
    : "SELECT * FROM transactions WHERE userId = $1 ORDER BY date DESC LIMIT 10"
  const transactions = await all(txQuery, [userId])
  
  // Get activity log entries (if table exists)
  let activityLogs: any[] = []
  try {
    const logQuery = usePostgres
      ? "SELECT id, user_id as \"userId\", type, description, created_at as timestamp FROM activity_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10"
      : "SELECT * FROM activity_log WHERE userId = $1 ORDER BY timestamp DESC LIMIT 10"
    activityLogs = await all(logQuery, [userId])
  } catch (err) {
    // activity_logs table might not exist, continue without it
    console.debug("Activity logs table not available")
  }
  
  // Transform transactions to activities format
  const txActivities = transactions.map((tx: any) => ({
    id: tx.id,
    type: tx.type as ActivityType,
    description: tx.description,
    timestamp: tx.date,
    status: (tx.status || "success") as "success" | "pending" | "failed",
    created_at: tx.date,
  }))

  // Transform activity logs to match Activity interface
  const logActivities = activityLogs.map((log: any) => ({
    id: log.id,
    type: log.type as ActivityType,
    description: log.description,
    timestamp: log.timestamp,
    status: "success" as const,
    created_at: log.timestamp,
  }))

  // Merge and sort by timestamp, newest first, limit to 10
  const allActivities = [...txActivities, ...logActivities]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10)

  return allActivities
}

export async function getUserStats(userId: string) {
  try {
    // Use different queries for PostgreSQL vs SQLite
    const usePostgres = pgPool !== null
    
    const totalInvestedRow: { sum: number } | undefined = await get(
      usePostgres 
        ? "SELECT SUM(amount) as sum FROM transactions WHERE user_id = $1 AND type = $2 AND status = $3"
        : "SELECT SUM(amount) as sum FROM transactions WHERE userId = $1 AND type = $2 AND status = $3",
      [userId, 'investment', 'approved']
    )
    const totalProfitRow: { sum: number } | undefined = await get(
      usePostgres
        ? "SELECT SUM(amount) as sum FROM transactions WHERE user_id = $1 AND type = $2 AND status = $3"
        : "SELECT SUM(amount) as sum FROM transactions WHERE userId = $1 AND type = $2 AND status = $3",
      [userId, 'return', 'approved']
    )
    const pendingDepositsRow: { cnt: number } | undefined = await get(
      usePostgres
        ? "SELECT COUNT(*) as cnt FROM transactions WHERE user_id = $1 AND type = $2 AND status = $3"
        : "SELECT COUNT(*) as cnt FROM transactions WHERE userId = $1 AND type = $2 AND status = $3",
      [userId, 'deposit', 'pending']
    )
    const totalWithdrawnRow: { sum: number } | undefined = await get(
      usePostgres
        ? "SELECT SUM(amount) as sum FROM transactions WHERE user_id = $1 AND type = $2 AND status = $3"
        : "SELECT SUM(amount) as sum FROM transactions WHERE userId = $1 AND type = $2 AND status = $3",
      [userId, 'withdrawal', 'approved']
    )
    const activeCountRow: { cnt: number } | undefined = await get(
      usePostgres
        ? "SELECT COUNT(*) as cnt FROM investments WHERE user_id = $1 AND status = $2"
        : "SELECT COUNT(*) as cnt FROM active_investments WHERE userId = $1 AND status = $2",
      [userId, 'active']
    )
    const userRow: { balance: number } | undefined = await get(
      "SELECT balance FROM users WHERE id = $1",
      [userId]
    )
    
    const totalInvested = totalInvestedRow?.sum || 0
    const totalProfit = totalProfitRow?.sum || 0
    const userBalance = userRow?.balance || 0
    
    // FIX: availableBalance is the current wallet balance
    // The userBalance is ALREADY reduced by investments when they were made
    // So we don't subtract investments again (that was double-counting!)
    const availableBalance = Math.max(0, userBalance)
    
    return {
      totalInvested,
      totalProfit,
      availableBalance,
      pendingDeposits: pendingDepositsRow?.cnt || 0,
      totalWithdrawn: totalWithdrawnRow?.sum || 0,
      activeInvestments: activeCountRow?.cnt || 0,
    }
  } catch (error: unknown) {
    console.error('[getUserStats] Error:', errMessage(error as Error))
    // Return defaults so dashboard doesn't crash
    return {
      totalInvested: 0,
      totalProfit: 0,
      availableBalance: 0,
      pendingDeposits: 0,
      totalWithdrawn: 0,
      activeInvestments: 0,
    }
  }
}

export async function getUserActiveInvestments(userId: string): Promise<ActiveInvestment[]> {
  const usePostgres = pgPool !== null
  
  // For PostgreSQL, use investments table with proper column name mapping
  // For SQLite, use active_investments table
  const query = usePostgres
    ? `SELECT 
        id, 
        user_id as "userId", 
        plan_id as "planId", 
        name as "planName", 
        amount, 
        projected_return as "expectedProfit", 
        start_date as "startDate", 
        maturity_date as "endDate", 
        status,
        COALESCE(progress_percentage, 0) as "progressPercentage",
        (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - start_date)) / EXTRACT(EPOCH FROM (maturity_date - start_date)) * 100) as "calculatedProgress"
      FROM investments 
      WHERE user_id = $1 AND status = $2`
    : `SELECT id, userId, planId, planName, amount, expectedProfit, startDate, endDate, status, progressPercentage 
       FROM active_investments WHERE userId = $1 AND status = $2`
  
  const results = (await all(query, [userId, 'active'])) as unknown[]
  
  // Normalize column names
  return results.map((row: unknown) => {
    const r = row as Record<string, unknown>
    // Use stored progress percentage if available, otherwise calculate from duration
    const progressPercentage = Number(r.progressPercentage ?? r.calculatedProgress ?? 0)
    return {
      id: String(r.id ?? ''),
      userId: String(r.userId ?? r.userid ?? ''),
      planId: String(r.planId ?? r.planid ?? ''),
      planName: String(r.planName ?? r.planname ?? ''),
      amount: Number(r.amount ?? 0),
      expectedProfit: Number(r.expectedProfit ?? r.expectedprofit ?? 0),
      startDate: String(r.startDate ?? r.startdate ?? ''),
      endDate: String(r.endDate ?? r.enddate ?? ''),
      status: String(r.status ?? 'active') as "active" | "completed" | "withdrawn",
      progressPercentage: Math.min(100, progressPercentage),
    }
  })
}

/**
 * Get active investments with calculated accumulated profits
 * This recalculates progress percentage and accumulated profit based on current time
 */
export async function getUserActiveInvestmentsWithProfit(userId: string) {
  try {
    const investments = await getUserActiveInvestments(userId)
    
    return investments.map((inv) => {
      try {
        const now = new Date().getTime()
        const startTime = new Date(inv.startDate).getTime()
        const endTime = new Date(inv.endDate).getTime()
        
        // Calculate progress percentage (0-100)
        const totalDuration = endTime - startTime
        const elapsed = now - startTime
        let progressPercentage = 0
        
        if (elapsed > 0 && totalDuration > 0) {
          progressPercentage = Math.min(100, (elapsed / totalDuration) * 100)
        }
        
        // Calculate accumulated profit based on progress
        const expectedProfit = inv.expectedProfit || 0
        const accumulatedProfit = Math.max(0, (expectedProfit * progressPercentage) / 100)
        
        // Mark as completed if matured
        if (progressPercentage >= 100) {
          progressPercentage = 100
        }
        
        return {
          ...inv,
          progressPercentage: Math.round(progressPercentage * 100) / 100,
          accumulatedProfit: Math.round(accumulatedProfit * 100) / 100,
        }
      } catch (error) {
        console.error('Error calculating investment profit:', error)
        return inv
      }
    })
  } catch (error: unknown) {
    console.error('[getUserActiveInvestmentsWithProfit] Error:', errMessage(error as Error))
    // Return empty array so dashboard doesn't crash
    return []
  }
}

export async function generatePortfolioData(userId: string) {
  try {
    const user = await getUserById(userId)

    if (!user) return []

    const usePostgres = pgPool !== null
    
    // Get all transactions for the user
    const transactions = await all<{
      date: string
      type: string
      amount: number
    }>(
      usePostgres
        ? `SELECT created_at as date, type, amount 
           FROM transactions 
           WHERE user_id = $1 
           ORDER BY created_at ASC`
        : `SELECT date, type, amount FROM transactions WHERE userId = $1 ORDER BY date ASC`,
      [userId]
    )

    const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"]
    const data: { month: string; value: number }[] = []

    // If no transactions, return flat line at current balance
    const currentBalance = typeof user.balance === 'string' ? parseFloat(user.balance) : user.balance
    if (!transactions || transactions.length === 0) {
      return months.map(month => ({
        month,
        value: Math.round(currentBalance)
      }))
    }

    // Calculate cumulative balance based on transaction types
    // Start with 0 and accumulate based on transaction history
    let cumulativeBalance = currentBalance * 0.6 // Start at 60% for 6 months ago estimation

    // Calculate the increment needed to reach current balance over 6 months
    const totalIncrease = (currentBalance - cumulativeBalance) / (months.length - 1)

    // Generate 6-month trend
    for (const month of months) {
      data.push({
        month,
        value: Math.round(Math.max(0, cumulativeBalance)),
      })
      cumulativeBalance += totalIncrease
    }

    return data
  } catch (error: unknown) {
    console.error('[generatePortfolioData] Error:', errMessage(error as Error))
    // Return empty data so chart doesn't crash
    const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"]
    return months.map(month => ({
      month,
      value: 0
    }))
  }
}

export async function createTransaction(transaction: {
  userId: string
  type: "deposit" | "withdrawal" | "investment" | "return"
  amount: number
  status?: "pending" | "approved" | "rejected"
  description?: string
  method?: string
  bankAccount?: string
  cryptoAddress?: string
  coin?: string
  coinAmount?: number
  withdrawalFee?: number
  amountAfterFee?: number
}) {
  const id = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const description = transaction.description || `${transaction.type} of $${transaction.amount.toLocaleString()}`
  const usePostgres = pgPool !== null

  const now = new Date().toISOString()
  
  // Build metadata object for withdrawal details
  const metadata = {
    coin: transaction.coin,
    coinAmount: transaction.coinAmount,
    withdrawalFee: transaction.withdrawalFee,
    amountAfterFee: transaction.amountAfterFee,
  }

  await run(
    usePostgres
      ? `INSERT INTO transactions (id, user_id, type, amount, status, description, created_at, date, method, bank_account, crypto_address, metadata) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`
      : `INSERT INTO transactions (id, userId, type, amount, status, description, date, method, bank_account, crypto_address, metadata) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    usePostgres
      ? [
          id,
          transaction.userId,
          transaction.type,
          transaction.amount,
          transaction.status || "pending",
          description,
          now,
          now,
          transaction.method,
          transaction.bankAccount,
          transaction.cryptoAddress,
          JSON.stringify(metadata),
        ]
      : [
          id,
          transaction.userId,
          transaction.type,
          transaction.amount,
          transaction.status || "pending",
          description,
          now,
          transaction.method,
          transaction.bankAccount,
          transaction.cryptoAddress,
          JSON.stringify(metadata),
        ]
  )

  return {
    id,
    userId: transaction.userId,
    type: transaction.type,
    amount: transaction.amount,
    status: transaction.status || "pending",
    description,
    date: new Date().toISOString(),
    coin: transaction.coin,
    coinAmount: transaction.coinAmount,
    withdrawalFee: transaction.withdrawalFee,
    amountAfterFee: transaction.amountAfterFee,
    method: transaction.method,
    bankAccount: transaction.bankAccount,
    cryptoAddress: transaction.cryptoAddress,
  }
}

// process investments that have matured and credit returns to user
export async function processMaturedInvestments(userId: string) {
  const now = new Date().toISOString()
  const usePostgres = pgPool !== null
  
  // Get matured investments - use different table names for PostgreSQL vs SQLite
  const query = usePostgres
    ? `SELECT 
        id, 
        user_id as "userId", 
        plan_id as "planId", 
        name as "planName", 
        amount, 
        projected_return as "expectedProfit", 
        start_date as "startDate", 
        maturity_date as "endDate", 
        status
      FROM investments 
      WHERE user_id = $1 AND status = $2 AND maturity_date <= $3`
    : "SELECT * FROM active_investments WHERE userId = $1 AND status = 'active' AND endDate <= $2"
  
  const params = usePostgres 
    ? [userId, 'active', now]
    : [userId, now]
  
  const matured = (await all(query, params)) as ActiveInvestment[]

  for (const inv of matured) {
    // mark complete and set full progress - update both tables for compatibility
    try {
      const updateQuery = usePostgres
        ? "UPDATE investments SET status = $1, progress_percentage = $2 WHERE id = $3"
        : "UPDATE active_investments SET status = $1, progressPercentage = $2 WHERE id = $3"
      
      const updateParams = usePostgres
        ? ['completed', 100, inv.id]
        : ['completed', 100, inv.id]
      
      await run(updateQuery, updateParams)
    } catch (updateErr) {
      console.error('Error marking investment as completed:', updateErr)
    }

    // Also update active_investments for backward compatibility
    try {
      await run(
        "UPDATE active_investments SET status = $1, progressPercentage = $2 WHERE id = $3",
        ['completed', 100, inv.id]
      )
    } catch (_activeErr) {
      // Might not exist in SQLite mode
    }

    // credit the expected profit and principal back to user balance
    const profit = inv.expectedProfit || 0
    const principal = inv.amount || 0
    const totalCredit = profit + principal
    await run(
      "UPDATE users SET balance = balance + $1 WHERE id = $2",
      [totalCredit, userId]
    )

    // record a deposit for the principal (so dashboard and history reflect it)
    if (principal > 0) {
      await createTransaction({
        userId,
        type: "deposit",
        amount: principal,
        status: "approved",
        description: `Principal returned from ${inv.planName}`,
      })
    }

    // record a return transaction for the profit portion
    if (profit > 0) {
      await createTransaction({
        userId,
        type: "return",
        amount: profit,
        status: "approved",
        description: `Profit from ${inv.planName}`,
      })
    }
  }
}

export async function updateTransactionStatus(transactionId: string, status: "approved" | "rejected") {
  await run(`
    UPDATE transactions SET status = $1 WHERE id = $2
  `, [status, transactionId])
}

export function updateUserSettings(userId: string, _settings: Record<string, unknown>) {
  // For now, this is a placeholder since we're using mock data
  // In a real app, this would update user settings in the database
  void _settings
  if (process.env.NODE_ENV === 'development') {
    console.log(`Updating settings for user ${userId}`)
  }
  return true
}

export async function createNotification(notification: {
  userId: string
  title: string
  message: string
  type: "success" | "info" | "warning" | "error"
  actionUrl?: string
}): Promise<string> {
  const { v4: uuidv4 } = await import('uuid')
  const notificationId = uuidv4()
  await run(
    "INSERT INTO notifications (id, user_id, title, message, type, read, created_at, action_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
    [
      notificationId,
      notification.userId,
      notification.title,
      notification.message,
      notification.type,
      false, // read = false
      new Date().toISOString(),
      notification.actionUrl || null,
    ]
  )
  return notificationId
}

export async function logActivity(userId: string, type: string, description: string, metadata?: any) {
  const activityId = `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  await run(
    "INSERT INTO activity_log (id, userId, type, description, metadata, timestamp) VALUES ($1, $2, $3, $4, $5, $6)",
    [
      activityId,
      userId,
      type,
      description,
      metadata ? JSON.stringify(metadata) : null,
      new Date().toISOString(),
    ]
  )
  return activityId
}

export async function updateLastLogin(userId: string) {
  await run("UPDATE users SET last_login = $1 WHERE id = $2", [
    new Date().toISOString(),
    userId,
  ])
}

export async function getUserActivity(userId: string, limit: number = 20) {
  const usePostgres = pgPool !== null
  
  const query = usePostgres
    ? "SELECT id, user_id as \"userId\", type, description, created_at as timestamp, 'success' as status FROM activity_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2"
    : "SELECT id, userId, type, description, timestamp, status FROM activity_log WHERE userId = $1 ORDER BY timestamp DESC LIMIT $2"
  
  const activities = await all(query, [userId, limit])
  
  // Map to Activity interface
  return activities.map((activity: any) => ({
    id: activity.id,
    type: activity.type as ActivityType,
    description: activity.description,
    timestamp: activity.timestamp,
    status: (activity.status || "success") as "success" | "pending" | "failed",
    created_at: activity.timestamp,
  }))
}

export async function deleteUser(userId: string): Promise<void> {
  try {
    // Delete all user-related data first
    // IMPORTANT: Must handle foreign key constraints in correct order
    
    // 1. Unassign any wallet addresses assigned to this user (FOREIGN KEY constraint)
    await run("UPDATE wallet_addresses SET assignedTo = NULL, assignedAt = NULL WHERE assignedTo = $1", [userId])
    
    // 2. Delete notifications linked to this user
    await run("DELETE FROM notifications WHERE userId = $1", [userId])
    
    // 3. Delete transactions for this user
    await run("DELETE FROM transactions WHERE userId = $1", [userId])
    
    // 4. Delete active investments for this user
    await run("DELETE FROM active_investments WHERE userId = $1", [userId])
    
    // 5. Finally delete the user (now safe - no foreign key violations)
    await run("DELETE FROM users WHERE id = $1", [userId])
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error)
    throw error
  }
}

export function isPostgres(): boolean {
  return !!pgPool
}

export { pgPool }
export default getDb

