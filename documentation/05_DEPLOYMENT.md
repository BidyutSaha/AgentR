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

5. **Redis** (REQUIRED for Background Jobs):
   - Upstash (recommended) or Railway or Redis Cloud
   - Free tier available
   - **Required for BullMQ job queue**

6. **Email Service**:
   - SendGrid or AWS SES or Mailgun
   - Free tier available (SendGrid: 100 emails/day)

7. **Domain** (optional):
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
# =============================================================================
# SERVER CONFIGURATION
# =============================================================================
NODE_ENV=production
PORT=5000

# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================
# From Supabase/Neon/Railway - MUST include sslmode=require
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# =============================================================================
# JWT CONFIGURATION (GENERATE NEW SECRETS FOR PRODUCTION!)
# =============================================================================
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_ACCESS_SECRET=<generate-64-char-hex-string>
JWT_REFRESH_SECRET=<generate-64-char-hex-string>
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# =============================================================================
# REDIS CONFIGURATION (REQUIRED FOR BACKGROUND JOBS)
# =============================================================================
# From Upstash/Railway/Redis Cloud
REDIS_HOST=<your-redis-host>
REDIS_PORT=6379
REDIS_PASSWORD=<your-redis-password>  # Required for production
# For Upstash, use TLS:
# REDIS_TLS=true

# =============================================================================
# LLM PROVIDER (OpenAI) - CRITICAL
# =============================================================================
OPENAI_API_KEY=sk-proj-your-production-key
LLM_MODEL=gpt-4o-mini
EMBEDDINGS_MODEL=text-embedding-3-small

# =============================================================================
# EMAIL CONFIGURATION (SMTP)
# =============================================================================
# SendGrid example:
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=<your-sendgrid-api-key>
EMAIL_FROM="Literature Review System <noreply@yourdomain.com>"

# =============================================================================
# FRONTEND CONFIGURATION
# =============================================================================
FRONTEND_URL=https://your-app.vercel.app

# =============================================================================
# SECURITY SETTINGS
# =============================================================================
BCRYPT_ROUNDS=12
ADMIN_EMAILS=admin@yourdomain.com

# =============================================================================
# EXTERNAL APIs (Optional)
# =============================================================================
SEMANTIC_SCHOLAR_API_KEY=  # Optional

# =============================================================================
# APPLICATION SETTINGS
# =============================================================================
DEFAULT_TIME_WINDOW_YEARS=5
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

### Database Seeding (REQUIRED)

After running migrations, you MUST seed the database with initial configuration:

```bash
# Seed database with default values
DATABASE_URL="your-db-url" npx prisma db seed
```

**What gets seeded**:
- Default AI credits (100 credits for new users)
- Credits multiplier (1000 credits = $1 USD)
- LLM model pricing (GPT-4o, GPT-4o-mini)

**Verify seeding**:
```sql
-- Check default credits
SELECT * FROM default_credits_history WHERE is_active = true;

-- Check credits multiplier
SELECT * FROM credits_multiplier_history WHERE is_active = true;

-- Check LLM pricing
SELECT * FROM llm_model_pricing WHERE is_latest = true;
```

⚠️ **CRITICAL**: Without seeding, user registration will fail!

---

## Redis Setup (REQUIRED)

Redis is **REQUIRED** for background job processing (BullMQ). The system uses Redis for:
- Project initialization jobs (Stage 1 & 2)
- Paper scoring jobs (Stage 3)
- Email sending jobs

### Option 1: Upstash (Recommended - Free Tier)

1. **Create account**: https://upstash.com
2. **Create Redis database**:
   - Choose region closest to your backend
   - Select "Free" plan
3. **Get connection details**:
   - Copy `UPSTASH_REDIS_REST_URL` or connection string
   - Note: Upstash uses TLS by default

4. **Configure environment**:
   ```bash
   REDIS_HOST=your-redis-host.upstash.io
   REDIS_PORT=6379
   REDIS_PASSWORD=your-redis-password
   REDIS_TLS=true  # For Upstash
   ```

### Option 2: Railway

1. **Add Redis service** to your Railway project
2. **Get connection string** from service variables
3. **Configure environment** (Railway auto-injects `REDIS_URL`)

### Option 3: Redis Cloud

1. **Create account**: https://redis.com/try-free
2. **Create database**
3. **Get connection details**
4. **Configure environment**

### Verify Redis Connection

```bash
# Test Redis connection
redis-cli -h <host> -p <port> -a <password> ping
# Expected: PONG
```

---

## Worker Processes (REQUIRED)

The system requires **background workers** to process jobs. You MUST deploy workers separately or alongside your API server.

### Worker Types

1. **Project Worker** (`src/workers/project.worker.ts`):
   - Processes Stage 1 (Intent Decomposition)
   - Processes Stage 2 (Query Generation)

2. **Paper Worker** (`src/workers/paper.worker.ts`):
   - Processes Stage 3 (Paper Scoring)

3. **Email Worker** (`src/workers/email.worker.ts`):
   - Sends verification emails
   - Sends password reset emails

### Deployment Options

#### Option A: Same Process (Development/Small Scale)

Workers run in the same process as the API server.

**Already configured** in `src/server.ts` - workers start automatically.

#### Option B: Separate Processes (Production/Scale)

Deploy workers as separate services for better scalability.

**Railway Example**:
```bash
# Create separate service for workers
railway service create workers

# Set environment variables (same as API)
railway variables set DATABASE_URL=...
railway variables set REDIS_HOST=...
railway variables set OPENAI_API_KEY=...

# Deploy with custom start command
railway up --service workers --start "node dist/workers/index.js"
```

**Render Example**:
- Create new "Background Worker" service
- Build Command: `cd literature-review-backend && npm install && npx prisma generate && npm run build`
- Start Command: `cd literature-review-backend && node dist/workers/index.js`
- Add all environment variables

### Monitor Workers

Check worker logs to ensure they're processing jobs:

```bash
# Railway
railway logs --service workers

# Render
# Check logs in dashboard

# Look for:
# "Project worker started"
# "Paper worker started"
# "Email worker started"
# "Job completed: ..."
```

### Worker Health Check

Workers should log:
- Startup confirmation
- Job processing
- Errors (if any)

**No jobs processing?** Check:
1. Redis connection
2. Environment variables
3. Database connection
4. OpenAI API key



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
- **Redis**: Upstash free tier (10,000 commands/day)
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
- **Redis**: Upstash Pay-as-you-go (~$5/month) or Railway ($5/month)
- **Frontend**: Vercel Pro ($20/month)
- **OpenAI API**: Pay-as-you-go (~$50-100/month)
- **Email**: SendGrid Essentials ($15/month for 50k emails)
- **Domain**: $10/year
- **Total**: ~$125-175/month

**OpenAI Usage Estimate** (Small Scale):
- ~1,000 API calls/day (30k/month)
- Average 500 tokens input, 300 tokens output per call
- GPT-4o-mini pricing
- Estimated: ~$50-100/month

---

### Production (Medium Scale)

- **Backend**: Railway Team ($20/month)
- **Database**: Supabase Pro ($25/month)
- **Redis**: Upstash Pro ($10/month) or Railway ($10/month)
- **Frontend**: Vercel Pro ($20/month)
- **OpenAI API**: Pay-as-you-go (~$200-500/month)
- **Email**: SendGrid Pro ($90/month for 100k emails)
- **Monitoring**: Sentry Team ($26/month)
- **Total**: ~$395-700/month

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

## Production Deployment Checklist

Use this checklist before going live:

### 1. Database ✅

- [ ] PostgreSQL database created (Supabase/Neon/Railway)
- [ ] SSL mode enabled (`?sslmode=require` in connection string)
- [ ] Migrations deployed (`npx prisma migrate deploy`)
- [ ] **Database seeded** (`npx prisma db seed`) - CRITICAL!
- [ ] Verified seed data:
  - [ ] Default credits (100) exists
  - [ ] Credits multiplier (1000) exists
  - [ ] LLM pricing (GPT-4o, GPT-4o-mini) exists
- [ ] Backup strategy configured
- [ ] Connection pooling enabled (if needed)

### 2. Redis ✅

- [ ] Redis instance created (Upstash/Railway/Redis Cloud)
- [ ] Connection tested (`redis-cli ping`)
- [ ] Environment variables set:
  - [ ] `REDIS_HOST`
  - [ ] `REDIS_PORT`
  - [ ] `REDIS_PASSWORD`
  - [ ] `REDIS_TLS` (if using Upstash)
- [ ] Redis accessible from backend

### 3. Environment Variables ✅

- [ ] All required variables set:
  - [ ] `NODE_ENV=production`
  - [ ] `DATABASE_URL` (with SSL)
  - [ ] `JWT_ACCESS_SECRET` (64-char hex)
  - [ ] `JWT_REFRESH_SECRET` (64-char hex)
  - [ ] `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
  - [ ] `OPENAI_API_KEY`
  - [ ] `LLM_MODEL=gpt-4o-mini`
  - [ ] `EMBEDDINGS_MODEL=text-embedding-3-small`
  - [ ] `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`
  - [ ] `EMAIL_FROM`
  - [ ] `FRONTEND_URL`
  - [ ] `BCRYPT_ROUNDS=12`
  - [ ] `ADMIN_EMAILS`
  - [ ] `LOG_LEVEL=info`
- [ ] Secrets are strong and unique (not from `.env.example`)
- [ ] No sensitive data in logs

### 4. Backend Deployment ✅

- [ ] Code built successfully (`npm run build`)
- [ ] Prisma client generated (`npx prisma generate`)
- [ ] Backend deployed (Railway/Render/Heroku)
- [ ] Health check passes: `GET /v1/health`
- [ ] API accessible via HTTPS
- [ ] CORS configured for frontend domain
- [ ] Rate limiting enabled

### 5. Worker Processes ✅

- [ ] Workers deployed (same process or separate service)
- [ ] Worker logs show startup:
  - [ ] "Project worker started"
  - [ ] "Paper worker started"
  - [ ] "Email worker started"
- [ ] Workers can connect to:
  - [ ] Database
  - [ ] Redis
  - [ ] OpenAI API
- [ ] Test job processing:
  - [ ] Create project → Stage 1 & 2 jobs complete
  - [ ] Add paper → Stage 3 job completes
  - [ ] Register user → Verification email sent

### 6. OpenAI API ✅

- [ ] API key valid and has credits
- [ ] Model access confirmed (gpt-4o-mini)
- [ ] Spending limits set (optional but recommended)
- [ ] Usage monitoring enabled
- [ ] Test LLM call succeeds

### 7. Email Service ✅

- [ ] SMTP credentials configured
- [ ] Test email sent successfully
- [ ] Verification emails delivered
- [ ] Password reset emails delivered
- [ ] Email sender domain verified (if required)
- [ ] SPF/DKIM configured (optional, improves deliverability)

### 8. Frontend Deployment ✅

- [ ] Frontend deployed (Vercel/Netlify)
- [ ] Environment variable set: `VITE_API_URL`
- [ ] Frontend can reach backend API
- [ ] HTTPS enabled
- [ ] Test complete user flow:
  - [ ] Registration
  - [ ] Email verification
  - [ ] Login
  - [ ] Create project
  - [ ] Add paper

### 9. Security ✅

- [ ] All secrets are production-grade (not defaults)
- [ ] JWT secrets are 64+ characters
- [ ] Database uses SSL
- [ ] HTTPS enforced everywhere
- [ ] CORS restricted to frontend domain only
- [ ] Rate limiting enabled
- [ ] Email verification required
- [ ] Password requirements enforced (8+ chars, complexity)
- [ ] bcrypt rounds = 12
- [ ] No sensitive data in error messages
- [ ] No sensitive data in logs

### 10. Monitoring ✅

- [ ] Uptime monitoring configured (UptimeRobot)
- [ ] Error tracking configured (Sentry - optional)
- [ ] Database metrics monitored
- [ ] OpenAI usage tracked
- [ ] Worker logs accessible
- [ ] Health check endpoint monitored

### 11. Testing ✅

- [ ] Registration flow works end-to-end
- [ ] Email verification works
- [ ] Login works
- [ ] Token refresh works
- [ ] Password reset works
- [ ] Project creation works (Stage 1 & 2 complete)
- [ ] Paper addition works (Stage 3 completes)
- [ ] Bulk upload works
- [ ] Project export works
- [ ] Credits system works:
  - [ ] New users get default credits
  - [ ] Credits deducted on LLM usage
  - [ ] Admin can recharge credits
- [ ] Job retry works
- [ ] Failed job recovery works

### 12. Performance ✅

- [ ] API response time < 1 second
- [ ] Database queries optimized
- [ ] Indexes created on foreign keys
- [ ] Connection pooling enabled (if needed)
- [ ] Gzip compression enabled

### 13. Backup & Recovery ✅

- [ ] Database backup strategy in place
- [ ] Backup tested (can restore)
- [ ] Rollback procedure documented
- [ ] Disaster recovery plan ready

### 14. Documentation ✅

- [ ] API documentation up to date
- [ ] Environment variables documented
- [ ] Deployment steps documented
- [ ] Troubleshooting guide available
- [ ] Admin procedures documented

---

## Post-Deployment Verification

After deployment, verify everything works:

```bash
# 1. Health check
curl https://your-backend.railway.app/v1/health

# 2. Register test user
curl -X POST https://your-backend.railway.app/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "firstName": "Test",
    "lastName": "User"
  }'

# 3. Check email received
# 4. Verify email
# 5. Login
# 6. Create project
# 7. Add paper
# 8. Check job processing in worker logs
```

**All checks pass?** 🎉 **You're live!**

**Issues?** See [07_TROUBLESHOOTING.md](./07_TROUBLESHOOTING.md)



## Additional Resources

- **Setup Guide**: [01_SETUP.md](./01_SETUP.md)
- **API Documentation**: [03_API.md](./03_API.md)
- **Database Schema**: [04_DATABASE.md](./04_DATABASE.md)
- **Troubleshooting**: [07_TROUBLESHOOTING.md](./07_TROUBLESHOOTING.md)

---

**For deployment issues, see [07_TROUBLESHOOTING.md](./07_TROUBLESHOOTING.md) or create a GitHub issue.**
