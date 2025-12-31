# LLM-Driven Literature Review System

A full-stack intelligent system for automated literature review and research gap discovery using LLM technology, with user authentication, PostgreSQL database, and responsive React frontend.

## 🌟 Features

- ✅ **User Authentication**: Secure registration, email verification, JWT tokens, password recovery
- ✅ **Literature Review Pipeline**: Multi-stage LLM-driven paper analysis
- ✅ **Research Gap Discovery**: Automated gap identification and novelty analysis
- ✅ **Responsive Frontend**: Modern React UI that works on all devices
- ✅ **PostgreSQL Database**: Secure data persistence
- ✅ **RESTful API**: Well-documented backend API

## ⚠️ **IMPORTANT: Project Rules & Standards**

**All contributors and AI assistants (including Antigravity) MUST follow [`rules.md`](./rules.md)**

This project enforces strict quality standards:
- ✅ **Comprehensive API documentation** with input/output schemas, samples, and error cases
- ✅ **Database ER diagram** (MANDATORY - updated with ANY schema change)
- ✅ **Post-Implementation Checklist** (9 categories verified for every change)
- ✅ **Naming conventions** (semantic naming, no vague names)
- ✅ **Testing standards** (minimum 70% coverage)
- ✅ **Documentation-first** approach (single source of truth)

**Key Files:**
- [`rules.md`](./rules.md) - Complete project rules and standards
- [`MIGRATION_GUIDE.md`](./MIGRATION_GUIDE.md) - How to bring existing code into compliance
- [`.antigravity`](./.antigravity) - Antigravity configuration

**For Antigravity users**: Configure Antigravity to use `rules.md` as custom rules file.

## 🚀 Quick Start

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd literature-review-backend
   npm install
   ```

2. **Setup Database**
   ```bash
   # Install PostgreSQL 14+ if not already installed
   # Create database
   createdb literature_review
   
   # Setup Prisma
   npx prisma generate
   npx prisma migrate dev --name init
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env and add:
   # - DATABASE_URL
   # - OPENAI_API_KEY
   # - JWT secrets
   # - SMTP credentials
   ```

4. **Start Backend**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd literature-review-frontend
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env and set VITE_API_URL
   ```

3. **Start Frontend**
   ```bash
   npm run dev
   ```

4. **Access Application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`

## 📁 Project Structure

```
Paper Agent/
├── documentation/              ← All documentation files
│   ├── testing/               ← Testing guides
│   │   ├── TESTING_STAGE1.md
│   │   ├── TESTING_STAGE2.md
│   │   └── TESTING_AUTH.md    ← NEW: Auth testing
│   ├── STATUS.md              ← Current progress
│   ├── SETUP.md               ← Setup instructions
│   ├── DATABASE.md            ← NEW: Database schema
│   ├── AUTHENTICATION.md      ← NEW: Auth system
│   ├── FRONTEND.md            ← NEW: Frontend docs
│   └── ...
│
├── literature-review-backend/  ← Backend API
│   ├── prisma/                ← Database schema & migrations
│   ├── src/
│   │   ├── services/          ← Business logic
│   │   │   ├── auth/          ← NEW: Auth services
│   │   │   ├── intent/
│   │   │   ├── queries/
│   │   │   └── ...
│   │   ├── controllers/       ← API handlers
│   │   ├── routes/            ← Route definitions
│   │   ├── middlewares/       ← Auth, validation, etc.
│   │   └── ...
│   └── ...
│
└── literature-review-frontend/ ← NEW: React frontend
    ├── src/
    │   ├── pages/             ← Page components
    │   ├── components/        ← Reusable components
    │   ├── context/           ← React Context (Auth, Theme)
    │   ├── services/          ← API integration
    │   └── ...
    └── ...
```

## 📊 Current Status

**Completed:**
- ✅ Stage 1: Intent Decomposition
- ✅ Stage 2: Query Generation
- ✅ Paper Scoring (Merged Stages 5+6+7)

**In Progress:**
- 🔄 User Authentication System
- 🔄 PostgreSQL Database Integration
- 🔄 Responsive React Frontend

**Next Up:**
- ⚪ Stage 3: Paper Retrieval (arXiv + Semantic Scholar)
- ⚪ Stage 4: Filtering
- ⚪ User Dashboard
- ⚪ Project Management

See `documentation/STATUS.md` for detailed progress.

## 📚 Documentation

All documentation is in the `documentation/` folder:

### Core Documentation
- **[idea.md](documentation/idea.md)** - System concept and architecture
- **[context_mvp.md](documentation/context_mvp.md)** - Technical context and stack
- **[api_mvp.md](documentation/api_mvp.md)** - API specifications

### New: Authentication & Database
- **[AUTHENTICATION.md](documentation/AUTHENTICATION.md)** - Auth system guide
- **[DATABASE.md](documentation/DATABASE.md)** - Database schema and migrations
- **[FRONTEND.md](documentation/FRONTEND.md)** - Frontend architecture

### Setup & Testing
- **[SETUP.md](documentation/SETUP.md)** - Setup and installation
- **[STATUS.md](documentation/STATUS.md)** - Project progress tracker
- **[TEST_API.md](documentation/TEST_API.md)** - Complete API reference
- **[testing/TESTING_STAGE1.md](documentation/testing/TESTING_STAGE1.md)** - Stage 1 testing
- **[testing/TESTING_STAGE2.md](documentation/testing/TESTING_STAGE2.md)** - Stage 2 testing
- **[testing/TESTING_AUTH.md](documentation/testing/TESTING_AUTH.md)** - Auth testing (coming soon)

### Reference
- **[OPENAI_MODEL_PRICING.md](documentation/OPENAI_MODEL_PRICING.md)** - Model costs

## 🎯 API Endpoints

### Authentication (Public)

```bash
# Register
POST /v1/auth/register
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}

# Login
POST /v1/auth/login
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

# Verify Email
GET /v1/auth/verify-email?token={token}

# Forgot Password
POST /v1/auth/forgot-password
{
  "email": "user@example.com"
}

# Reset Password
POST /v1/auth/reset-password
{
  "token": "reset-token",
  "newPassword": "NewPassword123!"
}
```

### Literature Review (Protected - Requires Authentication)

```bash
# Add Authorization header: Bearer {accessToken}

# Stage 1: Intent Decomposition
POST /v1/stages/intent
{
  "abstract": "Your research abstract..."
}

# Stage 2: Query Generation
POST /v1/stages/queries
{
  "stage1Output": { ...Stage 1 response... }
}

# Paper Scoring
POST /v1/stages/score
{
  "userAbstract": "...",
  "candidateAbstract": "..."
}
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js + TypeScript + Express
- **Database**: PostgreSQL 14+ with Prisma ORM
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **Validation**: Zod
- **LLM**: OpenAI (GPT-4o, GPT-4o-mini)
- **Email**: Nodemailer (SMTP)
- **Logging**: Pino

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State**: React Context API + hooks
- **Forms**: React Hook Form + Zod
- **Styling**: CSS Modules + Modern CSS
- **HTTP**: Axios

### Architecture
- RESTful API with JWT authentication
- Stateless backend with database persistence
- Responsive, mobile-first frontend
- Secure password hashing and token management

## 📝 License

MIT

---

**For detailed documentation, see the `documentation/` folder.**
