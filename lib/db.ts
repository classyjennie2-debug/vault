import Database from "better-sqlite3"
import path from "path"
import bcrypt from "bcrypt"
import type { ActiveInvestment, InvestmentPlan } from "./types"

// support PostgreSQL when DATABASE_URL is provided (e.g. Neon on Vercel)
let pgPool: any = null
const DATABASE_URL = process.env.DATABASE_URL
let pgInitialized = false

console.log('[DB INIT] DATABASE_URL present:', !!DATABASE_URL)
console.log('[DB INIT] DATABASE_URL value (first 50 chars):', DATABASE_URL?.substring(0, 50))

if (DATABASE_URL) {
  // Dynamically import Pool to avoid errors when postgres is not installed
  try {
    const { Pool } = require('pg')
    pgPool = new Pool({ connectionString: DATABASE_URL, max: 1 })
    console.log('[DB INIT] PostgreSQL pool initialized successfully')
    // Test the connection immediately (sync)
    pgPool.query('SELECT 1', (err: any) => {
      if (err) {
        console.error('[DB INIT] PostgreSQL connection test failed:', err.message)
        throw new Error('[DB INIT] PostgreSQL connection failed: ' + err.message)
      } else {
        console.log('[DB INIT] PostgreSQL connection test successful')
      }
    })
  } catch (err: any) {
    console.error('[DB INIT] PostgreSQL not available:', err.message)
    throw new Error('[DB INIT] PostgreSQL not available: ' + err.message)
  }
} else {
  throw new Error('[DB INIT] DATABASE_URL not set. PostgreSQL is required in production.')
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
          email TEXT UNIQUE NOT NULL,
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
      } catch (err: any) {
        if (!err.message.includes('already exists') && !err.message.includes('duplicate')) {
          console.warn('Migration warning:', err.message)
        }
      }

      // Add planType column to investment_plans if it doesn't exist
      try {
        await pgPool.query(`
          ALTER TABLE investment_plans 
          ADD COLUMN plantype VARCHAR(255)
        `)
      } catch (err: any) {
        if (!err.message.includes('already exists') && !err.message.includes('duplicate')) {
          console.warn('Migration warning adding plantype column:', err.message)
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
        
        console.log('[Migration] Starting planType synchronization for all plans...')
        
        for (const mapping of planMappings) {
          const result = await pgPool.query(
            'UPDATE investment_plans SET plantype = $1 WHERE id = $2',
            [mapping.planType, mapping.id]
          )
          console.log(`[Migration] Updated plan ${mapping.id}: ${result.rowCount} rows affected`)
        }
        
        // Verify the updates
        const verifyResult = await pgPool.query('SELECT id, plantype FROM investment_plans ORDER BY id')
        console.log('[Migration] ✓ Current planType values in database:')
        for (const row of verifyResult.rows) {
          console.log(`  ${row.id}: ${row.plantype}`)
        }
      } catch (err) {
        console.warn('[Migration] Warning updating plan types:', err)
      }

      // Ensure plans exist in database - insert if not present
      try {
        console.log('[Seeding] Checking if investment plans exist...')
        const existingPlans = await pgPool.query('SELECT COUNT(*) as count FROM investment_plans')
        const planCount = parseInt(existingPlans.rows[0].count || '0')
        
        console.log(`[Seeding] Found ${planCount} existing plans`)
        
        if (planCount === 0) {
          console.log('[Seeding] No plans found, creating them now...')
          await seedDatabasePostgres()
        } else {
          console.log('[Seeding] Plans already exist, skipping creation')
        }
      } catch (seedError) {
        console.error("[Seeding] Error during seeding:", seedError)
        // Continue even if seeding fails
      }
      
      pgInitialized = true
    } catch (error) {
      console.error("Error initializing PostgreSQL:", error)
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
  console.log(`[RUN] Executing SQL: ${sql} with params:`, params, 'Backend:', pgPool ? 'PostgreSQL' : 'SQLite')
  
  if (pgPool) {
    await initializePostgres()
    try {
      const result = await pgPool.query(adaptSql(sql), params)
      console.log(`[RUN] PostgreSQL success - rowCount:`, result.rowCount)
      return result.rowCount || 0
    } catch (err: any) {
      console.error(`[RUN] PostgreSQL error:`, err.message)
      throw err
    }
  } else {
    try {
      const db = getDb()
      const result = db.prepare(sql).run(...params)
      console.log(`[RUN] SQLite success - changes:`, result.changes)
      return result.changes || 0
    } catch (err: any) {
      console.error(`[RUN] SQLite error:`, err.message)
      throw err
    }
  }
}

export async function get<T = DatabaseRow>(sql: string, params: unknown[] = []): Promise<T | undefined> {
  console.log(`[GET] Executing SQL: ${sql} with params:`, params, 'Backend:', pgPool ? 'PostgreSQL' : 'SQLite')
  
  if (pgPool) {
    await initializePostgres()
    try {
      const res = await pgPool.query(adaptSql(sql), params)
      const result = res.rows[0] as T
      console.log(`[GET] PostgreSQL success - result:`, result)
      return result
    } catch (err: any) {
      console.error(`[GET] PostgreSQL error:`, err.message)
      throw err
    }
  }
  
  try {
    const result = getDb().prepare(sql).get(...params) as T
    console.log(`[GET] SQLite success - result:`, result)
    return result
  } catch (err: any) {
    console.error(`[GET] SQLite error:`, err.message)
    throw err
  }
}

export async function all<T = DatabaseRow>(sql: string, params: unknown[] = []): Promise<T[]> {
  console.log(`[ALL] Executing SQL: ${sql} with params:`, params)
  
  if (pgPool) {
    await initializePostgres()
    const res = await pgPool.query(adaptSql(sql), params)
    console.log(`[ALL] PostgreSQL result rows:`, res.rows.length)
    return res.rows as T[]
  }
  
  const result = getDb().prepare(sql).all(...params) as T[]
  console.log(`[ALL] SQLite result rows:`, result.length)
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
    "SELECT id, name, email, passwordHash, verified, role, balance, joinedAt, avatar FROM users WHERE email = ?",
    [email]
  )) as UserRow | undefined

  if (row) {
    // Postgres returns column names in lowercase by default
    // so `passwordHash` may come back as `passwordhash`.
    if ((row as any).passwordhash && !(row as any).passwordHash) {
      ;(row as any).passwordHash = (row as any).passwordhash as string
    }
  }

  return row
}

export async function getUserById(id: string): Promise<UserRow | undefined> {
  const row = (await get(
    "SELECT id, name, email, passwordHash, verified, role, balance, joinedAt, avatar FROM users WHERE id = ?",
    [id]
  )) as UserRow | undefined

  if (row) {
    if ((row as any).passwordhash && !(row as any).passwordHash) {
      ;(row as any).passwordHash = (row as any).passwordhash as string
    }
  }

  return row
}

export async function createUser(user: {
  id: string
  name: string
  email: string
  passwordHash?: string
  avatar: string
  verified?: boolean
}): Promise<void> {
  await run(
    "INSERT INTO users (id, name, email, passwordHash, avatar, joinedAt, verified) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      user.id,
      user.name,
      user.email,
      user.passwordHash || null,
      user.avatar,
      new Date().toISOString(),
      user.verified ? 1 : 0,
    ]
  )
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

export async function getInvestmentPlansFromDb() {
  try {
    const rows: InvestmentPlan[] = await all("SELECT * FROM investment_plans")
    
    console.log("[getInvestmentPlansFromDb] Raw DB rows count:", rows.length)
    
    // Log for debugging - show first row to verify planType is present
    if (rows.length > 0) {
      console.log("[getInvestmentPlansFromDb] First row raw:", JSON.stringify(rows[0], null, 2))
    }
    
    // Map to include optional fields and ensure correct defaults
    const mappedPlans = rows.map((p: any, idx: number) => {
      // PostgreSQL returns column names in lowercase, so check both planType and plantype
      const planTypeValue = p.planType || p.plantype
      
      const mapped = {
        ...p,
        // Ensure numeric fields have proper values
        minAmount: Number.isFinite(p.minAmount) && p.minAmount > 0 ? p.minAmount : 1000,
        maxAmount: Number.isFinite(p.maxAmount) && p.maxAmount > 0 ? p.maxAmount : 500000,
        returnRate: Number.isFinite(p.returnRate) && p.returnRate > 0 ? p.returnRate : 8,
        duration: Number.isFinite(p.duration) && p.duration > 0 ? p.duration : 6,
        durationUnit: p.durationUnit || "months",
        risk: p.risk || "Medium",
        // CRITICAL: Explicitly include planType with proper fallback based on ID
        // Check both camelCase (planType) and lowercase (plantype) for PostgreSQL compatibility
        planType: planTypeValue && String(planTypeValue).trim() ? String(planTypeValue).trim() : getPlanTypeById(p.id),
        // Optional fields
        fees: p.fees || { management: 0, performance: 0, withdrawal: 0 },
        category: p.category || "",
      }
      
      // Log each plan to verify planType is correct
      if (idx < 4) {  // Only log first 4 plans to avoid spam
        console.log(`[getInvestmentPlansFromDb] Plan ${p.id}: raw.plantype="${p.plantype}", mapped.planType="${mapped.planType}"`)
      }
      
      return mapped
    })
    
    console.log("[getInvestmentPlansFromDb] Mapped plans count:", mappedPlans.length)
    return mappedPlans
  } catch (error) {
    console.error("[getInvestmentPlansFromDb] Error fetching plans:", error)
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
      duration: 0,
      durationUnit: "custom",
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
      duration: 0,
      durationUnit: "custom",
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
      duration: 0,
      durationUnit: "custom",
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
      duration: 0,
      durationUnit: "custom",
      risk: "Medium-Low",
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
  const planTypeValue = (p as any).planType || (p as any).plantype
  
  // Log for debugging
  console.log(`[getInvestmentPlanById] Found plan ${planId}, raw.plantype="${(p as any).plantype}", planType="${planTypeValue}"`)
  
  return {
    ...p,
    // CRITICAL: Ensure planType is set with fallback to ID-based mapping
    planType: planTypeValue && String(planTypeValue).trim() ? String(planTypeValue).trim() : getPlanTypeById(p.id),
    fees: p.fees || { management: 0, performance: 0, withdrawal: 0 },
    category: p.category || "",
  }
}

export async function getUserTransactions(userId: string) {
  return all("SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC", [userId])
}

export async function getUserNotifications(userId: string) {
  const notifications = await all("SELECT id, userId, title, message, type, isRead, timestamp, actionUrl FROM notifications WHERE userId = ? ORDER BY timestamp DESC", [userId])
  // Ensure isRead is properly cast to boolean for consistency
  return notifications.map((n: any) => ({
    id: n.id,
    userId: n.userId,
    title: n.title,
    message: n.message,
    type: n.type,
    timestamp: n.timestamp,
    actionUrl: n.actionUrl,
    isRead: n.isRead === 1 || n.isRead === true || n.isRead === '1' // Explicitly handle all cases
  }))
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    console.log(`[markNotificationAsRead] Starting for notification ${notificationId}, using ${pgPool ? 'PostgreSQL' : 'SQLite'}`)
    
    // First, verify it exists
    const beforeNotif = await get("SELECT id, isRead FROM notifications WHERE id = ?", [notificationId])
    console.log(`[markNotificationAsRead] Before update - notification exists:`, beforeNotif)
    
    if (!beforeNotif) {
      console.error(`[markNotificationAsRead] Notification ${notificationId} not found!`)
      return false
    }

    console.log(`[markNotificationAsRead] Executing: UPDATE notifications SET isRead = ? WHERE id = ?`)
    // Use parameterized query for both isRead value and id
    const changes = await run("UPDATE notifications SET isRead = ? WHERE id = ?", [1, notificationId])
    console.log(`[markNotificationAsRead] Update completed. Rows affected: ${changes}`)

    if (changes === 0) {
      console.error(`[markNotificationAsRead] UPDATE affected no rows`)
      return false
    }

    // Verify the update immediately with a fresh read
    const afterNotif = await get("SELECT id, isRead FROM notifications WHERE id = ?", [notificationId])
    console.log(`[markNotificationAsRead] After update - notification:`, afterNotif)
    
    if (!afterNotif) {
      console.error(`[markNotificationAsRead] Notification disappeared after update!`)
      return false
    }

    const isReadValue = afterNotif.isRead
    console.log(`[markNotificationAsRead] Verification - isRead value: ${isReadValue} (type: ${typeof isReadValue})`)
    
    if (isReadValue === 0 || isReadValue === false) {
      console.error(`[markNotificationAsRead] Update verification FAILED - isRead is still: ${isReadValue}`)
      return false
    }

    console.log(`[markNotificationAsRead] ✅ Update verified successfully - notification is marked as read`)
    return true
  } catch (err) {
    console.error(`[markNotificationAsRead] Exception occurred:`, err)
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
  const results = await all(
    `SELECT id, userId, planId, planName, amount, expectedProfit, startDate, endDate, status, progressPercentage 
     FROM active_investments WHERE userId = ? AND status = 'active'`,
    [userId]
  ) as any[]
  
  // Normalize column names (handle both camelCase and lowercase from database)
  return results.map(row => ({
    id: row.id,
    userId: row.userId || row.userid,
    planId: row.planId || row.planid,
    planName: row.planName || row.planname,
    amount: row.amount,
    expectedProfit: row.expectedProfit || row.expectedprofit,
    startDate: row.startDate || row.startdate,
    endDate: row.endDate || row.enddate,
    status: row.status,
    progressPercentage: row.progressPercentage !== undefined ? row.progressPercentage : (row.progresspercentage !== undefined ? row.progresspercentage : 0),
  }))
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
  console.log(`Updating settings for user ${userId}:`, settings)
  return true
}

export async function createNotification(notification: {
  userId: string
  title: string
  message: string
  type: "success" | "info" | "warning" | "error"
  actionUrl?: string
}) {
  const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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

