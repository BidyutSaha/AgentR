# api.md — Minimal (No Auth) Stage-by-Stage API (Postman-ready)

Base URL (dev): `http://localhost:5000`

All endpoints are **/v1**. No authentication.

Response envelopes:

- success: `{ "data": ..., "meta": { "requestId": "..." } }`
- error: `{ "error": { "code": "...", "message": "...", "details": ... }, "meta": { "requestId": "..." } }`

---

## 0) Health

### GET /v1/health
**Response 200**
```json
{
  "data": { "status": "ok", "time": "2025-12-25T12:00:00.000Z" },
  "meta": { "requestId": "req_..." }
}
```

---

## Common Types

### Paper Object (normalized)
```json
{
  "paperId": "pap_local_001",
  "title": "Paper title",
  "authors": ["A. Author", "B. Author"],
  "year": 2023,
  "venue": "Conference / Journal",
  "citations": 25,
  "abstract": "....",
  "links": { "pdf": "https://...", "doi": "10....", "arxiv": "https://arxiv.org/abs/...." },
  "source": "arxiv|semantic_scholar|other"
}
```

### Stage Output Envelope (required for every stage)
```json
{
  "stage": "intent|queries|retrieval|filter|match|rank|gaps",
  "version": "1.0",
  "generatedAt": "2025-12-25T12:00:00.000Z",
  "input": {},
  "output": {}
}
```

---

## 1) Stage 1 — Intent Decomposition

### POST /v1/stages/intent
**Body**
```json
{
  "abstract": "We propose a low-power TinyML-based ...",
  "preferences": {
    "domain": "Embedded AI",
    "timeWindowYears": 5,
    "venueTiers": ["A*", "A", "Q1"]
  }
}
```

**Response 200**
```json
{
  "data": {
    "stage": "intent",
    "version": "1.0",
    "generatedAt": "2025-12-25T12:00:00.000Z",
    "input": {
      "abstract": "We propose ...",
      "preferences": { "domain": "Embedded AI", "timeWindowYears": 5, "venueTiers": ["A*", "A", "Q1"] }
    },
    "output": {
      "problem": "Real-time face tracking on MCU-class devices",
      "methodologies": ["TinyML", "multitask learning", "on-device inference"],
      "applicationDomains": ["Embedded AI", "Computer Vision"],
      "constraints": ["low power", "limited RAM/flash", "real-time latency"],
      "contributionTypes": ["system", "method"],
      "keywords_seed": ["TinyML", "face tracking", "microcontroller", "on-device AI"]
    }
  },
  "meta": { "requestId": "req_..." }
}
```

---

## 2) Stage 2 — Query Generation

### POST /v1/stages/queries
**Body** (either provide `intent` or `keywords_seed`)
```json
{
  "intent": {
    "problem": "Real-time face tracking on MCU-class devices",
    "methodology": ["TinyML", "multitask learning"],
    "constraints": ["low power"],
    "keywords_seed": ["TinyML", "face tracking", "microcontroller"]
  }
}
```

**Response 200**
```json
{
  "data": {
    "stage": "queries",
    "version": "1.0",
    "generatedAt": "2025-12-25T12:00:05.000Z",
    "input": { "intent": { "problem": "Real-time face tracking on MCU-class devices", "keywords_seed": ["TinyML","face tracking","microcontroller"] } },
    "output": {
      "booleanQuery": "(\"TinyML\" OR \"embedded machine learning\") AND (\"face tracking\" OR \"visual tracking\") AND (\"microcontroller\" OR \"edge device\" OR \"low power\")",
      "expandedKeywords": ["embedded ML", "on-device AI", "MCU", "tracking-by-detection"],
      "engineQueries": {
        "arxiv": "all:(TinyML AND (face tracking OR visual tracking) AND microcontroller)",
        "semantic_scholar": "TinyML face tracking microcontroller low power"
      }
    }
  },
  "meta": { "requestId": "req_..." }
}
```

---

## 3) Stage 3 — Retrieval (arXiv + Semantic Scholar)

### POST /v1/stages/retrieve
**Body**
```json
{
  "query": "(\"TinyML\" OR \"embedded machine learning\") AND (\"face tracking\")",
  "sources": ["arxiv", "semantic_scholar"],
  "limitPerSource": 30
}
```

**Response 200**
```json
{
  "data": {
    "stage": "retrieval",
    "version": "1.0",
    "generatedAt": "2025-12-25T12:00:15.000Z",
    "input": { "query": "(\"TinyML\" OR \"embedded machine learning\") AND (\"face tracking\")", "sources": ["arxiv","semantic_scholar"], "limitPerSource": 30 },
    "output": {
      "counts": { "arxiv": 18, "semantic_scholar": 30 },
      "dedupedTotal": 41,
      "papers": [
        {
          "paperId": "pap_arxiv_001",
          "title": "TinyML Face Detection on Microcontrollers",
          "authors": ["A. Author"],
          "year": 2022,
          "venue": "arXiv",
          "citations": 0,
          "abstract": "....",
          "links": { "pdf": "https://...", "doi": null, "arxiv": "https://arxiv.org/abs/..." },
          "source": "arxiv"
        }
      ]
    }
  },
  "meta": { "requestId": "req_..." }
}
```

---

## 4) Stage 4 — Filter / Quality Heuristics

### POST /v1/stages/filter
**Body**
```json
{
  "papers": [ { "paperId": "pap_1", "title": "...", "year": 2020, "venue": "..." } ],
  "preferences": {
    "timeWindowYears": 5,
    "minCitations": 5,
    "venueTiers": ["A*", "A", "Q1"]
  }
}
```

**Response 200**
```json
{
  "data": {
    "stage": "filter",
    "version": "1.0",
    "generatedAt": "2025-12-25T12:00:20.000Z",
    "input": { "preferences": { "timeWindowYears": 5, "minCitations": 5, "venueTiers": ["A*","A","Q1"] } },
    "output": {
      "kept": 25,
      "removed": 16,
      "reasonsSummary": { "too_old": 6, "low_citations": 8, "low_quality_venue": 2 },
      "papers_kept": [ { "paperId": "pap_2", "title": "...", "year": 2022, "venue": "..." } ]
    }
  },
  "meta": { "requestId": "req_..." }
}
```

---

## 5) Stage 5 — Matching (Semantic Similarity + Optional LLM)

### POST /v1/stages/match
**Body**
```json
{
  "abstract": "We propose a low-power TinyML-based ...",
  "papers": [ { "paperId": "pap_2", "title": "...", "abstract": "...", "year": 2022, "venue": "..." } ],
  "topK": 30
}
```

**Response 200**
```json
{
  "data": {
    "stage": "match",
    "version": "1.0",
    "generatedAt": "2025-12-25T12:00:30.000Z",
    "input": { "topK": 30 },
    "output": {
      "topMatches": [
        {
          "paperId": "pap_2",
          "semantic_similarity": 0.82,
          "problem_overlap": "high",
          "method_overlap": "medium",
          "constraint_overlap": "high",
          "note": "Very close problem and constraints; partially similar method"
        }
      ]
    }
  },
  "meta": { "requestId": "req_..." }
}
```

---

## 6) Stage 6 — Ranking into C1 / C2 (0–10)

### POST /v1/stages/rank
**Body**
```json
{
  "abstract": "We propose ...",
  "matches": [
    { "paperId": "pap_2", "semantic_similarity": 0.82, "problem_overlap": "high", "method_overlap": "medium" }
  ]
}
```

**Response 200**
```json
{
  "data": {
    "stage": "rank",
    "version": "1.0",
    "generatedAt": "2025-12-25T12:00:40.000Z",
    "input": {},
    "output": {
      "C1": [
        { "paperId": "pap_2", "score": 8.5, "justification": "Same problem and similar deployment constraints; strong overlap." }
      ],
      "C2": [
        { "paperId": "pap_9", "score": 6.0, "justification": "Shares low-power objective but not tracking; partial overlap." }
      ],
      "rubric": {
        "scoreMeaning": "0–10 overlap score",
        "C1Rule": "problem_overlap=high AND (method_overlap>=medium OR constraint_overlap=high)",
        "C2Rule": "partial overlap in method/dataset/constraint"
      }
    }
  },
  "meta": { "requestId": "req_..." }
}
```

---

## 7) Stage 7 — Research Gaps + LaTeX-ready Output

### POST /v1/stages/gaps
**Body**
```json
{
  "abstract": "We propose ...",
  "ranked": {
    "C1": [ { "paperId": "pap_2", "score": 8.5, "justification": "..." } ],
    "C2": [ { "paperId": "pap_9", "score": 6.0, "justification": "..." } ]
  }
}
```

**Response 200**
```json
{
  "data": {
    "stage": "gaps",
    "version": "1.0",
    "generatedAt": "2025-12-25T12:00:50.000Z",
    "input": {},
    "output": {
      "gaps": [
        "Most prior work targets face detection; continuous tracking with control-loop feedback is less explored on MCU-class devices.",
        "Few papers report end-to-end system latency and energy under realistic deployment settings.",
        "Limited evidence on robustness across lighting/pose shifts for on-device tracking under tight memory constraints."
      ],
      "latexReady": "\\noindent Most prior work targets face detection; continuous tracking with control-loop feedback is less explored...\n\\begin{itemize}\n  \\item Few papers report end-to-end system latency...\n\\end{itemize}"
    }
  },
  "meta": { "requestId": "req_..." }
}
```

---

## 8) Common Error Codes

- `VALIDATION_ERROR`
- `UPSTREAM_ERROR` (arXiv / Semantic Scholar request failed)
- `LLM_ERROR` (provider error)
- `INTERNAL_ERROR`

**Example**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": [{ "path": ["papers", 0, "title"], "issue": "Required" }]
  },
  "meta": { "requestId": "req_..." }
}
```
