# AI Credits Balance System - Implementation Guide

## Overview

This document outlines the implementation of:
1. Default AI Credits on user registration
2. Credit balance check before LLM calls
3. Credit deduction after LLM usage
4. Admin API to recharge user credits

---

## Database Changes

### 1. User Model - Added Field
```prisma
model User {
  aiCreditsBalance Float @default(0.0) @map("ai_credits_balance")
}
```

### 2. SystemConfig Model - Added Field
```prisma
model SystemConfig {
  defaultCreditsForNewUsers Float @default(1000.0) @map("default_credits_for_new_users")
}
```

---

## Implementation Steps

### Step 1: Run Migration

```bash
# Stop dev server
Ctrl+C

# Create migration
npx prisma migrate dev --name add_credits_balance_system

# Restart server
npm run dev
```

This will:
- Add `ai_credits_balance` column to `users` table
- Add `default_credits_for_new_users` column to `system_config` table

---

### Step 2: Seed Initial Config

After migration, update system config:

```sql
UPDATE system_config
SET default_credits_for_new_users = 1000.0,
    description = 'Default: 1000 AI Credits for new users, 1 USD = 100 Credits';
```

---

## Features Implemented

### 1. ✅ Default Credits on Registration

**File**: `src/services/auth/auth.service.ts`

When a user registers:
1. Fetches `defaultCreditsForNewUsers` from `system_config`
2. Assigns that amount to `aiCreditsBalance`
3. Default: 1000 Credits

**Example**:
```typescript
// User registers → Gets 1000 Credits automatically
const user = await register({
  email: "user@example.com",
  password: "password123",
  firstName: "John"
});
// user.aiCreditsBalance = 1000.0
```

---

### 2. ⏳ Credit Balance Check (TO IMPLEMENT)

**File to create**: `src/middlewares/checkCredits.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

export async function checkCreditsMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = req.userId!;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { aiCreditsBalance: true },
        });

        if (!user) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User not found',
                },
            });
            return;
        }

        if (user.aiCreditsBalance <= 0) {
            res.status(402).json({
                success: false,
                error: {
                    code: 'INSUFFICIENT_CREDITS',
                    message: 'AI Credits exhausted. Please recharge your account.',
                    details: {
                        currentBalance: user.aiCreditsBalance,
                    },
                },
            });
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
}
```

**Usage**: Add to LLM routes
```typescript
// In src/routes/stages.routes.ts
router.post('/intent', authenticate, checkCreditsMiddleware, handleIntent);
router.post('/queries', authenticate, checkCreditsMiddleware, handleQueries);
router.post('/score', authenticate, checkCreditsMiddleware, handleScore);
```

---

### 3. ⏳ Credit Deduction (TO IMPLEMENT)

**File to update**: `src/services/llmUsage/llmUsage.service.ts`

Add function to deduct credits:

```typescript
export async function deductCredits(userId: string, costUsd: number) {
    // Get multiplier
    const config = await prisma.systemConfig.findFirst({
        select: { usdToCreditsMultiplier: true },
    });
    const multiplier = config?.usdToCreditsMultiplier || 100.0;
    
    // Calculate credits to deduct
    const creditsToDeduct = costUsd * multiplier;
    
    // Deduct from user balance
    await prisma.user.update({
        where: { id: userId },
        data: {
            aiCreditsBalance: {
                decrement: creditsToDeduct,
            },
        },
    });
    
    logger.info(`Deducted ${creditsToDeduct} credits from user ${userId}`);
}
```

**Call after LLM usage**:
```typescript
// In logLlmUsage function
await logLlmUsage({...});
await deductCredits(userId, totalCostUsd);
```

---

### 4. ⏳ Admin Recharge API (TO IMPLEMENT)

**File to create**: `src/services/credits.service.ts`

```typescript
import prisma from '../config/database';
import logger from '../config/logger';

export async function rechargeUserCredits(
    userId: string,
    amount: number,
    adminId: string,
    reason?: string
) {
    if (amount <= 0) {
        throw new Error('Recharge amount must be greater than 0');
    }

    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            aiCreditsBalance: {
                increment: amount,
            },
        },
        select: {
            id: true,
            email: true,
            aiCreditsBalance: true,
        },
    });

    logger.info(`Admin ${adminId} recharged ${amount} credits for user ${userId}. Reason: ${reason || 'N/A'}`);

    return user;
}

export async function getUserCreditsBalance(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            aiCreditsBalance: true,
        },
    });

    if (!user) {
        throw new Error('User not found');
    }

    return user;
}
```

**Controller**: `src/controllers/credits.controller.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { rechargeUserCredits, getUserCreditsBalance } from '../services/credits.service';
import logger from '../config/logger';

export async function handleRechargeCredits(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { userId, amount, reason } = req.body;
        const adminId = req.userId!;

        if (!userId || !amount) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'userId and amount are required',
                },
            });
            return;
        }

        const user = await rechargeUserCredits(userId, amount, adminId, reason);

        res.status(200).json({
            success: true,
            data: user,
            message: `Recharged ${amount} credits successfully`,
        });
    } catch (error) {
        logger.error('Error recharging credits:', error);
        next(error);
    }
}

export async function handleGetUserCredits(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { userId } = req.params;

        const user = await getUserCreditsBalance(userId);

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        logger.error('Error getting user credits:', error);
        next(error);
    }
}
```

**Routes**: `src/routes/credits.routes.ts`

```typescript
import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import {
    handleRechargeCredits,
    handleGetUserCredits,
} from '../controllers/credits.controller';

const router = Router();

// Admin recharge user credits
router.post(
    '/recharge',
    authenticate,
    // TODO: Add admin middleware
    handleRechargeCredits
);

// Admin get user credits balance
router.get(
    '/user/:userId',
    authenticate,
    // TODO: Add admin middleware
    handleGetUserCredits
);

export default router;
```

**Register routes** in `src/routes/index.ts`:
```typescript
import creditsRoutes from './credits.routes';

router.use('/v1/admin/credits', creditsRoutes);
```

---

## API Documentation

### API 37: POST /v1/admin/credits/recharge

**Description**: Recharge AI Credits for a user (Admin only)

**Request**:
```json
{
  "userId": "user_123",
  "amount": 500.0,
  "reason": "Monthly subscription payment"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "aiCreditsBalance": 1500.0
  },
  "message": "Recharged 500 credits successfully"
}
```

---

### API 38: GET /v1/admin/credits/user/:userId

**Description**: Get user's AI Credits balance (Admin only)

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "aiCreditsBalance": 1500.0
  }
}
```

---

## Error Handling

### Insufficient Credits Error

**Status**: 402 Payment Required

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_CREDITS",
    "message": "AI Credits exhausted. Please recharge your account.",
    "details": {
      "currentBalance": -5.5
    }
  }
}
```

---

## Testing Flow

### 1. Register New User
```bash
POST /v1/auth/register
{
  "email": "test@example.com",
  "password": "Test123!@#",
  "firstName": "Test"
}

# User gets 1000 credits automatically
```

### 2. Check Balance
```bash
GET /v1/admin/credits/user/:userId
# Response: aiCreditsBalance: 1000.0
```

### 3. Use LLM (Costs $0.50 = 50 Credits)
```bash
POST /v1/stages/intent
# Credits deducted: 1000 - 50 = 950
```

### 4. Recharge Credits
```bash
POST /v1/admin/credits/recharge
{
  "userId": "user_123",
  "amount": 500.0
}
# New balance: 950 + 500 = 1450
```

### 5. Exhaust Credits
```bash
# Keep using LLM until balance <= 0
POST /v1/stages/intent
# Response: 402 INSUFFICIENT_CREDITS
```

---

## Next Steps

1. ✅ Run migration
2. ⏳ Create `checkCredits.ts` middleware
3. ⏳ Add credit deduction to `logLlmUsage`
4. ⏳ Create credits service, controller, routes
5. ⏳ Update API documentation in `03_API.md`
6. ⏳ Test complete flow

---

**Status**: Database schema ready, registration updated, remaining features need implementation
