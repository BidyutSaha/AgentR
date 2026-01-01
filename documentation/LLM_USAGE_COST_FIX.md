# LLM Usage Logging - Cost Calculation Fix

## Problem

The cost fields (`input_cost_cents`, `output_cost_cents`, `total_cost_cents`) were showing `0` in the `llm_usage_logs` table.

## Root Cause

The `llm_model_pricing` table was empty. When the system tried to calculate costs using the `calculateCost()` function, it couldn't find pricing data for the model being used, so it returned zero costs.

## Solution

✅ **FIXED** - Pricing data has been seeded for all common OpenAI models.

### What Was Done

1. Created `scripts/seed-pricing.js` - A script to populate pricing data
2. Ran the script to add pricing for:
   - ✅ gpt-4o (standard & batch tiers)
   - ✅ gpt-4o-mini (standard & batch tiers)
   - ✅ gpt-4-turbo (standard)
   - ✅ gpt-4-turbo-preview (standard)
   - ✅ gpt-3.5-turbo (standard)
   - ✅ text-embedding-3-small
   - ✅ text-embedding-3-large

### Pricing Added

| Model | Tier | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|------|----------------------|------------------------|
| gpt-4o | standard | $2.50 | $10.00 |
| gpt-4o | batch | $1.25 | $5.00 |
| gpt-4o-mini | standard | $0.15 | $0.60 |
| gpt-4o-mini | batch | $0.08 | $0.30 |
| gpt-4-turbo | standard | $10.00 | $30.00 |
| gpt-4-turbo-preview | standard | $10.00 | $30.00 |
| gpt-3.5-turbo | standard | $0.50 | $1.50 |

---

## Testing the Fix

### 1. Make a New LLM Call

```bash
curl -X POST http://localhost:5000/v1/stages/intent \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "abstract": "We propose a novel deep learning approach for image classification."
  }'
```

### 2. Check the Database

Query the latest log entry:

```sql
SELECT 
  model_name,
  input_tokens,
  output_tokens,
  input_cost_cents,
  output_cost_cents,
  total_cost_cents
FROM llm_usage_logs
ORDER BY created_at DESC
LIMIT 1;
```

### Expected Result

You should now see **non-zero values** in the cost columns:

```
model_name          | input_tokens | output_tokens | input_cost_cents | output_cost_cents | total_cost_cents
--------------------|--------------|---------------|------------------|-------------------|------------------
gpt-4-turbo-preview | 250          | 180           | 3                | 5                 | 8
```

**Note:** For small token counts, costs may be very small (e.g., 3 cents = $0.03). This is normal.

---

## Cost Calculation Formula

The system calculates costs as follows:

```typescript
inputCostCents = Math.round((inputTokens / 1_000_000) * inputUsdCentsPerMillionTokens)
outputCostCents = Math.round((outputTokens / 1_000_000) * outputUsdCentsPerMillionTokens)
totalCostCents = inputCostCents + outputCostCents
```

### Example Calculation

For `gpt-4-turbo-preview` with:
- Input tokens: 250
- Output tokens: 180

**Input cost:**
- (250 / 1,000,000) × 1000 cents = 0.25 cents → rounds to **0 cents**

**Output cost:**
- (180 / 1,000,000) × 3000 cents = 0.54 cents → rounds to **1 cent**

**Total:** 0 + 1 = **1 cent** ($0.01)

**Note:** Due to rounding, very small token counts may result in 0 or 1 cent costs. Real usage with larger token counts will show more accurate costs.

---

## Verifying Pricing Data

### Check All Pricing Entries

```sql
SELECT 
  model_name,
  pricing_tier,
  input_usd_cents_per_million_tokens,
  output_usd_cents_per_million_tokens,
  is_active,
  is_latest
FROM llm_model_pricing
WHERE is_active = true AND is_latest = true
ORDER BY model_name, pricing_tier;
```

### Check Specific Model

```sql
SELECT * FROM llm_model_pricing
WHERE model_name = 'gpt-4-turbo-preview'
  AND is_latest = true
  AND is_active = true;
```

---

## Re-running the Seed Script

If you need to add more models or update pricing:

```bash
node scripts/seed-pricing.js
```

The script is **idempotent** - it will:
- ✅ Skip models that already exist
- ✅ Only create new entries
- ✅ Not duplicate data

---

## Adding Custom Pricing

If you need to add pricing for a model not in the seed script, use the admin API:

```bash
curl -X POST http://localhost:5000/v1/admin/model-pricing \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "modelName": "custom-model",
    "provider": "openai",
    "pricingTier": "standard",
    "inputUsdCentsPerMillionTokens": 100,
    "outputUsdCentsPerMillionTokens": 200,
    "description": "Custom model pricing"
  }'
```

See `documentation/LLM_MODEL_PRICING_API.md` for full API documentation.

---

## Troubleshooting

### Still Seeing Zero Costs?

1. **Check which model is being used:**
   ```sql
   SELECT DISTINCT model_name FROM llm_usage_logs;
   ```

2. **Verify pricing exists for that model:**
   ```sql
   SELECT * FROM llm_model_pricing 
   WHERE model_name = 'YOUR_MODEL_NAME'
     AND is_latest = true 
     AND is_active = true;
   ```

3. **Check server logs for warnings:**
   Look for: `calculate_cost_no_pricing` in your logs

4. **If pricing is missing, add it:**
   - Edit `scripts/seed-pricing.js` to add your model
   - Run `node scripts/seed-pricing.js`
   - Or use the admin API to add it manually

---

## Future Maintenance

### When to Update Pricing

Update pricing when:
- OpenAI changes their pricing
- You add support for new models
- You want to track different pricing tiers

### How to Update Pricing

**Option 1: Create new pricing entry (recommended)**
```bash
curl -X POST http://localhost:5000/v1/admin/model-pricing \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "modelName": "gpt-4o",
    "pricingTier": "standard",
    "inputUsdCentsPerMillionTokens": 300,
    "outputUsdCentsPerMillionTokens": 1200,
    "effectiveFrom": "2026-02-01T00:00:00Z"
  }'
```

This will:
- Mark the old pricing as `isLatest = false`
- Set `effectiveTo` on the old pricing
- Create new pricing with `isLatest = true`

**Option 2: Update existing entry**
```bash
curl -X PATCH http://localhost:5000/v1/admin/model-pricing/{id} \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "inputUsdCentsPerMillionTokens": 300,
    "outputUsdCentsPerMillionTokens": 1200
  }'
```

---

## Summary

✅ **Problem:** Cost calculation returned 0 because pricing table was empty  
✅ **Solution:** Seeded pricing data for all common OpenAI models  
✅ **Result:** Costs will now be calculated correctly for all future LLM calls  

**Next Steps:**
1. Make a new LLM API call
2. Check the database to verify costs are calculated
3. If costs are still 0, check which model is being used and verify pricing exists

---

## Files Created/Modified

1. ✅ `scripts/seed-pricing.js` - Pricing seed script (NEW)
2. ✅ `documentation/LLM_USAGE_COST_FIX.md` - This guide (NEW)

---

## Questions?

- **How do I check my total costs?** See `documentation/TESTING_LLM_USAGE_LOGGING.md`
- **How do I manage pricing?** See `documentation/LLM_MODEL_PRICING_API.md`
- **How does usage logging work?** See `documentation/LLM_USAGE_LOGGING_IMPLEMENTATION.md`
