# 🚀 Vault Referral Program - Complete User & Admin Workflow

## 👥 USER WORKFLOWS

### 1️⃣ Referrer's Journey (User A)

```
┌─────────────────────────────────────────────────────────┐
│ STEP 1: GENERATE REFERRAL CODE                          │
├─────────────────────────────────────────────────────────┤
│ User A navigates to /dashboard/referrals               │
│                                                         │
│ • Click "Get Referral Code"                            │
│ • System generates unique code: ABC12345               │
│ • Referral link shown: https://.../?ref=ABC12345       │
│ • Can copy code or full link                           │
│                                                         │
│ Backend: generateReferralCode() → Save to DB           │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 2: SHARE WITH FRIENDS                              │
├─────────────────────────────────────────────────────────┤
│ User A shares referral link or code with friends       │
│                                                         │
│ • Email: friend_link_with_code                         │
│ • Social: "Join me on Vault: [referral_link]"         │
│ • WhatsApp: Sends referral code                        │
│                                                         │
│ Backend: Clicks tracked on referral_codes table        │
└─────────────────────────────────────────────────────────┘
                            ↓
        (Waiting for friends to sign up...)
                            ↓
├─────────────────────────────────────────────────────────┐
│ STEP 3: FRIEND SIGNS UP (See step 2️⃣)                  │
└─────────────────────────────────────────────────────────┘
                            ↓
├─────────────────────────────────────────────────────────┐
│ STEP 4: FRIEND MAKES DEPOSIT (See step 3️⃣)             │
├─────────────────────────────────────────────────────────┤
│ When referred friend deposits $100+                    │
│ User A automatically gets 10% bonus!                   │
│                                                         │
│ Friend deposits: $500                                  │
│ User A gets bonus: +$50 (10%)                          │
│                                                         │
│ Backend:                                               │
│   • Bonus created as PENDING                           │
│   • Admin approves deposit                             │
│   • Bonus status → CREDITED                            │
│   • Added to User A's referral_balance                │
└─────────────────────────────────────────────────────────┘
                            ↓
│ User A's Dashboard Shows:                              │
│ ┌──────────────────────────────────────────────┐       │
│ │ Active Referrals: 1                          │       │
│ │ Total Earned: $50.00                         │       │
│ │ Referral Balance: $50.00                     │       │
│ │ Can Withdraw: ❌ Need 9 more referrals       │       │
│ └──────────────────────────────────────────────┘       │
                            ↓
   (Repeat steps 2-4 until 10 referrals reached)
                            ↓
├─────────────────────────────────────────────────────────┐
│ STEP 5: UNLOCK WITHDRAWAL (10+ Referrals)              │
├─────────────────────────────────────────────────────────┤
│ After 10 active referrals:                             │
│                                                         │
│ User A's Dashboard Shows:                              │
│ ┌──────────────────────────────────────────────┐       │
│ │ Active Referrals: 10 ✅                      │       │
│ │ Total Earned: $500.00                        │       │
│ │ Referral Balance: $500.00                    │       │
│ │ ✅ Can Withdraw NOW!                         │       │
│ │ [Transfer to Main Balance Button Enabled]    │       │
│ └──────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────┘
                            ↓
├─────────────────────────────────────────────────────────┐
│ STEP 6: TRANSFER TO MAIN BALANCE                        │
├─────────────────────────────────────────────────────────┤
│ User A clicks "Transfer to Main Balance"              │
│                                                         │
│ • Modal opens                                          │
│ • Enter amount: $300 (can use all $500)               │
│ • Click confirm                                        │
│                                                         │
│ Backend:                                               │
│   • Verify: 10+ active referrals ✅                    │
│   • Verify: balance >= $300 ✅                         │
│   • Update referral_balance: $500 → $200              │
│   • Update users.balance: $X → $X+$300                │
│   • Log to referral_withdrawals (audit trail)         │
│                                                         │
│ Frontend shows: Transfer successful! ✅               │
│                                                         │
│ New Balances:                                          │
│ • Referral Balance: $200 (remaining)                  │
│ • Main Balance: +$300 (can now withdraw)              │
└─────────────────────────────────────────────────────────┘
                            ↓
├─────────────────────────────────────────────────────────┐
│ STEP 7: WITHDRAW TO BANK                                │
├─────────────────────────────────────────────────────────┤
│ User A now has $300 in main balance                    │
│                                                         │
│ • Go to Withdraw section                              │
│ • Enter bank details                                   │
│ • Request withdrawal of $300                           │
│ • Admin approves normal withdrawal                     │
│ • Money sent to bank account                           │
│                                                         │
│ Backend: Normal withdrawal process (unchanged)         │
│                                                         │
│ Result: User A received $300 for referring friends!   │
└─────────────────────────────────────────────────────────┘
```

---

### 2️⃣ Referred User's Journey (User B - Friend)

```
┌─────────────────────────────────────────────────────────┐
│ STEP 1: CLICK REFERRAL LINK                             │
├─────────────────────────────────────────────────────────┤
│ Friend clicks: https://vaultcapital.bond/register?ref=ABC12345
│                                                         │
│ • Browser extracts ref code: ABC12345                  │
│ • Navigates to signup page with ref pre-filled        │
│ • Click counter incremented                            │
│                                                         │
│ Backend: incrementReferralCodeClicks()                │
└─────────────────────────────────────────────────────────┘
                            ↓
├─────────────────────────────────────────────────────────┐
│ STEP 2: SIGN UP WITH REFERRAL CODE                      │
├─────────────────────────────────────────────────────────┤
│ Friend fills signup form:                              │
│ • Name, Email, Password, Phone, DOB                   │
│ • Referral code field: ABC12345 (auto-filled)         │
│                                                         │
│ Clicks "Create Account"                                │
│                                                         │
│ Backend: POST /api/auth/signup                        │
│   • Create user account                               │
│   • Initialize referral_balance (0 for this user)     │
│   • trackReferral(User_A.id, User_B.id, code_id)     │
│     └─ Creates entry in referrals table               │
│   • Send verification email                           │
│                                                         │
│ Database Result:                                       │
│   referrals table new row:                            │
│   {                                                    │
│     referrer_id: User_A.id,                           │
│     referred_user_id: User_B.id,                      │
│     status: 'active'                                  │
│   }                                                    │
└─────────────────────────────────────────────────────────┘
                            ↓
│ Friend's Onboarding Complete                          │
│ • Email verified                                       │
│ • Account ready to use                                │
│                                                         │
│ • Regular user experience (unchanged)                 │
│ • Not aware of referral relationship                  │
│ • Can now deposit to earn, invest, etc.              │
                            ↓
├─────────────────────────────────────────────────────────┐
│ STEP 3: FRIEND MAKES DEPOSIT OF $100+                   │
├─────────────────────────────────────────────────────────┤
│ Friend goes to Deposit section                        │
│ • Selects crypto and wallet                            │
│ • Enters amount: $500                                  │
│ • Transaction created with status: PENDING            │
│                                                         │
│ Backend: POST /api/deposits                           │
│   • Create transaction (pending)                      │
│   • No balance update yet (waiting for approval)      │
│                                                         │
│ Admin sees deposit pending in admin panel              │
└─────────────────────────────────────────────────────────┘
```

---

### 3️⃣ Admin Approval Workflow

```
┌─────────────────────────────────────────────────────────┐
│ ADMIN PANEL: TRANSACTION APPROVAL                        │
├─────────────────────────────────────────────────────────┤
│ Admin sees list of pending deposits                    │
│                                                         │
│ • User B: $500 deposit (PENDING)                       │
│ • Click "Approve"                                      │
│                                                         │
│ Backend: POST /api/admin/transactions                 │
│   {                                                    │
│     transactionId: "...",                             │
│     approved: true,                                   │
│   }                                                    │
│                                                         │
│ Processing Steps:                                      │
│   1. Get transaction: User_B, $500, deposit           │
│   2. Verify User_B exists                             │
│   3. Update User_B balance: +$500                      │
│   4. Update transaction status: APPROVED              │
│   5. Send notification to User_B                      │
│                                                         │
│   6. ⭐ NEW: CHECK FOR REFERRAL                        │
│      └─ Query: Is User_B in referrals table?          │
│      └─ Result: Yes! referrer_id = User_A             │
│                                                         │
│   7. ⭐ NEW: CHECK BONUS ELIGIBILITY                   │
│      └─ Amount >= $100? Yes ($500) ✅                 │
│                                                         │
│   8. ⭐ NEW: CALCULATE & CREATE BONUS                  │
│      └─ Bonus = $500 * 10% = $50                      │
│      └─ Insert into referral_bonuses:                 │
│         {                                              │
│           referrer_id: User_A,                        │
│           referral_id: <referral_rec>,               │
│           deposit_transaction_id: <tx_id>,           │
│           bonus_amount: $50,                         │
│           status: 'pending'                          │
│         }                                              │
│                                                         │
│   9. ⭐ NEW: CREDIT BONUS TO BALANCE                   │
│      └─ creditReferralBonus(User_A, $50)             │
│      └─ Update referral_balance:                     │
│           balance += $50                              │
│           total_earned += $50                         │
│      └─ Update referral_bonuses:                     │
│           status → 'credited'                        │
│           credited_at = NOW()                        │
│                                                         │
│   10. ⭐ NEW: NOTIFY REFERRER                          │
│       └─ Send notification to User_A:                 │
│          "Referral Bonus Earned!                     │
│           You earned $50 from User B's deposit!"     │
│                                                         │
│ Admin Panel Shows: ✅ Deposit Approved Successfully  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    COMPLETE SYSTEM FLOW                       │
└──────────────────────────────────────────────────────────────┘

 REFERRER (User A)           REFERRED (User B)        ADMIN
      │                            │                   │
      ├─ Visit /dashboard/referrals
      │
      ├─ Generate code: ABC12345 ──────────────────► referral_codes
      │                                              {code, user_id}
      │
      ├─ Share link: /?ref=ABC12345
      │                    │
      │                    └──► User B clicks
      │                         │
      │                         └─ Navigate /register?ref=ABC12345
      │                                      │
      │                                      └─► Click count++
      │
      │                                      Sign up form auto-fills
      │                                      │
      │                                      └─► Create User B
      │                                           │
      │                                           └─ POST /api/auth/signup
      │                                              {
      │                                                referralCode: ABC12345
      │                                              }
      │                                              │
      │                                              ├─ Create user
      │                                              │
      │                                              ├─ Initialize referral_balance (0)
      │                                              │
      │                                              └─ trackReferral(A, B, code_id)
      │
      ├────────────────────────────────────────────► referrals table
      │                                              {
      │                                                referrer_id: A,
      │                                                referred_user_id: B,
      │                                                status: active
      │                                              }
      │
      │                                      User B now has account
      │                                      │
      │                                      └─► Go to Deposits
      │                                           Deposit $500
      │                                           │
      │                                           └─ POST /api/deposits
      │                                              status: PENDING
      │                                              │
      │                                              └────────────┐
      │                                                           │
      │                                    ┌──────────────────────┘
      │                                    │
      │                                    ▼
      │                          ADMIN DASHBOARD
      │                          │
      │                          ├─ See pending deposit
      │                          │ User B: $500
      │                          │
      │                          └─ Click APPROVE
      │                             │
      │                             ├─ Update User B balance: +$500
      │                             │
      │                             ├─ Check referral: User A? YES ✅
      │                             │
      │                             ├─ Amount >= $100? YES ✅
      │                             │
      │                             ├─ Calculate bonus: 10% = $50
      │                             │
      │                             └─ createReferralBonus(A, $50)
      │                                │
      │                                └────────────────────────┐
      │                                                         │
      ├─ Notification: Earned $50! ◄─────────────────────────┐
      │                                                       │
      ├─ Referral Dashboard Updated:                         │
      │  • Active Referrals: 1                              │
      │  • Total Earned: $50                                │
      │  • Referral Balance: $50 ✅                         │
      │                                                       │
      │                              referral_bonuses table ◄─┘
      │                              {
      │                                referrer_id: A,
      │                                bonus_amount: $50,
      │                                status: credited
      │                              }
      │
      │ (Repeat 9 more referrals with $100+ deposits)
      │
      ├─ After 10 referrals:
      │  • Referral Balance: $500
      │  • Can Withdraw: ✅ YES
      │
      ├─ Click "Transfer to Main Balance"
      │  ├─ Modal: Enter $300
      │  └─ Click TRANSFER
      │     │
      │     ├─ Verify: 10 active referrals? YES ✅
      │     ├─ Verify: balance >= $300? YES ✅
      │     │
      │     ├─ Update referral_balance: $500 → $200
      │     ├─ Update users.balance: +$300
      │     │
      │     └─ Log to referral_withdrawals
      │        {
      │          user_id: A,
      │          amount: $300,
      │          referral_balance_before: $500,
      │          referral_balance_after: $200,
      │          user_balance_before: $100,
      │          user_balance_after: $400,
      │          status: completed
      │        }
      │
      ├─ Dashboard Updated:
      │  • Referral Balance: $200 (remaining)
      │  • Main Balance: +$300 (can now withdraw)
      │
      └─ Go to Withdraw section
         Request withdrawal of $300
         Admin approves normal withdrawal
         Money sent to bank! 💰

```

---

## 🎯 Key Checkpoints

| Checkpoint | When | What Happens | Database |
|-----------|------|-------------|----------|
| **Code Gen** | User requests | Unique code created | `referral_codes` |
| **Signup** | Friend registers with code | Referral relationship created | `referrals` |
| **Deposit** | Referred user deposits | Transaction created | `transactions` |
| **Approval** | Admin approves deposit | Bonus calculated & credited | `referral_bonuses` + `referral_balance` |
| **Milestone** | 10th referral approved | Withdrawal unlock | User can transfer |
| **Transfer** | User clicks transfer button | Referral→Main balance | `referral_withdrawals` |
| **Withdrawal** | User requests withdrawal | Normal process (unchanged) | `transactions` |

---

## ✅ Completion Verification

- ✅ Code Generation System
- ✅ Referral Tracking
- ✅ Bonus Calculation
- ✅ Balance Management
- ✅ Transfer System
- ✅ Withdrawal Eligibility
- ✅ Audit Logging
- ✅ Notifications
- ✅ Frontend Dashboard
- ✅ Admin Integration
- ✅ Error Handling
- ✅ Security Validation

**System is fully operational and production-ready! 🚀**
