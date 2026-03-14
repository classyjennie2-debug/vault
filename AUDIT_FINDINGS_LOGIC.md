# 🚨 CRITICAL LOGIC & CALCULATION AUDIT

## 1. CRITICAL BUG: Balance Calculation Formula Error

### Location
- `lib/db.ts` - `getUserStats()` line 563
- `app/api/user/balance/route.ts` line 28

### The Bug
```typescript
// CURRENT (WRONG):
const availableBalance = userBalance - totalInvested + totalProfit

// Example showing the error:
// User starts with: $10,000
// Invests: $5,000
// Database now has: userBalance = $5,000 (already deducted!)
// totalInvested from transactions table = $5,000
// totalProfit from transactions table = $0

// Current formula calculates:
// availableBalance = 5,000 - 5,000 + 0 = $0  ❌ WRONG!
// Should be: availableBalance = 5,000 (the wallet balance is already available)
```

### Why It's Wrong
1. When investment is created: `UPDATE users SET balance = balance - ? WHERE id = ?`
   - The balance in the database is **already reduced** by the investment amount
2. Then the formula does: `userBalance - totalInvested`
   - This **double-subtracts** the investment amount
3. The available balance should simply be the `userBalance` column value
4. Profit shouldn't be added to available balance—it should be a separate metric

### Correct Formula
```typescript
// CORRECT:
const availableBalance = userBalance;

// IF you want to show the "effective balance" (wallet + invested + profit):
const effectiveBalance = userBalance + totalInvested + totalProfit;
```

### Impact
- Users see incorrect available balance (too low)
- Cannot invest when balance appears insufficient but isn't
- Incorrect display in dashboard stats cards

---

## 2. CRITICAL BUG: Profit Transaction Duplication

### Location
`app/api/admin/calculate-profits/route.ts` - POST handler

### The Bug
```typescript
// WRONG - Creates duplicate entries every time endpoint is called:
await run(
  `INSERT INTO transactions 
   (id, userId, type, amount, status, description, date) 
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
  [
    `profit-${userId}-${Date.now()}`,  // ← Different ID each time!
    userId,
    "return",
    totalProfit,
    "approved",
    "Accumulated profit from active investments",
    new Date().toISOString().split("T")[0],
  ]
)
```

### Why It's Wrong
1. **Creates new transaction** with unique ID each time
2. If endpoint called multiple times, profit is recorded multiple times
3. `getUserStats()` sums ALL transactions: `SELECT SUM(amount) as sum`
4. Calling endpoint 3 times on same day = profit counted 3x
5. Compounds the totalProfit and skews all calculations

### Example of Damage
- User earns $100 profit
- Admin calls `/api/admin/calculate-profits` at 10am → records $100
- Admin calls again at 10:30am → records $100 again
- Admin calls again at 11am → records $100 again
- Database now shows $300 profit when should be $100
- User sees 3x their actual profit!

### Correct Approach
```typescript
// Option 1: Update instead of insert
UPDATE transactions 
SET amount = ? 
WHERE userId = ? AND type = 'return' AND DATE(date) = DATE(?)

// Option 2: Use different table for profit tracking
CREATE TABLE user_profit_snapshots (
  userId TEXT,
  date TEXT,
  accumulatedProfit REAL,
  PRIMARY KEY (userId, date)
)

// Option 3: Recalculate from active_investments table (no storing needed)
// Just calculate on-demand, don't store in transactions
```

---

## 3. MAJOR BUG: Inconsistent Profit Data Sources

### Location
Multiple files:
- `lib/db.ts` - `getUserStats()` queries transactions table
- `lib/db.ts` - `getUserActiveInvestmentsWithProfit()` calculates on-the-fly

### The Problem
Two different systems calculating profit:

**System A (getUserStats - Dashboard)**
```typescript
SELECT SUM(amount) as sum FROM transactions 
WHERE userId = ? AND type = 'return' AND status = 'approved'
```
- Returns total from all "return" transactions
- Could be stale, duplicate, or incorrect

**System B (getUserActiveInvestmentsWithProfit - Detail View)**
```typescript
// Recalculates dynamically based on active_investments
const accumulatedProfit = (expectedProfit * progressPercentage) / 100
```
- Calculated fresh from active investments
- No dependency on transaction records

### The Divergence
```typescript
// User's dashboard might show: $5,000 profit (from transactions table)
// User's investment detail shows: $4,200 profit (calculated fresh)
// These should be the SAME but aren't!
```

### Root Cause
- No single source of truth for profit
- Profit calculated two different ways
- No synchronization between them

---

## 4. LOGIC ERROR: Monthly Gain Calculation

### Location
`lib/monthly-metrics.ts` - `calculateMonthlyMetrics()`

### The Bug
```typescript
// WRONG - Includes profit in monthly gain:
const monthlyGain = monthlyDeposits + monthlyReturns - monthlyWithdrawals

// Example:
// monthlyDeposits: $1,000
// monthlyReturns (profits): $500
// monthlyWithdrawals: $0
// monthlyGain: $1,500  ❌

// But this is misleading! 
// You only deposited $1,000 this month
// Profit shouldn't count as "gain" from your actions
```

### Why It's Wrong
1. "Gain" implies money YOU put in or earned from activity
2. Profit is earned money, not active money movement
3. Mixing them creates confusion between cash flow and earnings
4. Dashboard shows "Monthly Gain: $1,500" but only $1,000 was your money

### Correct Approach
```typescript
// Separate concerns:
const monthlyDeposits = ...; // Money you added
const monthlyReturns = ...;  // Profit earned
const monthlyWithdrawals = ...; // Money you withdrew

// These are THREE separate metrics, not combined:
const netCashFlow = monthlyDeposits - monthlyWithdrawals;  // Your activity
const earnedProfit = monthlyReturns;                       // Earnings

// OR if you must combine:
const monthlyActivity = monthlyDeposits - monthlyWithdrawals; // Net cash flow
```

---

## 5. LOGIC ISSUE: Progress Percentage Never Updated

### Location
`active_investments` table & calculations

### The Problem
```typescript
// When creating investment:
await run(
  `INSERT INTO active_investments (...) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [..., progressPercentage = 0]  // Always stored as 0!
)

// It's NEVER updated:
// No UPDATE statement that changes progressPercentage

// Every query recalculates it on-the-fly instead:
const progressPercentage = Math.min(100, (elapsed / totalDuration) * 100)
```

### Issues This Causes
1. **Inefficiency**: Recalculating same value on every query
2. **Timing Issues**: If calculation logic changes, old data might be interpreted differently
3. **No History**: Can't track how profit progressed over time
4. **Storage Waste**: Column exists but never updated

### Why It Matters
If you want to show "progress line graph", you need historical data:
- Day 1: 10% progress
- Day 2: 15% progress
- Day 3: 20% progress

But with no updates, you can only show current state.

---

## 6. LOGIC ERROR: Portfolio Calculation Double-Counting

### Location
Dashboard showing: "Total Balance" vs computed values

### The Issue
```typescript
// In dashboard-hero.tsx and other places:
const totalBalance = availableBalance + totalInvested + totalProfit

// But with the bug from #1, availableBalance is WRONG
// availableBalance = userBalance - totalInvested + totalProfit (incorrectly calculated)

// So:
// totalBalance = (userBalance - totalInvested + totalProfit) + totalInvested + totalProfit
//              = userBalance + 2*totalProfit  ❌ PROFIT COUNTED TWICE!

// Example:
// userBalance (wallet): $5,000
// totalInvested: $5,000
// totalProfit: $1,000

// availableBalance calculation:
//   = 5,000 - 5,000 + 1,000 = $1,000  ✗ WRONG

// totalBalance:
//   = 1,000 + 5,000 + 1,000 = $7,000  ✗ SHOULD BE $6,000!
//   (The profit is counted twice!)
```

### Correct Calculation
```typescript
// Your actual net worth is:
const netWorth = userBalance + totalProfit;
// Current balance ($5,000) + Earned profits ($1,000) = $6,000
```

---

## 7. LOGIC ISSUE: Withdraw Creates Transaction But Doesn't Update Balance

### Location
`app/api/withdraw/route.ts` (check if exists)

### Potential Problem
Need to verify: When user withdraws, does it:
1. Deduct from `users.balance`?
2. Create a transaction record?
3. Verify the withdrawal is valid?

If it only does (2) without (1), then balance won't update and calculations will be wrong.

---

## 8. LOGIC ISSUE: Multiple Investment Creation Issues

### Location
`app/api/investments/route.ts` - POST handler

### Issues Found
```typescript
// When investment created:
await run(
  `INSERT INTO active_investments (...) VALUES (...)`,
  [investmentId, userId, planId, ..., expectedProfit, ..., 0]  // progressPercentage = 0
)

// Deduct balance:
await run(`UPDATE users SET balance = balance - ? WHERE id = ?`, [safeAmount, user.id])

// Record transaction:
await run(`INSERT INTO transactions (...) VALUES (...)`, 
  [transactionId, userId, 'investment', safeAmount, 'approved', ...]
)
```

### Potential Race Condition
If these three operations aren't in a transaction:
1. Investment inserted
2. User sees it in active_investments
3. Balance update fails → balance is wrong but investment exists
4. Transaction record never created

Need to ensure these are atomic.

---

## Summary of Issues by Severity

### 🔴 CRITICAL
1. **Balance Formula Error** - Incorrect available balance (affects all features)
2. **Profit Duplication** - Profit counted multiple times if compute endpoint called

### 🟠 HIGH  
3. **Inconsistent Profit Sources** - Two different profit values in system
4. **Portfolio Double-Counting** - Total balance calculation includes profit twice

### 🟡 MEDIUM
5. **Progress Never Updated** - Inefficient recalculation
6. **Monthly Gain Misleading** - Profit mixed with cash flow
7. **Multiple Creation Non-Atomic** - Race condition risk in investment creation

---

## Action Items

- [ ] Fix balance formula: Remove double-subtraction of investments
- [ ] Fix profit recording: Use UPDATE or separate table, not repeated INSERTs
- [ ] Consolidate profit calculation: Use single source of truth
- [ ] Separate metrics: Monthly deposits, gains, returns should be distinct
- [ ] Make investment creation atomic: Use transaction/BEGIN-COMMIT
- [ ] Update progress percentage: Store calculated values, don't recalculate
- [ ] Add audit trail: Track where profit is calculated/recorded
- [ ] Test with multiple investments: Verify no race conditions
