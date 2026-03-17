# Database Initialization Guide

## Overview

The database system is now fully initialized with all required fields, tables, columns, and indexes. The initialization process runs automatically when the application starts, ensuring the database schema is always up-to-date.

## What Gets Initialized

### 1. Core Tables
- **users** - User accounts with all profile and security fields
- **transactions** - Deposit, withdrawal, investment, and return transactions
- **investments** - Investment records with tracking
- **active_investments** - Active investment records (backward compatibility)
- **investment_plans** - Available investment plan templates
- **notifications** - User notifications
- **activity_logs** - User activity tracking
- **wallet_addresses** - Cryptocurrency wallet addresses
- **verification_codes** - Email verification codes
- **password_reset_tokens** - Password reset tokens

### 2. User Table Columns
```sql
id, name, first_name, last_name, email, phone, date_of_birth,
password_hash, verified, role, balance, joined_at, avatar,
last_login, created_at, updated_at,
email_verified, two_factor_enabled, two_factor_secret, backup_codes
```

### 3. Transactions Table Columns
```sql
id, user_id, type, amount, status, description, date,
method, bank_account, crypto_address
```

### 4. Investments Table Columns
```sql
id, user_id, plan_id, name, amount, status, projected_return,
progress_percentage, start_date, maturity_date, created_at, updated_at
```

### 5. Database Indexes
- `idx_transactions_user_id` - Fast user transaction lookups
- `idx_transactions_status` - Fast transaction status filtering
- `idx_transactions_date` - Fast date-based queries
- `idx_investments_user_id` - Fast user investment lookups
- `idx_investments_status` - Fast investment status filtering
- `idx_investments_maturity` - Fast maturity date queries
- `idx_notifications_user_id` - Fast notification lookups
- `idx_activity_logs_user_id` - Fast activity lookups

## Automatic Initialization

The database initializes automatically when the application starts. The initialization process:

1. **Creates all tables** (if they don't exist)
2. **Adds missing columns** to existing tables
3. **Converts column types** where necessary (e.g., text to timestamp)
4. **Renames legacy columns** to follow naming conventions
5. **Creates performance indexes**
6. **Seeds investment plans** (CBF, GP, HYEF, RET)
7. **Creates admin user** (if it doesn't exist)

### Console Output
When the app starts, you'll see migration logs:
```
[Migration] Added progress_percentage column to investments table
[Migration] Added management_fee column to investment_plans table
[Migration] Created index: idx_transactions_user_id
[Migration] Investment plan types: [ ... ]
[Seeding] Admin user created successfully
```

## Manual Database Initialization

### Option 1: Admin API Endpoint (Recommended for Production)

**Check Database Status:**
```bash
curl -X GET http://localhost:3000/api/admin/db-init \
  -H "Authorization: Bearer <admin_token>"
```

**Response:**
```json
{
  "status": "healthy",
  "database": "PostgreSQL",
  "timestamp": "2026-03-17T20:30:00Z",
  "tableCounts": {
    "users": 5,
    "transactions": 42,
    "investments": 8,
    "investment_plans": 4,
    "active_investments": 0,
    "notifications": 23
  }
}
```

**Run Initialization:**
```bash
curl -X POST http://localhost:3000/api/admin/db-init \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "results": [
    "✓ Added column: users.email_verified",
    "✓ Added column: users.two_factor_enabled",
    "✓ Added column: transactions.method",
    "✓ Created index: idx_transactions_user_id",
    "✓ Seeded 4/4 investment plans",
    "✓ Created admin user (admin@vaultcapital.bond)"
  ],
  "errors": [],
  "statistics": {
    "successCount": 20,
    "errorCount": 0,
    "totalOperations": 20
  }
}
```

### Option 2: Command Line (Development/Local)

**Prerequisites:**
- Node.js 18+ installed
- PostgreSQL database running
- `DATABASE_URL` environment variable set

**Run Initialization Script:**
```bash
# Using npx with ts-node
npx ts-node scripts/init-db.ts

# Or with npm
npm run db:init
```

**Output:**
```
🔧 Initializing database...

📋 Ensuring all user columns exist...
✓ Added users.email_verified
✓ Added users.two_factor_enabled
✓ Added users.two_factor_secret
✓ Added users.backup_codes

📊 Creating database indexes...
✓ Created index: idx_transactions_user_id
✓ Created index: idx_investments_user_id

🎯 Seeding investment plans...
✓ Seeded 4/4 investment plans

👤 Ensuring admin user exists...
✓ Created admin user (admin@vaultcapital.bond / F2nny4jj!)

✅ Database initialization complete! (20 successful, 0 warnings)
```

## Investment Plans

The following investment plans are automatically seeded:

| ID | Name | Min | Max | Risk | Duration |
|----|------|-----|-----|------|----------|
| cbf | Conservative Bond Fund | $100 | $50K | Low | 7-365 days |
| gp | Growth Portfolio | $500 | $100K | Medium | 7-365 days |
| hyef | High Yield Equity Fund | $1K | $200K | High | 7-365 days |
| ret | Real Estate Trust | $10K | $500K | Med-Low | 7-365 days |

## Admin User

**Default Admin Account:**
- Email: `admin@vaultcapital.bond`
- Password: `F2nny4jj!`
- Role: `admin`

⚠️ **Change the password immediately in production!**

## Column Type Mappings

### PostgreSQL Snake_Case
- `user_id` → Foreign key to users
- `plan_id` → Foreign key to plans
- `created_at` → TIMESTAMP
- `prog_percentage` → Progress tracking
- `email_verified` → Email verification status

### Backward Compatibility
The system supports both:
- PostgreSQL (primary): snake_case columns
- SQLite (fallback): camelCase columns

Queries automatically handle both naming conventions.

## Verification

To verify the database is properly initialized:

```sql
-- Check table count
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- Check users table columns (should be 20+)
SELECT COUNT(*) FROM information_schema.columns 
WHERE table_name = 'users';

-- Check investment plans
SELECT * FROM investment_plans 
ORDER BY id;

-- Check admin user
SELECT id, name, email, role FROM users 
WHERE role = 'admin';

-- Check indexes
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('transactions', 'investments');
```

## Troubleshooting

### Issue: "Column already exists" errors
**Solution:** These are expected and benign. The system checks for existing columns before adding them.

### Issue: Foreign key constraint errors
**Solution:** Ensure all dependent tables exist. The initialization creates tables in the correct order.

### Issue: Database initialization takes too long
**Solution:** This is normal on first run. Index creation can take time on large tables. Subsequent runs are faster.

### Issue: Admin user not created
**Solution:** Check that the users table exists. The admin user creation runs during the seeding phase.

## Environment Variables

```bash
# Required
DATABASE_URL=postgresql://user:password@localhost:5432/vault

# Optional
NODE_ENV=development|production
LOG_LEVEL=debug|info|warn|error
```

## Next Steps

1. ✅ Database initialized
2. ✅ All tables created
3. ✅ All columns added
4. ✅ Investment plans seeded
5. ✅ Admin user created

You're ready to:
- Create user accounts
- Process deposits
- Create investments
- Track transactions
- Generate reports

## Support

For database issues:
1. Check `/api/admin/db-init` GET endpoint for current status
2. Review migration logs in console output
3. Run initialization script manually if needed
4. Check PostgreSQL logs for errors

---

**Last Updated:** March 17, 2026
**Database Version:** PostgreSQL 15+
**Status:** ✅ Production Ready
