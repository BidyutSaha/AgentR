# Troubleshooting Guide

Common issues and solutions for the Literature Review System.

---

## Table of Contents

1. [Database Issues](#database-issues)
2. [Authentication Issues](#authentication-issues)
3. [Email Issues](#email-issues)
4. [API Issues](#api-issues)
5. [Job Failures (Background Workers)](#job-failures-background-workers)
6. [OpenAI Issues](#openai-issues)
7. [Development Issues](#development-issues)

---

## Database Issues

### Error: Can't reach database server

**Symptoms**:
```
Error: Can't reach database server at `localhost:5432`
```

**Solutions**:

1. **Check PostgreSQL is running**:
   ```bash
   # Windows
   pg_ctl status
   
   # Mac
   brew services list
   
   # Linux
   sudo systemctl status postgresql
   ```

2. **Start PostgreSQL**:
   ```bash
   # Windows
   pg_ctl start
   
   # Mac
   brew services start postgresql@14
   
   # Linux
   sudo systemctl start postgresql
   ```

3. **Check DATABASE_URL format**:
   ```
   postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
   ```

4. **Test connection**:
   ```bash
   psql -U your_username -d literature_review
   ```

---

### Error: Prisma migration failed

**Symptoms**:
```
Error: P3009: migrate found failed migrations
```

**Solutions**:

1. **Reset database** (⚠️ Deletes all data):
   ```bash
   npx prisma migrate reset
   ```

2. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

3. **Run migrations**:
   ```bash
   npx prisma migrate dev
   ```

---

## Authentication Issues

### Error: Invalid credentials

**Symptoms**:
- Login fails with correct password
- "Invalid credentials" error

**Solutions**:

1. **Check email is verified**:
   ```sql
   SELECT email, is_verified FROM users WHERE email = 'your@email.com';
   ```

2. **Verify account is active**:
   ```sql
   SELECT email, is_active FROM users WHERE email = 'your@email.com';
   ```

3. **Reset password**:
   - Use forgot password flow
   - Or manually update in database (for testing only)

---

### Error: Email not verified

**Symptoms**:
```json
{
  "error": {
    "code": "EMAIL_NOT_VERIFIED",
    "message": "Please verify your email before logging in"
  }
}
```

**Solutions**:

1. **Resend verification email**:
   ```bash
   POST /v1/auth/resend-verification
   {
     "email": "your@email.com"
   }
   ```

2. **Manually verify** (for testing only):
   ```sql
   UPDATE users SET is_verified = true WHERE email = 'your@email.com';
   ```

---

### Error: Token expired

**Symptoms**:
```json
{
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "Access token has expired"
  }
}
```

**Solutions**:

1. **Use refresh token**:
   ```bash
   POST /v1/auth/refresh
   {
     "refreshToken": "your_refresh_token"
   }
   ```

2. **Login again** if refresh token also expired

---

## Email Issues

### Error: SMTP connection failed

**Symptoms**:
```
Error: Connection timeout
Error: Invalid login
```

**Solutions**:

1. **Check SMTP credentials** in `.env`:
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password  # NOT your Gmail password!
   ```

2. **Generate Gmail App Password**:
   - Go to Google Account → Security
   - Enable 2-Factor Authentication
   - Generate App Password for "Mail"
   - Use this password in `SMTP_PASS`

3. **Check firewall settings**:
   - Ensure port 587 is not blocked
   - Try port 465 with `SMTP_SECURE=true`

4. **Test SMTP connection**:
   ```bash
   telnet smtp.gmail.com 587
   ```

---

### Emails not being received

**Symptoms**:
- No verification email received
- No password reset email received

**Solutions**:

1. **Check spam folder**

2. **Verify email was sent** (check server logs):
   ```bash
   npm run dev
   # Look for "Email sent" in logs
   ```

3. **Check `EMAIL_FROM` matches `SMTP_USER`**:
   ```bash
   EMAIL_FROM=your-email@gmail.com
   SMTP_USER=your-email@gmail.com
   ```

4. **Test with different email provider**:
   - Try sending to different email address
   - Try different email service (Gmail, Outlook, etc.)

---

## API Issues

### Error: Port already in use

**Symptoms**:
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions**:

1. **Change port** in `.env`:
   ```bash
   PORT=5001
   ```

2. **Kill process using port**:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -ti:5000 | xargs kill -9
   ```

---

### Error: CORS error

**Symptoms**:
```
Access to fetch at 'http://localhost:5000' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Solutions**:

1. **Check `CORS_ORIGIN` in `.env`**:
   ```bash
   CORS_ORIGIN=http://localhost:3000
   ```

2. **Add multiple origins** (comma-separated):
   ```bash
   CORS_ORIGIN=http://localhost:3000,http://localhost:5173
   ```

3. **Restart server** after changing `.env`

---

### Error: 401 Unauthorized

**Symptoms**:
- Protected endpoints return 401
- "Unauthorized" error

**Solutions**:

1. **Check Authorization header**:
   ```bash
   Authorization: Bearer <your_access_token>
   ```

2. **Verify token hasn't expired**:
   - Access tokens expire in 15 minutes
   - Use refresh token to get new access token

3. **Check JWT secrets** in `.env`:
   ```bash
   JWT_ACCESS_SECRET=your-secret-here
   JWT_REFRESH_SECRET=your-other-secret-here
   ```

---

## Job Failures (Background Workers)

### Error: Job failed due to insufficient credits

**Symptoms**:
- Project status shows `FAILED_INSUFFICIENT_CREDITS`
- Papers show `isProcessedByLlm: false`
- Admin/Job logs show status `FAILED_NO_CREDITS`

**Solutions**:
1. **Recharge credits** (Admin action or via Stripe integration once available).
2. **Resume All Failed Jobs** (Batch):
   ```bash
   POST /v1/jobs/resume-all
   Authorization: Bearer <token>
   ```
   This will retry both the Project Init and any Paper Scoring jobs.

---

### Error: Job failed to queue (Redis Down)

**Symptoms**:
- Project created successfully (202 response) but status is `PENDING` or stuck.
- Job status in DB is `FAILED`.
- Failure reason shows: `Queue dispatch failed: Queue operation timed out` or `Redis connection error`.

**Solutions**:
1. **Check Redis Server**: Ensure Redis is running (`redis-cli ping` should return `PONG`).
2. **Resume All Failed Jobs**:
   Once Redis is back online, use the bulk resume endpoint:
   ```bash
   POST /v1/jobs/resume-all
   Authorization: Bearer <token>
   ```
   This will find all jobs that failed to queue and retry them.

---

## OpenAI Issues

### Error: Invalid API key

**Symptoms**:
```
Error: Incorrect API key provided
```

**Solutions**:

1. **Check API key** in `.env`:
   ```bash
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

2. **Verify key is valid**:
   - Go to https://platform.openai.com/api-keys
   - Check key exists and is active

3. **Check for extra spaces**:
   - No spaces before/after key in `.env`

4. **Restart server** after changing `.env`

---

### Error: Rate limit exceeded

**Symptoms**:
```
Error: Rate limit reached for requests
```

**Solutions**:

1. **Wait and retry** (rate limits reset after 1 minute)

2. **Upgrade OpenAI plan** for higher limits

3. **Implement request queuing** (future enhancement)

---

### Error: Insufficient quota

**Symptoms**:
```
Error: You exceeded your current quota
```

**Solutions**:

1. **Add credits** to OpenAI account:
   - Go to https://platform.openai.com/account/billing
   - Add payment method and credits

2. **Check usage**:
   - Go to https://platform.openai.com/usage
   - Monitor API usage

---

## Development Issues

### Error: Module not found

**Symptoms**:
```
Error: Cannot find module 'express'
```

**Solutions**:

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Clear node_modules and reinstall**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

---

### Error: TypeScript compilation errors

**Symptoms**:
```
error TS2304: Cannot find name 'User'
```

**Solutions**:

1. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

2. **Restart TypeScript server** (VS Code):
   - Cmd/Ctrl + Shift + P
   - "TypeScript: Restart TS Server"

3. **Check tsconfig.json** is correct

---

### Server not restarting on file changes

**Symptoms**:
- Changes not reflected
- Need to manually restart server

**Solutions**:

1. **Use dev mode**:
   ```bash
   npm run dev
   ```

2. **Check nodemon is installed**:
   ```bash
   npm install --save-dev nodemon
   ```

3. **Clear cache**:
   ```bash
   rm -rf dist/
   npm run dev
   ```

---

## Getting More Help

If your issue isn't listed here:

1. **Check logs** for detailed error messages
2. **Search GitHub issues**: https://github.com/BidyutSaha/AgentR/issues
3. **Create new issue** with:
   - Error message
   - Steps to reproduce
   - Environment details (OS, Node version, etc.)
4. **Check documentation**:
   - [Setup Guide](./01_SETUP.md)
   - [API Documentation](./03_API.md)
   - [Database Documentation](./04_DATABASE.md)

---

**For setup issues, see [01_SETUP.md](./01_SETUP.md)**
