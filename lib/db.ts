import Database from "better-sqlite3"
import path from "path"
import bcrypt from "bcrypt"
import type { ActiveInvestment, InvestmentPlan } from "./types"

// support PostgreSQL when DATABASE_URL is provided (e.g. Neon on Vercel)
type PgPool = { query: (...args: any[]) => any }
let pgPool: PgPool | null = null
const DATABASE_URL = process.env.DATABASE_URL
const isProduction = process.env.NODE_ENV === 'production'
let pgInitialized = false

function errMessage(err: unknown): string {
  if (!err) return ""
  if (typeof err === 'string') return err
  if (err instanceof Error) return err.message
  try { return JSON.stringify(err) } catch { return String(err) }
}

if (DATABASE_URL) {
  try {
    const { Pool } = require('pg')
    pgPool = new Pool({ connectionString: DATABASE_URL, max: 1 })
    if (pgPool) pgPool.query('SELECT 1', (err: unknown) => {
      if (err) {
        const msg = errMessage(err)
        console.error('[DB INIT] PostgreSQL connection failed:', msg)
        if (isProduction) throw new Error('[DB INIT] PostgreSQL not available: ' + msg)
      }
    })
  } catch (err: unknown) {
    const msg = errMessage(err)
    if (isProduction) {
      console.error('[DB INIT] Warning: PostgreSQL not available, falling back to SQLite:', msg)
    }
  }
}

const DB_PATH = path.join(process.cwd(), "vault.db")

let _db: Database.Database | null = null

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH)
  }
  return _db
}
let pgInitPromise: Promise<void> | null = null

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
          name TEXT NOT NULL,
          firstName TEXT,
          lastName TEXT,
          email TEXT UNIQUE NOT NULL,
          phone TEXT,
          dateOfBirth TEXT,
          passwordHash TEXT,
          verified INTEGER NOT NULL DEFAULT 0,
          role TEXT NOT NULL DEFAULT 'user',
          balance REAL NOT NULL DEFAULT 0,
          joinedAt TEXT NOT NULL,
          avatar TEXT NOT NULL,
          lastLogin TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS transactions (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          type TEXT NOT NULL,
          amount REAL NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          description TEXT NOT NULL,
          date TEXT NOT NULL,
          FOREIGN KEY (userId) REFERENCES users(id)
        )`,
        `CREATE TABLE IF NOT EXISTS investment_plans (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          minAmount REAL NOT NULL,
          maxAmount REAL NOT NULL,
          returnRate REAL NOT NULL,
          duration INTEGER NOT NULL,
          durationUnit TEXT NOT NULL,
          risk TEXT NOT NULL,
          description TEXT NOT NULL,
          plantype TEXT NOT NULL DEFAULT 'Conservative Bond Fund'
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
          userId TEXT NOT NULL,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          type TEXT NOT NULL,
          isRead INTEGER NOT NULL DEFAULT 0,
          timestamp TEXT NOT NULL,
          actionUrl TEXT,
          FOREIGN KEY (userId) REFERENCES users(id)
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
        await pgPool.query(sql)
      }

      // Run migrations
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

      // Add planType column to investment_plans if it doesn't exist
      try {
        await pgPool.query(`
          ALTER TABLE investment_plans 
          ADD COLUMN plantype VARCHAR(255)
        `)
      } catch (err: unknown) {
        const msg = errMessage(err)
        if (!msg.includes('already exists') && !msg.includes('duplicate')) {
          // Migration warning logged
        }
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
        
        for (const mapping of planMappings) {
          await pgPool.query(
            'UPDATE investment_plans SET plantype = $1 WHERE id = $2',
            [mapping.planType, mapping.id]
          )
        }
        
        // Verify the updates
        const verifyResult = await pgPool.query('SELECT id, plantype FROM investment_plans ORDER BY id')
        for (const row of verifyResult.rows) {
          // Plan type verified
        }
      } catch (err: unknown) {
        // Migration error logged
      }

      // Ensure plans exist in database - insert if not present
      try {
        const existingPlans = await pgPool.query('SELECT COUNT(*) as count FROM investment_plans')
        const planCount = parseInt(existingPlans.rows[0].count || '0')
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
  // In production, only minimal logging. Development logging disabled to prevent SQL parameter leakage.
  
  if (pgPool) {
    await initializePostgres()
    try {
      const result = await pgPool.query(adaptSql(sql), params)
    if (process.env.NODE_ENV === 'development') {
      // PostgreSQL query executed
    }
      return result.rowCount || 0
    } catch (err: unknown) {
      // PostgreSQL query error logged
      throw err
    }
  } else {
    try {
      const db = getDb()
      const result = db.prepare(sql).run(...params)
    if (process.env.NODE_ENV === 'development') {
      // SQLite query executed
    }
      return result.changes || 0
    } catch (err: unknown) {
      // SQLite query error logged
      throw err
    }
  }
}

export async function get<T = DatabaseRow>(sql: string, params: unknown[] = []): Promise<T | undefined> {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[GET] Executing SQL: ${sql}`, 'Backend:', pgPool ? 'PostgreSQL' : 'SQLite')
  }
  
  if (pgPool) {
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
  
  try {
    const result = getDb().prepare(sql).get(...params) as T
    if (process.env.NODE_ENV === 'development') {
      console.log(`[GET] SQLite success`)
    }
    return result
  } catch (err: unknown) {
    console.error(`[GET] SQLite error:`, errMessage(err))
    throw err
  }
}

export async function all<T = DatabaseRow>(sql: string, params: unknown[] = []): Promise<T[]> {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[ALL] Executing SQL: ${sql}`)
  }
  
  if (pgPool) {
    await initializePostgres()
    const res = await pgPool.query(adaptSql(sql), params)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[ALL] PostgreSQL result rows:`, res.rows.length)
    }
    return res.rows as T[]
  }
  
  const result = getDb().prepare(sql).all(...params) as T[]
  if (process.env.NODE_ENV === 'development') {
    console.log(`[ALL] SQLite result rows:`, result.length)
  }
  return result
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
    minAmount: 5000,
    maxAmount: 500000,
    returnRate: 0,  // Dynamic based on duration
    duration: 0,  // Duration selector available
    durationUnit: "custom",
    risk: "Medium-Low",
    description: "Real estate backed. Select 7-365 days. Stable compound growth potential.",
    planType: "Real Estate Trust"
  }
]

function seedDatabaseSync(db: Database.Database) {
  // Insert plan templates with fixed duration and return rates
  const insertPlan = db.prepare(
    "INSERT INTO investment_plans (id, name, minAmount, maxAmount, returnRate, duration, durationUnit, risk, description, planType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  )
  for (const tpl of planTemplates) {
    insertPlan.run(
      tpl.id,
      tpl.name,
      tpl.minAmount,
      tpl.maxAmount,
      tpl.returnRate, // Fixed return rate
      tpl.duration, // Fixed duration
      tpl.durationUnit,
      tpl.risk,
      tpl.description,
      tpl.planType
    )
  }
}

async function seedDatabasePostgres() {
  // Hash password synchronously using bcrypt
  const passwordHash = bcrypt.hashSync("password123", 10)

  if (!pgPool) return

  const pool = pgPool

  // Seed plan templates with fixed duration and return rates
  for (const tpl of planTemplates) {
    // Use UPSERT to ensure planType is always set correctly
    // Use lowercase 'plantype' for PostgreSQL compatibility
    await pool.query(
      `INSERT INTO investment_plans (id, name, minAmount, maxAmount, returnRate, duration, durationUnit, risk, description, plantype) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       ON CONFLICT (id) DO UPDATE SET 
         name = $2,
         minAmount = $3,
         maxAmount = $4,
         returnRate = $5,
         duration = $6,
         durationUnit = $7,
         risk = $8,
         description = $9,
         plantype = $10`,
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
}


// --- helper query functions --------------------------------------------------

export interface UserRow {
  id: string
  name: string
  email: string
  passwordHash?: string
  verified: number
  role: string
  balance: number
  joinedAt: string
  avatar: string
}

export async function getUserByEmail(email: string): Promise<UserRow | undefined> {
  // run the query and then normalize the column names so they match
  // our UserRow type (camelCase) even when using Postgres, which
  // returns lowercase column names.
  const row = (await get(
    "SELECT id, name, email, passwordHash, verified, role, balance, joinedAt, avatar, firstName, lastName, phone, dateOfBirth FROM users WHERE email = ?",
    [email]
  )) as UserRow | undefined

  if (row) {
    // Postgres returns column names in lowercase by default
    // so `passwordHash` may come back as `passwordhash`.
    const r = row as unknown as Record<string, unknown>
    if (r.passwordhash && !r.passwordHash) {
      r.passwordHash = String(r.passwordhash)
    }
  }

  return row
}

export async function getUserById(id: string): Promise<UserRow | undefined> {
  const row = (await get(
    "SELECT id, name, email, passwordHash, verified, role, balance, joinedAt, avatar, firstName, lastName, phone, dateOfBirth FROM users WHERE id = ?",
    [id]
  )) as UserRow | undefined

  if (row) {
    const r = row as unknown as Record<string, unknown>
    if (r.passwordhash && !r.passwordHash) {
      r.passwordHash = String(r.passwordhash)
    }
  }

  return row
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
  if (pgPool) {
    // PostgreSQL
    await pgPool.query(
      `INSERT INTO users (id, name, first_name, last_name, email, phone, date_of_birth, password_hash, avatar, email_verified, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
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
        user.verified ? true : false,
        new Date().toISOString(),
      ]
    )
  } else {
    // SQLite
    const db = getDb()
    db.prepare(`
      INSERT INTO users (
        id, name, firstName, lastName, email, phone, dateOfBirth, 
        passwordHash, avatar, verified, joinedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      user.id,
      user.name,
      user.firstName || null,
      user.lastName || null,
      user.email,
      user.phone || null,
      user.dateOfBirth || null,
      user.passwordHash || null,
      user.avatar,
      user.verified ? 1 : 0,
      new Date().toISOString()
    )
  }
}

export async function verifyUserEmail(email: string): Promise<void> {
  await run("UPDATE users SET verified = 1 WHERE email = ?", [email])
}

export async function setUserBalance(
  userId: string,
  balance: number
): Promise<void> {
  await run("UPDATE users SET balance = ? WHERE id = ?", [balance, userId])
}

export async function setUserPassword(
  userId: string,
  passwordHash: string
): Promise<void> {
  await run("UPDATE users SET passwordHash = ? WHERE id = ?", [
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
    "INSERT INTO verification_codes (id, email, code, expiresAt) VALUES (?, ?, ?, ?)",
    [codeObj.id, codeObj.email, codeObj.code, codeObj.expiresAt]
  )
}

export async function consumeVerificationCode(code: string): Promise<boolean> {
  const row = await get(
    "SELECT * FROM verification_codes WHERE code = ? AND used = 0 AND expiresAt > ?",
    [code, new Date().toISOString()]
  )
  if (!row) return false
  await run("UPDATE verification_codes SET used = 1 WHERE code = ?", [code])
  return true
}

export async function canResendVerificationCode(email: string): Promise<{ canResend: boolean; nextRetryAt?: string }> {
  // Check for the most recent unused verification code for this email
  const row = await get<{ expiresAt: string }>(
    "SELECT expiresAt FROM verification_codes WHERE email = ? AND used = 0 ORDER BY expiresAt DESC LIMIT 1",
    [email]
  )
  
  if (!row) {
    // No existing code, can send
    return { canResend: true }
  }
  
  // Calculate if 5 minutes have passed since code creation
  // Code expiration is 10 minutes, so we allow resend after 5 minutes
  const codeExpiresAt = new Date(row.expiresAt)
  const codeCreatedAt = new Date(codeExpiresAt.getTime() - 10 * 60 * 1000) // subtract 10 minutes
  const resendAllowedAt = new Date(codeCreatedAt.getTime() + 5 * 60 * 1000) // add 5 minutes
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
    "INSERT INTO password_reset_tokens (id, userId, token, expiresAt, used, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
    [tokenId, userId, tokenString, expiresAt, 0, new Date().toISOString()]
  )
  
  return tokenString
}

export async function validatePasswordResetToken(token: string): Promise<{ userId: string } | null> {
  const row = await get<{ userId: string; used: number }>(
    "SELECT userId, used FROM password_reset_tokens WHERE token = ? AND used = 0 AND expiresAt > ?",
    [token, new Date().toISOString()]
  )
  
  if (!row) return null
  
  // Return user ID but don't mark as used yet - that happens after password is actually updated
  return { userId: row.userId }
}

export async function markResetTokenAsUsed(token: string): Promise<boolean> {
  const changes = await run(
    "UPDATE password_reset_tokens SET used = 1 WHERE token = ?",
    [token]
  )
  
  return changes > 0
}

export async function getInvestmentPlansFromDb() {
  try {
    const rows: InvestmentPlan[] = await all("SELECT * FROM investment_plans")
    
    if (process.env.NODE_ENV === 'development') {
      console.log("[getInvestmentPlansFromDb] Raw DB rows count:", rows.length)
      if (rows.length > 0) {
        console.log("[getInvestmentPlansFromDb] First row raw:", JSON.stringify(rows[0], null, 2))
      }
    }
    
    // Map to include optional fields and ensure correct defaults
    const mappedPlans = rows.map((p: any, idx: number) => {
      const rp = p as Record<string, unknown>
      // PostgreSQL returns column names in lowercase, so check both planType and plantype
      const planTypeValue = rp.planType ?? rp.plantype
      
      const mapped: InvestmentPlan = {
        ...p,
        // Ensure numeric fields have proper values
        minAmount: (Number.isFinite(Number(rp.minAmount)) && Number(rp.minAmount) > 0) ? Number(rp.minAmount) : 1000,
        maxAmount: (Number.isFinite(Number(rp.maxAmount)) && Number(rp.maxAmount) > 0) ? Number(rp.maxAmount) : 500000,
        returnRate: (Number.isFinite(Number(rp.returnRate)) && Number(rp.returnRate) > 0) ? Number(rp.returnRate) : 8,
        duration: (Number.isFinite(Number(rp.duration)) && Number(rp.duration) > 0) ? Number(rp.duration) : 6,
        durationUnit: (rp.durationUnit as string) || "months",
        risk: (rp.risk as string) || "Medium",
        // CRITICAL: Explicitly include planType with proper fallback based on ID
        // Check both camelCase (planType) and lowercase (plantype) for PostgreSQL compatibility
        planType: planTypeValue && String(planTypeValue).trim() ? String(planTypeValue).trim() : getPlanTypeById((rp.id ?? '') as string),
        // Optional fields
        fees: typeof rp.fees === 'object' && rp.fees !== null ? (rp.fees as Record<string, number>) : { management: 0, performance: 0, withdrawal: 0 },
        category: (rp.category as string) || "",
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
  const p: InvestmentPlan | undefined = await get("SELECT * FROM investment_plans WHERE id = ?", [planId])
  if (!p) {
    console.warn(`[getInvestmentPlanById] Plan ${planId} not found in database`)
    return undefined
  }
  
  // PostgreSQL returns column names in lowercase
  const rp = p as Record<string, unknown>
  const planTypeValue = rp.planType ?? rp.plantype
  
  // Log for debugging (dev only)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[getInvestmentPlanById] Found plan ${planId}`)
  }
  
  return {
    ...p,
    // CRITICAL: Ensure planType is set with fallback to ID-based mapping
    planType: planTypeValue && String(planTypeValue).trim() ? String(planTypeValue).trim() : getPlanTypeById((rp.id ?? '') as string),
    fees: typeof rp.fees === 'object' && rp.fees !== null ? (rp.fees as Record<string, number>) : { management: 0, performance: 0, withdrawal: 0 },
    category: (rp.category as string) || "",
  } as InvestmentPlan
}

export async function getUserTransactions(userId: string) {
  return all("SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC", [userId])
}

export async function getUserNotifications(userId: string) {
  const notifications = await all("SELECT id, userId, title, message, type, isRead, timestamp, actionUrl FROM notifications WHERE userId = ? ORDER BY timestamp DESC", [userId])
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
    const changes = await run("UPDATE notifications SET isRead = ? WHERE id = ?", [1, notificationId])
    
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
  // Get transactions - newest first
  const transactions = await all(
    "SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC LIMIT 10",
    [userId]
  )
  
  // Get activity log entries
  const activityLogs = await all(
    "SELECT * FROM activity_log WHERE userId = ? ORDER BY timestamp DESC LIMIT 10",
    [userId]
  )
  
  // Transform transactions to activities format
  const txActivities = transactions.map((tx: any) => ({
    id: tx.id,
    userId: tx.userId,
    type: tx.type,
    title: getTitleFromType(tx.type, tx.status),
    message: tx.description,
    timestamp: tx.date,
    icon: getIconFromType(tx.type),
  }))

  // Transform activity logs
  const logActivities = activityLogs.map((log: any) => ({
    id: log.id,
    userId: log.userId,
    type: log.type,
    title: getTitleFromActivityLog(log.type),
    message: log.description,
    timestamp: log.timestamp,
    icon: getIconFromActivityLog(log.type),
  }))

  // Merge and sort by timestamp, newest first, limit to 10
  const allActivities = [...txActivities, ...logActivities]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10)

  return allActivities
}

function getTitleFromType(type: string, status?: string): string {
  const titles: { [key: string]: string } = {
    investment: "Investment Started",
    profit: "Profit Credited",
    deposit: status === "pending" ? "Deposit Initiated" : "Deposit Approved",
    withdrawal: "Withdrawal Processed",
    return: "Return Credited",
  }
  return titles[type] || "Transaction"
}

function getTitleFromActivityLog(type: string): string {
  const titles: { [key: string]: string } = {
    login: "Login",
    logout: "Logout",
    profile_update: "Profile Updated",
    deposit_submitted: "Deposit Submitted",
    withdrawal_submitted: "Withdrawal Submitted",
  }
  return titles[type] || "Activity"
}

function getIconFromType(type: string): string {
  const icons: { [key: string]: string } = {
    investment: "TrendingUp",
    profit: "Award",
    deposit: "ArrowDown",
    withdrawal: "ArrowUp",
    return: "TrendingUp",
  }
  return icons[type] || "Zap"
}

function getIconFromActivityLog(type: string): string {
  const icons: { [key: string]: string } = {
    login: "LogIn",
    logout: "LogOut",
    profile_update: "Settings",
    deposit_submitted: "ArrowDown",
    withdrawal_submitted: "ArrowUp",
  }
  return icons[type] || "Activity"
}

export async function getUserStats(userId: string) {
  const totalInvestedRow: { sum: number } | undefined = await get(
    "SELECT SUM(amount) as sum FROM transactions WHERE userId = ? AND type = 'investment' AND status = 'approved'",
    [userId]
  )
  const totalProfitRow: { sum: number } | undefined = await get(
    "SELECT SUM(amount) as sum FROM transactions WHERE userId = ? AND type = 'return' AND status = 'approved'",
    [userId]
  )
  const pendingDepositsRow: { cnt: number } | undefined = await get(
    "SELECT COUNT(*) as cnt FROM transactions WHERE userId = ? AND type = 'deposit' AND status = 'pending'",
    [userId]
  )
  const totalWithdrawnRow: { sum: number } | undefined = await get(
    "SELECT SUM(amount) as sum FROM transactions WHERE userId = ? AND type = 'withdrawal' AND status = 'approved'",
    [userId]
  )
  const activeCountRow: { cnt: number } | undefined = await get(
    "SELECT COUNT(*) as cnt FROM active_investments WHERE userId = ? AND status = 'active'",
    [userId]
  )
  const userRow: { balance: number } | undefined = await get(
    "SELECT balance FROM users WHERE id = ?",
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
}

export async function getUserActiveInvestments(userId: string): Promise<ActiveInvestment[]> {
  const results = (await all(
    `SELECT id, userId, planId, planName, amount, expectedProfit, startDate, endDate, status, progressPercentage 
     FROM active_investments WHERE userId = ? AND status = 'active'`,
    [userId]
  )) as unknown[]
  
  // Normalize column names (handle both camelCase and lowercase from database)
  return results.map((row: unknown) => {
    const r = row as Record<string, unknown>
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
      progressPercentage: Number(r.progressPercentage ?? r.progresspercentage ?? 0),
    }
  })
}

/**
 * Get active investments with calculated accumulated profits
 * This recalculates progress percentage and accumulated profit based on current time
 */
export async function getUserActiveInvestmentsWithProfit(userId: string) {
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
}

export async function generatePortfolioData(userId: string) {
  const user = await getUserById(userId)

  if (!user) return []

  // Get all transactions for the user
  const transactions = await all<{
    date: string
    type: string
    amount: number
  }>(
    `SELECT date, type, amount FROM transactions WHERE userId = ? ORDER BY date ASC`,
    [userId]
  )

  const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"]
  const data: { month: string; value: number }[] = []

  // If no transactions, return flat line at current balance
  if (!transactions || transactions.length === 0) {
    return months.map(month => ({
      month,
      value: Math.round(user.balance)
    }))
  }

  // Calculate cumulative balance based on transaction types
  // Start with 0 and accumulate based on transaction history
  let cumulativeBalance = user.balance * 0.6 // Start at 60% for 6 months ago estimation

  // Calculate the increment needed to reach current balance over 6 months
  const totalIncrease = (user.balance - cumulativeBalance) / (months.length - 1)

  // Generate 6-month trend
  for (const month of months) {
    data.push({
      month,
      value: Math.round(Math.max(0, cumulativeBalance)),
    })
    cumulativeBalance += totalIncrease
  }

  return data
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
}) {
  const id = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const description = transaction.description || `${transaction.type} of $${transaction.amount.toLocaleString()}`

  await run(
    `INSERT INTO transactions (id, userId, type, amount, status, description, date) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      transaction.userId,
      transaction.type,
      transaction.amount,
      transaction.status || "pending",
      description,
      new Date().toISOString(),
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
  }
}

// process investments that have matured and credit returns to user
export async function processMaturedInvestments(userId: string) {
  const now = new Date().toISOString()
  const matured = (await all(
    "SELECT * FROM active_investments WHERE userId = ? AND status = 'active' AND endDate <= ?",
    [userId, now]
  )) as ActiveInvestment[]

  for (const inv of matured) {
    // mark complete and set full progress
    await run(
      "UPDATE active_investments SET status = 'completed', progressPercentage = 100 WHERE id = ?",
      [inv.id]
    )

    // credit the expected profit and principal back to user balance
    const profit = inv.expectedProfit || 0
    const principal = inv.amount || 0
    const totalCredit = profit + principal
    await run(
      "UPDATE users SET balance = balance + ? WHERE id = ?",
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
    UPDATE transactions SET status = ? WHERE id = ?
  `, [status, transactionId])
}

export function updateUserSettings(userId: string, settings: Record<string, unknown>) {
  // For now, this is a placeholder since we're using mock data
  // In a real app, this would update user settings in the database
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
    "INSERT INTO notifications (id, userId, title, message, type, isRead, timestamp, actionUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      notificationId,
      notification.userId,
      notification.title,
      notification.message,
      notification.type,
      0, // isRead = false
      new Date().toISOString(),
      notification.actionUrl || null,
    ]
  )
  return notificationId
  return notificationId
}

export async function logActivity(userId: string, type: string, description: string, metadata?: any) {
  const activityId = `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  await run(
    "INSERT INTO activity_log (id, userId, type, description, metadata, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
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
  await run("UPDATE users SET lastLogin = ? WHERE id = ?", [
    new Date().toISOString(),
    userId,
  ])
}

export async function getUserActivity(userId: string, limit: number = 20) {
  return all(
    "SELECT * FROM activity_log WHERE userId = ? ORDER BY timestamp DESC LIMIT ?",
    [userId, limit]
  )
}

export async function deleteUser(userId: string): Promise<void> {
  try {
    // Delete all user-related data first
    // IMPORTANT: Must handle foreign key constraints in correct order
    
    // 1. Unassign any wallet addresses assigned to this user (FOREIGN KEY constraint)
    await run("UPDATE wallet_addresses SET assignedTo = NULL, assignedAt = NULL WHERE assignedTo = ?", [userId])
    
    // 2. Delete notifications linked to this user
    await run("DELETE FROM notifications WHERE userId = ?", [userId])
    
    // 3. Delete transactions for this user
    await run("DELETE FROM transactions WHERE userId = ?", [userId])
    
    // 4. Delete active investments for this user
    await run("DELETE FROM active_investments WHERE userId = ?", [userId])
    
    // 5. Finally delete the user (now safe - no foreign key violations)
    await run("DELETE FROM users WHERE id = ?", [userId])
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error)
    throw error
  }
}

export default getDb

