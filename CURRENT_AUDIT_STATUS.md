# Vault Code Audit - March 16, 2026

## Summary
Comprehensive security and functionality audit completed. Found **6 CRITICAL issues** that require immediate fixing before production use.

---

## 🔴 CRITICAL ISSUES (MUST FIX)

### 1. **Forgot Password Endpoint Returns Reset Link** 
- **File:** [app/api/auth/forgot-password/route.ts](app/api/auth/forgot-password/route.ts#L37)
- **Severity:** CRITICAL
- **Status:** ❌ NOT FIXED
- **Issue:** Line 37 returns `resetLink` in API response - should only send via email
- **Fix Time:** 5 minutes

### 2. **Password Reset Token Not Persisted to Database**
- **File:** [app/api/auth/reset-password/route.ts](app/api/auth/reset-password/route.ts)
- **Severity:** CRITICAL  
- **Status:** ❌ NOT FIXED
- **Issue:** Tokens are client-side generated, string-parsed, and never validated against database
- **Vulnerabilities:**
  - Tokens can be forged
  - No expiration enforcement
  - No single-use enforcement
  - Missing await on getUserById (line 32)
- **Fix Time:** 45 minutes

### 3. **Race Condition in Withdrawal Balance Deduction**
- **File:** [app/api/withdraw/route.ts](app/api/withdraw/route.ts#L31-42)
- **Severity:** CRITICAL
- **Status:** ❌ NOT FIXED (uses check-then-act pattern)
- **Issue:** Balance checked at line 32, deducted at line 42
  - User can submit 2+ concurrent withdrawals
  - Both pass balance check before either is deducted
  - Balance goes negative
- **Attack:** User with $100 can withdraw $100 twice → balance becomes -$100
- **Fix Time:** 20 minutes

### 4. **Exposed Credentials in Repository**
- **File:** `.env.vercel`, `.env.example`
- **Severity:** CRITICAL
- **Status:** ❌ NOT FIXED
- **Exposed Secrets:**
  - CMC_API_KEY: 99267b1933d34ba6bb9c8e8d693b4aea
  - Database password: npg_pycvN3iWO2bs
  - All PostgreSQL connection strings
  - JWT_SECRET: 8f2b4a9c7e1d5f3a6b8c2d9e4f7a1b3c5d8e2f4a7b9c1d3e5f7a9b2c4d6e
  - VERCEL_OIDC_TOKEN (full token in .env.vercel)
- **Fix Time:** 10 minutes

### 5. **Session Not Invalidated on Logout**
- **File:** [app/api/auth/logout/route.ts](app/api/auth/logout/route.ts)
- **Severity:** CRITICAL
- **Status:** ❌ NOT FIXED (only deletes client cookie)
- **Issue:** Only deletes cookie client-side, server doesn't track logout
  - Stolen tokens can still be used after logout
  - No logout event in audit logs
- **Fix Time:** 30 minutes

### 6. **Admin Transactions - Withdrawal Approval Doesn't Validate Balance**
- **File:** [app/api/admin/transactions/route.ts](app/api/admin/transactions/route.ts)
- **Severity:** CRITICAL
- **Status:** ❓ PARTIALLY CHECKED
- **Issue:** Admin approval doesn't validate if user has sufficient balance for withdrawal
- **Fix Time:** 15 minutes

---

## ✅ FIXED / VERIFIED WORKING

| Issue | Status | Evidence |
|-------|--------|----------|
| Rate limiting on login/signup | ✅ FIXED | Applied in routes using `rateLimitedResponse()` |
| Investment creation atomicity | ✅ FIXED | Wrapped in BEGIN/COMMIT transaction |
| Balance formula (double-subtraction) | ✅ FIXED | Corrected in getUserStats, balance endpoints, withdraw |
| Deposit approval balance updates | ✅ FIXED | Updated placement and error handling in admin/transactions |
| Profit duplication | ✅ FIXED | Using DELETE + INSERT pattern |
| Concurrent deposit updates | ✅ FIXED | Wrapped in transaction |

---

## 🟠 HIGH PRIORITY (Phase 2)

| Issue | Fix Time |
|-------|----------|
| Weak JWT secret fallback | 10 min |
| Missing session timeout | 30 min |
| Email verification not enforced | 10 min |
| Verification codes not rate limited | 15 min |
| No audit logging for admin actions | 20 min |
| Floating-point precision for money | 40 min |

---

## Action Plan

### Immediate Actions (Next 2 Hours)
1. ✓ Fix forgot-password endpoint (5 min)
2. ✓ Implement password reset token database system (45 min)
3. ✓ Fix withdrawal race condition (20 min)
4. ✓ Remove exposed credentials (10 min)
5. ✓ Add session invalidation on logout (30 min)
6. ✓ Verify admin withdrawal approval (15 min)

### Total Estimated Time: 2.5 hours

---

## Testing Checklist

- [ ] Password reset token system working (generate, store, validate, expire)
- [ ] Forgot password endpoint does NOT return reset link
- [ ] Concurrent withdrawal attempts denied after first
- [ ] Balance never goes negative
- [ ] Logout invalidates session server-side
- [ ] Admin cannot approve withdrawals without sufficient balance
- [ ] No exposed credentials in any env files
- [ ] Build succeeds with no errors
- [ ] All tests pass

