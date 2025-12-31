# Setup Tests

This folder contains test scripts to verify your environment configuration.

## Available Tests

### 1. Email Test (`test-email.js`)
Tests SMTP email configuration.

**Run from project root:**
```bash
node setup-tests/test-email.js
```

**Run from setup-tests folder:**
```bash
cd setup-tests
node test-email.js
```

**What it checks:**
- ✓ SMTP connection to Gmail
- ✓ Email credentials (SMTP_USER, SMTP_PASSWORD)
- ✓ Sends a test email to your inbox

**Expected output:**
```
✓ SMTP Connection Successful!
✓ Test email sent successfully!
✓ Check your inbox: your-email@gmail.com
```

---

### 2. Database Test (`test-database.js`)
Tests PostgreSQL database connection (coming soon).

**Run:**
```bash
node setup-tests/test-database.js
```

**What it checks:**
- ✓ Database connection
- ✓ Prisma client setup
- ✓ Database tables exist

---

### 3. Environment Test (`test-env.js`)
Tests all environment variables.

**Run:**
```bash
node setup-tests/test-env.js
```

**What it checks:**
- ✓ All required environment variables are set
- ✓ JWT secrets are strong enough
- ✓ OpenAI API key is present
- ✓ Database URL is valid

---

### 4. Full Setup Test (`test-all.js`)
Runs all tests in sequence.

**Run:**
```bash
node setup-tests/test-all.js
```

---

## Test Results

### ✅ Email Test - PASSED
- Date: 2025-12-28
- SMTP Host: smtp.gmail.com
- User: bidyutoncloud@gmail.com
- Status: Working correctly! 🎉

---

## Next Steps

After all tests pass:
1. Install Prisma: `npm install prisma @prisma/client`
2. Setup database schema
3. Run migrations
4. Start implementing authentication

---

## Troubleshooting

If tests fail, check:
- `.env` file has correct values
- No typos in environment variables
- JWT secrets are 64 characters (generated with crypto)
- Email App Password has no spaces
- Database URL is correct
