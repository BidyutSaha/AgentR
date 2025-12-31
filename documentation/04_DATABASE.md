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
4. [Indexes](#indexes)
5. [Migrations](#migrations)
6. [Backup & Recovery](#backup--recovery)

---

## Overview

The database consists of **5 tables** organized into two main groups:

### Authentication Tables
- `users` - Core user accounts
- `email_verification_tokens` - Email verification workflow
- `password_reset_tokens` - Password reset workflow
- `refresh_tokens` - JWT refresh token management

### Application Tables
- `user_projects` - User research projects

**Total Relationships**: 4 foreign keys (all with CASCADE delete)

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

- **Tables**: 5
- **Foreign Keys**: 4
- **Indexes**: 14 (including primary keys)
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

## Additional Resources

- **ER Diagram**: [`diagrams/database-er-diagram.puml`](./diagrams/database-er-diagram.puml)
- **Prisma Schema**: `literature-review-backend/prisma/schema.prisma`
- **API Documentation**: [03_API.md](./03_API.md)
- **Setup Guide**: [01_SETUP.md](./01_SETUP.md)

---

**For database connection and configuration, see [01_SETUP.md](./01_SETUP.md#database-setup)**
