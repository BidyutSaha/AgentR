
# Antigravity Unified Project Rules


These rules are **mandatory**.  
Any work that violates them is considered **INCOMPLETE**.

---

## 0. Core Philosophy
- Code must communicate **intent**, not just mechanics.
- Naming, comments, docs, diagrams, and tests together define system clarity.
- Documentation sprawl is technical debt.
- There is exactly:
  - **ONE live project truth file**
  - **ONE live testing truth file**

---

## 1. Naming Conventions (Syntax-Level)

### 1.1 Files & Folders
- **Folders:** `kebab-case`
- **Files:** `kebab-case.ext`
- **Index files:** only for curated exports  
  ❌ No dumping everything into `index.ts`

---

### 1.2 Identifiers (Syntax)
- **Variables / functions:** `camelCase`
- **Classes / Interfaces / Types / Enums:** `PascalCase`
- **Constants:** `UPPER_SNAKE_CASE`
- **Booleans:** must start with  
  `is / has / can / should`

---

## 2. Identifier Semantics (Meaning-Level – CRITICAL)

> Names must encode **what it is**, **what it does**, and **what it represents**.  
> Vague, emotional, or ambiguous names are forbidden.

---

### 2.1 Variables → Nouns Only
Variables represent **state or data**, never actions.

✅ Good
```ts
user
reportSnapshot
requestPayload
interviewCount
````

❌ Bad

```ts
getUser
processData
veryBigValue
temp
data
```

Rules:

* Avoid: `data`, `info`, `value`, `temp`, `obj`
* **Never use adjectives like:** `very`, `huge`, `nice`, `bad`

---

### 2.2 Functions → Verbs or Verb + Noun

Functions represent **actions**.

✅ Good

```ts
createUser()
validateToken()
fetchInterviewById()
generateReport()
```

❌ Bad

```ts
handle()
process()
doStuff()
```

---

### 2.3 Booleans → Conditions / Adjectives

Booleans must read naturally in conditionals.

✅

```ts
isAuthenticated
hasPermission
canRetry
shouldInvalidateCache
```

❌

```ts
auth
valid
flag
```

---

### 2.4 Collections → Plural Nouns

✅ `users`, `interviews`, `errorMessages`
❌ `items`, `list`, `userListData`

---

### 2.5 Units Must Be Explicit

✅ `timeoutMs`, `intervalSeconds`, `fileSizeBytes`
❌ `timeout`, `interval`, `size`

---

### 2.6 Temporal Naming

✅ `createdAt`, `expiresAt`, `lastLoginAt`
❌ `date`, `time`, `timestamp`

---

### 2.7 Adjectives Rule

Adjectives allowed **only when paired with nouns**.

✅ `maxRetryCount`, `defaultPageSize`
❌ `veryFast`, `bigNumber`, `smallValue`

---

### 2.8 Ambiguous Verbs (BANNED)

❌ `handleX()`, `processY()`, `manageZ()`, `doTask()`
✅ `validateInput()`, `persistReport()`, `dispatchNotification()`

---

### 2.9 Short Names (Restricted)

Allowed only:

* loop counters (`i`, `j`)
* formulas
* ≤ 5-line scopes

❌ Never in business logic.

---

### 2.10 Domain Prefixing

✅ `paymentStatus`, `interviewStatus`
❌ `status`, `state`

---

## 3. API & Database Naming

### API

* Nouns, plural, `kebab-case`
* No verbs in paths
* Explicit action subpaths only if unavoidable

### Database

* Tables: `snake_case`, plural
* Columns: `snake_case`
* Foreign keys: `{ref}_id`
* Indexes: `idx_<table>__<column>`
* Constraints: `uq_`, `fk_`, `ck_`

---

## 4. Centralized Documentation (MANDATORY)

All documentation MUST live inside:

```
docs/
```

Standard structure:

```
docs/
├── 00_PROJECT_STATUS.md      ← single live project truth
├── 01_SETUP.md
├── 02_ARCHITECTURE.md
├── 03_API.md
├── 04_DB.md
├── 05_WORKFLOWS.md
├── 06_DECISIONS.md
├── 07_TROUBLESHOOTING.md
├── 08_TESTING.md             ← single live testing truth
└── diagrams/
```

❌ No docs elsewhere
❌ No parallel doc trees

---

## 5. Documentation Creation Control (ANTI-SPRAWL RULE)

### 5.1 Default Rule: UPDATE, DON’T CREATE

* **DO NOT create new `.md` or doc files by default**
* Always update an **existing document first**

Priority order:

1. `00_PROJECT_STATUS.md`
2. Relevant existing doc (`03_API.md`, `02_ARCHITECTURE.md`, etc.)
3. Inline code documentation / comments
4. Diagrams

---

### 5.2 When New Docs Are Allowed (RARE)

A new doc may be created ONLY if:

* It does not logically fit any existing doc
* Adding it would clutter existing docs
* It represents a **long-lived concern**

Examples:

* New subsystem
* New long-term workflow
* New cross-cutting concern

---

### 5.3 User Permission is MANDATORY

Before creating a new doc, you MUST ask the user:

> “This change may require a new documentation file.
> Do you want me to create it, or extend an existing one?”

❌ No silent doc creation
❌ No assumptions

---

### 5.4 Forbidden Docs

❌ `notes.md`, `misc.md`, `temp.md`, `draft.md`
❌ Scratch / personal docs
❌ Orphan docs

Any new doc MUST:

* live in `docs/`
* follow `NN_TITLE.md`
* be referenced from `00_PROJECT_STATUS.md`

---

## 6. Single Live Status File (Project Truth)

File:

```
docs/00_PROJECT_STATUS.md
```

Must be updated whenever:

* code logic changes
* API changes
* DB changes
* diagrams change
* workflows change

Required sections:

* Current Goal
* What Works Now
* In Progress
* Next Tasks
* Known Issues / Tech Debt
* Recent Changes (dated)

---

## 7. Diagrams (Activity + Sequence)

* Location: `docs/diagrams/`
* Format: **PlantUML only**
* Every major workflow MUST have:

  * Activity diagram
  * Sequence diagram

If workflow changes:

* update diagrams
* update `00_PROJECT_STATUS.md`

If none:

> Diagram impact: none (reason)

---

## 8. Modular Code Rules

* Controllers → orchestration only
* Services → business logic only
* Repositories → DB access only
* Validation at boundaries
* No circular dependencies
* No “utils dump”

---

## 9. API Documentation Standard

All endpoints documented in:

```
docs/03_API.md
```

Each endpoint includes:

* purpose
* auth & roles
* sample request
* sample response
* error cases
* key logic (only if non-obvious)

---

## 10. SINGLE FILE TESTING DOCUMENT

Authoritative testing doc:

```
docs/08_TESTING.md
```

Must include:

* Test Strategy
* Scope / Out-of-Scope
* How to Run Tests
* Environment Assumptions
* Known Gaps
* Recent Test Changes (dated)

Behavior change ⇒ tests updated ⇒ testing doc updated.

---

## 11. Production-Level Code Documentation

Document all:

* public functions & classes
* API handlers
* shared utilities
* non-trivial business logic
* configuration & env variables

Documentation must explain:

* WHY it exists
* contract (inputs/outputs)
* side effects
* failure modes
* invariants
* edge cases

Use docstrings/JSDoc for:

* exported APIs
* complex logic
* surprising rules

---

## 12. Code Comment Line Instructions (BEST PRACTICES)

### 12.1 When to Comment

Comment ONLY to explain:

* WHY a decision exists
* WHY an edge case is handled
* WHY a workaround exists

---

### 12.2 Forbidden Comments

❌ Restating code
❌ Emotional/vague comments
❌ Commented-out code

---

### 12.3 Good Comment Example

```ts
// We snapshot the subscription tier at report generation time
// to ensure recomputation matches the original billing context.
```

---

### 12.4 Comment Rules

* Place comments **above blocks**
* Prefer one comment per logical section
* Inline comments only for non-obvious math or protocol rules

---

### 12.5 TODO / FIXME Rules

Allowed ONLY with reason and future intent.

✅

```ts
// TODO: Replace polling with webhook once provider supports callbacks
```

❌

```ts
// TODO fix later
```

---

### 12.6 Naming vs Comment Rule

If a name needs a comment to explain it,
**the name is wrong** → rename it.

---

### 12.7 Comment Maintenance

* Outdated comments are **bugs**
* Update comments when behavior changes

---

## 13. Change Discipline (NON-NEGOTIABLE)

Every change MUST include:

1. Code update
2. API doc update (if applicable)
3. Diagram update (if applicable)
4. Project status update
5. Testing doc update (if behavior changes)
6. Comment & code-doc update (if logic changes)

---

## 14. Hard “DO NOT” Rules

* No vague names (`data`, `info`, `very`)
* No unnecessary new docs
* No undocumented API
* No stale diagrams
* No commented-out code
* No behavior change without test update

---

## 15. Required Output Format (For Antigravity)

Every response MUST include:

* Files changed
* Docs updated
* Diagrams updated (or “no impact”)
* Tests affected
* Comment/documentation impact
* Design decisions
* How to run / verify
* Confirmation of status & testing updates

---

## 16. Definition of Done (DoD)

A task is DONE only if:

* naming follows semantic rules
* comments explain intent
* code works
* docs updated (existing first)
* diagrams updated (if needed)
* testing doc updated (if needed)
* project status updated

