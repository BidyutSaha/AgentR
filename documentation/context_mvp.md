# context.md — Full-Stack Literature Review System with Authentication

This is a **full-stack** Node.js + TypeScript + React project with:
1) **PostgreSQL Database** for user management and data persistence
2) **JWT Authentication** with email verification and password recovery
3) **Backend API** for literature review pipeline (stage-by-stage)
4) **Responsive Frontend** (React + TypeScript)

---

## 1) Goal (Full System)

### Backend Features:
- **Authentication System**:
  - User registration with email verification
  - JWT access tokens (15min) and refresh tokens (7 days)
  - Password recovery mechanism
  - Secure password hashing (bcrypt)
  
- **Literature Review Pipeline** (Protected Routes):
  - Stage 1: Intent Decomposition
  - Stage 2: Query Generation
  - Stage 3: Paper Retrieval (arXiv + Semantic Scholar)
  - Stage 4: Filtering / Quality heuristics
  - Paper Scoring: Semantic similarity + dual-category evaluation + gap analysis
  
- **User Dashboard**:
  - View saved projects
  - Manage account settings
  - View literature review history

### Frontend Features:
- **Public Pages**:
  - Landing page
  - Login page
  - Registration page
  - Email verification page
  - Password reset pages
  
- **Protected Pages** (Require Authentication):
  - Dashboard
  - Literature review interface
  - Project management
  - Account settings
  
- **Responsive Design**: Mobile-first, works on all devices

---

## 2) Tech Stack

### Backend:
- **Runtime**: Node.js (LTS) + TypeScript
- **Framework**: Express
- **Database**: PostgreSQL 14+
- **ORM**: Prisma
- **Authentication**: 
  - JWT (jsonwebtoken)
  - bcrypt for password hashing
  - crypto for token generation
- **Validation**: Zod for request/response validation
- **HTTP Client**: Axios (for external APIs)
- **Logging**: Pino logger
- **Email**: Nodemailer (SMTP)
- **Environment**: dotenv

### Frontend:
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: React Context API + hooks
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form + Zod validation
- **Styling**: CSS Modules + Modern CSS (no Tailwind unless requested)
- **UI Components**: Custom components (responsive, accessible)

### DevOps (Optional for later):
- Redis/BullMQ for async jobs
- OpenTelemetry tracing
- Docker for containerization
- Nginx for reverse proxy

---

## 3) Project Layout (Clean + Modular)

```
Paper Agent/
  documentation/
    idea.md
    context_mvp.md
    api_mvp.md
    DATABASE.md              # ← NEW: Database schema documentation
    AUTHENTICATION.md        # ← NEW: Auth system documentation
    testing/
      TESTING_AUTH.md        # ← NEW: Auth testing guide
      ...

  literature-review-backend/
    prisma/
      schema.prisma          # ← NEW: Prisma schema
      migrations/            # ← NEW: Database migrations
    
    package.json
    tsconfig.json
    .env.example
    .gitignore

    src/
      app.ts
      server.ts

      config/
        env.ts
        logger.ts
        database.ts          # ← NEW: Prisma client
        email.ts             # ← NEW: Email configuration

      middlewares/
        requestId.ts
        requestLogger.ts
        errorHandler.ts
        validate.ts
        auth.ts              # ← NEW: JWT authentication middleware
        rateLimit.ts         # ← NEW: Rate limiting

      routes/
        index.ts
        health.routes.ts
        auth.routes.ts       # ← NEW: Authentication routes
        stages.routes.ts     # ← Protected routes
        dashboard.routes.ts  # ← NEW: Dashboard routes

      controllers/
        health.controller.ts
        auth.controller.ts   # ← NEW: Auth controller
        stages.controller.ts
        dashboard.controller.ts  # ← NEW

      services/
        auth/                # ← NEW: Authentication services
          auth.service.ts
          auth.schema.ts
          token.service.ts
          email.service.ts
          password.service.ts
        
        intent/
          intent.service.ts
          intent.schema.ts
          intent.prompts.ts
        
        queries/
          queries.service.ts
          queries.schema.ts
        
        retrieval/
          retrieval.service.ts
          retrieval.schema.ts
          sources/
            arxiv.client.ts
            semanticScholar.client.ts
        
        filter/
          filter.service.ts
          filter.schema.ts
        
        score/               # ← Merged stages 5+6+7
          score.service.ts
          score.schema.ts

      llm/
        llm.provider.ts
        openai.provider.ts
        embeddings.provider.ts

      utils/
        normalize.ts
        dedup.ts
        scoring.ts
        time.ts
        crypto.ts            # ← NEW: Token generation

      types/
        api.ts
        domain.ts
        auth.ts              # ← NEW: Auth types

      tests/
        health.test.ts
        auth.test.ts         # ← NEW
        stages.test.ts

  literature-review-frontend/  # ← NEW: Frontend application
    package.json
    tsconfig.json
    vite.config.ts
    .env.example
    
    public/
      favicon.ico
      
    src/
      main.tsx
      App.tsx
      
      pages/
        public/
          LandingPage.tsx
          LoginPage.tsx
          RegisterPage.tsx
          VerifyEmailPage.tsx
          ForgotPasswordPage.tsx
          ResetPasswordPage.tsx
        
        protected/
          DashboardPage.tsx
          LiteratureReviewPage.tsx
          ProjectsPage.tsx
          SettingsPage.tsx
      
      components/
        common/
          Button.tsx
          Input.tsx
          Card.tsx
          Modal.tsx
          Spinner.tsx
        
        auth/
          LoginForm.tsx
          RegisterForm.tsx
          PasswordResetForm.tsx
        
        dashboard/
          ProjectCard.tsx
          StatsCard.tsx
        
        layout/
          Header.tsx
          Footer.tsx
          Sidebar.tsx
          ProtectedRoute.tsx
      
      context/
        AuthContext.tsx
        ThemeContext.tsx
      
      services/
        api.ts
        auth.api.ts
        stages.api.ts
      
      hooks/
        useAuth.ts
        useApi.ts
        useForm.ts
      
      utils/
        validation.ts
        storage.ts
        constants.ts
      
      types/
        auth.types.ts
        api.types.ts
      
      styles/
        global.css
        variables.css
        components/
          Button.module.css
          Input.module.css
          ...
```

---

## 4) API Design Rules (MVP)

- Base path: `/v1`
- Stateless: every stage endpoint receives everything it needs via JSON body.
- Consistent success envelope:
  ```json
  { "data": { ... }, "meta": { "requestId": "..." } }
  ```
- Consistent error envelope:
  ```json
  { "error": { "code": "...", "message": "...", "details": ... }, "meta": { "requestId": "..." } }
  ```
- Every stage output must include:
  - `stage`
  - `version`
  - `generatedAt` (ISO)
  - `input` (echo)
  - `output`

---

## 5) Stage Dependencies (How to Test in Postman)

You can call stages independently, but typical flow is:

1) `/v1/stages/intent` with `{ abstract, preferences? }`
2) `/v1/stages/queries` with `{ intent }` (or just `keywords_seed`)
3) `/v1/stages/retrieve` with `{ query, sources, limitPerSource }`
4) `/v1/stages/filter` with `{ papers, preferences }`
5) `/v1/stages/match` with `{ abstract, papers }`
6) `/v1/stages/rank` with `{ abstract, matches }`
7) `/v1/stages/gaps` with `{ abstract, ranked }`

---

## 6) Environment Variables (.env.example)

- `PORT=5000`
- `NODE_ENV=development`
- `OPENAI_API_KEY=...` (only if using OpenAI)
- `LLM_MODEL=...`
- `EMBEDDINGS_MODEL=...`
- `SEMANTIC_SCHOLAR_API_KEY=` (optional; depends on endpoint usage)
- `DEFAULT_TIME_WINDOW_YEARS=5`

---

## 7) Implementation Notes (So Cursor/Antigravity stays aligned)

- Put all business logic in `services/`; controllers must be thin.
- Use Zod schemas per stage (`*.schema.ts`) for both request and response shapes.
- Add safe timeouts + retries for external APIs (arXiv/S2).
- Normalize & deduplicate papers using DOI/arXivId; fallback to title+year hash.
- Keep “LLM provider” behind an interface so you can swap OpenAI/Groq/local later.
- Do not over-engineer in MVP: no DB, no queue, no auth.

---

## 8) Definition of C1 vs C2 (Scoring)

- **C1 (0–10):** papers that are *very close* (same problem + similar methodology/constraints).
- **C2 (0–10):** papers that share *partial overlap* (one component overlaps: dataset, method piece, metric, constraint, etc.)

Each paper must return:
- `score` (0–10)
- `category` (`C1` or `C2`)
- `justification` (1–2 sentences)

---

## 9) Minimal Milestones

- M0: health + skeleton
- M1: stage-1 & stage-2 (LLM-based)
- M2: stage-3 retrieval (arXiv + Semantic Scholar)
- M3: stage-4 filter + stage-5 match (embeddings)
- M4: stage-6 rank + stage-7 gaps + LaTeX export string
