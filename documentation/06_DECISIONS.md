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
