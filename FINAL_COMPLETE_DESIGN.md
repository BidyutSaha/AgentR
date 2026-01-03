# ✅ FINAL COMPLETE DESIGN - 4 Separate Tables

## **Perfect! Now I understand completely!**

---

## **📊 Complete Database Design**

### **Table 1: `credits_multiplier_history`**
**Purpose**: Track USD to AI Credits conversion rate changes

**Structure:**
```sql
CREATE TABLE credits_multiplier_history (
  id UUID PRIMARY KEY,
  usd_to_credits_multiplier FLOAT NOT NULL,
  description TEXT,
  updated_by VARCHAR,  -- Admin who changed it
  effective_from TIMESTAMP NOT NULL,
  effective_to TIMESTAMP,
  is_active BOOLEAN NOT NULL,
  created_at TIMESTAMP NOT NULL
);
```

**Usage:**
- **Insert**: When admin changes conversion rate
- **Query**: `SELECT * FROM credits_multiplier_history WHERE is_active = true ORDER BY effective_from DESC LIMIT 1`
- **Example**: 1 USD = 100 Credits → 1 USD = 150 Credits (promo)

---

### **Table 2: `default_credits_history`**
**Purpose**: Track default credits for new user signups

**Structure:**
```sql
CREATE TABLE default_credits_history (
  id UUID PRIMARY KEY,
  default_credits FLOAT NOT NULL,
  description TEXT,
  updated_by VARCHAR,  -- Admin who changed it
  effective_from TIMESTAMP NOT NULL,
  effective_to TIMESTAMP,
  is_active BOOLEAN NOT NULL,
  created_at TIMESTAMP NOT NULL
);
```

**Usage:**
- **Insert**: When admin changes default signup credits
- **Query**: `SELECT * FROM default_credits_history WHERE is_active = true ORDER BY effective_from DESC LIMIT 1`
- **Example**: New users get 1000 credits → New users get 2000 credits (promo)

---

### **Table 3: `user_credits_transactions`** ← **NEW!**
**Purpose**: Track ADMIN credit adjustments (recharge/deduct) for specific users

**Structure:**
```sql
CREATE TABLE user_credits_transactions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  admin_id UUID,  -- Admin who performed action
  transaction_type VARCHAR NOT NULL,  -- 'RECHARGE' | 'DEDUCT' | 'ADJUSTMENT'
  amount FLOAT NOT NULL,  -- Positive for recharge, negative for deduct
  balance_before FLOAT NOT NULL,
  balance_after FLOAT NOT NULL,
  reason TEXT,
  description TEXT,
  created_at TIMESTAMP NOT NULL
);
```

**Usage:**
- **Insert**: When admin recharges or deducts credits for a specific user
- **Query**: `SELECT * FROM user_credits_transactions WHERE user_id = ? ORDER BY created_at DESC`
- **Example**: Admin adds 500 credits to User A, Admin removes 100 credits from User B

---

### **Table 4: `users.ai_credits_balance`**
**Purpose**: Current balance (updated by LLM usage and admin transactions)

**Field in users table:**
```sql
ai_credits_balance FLOAT NOT NULL DEFAULT 0.0
```

**Updated by:**
1. **LLM usage** - Automatic deduction (not in transactions table)
2. **Admin recharge** - Manual addition (recorded in transactions table)
3. **Admin deduct** - Manual removal (recorded in transactions table)

---

## **🔄 Complete Flow**

### **Flow 1: New User Registration**
```
1. Query: SELECT default_credits FROM default_credits_history WHERE is_active = true
   → Result: 1000.0

2. Create user with ai_credits_balance = 1000.0

3. No transaction record (it's default, not admin action)
```

---

### **Flow 2: Admin Recharges User Credits**
```
1. Admin calls: POST /v1/admin/credits/recharge
   Body: { userId: "user_123", amount: 500, reason: "Subscription payment" }

2. Get current balance: 450.0

3. Database transaction:
   a. UPDATE users SET ai_credits_balance = 950.0 WHERE id = "user_123"
   
   b. INSERT INTO user_credits_transactions (
        user_id, admin_id, transaction_type, amount,
        balance_before, balance_after, reason
      ) VALUES (
        "user_123", "admin_456", "RECHARGE", 500,
        450.0, 950.0, "Subscription payment"
      )

4. Return new balance: 950.0
```

---

### **Flow 3: LLM Usage Deduction**
```
1. User calls LLM API (costs $0.50)

2. Query multiplier: SELECT usd_to_credits_multiplier 
   FROM credits_multiplier_history WHERE is_active = true
   → Result: 100.0

3. Calculate: 0.50 × 100 = 50 credits

4. UPDATE users SET ai_credits_balance = ai_credits_balance - 50
   WHERE id = "user_123"

5. NO transaction record (automatic LLM deduction, not admin action)
```

---

### **Flow 4: Admin Deducts Credits**
```
1. Admin calls: POST /v1/admin/credits/deduct (or adjust)
   Body: { userId: "user_123", amount: -100, reason: "Refund reversal" }

2. Get current balance: 950.0

3. Database transaction:
   a. UPDATE users SET ai_credits_balance = 850.0 WHERE id = "user_123"
   
   b. INSERT INTO user_credits_transactions (
        user_id, admin_id, transaction_type, amount,
        balance_before, balance_after, reason
      ) VALUES (
        "user_123", "admin_456", "DEDUCT", -100,
        950.0, 850.0, "Refund reversal"
      )

4. Return new balance: 850.0
```

---

## **📖 Summary of Tables**

| Table | Purpose | Insert When | Query For |
|-------|---------|-------------|-----------|
| `credits_multiplier_history` | USD→Credits rate | Admin changes rate | Get current rate |
| `default_credits_history` | Signup credits | Admin changes default | Get current default |
| `user_credits_transactions` | Admin adjustments | Admin recharge/deduct | User transaction history |
| `users.ai_credits_balance` | Current balance | LLM usage, admin actions | Check if user has credits |

---

## **✅ Key Points**

1. **Separate concerns**: 
   - Global settings (multiplier, default) in history tables
   - User-specific admin actions in transactions table
   - Current balance in users table

2. **History tracking**:
   - Multiplier changes tracked
   - Default credits changes tracked
   - Admin credit adjustments tracked

3. **NOT tracked in transactions**:
   - Automatic LLM deductions (too many records)
   - Default credits on signup (it's default, not admin action)

4. **Tracked in transactions**:
   - Admin recharge
   - Admin deduct
   - Admin adjustments

---

## **🎯 This Design Allows:**

✅ Track who changed global settings and when  
✅ Track all admin credit adjustments per user  
✅ Query user transaction history  
✅ Separate automatic (LLM) from manual (admin) changes  
✅ Audit trail for compliance  
✅ Historical analysis of pricing changes  

**Perfect design!** 🎉
