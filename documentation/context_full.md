# context.md — LLM-Driven Literature Review & Research Gap Discovery (Node.js Backend)

> This project implements the pipeline described in `idea.md` as an API-first backend (tested via Postman first), with a React frontend later.  
> Source spec: fileciteturn0file0

---

## 1) Goal

Build a production-style backend that accepts a **research abstract**, runs a **multi-stage literature review pipeline**, and returns:

- structured **intent decomposition**
- generated **search queries**
- retrieved candidate papers from multiple sources
- filtered + scored paper set
- similarity/matching results
- **C1/C2 ranked lists**
- **research gaps** and LaTeX-ready outputs
- optional: run history + reproducibility snapshots

The backend is modular, testable, observable, and suitable for incremental feature rollout.

---

## 2) Tech Stack (Backend-first)

- **Node.js (LTS)** + **TypeScript**
- **Express** (API layer)
- **Zod** (request validation)
- **Prisma + PostgreSQL** (data store)
- **BullMQ + Redis** (background jobs for retrieval/scoring)
- **OpenAI/LLM provider wrapper** (pluggable; can swap providers)
- **Pino** (structured logs)
- **OpenTelemetry** (optional tracing)
- **Jest + Supertest** (API tests)
- **Swagger/OpenAPI** generated from route docs (optional)

> Why jobs/queues? Retrieval + LLM scoring can be slow; jobs allow reliable async processing while still supporting synchronous “quick mode”.

---

## 3) High-level Pipeline Mapping (Stages → Modules)

From `idea.md`:

1. **Intent Decomposition**  
   - `IntentService`: extract problem/method/domain/constraints/keywords  
2. **Query Generation**  
   - `QueryService`: boolean queries + expansions  
3. **Paper Retrieval** (multi-engine, parallel)  
   - `RetrievalService`: arXiv, Semantic Scholar, (optional) Scholar metadata  
4. **Filtering + Quality Scoring**  
   - `FilterService`: time window, venue tier, citations, heuristics  
5. **Semantic Matching**  
   - `MatchService`: embeddings similarity + LLM overlap judgment  
6. **Dual-category Ranking (C1 / C2)**  
   - `RankService`: scoring rubric + justification  
7. **Gap Extraction**  
   - `GapService`: compare user claims vs literature to produce gaps + LaTeX-ready paragraphs  

All stage outputs are persisted and tied to a **Project** and **Run** for reproducibility.

---

## 4) Folder Structure (Industry-Style, Modular)

```
literature-review-backend/
  README.md
  context.md
  api.md
  package.json
  tsconfig.json
  .env.example
  .gitignore

  prisma/
    schema.prisma
    migrations/

  src/
    app.ts
    server.ts

    config/
      env.ts
      logger.ts
      cors.ts
      rateLimit.ts

    middlewares/
      authJwt.ts
      requestId.ts
      requestLogger.ts
      errorHandler.ts
      validate.ts
      usageTracking.ts

    routes/
      index.ts
      health.routes.ts
      auth.routes.ts
      project.routes.ts
      run.routes.ts

    controllers/
      health.controller.ts
      auth.controller.ts
      project.controller.ts
      run.controller.ts

    services/
      intent/
        intent.service.ts
        intent.prompts.ts
      query/
        query.service.ts
      retrieval/
        retrieval.service.ts
        sources/
          arxiv.client.ts
          semanticScholar.client.ts
          scholar.client.ts        # optional / metadata-only
      filter/
        filter.service.ts
      match/
        match.service.ts
      rank/
        rank.service.ts
      gaps/
        gaps.service.ts
      export/
        export.service.ts          # latex/markdown exports

    llm/
      llm.provider.ts             # interface
      openai.provider.ts          # implementation (or others)
      embeddings.provider.ts

    jobs/
      queue.ts
      workers/
        retrieval.worker.ts
        matching.worker.ts
        ranking.worker.ts
        gaps.worker.ts

    db/
      prisma.ts
      repositories/
        project.repo.ts
        run.repo.ts
        paper.repo.ts

    utils/
      http.ts
      normalize.ts
      scoring.ts
      time.ts

    types/
      api.ts
      domain.ts

    tests/
      health.test.ts
      project.test.ts
      run.test.ts
```

---

## 5) Data Model (Prisma Entities)

**Core entities**

- `User` (optional now; useful for multi-tenant)
- `Project` (one abstract + optional preferences)
- `Run` (a pipeline execution; stores settings + snapshot)
- `StageResult` (JSON per stage, versioned)
- `Paper` (normalized candidate papers)
- `PaperScore` (quality + similarity + category score)
- `Export` (LaTeX-ready related work + gaps)

**Minimum to start**: `Project`, `Run`, `StageResult`, `Paper`.

---

## 6) API Philosophy

- **Versioned API**: `/v1/...`
- **Consistent envelope**:
  - success: `{ "data": ..., "meta": {...} }`
  - error: `{ "error": { "code": "...", "message": "...", "details": ... } }`
- **Idempotency** (optional): `Idempotency-Key`
- **Auth**:
  - start with `Bearer <JWT>` (can be toggled off in dev)
- **Observability**:
  - `X-Request-Id`, logs per request, basic metrics
- **Testing**:
  - all endpoints usable via Postman with sample bodies in `api.md`

---

## 7) Environment Variables

`.env.example`:

- `PORT=5000`
- `NODE_ENV=development`
- `DATABASE_URL=postgresql://...`
- `REDIS_URL=redis://...`
- `JWT_SECRET=...`
- `LLM_PROVIDER=openai`
- `OPENAI_API_KEY=...`
- `EMBEDDINGS_MODEL=text-embedding-3-large` (example)
- `DEFAULT_TIME_WINDOW_YEARS=5`

---

## 8) Execution Modes

### A) Synchronous (Quick mode)
- For early testing: run stages 1–2 synchronously, and optionally stage 3 with small limits.

### B) Asynchronous (Recommended)
- `POST /v1/runs` creates a run and returns `runId`
- Worker processes stages and updates run status
- `GET /v1/runs/:id` polls progress

---

## 9) Development Workflow

1. `pnpm i` (or npm/yarn)
2. `docker compose up -d` (postgres + redis)
3. `pnpm prisma migrate dev`
4. `pnpm dev`
5. Test with Postman using `api.md` definitions

---

## 10) Milestones (Backend-first)

**M0 — Skeleton**
- health + auth (optional)
- projects CRUD
- runs create/poll

**M1 — Stage 1–2**
- intent + queries (LLM prompt + deterministic schema)

**M2 — Stage 3**
- arXiv + Semantic Scholar retrieval with pagination + dedup

**M3 — Stage 4–6**
- filtering + matching + ranking (C1/C2)

**M4 — Stage 7 + exports**
- gap extraction + LaTeX-ready related work outline

**M5 — Frontend**
- React dashboard later

---

## 11) Output Contracts (Stable JSON)

Every stage output is stored as JSON in `StageResult` with:

```json
{
  "stage": "intent|queries|retrieval|filter|match|rank|gaps",
  "version": "1.0",
  "generatedAt": "ISO-8601",
  "input": {},
  "output": {}
}
```

This makes it easy to re-run, compare, and export.

---

## 12) Notes for Cursor / Antigravity

- Keep all services pure and testable (no Express req/res inside services)
- Use Zod schemas for every request and every stage output
- Use repository pattern (`db/repositories/*`) to keep Prisma isolated
- Implement retries + backoff for external APIs (arXiv/S2)
- Deduplicate papers by DOI / arXivId / title+year hash
- Never store raw LLM prompts containing secrets; store prompt **template version** + **hash** if needed for traceability
