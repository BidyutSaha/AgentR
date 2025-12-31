# Antigravity Unified Project Rules

> **These rules are MANDATORY.**  
> Any work that violates them is considered **INCOMPLETE**.

---

## Table of Contents

1. [Core Philosophy](#1-core-philosophy)
2. [Naming Conventions](#2-naming-conventions)
3. [API & Database Standards](#3-api--database-standards)
4. [Documentation Architecture](#4-documentation-architecture)
5. [Code Structure & Quality](#5-code-structure--quality)
6. [Testing Standards](#6-testing-standards)
7. [Change Management](#7-change-management)
8. [Definition of Done](#8-definition-of-done)

---

## 1. Core Philosophy

### 1.1 Guiding Principles

- **Code communicates INTENT, not just mechanics**
- **Clarity over cleverness** — readable code beats "smart" code
- **Documentation is part of the product** — not an afterthought
- **Single source of truth** — no duplicate or conflicting documentation
- **Fail fast, fail clearly** — errors should be obvious and actionable

### 1.2 Single Source of Truth

There is exactly:
- **ONE live project status file**: `docs/00_PROJECT_STATUS.md`
- **ONE live testing truth file**: `docs/08_TESTING.md`
- **ONE live API reference**: `docs/03_API.md`

❌ **Documentation sprawl is technical debt**

---

## 2. Naming Conventions

> **Names must encode WHAT it is, WHAT it does, and WHAT it represents.**  
> Vague, emotional, or ambiguous names are forbidden.

### 2.1 File & Folder Naming

| Type | Convention | Example |
|------|------------|---------|
| Folders | `kebab-case` | `user-projects/`, `auth-services/` |
| Files | `kebab-case.ext` | `user-project.service.ts` |
| Index files | Curated exports only | ❌ No dumping everything |

### 2.2 Code Identifiers (Syntax)

| Type | Convention | Example |
|------|------------|---------|
| Variables & Functions | `camelCase` | `userName`, `fetchUserById()` |
| Classes, Interfaces, Types, Enums | `PascalCase` | `UserProject`, `AuthToken` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_RETRY_COUNT`, `API_VERSION` |
| Booleans | `is/has/can/should` prefix | `isAuthenticated`, `hasPermission` |
| Private fields | `_camelCase` (prefix with `_`) | `_internalCache` |

### 2.3 Semantic Naming Rules (CRITICAL)

#### Variables → Nouns Only
Variables represent **state or data**, never actions.

✅ **Good**
```typescript
user
reportSnapshot
requestPayload
interviewCount
maxRetryCount
```

❌ **Bad**
```typescript
getUser          // This is a function name
processData      // This is a function name
veryBigValue     // Vague adjective
temp             // Meaningless
data             // Too generic
```

**Forbidden words**: `data`, `info`, `value`, `temp`, `obj`, `item`, `thing`  
**Never use standalone adjectives**: `very`, `huge`, `nice`, `bad`, `good`

---

#### Functions → Verb + Noun
Functions represent **actions**.

✅ **Good**
```typescript
createUser()
validateToken()
fetchInterviewById()
generateReport()
persistUserProject()
dispatchNotification()
```

❌ **Bad**
```typescript
handle()         // Handle what?
process()        // Process what?
doStuff()        // What stuff?
manager()        // Not a verb
```

**Banned verbs**: `handle`, `process`, `manage`, `do`, `execute` (without context)

---

#### Booleans → Conditions
Booleans must read naturally in conditionals.

✅ **Good**
```typescript
isAuthenticated
hasPermission
canRetry
shouldInvalidateCache
wasProcessed
```

❌ **Bad**
```typescript
auth             // Not descriptive
valid            // Valid what?
flag             // Flag for what?
check            // Not a boolean name
```

---

#### Collections → Plural Nouns

✅ **Good**: `users`, `interviews`, `errorMessages`, `activeProjects`  
❌ **Bad**: `items`, `list`, `userListData`, `arr`

---

#### Units Must Be Explicit

✅ **Good**: `timeoutMs`, `intervalSeconds`, `fileSizeBytes`, `distanceKm`  
❌ **Bad**: `timeout`, `interval`, `size`, `distance`

---

#### Temporal Naming

✅ **Good**: `createdAt`, `expiresAt`, `lastLoginAt`, `processedAt`  
❌ **Bad**: `date`, `time`, `timestamp`, `when`

---

#### Domain Prefixing

Add domain context to avoid ambiguity.

✅ **Good**: `paymentStatus`, `interviewStatus`, `projectPhase`  
❌ **Bad**: `status`, `state`, `phase`

---

#### Short Names (Restricted)

Allowed **ONLY** for:
- Loop counters: `i`, `j`, `k`
- Mathematical formulas: `x`, `y`, `a`, `b`
- Scopes ≤ 5 lines

❌ **Never** in business logic or function parameters

---

### 2.4 API Naming

- **Resource names**: plural nouns, `kebab-case`
- **No verbs in paths** (use HTTP methods instead)
- **Versioning**: `/v1/`, `/v2/`

✅ **Good**
```
GET    /v1/user-projects
POST   /v1/user-projects
GET    /v1/user-projects/:id
PATCH  /v1/user-projects/:id
DELETE /v1/user-projects/:id
```

❌ **Bad**
```
GET /v1/getUserProjects
POST /v1/createProject
GET /v1/project/get/:id
```

---

### 2.5 Database Naming

| Type | Convention | Example |
|------|------------|---------|
| Tables | `snake_case`, plural | `user_projects`, `auth_tokens` |
| Columns | `snake_case` | `user_id`, `created_at` |
| Foreign keys | `{ref}_id` | `user_id`, `project_id` |
| Indexes | `idx_<table>__<column>` | `idx_users__email` |
| Unique constraints | `uq_<table>__<column>` | `uq_users__email` |
| Foreign key constraints | `fk_<table>__<column>` | `fk_projects__user_id` |
| Check constraints | `ck_<table>__<condition>` | `ck_users__age_positive` |

---

## 3. API & Database Standards

### 3.1 API Documentation Requirements (MANDATORY)

Every API endpoint documented in `docs/03_API.md` MUST include:

1. **API Path with Versioning** — Full path including version prefix
2. **HTTP Method** — GET, POST, PATCH, DELETE, etc.
3. **Description** — What the endpoint does and why it exists
4. **Authentication** — Required auth level and permissions
5. **Input Structure** — Request body/query params schema
6. **Output Structure** — Response body schema
7. **Sample Input** — Real example request
8. **Sample Output** — Real example response
9. **Error Cases** — Possible errors with status codes
10. **Diagrams** — Activity & sequence diagrams for non-trivial flows

---

### 3.2 API Documentation Template

Use this template for **EVERY** endpoint in `docs/03_API.md`:

````markdown
## [HTTP Method] [API Path]

**Description**: [What this endpoint does and its purpose]

**Authentication**: [Required | Optional | None]  
**Roles**: [Admin | User | Public]

---

### Input Structure

**Request Body** (for POST/PATCH):
```typescript
{
  field1: string;        // Description of field1
  field2: number;        // Description of field2
  field3?: boolean;      // Optional: Description of field3
}
```

**Query Parameters** (for GET):
- `param1` (string, required) — Description
- `param2` (number, optional) — Description

**Path Parameters**:
- `:id` (string, required) — Resource identifier

---

### Output Structure

**Success Response** (200/201):
```typescript
{
  success: true;
  data: {
    id: string;
    field1: string;
    field2: number;
    createdAt: string;    // ISO 8601 timestamp
  };
  message?: string;
}
```

---

### Sample Request

```bash
POST /v1/user-projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Research Project",
  "description": "Literature review on AI agents",
  "isActive": true
}
```

---

### Sample Response

**Success (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": "proj_abc123",
    "userId": "user_xyz789",
    "name": "My Research Project",
    "description": "Literature review on AI agents",
    "isActive": true,
    "createdAt": "2025-12-31T08:30:00.000Z",
    "updatedAt": "2025-12-31T08:30:00.000Z"
  },
  "message": "Project created successfully"
}
```

---

### Error Cases

| Status | Error Code | Description | Example |
|--------|------------|-------------|---------|
| 400 | `VALIDATION_ERROR` | Invalid input data | Missing required field |
| 401 | `UNAUTHORIZED` | Missing/invalid token | Token expired |
| 403 | `FORBIDDEN` | Insufficient permissions | User not owner |
| 404 | `NOT_FOUND` | Resource not found | Project doesn't exist |
| 409 | `CONFLICT` | Resource conflict | Duplicate project name |
| 500 | `INTERNAL_ERROR` | Server error | Database connection failed |

**Sample Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Project name is required",
    "details": {
      "field": "name",
      "constraint": "required"
    }
  }
}
```

---

### Diagrams (Required for Non-Trivial Endpoints)

**Activity Diagram**: `docs/diagrams/create-project-activity.puml`  
**Sequence Diagram**: `docs/diagrams/create-project-sequence.puml`

> If endpoint is trivial (simple CRUD), state: "Diagrams: Not required (simple CRUD operation)"

---

### Business Logic Notes

[Any non-obvious business rules, edge cases, or important implementation details]

````

---

### 3.3 When Diagrams Are MANDATORY

Diagrams (Activity + Sequence) are **REQUIRED** for endpoints that:

1. **Involve multiple services** — Cross-service communication
2. **Have complex workflows** — Multi-step processes
3. **Include async operations** — Background jobs, webhooks
4. **Perform external API calls** — Third-party integrations
5. **Have non-trivial business logic** — Complex validation, calculations
6. **Modify multiple resources** — Cascading updates, transactions

**Simple CRUD operations** (basic create/read/update/delete) do NOT require diagrams.

---

### 3.4 API Response Structure (Standard)

All API responses MUST follow this structure:

```typescript
// Success response
{
  "success": true,
  "data": { /* actual data */ },
  "message"?: string  // Optional success message
}

// Error response
{
  "success": false,
  "error": {
    "code": string,      // Machine-readable error code
    "message": string,   // Human-readable error message
    "details"?: object   // Optional additional context
  }
}
```

---

### 3.5 HTTP Status Codes (Standard)

Use appropriate status codes:

| Code | Meaning | When to Use |
|------|---------|-------------|
| `200` | OK | Successful GET, PATCH, DELETE |
| `201` | Created | Successful POST (resource created) |
| `204` | No Content | Successful DELETE (no response body) |
| `400` | Bad Request | Validation error, malformed request |
| `401` | Unauthorized | Missing or invalid authentication |
| `403` | Forbidden | Authenticated but insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Resource conflict (duplicate, version mismatch) |
| `422` | Unprocessable Entity | Valid syntax but semantic errors |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unexpected server error |
| `503` | Service Unavailable | Temporary service outage |

---

### 3.6 Input Validation Standards

**All inputs MUST be validated** at the controller level:

```typescript
// Use validation schemas (e.g., Zod, Joi, class-validator)
import { z } from 'zod';

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
});

// Validate in controller
const validatedData = createProjectSchema.parse(req.body);
```

**Document validation rules** in API docs:

```markdown
### Input Validation

- `name`: Required, 1-100 characters
- `description`: Optional, max 500 characters
- `isActive`: Optional, boolean, defaults to true
```

---

### 3.7 Database Standards

#### 3.7.1 Database Constraints

- **Always** use foreign key constraints
- **Always** add indexes on foreign keys
- **Always** add unique constraints where applicable
- Use `NOT NULL` by default unless null is semantically meaningful
- Use `DEFAULT` values where appropriate

#### 3.7.2 Database Documentation

Document schema in `docs/04_DATABASE.md`:

```markdown
## Table: user_projects

**Description**: Stores user research projects

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique project identifier |
| user_id | UUID | NOT NULL, FK → users(id) | Owner of the project |
| name | VARCHAR(100) | NOT NULL | Project name |
| description | TEXT | NULL | Project description |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Active status |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

### Indexes

- `idx_user_projects__user_id` — Fast lookup by user
- `idx_user_projects__created_at` — Sorting by creation date

### Constraints

- `uq_user_projects__user_id_name` — Unique project name per user
- `fk_user_projects__user_id` — Foreign key to users table
```

---

## 4. Documentation Architecture

### 4.1 Documentation Location

**ALL** documentation MUST live in:
```
docs/
```

❌ **Forbidden**:
- Docs scattered in source folders
- Parallel documentation trees
- Docs in root directory (except `README.md`)

---

### 4.2 Standard Documentation Structure

```
docs/
├── 00_PROJECT_STATUS.md      ← Single live project truth
├── 01_SETUP.md               ← Installation & environment setup
├── 02_ARCHITECTURE.md        ← System design & architecture
├── 03_API.md                 ← API reference (single source of truth)
├── 04_DATABASE.md            ← Database schema & migrations
├── 05_WORKFLOWS.md           ← Key workflows & processes
├── 06_DECISIONS.md           ← Architecture decision records (ADRs)
├── 07_TROUBLESHOOTING.md     ← Common issues & solutions
├── 08_TESTING.md             ← Testing strategy & guide
├── 09_DEPLOYMENT.md          ← Deployment procedures
└── diagrams/                 ← PlantUML diagrams only
    ├── architecture.puml
    ├── auth-flow.puml
    └── ...
```

---

### 4.3 Anti-Sprawl Rule (CRITICAL)

#### Default: UPDATE, DON'T CREATE

**DO NOT create new `.md` files by default.**  
Always update an existing document first.

**Priority order**:
1. Update `00_PROJECT_STATUS.md`
2. Update relevant existing doc (`03_API.md`, `02_ARCHITECTURE.md`, etc.)
3. Add inline code documentation
4. Update diagrams

---

#### When New Docs Are Allowed (RARE)

A new doc may be created **ONLY** if:
- It doesn't logically fit any existing doc
- Adding it would clutter existing docs
- It represents a **long-lived concern** (not a temporary note)

Examples:
- New subsystem (e.g., `10_CACHING.md`)
- New cross-cutting concern (e.g., `11_SECURITY.md`)
- New deployment target (e.g., `12_KUBERNETES.md`)

---

#### User Permission MANDATORY

Before creating a new doc, **MUST** ask:

> "This change may require a new documentation file.  
> Do you want me to create it, or extend an existing one?"

❌ No silent doc creation  
❌ No assumptions

---

#### Forbidden Docs

❌ `notes.md`, `misc.md`, `temp.md`, `draft.md`, `TODO.md`  
❌ Scratch or personal docs  
❌ Orphan docs (not referenced from `00_PROJECT_STATUS.md`)

Any new doc MUST:
- Live in `docs/`
- Follow `NN_TITLE.md` naming
- Be referenced from `00_PROJECT_STATUS.md`

---

### 4.4 Project Status File (00_PROJECT_STATUS.md)

**Must be updated whenever**:
- Code logic changes
- API changes
- Database changes
- Diagrams change
- Workflows change

**Required sections**:
```markdown
# Project Status

## Current Goal
[What we're working on right now]

## What Works Now
[Completed features with verification status]

## In Progress
[Active work items]

## Next Tasks
[Prioritized backlog]

## Known Issues / Tech Debt
[Issues that need addressing]

## Recent Changes
[Dated changelog of significant changes]
```

---

### 4.5 Diagrams (PlantUML Only)

- **Location**: `docs/diagrams/`
- **Format**: PlantUML only (`.puml` files)
- **Naming**: `{feature}-{type}.puml` (e.g., `create-project-activity.puml`, `auth-flow-sequence.puml`)

#### When Diagrams Are REQUIRED

**Every non-trivial workflow** MUST have:
- **Activity diagram** (`.puml`) — Shows the flow and decision points
- **Sequence diagram** (`.puml`) — Shows interactions between components

**Non-trivial workflows** include (see Section 3.3 for full criteria):
- Multi-service interactions
- Complex business logic
- Async operations (background jobs, webhooks)
- External API integrations
- Multi-resource modifications

#### When Diagrams Are OPTIONAL

**Simple CRUD operations** (basic create/read/update/delete with no complex logic) do NOT require diagrams.

When skipping diagrams, document in API docs:
> **Diagrams**: Not required (simple CRUD operation)

#### Diagram Maintenance

**When workflow changes**:
1. Update affected diagrams
2. Update `00_PROJECT_STATUS.md`
3. Update API documentation

**If no diagram impact**, state in your response:
> Diagram impact: none (reason)

---

## 5. Code Structure & Quality

### 5.1 Modular Architecture (Layered)

```
src/
├── controllers/      ← Orchestration only (HTTP handling)
├── services/         ← Business logic only
├── repositories/     ← Database access only
├── middleware/       ← Request/response processing
├── validators/       ← Input validation schemas
├── types/            ← TypeScript types & interfaces
├── utils/            ← Pure utility functions (no business logic)
└── config/           ← Configuration management
```

**Rules**:
- **Controllers**: HTTP handling, orchestration, no business logic
- **Services**: Business logic, no HTTP or DB concerns
- **Repositories**: Database access, no business logic
- **Validation**: At boundaries (controllers, external inputs)
- **No circular dependencies**
- **No "utils dump"** — utils must be categorized

---

### 5.2 Function Design

#### Single Responsibility
Each function does **ONE** thing.

✅ **Good**
```typescript
function validateUserEmail(email: string): boolean { ... }
function sendWelcomeEmail(userId: string): Promise<void> { ... }
```

❌ **Bad**
```typescript
function validateAndSendEmail(email: string): Promise<void> {
  // Doing two things!
}
```

---

#### Function Length
- **Ideal**: ≤ 20 lines
- **Maximum**: 50 lines
- If longer, extract helper functions

---

#### Parameter Count
- **Maximum**: 4 parameters
- If more, use an options object:

✅ **Good**
```typescript
interface CreateUserOptions {
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
}

function createUser(options: CreateUserOptions) { ... }
```

---

### 5.3 Error Handling

#### Always Use Custom Error Classes

```typescript
class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`);
    this.name = 'NotFoundError';
  }
}
```

#### Never Swallow Errors

❌ **Bad**
```typescript
try {
  await riskyOperation();
} catch (error) {
  // Silent failure
}
```

✅ **Good**
```typescript
try {
  await riskyOperation();
} catch (error) {
  logger.error('Risky operation failed', { error });
  throw new OperationError('Failed to complete operation', { cause: error });
}
```

---

### 5.4 Code Comments

#### When to Comment

Comment **ONLY** to explain:
- **WHY** a decision exists (not what the code does)
- **WHY** an edge case is handled
- **WHY** a workaround exists
- Non-obvious business rules
- Performance optimizations

✅ **Good**
```typescript
// We snapshot the subscription tier at report generation time
// to ensure recomputation matches the original billing context.
const tierSnapshot = user.currentTier;
```

❌ **Bad**
```typescript
// Get the user's tier
const tier = user.currentTier;
```

---

#### Forbidden Comments

❌ Restating code  
❌ Emotional/vague comments ("this is tricky", "magic happens here")  
❌ Commented-out code (use version control)  
❌ Outdated comments (worse than no comments)

---

#### TODO/FIXME Rules

Allowed **ONLY** with reason and future intent.

✅ **Good**
```typescript
// TODO: Replace polling with webhook once provider supports callbacks (Q2 2025)
```

❌ **Bad**
```typescript
// TODO fix later
// FIXME
```

---

#### Naming vs Comment Rule

**If a name needs a comment to explain it, the name is wrong.**

❌ **Bad**
```typescript
const x = 5; // maximum retry count
```

✅ **Good**
```typescript
const maxRetryCount = 5;
```

---

### 5.5 Code Documentation (JSDoc/TSDoc)

Document all:
- Public functions & classes
- API handlers
- Shared utilities
- Non-trivial business logic
- Configuration & environment variables

**Documentation must explain**:
- **WHY** it exists (purpose)
- **Contract** (inputs/outputs)
- **Side effects**
- **Failure modes**
- **Invariants**
- **Edge cases**

✅ **Good**
```typescript
/**
 * Validates and creates a new user project.
 * 
 * @param userId - The ID of the user creating the project
 * @param projectData - Project creation data
 * @returns The created project with generated ID
 * @throws {ValidationError} If project data is invalid
 * @throws {ConflictError} If project with same name exists for user
 * 
 * Side effects:
 * - Creates database record
 * - Sends notification to user
 * - Logs audit event
 */
async function createUserProject(
  userId: string,
  projectData: CreateProjectDto
): Promise<UserProject> {
  // Implementation
}
```

---

## 6. Testing Standards

### 6.1 Single Testing Document

**Authoritative testing doc**:
```
docs/08_TESTING.md
```

**Must include**:
- Test strategy & philosophy
- Scope / out-of-scope
- How to run tests
- Environment assumptions
- Test data management
- Known gaps
- Recent test changes (dated)

---

### 6.2 Test Structure

```
tests/
├── unit/             ← Pure function tests
├── integration/      ← Service + DB tests
├── e2e/              ← Full API tests
└── fixtures/         ← Test data
```

---

### 6.3 Test Naming

Test names must describe the scenario and expected outcome.

✅ **Good**
```typescript
describe('UserProjectService', () => {
  describe('createProject', () => {
    it('should create project when valid data provided', async () => { ... });
    it('should throw ValidationError when name is empty', async () => { ... });
    it('should throw ConflictError when duplicate name exists', async () => { ... });
  });
});
```

❌ **Bad**
```typescript
it('test1', () => { ... });
it('should work', () => { ... });
```

---

### 6.4 Test Coverage

**Minimum coverage targets**:
- **Services**: 80%
- **Repositories**: 70%
- **Controllers**: 60%
- **Utils**: 90%

**Priority**:
1. Business logic (services)
2. Data access (repositories)
3. Edge cases & error handling
4. Happy paths

---

### 6.5 Test Maintenance

- **Behavior change** ⇒ tests updated ⇒ testing doc updated
- **Failing tests** are blocking issues
- **Flaky tests** must be fixed or removed
- **Outdated tests** are technical debt

---

## 7. Change Management

### 7.1 Change Discipline (NON-NEGOTIABLE)

**Every change MUST include**:

1. ✅ Code update
2. ✅ API doc update (if API changed)
3. ✅ Database doc update (if schema changed)
4. ✅ Diagram update (if workflow changed)
5. ✅ Project status update (`00_PROJECT_STATUS.md`)
6. ✅ Testing doc update (if behavior changed)
7. ✅ Comment & code-doc update (if logic changed)

---

### 7.2 Git Commit Messages

Follow conventional commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `refactor`: Code restructuring (no behavior change)
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

✅ **Good**
```
feat(user-projects): add endpoint to fetch projects by user ID

- Added GET /v1/user-projects/user/:userId endpoint
- Updated API documentation
- Added integration tests

Closes #123
```

❌ **Bad**
```
update stuff
fixed bug
WIP
```

---

### 7.3 Pull Request Checklist

Before submitting a PR:

- [ ] Code follows naming conventions
- [ ] Comments explain intent (WHY, not WHAT)
- [ ] Code works and is tested
- [ ] Existing docs updated (not new docs created)
- [ ] Diagrams updated (if needed)
- [ ] Testing doc updated (if behavior changed)
- [ ] Project status updated
- [ ] No linting errors
- [ ] No commented-out code
- [ ] No console.logs (use proper logging)

---

## 8. Definition of Done

A task is **DONE** only if:

- ✅ **Naming** follows semantic rules (Section 2)
- ✅ **Comments** explain intent, not mechanics
- ✅ **Code** works and is tested
- ✅ **Docs** updated (existing docs first, Section 4)
- ✅ **Diagrams** updated (if workflow changed)
- ✅ **Testing doc** updated (if behavior changed)
- ✅ **Project status** updated (`00_PROJECT_STATUS.md`)
- ✅ **No violations** of hard "DO NOT" rules

---

## 9. Hard "DO NOT" Rules

❌ **Naming**:
- No vague names (`data`, `info`, `value`, `temp`, `obj`)
- No standalone adjectives (`very`, `huge`, `nice`)
- No ambiguous verbs (`handle`, `process`, `manage`)

❌ **Documentation**:
- No unnecessary new docs (update existing first)
- No undocumented APIs
- No stale diagrams
- No orphan docs

❌ **Code**:
- No commented-out code (use version control)
- No console.logs in production code
- No circular dependencies
- No utils dump (categorize utilities)

❌ **Testing**:
- No behavior change without test update
- No flaky tests
- No skipped tests without documented reason

---

## 10. Antigravity Response Format

Every Antigravity response **MUST** include:

### Summary
- Brief description of what was done

### Files Changed
- List of modified/created files with reasons

### Documentation Updates
- Which docs were updated
- What sections were modified

### Diagram Impact
- Diagrams updated (or "no impact" with reason)

### Testing Impact
- Tests affected/added
- Testing doc updates

### Code Documentation
- Comment/docstring changes
- Why they were needed

### Design Decisions
- Key choices made
- Rationale

### Verification Steps
- How to run/verify the changes
- Expected outcomes

### Status Confirmation
- Confirmation that `00_PROJECT_STATUS.md` was updated
- Confirmation that `08_TESTING.md` was updated (if applicable)

---

## 11. Environment & Configuration

### 11.1 Environment Variables

- **Always** use `.env` files (never commit `.env`)
- **Always** provide `.env.example` with documentation
- **Always** validate env vars at startup
- Use descriptive names: `DATABASE_URL`, `JWT_SECRET_KEY`

### 11.2 Configuration Management

```typescript
// config/index.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET_KEY: z.string().min(32),
  PORT: z.coerce.number().default(3000),
});

export const config = envSchema.parse(process.env);
```

---

## 12. Security Best Practices

### 12.1 Authentication & Authorization

- **Always** validate JWT tokens
- **Always** check user permissions
- **Never** trust client input
- **Always** sanitize inputs

### 12.2 Data Protection

- **Always** hash passwords (bcrypt, argon2)
- **Never** log sensitive data (passwords, tokens, PII)
- **Always** use HTTPS in production
- **Always** validate and sanitize SQL inputs (use parameterized queries)

### 12.3 Error Messages

- **Never** expose internal details in error messages
- **Never** expose stack traces to clients (in production)
- **Always** log detailed errors server-side

---

## 13. Performance Guidelines

### 13.1 Database

- **Always** add indexes on foreign keys
- **Always** add indexes on frequently queried columns
- **Avoid** N+1 queries (use joins or eager loading)
- **Use** pagination for large result sets

### 13.2 API

- **Always** implement rate limiting
- **Always** implement request timeouts
- **Use** caching where appropriate
- **Avoid** blocking operations in request handlers

---

## Appendix: Quick Reference

### Naming Cheat Sheet

| What | Convention | Example |
|------|------------|---------|
| Variable | `camelCase` noun | `userProject` |
| Function | `camelCase` verb+noun | `createUserProject()` |
| Boolean | `is/has/can/should` | `isAuthenticated` |
| Class | `PascalCase` | `UserProjectService` |
| Constant | `UPPER_SNAKE_CASE` | `MAX_RETRY_COUNT` |
| File | `kebab-case.ext` | `user-project.service.ts` |
| Folder | `kebab-case` | `user-projects/` |
| API endpoint | `/kebab-case` | `/v1/user-projects` |
| DB table | `snake_case` plural | `user_projects` |
| DB column | `snake_case` | `created_at` |

### Documentation Priority

1. Update `00_PROJECT_STATUS.md`
2. Update relevant existing doc
3. Add inline code comments
4. Update diagrams
5. **LAST RESORT**: Create new doc (with permission)

### Change Checklist

- [ ] Code updated
- [ ] Tests updated
- [ ] API docs updated (if applicable)
- [ ] Diagrams updated (if applicable)
- [ ] `00_PROJECT_STATUS.md` updated
- [ ] `08_TESTING.md` updated (if applicable)
- [ ] Comments/docstrings updated

---

**END OF RULES**

> Remember: These rules exist to maintain code quality, clarity, and maintainability.  
> When in doubt, prioritize readability and simplicity over cleverness.
