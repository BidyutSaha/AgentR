# Deployment Guide

Guide for deploying the Literature Review System to production.

**Status**: Planning phase (not yet deployed)

---

## Table of Contents

1. [Deployment Architecture](#deployment-architecture)
2. [Prerequisites](#prerequisites)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Backend Deployment](#backend-deployment)
6. [Frontend Deployment](#frontend-deployment)
7. [Post-Deployment](#post-deployment)
8. [Monitoring](#monitoring)
9. [Backup & Recovery](#backup--recovery)

---

## Deployment Architecture

### Recommended Stack

```
┌─────────────────────────────────────────────────────────────┐
│                         USERS                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      CDN / Cloudflare                       │
│                    (Static Assets, DDoS)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
┌───────────────────────────┐  ┌───────────────────────────┐
│   Frontend (Vercel/       │  │   Backend (Railway/       │
│   Netlify)                │  │   Render/Heroku)          │
│                           │  │                           │
│  - React build            │  │  - Node.js app            │
│  - Static hosting         │  │  - Express server         │
│  - Auto SSL               │  │  - Auto SSL               │
└───────────────────────────┘  └───────────────────────────┘
                                              │
                                    ┌─────────┼─────────┐
                                    │         │         │
                                    ▼         ▼         ▼
                        ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
                        │  PostgreSQL   │ │  OpenAI API   │ │ Email Service │
                        │  (Supabase/   │ │               │ │ (SendGrid/    │
                        │   Neon/       │ │ - GPT-4o      │ │  AWS SES)     │
                        │   Railway)    │ │ - GPT-4o-mini │ │               │
                        │               │ │ - Embeddings  │ │ - Verification│
                        │ - Users       │ │               │ │ - Password    │
                        │ - Tokens      │ │ **CRITICAL**  │ │   Reset       │
                        │ - Projects    │ │ **SERVICE**   │ │ - Notifs      │
                        │ - Papers      │ │               │ │               │
                        └───────────────┘ └───────────────┘ └───────────────┘
```

---

## Prerequisites

### Required Accounts

1. **Backend Hosting**:
   - Railway (recommended) or Render or Heroku
   - Free tier available

2. **Database**:
   - Supabase (recommended) or Neon or Railway
   - Free tier available

3. **Frontend Hosting**:
   - Vercel (recommended) or Netlify
   - Free tier available

4. **OpenAI API** (CRITICAL):
   - OpenAI Platform account
   - API key with credits
   - Pay-as-you-go pricing
   - **Required for all LLM functionality**

5. **Email Service**:
   - SendGrid or AWS SES or Mailgun
   - Free tier available (SendGrid: 100 emails/day)

6. **Domain** (optional):
   - Namecheap, Google Domains, etc.
   - ~$10/year

### Required Tools

- Git
- Node.js 18+
- npm or yarn
- PostgreSQL client (for local testing)

---

## Environment Configuration

### Production Environment Variables

Create `.env.production` file:

```bash
# Server Configuration
NODE_ENV=production
PORT=5000
API_VERSION=v1

# Database (from Supabase/Neon/Railway)
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# JWT Secrets (generate new ones for production!)
JWT_ACCESS_SECRET=<generate-32-char-random-string>
JWT_REFRESH_SECRET=<generate-32-char-random-string>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# OpenAI
OPENAI_API_KEY=sk-your-production-key
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.7

# Email (SendGrid example)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=<your-sendgrid-api-key>
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Literature Review System

# Frontend URL (your deployed frontend)
FRONTEND_URL=https://your-app.vercel.app

# CORS
CORS_ORIGIN=https://your-app.vercel.app

# Logging
LOG_LEVEL=info
```

### Generate Secrets

```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Database Setup

### Option 1: Supabase (Recommended)

1. **Create account**: https://supabase.com
2. **Create new project**
3. **Get connection string**:
   - Go to Project Settings → Database
   - Copy "Connection string" (URI mode)
   - Add `?sslmode=require` at the end

4. **Run migrations**:
   ```bash
   DATABASE_URL="your-supabase-url" npx prisma migrate deploy
   ```

### Option 2: Neon

1. **Create account**: https://neon.tech
2. **Create new project**
3. **Get connection string**:
   - Copy from project dashboard
   
4. **Run migrations**:
   ```bash
   DATABASE_URL="your-neon-url" npx prisma migrate deploy
   ```

### Option 3: Railway

1. **Create account**: https://railway.app
2. **Create PostgreSQL service**
3. **Get connection string**:
   - Copy from service variables
   
4. **Run migrations**:
   ```bash
   DATABASE_URL="your-railway-url" npx prisma migrate deploy
   ```

---

## Backend Deployment

### Option 1: Railway (Recommended)

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login**:
   ```bash
   railway login
   ```

3. **Initialize project**:
   ```bash
   cd literature-review-backend
   railway init
   ```

4. **Add environment variables**:
   ```bash
   railway variables set NODE_ENV=production
   railway variables set DATABASE_URL=<your-db-url>
   railway variables set JWT_ACCESS_SECRET=<your-secret>
   # ... add all other variables
   ```

5. **Deploy**:
   ```bash
   railway up
   ```

6. **Get URL**:
   ```bash
   railway domain
   ```

### Option 2: Render

1. **Create account**: https://render.com
2. **Create new Web Service**
3. **Connect GitHub repository**
4. **Configure**:
   - Build Command: `cd literature-review-backend && npm install && npx prisma generate && npm run build`
   - Start Command: `cd literature-review-backend && npm start`
   - Add environment variables in dashboard

5. **Deploy**: Automatic on git push

### Option 3: Heroku

1. **Install Heroku CLI**:
   ```bash
   npm install -g heroku
   ```

2. **Login**:
   ```bash
   heroku login
   ```

3. **Create app**:
   ```bash
   heroku create your-app-name
   ```

4. **Add PostgreSQL**:
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

5. **Set environment variables**:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_ACCESS_SECRET=<your-secret>
   # ... add all other variables
   ```

6. **Deploy**:
   ```bash
   git push heroku main
   ```

---

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   cd literature-review-frontend
   vercel
   ```

4. **Set environment variables**:
   ```bash
   vercel env add VITE_API_URL production
   # Enter your backend URL: https://your-backend.railway.app
   ```

5. **Redeploy**:
   ```bash
   vercel --prod
   ```

### Option 2: Netlify

1. **Create account**: https://netlify.com
2. **Connect GitHub repository**
3. **Configure**:
   - Build Command: `cd literature-review-frontend && npm run build`
   - Publish Directory: `literature-review-frontend/dist`
   - Add environment variable: `VITE_API_URL=https://your-backend.railway.app`

4. **Deploy**: Automatic on git push

---

## Post-Deployment

### 1. Verify Health Check

```bash
curl https://your-backend.railway.app/v1/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "...",
    "environment": "production"
  }
}
```

### 2. Test Registration

```bash
curl -X POST https://your-backend.railway.app/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### 3. Check Email Delivery

- Register a test account
- Verify verification email is received
- Click verification link
- Verify account is activated

### 4. Test Frontend

- Open frontend URL
- Test registration flow
- Test login flow
- Test creating a project

---

## Monitoring

### Application Monitoring

**Recommended**: Sentry for error tracking

1. **Create Sentry account**: https://sentry.io
2. **Create new project**
3. **Install SDK**:
   ```bash
   npm install @sentry/node
   ```

4. **Configure** in `src/app.ts`:
   ```typescript
   import * as Sentry from '@sentry/node';
   
   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV
   });
   ```

### Database Monitoring

- **Supabase**: Built-in dashboard
- **Neon**: Built-in dashboard
- **Railway**: Built-in metrics

### Uptime Monitoring

**Recommended**: UptimeRobot (free)

1. **Create account**: https://uptimerobot.com
2. **Add monitor**:
   - Type: HTTP(s)
   - URL: `https://your-backend.railway.app/v1/health`
   - Interval: 5 minutes

---

## Backup & Recovery

### Database Backups

**Automated** (recommended):
- **Supabase**: Automatic daily backups (paid plan)
- **Neon**: Automatic backups
- **Railway**: Manual backups

**Manual Backup**:
```bash
pg_dump -h <host> -U <user> -d <database> > backup_$(date +%Y%m%d).sql
```

### Restore from Backup

```bash
psql -h <host> -U <user> -d <database> < backup_20251231.sql
```

### Backup Schedule

- **Daily**: Automated database backups
- **Weekly**: Full system backup (code + database)
- **Before deployment**: Manual backup

---

## Security Checklist

Before going to production:

- [ ] All environment variables are set correctly
- [ ] JWT secrets are strong and unique
- [ ] Database uses SSL connection
- [ ] CORS is configured for production domain only
- [ ] Rate limiting is enabled
- [ ] HTTPS is enforced
- [ ] Email verification is required
- [ ] Password requirements are enforced
- [ ] Sensitive data is not logged
- [ ] Error messages don't reveal system details

---

## Performance Optimization

### Backend

- [ ] Enable gzip compression
- [ ] Implement caching (Redis - future)
- [ ] Optimize database queries
- [ ] Add database indexes
- [ ] Enable connection pooling

### Frontend

- [ ] Enable code splitting
- [ ] Optimize images
- [ ] Enable lazy loading
- [ ] Minimize bundle size
- [ ] Use CDN for static assets

---

## Scaling Considerations

### When to Scale

Monitor these metrics:
- **Response time** > 1 second
- **CPU usage** > 80%
- **Memory usage** > 80%
- **Database connections** > 80% of limit

### Horizontal Scaling

**Backend**:
- Deploy multiple instances
- Use load balancer
- Ensure stateless design (already done with JWT)

**Database**:
- Read replicas for read-heavy workloads
- Connection pooling (PgBouncer)

---

## Rollback Procedure

If deployment fails:

1. **Revert to previous version**:
   ```bash
   # Railway
   railway rollback
   
   # Vercel
   vercel rollback
   ```

2. **Check logs**:
   ```bash
   # Railway
   railway logs
   
   # Vercel
   vercel logs
   ```

3. **Fix issues** and redeploy

---

## Cost Estimation

### Free Tier (Development/Testing)

- **Backend**: Railway/Render free tier
- **Database**: Supabase/Neon free tier
- **Frontend**: Vercel/Netlify free tier
- **OpenAI API**: Pay-as-you-go (~$5-10/month for testing)
- **Email**: SendGrid free tier (100 emails/day)
- **Total**: ~$5-10/month

**OpenAI Usage Estimate** (Testing):
- ~100 API calls/day
- GPT-4o-mini: $0.15 per 1M input tokens, $0.60 per 1M output tokens
- Estimated: ~$5-10/month

---

### Production (Small Scale)

- **Backend**: Railway Hobby ($5/month)
- **Database**: Supabase Pro ($25/month)
- **Frontend**: Vercel Pro ($20/month)
- **OpenAI API**: Pay-as-you-go (~$50-100/month)
- **Email**: SendGrid Essentials ($15/month for 50k emails)
- **Domain**: $10/year
- **Total**: ~$115-165/month

**OpenAI Usage Estimate** (Small Scale):
- ~1,000 API calls/day (30k/month)
- Average 500 tokens input, 300 tokens output per call
- GPT-4o-mini pricing
- Estimated: ~$50-100/month

---

### Production (Medium Scale)

- **Backend**: Railway Team ($20/month)
- **Database**: Supabase Pro ($25/month)
- **Frontend**: Vercel Pro ($20/month)
- **OpenAI API**: Pay-as-you-go (~$200-500/month)
- **Email**: SendGrid Pro ($90/month for 100k emails)
- **Monitoring**: Sentry Team ($26/month)
- **Total**: ~$380-680/month

**OpenAI Usage Estimate** (Medium Scale):
- ~5,000 API calls/day (150k/month)
- Average 500 tokens input, 300 tokens output per call
- GPT-4o-mini pricing
- Estimated: ~$200-500/month

---

### OpenAI Cost Optimization Tips

1. **Use GPT-4o-mini** instead of GPT-4o (10x cheaper)
2. **Implement caching** for repeated queries
3. **Optimize prompts** to reduce token usage
4. **Set max_tokens** limits to control costs
5. **Monitor usage** via OpenAI dashboard
6. **Set spending limits** to avoid surprises

**Current Model Pricing** (as of 2025-12-31):
- **GPT-4o-mini**: $0.15/1M input tokens, $0.60/1M output tokens
- **GPT-4o**: $2.50/1M input tokens, $10.00/1M output tokens

**For latest pricing**: https://openai.com/api/pricing/

---

## Additional Resources

- **Setup Guide**: [01_SETUP.md](./01_SETUP.md)
- **API Documentation**: [03_API.md](./03_API.md)
- **Database Schema**: [04_DATABASE.md](./04_DATABASE.md)
- **Troubleshooting**: [07_TROUBLESHOOTING.md](./07_TROUBLESHOOTING.md)

---

**For deployment issues, see [07_TROUBLESHOOTING.md](./07_TROUBLESHOOTING.md) or create a GitHub issue.**
