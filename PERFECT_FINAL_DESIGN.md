# ✅ PERFECT FINAL DESIGN - Complete Credits System

## **All Transaction Types Tracked!**

---

## **📊 Transaction Types in `user_credits_transactions`**

### **1. SIGNUP_DEFAULT** ✅
- **When**: User registers and gets default credits
- **Admin ID**: `null` (system action)
- **Amount**: Positive (e.g., +1000)
- **Example**: User signs up → Gets 1000 credits

### **2. ADMIN_RECHARGE** ✅
- **When**: Admin manually adds credits to user
- **Admin ID**: Admin user ID
- **Amount**: Positive (e.g., +500)
- **Example**: Admin adds 500 credits for subscription payment

### **3. ADMIN_DEDUCT** ✅
- **When**: Admin manually removes credits from user
- **Admin ID**: Admin user ID
- **Amount**: Negative (e.g., -100)
- **Example**: Admin removes 100 credits for refund reversal

### **4. ADMIN_ADJUSTMENT** ✅
- **When**: Admin makes manual adjustment (correction)
- **Admin ID**: Admin user ID
- **Amount**: Positive or negative
- **Example**: Admin corrects balance error

---

## **🔄 Complete Flows**

### **Flow 1: User Signup**
```typescript
// 1. Get default credits from history
const defaultCredits = await prisma.defaultCreditsHistory.findFirst({
  where: { isActive: true }
});
// Result: 1000.0

// 2. Database transaction
await prisma.$transaction(async (tx) => {
  // a. Create user with balance
  const user = await tx.user.create({
    data: {
      email: "user@example.com",
      aiCreditsBalance: 1000.0,
      ...
    }
  });

  // b. Create transaction record
  await tx.userCreditsTransaction.create({
    data: {
      userId: user.id,
      adminId: null,  // System action
      transactionType: 'SIGNUP_DEFAULT',
      amount: 1000.0,
      balanceBefore: 0,
      balanceAfter: 1000.0,
      reason: 'Default credits on signup',
      description: 'New user signup bonus: 1000 credits'
    }
  });
});
```

**Result in `user_credits_transactions`:**
```
| id | user_id | admin_id | type | amount | before | after | reason |
|----|---------|----------|------|--------|--------|-------|--------|
| 1  | user_1  | null     | SIGNUP_DEFAULT | 1000 | 0 | 1000 | Default credits on signup |
```

---

### **Flow 2: Admin Recharge**
```typescript
// Admin adds 500 credits
await rechargeUserCredits(
  userId: "user_1",
  amount: 500,
  adminId: "admin_123",
  reason: "Subscription payment"
);

// Database transaction
await prisma.$transaction(async (tx) => {
  // a. Update balance: 1000 + 500 = 1500
  await tx.user.update({
    where: { id: "user_1" },
    data: { aiCreditsBalance: { increment: 500 } }
  });

  // b. Create transaction record
  await tx.userCreditsTransaction.create({
    data: {
      userId: "user_1",
      adminId: "admin_123",
      transactionType: 'ADMIN_RECHARGE',
      amount: 500,
      balanceBefore: 1000,
      balanceAfter: 1500,
      reason: "Subscription payment"
    }
  });
});
```

**Result in `user_credits_transactions`:**
```
| id | user_id | admin_id | type | amount | before | after | reason |
|----|---------|----------|------|--------|--------|-------|--------|
| 1  | user_1  | null     | SIGNUP_DEFAULT | 1000 | 0 | 1000 | Default credits on signup |
| 2  | user_1  | admin_123 | ADMIN_RECHARGE | 500 | 1000 | 1500 | Subscription payment |
```

---

### **Flow 3: LLM Usage (NOT in transactions table)**
```typescript
// User uses LLM (costs $0.50 = 50 credits)
// Balance: 1500 - 50 = 1450

// Only update user balance, NO transaction record
await prisma.user.update({
  where: { id: "user_1" },
  data: { aiCreditsBalance: { decrement: 50 } }
});
```

**Result**: Balance updated, but NO new row in `user_credits_transactions`

---

### **Flow 4: Admin Deduct**
```typescript
// Admin removes 100 credits
await deductUserCredits(
  userId: "user_1",
  amount: 100,
  adminId: "admin_123",
  reason: "Refund reversal"
);

// Database transaction
await prisma.$transaction(async (tx) => {
  // a. Update balance: 1450 - 100 = 1350
  await tx.user.update({
    where: { id: "user_1" },
    data: { aiCreditsBalance: { decrement: 100 } }
  });

  // b. Create transaction record
  await tx.userCreditsTransaction.create({
    data: {
      userId: "user_1",
      adminId: "admin_123",
      transactionType: 'ADMIN_DEDUCT',
      amount: -100,  // Negative!
      balanceBefore: 1450,
      balanceAfter: 1350,
      reason: "Refund reversal"
    }
  });
});
```

**Final Result in `user_credits_transactions`:**
```
| id | user_id | admin_id | type | amount | before | after | reason |
|----|---------|----------|------|--------|--------|-------|--------|
| 1  | user_1  | null     | SIGNUP_DEFAULT | 1000 | 0 | 1000 | Default credits on signup |
| 2  | user_1  | admin_123 | ADMIN_RECHARGE | 500 | 1000 | 1500 | Subscription payment |
| 3  | user_1  | admin_123 | ADMIN_DEDUCT | -100 | 1450 | 1350 | Refund reversal |
```

**Note**: LLM usage (50 credits) is NOT in this table!

---

## **📊 Summary**

### **What's Tracked in `user_credits_transactions`:**
✅ SIGNUP_DEFAULT - Default credits on registration  
✅ ADMIN_RECHARGE - Admin adds credits  
✅ ADMIN_DEDUCT - Admin removes credits  
✅ ADMIN_ADJUSTMENT - Admin corrections  

### **What's NOT Tracked:**
❌ LLM automatic deductions (too many, tracked in `llm_usage_logs` instead)

---

## **🎯 Benefits**

1. **Complete Audit Trail**: See all manual credit changes
2. **Separate System vs Admin**: `adminId = null` for system actions
3. **Transaction Types**: Clear categorization
4. **Balance Tracking**: `balanceBefore` and `balanceAfter` for verification
5. **Reason Tracking**: Why each change was made

---

## **📖 Query Examples**

### **Get User's Transaction History**
```sql
SELECT * FROM user_credits_transactions
WHERE user_id = 'user_1'
ORDER BY created_at DESC;
```

### **Get All Signup Bonuses**
```sql
SELECT * FROM user_credits_transactions
WHERE transaction_type = 'SIGNUP_DEFAULT';
```

### **Get Admin Actions**
```sql
SELECT * FROM user_credits_transactions
WHERE admin_id IS NOT NULL
ORDER BY created_at DESC;
```

### **Get Specific Admin's Actions**
```sql
SELECT * FROM user_credits_transactions
WHERE admin_id = 'admin_123'
ORDER BY created_at DESC;
```

---

## **✅ Implementation Status**

| Feature | Status |
|---------|--------|
| Schema updated | ✅ Done |
| SIGNUP_DEFAULT on registration | ✅ Done |
| ADMIN_RECHARGE on recharge | ✅ Done |
| ADMIN_DEDUCT (to implement) | ⏳ TODO |
| ADMIN_ADJUSTMENT (to implement) | ⏳ TODO |
| Transaction types indexed | ✅ Done |

---

## **⚠️ Next Steps**

1. Run migration to create tables
2. Implement ADMIN_DEDUCT endpoint
3. Implement ADMIN_ADJUSTMENT endpoint
4. Test all flows
5. Update API documentation

---

**Perfect design with complete tracking!** 🎉
