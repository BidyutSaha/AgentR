# System Architecture Overview

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │         React Frontend (Port 3000)                        │ │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │ │
│  │  │   Public    │  │  Protected   │  │   Components    │  │ │
│  │  │   Pages     │  │   Pages      │  │   & Layouts     │  │ │
│  │  │             │  │              │  │                 │  │ │
│  │  │ - Landing   │  │ - Dashboard  │  │ - Button        │  │ │
│  │  │ - Login     │  │ - Projects   │  │ - Input         │  │ │
│  │  │ - Register  │  │ - Settings   │  │ - Card          │  │ │
│  │  │ - Verify    │  │ - Lit Review │  │ - Header        │  │ │
│  │  └─────────────┘  └──────────────┘  └─────────────────┘  │ │
│  │                                                           │ │
│  │  ┌────────────────────────────────────────────────────┐  │ │
│  │  │         AuthContext (JWT Token Management)         │  │ │
│  │  └────────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/HTTPS
                              │ Axios API Calls
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Express Backend (Port 5000)                  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    Middleware Layer                       │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │ │
│  │  │ Request  │  │   Auth   │  │   Rate   │  │  Error   │  │ │
│  │  │ Logger   │  │  (JWT)   │  │  Limit   │  │ Handler  │  │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                      Routes Layer                         │ │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │ │
│  │  │    Auth     │  │  Dashboard   │  │     Stages      │  │ │
│  │  │   Routes    │  │   Routes     │  │    Routes       │  │ │
│  │  │  (Public)   │  │ (Protected)  │  │  (Protected)    │  │ │
│  │  └─────────────┘  └──────────────┘  └─────────────────┘  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                   Controllers Layer                       │ │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │ │
│  │  │    Auth     │  │  Dashboard   │  │     Stages      │  │ │
│  │  │ Controller  │  │  Controller  │  │   Controller    │  │ │
│  │  └─────────────┘  └──────────────┘  └─────────────────┘  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    Services Layer                         │ │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │ │
│  │  │    Auth     │  │   Intent     │  │    Queries      │  │ │
│  │  │  Services   │  │   Service    │  │    Service      │  │ │
│  │  │             │  │              │  │                 │  │ │
│  │  │ - Password  │  │ - Decompose  │  │ - Generate      │  │ │
│  │  │ - Token     │  │ - Extract    │  │ - Expand        │  │ │
│  │  │ - Email     │  │              │  │                 │  │ │
│  │  └─────────────┘  └──────────────┘  └─────────────────┘  │ │
│  │                                                           │ │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │ │
│  │  │  Retrieval  │  │   Filter     │  │     Score       │  │ │
│  │  │   Service   │  │   Service    │  │    Service      │  │ │
│  │  │             │  │              │  │                 │  │ │
│  │  │ - arXiv     │  │ - Quality    │  │ - Semantic      │  │ │
│  │  │ - Semantic  │  │ - Recency    │  │ - Category      │  │ │
│  │  │   Scholar   │  │ - Venue      │  │ - Gap Analysis  │  │ │
│  │  └─────────────┘  └──────────────┘  └─────────────────┘  │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
        ┌───────────────────┐  ┌───────────────────┐
        │   PostgreSQL      │  │   OpenAI API      │
        │   Database        │  │                   │
        │                   │  │ - GPT-4o          │
        │ - Users           │  │ - GPT-4o-mini     │
        │ - Tokens          │  │ - Embeddings      │
        │ - Projects        │  └───────────────────┘
        │ - Papers          │
        └───────────────────┘
                    │
                    ▼
        ┌───────────────────┐
        │   Email Service   │
        │   (SMTP)          │
        │                   │
        │ - Verification    │
        │ - Password Reset  │
        │ - Notifications   │
        └───────────────────┘
```

---

## Authentication Flow

```
┌──────────┐                                    ┌──────────┐
│  User    │                                    │ Backend  │
└────┬─────┘                                    └────┬─────┘
     │                                               │
     │  1. POST /auth/register                      │
     │  { email, password, firstName, lastName }    │
     ├──────────────────────────────────────────────>│
     │                                               │
     │                                               │ 2. Hash password
     │                                               │    Create user
     │                                               │    Generate token
     │                                               │
     │  3. User created, verification email sent    │
     │<──────────────────────────────────────────────┤
     │                                               │
     │                                               │
     │  4. Click verification link in email         │
     │  GET /auth/verify-email?token=xxx            │
     ├──────────────────────────────────────────────>│
     │                                               │
     │                                               │ 5. Verify token
     │                                               │    Mark user verified
     │                                               │
     │  6. Email verified successfully              │
     │<──────────────────────────────────────────────┤
     │                                               │
     │                                               │
     │  7. POST /auth/login                         │
     │  { email, password }                         │
     ├──────────────────────────────────────────────>│
     │                                               │
     │                                               │ 8. Verify password
     │                                               │    Generate tokens
     │                                               │
     │  9. { accessToken, refreshToken }            │
     │<──────────────────────────────────────────────┤
     │                                               │
     │                                               │
     │  10. Store tokens in frontend                │
     │      Access protected resources              │
     │                                               │
```

---

## Protected Route Flow

```
┌──────────┐                                    ┌──────────┐
│ Frontend │                                    │ Backend  │
└────┬─────┘                                    └────┬─────┘
     │                                               │
     │  1. POST /stages/intent                      │
     │  Authorization: Bearer {accessToken}         │
     ├──────────────────────────────────────────────>│
     │                                               │
     │                                               │ 2. Verify JWT
     │                                               │    Check expiration
     │                                               │    Extract user ID
     │                                               │
     │                                               ├─ Valid?
     │                                               │
     │                                               │ 3. Process request
     │                                               │    Return response
     │                                               │
     │  4. { data, meta }                           │
     │<──────────────────────────────────────────────┤
     │                                               │
     │                                               │
     │  ─── If token expired ───                    │
     │                                               │
     │  5. POST /auth/refresh                       │
     │  { refreshToken }                            │
     ├──────────────────────────────────────────────>│
     │                                               │
     │                                               │ 6. Verify refresh token
     │                                               │    Generate new tokens
     │                                               │
     │  7. { accessToken, refreshToken }            │
     │<──────────────────────────────────────────────┤
     │                                               │
     │  8. Retry original request                   │
     │  Authorization: Bearer {newAccessToken}      │
     ├──────────────────────────────────────────────>│
     │                                               │
```

---

## Password Reset Flow

```
┌──────────┐                                    ┌──────────┐
│  User    │                                    │ Backend  │
└────┬─────┘                                    └────┬─────┘
     │                                               │
     │  1. POST /auth/forgot-password               │
     │  { email }                                   │
     ├──────────────────────────────────────────────>│
     │                                               │
     │                                               │ 2. Find user
     │                                               │    Generate token
     │                                               │    Send email
     │                                               │
     │  3. Reset email sent (if user exists)        │
     │<──────────────────────────────────────────────┤
     │                                               │
     │                                               │
     │  4. Click reset link in email                │
     │  Navigate to /reset-password?token=xxx       │
     │                                               │
     │                                               │
     │  5. POST /auth/reset-password                │
     │  { token, newPassword }                      │
     ├──────────────────────────────────────────────>│
     │                                               │
     │                                               │ 6. Verify token
     │                                               │    Hash new password
     │                                               │    Update user
     │                                               │    Revoke all tokens
     │                                               │
     │  7. Password reset successful                │
     │<──────────────────────────────────────────────┤
     │                                               │
```

---

## Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│                          USERS                              │
├─────────────────────────────────────────────────────────────┤
│ id              UUID      PK                                │
│ email           VARCHAR   UNIQUE                            │
│ password_hash   VARCHAR                                     │
│ first_name      VARCHAR   NULL                             │
│ last_name       VARCHAR   NULL                             │
│ is_verified     BOOLEAN   DEFAULT false                    │
│ is_active       BOOLEAN   DEFAULT true                     │
│ created_at      TIMESTAMP DEFAULT now()                    │
│ updated_at      TIMESTAMP DEFAULT now()                    │
│ last_login      TIMESTAMP NULL                             │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
│ EMAIL_VERIFICATION    │ │ PASSWORD_RESET        │ │ REFRESH_TOKENS        │
│ _TOKENS               │ │ _TOKENS               │ │                       │
├───────────────────────┤ ├───────────────────────┤ ├───────────────────────┤
│ id         UUID    PK │ │ id         UUID    PK │ │ id         UUID    PK │
│ user_id    UUID    FK │ │ user_id    UUID    FK │ │ user_id    UUID    FK │
│ token      VARCHAR    │ │ token      VARCHAR    │ │ token      VARCHAR    │
│ expires_at TIMESTAMP  │ │ expires_at TIMESTAMP  │ │ expires_at TIMESTAMP  │
│ created_at TIMESTAMP  │ │ created_at TIMESTAMP  │ │ created_at TIMESTAMP  │
│ used_at    TIMESTAMP  │ │ used_at    TIMESTAMP  │ │ revoked_at TIMESTAMP  │
│            NULL       │ │            NULL       │ │            NULL       │
└───────────────────────┘ └───────────────────────┘ └───────────────────────┘

Future Tables:
┌───────────────────────┐     ┌───────────────────────┐
│ USER_PROJECTS         │     │ SAVED_PAPERS          │
├───────────────────────┤     ├───────────────────────┤
│ id         UUID    PK │     │ id         UUID    PK │
│ user_id    UUID    FK │     │ user_id    UUID    FK │
│ title      VARCHAR    │     │ project_id UUID    FK │
│ description TEXT      │     │ paper_title VARCHAR   │
│ research_  TEXT       │     │ paper_authors TEXT    │
│   abstract            │     │ category   VARCHAR    │
│ created_at TIMESTAMP  │     │ score      DECIMAL    │
│ updated_at TIMESTAMP  │     │ notes      TEXT       │
└───────────────────────┘     └───────────────────────┘
```

---

## Frontend Component Hierarchy

```
App
├── AuthProvider (Context)
│   └── Router
│       ├── Public Routes
│       │   ├── LandingPage
│       │   ├── LoginPage
│       │   │   └── LoginForm
│       │   │       ├── Input (email)
│       │   │       ├── Input (password)
│       │   │       └── Button (submit)
│       │   ├── RegisterPage
│       │   │   └── RegisterForm
│       │   │       ├── Input (email)
│       │   │       ├── Input (password)
│       │   │       ├── Input (confirmPassword)
│       │   │       └── Button (submit)
│       │   ├── VerifyEmailPage
│       │   ├── ForgotPasswordPage
│       │   │   └── ForgotPasswordForm
│       │   └── ResetPasswordPage
│       │       └── ResetPasswordForm
│       │
│       └── Protected Routes (ProtectedRoute wrapper)
│           ├── Layout
│           │   ├── Header
│           │   ├── Sidebar
│           │   └── Footer
│           │
│           ├── DashboardPage
│           │   ├── StatsCard
│           │   ├── ProjectCard
│           │   └── QuickActions
│           │
│           ├── LiteratureReviewPage
│           │   ├── SearchForm
│           │   ├── ResultsList
│           │   └── PaperDetails
│           │
│           ├── ProjectsPage
│           │   ├── ProjectList
│           │   └── ProjectCard
│           │
│           └── SettingsPage
│               ├── ProfileSettings
│               └── PasswordChange
```

---

## API Endpoint Map

```
/v1
├── /health (GET) - Health check
│
├── /auth (Public)
│   ├── /register (POST) - User registration
│   ├── /login (POST) - User login
│   ├── /verify-email (GET) - Email verification
│   ├── /resend-verification (POST) - Resend verification
│   ├── /forgot-password (POST) - Request password reset
│   ├── /reset-password (POST) - Reset password
│   ├── /change-password (POST) - Change password [Protected]
│   ├── /refresh (POST) - Refresh access token
│   └── /logout (POST) - Logout [Protected]
│
├── /dashboard [Protected]
│   ├── /profile (GET) - Get user profile
│   ├── /profile (PUT) - Update user profile
│   └── /stats (GET) - Get user statistics
│
└── /stages [Protected]
    ├── /intent (POST) - Stage 1: Intent decomposition
    ├── /queries (POST) - Stage 2: Query generation
    ├── /retrieve (POST) - Stage 3: Paper retrieval
    ├── /filter (POST) - Stage 4: Filtering
    └── /score (POST) - Paper scoring (merged 5+6+7)
```

---

## Technology Stack Layers

```
┌─────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                     │
│                                                             │
│  React 18 + TypeScript                                     │
│  ├── React Router v6 (Routing)                             │
│  ├── React Context API (State Management)                  │
│  ├── React Hook Form (Forms)                               │
│  ├── Zod (Validation)                                      │
│  └── CSS Modules (Styling)                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Axios HTTP Client
                              │
┌─────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                      │
│                                                             │
│  Node.js + TypeScript + Express                            │
│  ├── Controllers (Request Handling)                        │
│  ├── Services (Business Logic)                             │
│  ├── Middlewares (Auth, Validation, Logging)               │
│  └── Routes (API Endpoints)                                │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
┌───────────────────────────┐  ┌───────────────────────────┐
│     DATA LAYER            │  │   EXTERNAL SERVICES       │
│                           │  │                           │
│  PostgreSQL + Prisma      │  │  OpenAI API               │
│  ├── User Management      │  │  ├── GPT-4o               │
│  ├── Token Management     │  │  ├── GPT-4o-mini          │
│  ├── Project Storage      │  │  └── Embeddings           │
│  └── Paper Storage        │  │                           │
│                           │  │  Email Service (SMTP)     │
│                           │  │  ├── Verification         │
│                           │  │  └── Password Reset       │
└───────────────────────────┘  └───────────────────────────┘
```

---

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND SECURITY                      │
│                                                             │
│  ✓ Input validation (Zod)                                  │
│  ✓ XSS prevention (React escaping)                         │
│  ✓ Secure token storage                                    │
│  ✓ HTTPS only (production)                                 │
│  ✓ CORS configuration                                      │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND SECURITY                       │
│                                                             │
│  ✓ JWT authentication                                      │
│  ✓ bcrypt password hashing (cost: 12)                      │
│  ✓ Rate limiting                                           │
│  ✓ Input validation (Zod)                                  │
│  ✓ SQL injection prevention (Prisma)                       │
│  ✓ CORS configuration                                      │
│  ✓ Secure token generation                                 │
│  ✓ Token expiration & rotation                             │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     DATABASE SECURITY                       │
│                                                             │
│  ✓ Encrypted connections                                   │
│  ✓ Password hashes only (never plain text)                 │
│  ✓ Token hashing                                           │
│  ✓ Cascade deletes                                         │
│  ✓ Indexes for performance                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Development Workflow

```
Developer
    │
    ├─── Backend Development
    │    │
    │    ├─ 1. Write code in src/
    │    ├─ 2. npm run dev (start server)
    │    ├─ 3. Test with Postman
    │    ├─ 4. Check logs (Pino)
    │    ├─ 5. Use Prisma Studio (database GUI)
    │    └─ 6. Commit changes
    │
    └─── Frontend Development
         │
         ├─ 1. Write code in src/
         ├─ 2. npm run dev (start Vite)
         ├─ 3. Test in browser
         ├─ 4. Check console for errors
         ├─ 5. Test responsive design
         └─ 6. Commit changes
```

---

## Deployment Architecture (Future)

```
┌─────────────────────────────────────────────────────────────┐
│                         USERS                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      CDN / Cloudflare                       │
│                    (Static Assets, DDoS)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
┌───────────────────────────┐  ┌───────────────────────────┐
│   Frontend (Vercel/       │  │   Backend (Railway/       │
│   Netlify)                │  │   Render/Heroku)          │
│                           │  │                           │
│  - React build            │  │  - Node.js app            │
│  - Static hosting         │  │  - Express server         │
│  - Auto SSL               │  │  - Auto SSL               │
└───────────────────────────┘  └───────────────────────────┘
                                              │
                                    ┌─────────┴─────────┐
                                    │                   │
                                    ▼                   ▼
                        ┌───────────────────┐  ┌───────────────────┐
                        │  PostgreSQL       │  │  Email Service    │
                        │  (Supabase/       │  │  (SendGrid/       │
                        │   Neon)           │  │   AWS SES)        │
                        └───────────────────┘  └───────────────────┘
```

---

This architecture provides a complete, secure, and scalable full-stack application for literature review and research gap discovery.
