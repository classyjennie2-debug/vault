# Production Deployment Guide - Vault Capital

## ✅ Production Checklist

### Environment Variables (Vercel)
Set these in **Vercel Project Settings → Environment Variables**:

```
JWT_SECRET=<your-secure-random-string>
DATABASE_URL=postgresql://neondb_owner:npg_1VhyTCEveK7z@ep-jolly-unit-adcvgjou-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NEXT_PUBLIC_APP_URL=<your-production-domain>
NEXT_PUBLIC_TAWK_PROPERTY_ID=69b21503801efb1c38c6c489
CMC_API_KEY=99267b1933d34ba6bb9c8e8d693b4aea
```

### Deployment Steps

#### 1. Use Vercel CLI (Recommended)
```bash
npm install -g vercel
vercel login
vercel --prod
```

#### 2. Or Deploy via GitHub
- Push code to GitHub
- Go to [Vercel Dashboard](https://vercel.com)
- Click "New Project"
- Select GitHub repo "vault"
- Add environment variables (see above)
- Click "Deploy"

### Post-Deployment Checklist

✅ **Database Migrations**
- Neon database automatically creates tables via SQL initialization
- Verify tables exist in Neon dashboard

✅ **SSL/HTTPS**
- Vercel auto-enables HTTPS
- Check security headers in next.config.mjs

✅ **Performance**
- Run `npm run build` to test production build locally
- Check bundle size: `npm run build`

✅ **Monitoring**
- Enable Vercel Analytics (already included)
- Set up error tracking via Sentry (optional)

✅ **Security**
- Keep JWT_SECRET secure (never commit to git)
- Use environment-specific URLs
- Database credentials protected by Neon

✅ **Live Chat**
- Tawk.to widget loads automatically on production
- Mobile app notifications ready for live chat

### Key Production Features

| Feature | Status |
|---------|--------|
| User Authentication (JWT) | ✅ Ready |
| PostgreSQL Database (Neon) | ✅ Connected |
| Crypto Price API (CoinMarketCap) | ✅ Integrated |
| Live Chat (Tawk.to) | ✅ Configured |
| Admin Panel | ✅ Full Features |
| Dark Mode | ✅ Enabled |
| Analytics | ✅ Vercel Analytics |
| Security Headers | ✅ Configured |

### Troubleshooting

**"Database connection failed"**
- Verify DATABASE_URL in Vercel environment variables
- Check Neon connection string includes `?sslmode=require`
- Verify allowlist IP if using Neon firewall

**"JWT_SECRET not found"**
- Ensure JWT_SECRET is set in Vercel (not just .env.local)
- Restart deployment after adding variables

**"Tawk.to not loading"**
- Verify NEXT_PUBLIC_TAWK_PROPERTY_ID is set
- Check browser console for script load errors
- Widget loads in bottom-right corner (not always visible on mobile)

### Rollback
If issues occur:
```bash
vercel rollback
```

### Production Domain Setup
1. Buy domain (Namecheap, GoDaddy, etc.)
2. In Vercel: Project Settings → Domains
3. Add your domain and update nameservers
4. Update NEXT_PUBLIC_APP_URL to your domain

### Monitoring & Logs
- Vercel Dashboard: Real-time logs and metrics
- Deployments: History of all deployments
- Function Logs: API route performance

---

**Ready for Production!** 🚀
