# Database Schema Documentation

## Overview

This document describes the PostgreSQL database schema for the Literature Review System with user authentication and management.

---

## Technology Stack

- **Database**: PostgreSQL 14+
- **ORM**: Prisma
- **Migrations**: Prisma Migrate
- **Connection Pooling**: Built-in Prisma connection pooling

---

## Database Schema

### 1. Users Table

Stores user account information with authentication credentials.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_verified ON users(is_verified);
```

**Fields:**
- `id`: Unique identifier (UUID)
- `email`: User's email address (unique, used for login)
- `password_hash`: Bcrypt hashed password
- `first_name`: User's first name (optional)
- `last_name`: User's last name (optional)
- `is_verified`: Email verification status
- `is_active`: Account active status (for soft deletion)
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp
- `last_login`: Last successful login timestamp

---

### 2. Email Verification Tokens Table

Stores tokens for email verification during registration.

```sql
CREATE TABLE email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP,
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_verification_token ON email_verification_tokens(token);
CREATE INDEX idx_verification_user_id ON email_verification_tokens(user_id);
CREATE INDEX idx_verification_expires_at ON email_verification_tokens(expires_at);
```

**Fields:**
- `id`: Unique identifier
- `user_id`: Reference to users table
- `token`: Unique verification token (sent via email)
- `expires_at`: Token expiration time (24 hours from creation)
- `created_at`: Token creation timestamp
- `used_at`: When token was used (NULL if not used)

---

### 3. Password Reset Tokens Table

Stores tokens for password recovery functionality.

```sql
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP,
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_reset_token ON password_reset_tokens(token);
CREATE INDEX idx_reset_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_reset_expires_at ON password_reset_tokens(expires_at);
```

**Fields:**
- `id`: Unique identifier
- `user_id`: Reference to users table
- `token`: Unique reset token (sent via email)
- `expires_at`: Token expiration time (1 hour from creation)
- `created_at`: Token creation timestamp
- `used_at`: When token was used (NULL if not used)

---

### 4. Refresh Tokens Table

Stores JWT refresh tokens for authentication.

```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP,
  replaced_by_token VARCHAR(500),
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_refresh_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_expires_at ON refresh_tokens(expires_at);
```

**Fields:**
- `id`: Unique identifier
- `user_id`: Reference to users table
- `token`: JWT refresh token
- `expires_at`: Token expiration time (7 days from creation)
- `created_at`: Token creation timestamp
- `revoked_at`: When token was revoked (NULL if active)
- `replaced_by_token`: New token if this was rotated

---

### 5. User Projects Table (Future)

Stores user's research projects and saved literature reviews.

```sql
CREATE TABLE user_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  research_abstract TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_projects_user_id ON user_projects(user_id);
CREATE INDEX idx_projects_created_at ON user_projects(created_at);
```

---

### 6. Saved Papers Table (Future)

Stores papers saved by users from their literature reviews.

```sql
CREATE TABLE saved_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES user_projects(id) ON DELETE CASCADE,
  paper_title VARCHAR(500) NOT NULL,
  paper_authors TEXT,
  paper_year INTEGER,
  paper_venue VARCHAR(255),
  paper_abstract TEXT,
  paper_url VARCHAR(500),
  category VARCHAR(10), -- 'C1' or 'C2'
  score DECIMAL(4,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES user_projects(id) ON DELETE CASCADE
);

CREATE INDEX idx_saved_papers_user_id ON saved_papers(user_id);
CREATE INDEX idx_saved_papers_project_id ON saved_papers(project_id);
```

---

## Security Considerations

### Password Storage
- Passwords are hashed using **bcrypt** with a cost factor of 12
- Never store plain text passwords
- Password hash is never returned in API responses

### Token Security
- **Access Tokens**: Short-lived JWT (15 minutes)
- **Refresh Tokens**: Longer-lived (7 days), stored in database
- **Email Verification Tokens**: 24-hour expiration
- **Password Reset Tokens**: 1-hour expiration
- All tokens use cryptographically secure random generation

### Email Verification
- Users cannot access protected resources until email is verified
- Verification tokens are single-use
- Expired tokens are automatically rejected

### Password Reset
- Reset tokens are single-use and expire quickly (1 hour)
- Old tokens are invalidated when new ones are requested
- Reset link sent only to registered email addresses

---

## Database Migrations

### Setup Prisma

```bash
cd literature-review-backend
npm install prisma @prisma/client
npx prisma init
```

### Create Migration

```bash
npx prisma migrate dev --name init
```

### Apply Migration

```bash
npx prisma migrate deploy
```

### Generate Prisma Client

```bash
npx prisma generate
```

---

## Environment Variables

Add to `.env`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/literature_review?schema=public"

# JWT Secrets
JWT_ACCESS_SECRET="your-super-secret-access-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"

# Token Expiration
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# Email Configuration (for verification and password reset)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
EMAIL_FROM="noreply@literaturereview.com"

# Frontend URL (for email links)
FRONTEND_URL="http://localhost:3000"
```

---

## Data Retention and Cleanup

### Automatic Cleanup Tasks

Implement scheduled tasks to clean up expired tokens:

```sql
-- Delete expired verification tokens (run daily)
DELETE FROM email_verification_tokens 
WHERE expires_at < NOW() AND used_at IS NULL;

-- Delete expired password reset tokens (run daily)
DELETE FROM password_reset_tokens 
WHERE expires_at < NOW() AND used_at IS NULL;

-- Delete expired refresh tokens (run daily)
DELETE FROM refresh_tokens 
WHERE expires_at < NOW() OR revoked_at IS NOT NULL;
```

---

## Backup Strategy

1. **Daily automated backups** of the entire database
2. **Point-in-time recovery** enabled
3. **Backup retention**: 30 days
4. **Test restore procedure** monthly

---

## Performance Optimization

### Indexes
- All foreign keys are indexed
- Email lookups are indexed
- Token lookups are indexed
- Timestamp fields for filtering are indexed

### Connection Pooling
- Prisma handles connection pooling automatically
- Configure pool size based on application load

### Query Optimization
- Use prepared statements (Prisma does this automatically)
- Avoid N+1 queries with Prisma's include/select
- Use pagination for large result sets

---

## Future Enhancements

1. **User Preferences Table**: Store user settings and preferences
2. **Audit Log Table**: Track important user actions
3. **API Usage Table**: Track API usage per user for rate limiting
4. **Collaboration Tables**: Share projects with other users
5. **Paper Collections**: Organize saved papers into collections
6. **Search History**: Store user's search history

---

## Prisma Schema Reference

See `literature-review-backend/prisma/schema.prisma` for the complete Prisma schema definition.
