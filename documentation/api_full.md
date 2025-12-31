# api.md — Backend API (Postman-ready) for Literature Review Pipeline

Base URL (dev): `http://localhost:5000`

All endpoints are **/v1**. Responses use:

- success: `{ "data": ..., "meta": {...} }`
- error: `{ "error": { "code": "...", "message": "...", "details": ... } }`

Auth (optional): `Authorization: Bearer <JWT>`

---

## 0) Health

### GET /v1/health
**Response 200**
```json
{
  "data": { "status": "ok", "time": "2025-12-25T12:00:00.000Z" },
  "meta": {}
}
```

---

## 1) Auth (optional but recommended)

### POST /v1/auth/login
**Body**
```json
{ "email": "user@example.com", "password": "PlainTextPassword" }
```

**Response 200**
```json
{
  "data": {
    "token": "jwt_here",
    "user": { "id": "uuid", "email": "user@example.com" }
  },
  "meta": {}
}
```

---

## 2) Projects (Abstract + Preferences)

A **Project** stores the user abstract + optional preferences (domain/venue/window/tier).

### POST /v1/projects
**Body**
```json
{
  "title": "TinyML Face Tracking Literature Review",
  "abstract": "We propose a low-power TinyML-based multitask model for real-time face tracking on microcontroller-class devices, enabling on-device inference with minimal memory and latency.",
  "preferences": {
    "domain": "Embedded AI / Computer Vision",
    "timeWindowYears": 5,
    "venueTiers": ["A*", "A", "Q1"],
    "maxPapers": 80
  }
}
```

**Response 201**
```json
{
  "data": {
    "projectId": "prj_01H...",
    "title": "TinyML Face Tracking Literature Review",
    "abstract": "We propose ...",
    "preferences": {
      "domain": "Embedded AI / Computer Vision",
      "timeWindowYears": 5,
      "venueTiers": ["A*", "A", "Q1"],
      "maxPapers": 80
    },
    "createdAt": "2025-12-25T12:00:00.000Z"
  },
  "meta": {}
}
```

### GET /v1/projects/:projectId
**Response 200**
```json
{
  "data": {
    "projectId": "prj_01H...",
    "title": "...",
    "abstract": "...",
    "preferences": { "domain": "...", "timeWindowYears": 5, "venueTiers": ["A"], "maxPapers": 80 }
  },
  "meta": {}
}
```

### PATCH /v1/projects/:projectId
**Body (partial)**
```json
{
  "preferences": { "timeWindowYears": 7, "maxPapers": 120 }
}
```

**Response 200**
```json
{
  "data": { "projectId": "prj_01H...", "preferences": { "timeWindowYears": 7, "maxPapers": 120 } },
  "meta": {}
}
```

---

## 3) Runs (Execute Pipeline)

A **Run** executes stage(s) of the pipeline for a Project.

### POST /v1/runs
**Body**
```json
{
  "projectId": "prj_01H...",
  "mode": "async",
  "stages": ["intent", "queries", "retrieval", "filter", "match", "rank", "gaps"],
  "limits": {
    "retrievalPerSource": 100,
    "maxFinalPapers": 60
  }
}
```

**Response 202**
```json
{
  "data": {
    "runId": "run_01H...",
    "projectId": "prj_01H...",
    "status": "queued",
    "stages": ["intent", "queries", "retrieval", "filter", "match", "rank", "gaps"],
    "createdAt": "2025-12-25T12:05:00.000Z"
  },
  "meta": {}
}
```

### GET /v1/runs/:runId
**Response 200**
```json
{
  "data": {
    "runId": "run_01H...",
    "projectId": "prj_01H...",
    "status": "running",
    "progress": {
      "currentStage": "retrieval",
      "doneStages": ["intent", "queries"],
      "percent": 35
    },
    "startedAt": "2025-12-25T12:05:10.000Z"
  },
  "meta": {}
}
```

### GET /v1/runs/:runId/results
Returns all stage results + summary.
**Response 200**
```json
{
  "data": {
    "runId": "run_01H...",
    "status": "completed",
    "results": {
      "intent": {
        "problem": "Real-time face tracking on resource-constrained devices",
        "methodology": ["TinyML", "multitask learning", "on-device inference"],
        "domain": "Embedded AI / Computer Vision",
        "constraints": ["low power", "limited memory", "real-time"],
        "keywords_seed": ["TinyML", "face tracking", "microcontroller", "on-device AI"]
      },
      "queries": {
        "booleanQuery": "(\"TinyML\" OR \"embedded machine learning\") AND (\"face tracking\" OR \"visual tracking\") AND (\"microcontroller\" OR \"edge device\" OR \"low power\")",
        "expandedKeywords": ["embedded ML", "on-device AI", "MCU", "tracking-by-detection"]
      },
      "retrieval": {
        "sources": ["arxiv", "semantic_scholar"],
        "counts": { "arxiv": 38, "semantic_scholar": 65 },
        "dedupedTotal": 82
      },
      "rank": {
        "C1": [
          {
            "paperId": "pap_01H...",
            "title": "TinyML-Based Face Detection for Edge Devices",
            "year": 2022,
            "venue": "IEEE IoT Journal",
            "score": 8.5,
            "justification": "Uses TinyML and multitask learning under similar MCU constraints."
          }
        ],
        "C2": [
          {
            "paperId": "pap_01H...",
            "title": "Low-Power Face Detection on Microcontrollers",
            "year": 2021,
            "venue": "Workshop",
            "score": 6.2,
            "justification": "Overlaps with low-power detection but not tracking."
          }
        ]
      },
      "gaps": {
        "bullets": [
          "Existing work focuses primarily on face detection rather than continuous tracking.",
          "Real-time pan-tilt control on microcontrollers remains underexplored.",
          "Few studies report end-to-end deployment latency on MCU-class hardware."
        ],
        "latexReady": "\\\\noindent Existing work focuses primarily on face detection rather than continuous tracking... "
      }
    }
  },
  "meta": {}
}
```

---

## 4) Stage-by-Stage Endpoints (Optional: Useful for Debugging)

These allow you to run stages individually (handy in Postman).

### POST /v1/projects/:projectId/intent
Runs Stage 1.
**Body (optional overrides)**
```json
{ "llm": { "temperature": 0.2 } }
```

**Response 200**
```json
{
  "data": {
    "projectId": "prj_01H...",
    "intent": {
      "problem": "Real-time face tracking on resource-constrained devices",
      "methodology": ["TinyML", "multitask learning", "on-device inference"],
      "domain": "Embedded AI / Computer Vision",
      "constraints": ["low power", "limited memory", "real-time"],
      "keywords_seed": ["TinyML", "face tracking", "microcontroller", "on-device AI"]
    }
  },
  "meta": {}
}
```

### POST /v1/projects/:projectId/queries
Runs Stage 2.
**Body**
```json
{ "keywords_seed": ["TinyML", "face tracking", "microcontroller"] }
```

**Response 200**
```json
{
  "data": {
    "booleanQuery": "(\"TinyML\" OR \"embedded machine learning\") AND (\"face tracking\" OR \"visual tracking\") AND (\"microcontroller\" OR \"edge device\" OR \"low power\")",
    "expandedKeywords": ["embedded ML", "on-device AI", "MCU"]
  },
  "meta": {}
}
```

### POST /v1/projects/:projectId/retrieve
Runs Stage 3.
**Body**
```json
{
  "query": "(\"TinyML\" OR \"embedded machine learning\") AND (\"face tracking\")",
  "sources": ["arxiv", "semantic_scholar"],
  "limitPerSource": 50
}
```

**Response 200**
```json
{
  "data": {
    "dedupedTotal": 48,
    "papers": [
      {
        "paperId": "pap_01H...",
        "title": "TinyML-Based Face Detection for Edge Devices",
        "authors": ["A. Kumar", "B. Lee"],
        "year": 2022,
        "venue": "IEEE IoT Journal",
        "citations": 124,
        "abstract": "...",
        "links": { "pdf": "https://...", "doi": "10....", "arxiv": null }
      }
    ]
  },
  "meta": {}
}
```

### POST /v1/projects/:projectId/filter
Runs Stage 4.
**Body**
```json
{
  "timeWindowYears": 5,
  "venueTiers": ["A*", "A", "Q1"],
  "minCitations": 5
}
```

**Response 200**
```json
{
  "data": {
    "kept": 32,
    "removed": 16,
    "reasonsSummary": {
      "too_old": 8,
      "low_citations": 6,
      "low_quality_venue": 2
    }
  },
  "meta": {}
}
```

### POST /v1/projects/:projectId/match
Runs Stage 5.
**Body**
```json
{
  "matchAgainst": "filtered",
  "embeddingModel": "default",
  "topK": 30
}
```

**Response 200**
```json
{
  "data": {
    "topMatches": [
      {
        "paperId": "pap_01H...",
        "semantic_similarity": 0.82,
        "problem_overlap": "high",
        "method_overlap": "medium",
        "judgment": "Addresses same problem with similar constraints"
      }
    ]
  },
  "meta": {}
}
```

### POST /v1/projects/:projectId/rank
Runs Stage 6.
**Body**
```json
{
  "rules": {
    "c1Requires": ["problem_overlap=high"],
    "c2Allows": ["method_overlap>=low"]
  }
}
```

**Response 200**
```json
{
  "data": {
    "C1": [{ "paperId": "pap_01H...", "score": 8.5, "justification": "..." }],
    "C2": [{ "paperId": "pap_01H...", "score": 6.2, "justification": "..." }]
  },
  "meta": {}
}
```

### POST /v1/projects/:projectId/gaps
Runs Stage 7.
**Body**
```json
{ "format": "both" }
```

**Response 200**
```json
{
  "data": {
    "bullets": [
      "Existing work focuses primarily on face detection rather than continuous tracking."
    ],
    "latexReady": "\\\\noindent Existing work focuses primarily on face detection rather than continuous tracking."
  },
  "meta": {}
}
```

---

## 5) Exports

### GET /v1/runs/:runId/export?format=latex
**Response 200**
```json
{
  "data": {
    "format": "latex",
    "content": "\\\\section{Related Work} ... \\\\paragraph{Research Gaps} ..."
  },
  "meta": {}
}
```

---

## 6) Common Error Codes

- `VALIDATION_ERROR` (Zod validation failed)
- `UNAUTHORIZED` (missing/invalid JWT)
- `NOT_FOUND` (project/run not found)
- `UPSTREAM_ERROR` (arXiv/S2 API failed)
- `LLM_ERROR` (provider error)
- `RATE_LIMITED` (too many requests)

**Example**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": [{ "path": ["preferences","timeWindowYears"], "issue": "Expected number" }]
  }
}
```
