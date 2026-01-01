# Testing LLM Usage Logging

## Quick Test Guide

### Prerequisites
1. Backend server running (`npm run dev`)
2. Valid JWT token (login first)
3. Optional: A project ID and/or paper ID

---

## Test 1: Stage 1 (Intent) - Basic Usage

### Request
```bash
curl -X POST http://localhost:5000/v1/stages/intent \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "abstract": "We propose a novel deep learning approach for image classification using convolutional neural networks with attention mechanisms."
  }'
```

### Expected Response
```json
{
  "data": {
    "stage": "intent",
    "version": "1.0",
    "generatedAt": "2026-01-01T...",
    "output": {
      "abstract": "We propose a novel...",
      "problem": "Image classification accuracy improvement",
      "methodologies": ["Deep Learning", "CNN", "Attention Mechanisms"],
      ...
    },
    "usage": {
      "modelName": "gpt-4o-mini",
      "inputTokens": 250,
      "outputTokens": 180,
      "totalTokens": 430,
      "durationMs": 1850,
      "requestId": "req_abc123"
    }
  },
  "meta": {
    "requestId": "req_456"
  }
}
```

### Verify in Database
```sql
SELECT 
  id,
  user_id,
  project_id,
  paper_id,
  stage,
  model_name,
  input_tokens,
  output_tokens,
  total_cost_cents,
  created_at
FROM llm_usage_logs
WHERE stage = 'intent'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected Result:**
- ✅ `user_id` = your user ID (from JWT)
- ✅ `project_id` = NULL (not provided)
- ✅ `paper_id` = NULL (not provided)
- ✅ `stage` = 'intent'
- ✅ `model_name` = 'gpt-4o-mini'
- ✅ `input_tokens` = ~250
- ✅ `output_tokens` = ~180
- ✅ `total_cost_cents` = calculated value (e.g., 75 cents)

---

## Test 2: Stage 1 (Intent) - With Project Tracking

### Request
```bash
curl -X POST http://localhost:5000/v1/stages/intent \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "abstract": "We propose a novel deep learning approach...",
    "projectId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

### Verify in Database
```sql
SELECT 
  user_id,
  project_id,
  stage,
  total_cost_cents
FROM llm_usage_logs
WHERE project_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected Result:**
- ✅ `project_id` = '550e8400-e29b-41d4-a716-446655440000'
- ✅ All other fields populated correctly

---

## Test 3: Stage 2 (Queries) - With Project and Paper Tracking

### Request
```bash
curl -X POST http://localhost:5000/v1/stages/queries \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "abstract": "We propose a novel deep learning approach...",
    "problem": "Image classification accuracy improvement",
    "methodologies": ["Deep Learning", "CNN"],
    "applicationDomains": ["Computer Vision"],
    "constraints": ["Computational efficiency"],
    "contributionTypes": ["Novel Architecture"],
    "keywords_seed": ["deep learning", "CNN", "attention"],
    "projectId": "550e8400-e29b-41d4-a716-446655440000",
    "paperId": "660f9511-f39c-52e5-b827-557766551111"
  }'
```

### Verify in Database
```sql
SELECT 
  user_id,
  project_id,
  paper_id,
  stage,
  model_name,
  total_tokens,
  total_cost_cents
FROM llm_usage_logs
WHERE paper_id = '660f9511-f39c-52e5-b827-557766551111'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected Result:**
- ✅ `project_id` = '550e8400-e29b-41d4-a716-446655440000'
- ✅ `paper_id` = '660f9511-f39c-52e5-b827-557766551111'
- ✅ `stage` = 'queries'

---

## Test 4: Stage 3 (Score) - Paper Scoring

### Request
```bash
curl -X POST http://localhost:5000/v1/stages/score \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "userAbstract": "We propose a novel attention-based approach for image classification...",
    "candidateAbstract": "This paper presents a convolutional neural network for object detection...",
    "projectId": "550e8400-e29b-41d4-a716-446655440000",
    "paperId": "660f9511-f39c-52e5-b827-557766551111"
  }'
```

### Verify in Database
```sql
SELECT 
  stage,
  model_name,
  input_tokens,
  output_tokens,
  total_cost_cents
FROM llm_usage_logs
WHERE stage = 'score'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected Result:**
- ✅ `stage` = 'score'
- ✅ Higher token counts (scoring uses more tokens)

---

## Test 5: Check Total User Cost

### Query
```sql
SELECT 
  SUM(total_cost_cents) as total_cost_cents,
  SUM(total_cost_cents) / 100.0 as total_cost_usd,
  COUNT(*) as total_calls
FROM llm_usage_logs
WHERE user_id = 'YOUR_USER_ID_HERE';
```

### Or Use Helper Function (in code)
```typescript
import { getUserTotalCost } from './services/llmUsageLogger.service';

const totalCostCents = await getUserTotalCost('YOUR_USER_ID_HERE');
console.log(`Total cost: $${(totalCostCents / 100).toFixed(2)}`);
```

---

## Test 6: Check Project Cost

### Query
```sql
SELECT 
  SUM(total_cost_cents) as total_cost_cents,
  SUM(total_cost_cents) / 100.0 as total_cost_usd,
  COUNT(*) as total_calls,
  stage,
  model_name
FROM llm_usage_logs
WHERE project_id = '550e8400-e29b-41d4-a716-446655440000'
GROUP BY stage, model_name
ORDER BY total_cost_cents DESC;
```

### Or Use Helper Function (in code)
```typescript
import { getProjectTotalCost } from './services/llmUsageLogger.service';

const totalCostCents = await getProjectTotalCost('550e8400-e29b-41d4-a716-446655440000');
console.log(`Project cost: $${(totalCostCents / 100).toFixed(2)}`);
```

---

## Test 7: Get User Usage Statistics

### Using Helper Function (in code)
```typescript
import { getUserUsageStats } from './services/llmUsageLogger.service';

const stats = await getUserUsageStats('YOUR_USER_ID_HERE');
console.log(stats);
```

### Expected Output
```javascript
[
  {
    stage: 'intent',
    modelName: 'gpt-4o-mini',
    totalCalls: 5,
    totalInputTokens: 1250,
    totalOutputTokens: 900,
    totalTokens: 2150,
    totalCostCents: 375,
    totalCostUsd: '3.75'
  },
  {
    stage: 'queries',
    modelName: 'gpt-4o-mini',
    totalCalls: 3,
    totalInputTokens: 960,
    totalOutputTokens: 450,
    totalTokens: 1410,
    totalCostCents: 245,
    totalCostUsd: '2.45'
  },
  {
    stage: 'score',
    modelName: 'gpt-4o-mini',
    totalCalls: 2,
    totalInputTokens: 900,
    totalOutputTokens: 560,
    totalTokens: 1460,
    totalCostCents: 280,
    totalCostUsd: '2.80'
  }
]
```

---

## Test 8: View All Logs for a User

### Query
```sql
SELECT 
  id,
  stage,
  model_name,
  input_tokens,
  output_tokens,
  total_cost_cents,
  duration_ms,
  status,
  created_at
FROM llm_usage_logs
WHERE user_id = 'YOUR_USER_ID_HERE'
ORDER BY created_at DESC
LIMIT 10;
```

---

## Test 9: Check Cost Calculation

### Verify Pricing Table
```sql
SELECT 
  model_name,
  pricing_tier,
  input_usd_cents_per_million_tokens,
  output_usd_cents_per_million_tokens,
  is_latest
FROM llm_model_pricing
WHERE model_name = 'gpt-4o-mini'
  AND is_latest = true
  AND is_active = true;
```

### Manual Cost Calculation
If pricing shows:
- Input: 15 cents per 1M tokens
- Output: 60 cents per 1M tokens

And usage shows:
- Input tokens: 250
- Output tokens: 180

Then:
- Input cost = (250 / 1,000,000) × 15 = 0.00375 cents
- Output cost = (180 / 1,000,000) × 60 = 0.0108 cents
- Total cost = 0.01455 cents (rounded to 0 or 1 cent)

**Note:** For small token counts, costs may round to 0 cents. Real usage will have higher token counts.

---

## Test 10: Error Handling

### Test with Invalid Token
```bash
curl -X POST http://localhost:5000/v1/stages/intent \
  -H "Authorization: Bearer INVALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "abstract": "Test"
  }'
```

**Expected:** 401 Unauthorized error, NO log entry created

### Test with Invalid UUID
```bash
curl -X POST http://localhost:5000/v1/stages/intent \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "abstract": "Test",
    "projectId": "not-a-valid-uuid"
  }'
```

**Expected:** 400 Validation error, NO log entry created

---

## Monitoring Logs

### Watch Logs in Real-Time
```bash
# In your backend directory
npm run dev

# In another terminal, tail the logs
tail -f logs/combined.log | grep llm_usage
```

### Check for Logging Errors
```sql
SELECT 
  error_message,
  COUNT(*) as error_count
FROM llm_usage_logs
WHERE status = 'error'
GROUP BY error_message
ORDER BY error_count DESC;
```

---

## Success Criteria

After running tests, verify:

- ✅ All successful LLM calls create log entries
- ✅ `user_id` is always populated (from JWT)
- ✅ `project_id` and `paper_id` are populated when provided
- ✅ `stage` matches the endpoint called
- ✅ Token counts match LLM response
- ✅ Costs are calculated and non-null
- ✅ `duration_ms` is populated
- ✅ `request_id` matches OpenAI response
- ✅ `status` is 'success' for successful calls
- ✅ Timestamps are correct

---

## Troubleshooting

### No log entry created
- Check if `logLlmUsage()` is being called (add console.log)
- Check database connection
- Check for errors in server logs

### Cost is NULL
- Verify pricing table has entry for the model
- Check `is_latest` and `is_active` flags
- Run `calculateCost()` manually to test

### Wrong user_id
- Verify JWT token is valid
- Check `req.userId` is set by auth middleware
- Verify auth middleware is applied to route

### projectId/paperId not logged
- Verify you're sending them in request body
- Check request body validation
- Verify schema allows optional fields

---

## Next Steps

Once testing is complete:
1. Monitor logs for a few days
2. Analyze usage patterns
3. Set up billing alerts if needed
4. Create usage dashboard (optional)
5. Export reports for accounting (optional)
