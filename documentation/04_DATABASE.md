# Database Documentation

Complete database schema documentation for the Literature Review System.

**Database**: PostgreSQL 14+  
**ORM**: Prisma  
**Schema File**: `literature-review-backend/prisma/schema.prisma`

---

## Table of Contents

1. [Overview](#overview)
2. [ER Diagram](#er-diagram)
3. [Tables](#tables)
   - [users](#table-users)
   - [email_verification_tokens](#table-email_verification_tokens)
   - [password_reset_tokens](#table-password_reset_tokens)
   - [refresh_tokens](#table-refresh_tokens)
   - [user_projects](#table-user_projects)
   - [candidate_papers](#table-candidate_papers)
   - [llm_usage_logs](#table-llm_usage_logs)
4. [Indexes](#indexes)
5. [Migrations](#migrations)
6. [Backup & Recovery](#backup--recovery)

---

## Overview

The database consists of **7 tables** organized into three main groups:

### Authentication Tables
- `users` - Core user accounts
- `email_verification_tokens` - Email verification workflow
- `password_reset_tokens` - Password reset workflow
- `refresh_tokens` - JWT refresh token management

### Application Tables
- `user_projects` - User research projects
- `candidate_papers` - Candidate papers for analysis

### LLM Tracking Tables
- `llm_usage_logs` - LLM API usage tracking for billing

**Total Relationships**: 8 foreign keys (all with CASCADE or SET NULL delete)

---

## ER Diagram

**Location**: [`diagrams/database-er-diagram.puml`](./diagrams/database-er-diagram.puml)

The ER diagram shows all tables, relationships, primary keys, foreign keys, and cardinality.

**View the diagram**: Use PlantUML viewer or see the `.puml` file.

**Key Relationships**:
- `users` → `email_verification_tokens` (1:N)
- `users` → `password_reset_tokens` (1:N)
- `users` → `refresh_tokens` (1:N)
- `users` → `user_projects` (1:N)
- `user_projects` → `candidate_papers` (1:N)

---

## Tables

### Table: users

**Description**: Core user authentication and profile information.

#### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique user identifier |
| email | VARCHAR(255) | NOT NULL, UNIQUE | User email address |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password (cost: 12) |
| first_name | VARCHAR(100) | NULL | User's first name |
| last_name | VARCHAR(100) | NULL | User's last name |
| is_verified | BOOLEAN | NOT NULL, DEFAULT false | Email verification status |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Account active status |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |
| last_login | TIMESTAMP | NULL | Last successful login timestamp |

#### Indexes

- `idx_users__email` — Fast lookup by email (unique index)
- `idx_users__created_at` — Sorting by registration date

#### Constraints

- `uq_users__email` — Unique email address
- Primary key on `id`

#### Business Rules

- Email must be unique across all users
- Password is never stored in plain text
- `is_verified` is false until email is verified
- `is_active` can be set to false to deactivate account
- `updated_at` is automatically updated on any change

---

### Table: email_verification_tokens

**Description**: Stores one-time tokens for email verification workflow.

#### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique token identifier |
| user_id | UUID | NOT NULL, FK → users(id) | User this token belongs to |
| token | VARCHAR(255) | NOT NULL, UNIQUE | Verification token (UUID) |
| expires_at | TIMESTAMP | NOT NULL | Token expiration time |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Token creation time |
| used_at | TIMESTAMP | NULL | When token was used (NULL if unused) |

#### Indexes

- `idx_email_verification_tokens__user_id` — Fast lookup by user
- `idx_email_verification_tokens__token` — Fast lookup by token (unique)
- `idx_email_verification_tokens__expires_at` — Cleanup expired tokens

#### Constraints

- `uq_email_verification_tokens__token` — Unique token
- `fk_email_verification_tokens__user_id` — Foreign key to users (CASCADE delete)

#### Business Rules

- Token expires after 24 hours
- Token is single-use only
- When used, `used_at` is set to current timestamp
- Tokens are automatically deleted when user is deleted (CASCADE)
- Expired tokens should be cleaned up periodically

---

### Table: password_reset_tokens

**Description**: Stores one-time tokens for password reset workflow.

#### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique token identifier |
| user_id | UUID | NOT NULL, FK → users(id) | User this token belongs to |
| token | VARCHAR(255) | NOT NULL, UNIQUE | Reset token (UUID) |
| expires_at | TIMESTAMP | NOT NULL | Token expiration time |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Token creation time |
| used_at | TIMESTAMP | NULL | When token was used (NULL if unused) |

#### Indexes

- `idx_password_reset_tokens__user_id` — Fast lookup by user
- `idx_password_reset_tokens__token` — Fast lookup by token (unique)
- `idx_password_reset_tokens__expires_at` — Cleanup expired tokens

#### Constraints

- `uq_password_reset_tokens__token` — Unique token
- `fk_password_reset_tokens__user_id` — Foreign key to users (CASCADE delete)

#### Business Rules

- Token expires after 1 hour
- Token is single-use only
- When used, `used_at` is set and all user's refresh tokens are revoked
- Tokens are automatically deleted when user is deleted (CASCADE)
- Expired tokens should be cleaned up periodically

---

### Table: refresh_tokens

**Description**: Stores JWT refresh tokens for token rotation and revocation.

#### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique token identifier |
| user_id | UUID | NOT NULL, FK → users(id) | User this token belongs to |
| token | VARCHAR(255) | NOT NULL, UNIQUE | Refresh token (JWT) |
| expires_at | TIMESTAMP | NOT NULL | Token expiration time |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Token creation time |
| revoked_at | TIMESTAMP | NULL | When token was revoked (NULL if active) |
| replaced_by_token | VARCHAR(255) | NULL | New token that replaced this one |

#### Indexes

- `idx_refresh_tokens__user_id` — Fast lookup by user
- `idx_refresh_tokens__token` — Fast lookup by token (unique)
- `idx_refresh_tokens__expires_at` — Cleanup expired tokens

#### Constraints

- `uq_refresh_tokens__token` — Unique token
- `fk_refresh_tokens__user_id` — Foreign key to users (CASCADE delete)

#### Business Rules

- Token expires after 7 days
- Token can be revoked before expiration
- When refreshed, old token is revoked and `replaced_by_token` is set
- All user's refresh tokens are revoked on password change
- Tokens are automatically deleted when user is deleted (CASCADE)
- Expired/revoked tokens should be cleaned up periodically

---

### Table: user_projects

**Description**: Stores user research projects and ideas.

#### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique project identifier |
| user_id | UUID | NOT NULL, FK → users(id) | Project owner |
| project_name | VARCHAR(255) | NOT NULL | Project name/title |
| user_idea | TEXT | NOT NULL | Research idea/abstract (unlimited length) |
| methodologies | TEXT[] | DEFAULT [] | Methodologies extracted from Stage 1 |
| application_domains | TEXT[] | DEFAULT [] | Application domains from Stage 1 |
| constraints | TEXT[] | DEFAULT [] | Constraints from Stage 1 |
| contribution_types | TEXT[] | DEFAULT [] | Contribution types from Stage 1 |
| keywords_seed | TEXT[] | DEFAULT [] | Initial keywords from Stage 1 |
| intent_processed_status | ENUM | DEFAULT 'NOT_INITIATED' | Status of Intent Decomposition stage |
| expanded_keywords | TEXT[] | DEFAULT [] | Expanded keywords from Stage 2 |
| search_queries | JSONB | NULL | Generated search queries from Stage 2 |
| search_query_processing_status | ENUM | DEFAULT 'NOT_INITIATED' | Status of Query Generation stage |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Project creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

#### Indexes

- `idx_user_projects__user_id` — Fast lookup by user
- `idx_user_projects__created_at` — Sorting by creation date

#### Constraints

- `fk_user_projects__user_id` — Foreign key to users (CASCADE delete)

#### Business Rules

- Each user can have multiple projects
- `user_idea` field supports unlimited text length
- Projects are automatically deleted when user is deleted (CASCADE)
- `updated_at` is automatically updated on any change
- Arrays (methodologies, etc.) default to empty lists
- `search_queries` stores detailed query logic in JSON format

#### Enums: ProcessingStatus

| Value | Description |
|-------|-------------|
| `NOT_INITIATED` | Stage has not started |
| `EVALUATED` | Stage completed successfully |
| `UNDER_PROCESSING` | Stage is currently running |
| `FAILED_INSUFFICIENT_CREDITS` | Call failed due to low credits |
| `FAILED_OTHER` | Call failed due to server error or API issue |

---

### Table: candidate_papers

**Description**: Stores candidate papers for analysis and comparison against user's research project.

#### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique paper identifier |
| project_id | UUID | NOT NULL, FK → user_projects(id) | Project this paper belongs to |
| paper_title | VARCHAR(500) | NOT NULL | Title of the candidate paper |
| paper_abstract | TEXT | NOT NULL | Abstract of the candidate paper |
| paper_download_link | VARCHAR(500) | NULL | Optional download link (PDF, arXiv, etc.) |
| is_processed_by_llm | BOOLEAN | NOT NULL, DEFAULT false | Whether LLM analysis has been performed |
| semantic_similarity | DECIMAL(5,4) | NULL | Similarity score (0.0000-1.0000) |
| similarity_model_name | VARCHAR(100) | NULL | Model used for similarity calculation |
| problem_overlap | VARCHAR(20) | NULL | Problem overlap level (high/medium/low) |
| domain_overlap | VARCHAR(20) | NULL | Domain overlap level (high/medium/low) |
| constraint_overlap | VARCHAR(20) | NULL | Constraint overlap level (high/medium/low) |
| c1_score | DECIMAL(5,2) | NULL | C1 (competitor) score (0-100) |
| c1_justification | TEXT | NULL | Justification for C1 score |
| c1_strengths | TEXT | NULL | Strengths of the candidate paper |
| c1_weaknesses | TEXT | NULL | Weaknesses of the candidate paper |
| c2_score | DECIMAL(5,2) | NULL | C2 (supporting work) score (0-100) |
| c2_justification | TEXT | NULL | Justification for C2 score |
| c2_contribution_type | TEXT | NULL | Type of contribution this paper makes |
| c2_relevance_areas | TEXT | NULL | Areas where this paper is relevant |
| research_gaps | TEXT | NULL | Research gaps identified in the paper |
| user_novelty | TEXT | NULL | What makes user's work novel vs this paper |
| model_used | VARCHAR(100) | NULL | LLM model used for analysis |
| input_tokens_used | INTEGER | NULL | Number of input tokens consumed |
| output_tokens_used | INTEGER | NULL | Number of output tokens generated |
| processed_at | TIMESTAMP | NULL | When LLM processing was completed |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Paper creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

#### Indexes

- `idx_candidate_papers__project_id` — Fast lookup by project
- `idx_candidate_papers__is_processed_by_llm` — Filter by processing status
- `idx_candidate_papers__created_at` — Sorting by creation date

#### Constraints

- `fk_candidate_papers__project_id` — Foreign key to user_projects (CASCADE delete)

#### Business Rules

- Each project can have multiple candidate papers
- Papers are created with basic info only (title, abstract, link)
- LLM analysis fields are NULL until processing is triggered
- `is_processed_by_llm` is false by default, set to true after analysis
- Papers are automatically deleted when project is deleted (CASCADE)
- `updated_at` is automatically updated on any change
- Semantic similarity is stored with 4 decimal precision (e.g., 0.8547)
- C1/C2 scores are stored with 2 decimal precision (e.g., 85.50)
- Overlap levels must be one of: 'high', 'medium', 'low'

---

## Indexes

### Primary Indexes (Automatic)
- All tables have primary key index on `id` column

### Unique Indexes
- `users.email` — Ensures unique email addresses
- `email_verification_tokens.token` — Ensures unique tokens
- `password_reset_tokens.token` — Ensures unique tokens
- `refresh_tokens.token` — Ensures unique tokens

### Foreign Key Indexes
- `email_verification_tokens.user_id` — Fast user lookup
- `password_reset_tokens.user_id` — Fast user lookup
- `refresh_tokens.user_id` — Fast user lookup
- `user_projects.user_id` — Fast user lookup

### Performance Indexes
- `users.created_at` — For sorting/filtering by registration date
- `user_projects.created_at` — For sorting/filtering by creation date
- `*_tokens.expires_at` — For cleanup queries

---

## Migrations

### Migration History

| Migration | Date | Description |
|-----------|------|-------------|
| `init` | 2025-12-XX | Initial schema with users and auth tables |
| `add_user_projects` | 2025-12-XX | Added user_projects table |
| `add_candidate_papers` | 2025-12-31 | Added candidate_papers table for paper analysis |

### Running Migrations

**Development**:
```bash
npx prisma migrate dev
```

**Production**:
```bash
npx prisma migrate deploy
```

**Reset Database** (⚠️ Deletes all data):
```bash
npx prisma migrate reset
```

### Creating New Migrations

```bash
npx prisma migrate dev --name descriptive_name
```

**Important**: After creating migration, update:
1. This documentation file (`04_DATABASE.md`)
2. ER diagram (`diagrams/database-er-diagram.puml`)
3. Project status (`00_PROJECT_STATUS.md`)

---

## Backup & Recovery

### Manual Backup

```bash
# Backup entire database
pg_dump -U username -d literature_review > backup_$(date +%Y%m%d).sql

# Backup specific tables
pg_dump -U username -d literature_review -t users -t user_projects > backup_users.sql
```

### Restore from Backup

```bash
# Restore entire database
psql -U username -d literature_review < backup_20251231.sql

# Restore specific tables
psql -U username -d literature_review < backup_users.sql
```

### Automated Backups

**Recommended**: Set up automated daily backups using:
- PostgreSQL built-in backup tools
- Cloud provider backup services (AWS RDS, Supabase, etc.)
- Cron jobs for scheduled backups

---

## Database Maintenance

### Cleanup Expired Tokens

Run periodically (e.g., daily via cron job):

```sql
-- Delete expired email verification tokens
DELETE FROM email_verification_tokens 
WHERE expires_at < NOW();

-- Delete expired password reset tokens
DELETE FROM password_reset_tokens 
WHERE expires_at < NOW();

-- Delete expired/revoked refresh tokens
DELETE FROM refresh_tokens 
WHERE expires_at < NOW() OR revoked_at IS NOT NULL;
```

### Vacuum and Analyze

Run weekly for optimal performance:

```sql
VACUUM ANALYZE users;
VACUUM ANALYZE email_verification_tokens;
VACUUM ANALYZE password_reset_tokens;
VACUUM ANALYZE refresh_tokens;
VACUUM ANALYZE user_projects;
```

---

## Database Statistics

### Current Schema (as of 2025-12-31)

- **Tables**: 6
- **Foreign Keys**: 5
- **Indexes**: 17 (including primary keys)
- **Unique Constraints**: 5

### Estimated Storage

| Table | Estimated Rows | Storage per Row | Total Storage |
|-------|----------------|-----------------|---------------|
| users | 10,000 | ~500 bytes | ~5 MB |
| email_verification_tokens | 1,000 | ~200 bytes | ~200 KB |
| password_reset_tokens | 100 | ~200 bytes | ~20 KB |
| refresh_tokens | 50,000 | ~300 bytes | ~15 MB |
| user_projects | 50,000 | ~1 KB | ~50 MB |

**Total Estimated**: ~70 MB for 10,000 users

---

## Security Considerations

### Password Storage
- ✅ Passwords are hashed using bcrypt (cost factor: 12)
- ✅ Plain text passwords are NEVER stored
- ✅ Password hashes are irreversible

### Token Security
- ✅ All tokens are UUIDs (cryptographically random)
- ✅ Tokens are single-use only
- ✅ Tokens have expiration times
- ✅ Expired tokens are cleaned up

### Data Protection
- ✅ Cascade deletes prevent orphaned records
- ✅ Foreign key constraints ensure referential integrity
- ✅ Unique constraints prevent duplicates
- ✅ Indexes improve query performance

---

## Future Tables (Planned)

### saved_papers

**Description**: Store papers saved by users during literature review.

**Columns**:
- `id` (UUID, PK)
- `user_id` (UUID, FK → users)
- `project_id` (UUID, FK → user_projects)
- `paper_title` (VARCHAR)
- `paper_authors` (TEXT)
- `paper_year` (INTEGER)
- `paper_venue` (VARCHAR)
- `paper_abstract` (TEXT)
- `paper_url` (VARCHAR)
- `category` (VARCHAR) — 'C1' or 'C2'
- `score` (DECIMAL)
- `notes` (TEXT)
- `created_at` (TIMESTAMP)

**Status**: Not yet implemented

---

## Table: llm_model_pricing

**Description**: Stores pricing structure for different LLM models and tiers. Used to calculate usage costs.

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique pricing identifier |
| model_name | VARCHAR | NOT NULL | e.g. 'gpt-4o-mini' |
| provider | VARCHAR | NOT NULL | e.g. 'openai' |
| pricing_tier | VARCHAR | NOT NULL | 'standard', 'batch', etc. |
| input_usd_price_per_million_tokens | FLOAT | NOT NULL | Cost per 1M input tokens in USD |
| output_usd_price_per_million_tokens | FLOAT | NOT NULL | Cost per 1M output tokens in USD |
| cached_input_usd_price_per_million_tokens | FLOAT | NULL | Discounted cached input price |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Whether this pricing is usable |
| is_latest | BOOLEAN | NOT NULL, DEFAULT true | Whether this is the current active price |
| effective_from | TIMESTAMP | NOT NULL | Start date of valid price |
| effective_to | TIMESTAMP | NULL | End date of valid price |
| created_at | TIMESTAMP | NOT NULL | Record creation |
| updated_at | TIMESTAMP | NOT NULL | Record update |

### Indexes

- `idx_uniq_pricing` (unique) on (model, provider, tier, effective_from)
- `idx_latest` on (model, provider, tier, is_latest)

---

## Table: llm_usage_logs

**Description**: Tracks all LLM API calls for billing, analytics, and cost monitoring. Records token usage, costs, performance metrics, and metadata for every OpenAI API call made by the system.

### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique log entry identifier |
| user_id | UUID | NOT NULL, FK → users(id) | User who made the API call |
| project_id | UUID | NULL, FK → user_projects(id) | Associated project (if applicable) |
| paper_id | UUID | NULL, FK → candidate_papers(id) | Associated paper (if applicable) |
| stage | VARCHAR | NOT NULL | Pipeline stage ('intent', 'queries', 'score', etc.) |
| model_name | VARCHAR | NOT NULL | AI model used (e.g., 'gpt-4o-mini', 'gpt-4') |
| provider | VARCHAR | NOT NULL, DEFAULT 'openai' | LLM provider ('openai', 'anthropic', etc.) |
| input_tokens | INTEGER | NOT NULL | Number of input tokens |
| output_tokens | INTEGER | NOT NULL | Number of output tokens |
| total_tokens | INTEGER | NOT NULL | Total tokens (input + output) |
| input_cost_usd | FLOAT | NULL | Cost of input tokens in USD |
| output_cost_usd | FLOAT | NULL | Cost of output tokens in USD |
| total_cost_usd | FLOAT | NULL | Total cost in USD |
| duration_ms | INTEGER | NULL | API call duration in milliseconds |
| request_id | VARCHAR | NULL | OpenAI request ID for debugging |
| status | VARCHAR | NOT NULL, DEFAULT 'success' | Call status ('success', 'error', 'timeout') |
| error_message | TEXT | NULL | Error message if status is 'error' |
| metadata | TEXT | NULL | Additional JSON metadata |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | When the API call was made |

### Indexes

- `idx_llm_usage_logs__user_id_created_at` — Fast queries by user over time
- `idx_llm_usage_logs__project_id_created_at` — Fast queries by project over time
- `idx_llm_usage_logs__stage_created_at` — Fast queries by stage over time
- `idx_llm_usage_logs__created_at` — Time-based queries for billing periods

### Constraints

- `fk_llm_usage_logs__user_id` — Foreign key to users table (CASCADE delete)
- `fk_llm_usage_logs__project_id` — Foreign key to user_projects table (SET NULL on delete)
- `fk_llm_usage_logs__paper_id` — Foreign key to candidate_papers table (SET NULL on delete)

### Relationships

- **users** (1:N) — Each user can have many LLM usage logs
- **user_projects** (1:N, optional) — Each project can have many LLM usage logs
- **candidate_papers** (1:N, optional) — Each paper can have many LLM usage logs

### Business Logic

- **Cost Calculation**: Costs are stored in USD (Float) for precision
  - Example: $1.25 is stored as 1.25
- **Pricing**: Based on current OpenAI pricing per 1M tokens
  - gpt-4o-mini: $0.15 input, $0.60 output per 1M tokens
  - gpt-4o: $2.50 input, $10.00 output per 1M tokens
  - gpt-4: $30.00 input, $60.00 output per 1M tokens
- **Performance Tracking**: `duration_ms` helps identify slow API calls
- **Error Tracking**: Failed calls are logged with `status='error'` and error details
- **Billing Periods**: Use `created_at` with date range queries for monthly billing
- **Analytics**: Group by `stage` or `model_name` for usage insights

### Usage Examples

**Get user's monthly bill**:
```sql
SELECT 
  SUM(total_cost_usd) AS total_cost_usd,
  COUNT(*) AS total_calls,
  SUM(total_tokens) AS total_tokens
FROM llm_usage_logs
WHERE user_id = 'user_123'
  AND created_at >= '2025-01-01'
  AND created_at < '2025-02-01';
```

**Get usage by stage**:
```sql
SELECT 
  stage,
  COUNT(*) AS calls,
  SUM(total_tokens) AS tokens,
  SUM(total_cost_usd) AS cost_usd
FROM llm_usage_logs
WHERE user_id = 'user_123'
GROUP BY stage
ORDER BY cost_usd DESC;
```

---

## Additional Resources

- **ER Diagram**: [`diagrams/database-er-diagram.puml`](./diagrams/database-er-diagram.puml)
- **Prisma Schema**: `literature-review-backend/prisma/schema.prisma`
- **API Documentation**: [03_API.md](./03_API.md)
- **Setup Guide**: [01_SETUP.md](./01_SETUP.md)

---

**For database connection and configuration, see [01_SETUP.md](./01_SETUP.md#database-setup)**
