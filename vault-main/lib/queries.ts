import getDb from "./db"
import type { User, Transaction, InvestmentPlan, WalletAddress } from "./types"

// ── Users ─────────────────────────────────────────────────────────────

export function getCurrentUser(): User {
  const db = getDb()
  return db.prepare("SELECT * FROM users WHERE id = 'u1'").get() as User
}

export function getAdminUser(): User {
  const db = getDb()
  return db.prepare("SELECT * FROM users WHERE role = 'admin' LIMIT 1").get() as User
}

export function getAllUsers(): User[] {
  const db = getDb()
  return db.prepare("SELECT * FROM users WHERE role = 'user' ORDER BY joinedAt DESC").all() as User[]
}

export function getUserById(id: string): User | undefined {
  const db = getDb()
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as User | undefined
}

export function updateUserBalance(id: string, balance: number): void {
  const db = getDb()
  db.prepare("UPDATE users SET balance = ? WHERE id = ?").run(balance, id)
}

// ── Transactions ──────────────────────────────────────────────────────

export function getAllTransactions(): Transaction[] {
  const db = getDb()
  return db.prepare("SELECT * FROM transactions ORDER BY date DESC").all() as Transaction[]
}

export function getTransactionsByUserId(userId: string): Transaction[] {
  const db = getDb()
  return db.prepare("SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC").all(userId) as Transaction[]
}

export function updateTransactionStatus(id: string, status: "approved" | "rejected"): void {
  const db = getDb()
  db.prepare("UPDATE transactions SET status = ? WHERE id = ?").run(status, id)
}

// ── Investment Plans ──────────────────────────────────────────────────

export function getInvestmentPlans(): InvestmentPlan[] {
  const db = getDb()
  return db.prepare("SELECT * FROM investment_plans").all() as InvestmentPlan[]
}

// ── Wallet Addresses ──────────────────────────────────────────────────

export function getWalletAddresses(): WalletAddress[] {
  const db = getDb()
  return db.prepare("SELECT * FROM wallet_addresses ORDER BY createdAt DESC").all() as WalletAddress[]
}

export function addWalletAddress(wallet: WalletAddress): void {
  const db = getDb()
  db.prepare(
    "INSERT INTO wallet_addresses (id, coin, network, address, assignedTo, assignedAt, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(wallet.id, wallet.coin, wallet.network, wallet.address, wallet.assignedTo, wallet.assignedAt, wallet.createdAt)
}

export function deleteWalletAddress(id: string): void {
  const db = getDb()
  db.prepare("DELETE FROM wallet_addresses WHERE id = ?").run(id)
}

export function assignWallet(id: string, userId: string): WalletAddress | undefined {
  const db = getDb()
  const now = new Date().toISOString().split("T")[0]
  db.prepare("UPDATE wallet_addresses SET assignedTo = ?, assignedAt = ? WHERE id = ?").run(userId, now, id)
  return db.prepare("SELECT * FROM wallet_addresses WHERE id = ?").get(id) as WalletAddress | undefined
}

export function findAvailableWallet(coin: string, network: string): WalletAddress | undefined {
  const db = getDb()
  return db.prepare(
    "SELECT * FROM wallet_addresses WHERE coin = ? AND network = ? AND assignedTo IS NULL LIMIT 1"
  ).get(coin, network) as WalletAddress | undefined
}
