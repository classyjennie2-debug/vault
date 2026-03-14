# 🔧 DETAILED FIX GUIDE FOR LOGIC ERRORS

## Priority 1: Fix Balance Formula (CRITICAL)

### File 1: `lib/db.ts` - getUserStats()

**Current (Line 563):**
```typescript
const availableBalance = userBalance - totalInvested + totalProfit
```

**Problem:** Double-subtracts investments because `userBalance` is already reduced.

**Fix:**
```typescript
// The userBalance stored in DB is ALREADY the available balance
// (It was deducted when investment was made)
// So just return it as-is
const availableBalance = Math.max(0, userBalance)

// But we should ALSO calculate the total portfolio value separately:
// totalPortfolioValue = walletBalance + investedAmount + profit
// That's different from availableBalance
```

**Code:**
```typescript
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
  const pendingDeposits = pendingDepositsRow?.cnt || 0
  const totalWithdrawn = totalWithdrownRow?.sum || 0
  const activeInvestments = activeCountRow?.cnt || 0
  
  // FIX: availableBalance is just the wallet balance
  // (The DB balance is already after deducting investments)
  const availableBalance = Math.max(0, userBalance)
  
  // BONUS: Calculate total portfolio value for display
  // totalPortfolioValue = what user owns = wallet + invested + profit earned
  const totalPortfolioValue = availableBalance + totalInvested + totalProfit
  
  return {
    totalInvested,
    totalProfit,
    availableBalance,        // What user can withdraw/use
    totalPortfolioValue,    // What user owes (total assets)
    pendingDeposits,
    totalWithdrawn,
    activeInvestments,
  }
}
```

---

### File 2: `app/api/user/balance/route.ts` - GET handler

**Current (Line 28):**
```typescript
const availableBalance = Math.max(0, userData.balance - totalInvested + totalProfit)
```

**Fix:**
```typescript
const availableBalance = Math.max(0, userData.balance)

// The calculation explanation:
// userData.balance is already the wallet balance after investments are deducted
// When investment created: UPDATE users SET balance = balance - $5000
// So userData.balance is ALREADY $5000 less
// We should NOT subtract it again!
```

**Full Fixed Code:**
```typescript
import { NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { getUserById, get } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    const userData = await getUserById(user.id)
    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Calculate total invested and total profit for reference
    const investedResult = await get(
      "SELECT SUM(amount) as sum FROM transactions WHERE userId = ? AND type = 'investment' AND status = 'approved'",
      [user.id]
    )
    const profitResult = await get(
      "SELECT SUM(amount) as sum FROM transactions WHERE userId = ? AND type = 'return' AND status = 'approved'",
      [user.id]
    )

    const totalInvested = Number(investedResult?.sum ?? 0)
    const totalProfit = Number(profitResult?.sum ?? 0)
    
    // FIX: The wallet balance is already after investments are deducted
    const availableBalance = Math.max(0, userData.balance)
    
    // Total portfolio value = wallet + total invested + profits
    const totalPortfolioValue = availableBalance + totalInvested + totalProfit

    return NextResponse.json({
      balance: userData.balance,                    // Current wallet
      totalInvested,                               // Amount deployed
      totalProfit,                                 // Earned so far
      availableBalance,                            // Can use/withdraw (THIS WAS WRONG)
      totalPortfolioValue,                         // Total net worth
    })
  } catch (error) {
    console.error("Balance fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
```

---

## Priority 2: Fix Profit Duplication (CRITICAL)

### File: `app/api/admin/calculate-profits/route.ts` - POST handler

**Current (Line ~67) - WRONG:**
```typescript
// Creates new transaction EVERY time this endpoint is called
await run(
  `INSERT INTO transactions 
   (id, userId, type, amount, status, description, date) 
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
  [
    `profit-${userId}-${Date.now()}`,  // ← New ID each time!
    userId,
    "return",
    totalProfit,
    "approved",
    "Accumulated profit from active investments",
    new Date().toISOString().split("T")[0],
  ]
)
```

**Problem:** Calling endpoint multiple times = profit recorded multiple times

**Fix Options:**

**Option 1: Use UPSERT (recommended for simplicity)**
```typescript
import { NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { all, run, get } from "@/lib/db"
import type { ActiveInvestment } from "@/lib/types"

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const investments = await all<ActiveInvestment>(
      `SELECT id, userId, planId, planName, amount, expectedProfit, startDate, endDate, status
       FROM active_investments 
       WHERE status = 'active'
       ORDER BY userId`
    )

    let profitsUpdated = 0
    const userProfits: Record<string, number> = {}

    // Calculate accumulated profit for each investment
    for (const inv of investments) {
      const now = new Date().getTime()
      const startTime = new Date(inv.startDate).getTime()
      const endTime = new Date(inv.endDate).getTime()

      const totalDuration = endTime - startTime
      const elapsed = now - startTime

      let progressPercentage = 0
      if (elapsed > 0 && totalDuration > 0) {
        progressPercentage = Math.min(100, (elapsed / totalDuration) * 100)
      }

      const expectedProfit = Number(inv.expectedProfit) || 0
      const accumulatedProfit = Math.max(0, (expectedProfit * progressPercentage) / 100)

      if (!userProfits[inv.userId]) {
        userProfits[inv.userId] = 0
      }
      userProfits[inv.userId] += Math.round(accumulatedProfit * 100) / 100
    }

    // FIX: Delete old profit records and create new ones with single entry per day
    const today = new Date().toISOString().split("T")[0]
    
    for (const [userId, totalProfit] of Object.entries(userProfits)) {
      try {
        // Delete today's profit record if exists (idempotent)
        await run(
          `DELETE FROM transactions 
           WHERE userId = ? AND type = 'return' AND status = 'approved' AND DATE(date) = DATE(?)`,
          [userId, today]
        )

        // Insert single profit record for today
        await run(
          `INSERT INTO transactions 
           (id, userId, type, amount, status, description, date) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            `profit-${userId}-${today}`,  // ← Same ID if called multiple times same day
            userId,
            "return",
            totalProfit,
            "approved",
            "Accumulated profit from active investments",
            new Date().toISOString()
          ]
        )
        profitsUpdated++
      } catch (error) {
        console.error(`Error updating profit for user ${userId}:`, error)
      }
    }

    return NextResponse.json({
      message: "Profits calculated and updated successfully",
      usersUpdated: profitsUpdated,
      totalUsers: Object.keys(userProfits).length,
    })
  } catch (error) {
    console.error("Error calculating profits:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
```

**Option 2: Better - Store profit separately (create table for profit snapshots)**
```typescript
// Create new table for daily profit snapshots:
CREATE TABLE IF NOT EXISTS user_profit_snapshots (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  date TEXT NOT NULL,
  accumulatedProfit REAL NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id),
  UNIQUE (userId, date)
);

// Then in the endpoint:
for (const [userId, totalProfit] of Object.entries(userProfits)) {
  await run(
    `INSERT OR REPLACE INTO user_profit_snapshots 
     (id, userId, date, accumulatedProfit, createdAt) 
     VALUES (?, ?, ?, ?, ?)`,
    [
      `profit-snapshot-${userId}-${today}`,
      userId,
      today,
      totalProfit,
      new Date().toISOString()
    ]
  )
}
```

---

## Priority 3: Consolidate Profit Calculation

### Problem
Two systems calculate profit differently:
- `getUserStats` queries transactions table  
- `getUserActiveInvestmentsWithProfit` calculates on-the-fly

### Solution: Use single method

**Fix in `lib/db.ts` - Modify getUserStats:**
```typescript
export async function getUserStats(userId: string) {
  // Get actual invested and withdrawn amounts
  const totalInvestedRow: { sum: number } | undefined = await get(
    "SELECT SUM(amount) as sum FROM transactions WHERE userId = ? AND type = 'investment' AND status = 'approved'",
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

  // Get active investments and calculate their accumulated profit dynamically
  const investments = await getUserActiveInvestments(userId)
  let totalProfit = 0
  
  for (const inv of investments) {
    const now = new Date().getTime()
    const startTime = new Date(inv.startDate).getTime()
    const endTime = new Date(inv.endDate).getTime()

    const totalDuration = endTime - startTime
    const elapsed = now - startTime

    let progressPercentage = 0
    if (elapsed > 0 && totalDuration > 0) {
      progressPercentage = Math.min(100, (elapsed / totalDuration) * 100)
    }

    const expectedProfit = Number(inv.expectedProfit) || 0
    const accumulatedProfit = (expectedProfit * progressPercentage) / 100
    totalProfit += Math.round(accumulatedProfit * 100) / 100
  }

  const totalInvested = totalInvestedRow?.sum || 0
  const pendingDeposits = 0// TODO: Count pending deposits if needed
  const totalWithdrawn = totalWithdrawnRow?.sum || 0
  const userBalance = userRow?.balance || 0
  const availableBalance = Math.max(0, userBalance)

  return {
    totalInvested,
    totalProfit,              // Now calculated from active_investments directly
    availableBalance,
    pendingDeposits,
    totalWithdrawn,
    activeInvestments: activeCountRow?.cnt || 0,
  }
}
```

---

## Priority 4: Fix Monthly Gain Calculation

### File: `lib/monthly-metrics.ts`

**Current (Line ~47):**
```typescript
// WRONG - Mixes profit with actual deposits:
const monthlyGain = monthlyDeposits + monthlyReturns - monthlyWithdrawals
```

**Fix:**
```typescript
export function calculateMonthlyMetrics(userId: string): MonthlyMetrics {
  // ... existing code to sum transactions ...

  // Separate metrics - don't mix profit with cash flow
  const monthlyDeposits = ...; // Money added
  const monthlyWithdrawals = ...; // Money removed
  const monthlyReturns = ...; // Profits earned
  const monthlyInvestments = ...; // Money deployed

  // Monthly net cash flow (deposits - withdrawals)
  const monthlyCashFlow = monthlyDeposits - monthlyWithdrawals

  // Total "gain" includes both cash flow and earned returns
  // But these should be tracked separately!
  const monthlyTotalActivity = monthlyCashFlow + monthlyReturns

  return {
    monthlyCashFlow: Math.round(monthlyCashFlow * 100) / 100,    // NEW: Cash in/out
    monthlyDeposits: Math.round(monthlyDeposits * 100) / 100,
    monthlyReturns: Math.round(monthlyReturns * 100) / 100,
    monthlyInvestments: Math.round(monthlyInvestments * 100) / 100,
    monthlyWithdrawals: Math.round(monthlyWithdrawals * 100) / 100,
    monthlytotalActivity: Math.round(monthlyTotalActivity * 100) / 100,  // NEW
    transactionCount: transactions.length,
  }
}
```

---

## Priority 5: Make Investment Creation Atomic

### File: `app/api/investments/route.ts` - POST handler

**Problem:** Three separate operations can fail independently

**Current (Lines ~150-185):**
```typescript
try {
  await run(
    `INSERT INTO active_investments (...)VALUES (...)`,
    [investmentId, ...]
  )

  await run(`UPDATE users SET balance = balance - ? WHERE id = ?`, [safeAmount, user.id])

  const transactionId = uuidv4()
  await run(
    `INSERT INTO transactions (...) VALUES (...)`,
    [transactionId, user.id, 'investment', ...]
  )
} catch (error: any) {
  // If error, active_investments might exist but balance not deducted
}
```

**Fix - Use transactions:**
```typescript
import { DATABASE_URL, getDb } from "@/lib/db"

export async function POST(req: NextRequest) {
  // ... validation code ...

  try {
    if (DATABASE_URL) {
      // PostgreSQL - use transactions
      const client = await pgPool.connect()
      try {
        await client.query('BEGIN')

        // All three operations in one transaction
        await client.query(
          `INSERT INTO active_investments 
           (id, userId, planId, planName, amount, expectedProfit, startDate, endDate, status, progressPercentage) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [investmentId, user.id, plan.id, plan.name, safeAmount, expectedProfit, startDate, endDate, "active", 0]
        )

        await client.query(
          `UPDATE users SET balance = balance - $1 WHERE id = $2`,
          [safeAmount, user.id]
        )

        await client.query(
          `INSERT INTO transactions (id, userId, type, amount, status, description, date) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [transactionId, user.id, 'investment', safeAmount, 'approved', description, new Date().toISOString()]
        )

        await client.query('COMMIT')

        return NextResponse.json({ success: true, investmentId })
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      } finally {
        client.release()
      }
    } else {
      // SQLite - use transaction
      const db = getDb()
      try {
        db.exec('BEGIN TRANSACTION')

        db.prepare(
          `INSERT INTO active_investments (...) VALUES (...)`
        ).run(investmentId, user.id, ...)

        db.prepare(
          `UPDATE users SET balance = balance - ? WHERE id = ?`
        ).run(safeAmount, user.id)

        db.prepare(
          `INSERT INTO transactions (...) VALUES (...)`
        ).run(transactionId, user.id, ...)

        db.exec('COMMIT')

        return NextResponse.json({ success: true, investmentId })
      } catch (error) {
        db.exec('ROLLBACK')
        throw error
      }
    }
  } catch (err: unknown) {
    investmentLogger.error("Investment API error", err as Error, {})
    const appError = mapErrorToResponse(err)
    return createErrorResponse(appError)
  }
}
```

---

## Summary: Changes Needed

| File | Line | Issue | Fix |
|------|------|-------|-----|
| `lib/db.ts` | 563 | availableBalance formula wrong | Remove double-subtract |
| `app/api/user/balance/route.ts` | 28 | availableBalance formula wrong | Use userBalance directly |
| `app/api/withdraw/route.ts` | 33 | Same formula wrong | Fix formula |
| `app/api/admin/calculate-profits/route.ts` | 67 | Duplicate profit entries | Use DELETE + INSERT or UPSERT |
| `lib/monthly-metrics.ts` | 47 | Gain includes profit | Separate metrics |
| `app/api/investments/route.ts` | ~150 | Not atomic | Use BEGIN/COMMIT |

---

## Testing Checklist

- [ ] Create user, deposit $10,000
- [ ] Check available balance = $10,000
- [ ] Invest $5,000
- [ ] Check available balance = $5,000 (NOT $0 or $1,000)
- [ ] Wait a day, profit should show
- [ ] Withdraw $2,000
- [ ] Check balance = $3,000 (not $1,000)
- [ ] Call calculate-profits twice
- [ ] Verify profit didn't double
- [ ] Check monthly gain is accurate
