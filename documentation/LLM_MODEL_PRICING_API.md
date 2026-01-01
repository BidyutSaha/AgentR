# LLM Model Pricing Management System

## Overview

The LLM Model Pricing Management system allows administrators to manage pricing information for different LLM models with support for multiple pricing tiers and cached input pricing. This enables dynamic cost calculation based on current pricing, with support for price versioning and historical tracking.

---

## 📑 Table of Contents

### Core Information
- [Features](#features)
- [Database Schema](#database-schema)
- [Pricing Tiers Explained](#pricing-tiers-explained)

### API Endpoints
- [1. Create Model Pricing](#1-create-model-pricing) - `POST /v1/admin/model-pricing`
- [2. List Model Pricing](#2-list-model-pricing) - `GET /v1/admin/model-pricing`
- [3. Update Model Pricing](#3-update-model-pricing) - `PATCH /v1/admin/model-pricing/:id`
- [4. Delete Model Pricing](#4-delete-model-pricing) - `DELETE /v1/admin/model-pricing/:id`

### Examples & Usage
- [Real-World Example: OpenAI GPT-4o Pricing](#real-world-example-openai-gpt-4o-pricing)
- [Admin Authentication](#admin-authentication)
- [Cost Calculation](#cost-calculation)
- [Price Versioning](#price-versioning)

### Reference
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Summary](#summary)
- [Next Steps](#next-steps)

---

## Features

✅ **CRUD Operations** - Create, Read, Update, Delete model pricing entries  
✅ **Multiple Pricing Tiers** - Support for batch, flex, standard, and priority pricing  
✅ **Cached Input Pricing** - Track pricing for cached prompts (prompt caching)  
✅ **Price Versioning** - Track pricing changes over time with effective dates  
✅ **Latest Pricing** - Automatic marking of latest pricing for each model/tier  
✅ **Admin-Only Access** - Secured endpoints accessible only by administrators  
✅ **Cost Calculation** - Automatic cost calculation based on token usage  
✅ **Multi-Provider Support** - Support for different LLM providers (OpenAI, Anthropic, etc.)

---

## Database Schema

### Table: `llm_model_pricing`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `model_name` | VARCHAR(100) | Model identifier (e.g., 'gpt-4o-mini') |
| `provider` | VARCHAR(50) | Provider name (default: 'openai') |
| `pricing_tier` | VARCHAR(50) | Pricing tier: 'batch', 'flex', 'standard', 'priority' |
| `input_usd_cents_per_million_tokens` | INTEGER | Input price in cents per 1M tokens |
| `output_usd_cents_per_million_tokens` | INTEGER | Output price in cents per 1M tokens |
| `cached_input_usd_cents_per_million_tokens` | INTEGER (nullable) | Cached input price in cents per 1M tokens |
| `is_active` | BOOLEAN | Whether this pricing is active |
| `is_latest` | BOOLEAN | Whether this is the latest pricing for the model/tier |
| `description` | TEXT | Optional description |
| `notes` | TEXT | Admin notes about pricing changes |
| `effective_from` | TIMESTAMP | When this pricing becomes effective |
| `effective_to` | TIMESTAMP | When this pricing expires (null = current) |
| `created_at` | TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | Last update time |

### Indexes

- `UNIQUE (model_name, provider, pricing_tier, effective_from)` - Prevent duplicate pricing
- `INDEX (model_name, provider, pricing_tier, is_latest)` - Quick lookup of latest pricing
- `INDEX (is_active, is_latest)` - Query active and latest prices
- `INDEX (effective_from)` - Time-based queries

---

## Pricing Tiers Explained

OpenAI and other providers offer different pricing tiers based on usage patterns:

| Tier | Description | Use Case | Typical Discount |
|------|-------------|----------|------------------|
| **batch** | Batch API pricing | Async, non-urgent tasks | ~50% off |
| **flex** | Flexible pricing | Variable workloads | ~25% off |
| **standard** | Standard pricing | Regular API usage | Base price |
| **priority** | Priority access | High-priority, low-latency | Premium pricing |

---

## API Endpoints

All endpoints require **admin authentication**.

### 1. Create Model Pricing

**POST** `/v1/admin/model-pricing`

**Authentication**: Required (Admin only)

**Request Body**:
```json
{
  "modelName": "gpt-4o",
  "provider": "openai",
  "pricingTier": "standard",
  "inputUsdCentsPerMillionTokens": 2500000,
  "outputUsdCentsPerMillionTokens": 10000000,
  "cachedInputUsdCentsPerMillionTokens": 1250000,
  "description": "GPT-4o Standard Tier with prompt caching",
  "notes": "Initial pricing as of Jan 2026",
  "effectiveFrom": "2026-01-01T00:00:00Z"
}
```

**Field Descriptions**:
- `modelName` (required) - Model identifier (e.g., 'gpt-4o', 'gpt-4o-mini')
- `provider` (optional, default: 'openai') - Provider name
- `pricingTier` (optional, default: 'standard') - One of: 'batch', 'flex', 'standard', 'priority'
- `inputUsdCentsPerMillionTokens` (required) - Input price in cents per 1M tokens
- `outputUsdCentsPerMillionTokens` (required) - Output price in cents per 1M tokens
- `cachedInputUsdCentsPerMillionTokens` (optional) - Cached input price in cents per 1M tokens
- `description` (optional) - Human-readable description
- `notes` (optional) - Admin notes
- `effectiveFrom` (optional) - When pricing becomes effective (ISO 8601)

**Response** (201 Created):
```json
{
  "data": {
    "id": "uuid",
    "modelName": "gpt-4o",
    "provider": "openai",
    "pricingTier": "standard",
    "inputUsdCentsPerMillionTokens": 2500000,
    "outputUsdCentsPerMillionTokens": 10000000,
    "cachedInputUsdCentsPerMillionTokens": 1250000,
    "isActive": true,
    "isLatest": true,
    "description": "GPT-4o Standard Tier with prompt caching",
    "notes": "Initial pricing as of Jan 2026",
    "effectiveFrom": "2026-01-01T00:00:00.000Z",
    "effectiveTo": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  "meta": {
    "requestId": "req_123"
  }
}
```

---

### 2. List Model Pricing

**GET** `/v1/admin/model-pricing`

**Authentication**: Required (Admin only)

**Query Parameters**:
- `provider` (optional) - Filter by provider (e.g., 'openai')
- `modelName` (optional) - Filter by model name (e.g., 'gpt-4o')
- `pricingTier` (optional) - Filter by tier: 'batch', 'flex', 'standard', 'priority'
- `isActive` (optional) - Filter by active status ('true' or 'false')
- `isLatest` (optional) - Filter by latest status ('true' or 'false')
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 50) - Items per page

**Example Requests**:
```bash
# Get all latest standard tier pricing
GET /v1/admin/model-pricing?pricingTier=standard&isLatest=true

# Get all pricing for gpt-4o across all tiers
GET /v1/admin/model-pricing?modelName=gpt-4o&provider=openai

# Get batch tier pricing only
GET /v1/admin/model-pricing?pricingTier=batch&isActive=true
```

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "uuid",
      "modelName": "gpt-4o",
      "provider": "openai",
      "pricingTier": "standard",
      "inputUsdCentsPerMillionTokens": 2500000,
      "outputUsdCentsPerMillionTokens": 10000000,
      "cachedInputUsdCentsPerMillionTokens": 1250000,
      "isActive": true,
      "isLatest": true,
      "description": "GPT-4o Standard Tier",
      "notes": null,
      "effectiveFrom": "2026-01-01T00:00:00.000Z",
      "effectiveTo": null,
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "requestId": "req_123",
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

### 3. Update Model Pricing

**PATCH** `/v1/admin/model-pricing/:id`

**Authentication**: Required (Admin only)

**Request Body** (all fields optional):
```json
{
  "inputUsdCentsPerMillionTokens": 3000000,
  "outputUsdCentsPerMillionTokens": 12000000,
  "cachedInputUsdCentsPerMillionTokens": 1500000,
  "description": "Updated pricing",
  "notes": "Price increase due to market changes",
  "isActive": true,
  "isLatest": true,
  "effectiveTo": "2026-12-31T23:59:59Z"
}
```

**Response** (200 OK):
```json
{
  "data": {
    "id": "uuid",
    "modelName": "gpt-4o",
    "provider": "openai",
    "pricingTier": "standard",
    "inputUsdCentsPerMillionTokens": 3000000,
    "outputUsdCentsPerMillionTokens": 12000000,
    "cachedInputUsdCentsPerMillionTokens": 1500000,
    ...
  },
  "meta": {
    "requestId": "req_123"
  }
}
```

---

### Field Update Rules

**Important:** Not all fields can be updated. Some fields are immutable to maintain data integrity and historical accuracy.

#### ✅ **Updatable Fields**

These fields can be modified via `PATCH /v1/admin/model-pricing/:id`:

| Field | Type | Description |
|-------|------|-------------|
| `inputUsdCentsPerMillionTokens` | number | Input token price |
| `outputUsdCentsPerMillionTokens` | number | Output token price |
| `cachedInputUsdCentsPerMillionTokens` | number \| null | Cached input price (optional) |
| `description` | string | Human-readable description |
| `notes` | string \| null | Admin notes (optional) |
| `isActive` | boolean | Active status flag |
| `isLatest` | boolean | Latest version flag |
| `effectiveTo` | string \| null | Expiration date (optional) |

**Example - Minimal Update:**
```json
{
  "inputUsdCentsPerMillionTokens": 200,
  "notes": "Price updated for 2026"
}
```

**Example - Full Update:**
```json
{
  "inputUsdCentsPerMillionTokens": 200,
  "outputUsdCentsPerMillionTokens": 300,
  "cachedInputUsdCentsPerMillionTokens": 100,
  "description": "Updated pricing",
  "notes": "Price increase due to market changes",
  "isActive": true,
  "isLatest": true,
  "effectiveTo": "2026-12-31T23:59:59Z"
}
```

---

#### ❌ **Non-Updatable Fields (Immutable)**

These fields **cannot** be changed after creation:

| Field | Reason |
|-------|--------|
| `id` | Primary key (use in URL, not body) |
| `modelName` | Part of unique identity |
| `provider` | Part of unique identity |
| `pricingTier` | Part of unique identity |
| `effectiveFrom` | Historical record integrity |
| `createdAt` | System-managed timestamp |
| `updatedAt` | Auto-updated by database |

**Why these restrictions?**

1. **Data Integrity** - `modelName`, `provider`, and `pricingTier` form a compound unique key
2. **Historical Accuracy** - Changing identity fields would corrupt pricing history
3. **Audit Trail** - Each model's pricing timeline remains intact
4. **Prevents Accidents** - Can't accidentally change "gpt-4o" to "gpt-3.5-turbo"

---

#### 🔄 **If You Need to Change Immutable Fields**

**Option 1: Create New + Deactivate Old (Recommended)**
```bash
# 1. Create new pricing with correct values
POST /v1/admin/model-pricing
{
  "modelName": "correct-model-name",
  "provider": "openai",
  "pricingTier": "standard",
  "inputUsdCentsPerMillionTokens": 200,
  "outputUsdCentsPerMillionTokens": 300
}

# 2. Deactivate old incorrect record
PATCH /v1/admin/model-pricing/{old-id}
{
  "isActive": false,
  "isLatest": false
}
```

**Option 2: Delete and Recreate**
```bash
# 1. Delete incorrect record
DELETE /v1/admin/model-pricing/{id}

# 2. Create new record
POST /v1/admin/model-pricing
{
  "modelName": "correct-model-name",
  ...
}
```

---

#### 💡 **Handling Null Values**

Optional fields can be set to `null` or omitted entirely:

```json
// Both are valid:

// Option A: Send null explicitly
{
  "cachedInputUsdCentsPerMillionTokens": null,
  "notes": null,
  "effectiveTo": null
}

// Option B: Omit null fields (cleaner)
{
  // Just don't include them
}
```

---

#### 📊 **Understanding Price Values**

Prices are stored as **USD cents per million tokens**:

| Value | Meaning | Actual Cost |
|-------|---------|-------------|
| `100` | 100 cents per 1M tokens | **$1.00** per 1M tokens |
| `200` | 200 cents per 1M tokens | **$2.00** per 1M tokens |
| `150000` | 150,000 cents per 1M tokens | **$1,500.00** per 1M tokens |
| `2500000` | 2,500,000 cents per 1M tokens | **$25,000.00** per 1M tokens |

**Formula:**
```
USD Amount = Value / 100
```

**Examples:**
- To store **$2.00** per 1M tokens → use `200`
- To store **$15.50** per 1M tokens → use `1550`
- To store **$0.25** per 1M tokens → use `25`

---

### 4. Delete Model Pricing

**DELETE** `/v1/admin/model-pricing/:id`

**Authentication**: Required (Admin only)

**Response** (200 OK):
```json
{
  "data": {
    "message": "Model pricing deleted successfully"
  },
  "meta": {
    "requestId": "req_123"
  }
}
```

---

## Real-World Example: OpenAI GPT-4o Pricing

Based on OpenAI's actual pricing structure, here's how you'd set up all tiers for GPT-4o:

### Standard Tier
```json
{
  "modelName": "gpt-4o",
  "pricingTier": "standard",
  "inputUsdCentsPerMillionTokens": 2500000,      // $2.50
  "outputUsdCentsPerMillionTokens": 10000000,    // $10.00
  "cachedInputUsdCentsPerMillionTokens": 1250000 // $1.25 (50% off)
}
```

### Batch Tier (50% discount)
```json
{
  "modelName": "gpt-4o",
  "pricingTier": "batch",
  "inputUsdCentsPerMillionTokens": 1250000,      // $1.25
  "outputUsdCentsPerMillionTokens": 5000000,     // $5.00
  "cachedInputUsdCentsPerMillionTokens": 625000  // $0.625
}
```

### Priority Tier (premium pricing)
```json
{
  "modelName": "gpt-4o",
  "pricingTier": "priority",
  "inputUsdCentsPerMillionTokens": 3750000,      // $3.75 (50% premium)
  "outputUsdCentsPerMillionTokens": 15000000,    // $15.00
  "cachedInputUsdCentsPerMillionTokens": 1875000 // $1.875
}
```

---

## Admin Authentication

### Setup

Add admin emails to `.env`:

```bash
ADMIN_EMAILS=admin@example.com,superadmin@example.com
```

Multiple emails can be comma-separated.

### How It Works

1. User must be authenticated (valid JWT token)
2. User's email is checked against `ADMIN_EMAILS` environment variable
3. If email matches, admin access is granted
4. If not, `403 Forbidden` is returned

### Future Enhancement

In the future, this can be extended to use a `role` field in the `users` table:

```sql
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';
-- Then check: user.role === 'admin'
```

---

## Cost Calculation

### Service Function

```typescript
import { calculateCost } from '../services/modelPricing/modelPricing.service';

const cost = await calculateCost(
  'gpt-4o',       // modelName
  1000,           // inputTokens
  500,            // outputTokens
  'openai'        // provider (optional, default: 'openai')
);

console.log(cost);
// {
//   inputCostCents: 2500,    // $0.025
//   outputCostCents: 5000,   // $0.050
//   totalCostCents: 7500     // $0.075
// }
```

### With Cached Inputs

If your model supports prompt caching and you want to calculate costs with cached inputs:

```typescript
// You'll need to extend the calculateCost function to support cached tokens
const pricing = await getLatestModelPricing('gpt-4o', 'openai', 'standard');

const inputCost = (regularInputTokens / 1_000_000) * pricing.inputUsdCentsPerMillionTokens;
const cachedInputCost = (cachedInputTokens / 1_000_000) * pricing.cachedInputUsdCentsPerMillionTokens;
const outputCost = (outputTokens / 1_000_000) * pricing.outputUsdCentsPerMillionTokens;

const totalCostCents = Math.round(inputCost + cachedInputCost + outputCost);
```

### Integration with LLM Usage Logs

When logging LLM usage, calculate and store costs:

```typescript
const { inputCostCents, outputCostCents, totalCostCents } = await calculateCost(
  modelName,
  inputTokens,
  outputTokens
);

await prisma.llmUsageLog.create({
  data: {
    userId,
    stage,
    modelName,
    inputTokens,
    outputTokens,
    totalTokens,
    inputCostCents,
    outputCostCents,
    totalCostCents,
    // ... other fields
  }
});
```

---

## Price Versioning

### How It Works

1. When creating a new pricing entry for a model/tier, previous "latest" entries are automatically marked as `isLatest = false`
2. The `effectiveTo` date of previous entries is set to the `effectiveFrom` date of the new entry
3. This creates a complete pricing history per tier

### Example Timeline

```
Model: gpt-4o, Tier: standard

2026-01-01: $2.50/$10.00 (isLatest: true, effectiveTo: null)
2026-03-01: $3.00/$12.00 (isLatest: true, effectiveTo: null)
            Previous entry updated: (isLatest: false, effectiveTo: 2026-03-01)
```

### Querying Historical Pricing

```sql
SELECT * FROM llm_model_pricing
WHERE model_name = 'gpt-4o'
  AND provider = 'openai'
  AND pricing_tier = 'standard'
  AND effective_from <= '2026-02-15'
  AND (effective_to IS NULL OR effective_to > '2026-02-15')
ORDER BY effective_from DESC
LIMIT 1;
```

---

## Error Handling

### Common Errors

| Status | Error Code | Description |
|--------|------------|-------------|
| 401 | `UNAUTHORIZED` | No authentication token provided |
| 403 | `FORBIDDEN` | Admin access required |
| 404 | `NOT_FOUND` | Model pricing not found |
| 400 | `VALIDATION_ERROR` | Invalid input data |
| 500 | `INTERNAL_ERROR` | Server error |

### Example Error Response

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Admin access required"
  },
  "meta": {
    "requestId": "req_123"
  }
}
```

---

## Testing

### Manual Testing with cURL

```bash
# 1. Login as admin
curl -X POST http://localhost:5000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"yourpassword"}'

# Save the access token
TOKEN="your_access_token_here"

# 2. Create pricing for standard tier
curl -X POST http://localhost:5000/v1/admin/model-pricing \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "modelName": "gpt-4o",
    "provider": "openai",
    "pricingTier": "standard",
    "inputUsdCentsPerMillionTokens": 2500000,
    "outputUsdCentsPerMillionTokens": 10000000,
    "cachedInputUsdCentsPerMillionTokens": 1250000,
    "description": "GPT-4o Standard Tier"
  }'

# 3. Create pricing for batch tier
curl -X POST http://localhost:5000/v1/admin/model-pricing \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "modelName": "gpt-4o",
    "provider": "openai",
    "pricingTier": "batch",
    "inputUsdCentsPerMillionTokens": 1250000,
    "outputUsdCentsPerMillionTokens": 5000000,
    "cachedInputUsdCentsPerMillionTokens": 625000,
    "description": "GPT-4o Batch Tier (50% discount)"
  }'

# 4. List all pricing for gpt-4o
curl -X GET "http://localhost:5000/v1/admin/model-pricing?modelName=gpt-4o" \
  -H "Authorization: Bearer $TOKEN"

# 5. List only standard tier pricing
curl -X GET "http://localhost:5000/v1/admin/model-pricing?pricingTier=standard&isLatest=true" \
  -H "Authorization: Bearer $TOKEN"

# 6. Update pricing
curl -X PATCH http://localhost:5000/v1/admin/model-pricing/{id} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "inputUsdCentsPerMillionTokens": 3000000,
    "notes": "Price increase"
  }'

# 7. Delete pricing
curl -X DELETE http://localhost:5000/v1/admin/model-pricing/{id} \
  -H "Authorization: Bearer $TOKEN"
```

---

## Summary

The LLM Model Pricing Management system provides a complete solution for:
- ✅ Managing LLM model pricing with **multiple tiers** (batch, flex, standard, priority)
- ✅ Supporting **cached input pricing** for models with prompt caching
- ✅ **Price versioning** and historical tracking
- ✅ **Admin-only access control**
- ✅ Automatic **cost calculation** based on token usage
- ✅ Integration with usage logging

All endpoints are secured and require admin authentication.

---

## Next Steps

1. ✅ Add `ADMIN_EMAILS` to `.env` file
2. ✅ Populate pricing data for different tiers
3. ✅ Test admin endpoints
4. 🔄 Integrate cost calculation into LLM usage logging
5. 🔄 Create admin dashboard for pricing management
6. 🔄 Add role-based access control (RBAC) to User model
