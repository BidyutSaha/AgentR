# LLM Pipeline Endpoints Documentation

This content should be inserted into `03_API.md` before the "LLM Usage Tracking Endpoints" section (around line 1739).

---

## LLM Pipeline Endpoints

### POST /v1/stages/intent

**Description**: Stage 1 - Decompose research abstract into structured intent components (problem, domain, constraints, methodologies, contribution types, keywords).

**Authentication**: Required (JWT)  
**Roles**: Authenticated User

---

#### Input Structure

**Request Body**:
```typescript
{
  abstract: string;        // Research abstract (max 5000 characters)
  projectId?: string;      // Optional: UUID of project (for usage tracking)
  paperId?: string;        // Optional: UUID of paper (for usage tracking)
}
```

**Headers**:
- `Authorization: Bearer <accessToken>` (required)

---

#### Output Structure

**Success Response** (200 OK):
```typescript
{
  data: {
    stage: "intent";
    version: "1.0";
    generatedAt: string;     // ISO 8601 timestamp
    output: {
      abstract: string;
      problem: string;
      domain: string;
      constraints: string[];
      methodologies: string[];
      applicationDomains: string[];
      contributionTypes: string[];
      keywords_seed: string[];
    };
    usage: {
      modelName: string;       // e.g., "gpt-4o-mini"
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
      durationMs: number;
      requestId: string;
    };
  };
  meta: {
    requestId: string;
  };
}
```

---

#### Sample Request

```bash
POST /v1/stages/intent
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "abstract": "We propose a novel deep learning approach for image classification using convolutional neural networks with attention mechanisms. Our method achieves state-of-the-art results on ImageNet dataset."
}
```

---

#### Sample Response

**Success (200 OK)**:
```json
{
  "data": {
    "stage": "intent",
    "version": "1.0",
    "generatedAt": "2025-12-31T18:00:00.000Z",
    "output": {
      "abstract": "We propose a novel deep learning approach...",
      "problem": "Image classification accuracy improvement",
      "domain": "Computer Vision",
      "constraints": ["Computational efficiency", "Model interpretability"],
      "methodologies": ["Deep Learning", "Convolutional Neural Networks", "Attention Mechanisms"],
      "applicationDomains": ["Image Recognition", "Computer Vision"],
      "contributionTypes": ["Novel Architecture", "Performance Improvement"],
      "keywords_seed": ["deep learning", "CNN", "attention", "image classification", "ImageNet"]
    },
    "usage": {
      "modelName": "gpt-4o-mini",
      "inputTokens": 250,
      "outputTokens": 180,
      "totalTokens": 430,
      "durationMs": 1850,
      "requestId": "req_abc123xyz"
    }
  },
  "meta": {
    "requestId": "req_456def"
  }
}
```

---

#### Error Cases

| Status | Error Code | Description | Example |
|--------|------------|-------------|---------|
| 400 | `VALIDATION_ERROR` | Invalid input data | Abstract too long (>5000 chars) |
| 401 | `UNAUTHORIZED` | Missing/invalid token | Token expired |
| 500 | `LLM_ERROR` | OpenAI API error | Rate limit exceeded |
| 500 | `INTERNAL_ERROR` | Server error | JSON parse error |

**Sample Error Response**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Abstract must be between 1 and 5000 characters"
  },
  "meta": {
    "requestId": "req_789"
  }
}
```

---

#### Diagrams

**Diagrams**: Not required (simple LLM processing operation)

---

#### Business Logic Notes

- Uses OpenAI GPT-4o-mini model by default
- Temperature set to 0.3 for consistent extraction
- JSON mode enabled for structured output
- Extracts 8 key components from research abstract
- Keywords are seed keywords for Stage 2 expansion
- Usage metadata enables billing tracking per user
- **Automatic LLM Usage Logging**: Every call is logged to `llm_usage_logs` table with:
  - User ID (from JWT token)
  - Optional project ID and paper ID (from request body)
  - Model name, token usage (input/output/total)
  - Estimated cost (calculated from `llm_model_pricing` table)
  - Duration, request ID, and timestamp
- Costs are calculated using the latest pricing tier for the model from the pricing table

---

### POST /v1/stages/queries

**Description**: Stage 2 - Generate expanded keywords and Boolean search queries based on intent decomposition from Stage 1.

**Authentication**: Required (JWT)  
**Roles**: Authenticated User

---

#### Input Structure

**Request Body** (Stage 1 output):
```typescript
{
  abstract: string;
  problem: string;
  domain: string;
  constraints: string[];
  methodologies: string[];
  applicationDomains: string[];
  contributionTypes: string[];
  keywords_seed: string[];
  projectId?: string;      // Optional: UUID of project (for usage tracking)
  paperId?: string;        // Optional: UUID of paper (for usage tracking)
}
```

**Headers**:
- `Authorization: Bearer <accessToken>` (required)

---

#### Output Structure

**Success Response** (200 OK):
```typescript
{
  data: {
    stage: "queries";
    version: "1.0";
    generatedAt: string;
    output: {
      abstract: string;
      expandedKeywords: string[];
      booleanQuery: string;
    };
    usage: {
      modelName: string;
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
      durationMs: number;
      requestId: string;
    };
  };
  meta: {
    requestId: string;
  };
}
```

---

#### Sample Request

```bash
POST /v1/stages/queries
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "abstract": "We propose a novel deep learning approach...",
  "problem": "Image classification accuracy improvement",
  "domain": "Computer Vision",
  "constraints": ["Computational efficiency"],
  "methodologies": ["Deep Learning", "CNN"],
  "applicationDomains": ["Image Recognition"],
  "contributionTypes": ["Novel Architecture"],
  "keywords_seed": ["deep learning", "CNN", "attention"]
}
```

---

#### Sample Response

**Success (200 OK)**:
```json
{
  "data": {
    "stage": "queries",
    "version": "1.0",
    "generatedAt": "2025-12-31T18:05:00.000Z",
    "output": {
      "abstract": "We propose a novel deep learning approach...",
      "expandedKeywords": [
        "deep learning",
        "convolutional neural network",
        "CNN",
        "attention mechanism",
        "self-attention",
        "image classification",
        "computer vision",
        "neural architecture",
        "feature extraction",
        "ImageNet"
      ],
      "booleanQuery": "(\"deep learning\" OR \"neural network\") AND (\"image classification\" OR \"computer vision\") AND (\"attention mechanism\" OR \"self-attention\") AND (\"CNN\" OR \"convolutional\")"
    },
    "usage": {
      "modelName": "gpt-4o-mini",
      "inputTokens": 320,
      "outputTokens": 150,
      "totalTokens": 470,
      "durationMs": 1650,
      "requestId": "req_queries_123"
    }
  },
  "meta": {
    "requestId": "req_789ghi"
  }
}
```

---

#### Error Cases

| Status | Error Code | Description | Example |
|--------|------------|-------------|---------|
| 400 | `VALIDATION_ERROR` | Invalid input data | Missing required field |
| 401 | `UNAUTHORIZED` | Missing/invalid token | Token expired |
| 500 | `LLM_ERROR` | OpenAI API error | Rate limit exceeded |
| 500 | `INTERNAL_ERROR` | Server error | JSON parse error |

---

#### Diagrams

**Diagrams**: Not required (simple LLM processing operation)

---

#### Business Logic Notes

- Accepts Stage 1 output as input
- Temperature set to 0.4 for creative query variations
- Expands seed keywords with synonyms and related terms
- Generates Boolean query for academic search engines
- Typical expansion: 5-8 seed keywords → 10-20 expanded keywords
- Boolean query uses AND/OR logic for comprehensive search
- **Automatic LLM Usage Logging**: Every call is logged to `llm_usage_logs` table with user ID, optional project/paper IDs, token usage, and estimated cost

---

### POST /v1/stages/score

**Description**: Paper Scoring (Stages 5+6+7 Merged) - Perform semantic matching, dual-category evaluation (C1 competitor, C2 supporting work), and research gap analysis.

**Authentication**: Required (JWT)  
**Roles**: Authenticated User

---

#### Input Structure

**Request Body**:
```typescript
{
  userAbstract: string;          // User's research abstract
  candidateAbstract: string;     // Candidate paper abstract to evaluate
  projectId?: string;            // Optional: UUID of project (for usage tracking)
  paperId?: string;              // Optional: UUID of paper (for usage tracking)
}
```

**Headers**:
- `Authorization: Bearer <accessToken>` (required)

---

#### Output Structure

**Success Response** (200 OK):
```typescript
{
  data: {
    stage: "score";
    version: "1.0";
    generatedAt: string;
    output: {
      userAbstract: string;
      candidateAbstract: string;
      semantic_similarity: string;     // "high" | "medium" | "low"
      problem_overlap: string;         // "high" | "medium" | "low"
      domain_overlap: string;          // "high" | "medium" | "low"
      constraint_overlap: string;      // "high" | "medium" | "low"
      c1_score: number;                // 0-10 (competitor score)
      c1_justification: string;
      c1_strengths: string;
      c1_weaknesses: string;
      c2_score: number;                // 0-10 (supporting work score)
      c2_justification: string;
      c2_contribution_type: string;
      c2_relevance_areas: string;
      research_gaps: string[];         // What candidate paper is missing
      user_novelty: string;            // User's unique contribution
    };
    usage: {
      modelName: string;
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
      durationMs: number;
      requestId: string;
    };
  };
  meta: {
    requestId: string;
  };
}
```

---

#### Sample Request

```bash
POST /v1/stages/score
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "userAbstract": "We propose a novel attention-based approach for image classification...",
  "candidateAbstract": "This paper presents a convolutional neural network for object detection..."
}
```

---

#### Sample Response

**Success (200 OK)**:
```json
{
  "data": {
    "stage": "score",
    "version": "1.0",
    "generatedAt": "2025-12-31T18:10:00.000Z",
    "output": {
      "userAbstract": "We propose a novel attention-based approach...",
      "candidateAbstract": "This paper presents a convolutional neural network...",
      "semantic_similarity": "medium",
      "problem_overlap": "medium",
      "domain_overlap": "high",
      "constraint_overlap": "low",
      "c1_score": 6.5,
      "c1_justification": "Both papers address computer vision tasks but with different approaches. Candidate focuses on object detection while user focuses on classification.",
      "c1_strengths": "Strong CNN architecture, good performance on detection tasks",
      "c1_weaknesses": "Doesn't use attention mechanisms, limited to object detection",
      "c2_score": 7.0,
      "c2_justification": "Provides foundational CNN techniques that could support the user's attention-based approach",
      "c2_contribution_type": "Foundational architecture",
      "c2_relevance_areas": "Feature extraction, CNN design patterns",
      "research_gaps": [
        "No attention mechanism integration",
        "Limited to detection, not classification",
        "Doesn't address multi-task learning"
      ],
      "user_novelty": "Novel integration of attention mechanisms with classification, multi-task learning capability"
    },
    "usage": {
      "modelName": "gpt-4o-mini",
      "inputTokens": 450,
      "outputTokens": 280,
      "totalTokens": 730,
      "durationMs": 2150,
      "requestId": "req_score_456"
    }
  },
  "meta": {
    "requestId": "req_score_789"
  }
}
```

---

#### Error Cases

| Status | Error Code | Description | Example |
|--------|------------|-------------|---------|
| 400 | `VALIDATION_ERROR` | Invalid input data | Missing userAbstract |
| 401 | `UNAUTHORIZED` | Missing/invalid token | Token expired |
| 500 | `LLM_ERROR` | OpenAI API error | Rate limit exceeded |
| 500 | `INTERNAL_ERROR` | Server error | JSON parse error |

---

#### Diagrams

**Diagrams**: Not required (simple LLM processing operation)

---

#### Business Logic Notes

- Merged functionality of Stages 5, 6, and 7
- Temperature set to 0.4 for nuanced evaluation
- **C1 (Competitor)**: Papers solving similar problems (potential competitors)
- **C2 (Supporting Work)**: Papers providing foundational techniques
- Scores range from 0-10 (higher = more relevant)
- Research gaps identify what candidate paper is missing
- User novelty highlights unique contributions
- Helps researchers understand competitive landscape
- Enables citation decision-making
- **Automatic LLM Usage Logging**: Every call is logged to `llm_usage_logs` table with user ID, optional project/paper IDs, token usage, and estimated cost

---
