# 📊 Database Tables - User & Email Verification

## ✅ Database Tables Created

Yes! The database tables were created when we set up Prisma. Here's what exists:

### Tables in Your Database

1. **`users`** - User accounts
2. **`email_verification_tokens`** - Email verification tokens
3. **`password_reset_tokens`** - Password reset tokens
4. **`refresh_tokens`** - JWT refresh tokens

---

## 🔍 View Your Database

### Prisma Studio (GUI)

**Already Running!** Open in your browser:
```
http://localhost:5555
```

You'll see:
- All tables listed on the left
- Click any table to view records
- See users and their verification tokens

---

## 📋 What's in Each Table

### 1. Users Table

**Columns:**
- `id` - UUID (primary key)
- `email` - User email (unique)
- `passwordHash` - Hashed password
- `firstName` - First name (optional)
- `lastName` - Last name (optional)
- `isVerified` - Email verified? (true/false)
- `isActive` - Account active? (true/false)
- `createdAt` - Registration date
- `updatedAt` - Last update
- `lastLogin` - Last login time

**Example Record:**
```
id: "550e8400-e29b-41d4-a716-446655440000"
email: "test@example.com"
passwordHash: "$2b$12$..."
firstName: "Test"
lastName: "User"
isVerified: false  ← Changes to true after verification
isActive: true
createdAt: "2025-12-28T15:00:00.000Z"
```

---

### 2. Email Verification Tokens Table

**Columns:**
- `id` - UUID (primary key)
- `userId` - Foreign key to users table
- `token` - Verification token (unique)
- `expiresAt` - Expiration time (24 hours)
- `createdAt` - Creation time
- `usedAt` - When token was used (null if not used)

**Example Record:**
```
id: "abc-123-def-456"
userId: "550e8400-e29b-41d4-a716-446655440000"
token: "a43e17fe150d10cd9a6dbb5da7471e420ca6590aab5faf89b0fea1d36f32cec8"
expiresAt: "2025-12-29T15:00:00.000Z"
createdAt: "2025-12-28T15:00:00.000Z"
usedAt: null  ← Changes to timestamp when verified
```

---

## 🔄 How They Work Together

### Registration Flow

1. **User registers** → Record created in `users` table
   - `isVerified: false`
   
2. **Verification token created** → Record in `email_verification_tokens`
   - Linked to user via `userId`
   - Token sent in email

3. **User clicks link** → Token verified
   - `users.isVerified` → `true`
   - `email_verification_tokens.usedAt` → current timestamp

---

## 🧪 Check Your Data

### Using Prisma Studio

1. Open http://localhost:5555
2. Click "User" table
3. See all registered users
4. Check `isVerified` column
5. Click "EmailVerificationToken" table
6. See all tokens and their status

### Using SQL (Advanced)

If you want to query directly:

```sql
-- View all users
SELECT id, email, "isVerified", "createdAt" FROM users;

-- View verification tokens
SELECT token, "userId", "expiresAt", "usedAt" 
FROM email_verification_tokens;

-- View users with their tokens
SELECT 
  u.email, 
  u."isVerified",
  evt.token,
  evt."usedAt"
FROM users u
LEFT JOIN email_verification_tokens evt ON u.id = evt."userId";
```

---

## 📝 Your Current Situation

Based on your token:
```
token: a43e17fe150d10cd9a6dbb5da7471e420ca6590aab5faf89b0fea1d36f32cec8
```

**In Prisma Studio, you should see:**

1. **Users table:**
   - Your registered user
   - `isVerified: false` (until you verify)

2. **EmailVerificationToken table:**
   - Your token record
   - `usedAt: null` (until you verify)

**After verification:**
- `users.isVerified` → `true`
- `email_verification_tokens.usedAt` → timestamp

---

## ✅ Verify Your Token Works

### Step 1: Check Token Exists

In Prisma Studio:
1. Open http://localhost:5555
2. Click "EmailVerificationToken"
3. Search for your token
4. Verify it exists and `usedAt` is null

### Step 2: Verify Email

Use the correct URL:
```
http://localhost:5000/v1/auth/verify-email?token=a43e17fe150d10cd9a6dbb5da7471e420ca6590aab5faf89b0fea1d36f32cec8
```

### Step 3: Check Database Again

Refresh Prisma Studio:
- `users.isVerified` should be `true`
- `email_verification_tokens.usedAt` should have a timestamp

---

## 🔍 Troubleshooting

### Token Not Found in Database?

**Possible reasons:**
1. Token expired (24 hours)
2. Token already used
3. User doesn't exist

**Solution:**
```bash
POST http://localhost:5000/v1/auth/resend-verification
{
  "email": "your-email@example.com"
}
```

### User Not in Database?

**Check registration:**
```bash
POST http://localhost:5000/v1/auth/register
{
  "email": "test@example.com",
  "password": "Test123!@#"
}
```

---

## 📊 Database Schema

```
┌─────────────────────┐
│      users          │
├─────────────────────┤
│ id (PK)             │
│ email (unique)      │
│ passwordHash        │
│ isVerified          │◄──┐
│ isActive            │   │
│ createdAt           │   │
│ updatedAt           │   │
│ lastLogin           │   │
└─────────────────────┘   │
                          │
                          │
┌──────────────────────────────┐
│ email_verification_tokens    │
├──────────────────────────────┤
│ id (PK)                      │
│ userId (FK) ─────────────────┘
│ token (unique)               │
│ expiresAt                    │
│ createdAt                    │
│ usedAt                       │
└──────────────────────────────┘
```

---

## Summary

✅ **Database tables exist**  
✅ **Users table stores accounts**  
✅ **EmailVerificationToken table stores tokens**  
✅ **Tables are linked via userId**  
✅ **Prisma Studio running at http://localhost:5555**  

**Open Prisma Studio to see your data!** 🎉
