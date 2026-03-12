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
}

async function seedDatabasePostgres() {
  // Hash password synchronously using bcrypt
  const passwordHash = bcrypt.hashSync("password123", 10)

  if (!pgPool) return

  const pool = pgPool

  // Only seed investment plans - no mock users or transactions

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

  // Active investments seeded by real user data only

  // Wallet addresses seeded by real user data only

  // Notifications seeded by real user data only
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

  // Get all transactions for the user
  const transactions = await getAll<{
    date: string
    type: string
    amount: number
  }>(
    `SELECT date, type, amount FROM transactions WHERE userId = ? ORDER BY date ASC`,
    [userId]
  )

  // Calculate 6-month portfolio trend based on real transaction history
  const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"]
  const data: { month: string; value: number }[] = []

  // Start with an initial balance (or 0 if no transactions)
  let portfolioValue = 0

  // If no transactions, return flat line at current balance
  if (transactions.length === 0) {
    return months.map(month => ({
      month,
      value: Math.round(user.balance)
    }))
  }

  // Get the earliest transaction date to calculate from there
  const earliestTx = transactions[0]
  const sixMonthsAgo = new Date(earliestTx.date)

  // Group transactions by month for the past 6 months
  for (const month of months) {
    // Calculate cumulative value for transactions up to this month
    let monthValue = 0
    for (const tx of transactions) {
      const txDate = new Date(tx.date)
      if (txDate <= new Date(month)) {
        if (tx.type === "deposit" || tx.type === "return") {
          monthValue += tx.amount
        } else if (tx.type === "withdrawal" || tx.type === "investment") {
          monthValue -= tx.amount
        }
      }
    }

    data.push({
      month,
      value: Math.round(Math.max(0, monthValue)), // Don't show negative values
    })
  }

  // If we have no data points, return monthly progression based on user balance
  if (data.every(d => d.value === 0)) {
    return months.map(month => ({
      month,
      value: Math.round(user.balance)
    }))
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

