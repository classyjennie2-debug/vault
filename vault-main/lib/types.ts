// ── Core Types ────────────────────────────────────────────────────────

export type User = {
  id: string
  name: string
  firstName?: string
  lastName?: string
  email: string
  phone?: string
  dateOfBirth?: string
  verified?: boolean
  role: "user" | "admin"
  balance: number
  joinedAt: string
  avatar: string
}

export type Transaction = {
  id: string
  userId: string
  type: "deposit" | "withdrawal" | "investment" | "return"
  amount: number
  status: "pending" | "approved" | "rejected"
  description: string
  date: string
}

export type InvestmentPlan = {
  id: string
  name: string
  minAmount: number
  maxAmount: number
  returnRate: number
  duration: number
  durationUnit: "days" | "months" | "years"
  risk: "Low" | "Medium" | "High"
  description: string
  // Plan type determines the return rate curve
  planType?: string
  // optional fields for plans loaded from mock data or extended schema
  fees?: {
    management: number // Annual percentage
    performance: number // % of profits
    withdrawal: number // Early withdrawal fee %
  }
  category?: string
}

export type ActiveInvestment = {
  id: string
  userId: string
  planId: string
  planName: string
  amount: number
  expectedProfit: number
  startDate: string
  endDate: string
  status: "active" | "completed" | "withdrawn"
  progressPercentage: number
  accumulatedProfit?: number  // Added when fetched with profit calculations
}

export type Notification = {
  id: string
  userId: string
  title: string
  message: string
  type: "success" | "info" | "warning" | "error"
  isRead: boolean
  timestamp: string
  actionUrl?: string
}

export type Activity = {
  id: string
  userId: string
  type: "deposit" | "investment" | "profit" | "withdrawal"
  title: string
  message: string
  timestamp: string
  icon: string
}

// ── Crypto Types ──────────────────────────────────────────────────────

export type CoinType = "USDT" | "BTC" | "ETH" | "BNB" | "TRX" | "SOL"
export type NetworkType = "TRC20" | "ERC20" | "BEP20" | "USDT0" | "BTC" | "SOL"

export type WalletAddress = {
  id: string
  coin: CoinType
  network: NetworkType
  address: string
  assignedTo: string | null
  assignedAt: string | null
  createdAt: string
  status: "active" | "inactive" | "suspended"
}

// ── Static Config (not stored in DB) ─────────────────────────────────

export const coinNetworks: Record<CoinType, NetworkType[]> = {
  USDT: ["TRC20", "ERC20", "BEP20", "USDT0"],
  BTC: ["BTC"],
  ETH: ["ERC20"],
  BNB: ["BEP20"],
  TRX: ["TRC20"],
  SOL: ["SOL"],
}

export const coinDetails: Record<
  CoinType,
  { name: string; color: string; bgColor: string }
> = {
  USDT: { name: "Tether", color: "#26A17B", bgColor: "rgba(38,161,123,0.12)" },
  BTC: { name: "Bitcoin", color: "#F7931A", bgColor: "rgba(247,147,26,0.12)" },
  ETH: { name: "Ethereum", color: "#627EEA", bgColor: "rgba(98,126,234,0.12)" },
  BNB: { name: "BNB", color: "#F3BA2F", bgColor: "rgba(243,186,47,0.12)" },
  TRX: { name: "Tron", color: "#FF0013", bgColor: "rgba(255,0,19,0.12)" },
  SOL: { name: "Solana", color: "#9945FF", bgColor: "rgba(153,69,255,0.12)" },
}

// ── Portfolio Data ────────────────────────────────────────────────────

export const portfolioData = [
  { month: "Sep", value: 32000 },
  { month: "Oct", value: 35400 },
  { month: "Nov", value: 33800 },
  { month: "Dec", value: 38200 },
  { month: "Jan", value: 42100 },
  { month: "Feb", value: 48250 },
]
