# 🧪 Stage 2: Query Generation - Testing Guide

**Last Updated**: 2025-12-25 21:24:00 IST

## Endpoint
```
POST http://localhost:5000/v1/stages/queries
```

## Request Headers
```
Content-Type: application/json
```

## Request Body

The request body should contain the **Stage 1 output directly** (just copy the `output` from Stage 1 response).

### Example 1: TinyML Face Tracking
```json
{
  "abstract": "We propose a low-power TinyML-based multitask model for real-time face tracking on microcontroller-class devices, enabling on-device inference with minimal memory and latency.",
  "problem": "Real-time face tracking on resource-constrained microcontroller devices",
  "methodologies": ["TinyML", "multitask learning", "on-device inference"],
  "applicationDomains": ["Embedded AI", "Computer Vision"],
  "constraints": ["low power", "limited memory", "real-time latency"],
  "contributionTypes": ["system", "method"],
  "keywords_seed": ["TinyML", "face tracking", "microcontroller", "on-device AI", "low-power", "real-time"]
}
```

### Example 2: Sentiment Analysis
```json
{
  "abstract": "We develop a novel deep learning approach for sentiment analysis on social media posts using transformer-based architectures with attention mechanisms.",
  "problem": "Sentiment analysis on social media content",
  "methodologies": ["deep learning", "transformer architecture", "attention mechanisms"],
  "applicationDomains": ["Natural Language Processing", "Social Media Analytics"],
  "constraints": ["social media data characteristics", "real-time processing"],
  "contributionTypes": ["method"],
  "keywords_seed": ["sentiment analysis", "transformers", "social media", "attention mechanism", "NLP"]
}
```

## Expected Response Format

```json
{
  "data": {
    "stage": "queries",
    "version": "1.0",
    "generatedAt": "2025-12-25T15:30:00.000Z",
    "output": {
      "abstract": "We propose a low-power TinyML-based multitask model for real-time face tracking on microcontroller-class devices, enabling on-device inference with minimal memory and latency.",
      "booleanQuery": "(\"TinyML\" OR \"embedded ML\" OR \"on-device ML\") AND (\"face tracking\" OR \"visual tracking\" OR \"object tracking\") AND (\"microcontroller\" OR \"MCU\" OR \"edge device\") AND (\"low power\" OR \"energy efficient\")",
      "expandedKeywords": [
        "embedded machine learning",
        "on-device AI",
        "MCU",
        "edge computing",
        "resource-constrained devices",
        "real-time inference",
        "computer vision",
        "tracking algorithms",
        "power optimization",
        "TinyML frameworks"
      ],
      "engineQueries": {
        "arxiv": "all:(TinyML OR \"embedded ML\") AND (\"face tracking\" OR \"visual tracking\") AND (microcontroller OR MCU)",
        "semanticScholar": "TinyML face tracking microcontroller low power real-time"
      }
    }
  },
  "meta": {
    "requestId": "req_..."
  }
}
```

## Testing Steps

### Using Postman

1. **First, get output from Stage 1**
   - Call `POST /v1/stages/intent` with an abstract
   - Copy the entire `output` object from `data.output`

2. **Create Stage 2 request**
   - Method: `POST`
   - URL: `http://localhost:5000/v1/stages/queries`
   - Headers: `Content-Type: application/json`
   - Body: Paste the Stage 1 `output` directly (no wrapper needed)

3. **Send Request**
   - Click "Send"
   - You should get a 200 OK response with search queries

### Using curl

```bash
curl -X POST http://localhost:5000/v1/stages/queries \
  -H "Content-Type: application/json" \
  -d '{
    "abstract": "We propose a low-power TinyML-based multitask model...",
    "problem": "Real-time face tracking on resource-constrained microcontroller devices",
    "methodologies": ["TinyML", "multitask learning", "on-device inference"],
    "applicationDomains": ["Embedded AI", "Computer Vision"],
    "constraints": ["low power", "limited memory", "real-time latency"],
    "contributionTypes": ["system", "method"],
    "keywords_seed": ["TinyML", "face tracking", "microcontroller", "on-device AI"]
  }'
```

## Validation Tests

### ✅ Valid Requests
- Intent with all required fields
- Different research domains
- Various methodologies

### ❌ Invalid Requests (should return 400 error)

**Missing required fields:**
```json
{
  "abstract": "Some abstract"
}
```

**Empty request:**
```json
{}
```

## What to Check

✅ **Response Structure**
- Has `data`, `meta` fields
- `data.stage` is "queries"
- `data.output` has all required fields:
  - `abstract` (string) - Original abstract
  - `booleanQuery` (string)
  - `expandedKeywords` (array)
  - `engineQueries` (object with `arxiv` and `semanticScholar`)

✅ **Output Quality**
- `booleanQuery` uses AND/OR operators correctly
- `expandedKeywords` contains relevant synonyms and variations
- `engineQueries.arxiv` is formatted for arXiv API
- `engineQueries.semanticScholar` is optimized for Semantic Scholar

✅ **Request ID**
- Each request has a unique `requestId`
- Check server logs for the same `requestId`

## Server Logs

Watch the terminal where `npm run dev` is running. You should see:
```
[INFO] queries_processing_start
[INFO] openai_completion_request
[INFO] openai_completion_success
[INFO] queries_processing_success
```

---

## 🎯 Once Testing is Successful

Let me know and I'll implement **Stage 3: Paper Retrieval (arXiv + Semantic Scholar)**!
