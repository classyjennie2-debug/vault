import Database from "better-sqlite3"
import path from "path"
import bcrypt from "bcrypt"
import type { ActiveInvestment, InvestmentPlan } from "./types"
// @ts-expect-error - pg types are optional, using fallback types
import { Pool } from "pg"

// support PostgreSQL when DATABASE_URL is provided (e.g. Neon on Vercel)
let pgPool: Pool | null = null
const DATABASE_URL = process.env.DATABASE_URL
let pgInitialized = false

if (DATABASE_URL) {
  pgPool = new Pool({ connectionString: DATABASE_URL })
}

const DB_PATH = path.join(process.cwd(), "vault.db")

let _db: Database.Database | null = null
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
          avatar TEXT NOT NULL
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
          description TEXT NOT NULL
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
        )`
      ]

      for (const sql of tableDefs) {
        await pgPool.query(sql)
      }

      // Check if already seeded
      try {
        const res = await pgPool.query("SELECT value FROM _meta WHERE key = 'seeded'")
        if (res.rows.length === 0) {
          await seedDatabasePostgres()
          await pgPool.query("INSERT INTO _meta (key, value) VALUES ('seeded', 'true')")
        }
      } catch (seedError) {
        console.error("Error during seeding:", seedError)
        // Continue even if seeding fails (data might already exist)
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

function getDb(): Database.Database {
  if (_db) return _db

  _db = new Database(DB_PATH)
  _db.pragma("journal_mode = WAL")
  _db.pragma("foreign_keys = ON")

  // Create tables if they don't exist
  _db.exec(`
    CREATE TABLE IF NOT EXISTS _meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT,
      verified INTEGER NOT NULL DEFAULT 0,
      role TEXT NOT NULL DEFAULT 'user',
      balance REAL NOT NULL DEFAULT 0,
      joinedAt TEXT NOT NULL,
      avatar TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS investment_plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      minAmount REAL NOT NULL,
      maxAmount REAL NOT NULL,
      returnRate REAL NOT NULL,
      duration INTEGER NOT NULL,
      durationUnit TEXT NOT NULL,
      risk TEXT NOT NULL,
      description TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS active_investments (
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
    );

    CREATE TABLE IF NOT EXISTS wallet_addresses (
      id TEXT PRIMARY KEY,
      coin TEXT NOT NULL,
      network TEXT NOT NULL,
      address TEXT NOT NULL,
      assignedTo TEXT,
      assignedAt TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (assignedTo) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      isRead INTEGER NOT NULL DEFAULT 0,
      timestamp TEXT NOT NULL,
      actionUrl TEXT,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS verification_codes (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      expiresAt TEXT NOT NULL,
      used INTEGER NOT NULL DEFAULT 0
    );
  `)

  // Seed data on first run
  const seeded = _db.prepare("SELECT value FROM _meta WHERE key = 'seeded'").get() as { value: string } | undefined
  if (!seeded) {
    seedDatabaseSync(_db)
    _db.prepare("INSERT INTO _meta (key, value) VALUES ('seeded', 'true')").run()
  }

  return _db
}

// utility helpers to abstract sqlite / postgres differences
function adaptSql(sql: string) {
  if (!pgPool) return sql
  let idx = 0
  return sql.replace(/\?/g, () => "$" + ++idx)
}

interface DatabaseRow {
  [key: string]: unknown
}

export async function run(sql: string, params: unknown[] = []): Promise<void> {
  if (pgPool) {
    await initializePostgres()
    await pgPool.query(adaptSql(sql), params)
  } else {
    getDb().prepare(sql).run(...params)
  }
}

export async function get<T = DatabaseRow>(sql: string, params: unknown[] = []): Promise<T | undefined> {
  if (pgPool) {
    await initializePostgres()
    const res = await pgPool.query(adaptSql(sql), params)
    return res.rows[0] as T
  }
  return getDb().prepare(sql).get(...params) as T
}

export async function all<T = DatabaseRow>(sql: string, params: unknown[] = []): Promise<T[]> {
  if (pgPool) {
    await initializePostgres()
    const res = await pgPool.query(adaptSql(sql), params)
    return res.rows as T[]
  }
  return getDb().prepare(sql).all(...params) as T[]
}

function seedDatabaseSync(db: Database.Database) {
  // Hash password synchronously using bcrypt
  const passwordHash = bcrypt.hashSync("password123", 10)

  // ── Users ───────────────────────────────────────────────────────────
  const insertUser = db.prepare(
    "INSERT INTO users (id, name, email, passwordHash, verified, role, balance, joinedAt, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  )

  const users = [
    ["u1", "Alexandra Chen", "alex@example.com", passwordHash, 1, "user", 48250.75, "2025-06-15", "AC"],
    ["u2", "Marcus Johnson", "marcus@example.com", passwordHash, 1, "user", 125800.0, "2025-03-10", "MJ"],
    ["u3", "Priya Sharma", "priya@example.com", passwordHash, 1, "user", 67340.5, "2025-08-22", "PS"],
    ["u4", "David Kim", "david@example.com", passwordHash, 1, "user", 9120.0, "2025-11-05", "DK"],
    ["u5", "Fatima Al-Rashid", "fatima@example.com", passwordHash, 1, "user", 231500.25, "2025-01-18", "FA"],
    ["a1", "Admin", "admin@vaultinvest.com", passwordHash, 1, "admin", 0, "2024-01-01", "AD"],
  ]
  for (const u of users) insertUser.run(...u)

  // ── Transactions ────────────────────────────────────────────────────
  const insertTx = db.prepare(
    "INSERT INTO transactions (id, userId, type, amount, status, description, date) VALUES (?, ?, ?, ?, ?, ?, ?)"
  )

  const txs = [
    ["t1", "u1", "deposit", 10000, "approved", "Bank transfer deposit", "2026-02-28"],
    ["t2", "u1", "investment", 5000, "approved", "Growth Portfolio investment", "2026-02-25"],
    ["t3", "u1", "return", 1250.75, "approved", "Monthly return - Growth Portfolio", "2026-02-20"],
    ["t4", "u1", "withdrawal", 3000, "pending", "Withdrawal to bank account", "2026-03-01"],
    ["t5", "u1", "deposit", 25000, "approved", "Wire transfer deposit", "2026-02-15"],
    ["t6", "u1", "investment", 15000, "approved", "Conservative Bond Fund", "2026-02-10"],
    ["t7", "u2", "deposit", 50000, "approved", "Bank transfer deposit", "2026-02-27"],
    ["t8", "u2", "withdrawal", 15000, "pending", "Withdrawal to bank account", "2026-03-02"],
    ["t9", "u3", "investment", 20000, "pending", "High Yield Equity Fund", "2026-03-01"],
    ["t10", "u4", "deposit", 5000, "pending", "Bank transfer deposit", "2026-03-03"],
    ["t11", "u5", "withdrawal", 30000, "pending", "Withdrawal to bank account", "2026-03-02"],
  ]
  for (const t of txs) insertTx.run(...t)

  // ── Investment Plans ────────────────────────────────────────────────
  const insertPlan = db.prepare(
    "INSERT INTO investment_plans (id, name, minAmount, maxAmount, returnRate, duration, durationUnit, risk, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  )

  const plans = [
    ["p1", "Conservative Bond Fund", 1000, 100000, 6.5, 12, "months", "Low", "A stable, low-risk fund investing primarily in government and corporate bonds. Ideal for capital preservation with steady returns."],
    ["p2", "Growth Portfolio", 5000, 500000, 12.8, 6, "months", "Medium", "A balanced portfolio combining equities and fixed income for moderate growth. Designed for investors seeking higher returns with manageable risk."],
    ["p3", "High Yield Equity Fund", 10000, 1000000, 22.5, 3, "months", "High", "An aggressive equity fund targeting high-growth sectors. Suitable for experienced investors with higher risk tolerance."],
    ["p4", "Real Estate Trust", 25000, 500000, 9.2, 24, "months", "Medium", "Diversified real estate investment trust providing exposure to commercial and residential properties with quarterly dividends."],
  ]
  for (const p of plans) insertPlan.run(...p)

  // ── Active Investments ──────────────────────────────────────────────
  const insertActiveInvestment = db.prepare(
    "INSERT INTO active_investments (id, userId, planId, planName, amount, expectedProfit, startDate, endDate, status, progressPercentage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  )

  const activeInvestments = [
    ["i1", "u1", "p2", "Growth Portfolio", 5000, 640, "2026-02-25", "2026-08-25", "active", 45],
    ["i2", "u1", "p1", "Conservative Bond Fund", 15000, 975, "2026-02-10", "2026-02-10", "active", 80],
    ["i3", "u2", "p3", "High Yield Equity Fund", 75000, 16875, "2026-01-15", "2026-04-15", "active", 65],
    ["i4", "u3", "p4", "Real Estate Trust", 40000, 3680, "2025-12-01", "2027-12-01", "active", 25],
  ]
  for (const i of activeInvestments) insertActiveInvestment.run(...i)

  // ── Wallet Addresses ────────────────────────────────────────────────
  const insertWallet = db.prepare(
    "INSERT INTO wallet_addresses (id, coin, network, address, assignedTo, assignedAt, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)"
  )

  const wallets = [
    ["w1", "USDT", "TRC20", "TXqH4JBkVBY9JFGiPqjE3bWz2TcxY7k8Rd", null, null, "2026-01-15"],
    ["w2", "USDT", "TRC20", "TNpGCEmRbR5zLwjvTYASX2qFa6s6doLcv8", "u2", "2026-02-20", "2026-01-15"],
    ["w3", "USDT", "ERC20", "0x4a8C12fE91b7DA6e2C47b2018F9321bE5dA2e8c3", null, null, "2026-01-20"],
    ["w4", "USDT", "BEP20", "0xBb29C7f1e5A8f37D5c21bA7E6d9C51f4dE3a2b81", null, null, "2026-02-01"],
    ["w11", "USDT", "USDT0", "0xD4e3F2a1B0c9D8e7F6a5B4c3D2e1F0a9B8c7D6e5", null, null, "2026-02-10"],
    ["w5", "BTC", "BTC", "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", null, null, "2026-01-18"],
    ["w6", "BTC", "BTC", "bc1q9h0yjdupyfpgk6ewahl7rgcw4nxfmz7m3afcl", "u3", "2026-02-25", "2026-01-18"],
    ["w7", "ETH", "ERC20", "0x1a2B3c4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F9a0B", null, null, "2026-01-22"],
    ["w9", "BNB", "BEP20", "0xF1e2D3c4B5a6F7e8D9c0B1a2F3e4D5c6B7a8F9e0", null, null, "2026-01-25"],
    ["w10", "BNB", "BEP20", "0xA9b8C7d6E5f4A3b2C1d0E9f8A7b6C5d4E3f2A1b0", "u1", "2026-03-01", "2026-02-10"],
    ["w12", "TRX", "TRC20", "TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7", null, null, "2026-02-01"],
    ["w13", "TRX", "TRC20", "TGjYzgCyPobsNS9n6WcbdLVR9dH7mWqFx7", "u4", "2026-02-28", "2026-02-01"],
    ["w14", "SOL", "SOL", "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU", null, null, "2026-02-05"],
    ["w15", "SOL", "SOL", "DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC86PZ8okm21hy", null, null, "2026-02-15"],
  ]
  for (const w of wallets) insertWallet.run(...w)

  // ── Notifications ───────────────────────────────────────────────────
  const insertNotification = db.prepare(
    "INSERT INTO notifications (id, userId, title, message, type, isRead, timestamp, actionUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  )

  const notifications = [
    ["n1", "u1", "Investment Completed", "Your Growth Portfolio investment of $5,000 is now active", "success", 0, "2026-03-03T10:30:00Z", "/dashboard"],
    ["n2", "u1", "Profit Credited", "You earned $250.50 from your Growth Portfolio", "success", 0, "2026-03-02T14:15:00Z", "/dashboard"],
    ["n3", "u1", "Deposit Approved", "Your deposit of $10,000 has been approved", "success", 1, "2026-02-28T11:00:00Z", "/dashboard"],
    ["n4", "u1", "Withdrawal Pending", "Your withdrawal request of $3,000 is pending review", "warning", 1, "2026-03-01T09:45:00Z", "/dashboard"],
    ["n5", "u1", "Plan Expiring Soon", "Your Conservative Bond Fund investment will mature in 365 days", "info", 1, "2026-02-20T16:20:00Z", "/investments"],
  ]
  for (const n of notifications) insertNotification.run(...n)
}

async function seedDatabasePostgres() {
  // Hash password synchronously using bcrypt
  const passwordHash = bcrypt.hashSync("password123", 10)

  if (!pgPool) return

  const pool = pgPool

  // ── Users ───────────────────────────────────────────────────────────
  const users = [
    ["u1", "Alexandra Chen", "alex@example.com", passwordHash, 1, "user", 48250.75, "2025-06-15", "AC"],
    ["u2", "Marcus Johnson", "marcus@example.com", passwordHash, 1, "user", 125800.0, "2025-03-10", "MJ"],
    ["u3", "Priya Sharma", "priya@example.com", passwordHash, 1, "user", 67340.5, "2025-08-22", "PS"],
    ["u4", "David Kim", "david@example.com", passwordHash, 1, "user", 9120.0, "2025-11-05", "DK"],
    ["u5", "Fatima Al-Rashid", "fatima@example.com", passwordHash, 1, "user", 231500.25, "2025-01-18", "FA"],
    ["a1", "Admin", "admin@vaultinvest.com", passwordHash, 1, "admin", 0, "2024-01-01", "AD"],
  ]
  for (const u of users) {
    await pool.query(
      "INSERT INTO users (id, name, email, passwordHash, verified, role, balance, joinedAt, avatar) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING",
      u
    )
  }

  // ── Transactions ────────────────────────────────────────────────────
  const txs = [
    ["t1", "u1", "deposit", 10000, "approved", "Bank transfer deposit", "2026-02-28"],
    ["t2", "u1", "investment", 5000, "approved", "Growth Portfolio investment", "2026-02-25"],
    ["t3", "u1", "return", 1250.75, "approved", "Monthly return - Growth Portfolio", "2026-02-20"],
    ["t4", "u1", "withdrawal", 3000, "pending", "Withdrawal to bank account", "2026-03-01"],
    ["t5", "u1", "deposit", 25000, "approved", "Wire transfer deposit", "2026-02-15"],
    ["t6", "u1", "investment", 15000, "approved", "Conservative Bond Fund", "2026-02-10"],
    ["t7", "u2", "deposit", 50000, "approved", "Bank transfer deposit", "2026-02-27"],
    ["t8", "u2", "withdrawal", 15000, "pending", "Withdrawal to bank account", "2026-03-02"],
    ["t9", "u3", "investment", 20000, "pending", "High Yield Equity Fund", "2026-03-01"],
    ["t10", "u4", "deposit", 5000, "pending", "Bank transfer deposit", "2026-03-03"],
    ["t11", "u5", "withdrawal", 30000, "pending", "Withdrawal to bank account", "2026-03-02"],
  ]
  for (const t of txs) {
    await pool.query(
      "INSERT INTO transactions (id, userId, type, amount, status, description, date) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING",
      t
    )
  }

  // ── Investment Plans ────────────────────────────────────────────────
  const plans = [
    ["p1", "Conservative Bond Fund", 1000, 100000, 6.5, 12, "months", "Low", "A stable, low-risk fund investing primarily in government and corporate bonds. Ideal for capital preservation with steady returns."],
    ["p2", "Growth Portfolio", 5000, 500000, 12.8, 6, "months", "Medium", "A balanced portfolio combining equities and fixed income for moderate growth. Designed for investors seeking higher returns with manageable risk."],
    ["p3", "High Yield Equity Fund", 10000, 1000000, 22.5, 3, "months", "High", "An aggressive equity fund targeting high-growth sectors. Suitable for experienced investors with higher risk tolerance."],
    ["p4", "Real Estate Trust", 25000, 500000, 9.2, 24, "months", "Medium", "Diversified real estate investment trust providing exposure to commercial and residential properties with quarterly dividends."],
  ]
  for (const p of plans) {
    await pool.query(
      "INSERT INTO investment_plans (id, name, minAmount, maxAmount, returnRate, duration, durationUnit, risk, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING",
      p
    )
  }

  // ── Active Investments ──────────────────────────────────────────────
  const activeInvestments = [
    ["i1", "u1", "p2", "Growth Portfolio", 5000, 640, "2026-02-25", "2026-08-25", "active", 45],
    ["i2", "u1", "p1", "Conservative Bond Fund", 15000, 975, "2026-02-10", "2026-02-10", "active", 80],
    ["i3", "u2", "p3", "High Yield Equity Fund", 75000, 16875, "2026-01-15", "2026-04-15", "active", 65],
    ["i4", "u3", "p4", "Real Estate Trust", 40000, 3680, "2025-12-01", "2027-12-01", "active", 25],
  ]
  for (const i of activeInvestments) {
    await pool.query(
      "INSERT INTO active_investments (id, userId, planId, planName, amount, expectedProfit, startDate, endDate, status, progressPercentage) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (id) DO NOTHING",
      i
    )
  }

  // ── Wallet Addresses ────────────────────────────────────────────────
  const wallets = [
    ["w1", "USDT", "TRC20", "TXqH4JBkVBY9JFGiPqjE3bWz2TcxY7k8Rd", null, null, "2026-01-15"],
    ["w2", "USDT", "TRC20", "TNpGCEmRbR5zLwjvTYASX2qFa6s6doLcv8", "u2", "2026-02-20", "2026-01-15"],
    ["w3", "USDT", "ERC20", "0x4a8C12fE91b7DA6e2C47b2018F9321bE5dA2e8c3", null, null, "2026-01-20"],
    ["w4", "USDT", "BEP20", "0xBb29C7f1e5A8f37D5c21bA7E6d9C51f4dE3a2b81", null, null, "2026-02-01"],
    ["w11", "USDT", "USDT0", "0xD4e3F2a1B0c9D8e7F6a5B4c3D2e1F0a9B8c7D6e5", null, null, "2026-02-10"],
    ["w5", "BTC", "BTC", "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", null, null, "2026-01-18"],
    ["w6", "BTC", "BTC", "bc1q9h0yjdupyfpgk6ewahl7rgcw4nxfmz7m3afcl", "u3", "2026-02-25", "2026-01-18"],
    ["w7", "ETH", "ERC20", "0x1a2B3c4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F9a0B", null, null, "2026-01-22"],
    ["w9", "BNB", "BEP20", "0xF1e2D3c4B5a6F7e8D9c0B1a2F3e4D5c6B7a8F9e0", null, null, "2026-01-25"],
    ["w10", "BNB", "BEP20", "0xA9b8C7d6E5f4A3b2C1d0E9f8A7b6C5d4E3f2A1b0", "u1", "2026-03-01", "2026-02-10"],
    ["w12", "TRX", "TRC20", "TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7", null, null, "2026-02-01"],
    ["w13", "TRX", "TRC20", "TGjYzgCyPobsNS9n6WcbdLVR9dH7mWqFx7", "u4", "2026-02-28", "2026-02-01"],
    ["w14", "SOL", "SOL", "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU", null, null, "2026-02-05"],
    ["w15", "SOL", "SOL", "DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC86PZ8okm21hy", null, null, "2026-02-15"],
  ]
  for (const w of wallets) {
    await pool.query(
      "INSERT INTO wallet_addresses (id, coin, network, address, assignedTo, assignedAt, createdAt) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING",
      w
    )
  }

  // ── Notifications ───────────────────────────────────────────────────
  const notifications = [
    ["n1", "u1", "Investment Completed", "Your Growth Portfolio investment of $5,000 is now active", "success", 0, "2026-03-03T10:30:00Z", "/dashboard"],
    ["n2", "u1", "Profit Credited", "You earned $250.50 from your Growth Portfolio", "success", 0, "2026-03-02T14:15:00Z", "/dashboard"],
    ["n3", "u1", "Deposit Approved", "Your deposit of $10,000 has been approved", "success", 1, "2026-02-28T11:00:00Z", "/dashboard"],
    ["n4", "u1", "Withdrawal Pending", "Your withdrawal request of $3,000 is pending review", "warning", 1, "2026-03-01T09:45:00Z", "/dashboard"],
    ["n5", "u1", "Plan Expiring Soon", "Your Conservative Bond Fund investment will mature in 365 days", "info", 1, "2026-02-20T16:20:00Z", "/investments"],
  ]
  for (const n of notifications) {
    await pool.query(
      "INSERT INTO notifications (id, userId, title, message, type, isRead, timestamp, actionUrl) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING",
      n
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

export async function getInvestmentPlansFromDb() {
  const rows: InvestmentPlan[] = await all("SELECT * FROM investment_plans")
  
  // Log for debugging
  if (rows.length > 0) {
    console.log("Plans from DB:", JSON.stringify(rows.slice(0, 1), null, 2))
  }
  
  // map to include optional fields expected by the UI and ensure correct defaults
  return rows.map((p) => ({
    ...p,
    // Ensure numeric fields have proper values
    minAmount: Number.isFinite(p.minAmount) && p.minAmount > 0 ? p.minAmount : 1000,
    maxAmount: Number.isFinite(p.maxAmount) && p.maxAmount > 0 ? p.maxAmount : 500000,
    returnRate: Number.isFinite(p.returnRate) && p.returnRate > 0 ? p.returnRate : 8,
    duration: Number.isFinite(p.duration) && p.duration > 0 ? p.duration : 6,
    durationUnit: p.durationUnit || "months",
    risk: p.risk || "Medium",
    // Optional fields
    fees: p.fees || { management: 0, performance: 0, withdrawal: 0 },
    category: p.category || "",
  }))
}

export async function getInvestmentPlanById(planId: string) {
  const p: InvestmentPlan | undefined = await get("SELECT * FROM investment_plans WHERE id = ?", [planId])
  if (!p) return undefined
  return {
    ...p,
    fees: p.fees || { management: 0, performance: 0, withdrawal: 0 },
    category: p.category || "",
  }
}

export async function getUserTransactions(userId: string) {
  return all("SELECT * FROM transactions WHERE userId = ?", [userId])
}

export async function getUserNotifications(userId: string) {
  return all("SELECT * FROM notifications WHERE userId = ? ORDER BY timestamp DESC", [userId])
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  await run("UPDATE notifications SET isRead = 1 WHERE id = ?", [notificationId])
}

export async function getRecentActivities(userId: string) {
  const transactions = await all(
    "SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC LIMIT 5",
    [userId]
  )
  
  // Transform transactions to activities format
  return transactions.map((tx: any) => ({
    id: tx.id,
    userId: tx.userId,
    type: tx.type,
    title: getTitleFromType(tx.type),
    message: tx.description,
    timestamp: tx.date,
    icon: getIconFromType(tx.type),
  }))
}

function getTitleFromType(type: string): string {
  const titles: { [key: string]: string } = {
    investment: "Investment Started",
    profit: "Profit Credited",
    deposit: "Deposit Approved",
    withdrawal: "Withdrawal Processed",
    return: "Return Credited",
  }
  return titles[type] || "Transaction"
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
  const availableBalance = userBalance - totalInvested + totalProfit
  
  return {
    totalInvested,
    totalProfit,
    availableBalance: Math.max(0, availableBalance),
    pendingDeposits: pendingDepositsRow?.cnt || 0,
    totalWithdrawn: totalWithdrawnRow?.sum || 0,
    activeInvestments: activeCountRow?.cnt || 0,
  }
}

export async function getUserActiveInvestments(userId: string): Promise<ActiveInvestment[]> {
  return (await all(
    "SELECT * FROM active_investments WHERE userId = ? AND status = 'active'",
    [userId]
  )) as ActiveInvestment[]
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

  const currentBalance = user.balance
  const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"]
  const data: { month: string; value: number }[] = []

  // Generate 6-month portfolio trend based on accumulated investments
  let accumulatedValue = currentBalance * 0.65 // Start at 65% of current balance 6 months ago
  const increments = (currentBalance - accumulatedValue) / (months.length - 1)

  for (const month of months) {
    data.push({
      month,
      value: Math.round(accumulatedValue),
    })
    accumulatedValue += increments
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

export async function deleteUser(userId: string): Promise<void> {
  // Delete all user-related data first
  await run("DELETE FROM notifications WHERE userId = ?", [userId])
  await run("DELETE FROM transactions WHERE userId = ?", [userId])
  await run("DELETE FROM active_investments WHERE userId = ?", [userId])
  await run("DELETE FROM wallet_addresses WHERE userId = ?", [userId])
  // Finally delete the user
  await run("DELETE FROM users WHERE id = ?", [userId])
}

export default getDb

