# Environment Configuration Guide

## Your Database URL

Your PostgreSQL database is hosted on Render:

```
postgresql://agent_r_user:WpEbsAXE8s8nsRBagQZIpAzE4TeUZ594@dpg-d58h10ali9vc73a2g3dg-a.singapore-postgres.render.com/agent_r
```

**Database Details:**
- **Host**: dpg-d58h10ali9vc73a2g3dg-a.singapore-postgres.render.com
- **Database**: agent_r
- **User**: agent_r_user
- **Password**: WpEbsAXE8s8nsRBagQZIpAzE4TeUZ594
- **Region**: Singapore

---

## Update Your .env File

Since `.env` is gitignored (for security), you need to manually update it. Here's what to add:

### 1. Open your .env file

```bash
cd literature-review-backend
# Edit .env file with your editor
```

### 2. Add/Update these lines in your .env file:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://agent_r_user:WpEbsAXE8s8nsRBagQZIpAzE4TeUZ594@dpg-d58h10ali9vc73a2g3dg-a.singapore-postgres.render.com/agent_r"

# JWT Configuration
# Generate your own secrets using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_ACCESS_SECRET="your-super-secret-access-key-change-in-production-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production-min-32-chars"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# Email Configuration (SMTP)
# For Gmail: Create App Password at https://support.google.com/accounts/answer/185833
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-gmail-app-password"
EMAIL_FROM="noreply@literaturereview.com"

# Frontend URL (for email links)
FRONTEND_URL="http://localhost:3000"

# Security
BCRYPT_ROUNDS="12"

# LLM Provider (Keep your existing OpenAI key)
OPENAI_API_KEY=your_existing_openai_key_here
LLM_MODEL=gpt-4-turbo-preview
EMBEDDINGS_MODEL=text-embedding-3-small

# External APIs
SEMANTIC_SCHOLAR_API_KEY=

# Application Settings
DEFAULT_TIME_WINDOW_YEARS=5
LOG_LEVEL=info
```

---

## Generate JWT Secrets

For security, generate strong random secrets for JWT tokens:

```bash
# Generate Access Token Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate Refresh Token Secret (run again for different secret)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and replace the placeholder values in your `.env` file.

---

## Setup Email (Gmail Example)

### Option 1: Gmail with App Password (Recommended)

1. **Enable 2-Step Verification** on your Google Account
2. **Create App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "Literature Review App"
   - Copy the 16-character password
3. **Update .env**:
   ```env
   SMTP_USER="your-email@gmail.com"
   SMTP_PASSWORD="your-16-char-app-password"
   ```

### Option 2: Other Email Services

**SendGrid:**
```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="your-sendgrid-api-key"
```

**AWS SES:**
```env
SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
SMTP_PORT="587"
SMTP_USER="your-ses-smtp-username"
SMTP_PASSWORD="your-ses-smtp-password"
```

**Mailgun:**
```env
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT="587"
SMTP_USER="your-mailgun-smtp-username"
SMTP_PASSWORD="your-mailgun-smtp-password"
```

---

## Test Database Connection

After updating your `.env` file, test the database connection:

```bash
cd literature-review-backend

# Install Prisma if not already installed
npm install prisma @prisma/client

# Initialize Prisma (if not done)
npx prisma init

# Test connection by generating Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# Open Prisma Studio to view your database
npx prisma studio
```

---

## Verify Configuration

### 1. Check Database Connection

```bash
npx prisma db pull
```

This should connect to your Render database and show the schema.

### 2. Check Environment Variables

Create a test file `test-env.js`:

```javascript
require('dotenv').config();

console.log('Database URL:', process.env.DATABASE_URL ? '✓ Set' : '✗ Not set');
console.log('JWT Access Secret:', process.env.JWT_ACCESS_SECRET ? '✓ Set' : '✗ Not set');
console.log('JWT Refresh Secret:', process.env.JWT_REFRESH_SECRET ? '✓ Set' : '✗ Not set');
console.log('SMTP User:', process.env.SMTP_USER ? '✓ Set' : '✗ Not set');
console.log('OpenAI Key:', process.env.OPENAI_API_KEY ? '✓ Set' : '✗ Not set');
```

Run it:
```bash
node test-env.js
```

All should show `✓ Set`.

---

## Security Checklist

- ✅ Database URL added to `.env`
- ✅ Strong JWT secrets generated (32+ characters)
- ✅ Email SMTP configured
- ✅ `.env` file is in `.gitignore` (never commit it!)
- ✅ Different secrets for access and refresh tokens
- ✅ Frontend URL configured
- ✅ OpenAI API key present

---

## Next Steps

1. **Update your `.env` file** with the configuration above
2. **Generate JWT secrets** using the command provided
3. **Setup email** (Gmail App Password or other service)
4. **Test database connection** with Prisma
5. **Follow QUICK_START.md** to continue implementation

---

## Troubleshooting

### Database Connection Issues

**Error: "Can't reach database server"**
- Check if Render database is active
- Verify DATABASE_URL is correct
- Check firewall/network settings

**Error: "Authentication failed"**
- Verify username and password in DATABASE_URL
- Check if database user has correct permissions

### Email Issues

**Error: "Invalid login"**
- For Gmail: Use App Password, not regular password
- Enable 2-Step Verification first
- Check SMTP credentials

**Error: "Connection timeout"**
- Check SMTP_HOST and SMTP_PORT
- Verify firewall allows outbound SMTP

### JWT Issues

**Error: "jwt must be provided"**
- Ensure JWT secrets are set in `.env`
- Check secrets are at least 32 characters
- Verify no extra spaces in `.env`

---

## Important Notes

1. **Never commit `.env` to git** - It contains sensitive credentials
2. **Use different secrets** for development and production
3. **Rotate secrets regularly** for security
4. **Backup your `.env` file** securely (not in git)
5. **Use environment variables** in production (not `.env` file)

---

## Production Deployment

When deploying to production:

1. **Don't use `.env` file** - Use platform environment variables
2. **Set all variables** in your hosting platform (Render, Railway, etc.)
3. **Use strong secrets** - Generate new ones for production
4. **Enable HTTPS** - Set `NODE_ENV=production`
5. **Update FRONTEND_URL** to your production domain

---

Your database is ready! Follow the steps above to complete your environment configuration.
