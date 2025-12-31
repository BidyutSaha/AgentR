# Stage 5+6: Semantic Matching & Dual-Category Evaluation

## Overview

This merged stage combines the original Stage 5 (Semantic Matching) and Stage 6 (Ranking & Scoring) into a single, comprehensive evaluation endpoint. Each candidate paper receives a **dual-category evaluation** with both:

1. **C1 (Direct Competitor)** assessment
2. **C2 (Supporting Work)** assessment

## Why Merge?

### Benefits
- ✅ **Single LLM Pass**: Reduces API calls and latency
- ✅ **Richer Context**: Similarity metrics inform categorization decisions
- ✅ **Dual Scoring**: Papers can be strong C1, strong C2, or both
- ✅ **Cost Efficient**: One API call instead of two
- ✅ **Maintains Parallelization**: Can still process multiple papers in parallel

### Trade-offs
- ⚠️ Slightly more complex output schema
- ⚠️ Single point of failure (but with comprehensive error handling)

## Architecture

```
User Abstract + Candidate Abstract
          ↓
    [LLM Evaluation]
          ↓
    ┌─────────────────┐
    │ Semantic Metrics│
    ├─────────────────┤
    │ - Similarity    │
    │ - Overlaps      │
    └─────────────────┘
          ↓
    ┌─────────────────┐
    │ C1 Evaluation   │
    ├─────────────────┤
    │ - Score         │
    │ - Justification │
    │ - Strengths     │
    │ - Weaknesses    │
    └─────────────────┘
          ↓
    ┌─────────────────┐
    │ C2 Evaluation   │
    ├─────────────────┤
    │ - Score         │
    │ - Justification │
    │ - Type          │
    │ - Areas         │
    └─────────────────┘
```

## API Endpoint

**POST** `/v1/stages/categorize`

### Request Body

```typescript
{
  userAbstract: string;          // Min 10 chars
  candidateAbstract: string;     // Min 10 chars
}
```

### Response Body

```typescript
{
  data: {
    stage: "categorize";
    version: "1.0";
    generatedAt: string;
    output: {
      userAbstract: string;
      candidateAbstract: string;
      
      // Semantic Metrics
      semantic_similarity: number;      // 0.0 - 1.0
      problem_overlap: "none" | "low" | "medium" | "high";
      method_overlap: "none" | "low" | "medium" | "high";
      domain_overlap: "none" | "low" | "medium" | "high";
      constraint_overlap: "none" | "low" | "medium" | "high";
      
      // C1: Direct Competitor
      c1_score: number;                 // 0.0 - 10.0
      c1_justification: string;
      c1_strengths: string[];
      c1_weaknesses: string[];
      
      // C2: Supporting Work
      c2_score: number;                 // 0.0 - 10.0
      c2_justification: string;
      c2_contribution_type: 
        | "methodology"
        | "problem_context"
        | "domain_knowledge"
        | "constraint_analysis"
        | "related_application"
        | "theoretical_foundation";
      c2_relevance_areas: string[];
    }
  };
  meta: {
    requestId: string;
  }
}
```

## Scoring Guidelines

### C1 Score (Direct Competitor)
- **9-10**: Near-identical problem and method
- **7-8**: Same problem, similar method with variations
- **5-6**: Same problem, different method OR different problem, same method
- **3-4**: Partial overlap in both problem and method
- **0-2**: Minimal overlap, not a direct competitor

### C2 Score (Supporting Work)
- **9-10**: Highly relevant supporting work, critical for literature review
- **7-8**: Strong supporting work, important context
- **5-6**: Moderate relevance, useful background
- **3-4**: Tangential relevance, minor support
- **0-2**: Minimal relevance, weak support

## Usage Examples

### Example 1: Direct Competitor (High C1)

```bash
curl -X POST http://localhost:3000/v1/stages/categorize \
  -H "Content-Type: application/json" \
  -d '{
    "userAbstract": "We propose a low-power TinyML-based multitask model for real-time face tracking on microcontrollers.",
    "candidateAbstract": "This paper presents an efficient TinyML framework for real-time facial landmark tracking on resource-constrained embedded systems."
  }'
```

**Expected**: High C1 score (8-10), moderate C2 score (5-7)

### Example 2: Supporting Work (High C2)

```bash
curl -X POST http://localhost:3000/v1/stages/categorize \
  -H "Content-Type: application/json" \
  -d '{
    "userAbstract": "We propose a low-power TinyML-based multitask model for real-time face tracking on microcontrollers.",
    "candidateAbstract": "We present a comprehensive survey of machine learning optimization techniques for resource-constrained embedded devices."
  }'
```

**Expected**: Moderate C1 score (3-5), high C2 score (7-9)

## File Structure

```
src/
├── prompts/
│   └── prompts.stage5.ts          # LLM prompts
├── services/
│   └── categorize/
│       ├── categorize.schema.ts   # Zod schemas
│       └── categorize.service.ts  # Business logic
├── controllers/
│   └── stages.controller.ts       # postCategorize handler
└── routes/
    └── stages.routes.ts           # /categorize route

documentation/
└── testing/
    ├── TESTING_STAGE5.md          # Comprehensive test guide
    └── stage5-api-tests.http      # HTTP test file
```

## Testing

See [`TESTING_STAGE5.md`](../../documentation/testing/TESTING_STAGE5.md) for comprehensive testing guide.

Quick test:
```bash
# Start the server
npm run dev

# In another terminal, run a test
curl -X POST http://localhost:3000/v1/stages/categorize \
  -H "Content-Type: application/json" \
  -d '{
    "userAbstract": "We propose a low-power TinyML model for face tracking.",
    "candidateAbstract": "This paper presents TinyML for face detection on embedded systems."
  }'
```

## Error Handling

All errors follow the standard API error format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "User abstract must be at least 10 characters",
    "details": { ... }
  },
  "meta": {
    "requestId": "uuid"
  }
}
```

Common error codes:
- `VALIDATION_ERROR`: Invalid input (400)
- `LLM_ERROR`: LLM API failure (500)
- `INTERNAL_ERROR`: Unexpected error (500)

## Performance

- **Average Response Time**: 3-5 seconds (depends on LLM API)
- **Parallelization**: Can process multiple papers concurrently
- **Temperature**: 0.4 (balanced between consistency and nuance)

## Future Enhancements

- [ ] Add caching for repeated evaluations
- [ ] Support batch evaluation (multiple candidates at once)
- [ ] Add confidence scores for each metric
- [ ] Support custom scoring weights
- [ ] Add explanation for overlap assessments

## Related Documentation

- [Main Pipeline Documentation](../../documentation/idea.md)
- [Stage 1: Intent Decomposition](../../documentation/testing/TESTING_STAGE1.md)
- [Stage 2: Query Generation](../../documentation/testing/TESTING_STAGE2.md)
