# LLM-Driven Literature Review System

An intelligent full-stack platform for automated literature review and research gap discovery using **LLM technology**, with **asynchronous job processing**, **AI credits system**, and **comprehensive user management**.

## 🌟 Features

### Core Capabilities
- ✅ **Three-Stage LLM Pipeline**: Intent decomposition → Query generation → Paper scoring
- ✅ **Asynchronous Processing**: Background workers for long-running LLM operations
- ✅ **AI Credits System**: Transparent USD-to-credits billing with usage tracking
- ✅ **Dual Paper Categorization**: C1 (competitor) and C2 (supporting work) analysis
- ✅ **Research Gap Discovery**: Automated gap identification and novelty assessment
- ✅ **Bulk Operations**: CSV upload for up to 100 papers with parallel processing

### User Management
- ✅ **Secure Authentication**: JWT-based auth with access/refresh tokens
- ✅ **Email Verification**: Mandatory email verification workflow
- ✅ **Password Recovery**: Secure password reset via email
- ✅ **Admin Controls**: Credit recharge, system configuration, pricing management

### Data & Infrastructure
- ✅ **PostgreSQL Database**: 12 tables with Type 2 SCD for pricing history
- ✅ **Redis + BullMQ**: Durable job queues with retry logic
- ✅ **Background Workers**: 3 dedicated workers (Project, Paper, Email)
- ✅ **RESTful API**: 50+ endpoints with comprehensive documentation
- ✅ **Excel Export**: Project reports with multiple sheets

## ⚠️ **IMPORTANT: Project Rules & Standards**

**All contributors and AI assistants (including Antigravity) MUST follow [`rules.md`](./rules.md)**

This project enforces strict quality standards:
- ✅ **Comprehensive API documentation** with input/output schemas, samples, and error cases
- ✅ **Database ER diagram** (MANDATORY - updated with ANY schema change)
- ✅ **Post-Implementation Checklist** (9 categories verified for every change)
- ✅ **Naming conventions** (semantic naming, no vague names)
- ✅ **Testing standards** (minimum 70% coverage)
- ✅ **Documentation-first** approach (single source of truth)

**Key Files:**
- [`rules.md`](./rules.md) - Complete project rules and standards
- [`MIGRATION_GUIDE.md`](./MIGRATION_GUIDE.md) - How to bring existing code into compliance
- [`.antigravity`](./.antigravity) - Antigravity configuration

**For Antigravity users**: Configure Antigravity to use `rules.md` as custom rules file.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 14+
- **Redis** 6+ (required for background jobs)
- **OpenAI API Key**
- **SMTP Email Service** (Gmail, SendGrid, or AWS SES)

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd literature-review-backend
   npm install
   ```

2. **Setup PostgreSQL Database**
   ```bash
   # Create database
   createdb literature_review_db
   
   # Run migrations
   npx prisma generate
   npx prisma migrate deploy
   ```

3. **Seed Database (REQUIRED)**
   ```bash
   # Seed with default values:
   # - Default credits: 100
   # - Credits multiplier: 1000 credits = $1 USD
   # - LLM model pricing (GPT-4o, GPT-4o-mini)
   npx prisma db seed
   ```

4. **Setup Redis**
   ```bash
   # Install Redis (if not already installed)
   # Windows: Use WSL or Docker
   # macOS: brew install redis
   # Linux: sudo apt-get install redis-server
   
   # Start Redis
   redis-server
   ```

5. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env and add:
   # - DATABASE_URL (PostgreSQL connection string)
   # - REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
   # - OPENAI_API_KEY
   # - JWT_ACCESS_SECRET, JWT_REFRESH_SECRET (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
   # - SMTP credentials (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD)
   # - EMAIL_FROM
   # - FRONTEND_URL
   # - ADMIN_EMAILS
   ```

6. **Start Backend (API + Workers)**
   ```bash
   npm run dev
   ```
   
   This starts:
   - Express API server (port 5000)
   - Project Worker (Stage 1 & 2)
   - Paper Worker (Stage 3)
   - Email Worker

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd literature-review-frontend
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env and set VITE_API_URL=http://localhost:5000
   ```

3. **Start Frontend**
   ```bash
   npm run dev
   ```

4. **Access Application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`
   - Health Check: `http://localhost:5000/v1/health`

## 📁 Project Structure

```
Paper Agent/
├── architecture.md             ← High-level architecture overview
├── documentation/              ← All documentation files
│   ├── 00_PROJECT_STATUS.md   ← Current progress (single source of truth)
│   ├── 01_SETUP.md            ← Setup instructions
│   ├── 02_ARCHITECTURE.md     ← System architecture
│   ├── 03_API.md              ← Complete API reference
│   ├── 04_DATABASE.md         ← Database schema
│   ├── 05_WORKFLOWS.md        ← Key workflows
│   ├── 06_DECISIONS.md        ← Architecture decisions
│   ├── 07_TROUBLESHOOTING.md  ← Common issues
│   ├── 08_TESTING.md          ← Testing guide
│   ├── 09_DEPLOYMENT.md       ← Deployment guide
│   ├── POSTMAN_GUIDE.md       ← Postman collection guide
│   └── diagrams/              ← PlantUML diagrams
│       ├── sequences/         ← Sequence diagrams (18)
│       ├── activities/        ← Activity diagrams (18)
│       └── database-er-diagram.puml  ← ER diagram
│
├── literature-review-backend/  ← Backend API
│   ├── prisma/                ← Database schema & migrations
│   │   ├── schema.prisma      ← 12 tables defined
│   │   ├── migrations/        ← Migration history
│   │   └── seed.ts            ← Database seeding
│   ├── src/
│   │   ├── services/          ← Business logic
│   │   │   ├── auth/          ← Authentication
│   │   │   ├── intent/        ← Stage 1: Intent
│   │   │   ├── queries/       ← Stage 2: Queries
│   │   │   ├── categorize/    ← Stage 3: Scoring
│   │   │   ├── candidatePaper/← Paper management
│   │   │   ├── projects/      ← Project management
│   │   │   ├── credits.service.ts
│   │   │   ├── llmUsageLogger.service.ts
│   │   │   ├── modelPricing/
│   │   │   ├── systemConfig.service.ts
│   │   │   └── llmUsage/
│   │   ├── controllers/       ← API handlers (10)
│   │   ├── routes/            ← Route definitions (13)
│   │   ├── middlewares/       ← Auth, validation, rate limiting (9)
│   │   ├── workers/           ← Background workers (3)
│   │   │   ├── project.worker.ts
│   │   │   ├── paper.worker.ts
│   │   │   └── email.worker.ts
│   │   ├── queues/            ← BullMQ queue setup
│   │   ├── config/            ← Configuration (DB, Redis, Email)
│   │   ├── types/             ← TypeScript types
│   │   ├── utils/             ← Utility functions
│   │   └── prompts/           ← LLM prompts (3 stages)
│   ├── scripts/               ← Utility scripts
│   │   └── manage-db.ts       ← Database backup/restore
│   └── package.json
│
└── literature-review-frontend/ ← React frontend (if exists)
    ├── src/
    │   ├── pages/             ← Page components
    │   ├── components/        ← Reusable components
    │   ├── context/           ← React Context (Auth, Theme)
    │   ├── services/          ← API integration
    │   └── ...
    └── ...
```

## 📊 Current Status

**✅ Completed (Production-Ready):**
- ✅ **Stage 1**: Intent Decomposition (LLM-powered)
- ✅ **Stage 2**: Query Generation (LLM-powered)
- ✅ **Stage 3**: Paper Scoring (Merged Stages 5+6+7, LLM-powered)
- ✅ **Authentication System**: Registration, login, email verification, password reset
- ✅ **User Management**: JWT tokens, refresh tokens, admin roles
- ✅ **Project Management**: CRUD, lifecycle tracking, Excel export
- ✅ **Paper Management**: CRUD, bulk CSV upload (100 papers), scoring
- ✅ **AI Credits System**: Balance tracking, USD-to-credits conversion, usage logging
- ✅ **Background Jobs**: Asynchronous processing with BullMQ + Redis
- ✅ **Workers**: Project worker, Paper worker, Email worker
- ✅ **Admin Features**: Credit recharge, system config, pricing management
- ✅ **Database**: 12 tables with migrations, seeding, Type 2 SCD
- ✅ **Documentation**: 50+ pages, 36 diagrams, ER diagram, API docs
- ✅ **Job Management**: Retry/resume, orphan detection, failure handling

**🔄 In Progress:**
- 🔄 Frontend Development (React UI)
- 🔄 Production Deployment

**⚪ Future Enhancements:**
- ⚪ Stage 3: Paper Retrieval (arXiv + Semantic Scholar integration)
- ⚪ Stage 4: Advanced Filtering
- ⚪ Real-time Notifications (WebSockets)
- ⚪ Payment Integration (Stripe)
- ⚪ Multi-language Support

See `documentation/00_PROJECT_STATUS.md` for detailed progress.

## 📚 Documentation

All documentation is in the `documentation/` folder:

### Core Documentation
- **[00_PROJECT_STATUS.md](documentation/00_PROJECT_STATUS.md)** - Current progress (single source of truth)
- **[01_SETUP.md](documentation/01_SETUP.md)** - Setup and installation guide
- **[02_ARCHITECTURE.md](documentation/02_ARCHITECTURE.md)** - System architecture
- **[03_API.md](documentation/03_API.md)** - Complete API reference (50+ endpoints)
- **[04_DATABASE.md](documentation/04_DATABASE.md)** - Database schema (12 tables)
- **[05_WORKFLOWS.md](documentation/05_WORKFLOWS.md)** - Key workflows
- **[06_DECISIONS.md](documentation/06_DECISIONS.md)** - Architecture decision records
- **[07_TROUBLESHOOTING.md](documentation/07_TROUBLESHOOTING.md)** - Common issues & solutions
- **[08_TESTING.md](documentation/08_TESTING.md)** - Testing strategy & guide
- **[09_DEPLOYMENT.md](documentation/09_DEPLOYMENT.md)** - Deployment guide

### Diagrams
- **[diagrams/database-er-diagram.puml](documentation/diagrams/database-er-diagram.puml)** - ER diagram
- **[diagrams/sequences/](documentation/diagrams/sequences/)** - 18 sequence diagrams
- **[diagrams/activities/](documentation/diagrams/activities/)** - 18 activity diagrams

### Additional Guides
- **[POSTMAN_GUIDE.md](documentation/POSTMAN_GUIDE.md)** - Postman collection guide
- **[architecture.md](architecture.md)** - High-level architecture overview

## 🎯 API Endpoints

### Authentication (Public)

```bash
POST   /v1/auth/register          # User registration
POST   /v1/auth/login             # User login
GET    /v1/auth/verify-email      # Email verification
POST   /v1/auth/resend-verification  # Resend verification email
POST   /v1/auth/forgot-password   # Request password reset
POST   /v1/auth/reset-password    # Reset password with token
POST   /v1/auth/refresh           # Refresh access token
POST   /v1/auth/logout            # Logout (Protected)
POST   /v1/auth/change-password   # Change password (Protected)
```

### Projects (Protected)

```bash
POST   /v1/user-projects          # Create project (triggers Stage 1 & 2 jobs)
GET    /v1/user-projects/:id      # Get project by ID
GET    /v1/user-projects/user/:userId  # Get all user projects
PATCH  /v1/user-projects/:id      # Update project
DELETE /v1/user-projects/:id      # Delete project
GET    /v1/user-projects/:projectId/export  # Export to Excel
```

### Papers (Protected)

```bash
POST   /v1/user-projects/:projectId/papers  # Add paper (triggers Stage 3 job)
POST   /v1/user-projects/:projectId/papers/bulk-upload  # Bulk CSV upload
GET    /v1/user-projects/:projectId/papers  # Get all papers for project
GET    /v1/papers/:paperId        # Get single paper
PATCH  /v1/papers/:paperId        # Update paper
DELETE /v1/papers/:paperId        # Delete paper
GET    /v1/papers/bulk-upload-template  # Download CSV template
```

### Background Jobs (Protected)

```bash
GET    /v1/jobs                   # Get user jobs (with filters)
POST   /v1/jobs/:jobId/resume     # Resume failed job
POST   /v1/jobs/resume-all        # Resume all failed jobs
```

### LLM Stages (Protected - Direct Testing)

```bash
POST   /v1/stages/intent          # Stage 1: Intent decomposition
POST   /v1/stages/queries         # Stage 2: Query generation
POST   /v1/stages/score           # Stage 3: Paper scoring
```

### Credits (Protected)

```bash
GET    /v1/credits/my-balance     # Get my credits balance
```

### LLM Usage (Protected)

```bash
GET    /v1/llm-usage/my-usage     # Get my LLM usage (USD)
GET    /v1/llm-usage/project/:projectId  # Get project LLM usage (USD)
GET    /v1/llm-usage/my-usage-credits  # Get my LLM usage (Credits)
GET    /v1/llm-usage/project-credits/:projectId  # Get project usage (Credits)
GET    /v1/llm-usage/wallet-transaction-history  # My wallet history
GET    /v1/llm-usage/admin/all-users  # All users billing (Admin)
```

### Admin - Credits (Admin Only)

```bash
POST   /v1/admin/credits/recharge  # Recharge user credits
POST   /v1/admin/credits/deduct    # Deduct user credits
GET    /v1/admin/credits/user/:userId  # Get user balance
GET    /v1/admin/credits/user/:userId/wallet-transaction-history  # User wallet
GET    /v1/admin/credits/wallet-transaction-history  # Global wallet history
```

### Admin - Model Pricing (Admin Only)

```bash
POST   /v1/admin/model-pricing    # Create model pricing
GET    /v1/admin/model-pricing    # List model pricing
PATCH  /v1/admin/model-pricing/:id  # Update model pricing
DELETE /v1/admin/model-pricing/:id  # Delete model pricing
```

### Admin - System Config (Admin Only)

```bash
GET    /v1/admin/system-config    # Get system configuration
POST   /v1/admin/system-config/credits-multiplier  # Update multiplier
GET    /v1/admin/system-config/credits-multiplier/history  # Multiplier history
POST   /v1/admin/system-config/default-credits  # Update default credits
GET    /v1/admin/system-config/default-credits/history  # Default credits history
```

### Health Check (Public)

```bash
GET    /v1/health                 # Health check (DB + Redis connectivity)
```

**Total**: 50+ endpoints across 10 route groups

See `documentation/03_API.md` for complete API documentation with request/response schemas.

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+ + TypeScript + Express
- **Database**: PostgreSQL 14+ with Prisma ORM (12 tables)
- **Job Queue**: Redis 6+ + BullMQ (3 workers)
- **Authentication**: JWT (jsonwebtoken) + bcrypt (cost: 12)
- **Validation**: Zod schemas
- **LLM**: OpenAI API (GPT-4o, GPT-4o-mini, text-embedding-3-small)
- **Email**: Nodemailer (SMTP - Gmail/SendGrid/AWS SES)
- **Logging**: Pino (structured JSON logging)
- **Rate Limiting**: express-rate-limit
- **File Processing**: CSV parsing, Excel generation (ExcelJS)

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State**: React Context API + hooks
- **Forms**: React Hook Form + Zod
- **Styling**: CSS Modules + Modern CSS
- **HTTP**: Axios

### Infrastructure
- **Architecture**: RESTful API with asynchronous job processing
- **Workers**: 3 dedicated BullMQ workers (Project, Paper, Email)
- **Queues**: 3 job queues (project-init-queue, paper-scoring-queue, email-queue)
- **Database Pattern**: Type 2 Slowly Changing Dimension (SCD) for pricing history
- **Security**: JWT auth, bcrypt hashing, rate limiting, CORS, input validation
- **Observability**: Structured logging, health checks, job monitoring

## 📝 License

MIT

---

**For detailed documentation, see the `documentation/` folder.**
