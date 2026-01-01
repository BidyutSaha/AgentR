# LLM Usage Logging Implementation Summary

## Overview

Implemented automatic LLM usage logging for all stage endpoints (intent, queries, score). Every LLM API call is now tracked in the `llm_usage_logs` database table with comprehensive metadata including user, project, paper, token usage, and estimated costs.

---

## What Was Changed

### 1. **Stage Controllers** (`src/controllers/stages.controller.ts`)

Added automatic logging after each LLM call in all three stage endpoints:

- **`postIntent`** - Stage 1: Intent Decomposition
- **`postQueries`** - Stage 2: Query Generation  
- **`postCategorize`** - Paper Scoring (merged stages 5+6+7)

Each controller now:
1. Extracts `userId` from JWT token (via `req.userId`)
2. Extracts optional `projectId` and `paperId` from request body
3. Calls the stage processing service
4. Logs usage to database using `logLlmUsage()` function
5. Returns response to client

### 2. **Request Schemas** (Updated 3 files)

Added optional tracking fields to all stage request schemas:

**`src/services/intent/intent.schema.ts`**
```typescript
{
  abstract: string;
  projectId?: string;  // NEW: Optional UUID
  paperId?: string;    // NEW: Optional UUID
}
```

**`src/services/queries/queries.schema.ts`**
```typescript
{
  abstract: string;
  problem: string;
  // ... other fields
  projectId?: string;  // NEW: Optional UUID
  paperId?: string;    // NEW: Optional UUID
}
```

**`src/services/categorize/categorize.schema.ts`**
```typescript
{
  userAbstract: string;
  candidateAbstract: string;
  projectId?: string;  // NEW: Optional UUID
  paperId?: string;    // NEW: Optional UUID
}
```

### 3. **Documentation** (Updated 2 files)

**`documentation/stage-endpoints-doc.md`**
- Added `projectId` and `paperId` to all request body examples
- Added detailed "Automatic LLM Usage Logging" section to Business Logic Notes
- Explained what data is logged and how costs are calculated

**`documentation/00_PROJECT_STATUS.md`**
- Added entry for 2026-01-01 documenting the implementation
- Listed all changes made

---

## How It Works

### Data Flow

```
1. Client sends request to stage endpoint
   ↓
2. JWT middleware extracts userId from token
   ↓
3. Controller receives request with optional projectId/paperId
   ↓
4. Stage service processes LLM call
   ↓
5. Service returns output + usage metadata
   ↓
6. Controller calls logLlmUsage() with:
   - userId (from JWT)
   - projectId (from request body, optional)
   - paperId (from request body, optional)
   - stage name ('intent', 'queries', or 'score')
   - modelName (from LLM response)
   - inputTokens, outputTokens, totalTokens
   - durationMs, requestId
   ↓
7. logLlmUsage() function:
   - Calculates costs using llm_model_pricing table
   - Creates record in llm_usage_logs table
   - Logs success/failure
   ↓
8. Controller returns response to client
```

### Database Record Created

Each LLM call creates a record in `llm_usage_logs` with:

```typescript
{
  id: UUID,
  userId: string,              // From JWT token
  projectId: string | null,    // From request body (optional)
  paperId: string | null,      // From request body (optional)
  stage: string,               // 'intent', 'queries', or 'score'
  modelName: string,           // e.g., 'gpt-4o-mini'
  provider: string,            // 'openai'
  inputTokens: number,         // Prompt tokens
  outputTokens: number,        // Completion tokens
  totalTokens: number,         // Total tokens
  inputCostCents: number,      // Cost in cents (calculated)
  outputCostCents: number,     // Cost in cents (calculated)
  totalCostCents: number,      // Total cost in cents (calculated)
  durationMs: number,          // API call duration
  requestId: string,           // OpenAI request ID
  status: string,              // 'success' or 'error'
  errorMessage: string | null, // If error occurred
  metadata: string | null,     // JSON string for additional data
  createdAt: timestamp         // When logged
}
```

### Cost Calculation

Costs are automatically calculated using the `calculateCost()` function from `modelPricing.service.ts`:

1. Looks up latest pricing for the model from `llm_model_pricing` table
2. Calculates input cost: `(inputTokens / 1,000,000) * inputUsdCentsPerMillionTokens`
3. Calculates output cost: `(outputTokens / 1,000,000) * outputUsdCentsPerMillionTokens`
4. Returns costs in cents to avoid floating-point issues

---

## Usage Examples

### Example 1: Stage 1 with Project Tracking

```bash
POST /v1/stages/intent
Authorization: Bearer <token>
Content-Type: application/json

{
  "abstract": "We propose a novel deep learning approach...",
  "projectId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Logged Data:**
- userId: (from JWT)
- projectId: "550e8400-e29b-41d4-a716-446655440000"
- paperId: null
- stage: "intent"
- modelName: "gpt-4o-mini"
- inputTokens: 250
- outputTokens: 180
- totalCostCents: 75 (example)

### Example 2: Stage 2 with Project and Paper Tracking

```bash
POST /v1/stages/queries
Authorization: Bearer <token>
Content-Type: application/json

{
  "abstract": "...",
  "problem": "...",
  "methodologies": [...],
  "projectId": "550e8400-e29b-41d4-a716-446655440000",
  "paperId": "660f9511-f39c-52e5-b827-557766551111"
}
```

**Logged Data:**
- userId: (from JWT)
- projectId: "550e8400-e29b-41d4-a716-446655440000"
- paperId: "660f9511-f39c-52e5-b827-557766551111"
- stage: "queries"
- (+ all other usage data)

### Example 3: Paper Scoring without Tracking

```bash
POST /v1/stages/score
Authorization: Bearer <token>
Content-Type: application/json

{
  "userAbstract": "...",
  "candidateAbstract": "..."
}
```

**Logged Data:**
- userId: (from JWT)
- projectId: null
- paperId: null
- stage: "score"
- (+ all other usage data)

---

## Benefits

### 1. **Billing & Cost Tracking**
- Track exact costs per user, project, and paper
- Calculate monthly bills using `getUserTotalCost(userId)`
- Analyze cost per stage/model

### 2. **Usage Analytics**
- Understand which stages are used most
- Identify heavy users
- Optimize model selection based on cost/performance

### 3. **Debugging & Monitoring**
- Track all LLM API calls with request IDs
- Monitor error rates and failures
- Measure API response times

### 4. **Compliance & Auditing**
- Complete audit trail of all LLM usage
- Track which projects/papers consumed resources
- Support for usage-based pricing models

---

## Database Schema

The `llm_usage_logs` table already exists in your database (created in previous migrations). The schema is:

```sql
CREATE TABLE llm_usage_logs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES user_projects(id) ON DELETE SET NULL,
  paper_id UUID REFERENCES candidate_papers(id) ON DELETE SET NULL,
  stage VARCHAR(50) NOT NULL,
  model_name VARCHAR(100) NOT NULL,
  provider VARCHAR(50) DEFAULT 'openai',
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL,
  input_cost_cents INTEGER,
  output_cost_cents INTEGER,
  total_cost_cents INTEGER,
  duration_ms INTEGER,
  request_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'success',
  error_message TEXT,
  metadata TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX idx_llm_usage_logs_user_created ON llm_usage_logs(user_id, created_at);
CREATE INDEX idx_llm_usage_logs_project_created ON llm_usage_logs(project_id, created_at);
CREATE INDEX idx_llm_usage_logs_stage_created ON llm_usage_logs(stage, created_at);
CREATE INDEX idx_llm_usage_logs_created ON llm_usage_logs(created_at);
```

---

## Existing Helper Functions

You already have these helper functions in `llmUsageLogger.service.ts`:

### `getUserTotalCost(userId: string): Promise<number>`
Get total cost (in cents) for a specific user

### `getProjectTotalCost(projectId: string): Promise<number>`
Get total cost (in cents) for a specific project

### `getUserUsageStats(userId: string)`
Get detailed usage statistics grouped by stage and model

---

## Testing

To test the implementation:

1. **Make a stage API call:**
```bash
curl -X POST http://localhost:5000/v1/stages/intent \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "abstract": "Test abstract",
    "projectId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

2. **Check the database:**
```sql
SELECT * FROM llm_usage_logs 
WHERE user_id = '<your-user-id>' 
ORDER BY created_at DESC 
LIMIT 1;
```

3. **Verify the log contains:**
- ✅ Correct userId
- ✅ Correct projectId (if provided)
- ✅ Stage name ('intent', 'queries', or 'score')
- ✅ Model name (e.g., 'gpt-4o-mini')
- ✅ Token counts (input, output, total)
- ✅ Cost calculations (in cents)
- ✅ Duration and request ID

---

## Files Modified

1. ✅ `src/controllers/stages.controller.ts` - Added logging to all 3 endpoints
2. ✅ `src/services/intent/intent.schema.ts` - Added optional projectId/paperId
3. ✅ `src/services/queries/queries.schema.ts` - Added optional projectId/paperId
4. ✅ `src/services/categorize/categorize.schema.ts` - Added optional projectId/paperId
5. ✅ `documentation/stage-endpoints-doc.md` - Updated API documentation
6. ✅ `documentation/00_PROJECT_STATUS.md` - Documented changes

---

## Next Steps (Optional Enhancements)

1. **Add cached token support** - Track cached input tokens separately
2. **Add pricing tier selection** - Allow users to choose batch/standard/priority pricing
3. **Create usage dashboard** - Frontend UI to view usage statistics
4. **Add usage alerts** - Notify users when approaching budget limits
5. **Export usage reports** - Generate CSV/PDF reports for billing

---

## Questions?

If you need to:
- **View usage for a user**: Use `getUserUsageStats(userId)`
- **Calculate total cost**: Use `getUserTotalCost(userId)` or `getProjectTotalCost(projectId)`
- **Query logs directly**: Query `llm_usage_logs` table with appropriate filters
- **Update pricing**: Use the admin model pricing endpoints

All the infrastructure is in place and working! 🎉
