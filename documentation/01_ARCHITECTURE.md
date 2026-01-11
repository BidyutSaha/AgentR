# Architecture Overview

## 1. System Purpose

This system is an **LLM-driven literature review and research gap discovery platform**. It helps researchers analyze their research ideas, generate targeted search queries, and evaluate candidate academic papers against their work. The core problem it solves is automating the labor-intensive process of literature review by using large language models to:

**Three-Stage LLM Pipeline**:

1. **Stage 1 - Intent Decomposition**: Analyzes the user's research idea and extracts:
   - Problem statement
   - Proposed methodologies
   - Application domains
   - Constraints
   - Contribution types
   - Seed keywords

2. **Stage 2 - Query Generation**: Generates optimized search queries:
   - Boolean query strings
   - Expanded keywords
   - Multiple search query variations
   - Semantic search queries

3. **Stage 3 - Paper Scoring**: Evaluates each candidate paper with:
   - Semantic similarity calculation
   - Overlap analysis (problem, method, domain, constraint)
   - **C1 categorization** (competitor analysis)
   - **C2 categorization** (supporting work analysis)
   - Research gap identification
   - User novelty assessment
   - Candidate advantages

The system operates on a **credit-based consumption model**, where users consume AI credits for each LLM operation, with transparent USD-to-credits conversion and usage tracking.

---

## 2. High-Level Architecture

The system follows a **layered, event-driven architecture** with asynchronous job processing:

```
┌─────────────────────────────────────────────────────────────┐
│                      HTTP API Layer                         │
│         (REST endpoints, JWT auth, rate limiting)           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                      │
│    (Controllers → Services → Domain Logic)                  │
└────────┬──────────────────────────────────┬─────────────────┘
         │                                  │
         ▼                                  ▼
┌──────────────────┐              ┌──────────────────────────┐
│   PostgreSQL     │              │   Redis + BullMQ         │
│   (Persistent    │              │   (Job Queue)            │
│    State)        │              │                          │
└──────────────────┘              └────────┬─────────────────┘
                                           │
                                           ▼
                                  ┌──────────────────────────┐
                                  │   Background Workers     │
                                  │   (Async Processing)     │
                                  └────────┬─────────────────┘
                                           │
                                           ▼
                                  ┌──────────────────────────┐
                                  │   External Services      │
                                  │   - OpenAI API (LLM)     │
                                  │   - SMTP (Email)         │
                                  └──────────────────────────┘
```

**Key architectural characteristics**:
- **Synchronous API layer** for user interactions (CRUD, queries)
- **Asynchronous worker layer** for expensive LLM operations
- **Event-driven job orchestration** via message queue
- **Transactional consistency** for critical operations (credits, state)

---

## 3. Architectural Principles

### 3.1 Separation of Concerns
- **Controllers**: HTTP handling, request validation, response formatting
- **Services**: Business logic, orchestration, domain rules
- **Workers**: Long-running, asynchronous task execution
- **Repositories**: Data access abstraction (via Prisma ORM)

### 3.2 Asynchronous by Default for Expensive Operations
All LLM operations are processed asynchronously to:
- Prevent HTTP timeout on long-running tasks
- Enable horizontal scaling of workers
- Provide better user experience (non-blocking)

### 3.3 Fail-Safe with Recovery
- Jobs can fail due to insufficient credits, API errors, or orphaned resources
- Failed jobs are marked with specific failure reasons
- Users can resume failed jobs after addressing the root cause
- Orphan detection prevents processing jobs for deleted resources

### 3.4 Financial Integrity
- All credit deductions are atomic (database transactions)
- Usage is logged before credits are deducted (audit trail)
- USD costs are stored immutably; credits calculated on-the-fly using current multiplier
- No double-charging: idempotent credit deduction per LLM call

### 3.5 Explicit State Machines
- Projects have processing states (NOT_INITIATED → PROCESSING → EVALUATED → FAILED)
- Jobs have lifecycle states (PENDING → PROCESSING → COMPLETED → FAILED)
- State transitions are explicit and traceable

---

## 4. Core Components

### 4.1 HTTP API Server
**Responsibility**: Accept and respond to client requests.

**Key capabilities**:
- JWT-based authentication and authorization
- Input validation using schema validators (Zod)
- Rate limiting to prevent abuse
- CORS configuration for frontend integration
- Health check endpoint for monitoring
- Request ID generation for tracing
- Centralized error handling

**Technology**: Express.js with TypeScript

**Middleware Pipeline**:
1. **Request ID**: Generates unique ID for each request (tracing)
2. **Request Logger**: Logs incoming requests with context
3. **CORS**: Validates origin and sets headers
4. **Rate Limiter**: Enforces per-IP and per-user limits
5. **Auth Middleware**: Validates JWT and extracts user context
6. **Admin Auth**: Validates admin role for privileged endpoints
7. **Credit Check**: Pre-validates sufficient credits (optional per route)
8. **Input Validator**: Validates request body/params against schemas
9. **Error Handler**: Catches and formats all errors consistently

---

### 4.2 Business Services Layer
**Responsibility**: Implement domain logic and orchestrate operations.

**Key services**:
- **Auth Service**: User registration, login, token management, password reset, email verification
- **Project Service**: Project CRUD, lifecycle management, export to Excel
- **Paper Service**: Candidate paper management, bulk CSV upload (up to 100 papers)
- **LLM Services**: Intent decomposition, query generation, paper scoring
- **Credits Service**: Balance management, admin recharge, transaction history
- **LLM Usage Service**: Usage tracking, cost reporting (USD and Credits)
- **Model Pricing Service**: LLM pricing management (Type 2 SCD)
- **System Config Service**: Dynamic configuration (Type 2 SCD pattern)
- **Job Service**: Background job monitoring, retry/resume

**Design pattern**: Service layer pattern with dependency injection

---

### 4.3 Background Workers
**Responsibility**: Execute long-running, asynchronous tasks.

**Worker types**:
1. **Project Worker**: Processes project initialization (Stage 1 & 2)
   - Stage 1: Intent decomposition (extract problem, methodology, domains)
   - Stage 2: Query generation (create search queries)

2. **Paper Worker**: Processes paper scoring (Stage 3)
   - Semantic similarity calculation
   - Dual categorization (competitor vs supporting work)
   - Research gap identification

3. **Email Worker**: Sends transactional emails
   - Verification emails
   - Password reset emails
   - Notification emails

**Technology**: BullMQ workers with Redis backend

---

### 4.4 Job Queue System
**Responsibility**: Decouple API from workers, enable async processing.

**Characteristics**:
- **Durable**: Jobs survive process restarts (stored in Redis)
- **Prioritized**: Critical jobs can be prioritized
- **Retryable**: Failed jobs can be retried with exponential backoff
- **Observable**: Job status tracked in database

**Queue types**:
- `project-init-queue`: Project initialization jobs
- `paper-scoring-queue`: Paper scoring jobs
- `email-queue`: Email sending jobs

---

### 4.5 Data Persistence Layer
**Responsibility**: Store and retrieve application state.

**Key entities**:
- **Users**: Authentication, credits balance, admin status
- **Projects**: Research ideas, processing state, extracted metadata
- **Papers**: Candidate papers, scoring results, categorization
- **Jobs**: Background job tracking, status, failure reasons
- **Credits**: Usage logs, pricing, multiplier history, transactions
- **Tokens**: JWT refresh tokens, email verification, password reset

**Technology**: PostgreSQL with Prisma ORM

**Design patterns**:
- Type 2 Slowly Changing Dimension (for pricing and multiplier history)
- Optimistic locking (via Prisma)
- Foreign key constraints for referential integrity

---

### 4.6 External Service Integrations

**OpenAI API** (Critical dependency):
- Purpose: LLM inference for all AI operations
- Models: GPT-4o, GPT-4o-mini
- Failure mode: Jobs fail with specific error, can be retried

**SMTP Email Service**:
- Purpose: Transactional email delivery
- Providers: SendGrid, AWS SES, Gmail
- Failure mode: Email jobs fail, can be retried

---

## 5. Data Flow

This section describes five critical data flows through the system, illustrating how components interact to process user requests.

### 5.1 Project Creation Flow (Asynchronous)

```
1. User submits project (API)
   ↓
2. API creates project record (status: NOT_INITIATED)
   ↓
3. API creates background job record (status: PENDING)
   ↓
4. API queues job in Redis (BullMQ)
   ↓
5. API returns 202 Accepted (job ID)
   ↓
6. Worker picks up job from queue
   ↓
7. Worker performs pre-flight checks:
   - Project still exists (orphan check - prevents wasted LLM calls)
   - User has sufficient credits (conservative estimate: ~0.5 credits minimum)
   ↓
8. Worker calls OpenAI API (Stage 1: Intent)
   ↓
9. Worker updates project with extracted data
   ↓
10. Worker logs usage and deducts credits (atomic transaction)
   ↓
11. Worker creates Stage 2 job (Query Generation)
   ↓
12. Worker marks Stage 1 job as COMPLETED
   ↓
13. Stage 2 worker repeats steps 6-12 for query generation
   ↓
14. Email worker sends completion notification
```

**Key characteristics**:
- **Non-blocking**: User doesn't wait for LLM processing
- **Chained**: Stage 2 automatically triggered after Stage 1
- **Resilient**: Each stage can fail independently
- **Auditable**: Every step logged with timestamps

---

### 5.2 Paper Scoring Flow (Asynchronous)

```
1. User adds paper to project (API)
   ↓
2. API validates project is ready (Stage 1 & 2 completed)
   ↓
3. API creates paper record (isProcessedByLlm: false)
   ↓
4. API creates background job (PAPER_SCORING)
   ↓
5. API queues job in Redis
   ↓
6. API returns 202 Accepted
   ↓
7. Worker picks up job
   ↓
8. Worker performs pre-flight checks:
   - Paper still exists (orphan check)
   - Project still exists (orphan check)
   - Project is ready (Stage 1 & 2 completed)
   - User has sufficient credits (conservative estimate)
   ↓
9. Worker builds user abstract from project data
   ↓
10. Worker calls OpenAI API (Stage 3: Scoring)
   ↓
11. Worker updates paper with 31 scoring fields:
    - Semantic similarity
    - Overlap analysis (problem, method, domain, constraint)
    - C1 score (competitor analysis)
    - C2 score (supporting work analysis)
    - Research gaps
    - User novelty
    - Candidate advantages
   ↓
12. Worker logs usage and deducts credits (atomic)
   ↓
13. Worker marks job as COMPLETED
```

---

### 5.3 Credit Deduction Flow (Atomic)

```
1. LLM call completes successfully
   ↓
2. Extract token usage (input, output)
   ↓
3. Calculate USD cost (tokens × pricing per million)
   ↓
4. Get active credits multiplier
   ↓
5. Calculate credits to deduct (USD × multiplier)
   ↓
6. BEGIN DATABASE TRANSACTION
   ↓
7. Create usage log entry (immutable audit record)
   ↓
8. Deduct credits from user balance
   ↓
9. COMMIT TRANSACTION
   ↓
10. Log success
```

**ACID guarantees**:
- **Atomicity**: Both log and deduction succeed or both fail
- **Consistency**: Balance never goes negative (constraint)
- **Isolation**: Concurrent deductions don't interfere
- **Durability**: Once committed, deduction is permanent

---

### 5.4 Job Retry Flow (Recovery)

```
1. User requests job resume (API)
   ↓
2. API validates:
   - Job exists and belongs to user
   - Job status is FAILED or FAILED_NO_CREDITS
   - Associated resources still exist (orphan check)
   - User has sufficient credits (credit check)
   ↓
3. API reconstructs job payload from database
   ↓
4. API creates new BullMQ job
   ↓
5. API updates job status to PENDING
   ↓
6. API increments attempts counter
   ↓
7. API clears failure reason
   ↓
8. Worker picks up retried job
   ↓
9. Worker processes normally
```

**Resilience features**:
- **Payload reconstruction**: Job can be retried even if Redis data lost
- **Orphan detection**: Prevents processing jobs for deleted resources
- **Credit pre-check**: Fails fast if still insufficient credits
- **Attempt tracking**: Monitors retry count for debugging

---

### 5.5 Bulk Paper Upload Flow (Parallel Processing)

```
1. User uploads CSV file (API)
   ↓
2. API validates:
   - Project exists and belongs to user
   - Project is ready (Stage 1 & 2 completed)
   - CSV format is valid
   - Row count ≤ 100 (limit)
   ↓
3. API parses CSV rows
   ↓
4. API creates N paper records (batch insert)
   ↓
5. API creates N background jobs (PAPER_SCORING)
   ↓
6. API queues N jobs in Redis
   ↓
7. API returns 202 Accepted (N papers created, N jobs queued)
   ↓
8. Multiple workers pick up jobs in parallel
   ↓
9. Each worker processes independently:
   - Orphan check
   - Credit check
   - LLM scoring
   - Credit deduction
   - Mark job complete
   ↓
10. All papers eventually scored (or failed)
```

**Parallel processing characteristics**:
- **Concurrent execution**: Multiple workers process papers simultaneously
- **Independent failures**: One paper failure doesn't affect others
- **Credit deduction per paper**: Each paper scored separately
- **Progress tracking**: User can monitor individual job statuses
- **Scalability**: Add more workers to process faster



## 6. State & Lifecycle Management

### 6.1 Project Lifecycle

```
NOT_INITIATED
    ↓
    ├─→ PROCESSING (Stage 1 running)
    │       ↓
    │       ├─→ EVALUATED (Stage 1 complete)
    │       │       ↓
    │       │       ├─→ PROCESSING (Stage 2 running)
    │       │       │       ↓
    │       │       │       └─→ EVALUATED (Stage 2 complete) [READY FOR PAPERS]
    │       │       │
    │       │       └─→ FAILED_INSUFFICIENT_CREDITS (Stage 2 failed)
    │       │
    │       └─→ FAILED_INSUFFICIENT_CREDITS (Stage 1 failed)
    │
    └─→ FAILED (Other errors)
```

**State properties**:
- **NOT_INITIATED**: Project created, no processing started
- **PROCESSING**: LLM operation in progress
- **EVALUATED**: Stage completed successfully
- **FAILED_INSUFFICIENT_CREDITS**: Recoverable failure (can resume after recharge)
- **FAILED**: Permanent failure (requires investigation)

**Separate state machines for**:
- `intentProcessedStatus` (Stage 1)
- `searchQueryProcessedStatus` (Stage 2)

---

### 6.2 Background Job Lifecycle

```
PENDING
    ↓
    ├─→ PROCESSING (Worker picked up job)
    │       ↓
    │       ├─→ COMPLETED (Success)
    │       │
    │       ├─→ FAILED (Permanent error)
    │       │
    │       └─→ FAILED_NO_CREDITS (Recoverable - insufficient credits)
    │
    └─→ CANCELLED (Manual cancellation - future feature)
```

**Job metadata**:
- `attempts`: Retry counter
- `failureReason`: Error message for debugging
- `bullmqJobId`: Link to Redis job (for monitoring)
- `createdAt`, `updatedAt`: Timestamps for tracking

---

### 6.3 Paper Processing State

```
isProcessedByLlm: false (Initial state)
    ↓
    ├─→ Job created (PENDING)
    │       ↓
    │       ├─→ Job processing (PROCESSING)
    │       │       ↓
    │       │       └─→ isProcessedByLlm: true (All 31 fields populated)
    │       │
    │       └─→ Job failed (FAILED/FAILED_NO_CREDITS)
    │               ↓
    │               └─→ isProcessedByLlm: false (Can retry)
```

**Scoring completeness**: A paper is considered "scored" only when `isProcessedByLlm = true` and all scoring fields are populated.

---

## 7. Failure Handling & Recovery

### 7.1 Failure Categories

**1. Transient Failures** (Retryable):
- OpenAI API rate limits
- Network timeouts
- Temporary database connection issues

**Recovery**: Automatic retry with exponential backoff (BullMQ)

---

**2. Insufficient Credits** (User-recoverable):
- User balance below required amount
- Job fails with `FAILED_NO_CREDITS` status

**Recovery**:
1. Admin recharges user credits
2. User calls resume endpoint
3. Job re-queued with same payload

---

**3. Orphaned Resources** (Preventable):
- User deletes project while job is pending
- User deletes paper while scoring job is pending

**Prevention**:
- Worker performs orphan check before processing
- Job fails immediately if resource missing
- No credits deducted for orphaned jobs

---

**4. Permanent Failures** (Requires investigation):
- Invalid LLM response format
- Unexpected API errors
- Data validation failures

**Recovery**:
- Job marked as `FAILED`
- Error logged with full context
- Manual investigation required

---

### 7.2 Consistency Guarantees

**Credit Deduction**:
- **Guarantee**: Credits deducted exactly once per LLM call
- **Mechanism**: Atomic transaction (log + deduct)
- **Failure mode**: If transaction fails, no credits deducted, job can retry

**Job Idempotency**:
- **Guarantee**: Re-processing same job produces same result
- **Mechanism**: Job payload includes all necessary data
- **Failure mode**: If job retried, previous partial state overwritten

**State Transitions**:
- **Guarantee**: State changes are atomic
- **Mechanism**: Database transactions
- **Failure mode**: If update fails, state remains unchanged

---

### 7.3 Retry Strategies

**Automatic Retries** (BullMQ):
- Transient failures: 3 attempts with exponential backoff
- Delay: 1s, 5s, 25s
- After 3 failures: Job marked as FAILED

**Manual Retries** (User-initiated):
- User calls resume endpoint
- System validates pre-conditions
- Job re-queued with fresh attempt counter

**No Retry**:
- Insufficient credits (requires user action)
- Orphaned resources (permanent failure)
- Invalid input data (requires correction)

---

## 8. Non-Functional Characteristics

### 8.1 Scalability

**Horizontal Scaling**:
- **API servers**: Stateless, can scale horizontally behind load balancer
- **Workers**: Can run multiple instances, BullMQ handles distribution
- **Database**: Connection pooling, read replicas for read-heavy queries

**Vertical Scaling**:
- **Redis**: In-memory, scales with RAM
- **PostgreSQL**: Scales with CPU/RAM for complex queries

**Bottlenecks**:
- OpenAI API rate limits (external constraint)
- Database write throughput (credit deductions)

---

### 8.2 Reliability

**Data Durability**:
- PostgreSQL: ACID-compliant, WAL for crash recovery
- Redis: AOF persistence for job queue durability
- Backups: Automated daily backups (production)

**Fault Tolerance**:
- Worker crashes: Jobs remain in queue, picked up by other workers
- API crashes: Stateless, no in-memory state lost
- Database failures: Connection retry with exponential backoff

**Graceful Degradation**:
- OpenAI unavailable: Jobs fail, can be retried later
- Email service down: Email jobs fail, can be retried
- Redis down: API continues (jobs can't be created)

---

### 8.3 Security

**Authentication**:
- JWT-based with short-lived access tokens (15 min)
- Long-lived refresh tokens (7 days) with rotation
- Bcrypt password hashing (cost factor 12)

**Authorization**:
- Role-based access control (user, admin)
- Resource ownership validation (users can only access their data)
- Admin-only endpoints for credits and configuration

**Data Protection**:
- Passwords never stored in plaintext
- JWT secrets stored in environment variables
- Database connections use SSL in production
- Rate limiting to prevent brute force attacks

**Input Validation**:
- Schema validation on all API inputs
- SQL injection prevention (Prisma parameterized queries)
- XSS prevention (output encoding)

---

### 8.4 Observability

**Logging**:
- Structured logging (JSON format via Pino)
- Log levels: debug, info, warn, error
- Contextual logging (user ID, job ID, request ID)
- Request/response logging for all API calls
- Worker activity logging (job start, completion, failure)

**Monitoring**:
- Health check endpoint (database, Redis connectivity)
- Job queue metrics (pending, processing, failed counts)
- Credit balance tracking (low balance warnings)
- Request tracing via unique request IDs
- Worker health (startup confirmation, processing logs)

**Auditing**:
- All LLM usage logged with timestamps
- Credit transactions tracked with before/after balances
- Configuration changes tracked with Type 2 SCD

**Debugging**:
- Job failure reasons stored in database (with attempt count)
- Full error stack traces logged (with context)
- Request/response logging for external APIs (OpenAI, SMTP)
- Request ID tracing across API → Worker → External Service
- Orphan detection logs (when resources are deleted mid-processing)

---

## 9. Key Design Decisions & Trade-offs

### 9.1 Asynchronous Job Processing

**Decision**: Use BullMQ for all LLM operations instead of synchronous HTTP.

**Rationale**:
- LLM calls can take 10-60 seconds (HTTP timeout risk)
- Enables horizontal scaling of workers
- Better user experience (non-blocking)
- Allows retry logic without user intervention

**Trade-off**:
- Increased complexity (queue, workers, job tracking)
- Eventual consistency (results not immediate)
- Requires polling or webhooks for status updates

---

### 9.2 Credits-Based Billing

**Decision**: Store USD costs immutably, calculate credits on-the-fly.

**Rationale**:
- USD costs are historical facts (never change)
- Credits multiplier can change over time
- Allows retroactive analysis with different multipliers
- Transparent pricing for users

**Trade-off**:
- Requires join with multiplier history for credit calculations
- Slightly more complex queries
- Multiplier changes don't affect past costs

---

### 9.3 Type 2 Slowly Changing Dimension

**Decision**: Use Type 2 SCD for pricing and multiplier history.

**Rationale**:
- Preserves complete audit trail
- Allows point-in-time queries
- Supports rollback (reactivate old record)
- Regulatory compliance (financial data)

**Trade-off**:
- More complex queries (filter by `isActive = true`)
- More storage (historical records retained)
- Requires careful management of effective dates

---

### 9.4 Orphan Detection

**Decision**: Workers check resource existence before processing.

**Rationale**:
- Prevents wasted LLM calls on deleted resources
- Avoids charging users for orphaned jobs
- Fails fast with clear error message

**Trade-off**:
- Extra database query per job
- Slight performance overhead
- Requires careful handling of race conditions

---

### 9.5 Payload Reconstruction

**Decision**: Store job payload in database, not just Redis.

**Rationale**:
- Redis data can be lost (eviction, crash)
- Enables job retry even after Redis restart
- Provides audit trail of job inputs

**Trade-off**:
- Duplicate data storage (Redis + PostgreSQL)
- Slightly larger database
- Requires keeping payload in sync

---

### 9.6 Atomic Credit Deduction

**Decision**: Use database transactions for usage logging + credit deduction.

**Rationale**:
- Prevents double-charging
- Ensures audit trail consistency
- ACID guarantees for financial operations

**Trade-off**:
- Longer transaction duration (potential lock contention)
- Can't deduct credits if logging fails
- Requires careful error handling

---

### 9.7 Dual Paper Categorization (C1/C2)

**Decision**: Score papers as both competitor (C1) and supporting work (C2).

**Rationale**:
- Papers can be both (e.g., competitor in problem, supporting in method)
- Provides richer analysis for users
- Enables multi-dimensional filtering

**Trade-off**:
- More complex LLM prompt
- Higher token usage (more expensive)
- More fields to store and display

---

## 10. Explicitly Out of Scope

This architecture document intentionally **does not** cover:

### 10.1 Deployment & Infrastructure
- Container orchestration (Docker, Kubernetes)
- CI/CD pipelines
- Cloud provider specifics (AWS, GCP, Azure)
- Load balancing and reverse proxy configuration
- SSL/TLS certificate management

### 10.2 API Specifications
- Request/response schemas
- Endpoint paths and HTTP methods
- Query parameter formats
- Error response structures
- Authentication header formats

### 10.3 Database Schema Details
- Table definitions and column types
- Index strategies
- Foreign key constraints
- Migration scripts
- Seed data

### 10.4 Frontend Architecture
- React component structure
- State management (Redux, Context)
- Routing and navigation
- UI/UX design patterns
- Client-side validation

### 10.5 External Service Details
- OpenAI API request/response formats
- SMTP protocol specifics
- Email template designs
- Third-party SDK usage
- API key management

### 10.6 Testing Strategy
- Unit test coverage
- Integration test scenarios
- E2E test flows
- Performance benchmarks
- Load testing results

### 10.7 Operational Procedures
- Backup and restore procedures
- Incident response playbooks
- Monitoring dashboard setup
- Alert thresholds and escalation
- Capacity planning

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-11  
**Target Audience**: New engineers, technical reviewers, future maintainers

---

**For detailed implementation specifics, refer to**:
- API Documentation: `03_API.md`
- Database Schema: `04_DATABASE.md`
- Deployment Guide: `09_DEPLOYMENT.md`
- Sequence Diagrams: `documentation/diagrams/sequences/`
- Activity Diagrams: `documentation/diagrams/activities/`
