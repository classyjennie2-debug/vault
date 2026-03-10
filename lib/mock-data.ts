import type {
  User,
  Transaction,
  InvestmentPlan,
  ActiveInvestment,
  Notification,
  Activity,
  CoinType,
  NetworkType,
  WalletAddress,
} from "./types"

export const currentUser: User = {
  id: "u1",
  name: "Alexandra Chen",
  email: "alex@example.com",
  role: "user",
  balance: 48250.75,
  joinedAt: "2025-06-15",
  avatar: "AC",
}

export const adminUser: User = {
  id: "a1",
  name: "Admin",
  email: "admin@vaultinvest.com",
  role: "admin",
  balance: 0,
  joinedAt: "2024-01-01",
  avatar: "AD",
}

export const allUsers: User[] = [
  currentUser,
  {
    id: "u2",
    name: "Marcus Johnson",
    email: "marcus@example.com",
    role: "user",
    balance: 125800.0,
    joinedAt: "2025-03-10",
    avatar: "MJ",
  },
  {
    id: "u3",
    name: "Priya Sharma",
    email: "priya@example.com",
    role: "user",
    balance: 67340.5,
    joinedAt: "2025-08-22",
    avatar: "PS",
  },
  {
    id: "u4",
    name: "David Kim",
    email: "david@example.com",
    role: "user",
    balance: 9120.0,
    joinedAt: "2025-11-05",
    avatar: "DK",
  },
  {
    id: "u5",
    name: "Fatima Al-Rashid",
    email: "fatima@example.com",
    role: "user",
    balance: 231500.25,
    joinedAt: "2025-01-18",
    avatar: "FA",
  },
]

export const transactions: Transaction[] = [
  {
    id: "t1",
    userId: "u1",
    type: "deposit",
    amount: 10000,
    status: "approved",
    description: "Bank transfer deposit",
    date: "2026-02-28",
  },
  {
    id: "t2",
    userId: "u1",
    type: "investment",
    amount: 5000,
    status: "approved",
    description: "Growth Portfolio investment",
    date: "2026-02-25",
  },
  {
    id: "t3",
    userId: "u1",
    type: "return",
    amount: 1250.75,
    status: "approved",
    description: "Monthly return - Growth Portfolio",
    date: "2026-02-20",
  },
  {
    id: "t4",
    userId: "u1",
    type: "withdrawal",
    amount: 3000,
    status: "pending",
    description: "Withdrawal to bank account",
    date: "2026-03-01",
  },
  {
    id: "t5",
    userId: "u1",
    type: "deposit",
    amount: 25000,
    status: "approved",
    description: "Wire transfer deposit",
    date: "2026-02-15",
  },
  {
    id: "t6",
    userId: "u1",
    type: "investment",
    amount: 15000,
    status: "approved",
    description: "Conservative Bond Fund",
    date: "2026-02-10",
  },
  {
    id: "t7",
    userId: "u2",
    type: "deposit",
    amount: 50000,
    status: "approved",
    description: "Bank transfer deposit",
    date: "2026-02-27",
  },
  {
    id: "t8",
    userId: "u2",
    type: "withdrawal",
    amount: 15000,
    status: "pending",
    description: "Withdrawal to bank account",
    date: "2026-03-02",
  },
  {
    id: "t9",
    userId: "u3",
    type: "investment",
    amount: 20000,
    status: "pending",
    description: "High Yield Equity Fund",
    date: "2026-03-01",
  },
  {
    id: "t10",
    userId: "u4",
    type: "deposit",
    amount: 5000,
    status: "pending",
    description: "Bank transfer deposit",
    date: "2026-03-03",
  },
  {
    id: "t11",
    userId: "u5",
    type: "withdrawal",
    amount: 30000,
    status: "pending",
    description: "Withdrawal to bank account",
    date: "2026-03-02",
  },
]

export const investmentPlans: InvestmentPlan[] = [
  {
    id: "p1",
    name: "Starter Plan",
    minAmount: 100,
    maxAmount: 50000,
    returnRate: 8,
    duration: 7,
    durationUnit: "days",
    risk: "Low",
    description:
      "Perfect for beginners. A steady, low-risk investment with quick returns. Ideal for testing the platform.",
  },
  {
    id: "p2",
    name: "Growth Portfolio",
    minAmount: 500,
    maxAmount: 500000,
    returnRate: 15,
    duration: 14,
    durationUnit: "days",
    risk: "Medium",
    description:
      "A balanced portfolio combining equities and fixed income for moderate growth. Designed for investors seeking higher returns with manageable risk.",
  },
  {
    id: "p3",
    name: "VIP Plan",
    minAmount: 2000,
    maxAmount: 1000000,
    returnRate: 35,
    duration: 30,
    durationUnit: "days",
    risk: "High",
    description:
      "Premium plan with the highest returns. Suitable for experienced investors with higher risk tolerance and substantial capital.",
  },
  {
    id: "p4",
    name: "Conservative Bond Fund",
    minAmount: 1000,
    maxAmount: 100000,
    returnRate: 6.5,
    duration: 12,
    durationUnit: "months",
    risk: "Low",
    description:
      "A stable, low-risk fund investing primarily in government and corporate bonds. Ideal for capital preservation with steady returns.",
  },
  {
    id: "p5",
    name: "Real Estate Trust",
    minAmount: 25000,
    maxAmount: 500000,
    returnRate: 9.2,
    duration: 24,
    durationUnit: "months",
    risk: "Medium",
    description:
      "Diversified real estate investment trust providing exposure to commercial and residential properties with quarterly dividends.",
  },
]

// ── Crypto Deposit Types ──────────────────────────────────────────────

export type CoinType = "USDT" | "BTC" | "ETH" | "BNB" | "TRX" | "SOL"
export type NetworkType = "TRC20" | "ERC20" | "BEP20" | "USDT0" | "BTC" | "SOL"

export type WalletAddress = {
  id: string
  coin: CoinType
  network: NetworkType
  address: string
  assignedTo: string | null // userId or null if available
  assignedAt: string | null
  createdAt: string
}

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
  BNB: {
    name: "BNB",
    color: "#F3BA2F",
    bgColor: "rgba(243,186,47,0.12)",
  },
  TRX: {
    name: "Tron",
    color: "#FF0013",
    bgColor: "rgba(255,0,19,0.12)",
  },
  SOL: {
    name: "Solana",
    color: "#9945FF",
    bgColor: "rgba(153,69,255,0.12)",
  },
}

// Initial wallet address pool managed by admin
export const initialWalletAddresses: WalletAddress[] = [
  // USDT wallets
  {
    id: "w1",
    coin: "USDT",
    network: "TRC20",
    address: "TXqH4JBkVBY9JFGiPqjE3bWz2TcxY7k8Rd",
    assignedTo: null,
    assignedAt: null,
    createdAt: "2026-01-15",
  },
  {
    id: "w2",
    coin: "USDT",
    network: "TRC20",
    address: "TNpGCEmRbR5zLwjvTYASX2qFa6s6doLcv8",
    assignedTo: "u2",
    assignedAt: "2026-02-20",
    createdAt: "2026-01-15",
  },
  {
    id: "w3",
    coin: "USDT",
    network: "ERC20",
    address: "0x4a8C12fE91b7DA6e2C47b2018F9321bE5dA2e8c3",
    assignedTo: null,
    assignedAt: null,
    createdAt: "2026-01-20",
  },
  {
    id: "w4",
    coin: "USDT",
    network: "BEP20",
    address: "0xBb29C7f1e5A8f37D5c21bA7E6d9C51f4dE3a2b81",
    assignedTo: null,
    assignedAt: null,
    createdAt: "2026-02-01",
  },
  {
    id: "w11",
    coin: "USDT",
    network: "USDT0",
    address: "0xD4e3F2a1B0c9D8e7F6a5B4c3D2e1F0a9B8c7D6e5",
    assignedTo: null,
    assignedAt: null,
    createdAt: "2026-02-10",
  },
  // BTC wallets
  {
    id: "w5",
    coin: "BTC",
    network: "BTC",
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    assignedTo: null,
    assignedAt: null,
    createdAt: "2026-01-18",
  },
  {
    id: "w6",
    coin: "BTC",
    network: "BTC",
    address: "bc1q9h0yjdupyfpgk6ewahl7rgcw4nxfmz7m3afcl",
    assignedTo: "u3",
    assignedAt: "2026-02-25",
    createdAt: "2026-01-18",
  },
  // ETH wallets
  {
    id: "w7",
    coin: "ETH",
    network: "ERC20",
    address: "0x1a2B3c4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F9a0B",
    assignedTo: null,
    assignedAt: null,
    createdAt: "2026-01-22",
  },
  // BNB wallets
  {
    id: "w9",
    coin: "BNB",
    network: "BEP20",
    address: "0xF1e2D3c4B5a6F7e8D9c0B1a2F3e4D5c6B7a8F9e0",
    assignedTo: null,
    assignedAt: null,
    createdAt: "2026-01-25",
  },
  {
    id: "w10",
    coin: "BNB",
    network: "BEP20",
    address: "0xA9b8C7d6E5f4A3b2C1d0E9f8A7b6C5d4E3f2A1b0",
    assignedTo: "u1",
    assignedAt: "2026-03-01",
    createdAt: "2026-02-10",
  },
  // TRX wallets
  {
    id: "w12",
    coin: "TRX",
    network: "TRC20",
    address: "TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7",
    assignedTo: null,
    assignedAt: null,
    createdAt: "2026-02-01",
  },
  {
    id: "w13",
    coin: "TRX",
    network: "TRC20",
    address: "TGjYzgCyPobsNS9n6WcbdLVR9dH7mWqFx7",
    assignedTo: "u4",
    assignedAt: "2026-02-28",
    createdAt: "2026-02-01",
  },
  // SOL wallets
  {
    id: "w14",
    coin: "SOL",
    network: "SOL",
    address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    assignedTo: null,
    assignedAt: null,
    createdAt: "2026-02-05",
  },
  {
    id: "w15",
    coin: "SOL",
    network: "SOL",
    address: "DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC86PZ8okm21hy",
    assignedTo: null,
    assignedAt: null,
    createdAt: "2026-02-15",
  },
]

// ── Portfolio Data ────────────────────────────────────────────────────

export const portfolioData = [
  { month: "Sep", value: 32000 },
  { month: "Oct", value: 35400 },
  { month: "Nov", value: 33800 },
  { month: "Dec", value: 38200 },
  { month: "Jan", value: 42100 },
  { month: "Feb", value: 48250 },
]

// ── Active Investments ────────────────────────────────────────────────

export const activeInvestments: ActiveInvestment[] = [
  {
    id: "ai1",
    userId: "u1",
    planId: "p2",
    planName: "Growth Portfolio",
    amount: 5000,
    expectedProfit: 750,
    startDate: "2026-02-25",
    endDate: "2026-03-10",
    status: "active",
    progressPercentage: 65,
  },
  {
    id: "ai2",
    userId: "u1",
    planId: "p4",
    planName: "Conservative Bond Fund",
    amount: 15000,
    expectedProfit: 975,
    startDate: "2026-02-10",
    endDate: "2027-02-10",
    status: "active",
    progressPercentage: 15,
  },
  {
    id: "ai3",
    userId: "u1",
    planId: "p1",
    planName: "Starter Plan",
    amount: 1000,
    expectedProfit: 80,
    startDate: "2026-03-03",
    endDate: "2026-03-10",
    status: "active",
    progressPercentage: 30,
  },
  {
    id: "ai4",
    userId: "u1",
    planId: "p2",
    planName: "Growth Portfolio",
    amount: 10000,
    expectedProfit: 1500,
    startDate: "2026-01-25",
    endDate: "2026-02-08",
    status: "completed",
    progressPercentage: 100,
  },
]

// ── Notifications ─────────────────────────────────────────────────────

export const notifications: Notification[] = [
  {
    id: "n1",
    userId: "u1",
    title: "Investment Completed",
    message: "Your Growth Portfolio investment of $5,000 is now active",
    type: "success",
    isRead: false,
    timestamp: "2026-03-03T10:30:00Z",
    actionUrl: "/dashboard",
  },
  {
    id: "n2",
    userId: "u1",
    title: "Profit Credited",
    message: "You earned $250.50 from your Growth Portfolio",
    type: "success",
    isRead: false,
    timestamp: "2026-03-02T14:15:00Z",
    actionUrl: "/dashboard",
  },
  {
    id: "n3",
    userId: "u1",
    title: "Deposit Approved",
    message: "Your deposit of $10,000 has been approved",
    type: "success",
    isRead: true,
    timestamp: "2026-02-28T11:00:00Z",
    actionUrl: "/dashboard",
  },
  {
    id: "n4",
    userId: "u1",
    title: "Withdrawal Pending",
    message: "Your withdrawal request of $3,000 is pending review",
    type: "warning",
    isRead: true,
    timestamp: "2026-03-01T09:45:00Z",
    actionUrl: "/dashboard",
  },
  {
    id: "n5",
    userId: "u1",
    title: "Plan Expiring Soon",
    message: "Your Conservative Bond Fund investment will mature in 365 days",
    type: "info",
    isRead: true,
    timestamp: "2026-02-20T16:20:00Z",
    actionUrl: "/investments",
  },
]

// ── Recent Activities ──────────────────────────────────────────────────

export const recentActivities: Activity[] = [
  {
    id: "a1",
    userId: "u1",
    type: "investment",
    title: "Investment Started",
    message: "Growth Portfolio investment of $5,000 started",
    timestamp: "2026-03-03T10:30:00Z",
    icon: "TrendingUp",
  },
  {
    id: "a2",
    userId: "u1",
    type: "profit",
    title: "Profit Credited",
    message: "Earned $250.50 from Growth Portfolio",
    timestamp: "2026-03-02T14:15:00Z",
    icon: "Award",
  },
  {
    id: "a3",
    userId: "u1",
    type: "deposit",
    title: "Deposit Approved",
    message: "Bank transfer of $10,000 approved",
    timestamp: "2026-02-28T11:00:00Z",
    icon: "ArrowDown",
  },
  {
    id: "a4",
    userId: "u1",
    type: "withdrawal",
    title: "Withdrawal Processed",
    message: "Withdrawal of $3,000 processed",
    timestamp: "2026-02-25T15:45:00Z",
    icon: "ArrowUp",
  },
]
