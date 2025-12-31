# API Testing Guide - Postman Collection

**Base URL**: `http://localhost:5000`

**Last Updated**: 2025-12-25 20:28:00 IST

---

## 📋 Table of Contents
- [Health Check](#0-health-check)
- [Stage 1: Intent Decomposition](#1-stage-1-intent-decomposition)
- [Stage 2: Query Generation](#2-stage-2-query-generation-pending)
- [Stage 3: Paper Retrieval](#3-stage-3-paper-retrieval-pending)
- [Stage 4: Filtering](#4-stage-4-filtering-pending)
- [Stage 5: Semantic Matching](#5-stage-5-semantic-matching-pending)
- [Stage 6: Ranking](#6-stage-6-ranking-pending)
- [Stage 7: Research Gaps](#7-stage-7-research-gaps-pending)

---

## 0) Health Check

### ✅ Status: READY

**Endpoint**: `GET /v1/health`

**Headers**: None required

**Request Body**: None

**Expected Response (200 OK)**:
```json
{
  "data": {
    "status": "ok",
    "time": "2025-12-25T14:58:00.000Z"
  },
  "meta": {
    "requestId": "req_abc123..."
  }
}
```

**Postman Setup**:
1. Method: `GET`
2. URL: `http://localhost:5000/v1/health`
3. Click "Send"

**curl Command**:
```bash
curl http://localhost:5000/v1/health
```

---

## 1) Stage 1: Intent Decomposition

### ✅ Status: READY FOR TESTING

**Endpoint**: `POST /v1/stages/intent`

**Headers**:
```
Content-Type: application/json
```

### Test Case 1: TinyML Face Tracking

**Request Body**:
```json
{
  "abstract": "We propose a low-power TinyML-based multitask model for real-time face tracking on microcontroller-class devices, enabling on-device inference with minimal memory and latency."
}
```

**Expected Response (200 OK)**:
```json
{
  "data": {
    "stage": "intent",
    "version": "1.0",
    "generatedAt": "2025-12-25T14:50:00.000Z",
    "input": {
      "abstract": "We propose a low-power TinyML-based multitask model for real-time face tracking on microcontroller-class devices, enabling on-device inference with minimal memory and latency."
    },
    "output": {
      "problem": "Real-time face tracking on resource-constrained microcontroller devices",
      "methodologies": ["TinyML", "multitask learning", "on-device inference"],
      "applicationDomains": ["Embedded AI", "Computer Vision"],
      "constraints": ["low power", "limited memory", "real-time latency", "microcontroller hardware"],
      "contributionTypes": ["system", "method"],
      "keywords_seed": ["TinyML", "face tracking", "microcontroller", "on-device AI", "low-power", "real-time", "embedded vision"]
    }
  },
  "meta": {
    "requestId": "req_xyz789..."
  }
}
```

### Test Case 2: Sentiment Analysis

**Request Body**:
```json
{
  "abstract": "We develop a novel deep learning approach for sentiment analysis on social media posts using transformer-based architectures with attention mechanisms."
}
```

**Expected Response (200 OK)**:
```json
{
  "data": {
    "stage": "intent",
    "version": "1.0",
    "generatedAt": "2025-12-25T14:52:00.000Z",
    "input": {
      "abstract": "We develop a novel deep learning approach for sentiment analysis on social media posts using transformer-based architectures with attention mechanisms."
    },
    "output": {
      "problem": "Sentiment analysis on social media content",
      "methodologies": ["deep learning", "transformer architecture", "attention mechanisms"],
      "applicationDomains": ["Natural Language Processing", "Social Media Analytics"],
      "constraints": ["social media data characteristics", "real-time processing"],
      "contributionTypes": ["method"],
      "keywords_seed": ["sentiment analysis", "transformers", "social media", "attention mechanism", "NLP"]
    }
  },
  "meta": {
    "requestId": "req_..."
  }
}
```

### Test Case 3: Medical AI

**Request Body**:
```json
{
  "abstract": "This paper presents an AI-powered diagnostic system for early detection of diabetic retinopathy using retinal fundus images. Our model achieves 95% accuracy while maintaining HIPAA compliance and running on edge devices in clinical settings."
}
```

**Expected Response (200 OK)**:
```json
{
  "data": {
    "stage": "intent",
    "version": "1.0",
    "generatedAt": "2025-12-25T14:53:00.000Z",
    "input": {
      "abstract": "This paper presents an AI-powered diagnostic system for early detection of diabetic retinopathy using retinal fundus images. Our model achieves 95% accuracy while maintaining HIPAA compliance and running on edge devices in clinical settings."
    },
    "output": {
      "problem": "Early detection of diabetic retinopathy from retinal images",
      "methodologies": ["AI-powered diagnostics", "image analysis", "edge computing"],
      "applicationDomains": ["Medical AI", "Healthcare"],
      "constraints": ["HIPAA compliance", "edge device deployment", "clinical accuracy requirements"],
      "contributionTypes": ["system"],
      "keywords_seed": ["diabetic retinopathy", "medical imaging", "AI diagnostics", "edge computing", "HIPAA", "retinal fundus"]
    }
  },
  "meta": {
    "requestId": "req_..."
  }
}
```

### Test Case 4: Validation Error (Too Short Abstract)

**Request Body**:
```json
{
  "abstract": "AI model"
}
```

**Expected Response (400 Bad Request)**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": [
      {
        "code": "too_small",
        "minimum": 10,
        "type": "string",
        "inclusive": true,
        "exact": false,
        "message": "Abstract must be at least 10 characters",
        "path": ["abstract"]
      }
    ]
  },
  "meta": {
    "requestId": "req_...",
    "timestamp": "2025-12-25T14:54:00.000Z"
  }
}
```

### Test Case 5: Validation Error (Missing Abstract)

**Request Body**:
```json
{
  "preferences": {
    "domain": "ML"
  }
}
```

**Expected Response (400 Bad Request)**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": [
      {
        "code": "invalid_type",
        "expected": "string",
        "received": "undefined",
        "path": ["abstract"],
        "message": "Required"
      }
    ]
  },
  "meta": {
    "requestId": "req_...",
    "timestamp": "2025-12-25T14:55:00.000Z"
  }
}
```

**Postman Setup**:
1. Method: `POST`
2. URL: `http://localhost:5000/v1/stages/intent`
3. Headers: `Content-Type: application/json`
4. Body: Select "raw" → "JSON" → Paste request body
5. Click "Send"

**curl Command**:
```bash
curl -X POST http://localhost:5000/v1/stages/intent \
  -H "Content-Type: application/json" \
  -d '{
    "abstract": "We propose a low-power TinyML-based multitask model for real-time face tracking on microcontroller-class devices, enabling on-device inference with minimal memory and latency."
  }'
```

---

## 2) Stage 2: Query Generation ⚪ PENDING

**Endpoint**: `POST /v1/stages/queries`

**Status**: Not yet implemented

**Coming Soon**: Will be added after Stage 1 testing is complete

---

## 3) Stage 3: Paper Retrieval ⚪ PENDING

**Endpoint**: `POST /v1/stages/retrieve`

**Status**: Not yet implemented

**Coming Soon**: Will be added in M2

---

## 4) Stage 4: Filtering ⚪ PENDING

**Endpoint**: `POST /v1/stages/filter`

**Status**: Not yet implemented

**Coming Soon**: Will be added in M3

---

## 5) Stage 5: Semantic Matching ⚪ PENDING

**Endpoint**: `POST /v1/stages/match`

**Status**: Not yet implemented

**Coming Soon**: Will be added in M3

---

## 6) Stage 6: Ranking ⚪ PENDING

**Endpoint**: `POST /v1/stages/rank`

**Status**: Not yet implemented

**Coming Soon**: Will be added in M4

---

## 7) Stage 7: Research Gaps ⚪ PENDING

**Endpoint**: `POST /v1/stages/gaps`

**Status**: Not yet implemented

**Coming Soon**: Will be added in M4

---

## 🔧 Common Headers for All Endpoints

```
Content-Type: application/json
```

---

## 📊 Response Format (All Endpoints)

### Success Response
```json
{
  "data": {
    "stage": "intent|queries|retrieval|filter|match|rank|gaps",
    "version": "1.0",
    "generatedAt": "2025-12-25T...",
    "input": { ... },
    "output": { ... }
  },
  "meta": {
    "requestId": "req_..."
  }
}
```

### Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR|UPSTREAM_ERROR|LLM_ERROR|INTERNAL_ERROR",
    "message": "Error description",
    "details": { ... }
  },
  "meta": {
    "requestId": "req_...",
    "timestamp": "2025-12-25T..."
  }
}
```

---

## 🧪 Testing Checklist

### Stage 1: Intent Decomposition
- [ ] Test Case 1: TinyML (complete request)
- [ ] Test Case 2: Sentiment Analysis
- [ ] Test Case 3: Medical AI
- [ ] Test Case 4: Validation error (too short)
- [ ] Test Case 5: Validation error (missing field)
- [ ] Verify response structure matches spec
- [ ] Check request ID is unique per request
- [ ] Review server logs for errors
- [ ] Verify applicationDomain is array
- [ ] Verify contributionType is array

### Stage 2: Query Generation
- [ ] To be added after implementation

---

## 💡 Tips for Testing

1. **Check Server Logs**: Watch the terminal where `npm run dev` is running
2. **Request IDs**: Each response has a unique `requestId` - use it to trace requests in logs
3. **Timestamps**: All timestamps are in ISO 8601 format (UTC)
4. **Error Handling**: Test both valid and invalid inputs
5. **Response Time**: Stage 1 typically takes 2-5 seconds (LLM processing)

---

## 🚀 Quick Start with Postman

### Import as Collection

1. Create a new Collection: "Literature Review API"
2. Add Environment Variables:
   - `base_url`: `http://localhost:5000`
3. Add requests as documented above

### Save Responses

After testing, save successful responses as "Examples" in Postman for documentation.

---

## 📝 Notes

- All endpoints are stateless (no session/authentication required)
- Server must be running: `npm run dev`
- Default port: `5000`
- Environment: `development`
- LLM Model: `gpt-4-turbo-preview`

---

**This file will be updated after each new API implementation!** ✅
