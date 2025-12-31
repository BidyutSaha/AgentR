# Migration Guide: Converting Existing Project to New Rules

> **Purpose**: Step-by-step guide to bring the existing "Paper Agent" project into compliance with the new unified rules.

---

## Overview

This guide will help you systematically update your existing project to meet all requirements in `rules.md`.

**Estimated Time**: 4-6 hours  
**Priority**: High → Medium → Low

---

## Phase 1: Documentation Structure (HIGH PRIORITY)

### Step 1.1: Create Documentation Directory

```bash
# Create the standard docs structure
mkdir -p documentation/diagrams
```

### Step 1.2: Create Core Documentation Files

Create these files in `documentation/`:

- [ ] `00_PROJECT_STATUS.md` — Project status and truth file
- [ ] `01_SETUP.md` — Installation and environment setup
- [ ] `02_ARCHITECTURE.md` — System design and architecture
- [ ] `03_API.md` — API reference (consolidate all API docs here)
- [ ] `04_DATABASE.md` — Database schema documentation
- [ ] `05_WORKFLOWS.md` — Key workflows and processes
- [ ] `06_DECISIONS.md` — Architecture decision records
- [ ] `07_TROUBLESHOOTING.md` — Common issues and solutions
- [ ] `08_TESTING.md` — Testing strategy and guide
- [ ] `09_DEPLOYMENT.md` — Deployment procedures

### Step 1.3: Migrate Existing Documentation

**Current docs to consolidate**:
- `documentation/api_full.md` → Merge into `03_API.md`
- `documentation/api_mvp.md` → Merge into `03_API.md`
- `documentation/context_full.md` → Merge into `02_ARCHITECTURE.md`
- `documentation/context_mvp.md` → Merge into `02_ARCHITECTURE.md`
- `documentation/DBEAVER_SETUP.md` → Merge into `01_SETUP.md`
- `documentation/testing/*.md` → Merge into `08_TESTING.md`

**Action**:
```bash
# After consolidating, remove old files
rm documentation/api_full.md
rm documentation/api_mvp.md
rm documentation/context_full.md
rm documentation/context_mvp.md
# etc.
```

---

## Phase 2: API Documentation (HIGH PRIORITY)

### Step 2.1: Document All Endpoints in `03_API.md`

For **EACH** endpoint, use the template from Section 3.2:

**Current endpoints to document**:
1. `POST /v1/user-projects` — Create project
2. `GET /v1/user-projects/:id` — Get project by ID
3. `GET /v1/user-projects/user/:userId` — Get all projects for user
4. `PATCH /v1/user-projects/:id` — Update project
5. `DELETE /v1/user-projects/:id` — Delete project
6. (Add any other endpoints)

**For each endpoint, include**:
- [ ] API path with versioning
- [ ] HTTP method
- [ ] Description
- [ ] Authentication & roles
- [ ] Input structure (TypeScript schema)
- [ ] Output structure (TypeScript schema)
- [ ] Sample request (with real data)
- [ ] Sample response (with real data)
- [ ] Error cases table
- [ ] Diagrams (or justification for skipping)

**Example**:
See Section 3.2 in `rules.md` for the complete template.

---

## Phase 3: Database Documentation (HIGH PRIORITY)

### Step 3.1: Document Database Schema in `04_DATABASE.md`

**Current tables** (from your Prisma schema):
1. `users`
2. `user_projects`
3. (Add any other tables)

**For each table, document**:
- [ ] Table description
- [ ] Columns (name, type, constraints, description)
- [ ] Indexes
- [ ] Constraints (unique, foreign key, check)

**Template**: See Section 3.7.2 in `rules.md`

### Step 3.2: Create ER Diagram

**File**: `documentation/diagrams/database-er-diagram.puml`

**Requirements**:
- [ ] All tables included
- [ ] All relationships shown
- [ ] Cardinality specified (1:1, 1:N, N:M)
- [ ] Primary keys marked
- [ ] Foreign keys marked

**Template**: See Section 3.7.3 in `rules.md`

**Action**:
1. Review your `literature-review-backend/prisma/schema.prisma`
2. Create PlantUML ER diagram with all tables
3. Verify diagram matches actual schema

---

## Phase 4: Diagrams for Workflows (MEDIUM PRIORITY)

### Step 4.1: Identify Non-Trivial Workflows

**Review your endpoints** and identify which need diagrams (Section 3.3):
- Multi-service interactions?
- Complex business logic?
- Async operations?
- External API calls?
- Multi-resource modifications?

**Example non-trivial workflows**:
- User authentication flow
- Project creation with validation
- (Add others as needed)

### Step 4.2: Create Activity & Sequence Diagrams

For each non-trivial workflow:
- [ ] Activity diagram (`{feature}-activity.puml`)
- [ ] Sequence diagram (`{feature}-sequence.puml`)

**Location**: `documentation/diagrams/`

**Simple CRUD endpoints**: Document in `03_API.md` as:
> **Diagrams**: Not required (simple CRUD operation)

---

## Phase 5: Testing Documentation (MEDIUM PRIORITY)

### Step 5.1: Create `08_TESTING.md`

**Required sections**:
- [ ] Test Strategy
- [ ] Scope / Out-of-Scope
- [ ] How to Run Tests
- [ ] Environment Assumptions
- [ ] Test Data Management
- [ ] Known Gaps
- [ ] Recent Test Changes (dated)

### Step 5.2: Document Existing Tests

**Current test files**:
- `literature-review-backend/setup-tests/` — Document these
- Any other test files

**For each test suite**:
- What it tests
- How to run it
- Expected outcomes
- Known issues

---

## Phase 6: Project Status File (HIGH PRIORITY)

### Step 6.1: Create `00_PROJECT_STATUS.md`

**Required sections**:
```markdown
# Project Status

## Current Goal
[What you're working on right now]

## What Works Now
- ✅ User authentication (JWT-based)
- ✅ User projects CRUD API
- ✅ Database with Prisma ORM
- (Add all completed features)

## In Progress
- [ ] Literature review pipeline stages
- (Add current work items)

## Next Tasks
1. Complete Stage 1 implementation
2. Add comprehensive API tests
3. (Prioritized backlog)

## Known Issues / Tech Debt
- Missing ER diagram
- API documentation scattered
- (List technical debt)

## Recent Changes
### 2025-12-31
- Renamed all project-related files to user-project
- Added GET /v1/user-projects/user/:userId endpoint
- Updated API documentation structure
```

---

## Phase 7: Code Quality Audit (MEDIUM PRIORITY)

### Step 7.1: Review Naming Conventions

**Check all files for**:
- [ ] Variables are nouns (not verbs)
- [ ] Functions are verb+noun
- [ ] Booleans start with is/has/can/should
- [ ] No vague names (data, info, temp, etc.)
- [ ] Files and folders use kebab-case

**Action**: Rename any non-compliant identifiers

### Step 7.2: Add JSDoc/TSDoc

**Add documentation for**:
- [ ] All public functions
- [ ] All API handlers
- [ ] All services
- [ ] All repositories
- [ ] Shared utilities

**Template**:
```typescript
/**
 * Creates a new user project.
 * 
 * @param userId - The ID of the user creating the project
 * @param projectData - Project creation data
 * @returns The created project with generated ID
 * @throws {ValidationError} If project data is invalid
 * @throws {ConflictError} If project with same name exists
 * 
 * Side effects:
 * - Creates database record
 * - Logs audit event
 */
async function createUserProject(
  userId: string,
  projectData: CreateProjectDto
): Promise<UserProject> {
  // Implementation
}
```

### Step 7.3: Review Comments

**Ensure comments explain WHY, not WHAT**:
- [ ] Remove comments that restate code
- [ ] Remove commented-out code
- [ ] Add context for non-obvious decisions
- [ ] Update outdated comments

---

## Phase 8: Testing Improvements (LOW PRIORITY)

### Step 8.1: Achieve Minimum Coverage

**Target coverage** (Section 6.4):
- Services: 80%
- Repositories: 70%
- Controllers: 60%
- Utils: 90%

**Action**:
1. Run coverage report: `npm run test:coverage`
2. Identify gaps
3. Add missing tests

### Step 8.2: Update Test Documentation

After adding tests:
- [ ] Update `08_TESTING.md`
- [ ] Document new test scenarios
- [ ] Update coverage metrics

---

## Phase 9: Final Verification (HIGH PRIORITY)

### Step 9.1: Run Post-Implementation Checklist

Go through **Section 8.1** of `rules.md` and verify:

- [ ] **Code Quality**
  - [ ] Naming conventions followed
  - [ ] Code structure follows layered architecture
  - [ ] Comments explain WHY
  - [ ] Error handling uses custom error classes

- [ ] **API Documentation**
  - [ ] All endpoints documented in `03_API.md`
  - [ ] Input/output structures defined
  - [ ] Sample requests/responses provided
  - [ ] Error cases documented

- [ ] **Database Documentation**
  - [ ] Schema documented in `04_DATABASE.md`
  - [ ] ER diagram created and up-to-date

- [ ] **Diagrams**
  - [ ] ER diagram exists
  - [ ] Non-trivial workflows have activity/sequence diagrams
  - [ ] Simple CRUD documented as not requiring diagrams

- [ ] **Testing**
  - [ ] Tests exist and pass
  - [ ] `08_TESTING.md` exists and is complete

- [ ] **Project Status**
  - [ ] `00_PROJECT_STATUS.md` exists and is up-to-date

- [ ] **Code Documentation**
  - [ ] JSDoc added for public functions

- [ ] **Quality Checks**
  - [ ] No linting errors
  - [ ] No console.logs
  - [ ] No commented-out code

---

## Phase 10: Git Cleanup (LOW PRIORITY)

### Step 10.1: Update .gitignore

Ensure `.gitignore` excludes:
- `node_modules/`
- `.env` (but not `.env.example`)
- `dist/` or `build/`
- Coverage reports
- IDE-specific files

### Step 10.2: Commit Changes

```bash
git add .
git commit -m "docs: migrate to unified documentation structure

- Created standard docs/ structure with 10 core files
- Consolidated scattered API docs into 03_API.md
- Added comprehensive database documentation
- Created ER diagram for database schema
- Added activity/sequence diagrams for workflows
- Updated all endpoints with full documentation template
- Added JSDoc to all public functions
- Achieved minimum test coverage targets
- Created 00_PROJECT_STATUS.md as single source of truth

Closes #<issue-number>"
```

---

## Quick Start Checklist

If you want to start immediately, do these **minimum viable** steps:

### Immediate (30 minutes)
- [ ] Create `documentation/00_PROJECT_STATUS.md`
- [ ] Create `documentation/03_API.md` (start with 1-2 endpoints)
- [ ] Create `documentation/08_TESTING.md` (basic structure)

### This Week (2-3 hours)
- [ ] Document all API endpoints in `03_API.md`
- [ ] Create `documentation/04_DATABASE.md`
- [ ] Create ER diagram: `documentation/diagrams/database-er-diagram.puml`

### This Month (4-6 hours)
- [ ] Complete all 10 core documentation files
- [ ] Add JSDoc to all public functions
- [ ] Create diagrams for non-trivial workflows
- [ ] Achieve minimum test coverage

---

## Getting Help

If you need assistance with any step:

1. **Ask Antigravity**: "Help me create [specific doc]"
2. **Reference rules.md**: Check the relevant section
3. **Use templates**: All templates are in `rules.md`

---

## Success Criteria

Your project is **fully migrated** when:

✅ All 10 core documentation files exist and are complete  
✅ All API endpoints documented with full template  
✅ Database schema and ER diagram documented  
✅ Non-trivial workflows have diagrams  
✅ All public functions have JSDoc  
✅ Post-Implementation Checklist passes 100%  
✅ `00_PROJECT_STATUS.md` is up-to-date  

---

**Good luck with the migration! 🚀**
