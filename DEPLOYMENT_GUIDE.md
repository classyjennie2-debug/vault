# Vault Platform - Deployment Guide
**Platform**: Vercel (Recommended)  
**Date**: March 17, 2026

## Pre-Deployment Checklist

- [ ] All code committed and pushed to `main` branch
- [ ] Latest commit builds successfully: `npm run build`
- [ ] Environment variables configured in Vercel dashboard
- [ ] Database provisioned and schema initialized
- [ ] GitHub/GitLab repository connected to Vercel
- [ ] Domain configured (if custom domain)
- [ ] SSL certificate auto-generated
- [ ] Email service verified (SMTP/SendGrid)
- [ ] Analytics/monitoring setup (optional)

## Step 1: Connect Repository to Vercel

### Option A: New Project
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Select GitHub repository: `classyjennie2-debug/vault`
4. Import project
5. Configure environment variables (see below)

### Option B: Update Existing Project
1. Go to Project Settings
2. Go to "Deployments" tab
3. Connect to `main` branch
4. Redeploy latest

## Step 2: Configure Environment Variables

In Vercel Dashboard: **Settings → Environment Variables**

### Required Variables
```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/vault_prod

# Authentication
JWT_SECRET=<generate-32-char-random-string>
NEXTAUTH_SECRET=<generate-32-char-random-string>
NEXTAUTH_URL=https://yourdomain.com

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=<your-app-password>
SMTP_FROM=noreply@vaultcapital.com

# API Keys
CRYPTO_API_KEY=<coingecko-api-key>

# Feature Flags
ENABLE_2FA=true
ENABLE_ACCOUNT_RECOVERY=true
```

### Generate Secure Secrets
```bash
# On your local machine
openssl rand -base64 32

# Or in Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Environment Variable Scopes
- **Production** - Used for production deployments
- **Preview** - Used for preview deployments (staging)
- **Development** - Used in local development (local .env.local)

**Recommended**: Set all sensitive vars in Production only, use different values for Preview.

## Step 3: Deploy to Staging (Preview)

### Manual Staging Deploy
```bash
# Create staging branch
git checkout -b staging
git push origin staging
```

In Vercel:
- Configure branch settings for `staging`
- Use different DATABASE_URL (staging DB)
- Deploy automatically on push to staging

### Test Staging
```bash
# Test login flow
curl -X POST https://vault-staging.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Test dashboard access
curl -i https://vault-staging.vercel.app/dashboard

# Check health
curl https://vault-staging.vercel.app/
```

## Step 4: Deploy to Production

### Production Deployment

```bash
# Ensure main branch is current
git checkout main
git pull origin main

# Verify build passes
npm run build

# Push (if new commits)
git push origin main
```

**Vercel automatically deploys** when code is pushed to `main` branch.

### Manual Trigger
In Vercel Dashboard:
1. Select "vault" project
2. Go to "Deployments" tab
3. Click "Redeploy" on latest commit

### Zero-Downtime Deployment
Vercel handles this automatically:
1. New build deployed to new serverless functions
2. Old version still serves requests
3. Traffic gradually shifted to new version
4. Old version kept alive for instant rollback

## Step 5: Verify Production Deployment

```bash
# Check deployment status
curl https://vault.vercel.app

# Test critical endpoints
curl -X POST https://vault.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vault.com","password":"password"}'

# Monitor real-time logs
# In Vercel Dashboard: Project → Deployments → Logs
```

## Post-Deployment Verification

### Health Checks
- [ ] Homepage loads (200 OK)
- [ ] Login endpoint works (200/401)
- [ ] Dashboard redirect works (307 to /login without auth)
- [ ] Logout clears cookies (200, sets expires)
- [ ] Database queries work (no timeouts)

### Performance Checks
- [ ] Homepage loads < 2s
- [ ] API responses < 500ms
- [ ] Database connections stable
- [ ] No 503 errors

### Security Checks
- [ ] HTTPS enforced (301 http→https)
- [ ] Security headers present
  - `Content-Security-Policy`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
- [ ] No SQL parameters in logs
- [ ] No sensitive data leaked

### Monitoring
1. Go to Vercel Dashboard → Analytics
2. Check:
   - Request count & latency
   - Error rate (should be < 0.1%)
   - Function duration
   - Database connection count

## Rollback Procedure

### If Deployment Fails

**Immediate Rollback**:
1. In Vercel Dashboard → Deployments
2. Find last successful deployment
3. Click "Promote to Production"

**Rollback to Previous Code**:
```bash
# Find last good commit
git log --oneline | head -5

# Revert to previous commit
git revert <commit-hash>
git push origin main

# Vercel auto-deploys the revert
```

## Database Backup & Recovery

### Automated Backups
- PostgreSQL automatic backups (depends on provider)
- **Recommended**: Supabase, Railway, or AWS RDS with daily snapshots

### Manual Backup
```bash
# Backup production database
pg_dump $DATABASE_URL > vault_backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql $DATABASE_URL < vault_backup_20260317_120000.sql
```

### Test Backup Recovery
- [ ] Monthly test restore to staging database
- [ ] Verify data integrity
- [ ] Document recovery time

## Monitoring & Alerting

### Set Up Alerts in Vercel

1. **Go to** Project → Settings → Alerts
2. **Configure**:
   - [ ] Error rate > 1% → Slack/Email
   - [ ] Build failure → Slack/Email
   - [ ] High latency (p99 > 1s) → Slack/Email

### External Monitoring (Optional)

```javascript
// Add to lib/monitoring.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});

// Capture errors automatically
```

## Performance Optimization

### Image Optimization
- Use `next/image` for all images
- Automatic format conversion (WebP)
- Lazy loading enabled

### Code Splitting
- Already configured in Next.js
- Vercel shows bundle size in deployments

### Database Optimization
- [ ] Indexes created (see DATABASE_INTEGRATION_GUIDE.md)
- [ ] Connection pooling: max 20 connections
- [ ] Query caching: implement Redis (optional)

## CI/CD Pipeline

### Current Setup
```
git push main
    ↓
GitHub detects push
    ↓
Vercel webhook triggered
    ↓
Build: npm run build (Next.js)
    ↓
Test: npm run test (if configured)
    ↓
Deploy to preview URL
    ↓
Run E2E tests (if configured)
    ↓
Deploy to production
    ↓
Notify deployment status
```

### Enhance Pipeline (Future)
```yaml
# vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci"
}
```

## DNS & Domain Configuration

### Custom Domain Setup
1. **In Vercel**: Project → Settings → Domains
2. **Add domain**: `vaultcapital.com`
3. **Update DNS records**:
   ```
   CNAME vaultcapital.com → cname.vercel-dns.com
   ```
4. **Wait 24-48 hours** for DNS propagation

### SSL/TLS Certificate
- Automatically provisioned by Vercel (Let's Encrypt)
- Auto-renewed before expiry
- No action needed

## Cost Optimization

### Vercel Pricing (As of March 2026)
- **Free Plan**: Up to 100 deployments/month, limited to 6GB bandwidth
- **Pro Plan**: $20/month, unlimited deployments, 1TB bandwidth
- **Enterprise**: Custom pricing, dedicated support

### Database Costs
- **Supabase**: $25/month (generous free tier available)
- **Railway**: $5-20/month depending on usage
- **AWS RDS**: $15-50/month
- **Vercel Postgres**: Pay-as-you-go ($0.10/GB)

### Cost Reduction Tips
- [ ] Enable image optimization (saves bandwidth)
- [ ] Use CDN for static assets
- [ ] Implement pagination (reduces data transfer)
- [ ] Archive old data (reduces database size)

## Troubleshooting Deployments

### Build Fails
```bash
# Check build logs in Vercel Dashboard
# Common issues:
# - Missing environment variable
# - TypeScript error
# - Dependency conflict

# Test locally first
npm run build
npm run start  # Test production build
```

### Database Connection Error
```env
# Verify DATABASE_URL format
postgresql://user:pass@host:5432/dbname

# Test connection
node -e "console.log(process.env.DATABASE_URL)"
```

### Slow Performance
```bash
# Check Vercel Analytics
# - Function duration (should be < 500ms)
# - Database query time
# - Network latency

# Optimize:
# - Add database indexes
# - Implement caching
# - Split large API endpoints
```

---

## Deployment Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Staging** | 1 week | QA testing, user acceptance testing |
| **Canary** | 2-3 days | 10% traffic to production (if available) |
| **Full Rollout** | 1 day | 100% traffic to production |
| **Monitor** | 7 days | Monitor error rates, performance |

## Sign-Off

- [ ] Product Owner: Production deployment approved
- [ ] QA Lead: All tests passed
- [ ] DevOps/Platform: Infrastructure ready
- [ ] Security: No vulnerabilities identified
- [ ] Database: Backup strategy confirmed

---

## Support & Contacts

- **Vercel Support**: support@vercel.com
- **Database Provider Support**: Check your database service
- **Team Slack Channel**: #vault-deployment

