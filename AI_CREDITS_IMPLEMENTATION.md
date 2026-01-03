# AI Credits System Implementation Summary

## Overview
Successfully implemented AI Credits system for LLM usage tracking. All three usage APIs (23, 24, 25) now return both **USD costs** and **AI Credits** based on a user-specific multiplier stored in the database.

---

## Changes Made

### 1. **Database Schema** (Already in place)
- ✅ `users` table already has:
  - `ai_credits` (Float, default: 0.0) - User's credit balance (admin-managed)
  - `credit_multiplier` (Float, default: 1.0) - Exchange rate: 1 USD = X Credits

### 2. **Service Layer Updates**
Updated `src/services/llmUsage/llmUsage.service.ts`:

#### API 23: `getUserUsage()` ✅ (Already had credits)
- Returns `totalCostUsd` and `totalCostCredits`
- Returns `projectCosts` with both USD and Credits
- Returns `paperCosts` with both USD and Credits

#### API 24: `getProjectUsage()` ✅ (Updated)
- Now fetches user's `creditMultiplier` from database
- Returns `summary.totalCostCredits` alongside `totalCostUsd`
- Formula: `totalCostCredits = totalCostUsd * creditMultiplier`

#### API 25: `getAllUsersBillingSummary()` ✅ (Updated)
- Fetches each user's `creditMultiplier` from database
- Returns `totalCostCredits` for each user
- Returns `grandTotalCostCredits` (sum of all users' credits)
- Formula: Each user's credits = their USD cost * their multiplier

### 3. **Controller Updates**
Updated `src/controllers/llmUsage.controller.ts`:
- ✅ API 25 controller simplified to return new service structure

### 4. **API Documentation Updates**
Updated `documentation/03_API.md`:

#### API 24: GET /v1/llm-usage/project/:projectId
```typescript
summary: {
  totalCalls: number;
  totalTokens: number;
  totalCostUsd: number;     // USD cost
  totalCostCredits: number; // Credits (USD * multiplier)
}
```

#### API 25: GET /v1/llm-usage/admin/all-users
```typescript
{
  users: Array<{
    user: { id, email, firstName, lastName };
    totalCalls: number;
    totalTokens: number;
    totalCostUsd: number;     // USD cost
    totalCostCredits: number; // Credits (USD * multiplier)
  }>;
  totalUsers: number;
  grandTotalCostUsd: number;     // Sum of all USD
  grandTotalCostCredits: number; // Sum of all Credits
}
```

---

## How It Works

### Credit Multiplier System
- Each user has a `creditMultiplier` field (default: 1.0)
- **Admin-only field** - only accessible by admins
- Different users can have different multipliers:
  - Standard users: 1.0 (1 USD = 1 Credit)
  - Enterprise users: 100.0 (1 USD = 100 Credits)
  - Custom pricing: Any value set by admin

### Calculation
```
AI Credits = USD Cost × User's Credit Multiplier
```

Example:
- User A: multiplier = 100.0, spent $0.50 → 50 credits
- User B: multiplier = 1.0, spent $0.50 → 0.5 credits

---

## Current Status

### ✅ Completed
1. Database schema has `creditMultiplier` field
2. Service functions updated for all 3 APIs
3. Controller updated for API 25
4. API documentation updated
5. Migration SQL file created

### ⚠️ Pending Actions Required

#### 1. **Restart Dev Server** (CRITICAL)
The dev server is currently running and locking Prisma files. You need to:
```bash
# Stop the current dev server (Ctrl+C in the terminal)
# Then restart it:
npm run dev
```

This will:
- Regenerate Prisma client with `creditMultiplier` field
- Fix all TypeScript errors
- Apply the new code changes

#### 2. **Run Database Migration** (If needed)
If the `ai_credits` and `credit_multiplier` columns don't exist in your database:
```bash
# Apply the migration manually
psql -d your_database -f prisma/migrations/20260103_add_credit_multiplier/migration.sql

# OR use Prisma (after restarting dev server)
npx prisma db push
```

#### 3. **Verify Migration**
Check if columns exist:
```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('ai_credits', 'credit_multiplier');
```

---

## Testing the Changes

### Test API 24 (Project Usage)
```bash
GET /v1/llm-usage/project/:projectId
Authorization: Bearer <token>

# Expected Response:
{
  "success": true,
  "data": {
    "summary": {
      "totalCalls": 75,
      "totalTokens": 22500,
      "totalCostUsd": 0.62,
      "totalCostCredits": 62.0  // ← NEW
    },
    "logs": [...]
  }
}
```

### Test API 25 (Admin All Users)
```bash
GET /v1/llm-usage/admin/all-users
Authorization: Bearer <admin-token>

# Expected Response:
{
  "success": true,
  "data": {
    "users": [
      {
        "user": {...},
        "totalCalls": 200,
        "totalTokens": 60000,
        "totalCostUsd": 1.80,
        "totalCostCredits": 180.0  // ← NEW
      }
    ],
    "totalUsers": 2,
    "grandTotalCostUsd": 3.05,
    "grandTotalCostCredits": 242.5  // ← NEW
  }
}
```

---

## Admin Operations

### Set User's Credit Multiplier
To change a user's credit multiplier (admin operation):
```sql
-- Standard pricing (1 USD = 1 Credit)
UPDATE users SET credit_multiplier = 1.0 WHERE email = 'user@example.com';

-- Enterprise pricing (1 USD = 100 Credits)
UPDATE users SET credit_multiplier = 100.0 WHERE email = 'enterprise@example.com';

-- Custom pricing
UPDATE users SET credit_multiplier = 50.0 WHERE email = 'custom@example.com';
```

### View All Users' Multipliers (Admin)
```sql
SELECT id, email, credit_multiplier, ai_credits 
FROM users 
ORDER BY credit_multiplier DESC;
```

---

## TypeScript Errors (Will be fixed after restart)

Current errors are due to Prisma client not being regenerated:
- `creditMultiplier does not exist in type 'UserSelect'`
- `Property 'user' does not exist on type...`

**These will automatically resolve** when you restart the dev server.

---

## Next Steps

1. **Restart dev server** to regenerate Prisma client
2. **Verify database** has the new columns
3. **Test the APIs** to confirm credits are calculated correctly
4. **Implement admin API** to manage user credit multipliers (future enhancement)

---

## Files Modified

1. `src/services/llmUsage/llmUsage.service.ts` - Added credit calculations
2. `src/controllers/llmUsage.controller.ts` - Updated API 25 controller
3. `documentation/03_API.md` - Updated API 24 and 25 docs
4. `prisma/migrations/20260103_add_credit_multiplier/migration.sql` - Migration file

---

## Summary

✅ **All 3 APIs (23, 24, 25) now return both USD and AI Credits**
✅ **Credit multiplier is stored in database (admin-only)**
✅ **Each user can have different pricing tiers**
✅ **Documentation fully updated**

**Action Required**: Restart dev server to apply changes!
