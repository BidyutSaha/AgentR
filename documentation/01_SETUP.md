# Setup Guide

Complete installation and configuration guide for the Literature Review System.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Database Setup](#database-setup)
4. [Environment Configuration](#environment-configuration)
5. [Running the Application](#running-the-application)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **PostgreSQL**: v14.x or higher
- **Redis**: v6.x or higher (Required for Background Jobs)
- **Git**: Latest version

### Required Accounts

- **OpenAI API Key**: For LLM functionality
- **SMTP Email Account**: For email verification (Gmail recommended)

### Recommended Tools

- **DBeaver**: Database management (see [DBEAVER_SETUP.md](./DBEAVER_SETUP.md))
- **Postman**: API testing
- **VS Code**: Code editor

---

## Backend Setup

### 1. Clone Repository

```bash
git clone https://github.com/BidyutSaha/AgentR.git
cd "Paper Agent"
```

### 2. Install Dependencies

```bash
cd literature-review-backend
npm install
```

This will install all required packages including:

- Prisma (ORM)
- TypeScript
- Zod (validation)
- JWT libraries
- OpenAI SDK
- BullMQ (Background Jobs)
- And more...

---

## Redis Setup (REQUIRED)

The system **REQUIRES** Redis for managing background job queues (emailing, scoring, etc.). The application will not start without a Redis connection.

### Option A: Using Docker (Recommended)

1. Ensure Docker Desktop is installed and running.
2. In the `literature-review-backend` directory, run:
   ```bash
   docker-compose up -d
   ```

### Option B: Direct Installation (Windows)

1. **WSL2 (Recommended)**: Install Redis inside your WSL distribution.
   ```bash
   sudo apt-get install redis-server
   sudo service redis-server start
   ```
2. **Memurai**: Download developer edition from [memurai.com](https://www.memurai.com/get-memurai).
3. **Microsoft Archive**: (Not recommended for production) Download .msi from [GitHub](https://github.com/microsoftarchive/redis/releases).

---

## Database Setup

### 1. Install PostgreSQL

**Windows**:

```bash
# Download from https://www.postgresql.org/download/windows/
# Run installer and follow prompts
# Default port: 5432
```

**Mac** (using Homebrew):

```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux** (Ubuntu/Debian):

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE literature_review;

# Create user (optional but recommended)
CREATE USER lit_review_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE literature_review TO lit_review_user;

# Exit
\q
```

### 3. Run Prisma Migrations

```bash
cd literature-review-backend

# Generate Prisma Client
npx prisma generate

# Run migrations to create tables
npx prisma migrate dev --name init

# Verify tables were created
npx prisma studio
```

This will create the following tables:

- `users` - User accounts
- `user_projects` - Research projects
- `candidate_papers` - Research papers
- `background_jobs` - Job queue persistence
- `llm_usage_logs` - Cost tracking
- `verification_tokens` - Email verification tokens
- `password_reset_tokens` - Password reset tokens

### 4. Seed Database (MANDATORY)

You MUST seed the pricing data for LLM cost calculations to work.

```bash
node scripts/seed-pricing.js
```

_Creates pricing entries for GPT-4o, GPT-4o-mini, and other models._

---

## Environment Configuration

### 1. Copy Environment Template

```bash
cd literature-review-backend
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` file with your actual values:

```bash
# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/literature_review?schema=public"

# Example:
# DATABASE_URL="postgresql://lit_review_user:your_secure_password@localhost:5432/literature_review?schema=public"

# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-access-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Generate secrets using:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenAI Configuration
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.7

# Email Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Literature Review System

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Redis Configuration (Required)
REDIS_HOST=localhost
REDIS_PORT=6379

# Logging
LOG_LEVEL=info
```

### 3. Gmail App Password Setup

If using Gmail for SMTP:

1. Go to Google Account Settings
2. Enable 2-Factor Authentication
3. Go to Security → App Passwords
4. Generate app password for "Mail"
5. Use this password in `SMTP_PASS`

---

## Running the Application

### Development Mode

```bash
cd literature-review-backend
npm run dev
```

Expected output:

```
🚀 Server running on http://localhost:5000
📝 Environment: development
🔍 Health check: http://localhost:5000/v1/health
✅ Database connected
```

### Production Mode

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### Watch Mode (Auto-restart on changes)

```bash
npm run dev
```

---

## Verification

### 1. Health Check

**Browser**: Open http://localhost:5000/v1/health

**curl**:

```bash
curl http://localhost:5000/v1/health
```

**Expected Response**:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2025-12-31T12:00:00.000Z",
    "environment": "development",
    "version": "1.0.0"
  }
}
```

### 2. Database Connection

```bash
# Open Prisma Studio
npx prisma studio
```

Should open http://localhost:5555 showing your database tables.

### 3. Test Registration

**Using curl**:

```bash
curl -X POST http://localhost:5000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "firstName": "Test",
    "lastName": "User"
  }'
```

**Expected Response**:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "test@example.com",
      "firstName": "Test",
      "lastName": "User"
    },
    "message": "Registration successful. Please check your email to verify your account."
  }
}
```

### 4. Check Email

You should receive a verification email at the registered address.

---

## Troubleshooting

### Database Connection Issues

**Error**: `Can't reach database server`

**Solutions**:

1. Verify PostgreSQL is running:

   ```bash
   # Windows
   pg_ctl status

   # Mac/Linux
   brew services list  # Mac
   sudo systemctl status postgresql  # Linux
   ```

2. Check DATABASE_URL format:

   ```
   postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
   ```

3. Test connection:
   ```bash
   psql -U your_username -d literature_review
   ```

### Port Already in Use

**Error**: `Port 5000 is already in use`

**Solutions**:

1. Change port in `.env`:

   ```bash
   PORT=5001
   ```

2. Or kill process using port 5000:

   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F

   # Mac/Linux
   lsof -ti:5000 | xargs kill -9
   ```

### OpenAI API Issues

**Error**: `Invalid API key`

**Solutions**:

1. Verify API key is correct
2. Check OpenAI account has credits
3. Ensure no extra spaces in `.env` file

### Email Not Sending

**Error**: `SMTP connection failed`

**Solutions**:

1. Verify SMTP credentials
2. Check Gmail app password (not regular password)
3. Verify SMTP_PORT (587 for TLS, 465 for SSL)
4. Check firewall settings

### Prisma Migration Issues

**Error**: `Migration failed`

**Solutions**:

1. Reset database:

   ```bash
   npx prisma migrate reset
   ```

2. Generate Prisma Client:

   ```bash
   npx prisma generate
   ```

3. Run migrations:
   ```bash
   npx prisma migrate dev
   ```

---

## Next Steps

After successful setup:

1. ✅ Read [API Documentation](./03_API.md)
2. ✅ Review [Database Schema](./04_DATABASE.md)
3. ✅ Check [Testing Guide](./08_TESTING.md)
4. ✅ See [Project Status](./00_PROJECT_STATUS.md) for current progress

---

## Additional Resources

- **DBeaver Setup**: See [DBEAVER_SETUP.md](./DBEAVER_SETUP.md)
- **Environment Variables**: See `.env.example` for all options
- **Troubleshooting**: See [07_TROUBLESHOOTING.md](./07_TROUBLESHOOTING.md)
- **Project Rules**: See [../rules.md](../rules.md)

---

**For issues not covered here, see [07_TROUBLESHOOTING.md](./07_TROUBLESHOOTING.md) or create an issue on GitHub.**
