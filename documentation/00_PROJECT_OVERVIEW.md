# Literature Review System - Complete Project Overview

**Project Name**: AI-Powered Literature Review Assistant  
**Version**: 1.0.0  
**Last Updated**: 2026-01-11  
**Tech Stack**: Node.js, Express, TypeScript, PostgreSQL, Prisma, BullMQ, Redis, OpenAI

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Purpose](#project-purpose)
3. [System Architecture](#system-architecture)
4. [Core Features](#core-features)
5. [Business Logic](#business-logic)
6. [User Workflows](#user-workflows)
7. [Technical Implementation](#technical-implementation)
8. [API Endpoints](#api-endpoints)
9. [Database Schema](#database-schema)
10. [AI/LLM Integration](#aillm-integration)
11. [Credits & Billing System](#credits--billing-system)
12. [Background Job Processing](#background-job-processing)
13. [Security & Authentication](#security--authentication)
14. [Admin Features](#admin-features)
15. [Future Enhancements](#future-enhancements)

---

## Executive Summary

The **Literature Review System** is an AI-powered research assistant that helps researchers analyze academic papers against their research ideas. It uses Large Language Models (LLMs) to:

1. **Decompose** research ideas into structured components
2. **Generate** targeted search queries
3. **Score** candidate papers for relevance
4. **Identify** research gaps and novelty
5. **Track** usage and costs transparently

**Key Metrics**:
- 52 API endpoints
- 12 database tables
- 4 background job types
- 3-stage LLM pipeline
- AI Credits billing system
- Full admin control panel

---

## Project Purpose

### Problem Statement

Researchers face several challenges when conducting literature reviews:

1. **Time-Consuming**: Manual paper analysis takes hours per paper
2. **Inconsistent**: Subjective evaluation criteria
3. **Incomplete**: Missing relevant papers or research gaps
4. **Expensive**: LLM API costs add up quickly
5. **Unstructured**: No systematic approach to paper evaluation

### Solution

An automated system that:

✅ **Analyzes** research ideas using AI  
✅ **Generates** search queries automatically  
✅ **Scores** papers objectively (C1: Competitor, C2: Supporting)  
✅ **Identifies** research gaps and user novelty  
✅ **Tracks** costs transparently in AI Credits  
✅ **Processes** asynchronously for better UX  

---

## System Architecture

### High-Level Architecture

```
┌─────────────────┐
│   Frontend      │
│   (Future)      │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────────────────────────────┐
│         Express.js API Server           │
│  ┌──────────┐  ┌──────────┐  ┌───────┐ │
│  │Controllers│→│ Services │→│Prisma │ │
│  └──────────┘  └──────────┘  └───┬───┘ │
└──────────────────────────────────┼─────┘
                                   │
         ┌─────────────────────────┼─────────────────┐
         ▼                         ▼                 ▼
┌──────────────┐          ┌──────────────┐  ┌──────────────┐
│  PostgreSQL  │          │    Redis     │  │   OpenAI     │
│   Database   │          │  (BullMQ)    │  │   API        │
└──────────────┘          └──────┬───────┘  └──────────────┘
                                 │
                          ┌──────▼───────┐
                          │   Workers    │
                          │ (Background) │
                          └──────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Runtime** | Node.js 18+ | JavaScript runtime |
| **Framework** | Express.js | Web framework |
| **Language** | TypeScript | Type safety |
| **Database** | PostgreSQL 14+ | Relational data storage |
| **ORM** | Prisma | Type-safe database access |
| **Queue** | BullMQ + Redis | Background job processing |
| **AI** | OpenAI GPT-4 | LLM processing |
| **Auth** | JWT | Stateless authentication |
| **Email** | Nodemailer | Email notifications |

---

## Core Features

### 1. User Management

**Features**:
- User registration with email verification
- Secure login with JWT tokens
- Password reset via email
- Profile management
- Multi-device support (refresh tokens)

**Business Rules**:
- Email must be unique
- Password must be strong (8+ chars, uppercase, lowercase, number, special)
- Email verification required before login
- Verification tokens expire in 24 hours
- Reset tokens expire in 1 hour
- Refresh tokens expire in 7 days

### 2. Project Management

**Features**:
- Create research projects with user ideas
- Automatic LLM processing (intent + queries)
- View project details with processing status
- Update project information
- Delete projects (cascade deletes papers)
- Export project reports to Excel

**Business Rules**:
- Each project belongs to one user
- Project name must be unique per user
- Projects can have multiple candidate papers
- Deleting project deletes all associated papers
- Processing status tracked: NOT_INITIATED, UNDER_PROCESSING, EVALUATED, FAILED

### 3. Paper Management

**Features**:
- Add candidate papers to projects
- Bulk upload via CSV
- Automatic LLM scoring
- View paper analysis (C1/C2 scores, gaps)
- Update paper details
- Delete papers

**Business Rules**:
- Each paper belongs to one project
- Papers scored as C1 (competitor) or C2 (supporting work)
- Scoring includes: semantic similarity, overlap analysis, strengths/weaknesses, research gaps
- Papers can be uploaded individually or in bulk
- Deleting paper does NOT delete project

### 4. LLM Pipeline (3 Stages)

**Stage 1: Intent Decomposition**
- Input: User's research idea (text)
- Output: Problem statement, methodologies, domains, constraints, contribution types, keywords
- Purpose: Structure unstructured research ideas

**Stage 2: Query Generation**
- Input: Stage 1 output
- Output: Boolean query, expanded keywords, search queries for multiple databases
- Purpose: Generate targeted search queries

**Stage 3: Paper Scoring**
- Input: User abstract + candidate paper abstract
- Output: Semantic similarity, overlap analysis, C1/C2 score, justification, gaps, novelty
- Purpose: Evaluate paper relevance and identify research gaps

### 5. Credits & Billing System

**Features**:
- AI Credits balance tracking
- USD to Credits conversion (configurable multiplier)
- Default signup credits
- Usage tracking (per user, per project, per paper)
- Transaction history
- Admin credit management

**Business Rules**:
- 1 USD = X Credits (configurable, default 1000)
- New users get default credits (configurable, default 100)
- Credits deducted after each LLM call
- Insufficient credits = job fails with FAILED_NO_CREDITS
- Complete audit trail in llm_usage_logs and user_credits_transactions

### 6. Background Job Processing

**Features**:
- Asynchronous LLM processing
- Job status tracking
- Automatic retry on failure
- Resume failed jobs
- Bulk resume all failed jobs

**Job Types**:
- `PROJECT_INIT_INTENT` - Stage 1 processing
- `PROJECT_INIT_QUERY` - Stage 2 processing
- `PAPER_SCORING` - Paper analysis
- `SEND_EMAIL` - Email notifications

**Job Statuses**:
- `PENDING` - Waiting to start
- `PROCESSING` - Currently running
- `COMPLETED` - Finished successfully
- `FAILED` - System error
- `FAILED_NO_CREDITS` - Insufficient credits

### 7. Admin Features

**Model Pricing Management**:
- Create/update/delete LLM model pricing
- Support multiple providers (OpenAI, Anthropic, etc.)
- Support pricing tiers (batch, flex, standard, priority)
- Historical pricing tracking

**System Configuration**:
- Update USD to Credits multiplier
- Update default signup credits
- View configuration history

**Credits Management**:
- Recharge user credits
- Deduct user credits
- View user balances
- View transaction history (per user or global)

---

## Business Logic

### 1. User Registration Flow

```
1. User submits registration (email, password, name)
   ↓
2. Validate email format and uniqueness
   ↓
3. Validate password strength
   ↓
4. Hash password (bcrypt, cost 12)
   ↓
5. Create user record (isVerified = false)
   ↓
6. Get default credits from default_credits_history (is_active = true)
   ↓
7. Create transaction record (SIGNUP_DEFAULT)
   ↓
8. Set user.aiCreditsBalance = default credits
   ↓
9. Generate verification token (UUID)
   ↓
10. Save token to email_verification_tokens (expires in 24h)
    ↓
11. Send verification email (async job)
    ↓
12. Return success (user cannot login yet)
```

**Business Rules**:
- Email must be unique (409 Conflict if duplicate)
- Password must meet strength requirements (400 Bad Request if weak)
- User gets default credits immediately
- Verification required before login (401 if not verified)

### 2. Login Flow

```
1. User submits credentials (email, password)
   ↓
2. Find user by email
   ↓
3. Check if user exists (404 if not found)
   ↓
4. Check if email verified (401 if not verified)
   ↓
5. Check if account active (403 if inactive)
   ↓
6. Verify password (bcrypt compare)
   ↓
7. Generate access token (JWT, 15 min expiry)
   ↓
8. Generate refresh token (JWT, 7 day expiry)
   ↓
9. Save refresh token to database
   ↓
10. Update user.lastLogin = NOW()
    ↓
11. Return tokens + user data
```

**Business Rules**:
- Max 3 login attempts per minute (rate limiting)
- Access token expires in 15 minutes
- Refresh token expires in 7 days
- Refresh tokens can be revoked
- Multiple devices supported (multiple refresh tokens per user)

### 3. Project Creation Flow

```
1. User submits project (name, userIdea)
   ↓
2. Validate authentication (JWT)
   ↓
3. Check project name uniqueness (per user)
   ↓
4. Create project record (intentProcessedStatus = NOT_INITIATED)
   ↓
5. Create background_jobs record (type = PROJECT_INIT_INTENT, status = PENDING)
   ↓
6. Create BullMQ job with payload
   ↓
7. Return 202 Accepted with project ID and job ID
   ↓
   [ASYNC - Worker picks up job]
   ↓
8. Worker: Check user credits balance
   ↓
9. Worker: Check project still exists (orphan check)
   ↓
10. Worker: Call OpenAI Stage 1 API
    ↓
11. Worker: Calculate cost (tokens × price)
    ↓
12. Worker: Deduct credits from user balance (atomic transaction)
    ↓
13. Worker: Log usage to llm_usage_logs
    ↓
14. Worker: Update project with Stage 1 results
    ↓
15. Worker: Update project.intentProcessedStatus = EVALUATED
    ↓
16. Worker: Update background_jobs.status = COMPLETED
    ↓
17. Worker: Create new job for Stage 2 (PROJECT_INIT_QUERY)
    ↓
18. [Repeat for Stage 2]
```

**Business Rules**:
- Project creation is asynchronous (returns 202 Accepted)
- User must have sufficient credits
- If credits insufficient, job fails with FAILED_NO_CREDITS
- If project deleted before processing, job fails (orphan check)
- Credits deducted AFTER successful LLM call (not before)
- Stage 2 automatically triggered after Stage 1 completes

### 4. Paper Scoring Flow

```
1. User adds paper (projectId, title, abstract, link)
   ↓
2. Validate authentication
   ↓
3. Check project exists and belongs to user
   ↓
4. Check project has Stage 1+2 results (intentProcessedStatus = EVALUATED)
   ↓
5. Create paper record (isProcessedByLlm = false)
   ↓
6. Create background_jobs record (type = PAPER_SCORING, status = PENDING)
   ↓
7. Create BullMQ job with payload
   ↓
8. Return 202 Accepted with paper ID and job ID
   ↓
   [ASYNC - Worker picks up job]
   ↓
9. Worker: Check user credits balance
   ↓
10. Worker: Check paper still exists (orphan check)
    ↓
11. Worker: Get user abstract from project
    ↓
12. Worker: Call OpenAI Scoring API (user abstract + paper abstract)
    ↓
13. Worker: Calculate cost
    ↓
14. Worker: Deduct credits (atomic transaction)
    ↓
15. Worker: Log usage
    ↓
16. Worker: Update paper with scoring results:
    - semanticSimilarity
    - problemOverlap, methodOverlap, domainOverlap, constraintOverlap
    - c1Score, c1Justification, c1Strengths, c1Weaknesses
    - c2Score, c2Justification, c2ContributionType, c2RelevanceAreas, c2Strengths, c2Weaknesses
    - researchGaps, userNovelty, candidateAdvantage
    ↓
17. Worker: Update paper.isProcessedByLlm = true
    ↓
18. Worker: Update background_jobs.status = COMPLETED
```

**Business Rules**:
- Paper scoring requires completed project (Stage 1+2)
- Scoring is asynchronous (returns 202 Accepted)
- Papers scored as C1 (competitor) OR C2 (supporting work)
- C1 score: 0-100 (how much it competes with user's work)
- C2 score: 0-100 (how much it supports user's work)
- Semantic similarity: 0.0000-1.0000 (cosine similarity)
- Overlap levels: high, medium, low

### 5. Credits Deduction Logic

```
1. LLM call completes successfully
   ↓
2. Get token usage (inputTokens, outputTokens)
   ↓
3. Get model pricing from llm_model_pricing (is_latest = true)
   ↓
4. Calculate input cost = (inputTokens / 1,000,000) × inputPricePerMillion
   ↓
5. Calculate output cost = (outputTokens / 1,000,000) × outputPricePerMillion
   ↓
6. Calculate total cost USD = input cost + output cost
   ↓
7. Get credits multiplier from credits_multiplier_history (is_active = true)
   ↓
8. Calculate credits to deduct = total cost USD × multiplier
   ↓
9. BEGIN TRANSACTION
   ↓
10. Check user.aiCreditsBalance >= credits to deduct
    ↓
11. If insufficient: ROLLBACK, fail job with FAILED_NO_CREDITS
    ↓
12. Deduct credits: user.aiCreditsBalance -= credits to deduct
    ↓
13. Create llm_usage_logs record (stores USD costs)
    ↓
14. COMMIT TRANSACTION
```

**Business Rules**:
- Credits deducted AFTER LLM call (not before)
- Deduction is atomic (transaction ensures consistency)
- If balance insufficient, transaction rolls back
- USD costs stored in llm_usage_logs (for audit)
- Credits calculated using current multiplier
- Historical costs remain accurate (stored in USD)

### 6. Job Retry Logic

```
1. Job fails (FAILED or FAILED_NO_CREDITS)
   ↓
2. User calls Resume Failed Job or Resume All Failed Jobs
   ↓
3. System finds failed job(s) in background_jobs table
   ↓
4. For each job:
   ↓
5. Check if user still exists
   ↓
6. Check if project/paper still exists (orphan check)
   ↓
7. If orphaned: Skip job, log warning
   ↓
8. Check user credits balance (credit check)
   ↓
9. If insufficient: Skip job, log warning
   ↓
10. Reconstruct job payload from database (Redis resilience)
    ↓
11. Create new BullMQ job
    ↓
12. Update background_jobs.status = PENDING
    ↓
13. Increment background_jobs.attempts
    ↓
14. Return 202 Accepted with new job ID
```

**Business Rules**:
- Only FAILED and FAILED_NO_CREDITS jobs can be resumed
- Orphan check prevents processing deleted resources
- Credit check prevents immediate re-failure
- Payload reconstructed from DB (survives Redis restart)
- Attempts counter tracks retry count
- Max retries: 3 (configurable in BullMQ)

### 7. Admin Credit Management Logic

**Recharge Credits**:
```
1. Admin submits recharge (userId, amount, reason)
   ↓
2. Validate admin authentication
   ↓
3. Get user current balance
   ↓
4. BEGIN TRANSACTION
   ↓
5. Update user.aiCreditsBalance += amount
   ↓
6. Create user_credits_transactions record:
   - transactionType = ADMIN_RECHARGE
   - amount = positive value
   - balanceBefore = old balance
   - balanceAfter = new balance
   - adminId = admin user ID
   - reason = provided reason
   ↓
7. COMMIT TRANSACTION
   ↓
8. Return new balance
```

**Deduct Credits**:
```
1. Admin submits deduction (userId, amount, reason)
   ↓
2. Validate admin authentication
   ↓
3. Get user current balance
   ↓
4. Check balance >= amount
   ↓
5. BEGIN TRANSACTION
   ↓
6. Update user.aiCreditsBalance -= amount
   ↓
7. Create user_credits_transactions record:
   - transactionType = ADMIN_DEDUCT
   - amount = negative value
   - balanceBefore = old balance
   - balanceAfter = new balance
   - adminId = admin user ID
   - reason = provided reason
   ↓
8. COMMIT TRANSACTION
   ↓
9. Return new balance
```

**Business Rules**:
- Only admins can manage credits
- All transactions logged (complete audit trail)
- Deductions cannot make balance negative
- Recharges can be unlimited
- Transactions are immutable (no updates/deletes)

### 8. Configuration Update Logic

**Update Credits Multiplier**:
```
1. Admin submits new multiplier (value, description)
   ↓
2. Validate admin authentication
   ↓
3. Get current multiplier (is_active = true)
   ↓
4. BEGIN TRANSACTION
   ↓
5. Update current record:
   - is_active = false
   - effective_to = NOW()
   ↓
6. Create new record:
   - usd_to_credits_multiplier = new value
   - description = provided description
   - updated_by = admin user ID
   - effective_from = NOW()
   - effective_to = NULL
   - is_active = true
   ↓
7. COMMIT TRANSACTION
   ↓
8. Return new configuration
```

**Business Rules**:
- Type 2 SCD pattern (never delete history)
- Only one active record at a time
- Historical rates preserved for audit
- Changes take effect immediately
- Existing costs unaffected (stored in USD)

---

## User Workflows

### Workflow 1: New User Onboarding

```
1. User registers → Receives verification email
2. User clicks verification link → Email verified
3. User logs in → Receives JWT tokens
4. User views profile → Sees default credits balance
5. User creates first project → Stage 1+2 processing starts
6. User monitors job status → Waits for completion
7. User views project → Sees intent and queries
8. User adds candidate papers → Scoring starts
9. User views papers → Sees C1/C2 scores and gaps
10. User exports report → Downloads Excel file
```

### Workflow 2: Research Paper Analysis

```
1. User has completed project (Stage 1+2 done)
2. User adds paper (title, abstract, link)
3. System creates paper record
4. System creates PAPER_SCORING job
5. Worker checks credits
6. Worker calls OpenAI API
7. Worker deducts credits
8. Worker saves scoring results
9. User views paper → Sees:
   - Semantic similarity score
   - Overlap analysis (problem, method, domain, constraint)
   - C1 score (competitor analysis)
   - C2 score (supporting work analysis)
   - Research gaps identified
   - User's novelty highlighted
   - Candidate paper advantages
10. User decides: Keep paper or discard
```

### Workflow 3: Bulk Paper Upload

```
1. User downloads CSV template
2. User fills template with papers (title, abstract, link)
3. User uploads CSV file
4. System parses CSV
5. System creates paper records (batch)
6. System creates PAPER_SCORING jobs (one per paper)
7. Workers process jobs in parallel
8. User monitors job status
9. User views all papers with scores
10. User filters by C1/C2 scores
```

### Workflow 4: Admin Configuration

```
1. Admin logs in
2. Admin views system configuration
3. Admin updates credits multiplier (e.g., 1000 → 1200)
4. System creates new history record
5. New rate takes effect immediately
6. Admin views multiplier history
7. Admin updates default signup credits (e.g., 100 → 200)
8. System creates new history record
9. New users get 200 credits
10. Existing users unaffected
```

---

## Technical Implementation

### 1. Layered Architecture

```
src/
├── controllers/     # HTTP request handling
├── services/        # Business logic
├── repositories/    # Database access (future)
├── middleware/      # Request/response processing
├── validators/      # Input validation (Zod schemas)
├── workers/         # Background job processors
├── types/           # TypeScript types
├── utils/           # Utility functions
└── config/          # Configuration
```

**Separation of Concerns**:
- **Controllers**: HTTP handling only (no business logic)
- **Services**: Business logic only (no HTTP or DB concerns)
- **Validators**: Input validation at API boundaries
- **Workers**: Async job processing
- **Middleware**: Cross-cutting concerns (auth, logging, error handling)

### 2. Database Design

**Normalization**: 3NF/BCNF (see DATABASE_NORMALIZATION_STATUS.md)

**Key Design Patterns**:
- **Type 2 SCD**: Configuration history (multiplier, default credits, pricing)
- **Audit Log**: Immutable transaction records
- **Soft Delete**: Not used (hard delete with CASCADE)
- **Denormalization**: Credits balance in users table (performance)

**Relationships**:
- users → projects (1:N, CASCADE delete)
- projects → papers (1:N, CASCADE delete)
- users → llm_usage_logs (1:N, CASCADE delete)
- users → user_credits_transactions (1:N, CASCADE delete)
- users → background_jobs (1:N, CASCADE delete)

### 3. API Design

**RESTful Principles**:
- Resource-based URLs (`/v1/user-projects`, `/v1/candidate-papers`)
- HTTP methods (GET, POST, PUT, DELETE)
- Status codes (200, 201, 202, 400, 401, 403, 404, 409, 500)
- JSON request/response bodies

**Response Format**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

**Error Format**:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": { ... }
  }
}
```

### 4. Authentication & Authorization

**JWT Strategy**:
- Access token: 15 min expiry (stateless)
- Refresh token: 7 day expiry (stored in DB)
- Token rotation on refresh

**Middleware**:
- `authenticateToken`: Verifies JWT and attaches user to request
- `requireAuth`: Ensures user is authenticated
- `requireAdmin`: Ensures user has admin role (future)

**Security**:
- Passwords hashed with bcrypt (cost 12)
- Tokens signed with HS256
- CORS enabled
- Rate limiting (future)
- Input validation (Zod)

### 5. Background Job Processing

**BullMQ Configuration**:
- Redis connection: localhost:6379
- Job retention: 7 days
- Max retries: 3
- Backoff: Exponential (1s, 2s, 4s)

**Worker Types**:
- `project.worker.ts`: Handles PROJECT_INIT_INTENT, PROJECT_INIT_QUERY
- `paper.worker.ts`: Handles PAPER_SCORING
- `email.worker.ts`: Handles SEND_EMAIL

**Resilience Features**:
- Orphan check: Verify resource exists before processing
- Credit check: Verify sufficient balance before processing
- Payload reconstruction: Rebuild from DB if Redis fails
- Atomic transactions: Credits + logs updated together

---

## API Endpoints

### Summary by Category

| Category | Endpoints | Description |
|----------|-----------|-------------|
| Authentication | 10 | User registration, login, verification, password management |
| User Projects | 7 | CRUD operations, export |
| Candidate Papers | 7 | CRUD operations, bulk upload |
| Background Jobs | 3 | Job monitoring and retry |
| LLM Pipeline | 3 | Direct LLM processing |
| LLM Usage | 6 | Usage tracking (USD and Credits) |
| Credits | 1 | Balance inquiry |
| Admin - Model Pricing | 4 | Pricing management |
| Admin - System Config | 5 | Configuration management |
| Admin - Credits | 5 | Credit management |
| Health | 1 | Health check |
| **Total** | **52** | |

### Complete Endpoint List

See `documentation/03_API.md` for detailed documentation of all 52 endpoints.

---

## Database Schema

### Tables (12 Total)

**Authentication (4)**:
1. `users` - User accounts with credits balance
2. `email_verification_tokens` - Email verification
3. `password_reset_tokens` - Password reset
4. `refresh_tokens` - JWT refresh tokens

**Core Data (2)**:
5. `user_projects` - Research projects
6. `candidate_papers` - Candidate papers with scores

**Background Processing (1)**:
7. `background_jobs` - Job tracking

**LLM Tracking (2)**:
8. `llm_model_pricing` - Model pricing configuration
9. `llm_usage_logs` - Usage tracking

**AI Credits (3)**:
10. `credits_multiplier_history` - USD to Credits rate
11. `default_credits_history` - Signup credits
12. `user_credits_transactions` - Transaction audit log

See `documentation/04_DATABASE.md` for complete schema documentation.

---

## AI/LLM Integration

### OpenAI API Usage

**Models Used**:
- `gpt-4o` - Primary model for all stages
- `gpt-4o-mini` - Alternative (cheaper, faster)

**API Calls**:
1. **Stage 1 (Intent)**: ~500-1000 input tokens, ~300-500 output tokens
2. **Stage 2 (Queries)**: ~800-1200 input tokens, ~400-600 output tokens
3. **Stage 3 (Scoring)**: ~1000-1500 input tokens, ~600-800 output tokens

**Cost Calculation**:
```
Input Cost = (inputTokens / 1,000,000) × inputPricePerMillion
Output Cost = (outputTokens / 1,000,000) × outputPricePerMillion
Total Cost USD = Input Cost + Output Cost
Credits = Total Cost USD × Multiplier
```

**Example** (gpt-4o standard tier):
- Input: 1000 tokens × $2.50/M = $0.0025
- Output: 500 tokens × $10.00/M = $0.0050
- Total: $0.0075 USD = 7.5 Credits (at 1000x multiplier)

### Prompt Engineering

**Stage 1 Prompt Structure**:
```
You are a research assistant analyzing a user's research idea.

User Idea: {userIdea}

Extract the following:
1. Problem Statement
2. Methodologies
3. Application Domains
4. Constraints
5. Contribution Types
6. Keywords

Return JSON format.
```

**Stage 2 Prompt Structure**:
```
Based on the research intent, generate search queries.

Intent: {stage1Output}

Generate:
1. Boolean query
2. Expanded keywords
3. Database-specific queries (Google Scholar, IEEE, ACM, arXiv)

Return JSON format.
```

**Stage 3 Prompt Structure**:
```
Compare these two research abstracts.

User Abstract: {userAbstract}
Candidate Paper: {candidateAbstract}

Analyze:
1. Semantic similarity (0-1)
2. Overlap (problem, method, domain, constraint)
3. C1 Score (competitor, 0-100)
4. C2 Score (supporting work, 0-100)
5. Research gaps
6. User novelty
7. Candidate advantages

Return JSON format.
```

---

## Credits & Billing System

### Credit Flow

```
User Registration
    ↓
Default Credits Added (e.g., 100)
    ↓
User Creates Project
    ↓
Stage 1 LLM Call → Deduct Credits (e.g., -5)
    ↓
Stage 2 LLM Call → Deduct Credits (e.g., -7)
    ↓
User Adds Paper
    ↓
Scoring LLM Call → Deduct Credits (e.g., -8)
    ↓
Balance: 100 - 5 - 7 - 8 = 80 Credits
```

### Transaction Types

| Type | Description | Amount | Who |
|------|-------------|--------|-----|
| `SIGNUP_DEFAULT` | Free credits on registration | Positive | System |
| `ADMIN_RECHARGE` | Admin adds credits | Positive | Admin |
| `ADMIN_DEDUCT` | Admin removes credits | Negative | Admin |
| `ADMIN_ADJUSTMENT` | Balance correction | +/- | Admin |

**Note**: LLM deductions are NOT in user_credits_transactions. They're tracked in llm_usage_logs with USD costs.

### Pricing Configuration

**Model Pricing** (example):
```json
{
  "modelName": "gpt-4o",
  "provider": "openai",
  "pricingTier": "standard",
  "inputUsdPricePerMillionTokens": 2.50,
  "outputUsdPricePerMillionTokens": 10.00,
  "isActive": true,
  "isLatest": true
}
```

**Credits Multiplier** (example):
```json
{
  "usdToCreditsMultiplier": 1000,
  "description": "1 USD = 1000 Credits",
  "effectiveFrom": "2026-01-01T00:00:00Z",
  "effectiveTo": null,
  "isActive": true
}
```

**Default Credits** (example):
```json
{
  "defaultCredits": 100,
  "description": "Free credits for new users",
  "effectiveFrom": "2026-01-01T00:00:00Z",
  "effectiveTo": null,
  "isActive": true
}
```

---

## Background Job Processing

### Job Lifecycle

```
1. API Request → Create job record (PENDING)
2. Create BullMQ job → Add to queue
3. Return 202 Accepted → User gets job ID
4. Worker picks up job → Update status (PROCESSING)
5. Worker executes → LLM call, credit deduction
6. Worker completes → Update status (COMPLETED)
   OR
   Worker fails → Update status (FAILED/FAILED_NO_CREDITS)
```

### Job Monitoring

**User can**:
- Get all jobs: `GET /v1/jobs`
- Filter by status: `GET /v1/jobs?status=FAILED`
- Resume failed job: `POST /v1/jobs/:jobId/resume`
- Resume all failed: `POST /v1/jobs/resume-all`

**Job includes**:
- Job ID, type, status
- User ID, project ID, paper ID
- BullMQ job ID
- Failure reason
- Attempts count
- Created/updated timestamps

### Retry Strategy

**Automatic Retries** (BullMQ):
- Max attempts: 3
- Backoff: Exponential (1s, 2s, 4s)
- Retry on: System errors, timeouts

**Manual Retries** (User-initiated):
- Resume single job
- Resume all failed jobs
- Checks: Orphan, credits
- Creates new BullMQ job

---

## Security & Authentication

### Password Security

- **Hashing**: bcrypt with cost factor 12
- **Strength**: Min 8 chars, uppercase, lowercase, number, special char
- **Storage**: Only hash stored (never plain text)
- **Reset**: Time-limited tokens (1 hour expiry)

### Token Security

- **Access Token**: 15 min expiry, stateless
- **Refresh Token**: 7 day expiry, stored in DB
- **Rotation**: Refresh tokens rotated on use
- **Revocation**: Refresh tokens can be revoked (logout)

### API Security

- **Authentication**: JWT Bearer token
- **Authorization**: Role-based (future: admin vs user)
- **Input Validation**: Zod schemas
- **SQL Injection**: Prevented by Prisma (parameterized queries)
- **XSS**: Prevented by JSON responses (no HTML)
- **CORS**: Configured for allowed origins

### Email Security

- **Verification**: Required before login
- **Tokens**: UUID v4 (cryptographically random)
- **Expiry**: 24 hours (verification), 1 hour (reset)
- **One-time use**: Tokens marked as used

---

## Admin Features

### Model Pricing Management

**Capabilities**:
- Add new model pricing
- Update existing pricing
- Delete pricing
- View pricing history
- Support multiple tiers (batch, flex, standard, priority)
- Support cached input pricing

**Use Cases**:
- OpenAI price changes
- Add new models (GPT-5, Claude 3.5)
- Add new providers (Anthropic, Google)
- A/B testing different tiers

### System Configuration

**Capabilities**:
- Update USD to Credits multiplier
- View multiplier history
- Update default signup credits
- View default credits history
- Get current system configuration

**Use Cases**:
- Adjust pricing (increase/decrease multiplier)
- Promotional campaigns (increase signup credits)
- Cost optimization (decrease multiplier)
- Historical analysis (view past configurations)

### Credits Management

**Capabilities**:
- Recharge user credits (add)
- Deduct user credits (remove)
- View user balance
- View user transaction history
- View global transaction history

**Use Cases**:
- Customer support (refunds, bonuses)
- Promotional credits
- Penalty deductions
- Balance corrections
- Audit compliance

---

## Future Enhancements

### Planned Features

1. **Frontend Application**
   - React/Next.js web app
   - User dashboard
   - Project management UI
   - Paper analysis visualization
   - Real-time job status updates (WebSocket)

2. **Advanced Search**
   - Full-text search on papers
   - Filter by C1/C2 scores
   - Sort by semantic similarity
   - Export filtered results

3. **Collaboration**
   - Share projects with team members
   - Role-based access control
   - Comments on papers
   - Project versioning

4. **Analytics**
   - Usage dashboards
   - Cost analytics
   - Popular research areas
   - User engagement metrics

5. **Integrations**
   - Google Scholar API
   - IEEE Xplore API
   - arXiv API
   - Mendeley/Zotero import

6. **Payment Gateway**
   - Stripe integration
   - Credit packages
   - Subscription plans
   - Invoice generation

7. **Notifications**
   - Email notifications (job completion)
   - In-app notifications
   - Webhook support
   - Slack integration

8. **Performance**
   - Caching (Redis)
   - Database indexing optimization
   - Query optimization
   - CDN for static assets

9. **Monitoring**
   - Application monitoring (Datadog, New Relic)
   - Error tracking (Sentry)
   - Log aggregation (ELK stack)
   - Uptime monitoring

10. **DevOps**
    - CI/CD pipeline (GitHub Actions)
    - Docker containerization
    - Kubernetes deployment
    - Auto-scaling

---

## Conclusion

The **Literature Review System** is a comprehensive, production-ready application that leverages AI to streamline academic research. With 52 API endpoints, 12 database tables, and a robust credits system, it provides researchers with powerful tools to analyze papers, identify gaps, and advance their work.

**Key Strengths**:
- ✅ **Scalable**: Async processing, horizontal scaling
- ✅ **Secure**: JWT auth, bcrypt hashing, input validation
- ✅ **Transparent**: Complete audit trail, USD + Credits tracking
- ✅ **Resilient**: Job retry, orphan checks, atomic transactions
- ✅ **Maintainable**: Layered architecture, TypeScript, comprehensive docs
- ✅ **Extensible**: Modular design, clear separation of concerns

**Production Readiness**: ✅ Ready for deployment with proper environment configuration.

---

**For more information, see**:
- `documentation/03_API.md` - Complete API reference
- `documentation/04_DATABASE.md` - Database schema
- `documentation/02_ARCHITECTURE.md` - System architecture
- `documentation/06_DECISIONS.md` - Architecture decisions
- `documentation/POSTMAN_GUIDE.md` - Testing guide

---

**Last Updated**: 2026-01-11  
**Version**: 1.0.0  
**Status**: Production Ready ✅
