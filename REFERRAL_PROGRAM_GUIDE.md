# Vault Referral Program - Integration Guide

## Overview

The Vault referral program allows users to earn 10% bonus on every deposit from their referrals (deposits of $100+). Referral earnings accumulate in a separate balance that can only be transferred to the main balance once a user has at least 10 active referrals.

## Features

### 1. **Referral Code Generation**
- Users can generate or view their unique referral code
- Each user has one primary referral code
- Referral links include the code for easy sharing
- Click tracking on referral codes

### 2. **Referral Tracking**
- New users who register using a referral code are tracked as referrals
- Referrals have a 1:1 relationship (each new user can only be referred once)
- Referral status can be: `active` or `inactive`

### 3. **Referral Bonus System**
- When a referred user makes a deposit of $100+, the referrer earns a 10% bonus
- Bonus is automatically calculated and credited to referrer's referral balance
- Multiple bonuses can be earned from the same referral (for multiple deposits)
- Bonuses show pending status until approved by admin

### 4. **Referral Balance Management**
- Separate balance for referral earnings (not mixed with main balance)
- Users can view total earned, total withdrawn, and available balance
- Progress tracker showing referrals count vs. 10-referral requirement

### 5. **Balance Transfer & Withdrawal**
- Users with ≥10 active referrals can transfer referral balance to main balance
- Transfers create audit records
- Main balance can then be withdrawn through normal withdrawal process

## Database Schema

### Tables Created

1. **referral_codes**
   - Stores unique referral codes per user
   - Tracks clicks and is_active status
   - Includes referral link

2. **referrals**
   - Tracks new user signups via referral
   - Maintains referrer_id → referred_user_id relationship
   - Status: active/inactive

3. **referral_bonuses**
   - Records each bonus earned
   - Links deposit transaction to bonus
   - Status: pending/credited/cancelled

4. **referral_balance**
   - One per user (unique constraint)
   - Tracks total earned and total withdrawn
   - Current available balance

5. **referral_withdrawals**
   - Audit trail for transfers from referral to main balance
   - Records before/after balances

## API Endpoints

### GET /api/referral/generate-code
- **Auth Required**: Yes
- **Purpose**: Get or generate user's referral code
- **Response**:
```json
{
  "success": true,
  "referralCode": "ABC12345",
  "referralLink": "https://vaultcapital.bond/register?ref=ABC12345",
  "clicksCount": 5
}
```

### GET /api/referral/stats
- **Auth Required**: Yes
- **Purpose**: Get referral dashboard statistics and referral list
- **Response**:
```json
{
  "success": true,
  "data": {
    "referralCode": {...},
    "stats": {
      "totalReferrals": 3,
      "totalEarned": 250.50,
      "referralBalance": 250.50,
      "totalWithdrawn": 0,
      "canWithdraw": false,
      "referralsNeeded": 7
    },
    "referrals": [...]
  }
}
```

### POST /api/referral/track
- **Auth Required**: No (internal use)
- **Purpose**: Track when someone registers via referral
- **Body**:
```json
{
  "referralCode": "ABC12345",
  "referredUserId": "user-uuid"
}
```

### POST /api/referral/withdraw
- **Auth Required**: Yes
- **Purpose**: Transfer from referral balance to main balance
- **Body**:
```json
{
  "amount": 250.50
}
```
- **Requirements**: User must have ≥10 active referrals
- **Response**: Updated balances and audit record

## Frontend Components

### 1. **ReferralDashboard** (`components/dashboard/referral-dashboard.tsx`)
- Main dashboard showing all referral statistics
- Displays referral code and sharing options
- Lists active referrals with deposit information
- Shows progress toward 10-referral requirement

### 2. **ReferralWithdrawModal** (`components/dashboard/referral-withdraw-modal.tsx`)
- Modal for transferring referral balance to main balance
- Form validation and confirmation
- Balance checking

### 3. **ReferralSummaryCard** (`components/dashboard/referral-summary-card.tsx`)
- Small summary card for main dashboard
- Quick access to referral information
- Link to full referral dashboard

### 4. **Dashboard Page** (`app/dashboard/referrals/page.tsx`)
- Full referral program page
- Integrates dashboard and withdrawal modal
- Automatic refresh after withdrawals

## Hooks

### useReferralStats()
```typescript
const { stats, loading, error, refetch } = useReferralStats()
```
- Fetches referral statistics
- Auto-refetch functionality
- Error handling

### useReferralCode()
```typescript
const { code, link, loading, error, generateCode } = useReferralCode()
```
- Gets or generates referral code
- Manual generation option

### useReferralWithdraw()
```typescript
const { withdraw, loading, error } = useReferralWithdraw()
```
- Processes balance transfers
- Error handling and loading state

## Integration Steps

### 1. **Database Setup**
```bash
# Run the new migration
psql $DATABASE_URL -f scripts/init-db.ts
# Or import the schema updates from db/schema.sql
```

### 2. **Add to Main Dashboard**
Import and add `ReferralSummaryCard` to your main dashboard:
```tsx
import { ReferralSummaryCard } from '@/components/dashboard/referral-summary-card'

export function Dashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Other cards */}
      <ReferralSummaryCard />
    </div>
  )
}
```

### 3. **Add Navigation Link**
Add link to referral page in main navigation:
```tsx
<NavLink href="/dashboard/referrals">Referrals</NavLink>
```

### 4. **Update Registration Form**
Registration already accepts `referralCode` parameter:
```tsx
// When registering with referral
const response = await fetch('/api/auth/signup', {
  method: 'POST',
  body: JSON.stringify({
    ...userData,
    referralCode: urlParams.get('ref') // Extract from URL
  })
})
```

## Configuration

### Referral Settings (in `lib/referral-utils.ts`)

```typescript
// Bonus percentage on referred user deposits
export const REFERRAL_BONUS_PERCENTAGE = 10

// Minimum deposit amount to trigger bonus
export const REFERRAL_MIN_DEPOSIT = 100

// Minimum active referrals needed to withdraw
export const REFERRAL_MIN_REFERRALS_TO_WITHDRAW = 10
```

Adjust these constants as needed for your business model.

## User Flow

### For Referrers:

1. **Generate Code**
   - Navigate to Referrals section
   - Copy referral code or link
   - Share with friends

2. **Track Referrals**
   - See list of referred users
   - Monitor their deposits
   - Track earned bonuses

3. **Earn & Withdraw**
   - Bonuses credited automatically when referred user deposits $100+
   - Once 10 referrals achieved, can transfer to main balance
   - Transfer appears immediately in main balance
   - Then can withdraw normally

### For Referred Users:

1. **Register with Code**
   - Click referral link or enter code during signup
   - Create account normally
   - Referral is recorded

2. **Make Deposit**
   - Deposit $100+ triggers referrer bonus
   - Gets normal account balance increase
   - Referrer gets separate bonus

## Security Considerations

- ✅ Referral codes are unique and generated securely
- ✅ Referral tracking uses UUID relationships (no user tampering)
- ✅ Bonus generation only triggers on approved deposits
- ✅ Balance transfers require authentication
- ✅ Withdrawal requirement (10 referrals) prevents abuse
- ✅ Audit trail maintained for all transfers
- ✅ Admin can view and manage referral bonuses

## Testing Checklist

- [ ] Generate referral code for test user
- [ ] Register new user with referral code
- [ ] Verify referral is tracked in database
- [ ] Make $100+ deposit from referred user
- [ ] Verify bonus is calculated (10% of deposit)
- [ ] Verify bonus appears in referrer's referral dashboard
- [ ] Check referral balance is separate from main balance
- [ ] Try to withdraw with <10 referrals (should fail)
- [ ] Add enough referrals to reach 10
- [ ] Transfer referral balance to main balance
- [ ] Verify transfer reduces referral balance
- [ ] Verify transfer increases main balance
- [ ] Check audit trail in referral_withdrawals table
- [ ] Verify notifications are sent correctly

## Troubleshooting

### Referral Code Not Working
- Verify code exists in `referral_codes` table
- Check `is_active = true`
- Ensure code hasn't been deactivated

### Bonus Not Showing
- Verify deposit has been approved (status = 'approved')
- Check deposit amount is ≥ $100
- Verify referral exists and is active

### Can't Withdraw
- Count active referrals: `SELECT COUNT(*) FROM referrals WHERE referrer_id = ? AND status = 'active'`
- Ensure count is ≥ 10
- Check referral balance has sufficient funds

### Balance Discrepancies
- Check `referral_balance` table for user
- Review `referral_withdrawals` audit records
- Check `referral_bonuses` for credited transactions

## Future Enhancements

- [ ] Tiered bonus structure based on number of referrals
- [ ] Special promotions (2x bonus week)
- [ ] Referral leaderboard
- [ ] Email notifications for earned bonuses
- [ ] Referral dashboard analytics/charts
- [ ] Referral link expiration
- [ ] Invite via email feature
- [ ] Referral program terms and conditions modal
