# 🧪 Stage 1: Intent Decomposition - Testing Guide

**Last Updated**: 2025-12-25 21:12:00 IST

## Endpoint
```
POST http://localhost:5000/v1/stages/intent
```

## Request Headers
```
Content-Type: application/json
```

## Request Body

### Example 1: TinyML Face Tracking
```json
{
  "abstract": "We propose a low-power TinyML-based multitask model for real-time face tracking on microcontroller-class devices, enabling on-device inference with minimal memory and latency."
}
```

### Example 2: Sentiment Analysis
```json
{
  "abstract": "We develop a novel deep learning approach for sentiment analysis on social media posts using transformer-based architectures with attention mechanisms."
}
```

### Example 3: Healthcare AI
```json
{
  "abstract": "This paper presents an AI-powered diagnostic system for early detection of diabetic retinopathy using retinal fundus images. Our model achieves 95% accuracy while maintaining HIPAA compliance and running on edge devices in clinical settings."
}
```

## Expected Response Format

```json
{
  "data": {
    "stage": "intent",
    "version": "1.0",
    "generatedAt": "2025-12-25T14:50:00.000Z",
    "output": {
      "abstract": "We propose a low-power TinyML-based multitask model for real-time face tracking on microcontroller-class devices, enabling on-device inference with minimal memory and latency.",
      "problem": "Real-time face tracking on resource-constrained devices",
      "methodologies": ["TinyML", "multitask learning", "on-device inference"],
      "applicationDomains": ["Embedded AI", "Computer Vision"],
      "constraints": ["low power", "limited memory", "real-time latency"],
      "contributionTypes": ["system", "method"],
      "keywords_seed": ["TinyML", "face tracking", "microcontroller", "on-device AI", "low-power", "real-time"]
    }
  },
  "meta": {
    "requestId": "req_..."
  }
}
```

## Testing Steps

### Using Postman

1. **Create a new request**
   - Method: `POST`
   - URL: `http://localhost:5000/v1/stages/intent`

2. **Set Headers**
   - Key: `Content-Type`
   - Value: `application/json`

3. **Set Body**
   - Select "raw" → "JSON"
   - Paste one of the example request bodies above

4. **Send Request**
   - Click "Send"
   - You should get a 200 OK response with the structured intent

### Using curl

```bash
curl -X POST http://localhost:5000/v1/stages/intent \
  -H "Content-Type: application/json" \
  -d '{
    "abstract": "We propose a low-power TinyML-based multitask model for real-time face tracking on microcontroller-class devices, enabling on-device inference with minimal memory and latency."
  }'
```

## Validation Tests

### ✅ Valid Requests
- Abstract with 10+ characters
- Different research domains

### ❌ Invalid Requests (should return 400 error)

**Too short abstract:**
```json
{
  "abstract": "AI model"
}
```

**Missing abstract:**
```json
{}
```

## Expected Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": [
      {
        "code": "too_small",
        "minimum": 10,
        "path": ["abstract"],
        "message": "Abstract must be at least 10 characters"
      }
    ]
  },
  "meta": {
    "requestId": "req_...",
    "timestamp": "2025-12-25T14:54:00.000Z"
  }
}
```

## What to Check

✅ **Response Structure**
- Has `data`, `meta` fields
- `data.stage` is "intent"
- `data.output` has all required fields
- `output.abstract` contains the original abstract
- `applicationDomains` is an array
- `contributionTypes` is an array
- `methodologies` is an array

✅ **Output Quality**
- `problem` is a clear problem statement
- `methodologies` lists relevant techniques
- `keywords_seed` has 4-8 relevant keywords
- `constraints` captures limitations mentioned

✅ **Request ID**
- Each request has a unique `requestId`
- Check server logs for the same `requestId`

## Server Logs

Watch the terminal where `npm run dev` is running. You should see:
```
[INFO] openai_completion_request
[INFO] openai_completion_success
[INFO] intent_processing_success
```

---

## 🎯 Once Testing is Successful

Let me know and I'll implement **Stage 2: Query Generation**!
