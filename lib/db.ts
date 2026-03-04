import Database from "better-sqlite3"
import path from "path"

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
      duration TEXT NOT NULL,
      risk TEXT NOT NULL,
      description TEXT NOT NULL
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
  `)

  // Seed data on first run
  const seeded = _db.prepare("SELECT value FROM _meta WHERE key = 'seeded'").get() as { value: string } | undefined
  if (!seeded) {
    seedDatabase(_db)
    _db.prepare("INSERT INTO _meta (key, value) VALUES ('seeded', 'true')").run()
  }

  return _db
}

function seedDatabase(db: Database.Database) {
  // ── Users ───────────────────────────────────────────────────────────
  const insertUser = db.prepare(
    "INSERT INTO users (id, name, email, role, balance, joinedAt, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)"
  )

  const users = [
    ["u1", "Alexandra Chen", "alex@example.com", "user", 48250.75, "2025-06-15", "AC"],
    ["u2", "Marcus Johnson", "marcus@example.com", "user", 125800.0, "2025-03-10", "MJ"],
    ["u3", "Priya Sharma", "priya@example.com", "user", 67340.5, "2025-08-22", "PS"],
    ["u4", "David Kim", "david@example.com", "user", 9120.0, "2025-11-05", "DK"],
    ["u5", "Fatima Al-Rashid", "fatima@example.com", "user", 231500.25, "2025-01-18", "FA"],
    ["a1", "Admin", "admin@vaultinvest.com", "admin", 0, "2024-01-01", "AD"],
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
    "INSERT INTO investment_plans (id, name, minAmount, maxAmount, returnRate, duration, risk, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  )

  const plans = [
    ["p1", "Conservative Bond Fund", 1000, 100000, 6.5, "12 months", "Low", "A stable, low-risk fund investing primarily in government and corporate bonds. Ideal for capital preservation with steady returns."],
    ["p2", "Growth Portfolio", 5000, 500000, 12.8, "6 months", "Medium", "A balanced portfolio combining equities and fixed income for moderate growth. Designed for investors seeking higher returns with manageable risk."],
    ["p3", "High Yield Equity Fund", 10000, 1000000, 22.5, "3 months", "High", "An aggressive equity fund targeting high-growth sectors. Suitable for experienced investors with higher risk tolerance."],
    ["p4", "Real Estate Trust", 25000, 500000, 9.2, "24 months", "Medium", "Diversified real estate investment trust providing exposure to commercial and residential properties with quarterly dividends."],
  ]
  for (const p of plans) insertPlan.run(...p)

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

export default getDb
