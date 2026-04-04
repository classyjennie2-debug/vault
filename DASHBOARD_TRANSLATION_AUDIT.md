# Dashboard Translation Audit Report

## Summary
Comprehensive audit of all dashboard pages and components (/app/dashboard/ and /components/dashboard/) for translation usage and hardcoded text.

---

## APP/DASHBOARD PAGES

### 1. **app/dashboard/page.tsx** (Main Dashboard Page)
**Status:** ⚠️ MISSING TRANSLATIONS

**useI18n Hook Used:** ❌ NO
- This is a server component that doesn't use i18n

**Hardcoded Text Found:**
- None (renders sub-components that handle translations)

**Recommended Namespace:** N/A

---

### 2. **app/dashboard/deposit/page.tsx** (Deposit Page)
**Status:** ✅ USING TRANSLATIONS

**useI18n Hook Used:** ✅ YES
- `useI18n('deposit')` imported and used

**Translation Keys Being Used:**
- `t('deposit')` - Page context

**Hardcoded Text Found:**
- "USDT", "BTC", "ETH", "BNB", "TRX", "SOL" - Cryptocurrency coin names (may not need translation)
- "BEP20 (BSC)", "BTC Network", "SOL Network" - Network labels (partially hardcoded in networkLabels object)

**Missing Translations:**
- Coin symbols and network names should be parameterized if supporting locale-specific names
- Form labels and validation messages only use translation keys

**Recommended Namespace:** `deposit`

---

### 3. **app/dashboard/investments/page.tsx** (Investments Page)
**Status:** ⚠️ MINIMAL TRANSLATIONS

**useI18n Hook Used:** ❌ NO
- Server side component, doesn't use i18n directly

**Hardcoded Text Found:**
- "Error Loading Investments" (hardcoded error title)
- "Failed to load investments" (hardcoded error message)
- "Technical Details" (hardcoded label)

**Recommended Namespace:** `dashboard`

---

### 4. **app/dashboard/portfolio/page.tsx** (Portfolio Dashboard Page)
**Status:** ⚠️ MISSING TRANSLATIONS

**useI18n Hook Used:** ❌ NO

**Hardcoded Text Found:**
- "Portfolio Dashboard" (page title)
- "View your complete investment portfolio and performance metrics" (subtitle)
- "Portfolio data is updated daily. Last update:" (info message)
- Tab labels: "Overview", "Analysis", "History"
- "Performance Analysis" (section title)
- "Best Performing Asset", "High Yield Plan", "+22.5% YTD" (analysis data)
- "Volatility", "Low", "Diversified portfolio" (metrics)
- "Portfolio History" (section title)
- "Balance:", "+$" (history labels)
- "Failed to fetch portfolio data" (error message)

**Recommended Namespace:** `dashboard`

---

### 5. **app/dashboard/transactions/page.tsx** (Transactions Page)
**Status:** ✅ USING TRANSLATIONS

**useI18n Hook Used:** ✅ YES
- `useI18n('transactions')` imported and used

**Translation Keys Being Used:**
- `t('deposit')`, `t('withdrawal')`, `t('investment')`, `t('return')` - Transaction type labels
- `t('allFieldsRequired')`
- `t('passwordMinimum')`
- `t('passwordsDoNotMatch')`
- `t('failedUpdatePassword')`
- `t('passwordUpdatedSuccess')`

**Hardcoded Text Found:**
- Type labels are mapped but should use i18n keys
- Comments reference translation keys properly

**Recommended Namespace:** `transactions`

---

### 6. **app/dashboard/settings/page.tsx** (Settings Page)
**Status:** ✅ USING TRANSLATIONS

**useI18n Hook Used:** ✅ YES
- `useI18n('settings')` imported and used

**Translation Keys Being Used:**
- `t('allFieldsRequired')`
- `t('passwordMinimum')`
- `t('passwordsDoNotMatch')`
- `t('failedUpdatePassword')`
- `t('passwordUpdatedSuccess')`

**Hardcoded Text Found:**
- Icon labels and section titles (SettingsIcon, User, Lock, Bell, etc.) - may need translation

**Recommended Namespace:** `settings`

---

### 7. **app/dashboard/referrals/page.tsx** (Referral Page)
**Status:** ✅ USING TRANSLATIONS

**useI18n Hook Used:** ✅ YES
- `useI18n('referral')` imported and used

**Translation Keys Being Used:**
- `t('copiedCode')`
- `t('loading', 'Loading...')`
- Various referral-specific keys

**Hardcoded Text Found:**
- Fallback text in `t('loading', 'Loading...')`
- Copy notification messages potentially hardcoded

**Recommended Namespace:** `referral`

---

### 8. **app/dashboard/withdraw/page.tsx** (Withdraw Page)
**Status:** ✅ USING TRANSLATIONS

**useI18n Hook Used:** ✅ YES
- `useI18n('withdraw')` imported and used

**Translation Keys Being Used:**
- Most text appears to be using translation keys

**Hardcoded Text Found:**
- Coin symbols: "USDT", "BTC", "ETH", "BNB", "TRX", "SOL"
- Fee percentage comment (0.003 = 0.3%)

**Recommended Namespace:** `withdraw`

---

## COMPONENTS/DASHBOARD COMPONENTS

### 9. **activity-log.tsx**
**Status:** ✅ USING TRANSLATIONS

**useI18n Hook Used:** ✅ YES
- `useI18n('dashboardmain')` imported and used

**Translation Keys Being Used:**
- `t('activity_sign_in')`
- `t('activity_sign_out')`
- `t('activity_deposit')`
- `t('activity_withdrawal')`
- `t('activity_investment')`
- `t('activity_password_changed')`
- `t('activity_profile_updated')`
- `t('activity_deletion_request')`
- `t('just_now')`
- `t('min_ago')`
- `t('hours_ago')`
- `t('days_ago')`
- `t('no_recent_activity')`

**Recommended Namespace:** `dashboardmain`

---

### 10. **balance-card.tsx**
**Status:** ⚠️ MISSING TRANSLATIONS

**useI18n Hook Used:** ❌ NO

**Hardcoded Text Found:**
- "Total Balance" (header)
- "+$12,450", "this month" (example data)
- "-$3,000", "withdrawn" (example data)
- "Invested", "Returns", "Available" (column headers)

**Recommended Namespace:** `dashboardmain`

---

### 11. **bottom-nav-bar.tsx**
**Status:** ⚠️ PARTIALLY TRANSLATED

**useI18n Hook Used:** ✅ YES
- `useI18n('dashboardmain')` imported but not used

**Hardcoded Text Found:**
- "Home", "Investments", "Deposit", "Transactions", "Settings" - Navigation labels are hardcoded
- Comment says "Menu labels stay in English and don't change with language selection" 

**Translation Keys Being Used:**
- Hook is imported but not used in navItems

**Note:** This appears intentional (hardcoded navigation), but should be clarified if these should be translatable

**Recommended Namespace:** `dashboardmain`

---

### 12. **dashboard-cards-synced.tsx**
**Status:** ✅ USING TRANSLATIONS

**useI18n Hook Used:** ✅ YES
- `useI18n('dashboardmain')` imported and used

**Translation Keys Being Used:**
- `t('available_balance')`
- `t('pending_lower')`
- `t('ready_to_invest')`
- `t('total_invested')`
- `t('active_plans_label')`
- `t('growing')`
- `t('tracking')`
- `t('total_withdrawal')`
- `t('no_pending')`

**Recommended Namespace:** `dashboardmain`

---

### 13. **dashboard-hero-synced.tsx**
**Status:** ✅ USING TRANSLATIONS

**useI18n Hook Used:** ✅ YES
- `useI18n('dashboardmain')` imported and used

**Translation Keys Being Used:**
- `t('syncing')`
- `t('welcome_back')`
- `t('portfolio_performing')`
- `t('total_balance')`
- `t('monthly_gain')`
- `t('total_return_rate')`

**Recommended Namespace:** `dashboardmain`

---

### 14. **dashboard-hero-client.tsx**
**Status:** Not found in detailed review - check if exists

---

### 15. **dashboard-layout-client.tsx** (DashboardLayoutClient)
**Status:** ✅ USING TRANSLATIONS (indirectly)

**useI18n Hook Used:** ❌ NO
- Only renders child components that handle translations

**Hardcoded Text Found:**
- None (wrapper component)

**Recommended Namespace:** N/A

---

### 16. **DashboardLayoutClient.tsx**
**Status:** ✅ MINIMAL TRANSLATIONS

**useI18n Hook Used:** ❌ NO

**Hardcoded Text Found:**
- None (wrapper component)

---

### 17. **deposit-modal.tsx**
**Status:** ⚠️ MISSING TRANSLATIONS

**useI18n Hook Used:** ❌ NO

**Hardcoded Text Found:**
- "Confirm Deposit" (modal title)
- "Send the exact amount to complete your deposit" (description)
- "You're Depositing" (section label)

**Recommended Namespace:** `deposit`

---

### 18. **education-tips.tsx**
**Status:** ✅ USING TRANSLATIONS

**useI18n Hook Used:** ✅ YES
- `useI18n('dashboardmain')` imported and used

**Translation Keys Being Used:**
- `t('tip_investment_strategy')`
- `t('tip_market_insight')`
- `t('tip_risk_management')`
- `t('tip_product_feature')`
- `t('tip_diversification_title')`
- `t('tip_diversification_desc')`
- `t('tip_compound_interest_title')`
- `t('tip_compound_interest_desc')`
- `t('tip_risk_management_title')`
- `t('tip_risk_management_desc')`
- `t('tip_auto_reinvestment_title')`
- `t('tip_auto_reinvestment_desc')`
- `t('tip_dollar_cost_averaging_title')`
- `t('tip_dollar_cost_averaging_desc')`
- `t('tip_start_early_title')`
- `t('tip_start_early_desc')`

**Recommended Namespace:** `dashboardmain`

---

### 19. **feature-guide.tsx**
**Status:** ⚠️ MISSING TRANSLATIONS

**useI18n Hook Used:** ❌ NO

**Hardcoded Text Found:**
- "Email Alerts & Notifications" (feature title)
- "Receive instant email notifications for important account activities" (description)
- "Enable Notifications", "Choose Alert Types", "Verify Your Email" (step titles)
- Multiple descriptions and benefits all hardcoded
- "Dark Mode" (feature title)
- "Dark Mode" description and steps all hardcoded
- Complete feature guide data structure is hardcoded

**Recommended Namespace:** `dashboard`

---

### 20. **glance-strip-synced.tsx**
**Status:** ✅ USING TRANSLATIONS

**useI18n Hook Used:** ✅ YES
- `useI18n('dashboardmain')` imported and used

**Translation Keys Being Used:**
- `t('net_balance')`
- `t('monthly_delta')`
- `t('syncing_label')`
- `t('last_updated')`

**Recommended Namespace:** `dashboardmain`

---

### 21. **language-select.tsx**
**Status:** To be checked

**useI18n Hook Used:** Likely YES

---

### 22. **live-chat-button.tsx**
**Status:** Not primarily a dashboard component

---

### 23. **notification-bell.tsx**
**Status:** ⚠️ MISSING TRANSLATIONS

**useI18n Hook Used:** ❌ NO

**Hardcoded Text Found:**
- Error messages within fetch/delete operations
- Notification bell UI labels may need translation

**Recommended Namespace:** `dashboardmain`

---

### 24. **portfolio-chart.tsx**
**Status:** ✅ USING TRANSLATIONS

**useI18n Hook Used:** ✅ YES
- `useI18n('dashboardmain')` imported and used

**Translation Keys Being Used:**
- `t('portfolio_performance')`
- `t('this_month')`

**Hardcoded Text Found:**
- Chart data labels (month names)
- Tooltip content (may need i18n for date formatting)

**Recommended Namespace:** `dashboardmain`

---

### 25. **portfolio-dashboard.tsx**
**Status:** ✅ USING TRANSLATIONS

**useI18n Hook Used:** ✅ YES
- `useI18n('dashboardmain')` imported and used

**Translation Keys Being Used:**
- `t('total_balance')`
- `t('total_invested')`
- `t('portfolio_performance')`

**Hardcoded Text Found:**
- "Available for investment or withdrawal" (subtext)
- "Capital deployed across plans" (subtext)
- "Total Returns", "ROI", "Growing", "Tracking" (various labels)
- "Net Profit", "After fees of" (labels)
- Chart titles and axes labels partially hardcoded

**Recommended Namespace:** `dashboardmain`

---

### 26. **quick-actions.tsx**
**Status:** ✅ USING TRANSLATIONS

**useI18n Hook Used:** ✅ YES
- `useI18n('dashboardmain')` imported and used

**Translation Keys Being Used:**
- `t('invest_now')`
- `t('deposit_funds')`
- `t('withdraw_funds')`
- `t('quick_actions')`

**Recommended Namespace:** `dashboardmain`

---

### 27. **recent-activities.tsx**
**Status:** To be checked

---

### 28. **recent-transactions-synced.tsx**
**Status:** ✅ USING TRANSLATIONS

**useI18n Hook Used:** ✅ YES
- `useI18n('dashboardmain')` imported and used

**Translation Keys Being Used:**
- `t('recent_transactions')`
- `t('no_transactions_yet')`
- `t('syncing_label')`
- `t('transaction_deposit')`
- `t('transaction_withdrawal')`
- `t('transaction_investment')`
- `t('transaction_return')`
- `t('transaction_approved')`
- `t('transaction_pending')`
- `t('transaction_failed')`
- `t('transaction_completed')`

**Recommended Namespace:** `dashboardmain`

---

### 29. **referral-dashboard.tsx**
**Status:** ✅ USING TRANSLATIONS

**useI18n Hook Used:** ✅ YES
- `useI18n('referral')` imported and used

**Translation Keys Being Used:**
- `t('copiedCode')`
- Toast messages reference translation keys

**Hardcoded Text Found:**
- Some toast descriptions are partially hardcoded
- Error messages may be hardcoded

**Recommended Namespace:** `referral`

---

### 30. **referral-summary-card.tsx**
**Status:** ✅ USING TRANSLATIONS

**useI18n Hook Used:** ✅ YES
- `useI18n('dashboardmain')` imported and used

**Translation Keys Being Used:**
- `t('referral_program')`
- `t('earn_on_referrals')`
- `t('active_referrals')`
- `t('can_withdraw')`
- `t('more_needed')`
- `t('available_balance')`
- `t('ready_to_transfer')`
- `t('view_details')`

**Recommended Namespace:** `dashboardmain`

---

### 31. **referral-withdraw-modal.tsx**
**Status:** ⚠️ MISSING TRANSLATIONS

**useI18n Hook Used:** ❌ NO

**Hardcoded Text Found:**
- "Invalid amount" (toast title)
- "Please enter a valid amount" (toast message)
- "Insufficient balance" (toast title)
- "You cannot transfer more than your referral balance" (toast message)
- "Success!" (toast title)
- "Successfully transferred $... to your main balance" (dynamic message)
- "Error" (toast title)
- "Failed to transfer balance" (fallback message)
- Modal content - "Cancel", button labels

**Recommended Namespace:** `referral`

---

### 32. **rich-text-editor.tsx** / **rich-editor.tsx**
**Status:** Not primarily dashboard component

---

### 33. **transaction-detail-modal.tsx**
**Status:** ⚠️ MISSING TRANSLATIONS

**useI18n Hook Used:** ❌ NO

**Hardcoded Text Found:**
- "Deposit", "Withdrawal", "Investment", "Return" (type labels in typeLabels object)
- "Transaction Amount" (section label)
- "Fee Breakdown" (section header)
- "Requested Amount:", "Received Amount:", "Network Fee:" (breakdown labels) - SHOULD CHECK COMPLETE FILE
- Tooltip/help text for wallet addresses

**Recommended Namespace:** `dashboard` or `transactions`

---

### 34. **user-menu.tsx**
**Status:** ✅ USING TRANSLATIONS

**useI18n Hook Used:** ✅ YES
- `useI18n('dashboardmain')` imported and used

**Hardcoded Text Found:**
- "English", "Español", "Português", "Français", "中文", "العربية", "Filipino" - Language names in LANGUAGES object
- These are intentionally hardcoded but should consider if they need translation

**Recommended Namespace:** `dashboardmain`

---

### 35. **welcome-popup.tsx**
**Status:** ⚠️ MISSING TRANSLATIONS

**useI18n Hook Used:** ❌ NO

**Hardcoded Text Found:**
- "Welcome back," (greeting)
- `displayName` (dynamic but label is hardcoded)
- "Your account is all set. You're ready to start investing and growing your wealth with Vault." (welcome message)
- "Key Features" (section title)
- "Diversified Plans" (feature title)
- "Multiple investment options with competitive returns" (feature description)
- "Bank-Level Security" (feature title)
- Feature descriptions and benefits - ALL HARDCODED

**Recommended Namespace:** `dashboard`

---

## SUMMARY TABLE

| Component | useI18n Used | Hardcoded Text | Status | Namespace |
|-----------|-------------|----------------|--------|-----------|
| **PAGES** |
| app/dashboard/page.tsx | ❌ | None | ✅ | N/A |
| app/dashboard/deposit/page.tsx | ✅ | Coins/Networks | ✅ | deposit |
| app/dashboard/investments/page.tsx | ❌ | Errors | ⚠️ | dashboard |
| app/dashboard/portfolio/page.tsx | ❌ | Extensive | ❌ | dashboard |
| app/dashboard/transactions/page.tsx | ✅ | Minimal | ✅ | transactions |
| app/dashboard/settings/page.tsx | ✅ | Minimal | ✅ | settings |
| app/dashboard/referrals/page.tsx | ✅ | Minimal | ✅ | referral |
| app/dashboard/withdraw/page.tsx | ✅ | Coins only | ✅ | withdraw |
| **COMPONENTS** |
| activity-log.tsx | ✅ | None | ✅ | dashboardmain |
| balance-card.tsx | ❌ | Extensive | ❌ | dashboardmain |
| bottom-nav-bar.tsx | ✅/❌ | Labels hardcoded (intentional?) | ⚠️ | dashboardmain |
| dashboard-cards-synced.tsx | ✅ | None | ✅ | dashboardmain |
| dashboard-hero-synced.tsx | ✅ | None | ✅ | dashboardmain |
| dashboard-layout-client.tsx | ❌ | None | ✅ | N/A |
| DashboardLayoutClient.tsx | ❌ | None | ✅ | N/A |
| deposit-modal.tsx | ❌ | Titles/Descriptions | ❌ | deposit |
| education-tips.tsx | ✅ | None | ✅ | dashboardmain |
| feature-guide.tsx | ❌ | ALL hardcoded | ❌ | dashboard |
| glance-strip-synced.tsx | ✅ | None | ✅ | dashboardmain |
| notification-bell.tsx | ❌ | Error messages | ⚠️ | dashboardmain |
| portfolio-chart.tsx | ✅ | Minimal | ✅ | dashboardmain |
| portfolio-dashboard.tsx | ✅ | Some labels | ⚠️ | dashboardmain |
| quick-actions.tsx | ✅ | None | ✅ | dashboardmain |
| recent-transactions-synced.tsx | ✅ | None | ✅ | dashboardmain |
| referral-dashboard.tsx | ✅ | Some messages | ⚠️ | referral |
| referral-summary-card.tsx | ✅ | None | ✅ | dashboardmain |
| referral-withdraw-modal.tsx | ❌ | Toast messages | ❌ | referral |
| transaction-detail-modal.tsx | ❌ | Labels/sections | ❌ | dashboard/transactions |
| user-menu.tsx | ✅ | Language names | ⚠️ | dashboardmain |
| welcome-popup.tsx | ❌ | ALL hardcoded | ❌ | dashboard |

---

## PRIORITY RECOMMENDATIONS

### HIGH PRIORITY (Missing critical translations)
1. **welcome-popup.tsx** - Complete hardcoded welcome/feature text (HIGH VISIBILITY)
2. **feature-guide.tsx** - Complete hardcoded feature guide content
3. **app/dashboard/portfolio/page.tsx** - Page title and all sections hardcoded
4. **transaction-detail-modal.tsx** - All transaction labels hardcoded
5. **referral-withdraw-modal.tsx** - All user-facing messages hardcoded
6. **deposit-modal.tsx** - Modal titles and descriptions

### MEDIUM PRIORITY (Partial translations)
7. **balance-card.tsx** - All labels hardcoded, no i18n hook
8. **notification-bell.tsx** - Error handling messages
9. **portfolio-dashboard.tsx** - Subtext and chart labels
10. **bottom-nav-bar.tsx** - Clarify if navigation should be translatable

### LOW PRIORITY (Minor improvements)
11. **user-menu.tsx** - Language names already hardcoded (may be intentional)
12. **referral-dashboard.tsx** - Some toast descriptions
13. Coin/network names (may be intended to remain in English)

---

## NAMESPACES CURRENTLY IN USE
- **dashboardmain** - Main dashboard components (most common)
- **dashboard** - Dashboard pages/general
- **deposit** - Deposit page
- **withdraw** - Withdraw page
- **transactions** - Transactions page
- **settings** - Settings page
- **referral** - Referral-related pages and components

## RECOMMENDATION
Consider consolidating to either:
1. **Keep current structure** - Namespace per feature (referral, deposit, withdraw, etc.)
2. **Consolidate to dashboardmain** - Use single namespace for all dashboard content for easier management
