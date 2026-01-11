# Architecture Decision Records (ADRs)

Documentation of significant architectural decisions made during development.

---

## Table of Contents

1. [ADR-001: Use PostgreSQL for Database](#adr-001-use-postgresql-for-database)
2. [ADR-002: Use Prisma ORM](#adr-002-use-prisma-orm)
3. [ADR-003: JWT for Authentication](#adr-003-jwt-for-authentication)
4. [ADR-004: Email Verification Required](#adr-004-email-verification-required)
5. [ADR-005: Merge Stages 5+6+7](#adr-005-merge-stages-567)
6. [ADR-006: Separate Refresh Tokens Table](#adr-006-separate-refresh-tokens-table)
7. [ADR-007: Cascade Delete for User Data](#adr-007-cascade-delete-for-user-data)
8. [ADR-008: BullMQ + Redis for Background Jobs](#adr-008-bullmq--redis-for-background-jobs)
9. [ADR-009: AI Credits System with USD Conversion](#adr-009-ai-credits-system-with-usd-conversion)
10. [ADR-010: PostgreSQL Array Columns for LLM Lists](#adr-010-postgresql-array-columns-for-llm-lists)
11. [ADR-011: Type 2 SCD for Configuration History](#adr-011-type-2-scd-for-configuration-history)
12. [ADR-012: Denormalize Credits Balance in Users Table](#adr-012-denormalize-credits-balance-in-users-table)

---

## ADR-001: Use PostgreSQL for Database

**Date**: 2025-12-XX  
**Status**: Accepted  
**Deciders**: Development Team

### Context

Need to choose a database for storing user data, projects, and papers.

### Decision

Use **PostgreSQL 14+** as the primary database.

### Rationale

**Pros**:
- ✅ Robust ACID compliance
- ✅ Excellent support for JSON data (for future flexibility)
- ✅ Strong community and ecosystem
- ✅ Free and open-source
- ✅ Excellent performance for read-heavy workloads
- ✅ Built-in full-text search (for future paper search)
- ✅ Good ORM support (Prisma, TypeORM)

**Cons**:
- ❌ Slightly more complex setup than SQLite
- ❌ Requires separate server process

### Alternatives Considered

1. **MongoDB**:
   - ❌ Less suitable for relational data (users, projects, papers)
   - ❌ Weaker consistency guarantees

2. **MySQL**:
   - ✅ Similar features to PostgreSQL
   - ❌ Slightly weaker JSON support
   - ❌ Less permissive license

3. **SQLite**:
   - ✅ Simpler setup
   - ❌ Not suitable for production with multiple users
   - ❌ Limited concurrency

### Consequences

- Need to install and manage PostgreSQL server
- Need to handle database migrations
- Can leverage PostgreSQL-specific features (JSON, full-text search)

---

## ADR-002: Use Prisma ORM

**Date**: 2025-12-XX  
**Status**: Accepted  
**Deciders**: Development Team

### Context

Need an ORM to interact with PostgreSQL database from TypeScript.

### Decision

Use **Prisma** as the ORM.

### Rationale

**Pros**:
- ✅ Excellent TypeScript support (type-safe queries)
- ✅ Intuitive schema definition language
- ✅ Built-in migration system
- ✅ Prisma Studio (database GUI)
- ✅ Excellent documentation
- ✅ Active development and community

**Cons**:
- ❌ Slightly larger bundle size than raw SQL
- ❌ Learning curve for Prisma-specific syntax

### Alternatives Considered

1. **TypeORM**:
   - ✅ More mature
   - ❌ Less intuitive API
   - ❌ Weaker TypeScript support

2. **Sequelize**:
   - ✅ Very mature
   - ❌ Designed for JavaScript, not TypeScript
   - ❌ Less type-safe

3. **Raw SQL**:
   - ✅ Maximum control and performance
   - ❌ No type safety
   - ❌ More boilerplate code
   - ❌ Manual migration management

### Consequences

- All database queries are type-safe
- Schema changes require migrations
- Can use Prisma Studio for database inspection
- Slightly larger bundle size

---

## ADR-003: JWT for Authentication

**Date**: 2025-12-XX  
**Status**: Accepted  
**Deciders**: Development Team

### Context

Need an authentication mechanism for API endpoints.

### Decision

Use **JWT (JSON Web Tokens)** with access/refresh token pattern.

### Rationale

**Pros**:
- ✅ Stateless (no server-side session storage)
- ✅ Works well with microservices (future)
- ✅ Standard and well-supported
- ✅ Can include user data in token payload
- ✅ Easy to implement in Express.js

**Cons**:
- ❌ Cannot revoke access tokens before expiration
- ❌ Slightly larger than session IDs

### Implementation Details

- **Access Token**: 15-minute expiry, stored in memory/localStorage
- **Refresh Token**: 7-day expiry, stored in database for revocation
- **Token Rotation**: Refresh tokens are rotated on use

### Alternatives Considered

1. **Session-based auth**:
   - ✅ Can revoke sessions immediately
   - ❌ Requires server-side session storage
   - ❌ Harder to scale horizontally

2. **OAuth 2.0**:
   - ✅ Industry standard for third-party auth
   - ❌ Overkill for first-party authentication
   - ❌ More complex implementation

### Consequences

- Access tokens cannot be revoked (must wait for expiry)
- Refresh tokens stored in database (can be revoked)
- Need to implement token refresh logic in frontend
- Stateless backend (easier to scale)

---

## ADR-004: Email Verification Required

**Date**: 2025-12-XX  
**Status**: Accepted  
**Deciders**: Development Team

### Context

Should users be required to verify their email before using the system?

### Decision

**Yes**, email verification is **required** before login.

### Rationale

**Pros**:
- ✅ Prevents fake accounts
- ✅ Ensures we can contact users
- ✅ Reduces spam and abuse
- ✅ Industry best practice

**Cons**:
- ❌ Adds friction to signup process
- ❌ Requires email infrastructure

### Implementation

- User can register but cannot login until email verified
- Verification link expires after 24 hours
- Can resend verification email

### Alternatives Considered

1. **Optional email verification**:
   - ✅ Less friction
   - ❌ More fake accounts
   - ❌ Can't reliably contact users

2. **No email verification**:
   - ✅ Simplest implementation
   - ❌ High risk of abuse

### Consequences

- Need to implement email sending
- Need to handle verification token expiration
- Users may abandon signup if email doesn't arrive
- Need "resend verification" functionality

---

## ADR-005: Merge Stages 5+6+7

**Date**: 2025-12-27  
**Status**: Accepted  
**Deciders**: Development Team

### Context

Original design had separate stages for:
- Stage 5: Semantic matching
- Stage 6: Dual-category evaluation
- Stage 7: Research gap analysis

### Decision

**Merge** Stages 5, 6, and 7 into a single "Paper Scoring" stage.

### Rationale

**Pros**:
- ✅ Reduces API calls (1 instead of 3)
- ✅ Lower latency
- ✅ Lower cost (single LLM call)
- ✅ More coherent analysis (LLM sees full context)
- ✅ Simpler API for frontend

**Cons**:
- ❌ Larger prompt (slightly higher token cost per call)
- ❌ Less modular

### Implementation

- Single endpoint: `POST /v1/stages/score`
- Input: User abstract + candidate paper abstract
- Output: Score, category (C1/C2), and gap analysis

### Alternatives Considered

1. **Keep separate stages**:
   - ✅ More modular
   - ❌ 3x API calls
   - ❌ Higher latency and cost

2. **Merge all stages**:
   - ✅ Single API call for entire pipeline
   - ❌ Too monolithic
   - ❌ Harder to debug

### Consequences

- Frontend makes fewer API calls
- Lower overall cost
- Faster user experience
- Need to update documentation and tests

---

## ADR-006: Separate Refresh Tokens Table

**Date**: 2025-12-XX  
**Status**: Accepted  
**Deciders**: Development Team

### Context

Where should refresh tokens be stored?

### Decision

Store refresh tokens in a **separate `refresh_tokens` table** (not in `users` table).

### Rationale

**Pros**:
- ✅ Can track multiple devices per user
- ✅ Can revoke individual tokens
- ✅ Can track token rotation
- ✅ Can see when/where tokens were created
- ✅ Easier to implement "logout all devices"

**Cons**:
- ❌ Additional table and joins
- ❌ Slightly more complex queries

### Implementation

- `refresh_tokens` table with columns:
  - `id`, `user_id`, `token`, `expires_at`, `created_at`, `revoked_at`, `replaced_by_token`
- Cascade delete when user is deleted

### Alternatives Considered

1. **Store in `users` table**:
   - ✅ Simpler schema
   - ❌ Can only track one token per user
   - ❌ Can't support multiple devices

2. **Store in Redis**:
   - ✅ Faster lookups
   - ❌ Additional infrastructure
   - ❌ Need to manage Redis

### Consequences

- Can support multiple devices per user
- Can implement "logout all devices"
- Can track token usage patterns
- Need to clean up expired tokens periodically

---

## ADR-007: Cascade Delete for User Data

**Date**: 2025-12-XX  
**Status**: Accepted  
**Deciders**: Development Team

### Context

What should happen to user's data when user account is deleted?

### Decision

Use **CASCADE DELETE** for all user-related data.

### Rationale

**Pros**:
- ✅ Ensures no orphaned data
- ✅ Complies with GDPR "right to be forgotten"
- ✅ Simpler than soft deletes
- ✅ Database enforces referential integrity

**Cons**:
- ❌ Data is permanently deleted (can't be recovered)
- ❌ No audit trail of deleted data

### Implementation

All foreign keys to `users` table use `onDelete: Cascade`:
- `email_verification_tokens`
- `password_reset_tokens`
- `refresh_tokens`
- `user_projects`
- `saved_papers` (future)

### Alternatives Considered

1. **Soft delete** (set `deleted_at` timestamp):
   - ✅ Can recover deleted accounts
   - ✅ Audit trail
   - ❌ More complex queries (need to filter out deleted)
   - ❌ Data still exists (GDPR concern)

2. **Manual deletion**:
   - ✅ Full control
   - ❌ Easy to forget related data
   - ❌ Risk of orphaned records

### Consequences

- User deletion is permanent
- Need to warn users before deletion
- Complies with GDPR
- No orphaned data in database

---

## ADR-008: BullMQ + Redis for Background Jobs

**Date**: 2026-01-11  
**Status**: Accepted  
**Deciders**: Development Team

### Context

LLM processing (intent decomposition, query generation, paper scoring) can take 5-30 seconds per request. Synchronous processing would:
- Block API responses
- Cause timeout issues
- Poor user experience
- Waste server resources waiting

### Decision

Use **BullMQ** with **Redis** for asynchronous background job processing.

### Rationale

**Pros**:
- ✅ Non-blocking API responses (immediate 202 Accepted)
- ✅ Automatic retry with exponential backoff
- ✅ Job persistence (survives server restarts)
- ✅ Priority queues support
- ✅ Rate limiting built-in
- ✅ Excellent monitoring and debugging tools
- ✅ Horizontal scalability (multiple workers)
- ✅ TypeScript support

**Cons**:
- ❌ Additional infrastructure (Redis)
- ❌ More complex deployment
- ❌ Need to handle job failures gracefully

### Implementation

**Job Types**:
- `PROJECT_INIT_INTENT` - Stage 1 processing
- `PROJECT_INIT_QUERY` - Stage 2 processing
- `PAPER_SCORING` - Paper analysis
- `SEND_EMAIL` - Email notifications

**Database Tracking**:
- `background_jobs` table tracks all jobs
- Stores: job_id, status, failure_reason, attempts
- Enables job recovery and monitoring

**Resilience Features**:
- Orphan check (verify project/paper exists)
- Credit check (verify user has sufficient balance)
- Redis resilience (reconstruct payload from DB if Redis fails)

### Alternatives Considered

1. **Synchronous processing**:
   - ✅ Simpler implementation
   - ❌ Poor UX (30s+ response times)
   - ❌ Timeout issues
   - ❌ Wasted resources

2. **AWS SQS/Lambda**:
   - ✅ Fully managed
   - ❌ Vendor lock-in
   - ❌ Higher cost
   - ❌ More complex local development

3. **RabbitMQ**:
   - ✅ Feature-rich
   - ❌ More complex than BullMQ
   - ❌ Heavier resource usage
   - ❌ Steeper learning curve

4. **Database polling**:
   - ✅ No additional infrastructure
   - ❌ Inefficient (constant polling)
   - ❌ Higher database load
   - ❌ No built-in retry logic

### Consequences

- Need to install and manage Redis
- API returns 202 Accepted with job_id
- Frontend must poll for job completion
- Jobs can be retried automatically
- Better resource utilization
- Horizontal scaling possible

---

## ADR-009: AI Credits System with USD Conversion

**Date**: 2026-01-03  
**Status**: Accepted  
**Deciders**: Development Team

### Context

LLM API costs vary by model and change over time. Need a billing system that:
- Tracks actual USD costs
- Presents costs to users in a stable unit
- Allows admin to adjust pricing without affecting historical data
- Supports future payment integration

### Decision

Implement **AI Credits system** with configurable USD-to-Credits conversion rate.

### Rationale

**Pros**:
- ✅ Stable user-facing currency (Credits)
- ✅ Flexible pricing (admin can adjust multiplier)
- ✅ Accurate cost tracking (USD stored in logs)
- ✅ Supports future monetization
- ✅ Protects users from LLM price volatility
- ✅ Complete audit trail

**Cons**:
- ❌ More complex than direct USD billing
- ❌ Need to explain Credits to users
- ❌ Requires admin interface for configuration

### Implementation

**Core Components**:
1. **`users.ai_credits_balance`** - Current balance (denormalized)
2. **`llm_usage_logs`** - Tracks USD costs and token usage
3. **`credits_multiplier_history`** - Conversion rate history (Type 2 SCD)
4. **`default_credits_history`** - Signup credits history (Type 2 SCD)
5. **`user_credits_transactions`** - Manual credit adjustments audit log

**Conversion Formula**:
```
Credits = USD × Multiplier
Example: $0.001 × 1000 = 1 Credit
```

**Transaction Types**:
- `SIGNUP_DEFAULT` - Free credits on registration
- `ADMIN_RECHARGE` - Admin adds credits
- `ADMIN_DEDUCT` - Admin removes credits
- `ADMIN_ADJUSTMENT` - Balance corrections

### Alternatives Considered

1. **Direct USD billing**:
   - ✅ Simpler to understand
   - ❌ Exposes users to price volatility
   - ❌ Harder to offer promotions
   - ❌ Requires payment processing from day 1

2. **Fixed token packages**:
   - ✅ Simple pricing
   - ❌ Inflexible (different models have different costs)
   - ❌ Hard to adjust pricing

3. **Subscription model**:
   - ✅ Predictable revenue
   - ❌ Doesn't match usage-based costs
   - ❌ Unfair for light users

### Consequences

- Users see costs in Credits (not USD)
- Admin can adjust conversion rate
- Complete financial audit trail
- Supports future payment integration
- Need to educate users about Credits

---

## ADR-010: PostgreSQL Array Columns for LLM Lists

**Date**: 2026-01-11  
**Status**: Accepted  
**Deciders**: Development Team

### Context

LLM generates lists of values for user projects:
- `methodologies[]` - Research methodologies
- `application_domains[]` - Application areas
- `constraints[]` - Research constraints
- `contribution_types[]` - Types of contributions
- `keywords_seed[]` - Initial keywords
- `expanded_keywords[]` - Expanded keyword list

Should these be stored as arrays or in separate junction tables?

### Decision

Use **PostgreSQL native array columns** (`TEXT[]`) for LLM-generated lists.

### Rationale

**Pros**:
- ✅ Simpler schema (no junction tables)
- ✅ Better performance (no JOINs needed)
- ✅ Always retrieved/updated as a set
- ✅ PostgreSQL has robust array support
- ✅ Easier to query with `ANY()` operator
- ✅ Atomic updates (no partial state)

**Cons**:
- ❌ Violates strict 1NF (if you consider arrays non-atomic)
- ❌ Can't enforce referential integrity on elements
- ❌ Harder to query individual elements

### When Arrays Are Appropriate

✅ **Use arrays when**:
- Elements are not foreign keys
- Always retrieved/updated together
- No need to query individual elements
- Order matters or doesn't matter (both work)
- Using PostgreSQL (has native support)

❌ **Don't use arrays when**:
- Elements are foreign keys (need referential integrity)
- Need to query/filter by individual elements
- Need to join on elements
- Using a database without array support

### Implementation

**Current usage** (6 array columns in `user_projects`):
```sql
methodologies         TEXT[]
application_domains   TEXT[]
constraints           TEXT[]
contribution_types    TEXT[]
keywords_seed         TEXT[]
expanded_keywords     TEXT[]
```

**Alternative (normalized)** would require 6 junction tables:
```sql
project_methodologies (project_id, methodology)
project_domains (project_id, domain)
-- ... 4 more tables
```

### Alternatives Considered

1. **Junction tables (fully normalized)**:
   - ✅ Strict 1NF compliance
   - ✅ Can query individual elements easily
   - ❌ 6 additional tables
   - ❌ 6 JOINs to retrieve project
   - ❌ More complex queries
   - ❌ Overkill for simple lists

2. **JSON/JSONB column**:
   - ✅ Flexible structure
   - ❌ Less type-safe than arrays
   - ❌ Harder to query
   - ❌ No array-specific operators

3. **Comma-separated strings**:
   - ✅ Simple storage
   - ❌ No type safety
   - ❌ Hard to query
   - ❌ Manual parsing required
   - ❌ Anti-pattern

### Consequences

- Simpler schema (6 fewer tables)
- Better query performance
- Arrays are PostgreSQL-specific (not portable)
- Cannot enforce referential integrity on array elements
- Acceptable trade-off for this use case

---

## ADR-011: Type 2 SCD for Configuration History

**Date**: 2026-01-03  
**Status**: Accepted  
**Deciders**: Development Team

### Context

System configuration values change over time:
- **Credits multiplier** (USD to Credits conversion rate)
- **Default signup credits** (free credits for new users)
- **LLM model pricing** (cost per million tokens)

Need to track historical values for:
- Audit compliance
- Historical cost calculations
- Understanding pricing changes
- Rollback capability

### Decision

Use **Type 2 Slowly Changing Dimension (SCD)** pattern for configuration history.

### Rationale

**Pros**:
- ✅ Complete history preserved
- ✅ Can query historical values
- ✅ Audit trail for compliance
- ✅ Can calculate historical costs accurately
- ✅ Industry-standard pattern (data warehousing)
- ✅ No data loss on updates

**Cons**:
- ❌ More complex queries (need to filter by `is_active`)
- ❌ Table grows over time
- ❌ Need to manage effective dates

### Implementation

**Pattern Structure**:
```sql
CREATE TABLE config_history (
  id UUID PRIMARY KEY,
  config_value FLOAT NOT NULL,
  effective_from TIMESTAMP NOT NULL DEFAULT NOW(),
  effective_to TIMESTAMP NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_by VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Tables Using Type 2 SCD**:
1. **`credits_multiplier_history`** - USD to Credits conversion
2. **`default_credits_history`** - Signup credits amount
3. **`llm_model_pricing`** - LLM pricing with `effective_from`/`effective_to`

**Update Process**:
1. Set current record's `is_active = false` and `effective_to = NOW()`
2. Insert new record with `is_active = true` and `effective_from = NOW()`
3. Never UPDATE or DELETE historical records

**Query Current Value**:
```sql
SELECT config_value 
FROM config_history 
WHERE is_active = true;
```

**Query Historical Value**:
```sql
SELECT config_value 
FROM config_history 
WHERE '2025-12-01' BETWEEN effective_from AND COALESCE(effective_to, 'infinity');
```

### Alternatives Considered

1. **Type 1 SCD (Overwrite)**:
   - ✅ Simpler (just UPDATE)
   - ❌ Loses history
   - ❌ Can't audit changes
   - ❌ Can't calculate historical costs

2. **Type 3 SCD (Previous Value Column)**:
   - ✅ Simple schema
   - ❌ Only tracks one previous value
   - ❌ Loses older history

3. **Separate audit log table**:
   - ✅ Keeps main table simple
   - ❌ Need to join for historical queries
   - ❌ More complex to maintain

4. **Event sourcing**:
   - ✅ Complete event history
   - ❌ Overkill for configuration
   - ❌ More complex implementation

### Consequences

- Configuration changes are never lost
- Can audit all pricing changes
- Can calculate historical costs accurately
- Queries need to filter by `is_active = true`
- Tables grow over time (but slowly)
- Complies with audit requirements

---

## ADR-012: Denormalize Credits Balance in Users Table

**Date**: 2026-01-03  
**Status**: Accepted  
**Deciders**: Development Team

### Context

User's AI Credits balance could be calculated by:
```sql
SELECT 
  default_credits + 
  SUM(manual_transactions) - 
  SUM(llm_usage_costs * multiplier)
FROM various_tables
WHERE user_id = ?
```

This calculation would require:
- JOIN with `user_credits_transactions`
- JOIN with `llm_usage_logs`
- JOIN with `credits_multiplier_history`
- Complex aggregation

Balance is checked on **every API request** that uses LLM.

### Decision

**Denormalize** credits balance by storing it in `users.ai_credits_balance`.

### Rationale

**Pros**:
- ✅ **O(1) read time** (no JOINs, no aggregation)
- ✅ Critical for performance (checked on every LLM request)
- ✅ Atomic updates (single UPDATE statement)
- ✅ Simple queries (`SELECT ai_credits_balance FROM users WHERE id = ?`)
- ✅ Audit trail preserved in transaction tables

**Cons**:
- ❌ Violates 3NF (balance is derivable from transactions)
- ❌ Risk of inconsistency if not updated atomically
- ❌ Redundant data

### Implementation

**Balance Storage**:
```sql
users (
  id UUID PRIMARY KEY,
  ai_credits_balance FLOAT NOT NULL DEFAULT 0.0,
  ...
)
```

**Update Pattern** (atomic transaction):
```typescript
await prisma.$transaction([
  // 1. Deduct balance
  prisma.user.update({
    where: { id: userId },
    data: { aiCreditsBalance: { decrement: cost } }
  }),
  // 2. Log usage
  prisma.llmUsageLog.create({
    data: { userId, totalCostUsd, ... }
  })
]);
```

**Audit Trail**:
- `llm_usage_logs` - All LLM costs (USD)
- `user_credits_transactions` - Manual adjustments
- Balance can be recalculated from logs if needed

### Alternatives Considered

1. **Fully normalized (calculate on every request)**:
   - ✅ No redundancy
   - ✅ Always accurate
   - ❌ **Unacceptable performance** (3+ JOINs + aggregation per request)
   - ❌ Scales poorly (millions of log entries)

2. **Separate `user_balances` table**:
   - ✅ Normalized (balance in separate table)
   - ❌ Still requires JOIN on every request
   - ❌ No real benefit over storing in `users`

3. **Redis cache**:
   - ✅ Very fast reads
   - ❌ Additional infrastructure
   - ❌ Cache invalidation complexity
   - ❌ Risk of cache/DB inconsistency

4. **Materialized view**:
   - ✅ Automatically updated
   - ❌ PostgreSQL materialized views need manual refresh
   - ❌ More complex than denormalization

### Consequences

- Balance queries are instant (no JOINs)
- Must update balance atomically with transactions
- Risk of inconsistency if update fails (mitigated by transactions)
- Can recalculate balance from audit logs if needed
- Acceptable trade-off for critical performance path

### Validation

Balance can be verified by:
```sql
SELECT 
  u.ai_credits_balance as stored_balance,
  (
    COALESCE((SELECT default_credits FROM default_credits_history WHERE is_active = true), 0) +
    COALESCE((SELECT SUM(amount) FROM user_credits_transactions WHERE user_id = u.id), 0)
  ) as calculated_balance
FROM users u
WHERE u.id = ?;
```

If `stored_balance != calculated_balance`, balance can be corrected.

---

## Decision Process

### How to Create a New ADR

1. **Identify decision point**:
   - Significant architectural choice
   - Affects multiple components
   - Has long-term consequences

2. **Document decision**:
   - Use template above
   - Include context, decision, rationale
   - List pros/cons
   - Document alternatives considered

3. **Get review**:
   - Share with team
   - Discuss trade-offs
   - Reach consensus

4. **Update this file**:
   - Add new ADR with sequential number
   - Update table of contents
   - Commit to repository

### ADR Template

```markdown
## ADR-XXX: [Title]

**Date**: YYYY-MM-DD  
**Status**: [Proposed | Accepted | Deprecated | Superseded]  
**Deciders**: [Names]

### Context

[What is the issue we're addressing?]

### Decision

[What is the change we're making?]

### Rationale

**Pros**:
- ✅ [Benefit 1]
- ✅ [Benefit 2]

**Cons**:
- ❌ [Drawback 1]
- ❌ [Drawback 2]

### Alternatives Considered

1. **[Alternative 1]**:
   - ✅ [Pro]
   - ❌ [Con]

### Consequences

[What becomes easier or harder as a result?]
```

---

## Additional Resources

- **Architecture**: [02_ARCHITECTURE.md](./02_ARCHITECTURE.md)
- **Database Schema**: [04_DATABASE.md](./04_DATABASE.md)
- **API Documentation**: [03_API.md](./03_API.md)

---

**For proposing new ADRs, create a pull request with the new ADR added to this file.**
