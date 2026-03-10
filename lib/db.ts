import Database from "better-sqlite3"
import path from "path"
import bcrypt from "bcrypt"
import type { ActiveInvestment } from "./types"

const DB_PATH = path.join(process.cwd(), "vault.db")

let _db: Database.Database | null = null

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

export function getUserByEmail(email: string): UserRow | undefined {
  const db = getDb()
  return db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email) as UserRow | undefined
}

export function getUserById(id: string): UserRow | undefined {
  const db = getDb()
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as
    | UserRow
    | undefined
}

export function createUser(user: {
  id: string
  name: string
  email: string
  passwordHash?: string
  avatar: string
}): void {
  const db = getDb()
  db.prepare(
    "INSERT INTO users (id, name, email, passwordHash, avatar, joinedAt) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(
    user.id,
    user.name,
    user.email,
    user.passwordHash || null,
    user.avatar,
    new Date().toISOString()
  )
}

export function verifyUserEmail(email: string): void {
  const db = getDb()
  db.prepare("UPDATE users SET verified = 1 WHERE email = ?").run(email)
}

export function setUserBalance(userId: string, balance: number): void {
  const db = getDb()
  db.prepare("UPDATE users SET balance = ? WHERE id = ?").run(balance, userId)
}

export function insertVerificationCode(codeObj: {
  id: string
  email: string
  code: string
  expiresAt: string
}): void {
  const db = getDb()
  db.prepare(
    "INSERT INTO verification_codes (id, email, code, expiresAt) VALUES (?, ?, ?, ?)"
  ).run(codeObj.id, codeObj.email, codeObj.code, codeObj.expiresAt)
}

export function consumeVerificationCode(code: string): boolean {
  const db = getDb()
  const row = db
    .prepare(
      "SELECT * FROM verification_codes WHERE code = ? AND used = 0 AND expiresAt > ?"
    )
    .get(code, new Date().toISOString())
  if (!row) return false
  db.prepare("UPDATE verification_codes SET used = 1 WHERE code = ?").run(code)
  return true
}

export function getInvestmentPlansFromDb() {
  const db = getDb()
  return db.prepare("SELECT * FROM investment_plans").all()
}

export function getUserTransactions(userId: string) {
  const db = getDb()
  return db.prepare("SELECT * FROM transactions WHERE userId = ?").all(userId)
}

export function getRecentActivities(userId: string) {
  const db = getDb()
  return db
    .prepare(
      "SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC LIMIT 5"
    )
    .all(userId)
}
export function getUserStats(userId: string) {
  const db = getDb()
  const totalInvestedRow = db
    .prepare(
      "SELECT SUM(amount) as sum FROM transactions WHERE userId = ? AND type = 'investment' AND status = 'approved'"
    )
    .get(userId)
  const totalProfitRow = db
    .prepare(
      "SELECT SUM(amount) as sum FROM transactions WHERE userId = ? AND type = 'return' AND status = 'approved'"
    )
    .get(userId)
  const pendingDepositsRow = db
    .prepare(
      "SELECT COUNT(*) as cnt FROM transactions WHERE userId = ? AND type = 'deposit' AND status = 'pending'"
    )
    .get(userId)
  const totalWithdrawnRow = db
    .prepare(
      "SELECT SUM(amount) as sum FROM transactions WHERE userId = ? AND type = 'withdrawal' AND status = 'approved'"
    )
    .get(userId)
  const activeCountRow = db
    .prepare(
      "SELECT COUNT(*) as cnt FROM active_investments WHERE userId = ? AND status = 'active'"
    )
    .get(userId)
  return {
    totalInvested: totalInvestedRow?.sum || 0,
    totalProfit: totalProfitRow?.sum || 0,
    pendingDeposits: pendingDepositsRow?.cnt || 0,
    totalWithdrawn: totalWithdrawnRow?.sum || 0,
    activeInvestments: activeCountRow?.cnt || 0,
  }
}

export function getUserActiveInvestments(userId: string): ActiveInvestment[] {
  const db = getDb()
  return db
    .prepare("SELECT * FROM active_investments WHERE userId = ? AND status = 'active'")
    .all(userId) as ActiveInvestment[]
}

export function generatePortfolioData(userId: string) {
  const db = getDb()
  const user = getUserById(userId)
  
  if (!user) return []

  // Get user's investment transactions
  const txs = db
    .prepare(
      "SELECT * FROM transactions WHERE userId = ? ORDER BY date ASC"
    )
    .all(userId) as any[]

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

export default getDb

