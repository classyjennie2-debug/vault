# CRITICAL FIXES - QUICK START GUIDE

## ⚡ DO THIS NOW (Before Any Further Development)

### 1. Remove Exposed Credentials (5 minutes)
```bash
# Remove .env.local from git history
git filter-branch --tree-filter 'rm -f .env.local' HEAD

# Force push (if on private repo)
git push origin --force-with-lease

# Add to .gitignore
echo ".env.local" >> .gitignore
echo ".env.*.local" >> .gitignore

# Remove example secret from .env.example
# Change: JWT_SECRET=8f2b4a9c7e1d5f3a6b8c2d9e4f7a1b3c5d8e2f4a7b9c1d3e5f7a9b2c4d6e
# To:     JWT_SECRET=generate-with-openssl-rand-32
```

**Credentials to Rotate:**
- ✅ Revoke: `VERCEL_OIDC_TOKEN` 
- ✅ Revoke: `CMC_API_KEY=99267b1933d34ba6bb9c8e8d693b4aea`
- ✅ Check: Tawk.to account for unauthorized access

---

### 2. Fix Race Condition in Withdrawals (20 minutes)
**File:** [app/api/withdraw/route.ts](app/api/withdraw/route.ts)

**Current Problem:** User can make 2+ concurrent withdrawals; balance goes negative.

**Current Code (VULNERABLE):**
```typescript
// Line 32: Check balance
if (amount > availableBalance) {
  return NextResponse.json({ error: "Insufficient available balance" }, { status: 400 })
}
// ... HERE: Another request can come in and also pass the check

// Line 36-37: Deduct balance (too late, race condition)
await run(`UPDATE users SET balance = balance - ? WHERE id = ?`, [amount, user.id])
```

**Fixed Code:**
```typescript
// Move balance deduction BEFORE transaction creation
// Use atomic update that fails if balance is insufficient
const result = await run(
  `UPDATE users SET balance = balance - ? WHERE id = ? AND balance >= ?`,
  [amount, user.id, amount]
)

// Check if update succeeded (rows affected)
const affectedRows = await get(
  `SELECT changes() as cnt`  // SQLite: returns rows affected
)

if ((affectedRows as any).cnt === 0) {
  return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
}

// THEN create transaction
const transaction = await createTransaction({...})
```

---

### 3. Fix Race Condition in Investments (15 minutes)
**File:** [app/api/investments/route.ts](app/api/investments/route.ts)

Apply same atomic update pattern:
```typescript
// Instead of: if (userBalance < safeAmount) { error }
// Use atomic: UPDATE users SET balance = balance - ? WHERE id = ? AND balance >= ?

const deductResult = await run(
  `UPDATE users SET balance = balance - ? WHERE id = ? AND balance >= ?`,
  [safeAmount, user.id, safeAmount]
)

// Verify deduction succeeded before inserting investment
const changed = await getChangesCount()
if (changed === 0) {
  // Return error - insufficient balance
}
```

---

### 4. Add Rate Limiting to Auth Endpoints (30 minutes)
**Files to Update:**
- [app/api/auth/login/route.ts](app/api/auth/login/route.ts)
- [app/api/auth/signup/route.ts](app/api/auth/signup/route.ts)
- [app/api/auth/verify/route.ts](app/api/auth/verify/route.ts)

**Code to Add (see rate-limiting.ts as example):**
```typescript
import { checkRateLimit, getClientIp, rateLimitConfigs } from "@/lib/rate-limiting"

export async function POST(req: NextRequest) {
  const clientIp = await getClientIp(req)
  const limitKey = `login_${clientIp}`
  const limitResult = await checkRateLimit(limitKey, rateLimitConfigs.auth)
  
  if (limitResult.limited) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limitResult.retryAfter) } }
    )
  }
  
  // ... rest of login logic
}
```

---

### 5. Fix Password Reset Token System (45 minutes)
**File:** [app/api/auth/reset-password/route.ts](app/api/auth/reset-password/route.ts)

**Step 1: Create migration to add password_reset_tokens table**
```sql
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expiresAt TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_userId ON password_reset_tokens(userId);
```

**Step 2: Update forgot-password endpoint**
```typescript
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  const { email } = await request.json()
  const user = await getUserByEmail(email)
  
  if (user) {
    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()  // 30 min
    
    // Store in database (NOT in reset link)
    await run(
      `INSERT INTO password_reset_tokens (id, userId, token, expiresAt, createdAt) 
       VALUES (?, ?, ?, ?, ?)`,
      [uuidv4(), user.id, token, expiresAt, new Date().toISOString()]
    )
    
    // Send email with token (don't return in response)
    try {
      const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
      await sendResetEmail(email, resetLink)
    } catch (err) {
      console.error('Email send failed:', err)
      return NextResponse.json(
        { error: 'Failed to send reset email' },
        { status: 500 }
      )
    }
  }
  
  // Always return same message (don't reveal user existence)
  return NextResponse.json({
    message: "If an account with this email exists, we've sent a password reset link."
  })
}
```

**Step 3: Update reset-password endpoint**
```typescript
export async function POST(request: NextRequest) {
  const { token, password } = await request.json()
  
  // Validate password strength
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
  }
  
  // Look up token in database
  const resetRecord = await get(
    `SELECT userId FROM password_reset_tokens WHERE token = ? AND used = 0 AND expiresAt > ?`,
    [token, new Date().toISOString()]
  )
  
  if (!resetRecord) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
  }
  
  // Update password and mark token used
  const passwordHash = await bcrypt.hash(password, 10)
  await setUserPassword(resetRecord.userId, passwordHash)
  await run(
    `UPDATE password_reset_tokens SET used = 1 WHERE token = ?`,
    [token]
  )
  
  return NextResponse.json({ message: "Password updated successfully" })
}
```

---

### 6. Add User ID Validation to Data Endpoints (20 minutes)

**Pattern to apply everywhere:**

**BEFORE (VULNERABLE):**
```typescript
// User can request data for any user ID
const userId = req.query.userId  // From URL
const data = await getUserData(userId)  // ← WRONG: No validation
```

**AFTER (FIXED):**
```typescript
// User can only request their own data
const userId = user.id  // From JWT token (authenticated user)
const data = await getUserData(userId)  // ← CORRECT

// For admin operations only:
if (user.role === 'admin') {
  const targetUserId = await request.json().userId  // From request body
  const otherUserData = await getUserData(targetUserId)  // ← OK for admin
}
```

**Files to update:**
- [app/api/deposits/route.ts](app/api/deposits/route.ts) - Use authenticated user ID
- [app/api/withdraw/route.ts](app/api/withdraw/route.ts) - Use authenticated user ID
- [app/api/user/transactions/route.ts](app/api/user/transactions/route.ts) - Filter by user.id
- [app/api/settings/route.ts](app/api/settings/route.ts) - Use user.id only

---

### 7. Implement Session Invalidation on Logout (30 minutes)
**File:** Create [lib/session-store.ts](lib/session-store.ts)

```typescript
// In-memory session blacklist (implement with Redis in production)
const sessionBlacklist = new Set<string>()

export function blacklistToken(token: string) {
  sessionBlacklist.add(token)
  // Clean up after token expiration
  setTimeout(() => {
    sessionBlacklist.delete(token)
  }, 7 * 24 * 60 * 60 * 1000)  // 7 days
}

export function isTokenBlacklisted(token: string): boolean {
  return sessionBlacklist.has(token)
}
```

**Update [lib/auth.ts](lib/auth.ts) to check blacklist:**
```typescript
import { isTokenBlacklisted } from "./session-store"

export function verifyToken(token: string): SessionPayload | null {
  // Check if token is blacklisted
  if (isTokenBlacklisted(token)) {
    return null
  }
  
  try {
    return jwt.verify(token, getJWTSecret()) as SessionPayload
  } catch (_err) {
    return null
  }
}
```

**Update logout endpoint:**
```typescript
import { blacklistToken } from "@/lib/session-store"

export async function POST() {
  const cookieStore = await cookies()
  const token = cookieStore.get("vault_token")?.value
  
  if (token) {
    blacklistToken(token)  // Add to blacklist
  }
  
  cookieStore.delete("vault_token")
  return NextResponse.json({ message: "Logged out successfully" })
}
```

---

### 8. Fix Floating-Point Money Fields (40 minutes)
**File:** [lib/db.ts](lib/db.ts)

**Create migration:**
```sql
-- SQLite/PostgreSQL
-- Step 1: Create new columns with correct type
ALTER TABLE users ADD COLUMN balance_new NUMERIC(19,2);
ALTER TABLE active_investments ADD COLUMN amount_new NUMERIC(19,2);
ALTER TABLE active_investments ADD COLUMN expectedProfit_new NUMERIC(19,2);
ALTER TABLE transactions ADD COLUMN amount_new NUMERIC(19,2);

-- Step 2: Copy data (with conversion if needed)
UPDATE users SET balance_new = CAST(balance AS NUMERIC(19,2));
UPDATE active_investments SET amount_new = CAST(amount AS NUMERIC(19,2));
UPDATE active_investments SET expectedProfit_new = CAST(expectedProfit AS NUMERIC(19,2));
UPDATE transactions SET amount_new = CAST(amount AS NUMERIC(19,2));

-- Step 3: Drop old columns and rename
ALTER TABLE users DROP COLUMN balance;
ALTER TABLE users RENAME COLUMN balance_new TO balance;
-- ... repeat for other tables
```

Or simpler approach - recreate tables:
```sql
CREATE TABLE users_new (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  passwordHash TEXT,
  verified INTEGER NOT NULL DEFAULT 0,
  role TEXT NOT NULL DEFAULT 'user',
  balance NUMERIC(19,2) NOT NULL DEFAULT 0,  -- ← Changed from REAL
  joinedAt TEXT NOT NULL,
  avatar TEXT NOT NULL
);

INSERT INTO users_new SELECT * FROM users;
DROP TABLE users;
ALTER TABLE users_new RENAME TO users;
```

---

## Priority Fix Order

### DAY 1: (Do immediately)
1. Remove credentials from git ✅
2. Rotate exposed API keys ✅
3. Fix race conditions (balance updates) ✅ 
4. Add rate limiting to auth ✅

### DAY 2-3: (Do before any use)
5. Fix password reset token system ✅
6. Add user ID validation ✅
7. Implement session invalidation ✅
8. Fix money field types ✅

### RESULTS: ~3 hours of work removes 8 critical vulnerabilities

---

## Verification Checklist After Fixes

- [ ] Can't withdraw twice (race condition fixed)
- [ ] Can't reset password with fake token
- [ ] Brute force login blocked after 5 attempts
- [ ] Logout invalidates token (can't use it again)
- [ ] Can only access own account data
- [ ] Balance shows correct pennies (not 0.30000000000001)
- [ ] Admin operations logged

