# Your .env File - Quick Setup Guide

## Current Status

✅ **`.env.example`** - Valid and complete (reference file)  
✅ **`.env.template`** - Detailed template with instructions  
⚠️ **`.env`** - You need to update this file

---

## What You Need to Update in Your .env File

Your `.env` file should have these exact values:

### 1. Database (✅ Already Correct)
```env
DATABASE_URL="postgresql://agent_r_user:WpEbsAXE8s8nsRBagQZIpAzE4TeUZ594@dpg-d58h10ali9vc73a2g3dg-a.singapore-postgres.render.com/agent_r"
```
**Status:** ✅ This is already set correctly in `.env.example`

### 2. JWT Secrets (⚠️ You Need to Generate)

**Generate two secrets by running this command TWICE:**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Example output:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

**Add to .env:**
```env
JWT_ACCESS_SECRET="<paste-first-generated-secret-here>"
JWT_REFRESH_SECRET="<paste-second-generated-secret-here>"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"
```

### 3. Email Settings (⚠️ Optional for Now)

**For Gmail:**
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-gmail-app-password"
EMAIL_FROM="noreply@literaturereview.com"
```

**To get Gmail App Password:**
1. Go to: https://myaccount.google.com/apppasswords
2. Enable 2-Step Verification first
3. Create app password for "Mail"
4. Copy the 16-character password

**Note:** You can skip email setup for now and add it later when you need email verification.

### 4. OpenAI API Key (⚠️ Add Your Key)

```env
OPENAI_API_KEY=sk-your-actual-openai-key-here
LLM_MODEL=gpt-4-turbo-preview
EMBEDDINGS_MODEL=text-embedding-3-small
```

### 5. Other Settings (✅ Already Good)

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
BCRYPT_ROUNDS="12"
DEFAULT_TIME_WINDOW_YEARS=5
LOG_LEVEL=info
SEMANTIC_SCHOLAR_API_KEY=
```

---

## Complete Valid .env File Example

Here's what your complete `.env` file should look like:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://agent_r_user:WpEbsAXE8s8nsRBagQZIpAzE4TeUZ594@dpg-d58h10ali9vc73a2g3dg-a.singapore-postgres.render.com/agent_r"

# JWT Configuration
JWT_ACCESS_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2"
JWT_REFRESH_SECRET="z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4z3y2x1w0v9u8"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# Email Configuration (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="abcd efgh ijkl mnop"
EMAIL_FROM="noreply@literaturereview.com"

# Frontend URL
FRONTEND_URL="http://localhost:3000"

# Security
BCRYPT_ROUNDS="12"

# LLM Provider (OpenAI)
OPENAI_API_KEY=sk-proj-your-actual-key-here
LLM_MODEL=gpt-4-turbo-preview
EMBEDDINGS_MODEL=text-embedding-3-small

# External APIs
SEMANTIC_SCHOLAR_API_KEY=

# Application Settings
DEFAULT_TIME_WINDOW_YEARS=5
LOG_LEVEL=info
```

**⚠️ Important:** Replace the example values with your actual:
- JWT secrets (generate with the node command)
- Email credentials (if using email features)
- OpenAI API key

---

## Quick Setup Steps

### Step 1: Generate JWT Secrets

```powershell
# Run this command
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy the output
# Run it again for the second secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 2: Update Your .env File

1. Open `literature-review-backend/.env` in your editor
2. Copy the template from `.env.template` or `.env.example`
3. Replace `JWT_ACCESS_SECRET` with first generated secret
4. Replace `JWT_REFRESH_SECRET` with second generated secret
5. Add your `OPENAI_API_KEY`
6. (Optional) Add email settings if you have them

### Step 3: Verify Your .env File

Your `.env` file should have:
- ✅ `DATABASE_URL` - Your Render database URL
- ✅ `JWT_ACCESS_SECRET` - A 64-character hex string
- ✅ `JWT_REFRESH_SECRET` - A different 64-character hex string
- ✅ `OPENAI_API_KEY` - Your OpenAI key starting with `sk-`
- ⚠️ `SMTP_USER` and `SMTP_PASSWORD` - Optional for now

---

## Validation Checklist

Run this to check if your environment is set up correctly:

```powershell
# Create a test file
@"
require('dotenv').config();

console.log('Environment Validation:');
console.log('======================');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✓ Set' : '✗ Missing');
console.log('JWT_ACCESS_SECRET:', process.env.JWT_ACCESS_SECRET ? '✓ Set' : '✗ Missing');
console.log('JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET ? '✓ Set' : '✗ Missing');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✓ Set' : '✗ Missing');
console.log('SMTP_USER:', process.env.SMTP_USER ? '✓ Set' : '⚠ Optional');
console.log('SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? '✓ Set' : '⚠ Optional');
console.log('');
console.log('JWT_ACCESS_SECRET length:', process.env.JWT_ACCESS_SECRET?.length || 0, '(should be 64)');
console.log('JWT_REFRESH_SECRET length:', process.env.JWT_REFRESH_SECRET?.length || 0, '(should be 64)');
"@ | Out-File -FilePath test-env.js

# Run the test
node test-env.js

# Clean up
Remove-Item test-env.js
```

All required items should show `✓ Set`.

---

## Files Reference

- **`.env`** - Your actual environment file (gitignored, you edit this)
- **`.env.example`** - Reference template (committed to git)
- **`.env.template`** - Detailed template with instructions

---

## What's Required vs Optional

### Required for Basic Backend:
- ✅ `DATABASE_URL`
- ✅ `JWT_ACCESS_SECRET`
- ✅ `JWT_REFRESH_SECRET`
- ✅ `OPENAI_API_KEY`

### Optional (Can Add Later):
- ⚠️ `SMTP_USER` - Only needed for email verification
- ⚠️ `SMTP_PASSWORD` - Only needed for email verification
- ⚠️ `SEMANTIC_SCHOLAR_API_KEY` - Optional for paper retrieval

---

## Summary

**Your `.env.example` is valid and complete!** ✅

Just copy it to `.env` and update these 3 things:
1. Generate and add JWT secrets (2 different ones)
2. Add your OpenAI API key
3. (Optional) Add email credentials

The database URL is already configured correctly! 🎉
