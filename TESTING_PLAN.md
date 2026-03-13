# Vault Capital - Comprehensive Testing Plan

**Test Date:** March 13, 2026  
**Version:** 1.0

---

## TEST ENVIRONMENT SETUP

### Prerequisites
- Chrome/Edge/Firefox browsers for cross-browser testing
- Mobile device or Chrome DevTools mobile emulation
- Test account credentials
- Admin account credentials
- Network throttling (to test slow connections)

### Test Data
- Test user: `test@example.com` / `TestPassword123!`
- Admin user: (configured in mock-data)
- Test investment plans: 5 plans with different risk levels

---

## CRITICAL WORKFLOWS TO TEST

### 1. USER REGISTRATION & AUTHENTICATION ✅

**Test Case 1.1: Complete Registration Flow**
- [ ] Navigate to /register
- [ ] Enter valid URL (matches domain)
- [ ] Enter valid email address
- [ ] Enter strong password
- [ ] Enter matching passwords
- [ ] Click "Get Started" button
- [ ] Receive verification code
- [ ] Enter verification code
- [ ] Redirected to dashboard
- [ ] User balance shown as $5000 (initial balance)

**Test Case 1.2: Invalid Inputs**
- [ ] Test weak password (< 8 chars) → error message
- [ ] Test mismatched passwords → error message
- [ ] Test invalid email format → error message
- [ ] Test duplicate email registration → error message
- [ ] Test missing verification code → error message

**Test Case 1.3: Login**
- [ ] Navigate to /login
- [ ] Enter registered email
- [ ] Enter correct password
- [ ] Click "Log In"
- [ ] Redirected to /dashboard
- [ ] Session persists on page refresh

**Test Case 1.4: Password Reset**
- [ ] Navigate to /forgot-password
- [ ] Enter registered email
- [ ] Receive reset code
- [ ] Enter new password
- [ ] Confirm password reset
- [ ] Login with new password works

**Expected Results:** ✅ All cases should pass
**Status:** Ready for testing

---

### 2. INVESTMENT WORKFLOW (CRITICAL) 🔴

**Test Case 2.1: View Investment Plans**
- [ ] Navigate to /dashboard/investments
- [ ] All 5 plans displayed with correct details
- [ ] Plan cards show: name, min/max amount, return rate, duration, risk level
- [ ] "Popular" badge on Medium risk plan
- [ ] Each plan has "Invest Now" button

**Test Case 2.2: Investment Calculator**
- [ ] Click calculator tab on investment page
- [ ] Select different plan from dropdown
- [ ] Enter investment amount
- [ ] Calculator shows:
  - Investment Amount
  - Return Rate (%)
  - Duration
  - Expected Profit
  - Total Return
- [ ] Calculations are correct
  - Profit = Amount × (Return Rate / 100)
  - Total Return = Amount + Profit

**Test Case 2.3: Insufficient Balance Error**
- [ ] User balance: $5000
- [ ] Click "Invest Now" on $10,000 minimum plan
- [ ] Enter $10,500 (more than balance)
- [ ] Click "Confirm Investment"
- [ ] Error message: "❌ Your account balance is insufficient for this investment. Please deposit more funds first."
- [ ] Investment is NOT created
- [ ] Balance remains $5000

**Test Case 2.4: Sufficient Balance Success**
- [ ] Verify balance is $5000
- [ ] Click "Invest Now" on Conservative plan ($1000 minimum)
- [ ] Enter $1000 amount
- [ ] Summary shows:
  - Investment Amount: $1,000
  - Return Rate: 6.5%
  - Expected Profit: $65
  - Total Return: $1,065
- [ ] Click "Confirm Investment"
- [ ] Success animation plays
- [ ] Message: "Investment Confirmed! Your investment of $1,000 has been started."
- [ ] Redirected to dashboard
- [ ] Balance decreased: $5000 - $1000 = $4000
- [ ] Investment appears in "Active Investments" tab

**Test Case 2.5: Invalid Amount Error**
- [ ] Try to invest $500 (below $1000 minimum)
- [ ] Error shown: "❌ Investment amount must be between $1,000 and $100,000"
- [ ] Try to invest $150,000 (above $100,000 maximum)
- [ ] Error shown: "❌ Investment amount must be between $1,000 and $100,000"

**Test Case 2.6: Plan Selection Error**
- [ ] If plan no longer exists
- [ ] Error should show: "❌ This investment plan is no longer available. Please select another plan."

**Expected Results:** ✅ All cases should pass  
**Critical:** YES - Core business logic
**Status:** Ready for testing

---

### 3. DEPOSIT WORKFLOW

**Test Case 3.1: Initiate Deposit**
- [ ] Navigate to /dashboard/deposit
- [ ] Form displays with amount field
- [ ] Enter deposit amount: $500
- [ ] Click deposit button
- [ ] Status: "Pending Approval"
- [ ] Transaction appears in history as "pending"

**Test Case 3.2: Admin Approves Deposit**
- [ ] Switch to admin panel (/admin)
- [ ] View "Pending Transactions"
- [ ] Find the deposit transaction
- [ ] Click "Approve"
- [ ] Return to user dashboard
- [ ] Balance increased: $4000 + $500 = $4500
- [ ] Transaction status changed to "approved"

**Expected Results:** ✅ All cases should pass
**Status:** Ready for testing

---

### 4. WITHDRAWAL WORKFLOW

**Test Case 4.1: Initiate Withdrawal**
- [ ] Navigate to /dashboard/withdraw
- [ ] Enter withdrawal amount: $1000
- [ ] Enter wallet address
- [ ] Click withdraw button
- [ ] Status: "Pending Approval"

**Test Case 4.2: Insufficient Balance for Withdrawal**
- [ ] Balance: $4500
- [ ] Try to withdraw $5000
- [ ] Error: "Insufficient balance"
- [ ] Withdrawal NOT created

**Test Case 4.3: Admin Approves Withdrawal**
- [ ] Admin approves withdrawal
- [ ] Balance decreased: $4500 - $1000 = $3500
- [ ] Transaction status: "approved"

**Expected Results:** ✅ All cases should pass
**Status:** Ready for testing

---

### 5. ADMIN PANEL

**Test Case 5.1: Admin Dashboard**
- [ ] Navigate to /admin
- [ ] Dashboard shows:
  - Total Users count
  - Total AUM (Assets Under Management)
  - Pending Transactions count
  - Approved Volume
- [ ] All numbers are accurate

**Test Case 5.2: User Management**
- [ ] Navigate to /admin/users
- [ ] Table shows all users with:
  - Name, Email, Balance, Role, Join Date
- [ ] Search/filter functionality works
- [ ] Can update user balance
- [ ] Can delete user (except self)

**Test Case 5.3: Transaction Approval**
- [ ] Navigate to /admin/transactions
- [ ] Pending transactions listed
- [ ] Can approve deposits
- [ ] Can reject withdrawals
- [ ] User receives notification on approval/rejection

**Expected Results:** ✅ All cases should pass
**Status:** Ready for testing

---

### 6. NOTIFICATIONS

**Test Case 6.1: Notification Bell**
- [ ] Click notification bell icon in header
- [ ] Notifications panel opens
- [ ] Shows "Unread" and "Read" tabs
- [ ] Badge shows unread count
- [ ] Click notification to mark as read

**Test Case 6.2: Transaction Notifications**
- [ ] Make a transaction (deposit/investment)
- [ ] Notification generated automatically
- [ ] Notification contains:
  - Type (success/warning/info)
  - Title
  - Message
  - Timestamp

**Expected Results:** ✅ All cases should pass
**Status:** Ready for testing

---

### 7. ERROR HANDLING

**Test Case 7.1: User-Friendly Error Messages**
- [x] Insufficient balance: "❌ Your account balance is insufficient..."
- [x] Invalid amount: "❌ Investment amount must be between..."
- [x] Plan not found: "❌ This investment plan is no longer available..."
- [x] Rate limited: "❌ Too many requests. Please wait..."

**Test Case 7.2: Error Recovery**
- [ ] User sees error message
- [ ] Can correct input and retry
- [ ] No partial/duplicate transactions created on error

**Expected Results:** ✅ All cases should pass
**Status:** Ready for testing

---

### 8. MOBILE RESPONSIVENESS

**Test Case 8.1: Mobile Layout (375px width)**
- [ ] Dashboard layout responsive
- [ ] Menu button accessible
- [ ] Notification bell visible
- [ ] All forms usable on small screen
- [ ] Text readable without zoom

**Test Case 8.2: Touch Interactions**
- [ ] Buttons have adequate touch target (44x44px min)
- [ ] No hover states needed for tap devices
- [ ] Keyboard can be dismissed after input

**Expected Results:** ✅ All cases should pass
**Status:** Ready for testing

---

### 9. LIVE CHAT (TAWK.TO)

**Test Case 9.1: Chat Widget Appears**
- [ ] Logged-in user on dashboard
- [ ] Tawk.to chat widget visible in bottom right
- [ ] Can click to open chat
- [ ] Widget loads without errors

**Test Case 9.2: Chat Hidden on Auth Pages**
- [ ] Navigate to /login
- [ ] Chat widget NOT visible
- [ ] Navigate to /register
- [ ] Chat widget NOT visible
- [ ] Return to /dashboard
- [ ] Chat widget visible again

**Expected Results:** ✅ All cases should pass  
**Status:** Ready for testing

---

### 10. PERFORMANCE & BROWSER COMPATIBILITY

**Test Case 10.1: Page Load Time**
- [ ] Dashboard loads < 3 seconds on 3G
- [ ] Investment page loads < 3 seconds
- [ ] No layout shift (CLS < 0.1)

**Test Case 10.2: Browser Compatibility**
- [ ] Chrome/Edge: ✅ Full support
- [ ] Firefox: ✅ Test required
- [ ] Safari: ✅ Test required
- [ ] Mobile browsers: ✅ Test required

**Test Case 10.3: Network Conditions**
- [ ] Test on 3G throttle
- [ ] Test on slow 4G
- [ ] Loading indicators appear
- [ ] No request timeouts

**Expected Results:** ✅ All cases should pass
**Status:** Ready for testing

---

### 11. SECURITY TESTS

**Test Case 11.1: Session Security**
- [ ] Cannot access /dashboard without login
- [ ] Token stored securely in httpOnly cookie
- [ ] Session persists across page refreshes
- [ ] Logout clears session

**Test Case 11.2: Input Validation**
- [ ] XSS prevention: script tags in forms not executed
- [ ] SQL injection: special characters handled safely
- [ ] CSRF protection: POST requests validated

**Test Case 11.3: Authorization**
- [ ] Non-admin cannot access /admin
- [ ] Can only see own transactions
- [ ] Cannot modify other users' data

**Expected Results:** ✅ All cases should pass
**Status:** Ready for testing

---

## TEST RESULTS SUMMARY

| Test Category | Status | Pass | Fail | Notes |
|---|---|---|---|---|
| Registration & Auth | ⚠️ Ready | - | - | Needs manual testing |
| Investment Workflow | ⚠️ Ready | - | - | **CRITICAL** - needs thorough testing |
| Deposits | ⚠️ Ready | - | - | Needs manual testing |
| Withdrawals | ⚠️ Ready | - | - | Needs manual testing |
| Admin Panel | ⚠️ Ready | - | - | Needs manual testing |
| Notifications | ⚠️ Ready | - | - | Needs manual testing |
| Error Handling | ⚠️ Ready | - | - | Improvements complete |
| Mobile | ⚠️ Ready | - | - | Needs manual testing |
| Tawk.to Chat | ✅ Improved | - | - | Better logic implemented |
| Performance | ⚠️ Ready | - | - | Needs measurement |
| Security | ⚠️ Ready | - | - | Needs penetration testing |

---

## MANUAL TESTING CHECKLIST

### Before Each Test Session
- [ ] Clear browser cache
- [ ] Clear cookies
- [ ] Close other tabs
- [ ] Note any network issues
- [ ] Record test environment (browser, OS, connection)

### After Each Test Session
- [ ] Document all bugs found
- [ ] Rate severity (Critical/High/Medium/Low)
- [ ] Add screenshots/video if applicable
- [ ] Note reproduction steps exactly

### Bug Report Template
```
Bug #: [number]
Title: [short description]
Severity: [Critical/High/Medium/Low]
Reproducible: [Yes/No]
Steps to Reproduce:
1. [step 1]
2. [step 2]
Expected Result: [what should happen]
Actual Result: [what actually happens]
Environment: [browser/OS/connection]
Screenshots: [attach]
```

---

## SIGN-OFF REQUIREMENTS

Before marking tests as complete:
- [ ] All critical test cases passed
- [ ] All high-priority bugs fixed
- [ ] No medium-priority bugs blocking release
- [ ] Performance meets targets
- [ ] Security audit completed
- [ ] Product owner sign-off obtained
- [ ] QA manager sign-off obtained

---

## NOTES FOR TESTING

✅ **Completed Improvements:**
- Investment form now has better error messages
- Tawk.to now only loads on authenticated pages
- Error handling distinguishes between error types
- All validation is in place

⚠️ **Test These Thoroughly:**
- Investment workflow with various amounts
- Insufficient balance error message (user-friendly)
- Tawk.to widget visibility on different pages
- Admin transaction approval flow
- Email verification system

---

*This testing plan should be executed manually and later automated with E2E tests.*
