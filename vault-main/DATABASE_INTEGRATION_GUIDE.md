# Vault Platform - Database Integration Guide

## Prerequisites

- PostgreSQL 14+ or compatible database
- Node.js 18+
- Vercel account (for deployment)

## Local Development Setup

### 1. Database Installation

#### Option A: Local PostgreSQL
```bash
# macOS with Homebrew
brew install postgresql

# Start PostgreSQL
brew services start postgresql

# Create database
createdb vault_dev
```

#### Option B: Docker
```bash
docker run -d \
  --name vault-postgres \
  -e POSTGRES_DB=vault_dev \
  -e POSTGRES_PASSWORD=localdevpass \
  -p 5432:5432 \
  postgres:15-alpine
```

#### Option C: Managed Service
- **AWS RDS**: https://aws.amazon.com/rds/
- **Heroku Postgres**: https://www.heroku.com/postgres
- **Railway.app**: https://railway.app
- **Supabase**: https://supabase.com (PostgreSQL + API layer)

### 2. Initialize Database Schema

```bash
# Connect to your database and run schema
psql vault_dev < db/schema.sql

# Or for remote database
psql postgresql://user:password@host:5432/vault_dev < db/schema.sql
```

### 3. Configure Environment Variables

Create `.env.local`:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/vault_dev

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long
NEXTAUTH_SECRET=your-nextauth-secret-min-32-chars-long
NEXTAUTH_URL=http://localhost:3000

# Email Service (for notifications & recovery)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # Use app password, not account password
SMTP_FROM=noreply@vaultcapital.com

# Optional: Sendgrid alternative
SENDGRID_API_KEY=your-sendgrid-key

# Crypto prices API
CRYPTO_API_KEY=your-coingecko-api-key  # Free tier available

# Analytics (optional)
ANALYTICS_KEY=your-analytics-key

# Feature flags
ENABLE_2FA=true
ENABLE_ACCOUNT_RECOVERY=true
ENABLE_RECEIPTS=true
```

### 4. Run Database Migrations

```bash
# Check database connection
npm run db:check

# Seed default data (investment plans, etc.)
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev

# Server runs on http://localhost:3000
# Verify database connection at /api/debug/db-check
```

## API Integration - Feature by Feature

### Authentication Flow

**Endpoint**: `POST /api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "expiresIn": 86400
}
```

**Database Integration**:
- Query: `SELECT * FROM users WHERE email = $1`
- Verify: `bcrypt.compare(password, user.password_hash)`
- Create JWT with user.id in payload
- Set HttpOnly cookie with token

### Investment Portfolio

**Endpoint**: `GET /api/investments`
**Database Query**:
```sql
SELECT 
  i.*, 
  p.name, 
  p.plan_type,
  p.return_rate
FROM investments i
JOIN investment_plans p ON i.plan_id = p.id
WHERE i.user_id = $1 AND i.status != 'cancelled'
ORDER BY i.created_at DESC
```

### Activity Logging

**Endpoint**: `POST /api/activities` (internal)
**Usage**:
```javascript
// After successful login
await fetch('/api/activities', {
  method: 'POST',
  body: JSON.stringify({
    userId: user.id,
    type: 'login',
    description: 'User logged in',
    location: req.headers['x-forwarded-for'],
    device: req.headers['user-agent']
  })
})
```

**Database**:
```sql
INSERT INTO activity_logs 
(user_id, type, description, location, device, ip_address, user_agent, status)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
```

### Two-Factor Authentication

**Setup Endpoint**: `POST /api/auth/2fa/setup`
1. Generate TOTP secret using `speakeasy` library
2. Store in `users.two_factor_secret` (encrypted)
3. Return QR code for scanner

**Verify Endpoint**: `POST /api/auth/2fa/verify`
1. Verify code matches TOTP algorithm
2. Generate & store backup codes
3. Mark `users.two_factor_enabled = true`

**Database**:
```sql
UPDATE users 
SET two_factor_enabled = true,
    two_factor_secret = pgcrypto.pgp_sym_encrypt($1, $2),
    backup_codes = $3
WHERE id = $4
```

### Account Recovery

**Email Recovery**: `POST /api/auth/recover/email`
- Generate 6-digit code
- Store in Redis with 15-min expiry (or `recovery_tokens` table)
- Send via email

**Backup Code Recovery**: `POST /api/auth/recover/backup-code`
- Validate one of user's backup codes
- Use it (mark as used)
- Reset password

**Database**:
```sql
-- Add recovery_tokens table for persistence
CREATE TABLE recovery_tokens (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  code VARCHAR(6),
  type VARCHAR(20), -- 'email', 'backup'
  used BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Receipts & Downloads

**Endpoint**: `POST /api/transactions/{id}/receipt`
1. Generate PDF with transaction details
2. Store in `transaction_receipts` table
3. Return download link or direct download

**Database**:
```sql
INSERT INTO transaction_receipts 
(transaction_id, user_id, file_name, file_path, file_size, mime_type)
VALUES ($1, $2, $3, $4, $5, $6)
```

## Environment-Specific Configuration

### Development (.env.local)
- Local PostgreSQL on localhost:5432
- Console logging enabled
- Debug endpoints available
- JWT expires in 7 days

### Staging (.env.staging)
- RDS/managed PostgreSQL
- Limited logging (errors only)
- Debug endpoints disabled
- JWT expires in 24 hours

### Production (.env.production)
- Production PostgreSQL (Vercel/Railway/AWS)
- No debug endpoints
- Minimal logging
- JWT expires in 12 hours
- HTTPS only
- Sentry error tracking enabled

## Deployment Checklist

- [ ] Database provisioned and accessible
- [ ] All tables created via schema.sql
- [ ] Default investment plans seeded
- [ ] Environment variables configured
- [ ] Database backups tested
- [ ] Connection pool configured (max 20 connections)
- [ ] Slow query logging enabled
- [ ] Indexes created for performance
- [ ] Database password rotated
- [ ] SSL/TLS enabled for connections
- [ ] Read replicas configured (optional)

## Database Maintenance

### Daily
```bash
# Verify connection
SELECT 1 as health_check;

# Monitor active connections
SELECT count(*) FROM pg_stat_activity;
```

### Weekly
```bash
# Analyze query performance
ANALYZE;

# Check index usage
SELECT * FROM pg_stat_user_indexes;
```

### Monthly
```bash
# Backup
pg_dump vault_prod > backup_$(date +%Y%m%d).sql

# Vacuum for performance
VACUUM ANALYZE;
```

## Troubleshooting

### Database Connection Failed
```bash
# Check PostgreSQL is running
psql -l

# Test connection string
psql postgresql://user:password@host:5432/dbname

# Check environment variables
echo $DATABASE_URL
```

### Slow Queries
```sql
-- Enable query logging
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1s
SELECT pg_reload_conf();

-- Find slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC LIMIT 10;
```

### Connection Pool Issues
```javascript
// In lib/db.ts, adjust pool options:
const pool = new Pool({
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})
```

---

## Next Steps

1. **Provision Database** - Choose local/cloud option
2. **Run Schema** - Execute db/schema.sql
3. **Configure Env** - Set up .env.local
4. **Test Connection** - Run npm run db:check
5. **Seed Data** - npm run db:seed
6. **Start Dev** - npm run dev
7. **Run Tests** - npm run test
8. **Deploy to Staging** - For user acceptance testing
9. **Deploy to Production** - After sign-off

