# 🔧 Troubleshooting Guide

Common issues and solutions when running the Literature Review backend server.

---

## ❌ Port Already in Use

**Error:**
```
ERROR: Port 5000 is already in use
```

**Solution:**

### Option 1: Kill the Process (Windows)
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Example:
taskkill /PID 20864 /F
```

### Option 2: Change Port
Edit `.env` file:
```env
PORT=5001
```

Then restart server.

---

## ❌ Module Not Found

**Error:**
```
Error: Cannot find module 'bcrypt'
```

**Solution:**
```bash
# Install missing dependencies
npm install bcrypt jsonwebtoken nodemailer

# Install type definitions
npm install --save-dev @types/bcrypt @types/jsonwebtoken @types/nodemailer
```

---

## ❌ Database Connection Failed

**Error:**
```
Database connection test failed
```

**Solutions:**

### Check DATABASE_URL
```bash
# View current DATABASE_URL
echo $env:DATABASE_URL  # PowerShell
```

### Test Connection
```bash
npx prisma studio
```

### Verify .env File
Ensure `.env` has:
```env
DATABASE_URL="postgresql://user:password@host/database"
```

---

## ❌ Email Service Failed

**Error:**
```
Email connection test failed
```

**Solutions:**

### Check SMTP Credentials
```bash
# Test email
node setup-tests/test-email.js
```

### Verify Gmail App Password
1. Enable 2-Step Verification
2. Create App Password: https://myaccount.google.com/apppasswords
3. Update `.env`:
```env
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-16-char-app-password"  # No spaces!
```

---

## ❌ JWT Secrets Missing

**Error:**
```
JWT_ACCESS_SECRET is required
```

**Solution:**

### Generate Secrets
```bash
# Generate two different secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Add to .env
```env
JWT_ACCESS_SECRET="<first-generated-secret>"
JWT_REFRESH_SECRET="<second-generated-secret>"
```

---

## ❌ Prisma Client Not Generated

**Error:**
```
Cannot find module '@prisma/client'
```

**Solution:**
```bash
# Generate Prisma Client
npx prisma generate

# If schema changed, also run:
npx prisma db push
```

---

## ❌ TypeScript Errors

**Error:**
```
Type 'X' is not assignable to type 'Y'
```

**Solutions:**

### Reinstall Dependencies
```bash
npm install
```

### Check tsconfig.json
Ensure it exists and is properly configured.

### Clear Cache
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

---

## ❌ Server Won't Start

**General Debugging Steps:**

### 1. Check Environment Variables
```bash
node setup-tests/test-env.js
```

### 2. Check Database
```bash
npx prisma studio
```

### 3. Check Email
```bash
node setup-tests/test-email.js
```

### 4. View Detailed Logs
Server logs will show:
- Environment validation
- Database connection
- Email service connection
- Express app creation
- Server startup

### 5. Check for Syntax Errors
Look at the error stack trace in the terminal.

---

## 🔍 Common Commands

### Start Server
```bash
npm run dev
```

### Stop Server
Press `Ctrl+C` in terminal

### View Database
```bash
npx prisma studio
```

### Test Email
```bash
node setup-tests/test-email.js
```

### Test Environment
```bash
node setup-tests/test-env.js
```

### Check Port Usage
```bash
netstat -ano | findstr :5000
```

### Kill Process
```bash
taskkill /PID <PID> /F
```

---

## 📝 Checklist Before Starting

- [ ] `.env` file exists and is configured
- [ ] `DATABASE_URL` is set
- [ ] `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are set
- [ ] `SMTP_USER` and `SMTP_PASSWORD` are set (optional)
- [ ] `OPENAI_API_KEY` is set
- [ ] Dependencies installed (`npm install`)
- [ ] Prisma client generated (`npx prisma generate`)
- [ ] Port 5000 is free

---

## 🆘 Still Having Issues?

### Check Documentation
- `documentation/RUNNING_THE_SERVER.md` - Server guide
- `documentation/QUICK_START.md` - Quick start
- `documentation/DATABASE.md` - Database setup

### Check Logs
Server logs show detailed error messages with stack traces.

### Test Individual Components
```bash
# Test database
npx prisma studio

# Test email
node setup-tests/test-email.js

# Test environment
node setup-tests/test-env.js
```

---

## ✅ Server Running Successfully

When everything works, you'll see:
```
[INFO] Validating environment variables...
[INFO] ✓ Environment variables validated
[INFO] ✓ Database connection successful
[INFO] ✓ Email service connection successful
[INFO] Creating Express app...
[INFO] ✓ Express app created
[INFO] 🚀 Server running on http://localhost:5000
[INFO] 🔥 Environment: development
[INFO] 🏥 Health check: http://localhost:5000/v1/health
```

---

**Most common issue:** Port already in use - just kill the process and restart!
