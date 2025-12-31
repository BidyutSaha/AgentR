# Archived Documentation

This directory contains **48 legacy documentation files** that have been consolidated into the 10 core documentation files.

**Archived on**: 2025-12-31

---

## Why These Files Were Archived

As part of the production-ready cleanup (following `rules.md` Section 4.3 - Anti-Sprawl Rule), all scattered documentation has been consolidated into 10 core files:

1. `00_PROJECT_STATUS.md` - Project status (replaces STATUS.md, UPDATE_SUMMARY.md, etc.)
2. `01_SETUP.md` - Setup guide (replaces SETUP.md, ENV_SETUP.md, QUICK_START.md, etc.)
3. `02_ARCHITECTURE.md` - Architecture (replaces ARCHITECTURE.md, context_*.md)
4. `03_API.md` - API reference (replaces api_*.md, TEST_API.md, USER_PROJECTS_API.md, etc.)
5. `04_DATABASE.md` - Database docs (replaces DATABASE.md, DATABASE_TABLES_GUIDE.md, etc.)
6. `05_WORKFLOWS.md` - Workflows (replaces HOW_USERID_WORKS.md, TOKEN_STORAGE_EXPLAINED.md, etc.)
7. `06_DECISIONS.md` - Architecture decisions (new)
8. `07_TROUBLESHOOTING.md` - Troubleshooting (replaces TROUBLESHOOTING.md, FIX_*.md)
9. `08_TESTING.md` - Testing guide (replaces TESTING_DOCS_UPDATED.md, PROJECTS_TESTING_CREATED.md)
10. `09_DEPLOYMENT.md` - Deployment guide (new)

---

## Archived Files (48 total)

### Architecture & Context
- ARCHITECTURE.md → 02_ARCHITECTURE.md
- context_full.md → 02_ARCHITECTURE.md
- context_mvp.md → 02_ARCHITECTURE.md
- FRONTEND.md → 02_ARCHITECTURE.md
- idea.md → 02_ARCHITECTURE.md

### API Documentation
- api_full.md → 03_API.md
- api_mvp.md → 03_API.md
- TEST_API.md → 03_API.md
- USER_PROJECTS_API.md → 03_API.md
- PROJECTS_API_SUMMARY.md → 03_API.md
- AUTH_API_COMPLETE.md → 03_API.md

### Authentication
- AUTHENTICATION.md → 03_API.md + 05_WORKFLOWS.md
- AUTH_IMPLEMENTATION_PROGRESS.md → 00_PROJECT_STATUS.md
- AUTH_PHASE1_COMPLETE.md → 00_PROJECT_STATUS.md
- AUTH_PROGRESS_70PERCENT.md → 00_PROJECT_STATUS.md
- AUTH_SERVICES_COMPLETE.md → 00_PROJECT_STATUS.md
- EMAIL_VERIFICATION_REQUIRED.md → 05_WORKFLOWS.md
- FIX_EMAIL_VERIFICATION.md → 07_TROUBLESHOOTING.md
- FIX_EMAIL_VERIFICATION_LINK.md → 07_TROUBLESHOOTING.md
- TOKEN_STORAGE_EXPLAINED.md → 05_WORKFLOWS.md

### Database
- DATABASE.md → 04_DATABASE.md
- DATABASE_SETUP_COMPLETE.md → 01_SETUP.md
- DATABASE_TABLES_GUIDE.md → 04_DATABASE.md
- DBEAVER_SETUP.md → 01_SETUP.md
- DB_TABLES_CREATED.md → 04_DATABASE.md

### Setup & Environment
- SETUP.md → 01_SETUP.md
- SETUP_COMPLETE.md → 01_SETUP.md
- ENV_FILE_GUIDE.md → 01_SETUP.md
- ENV_SETUP.md → 01_SETUP.md
- QUICK_START.md → 01_SETUP.md
- RUNNING_THE_SERVER.md → 01_SETUP.md

### Testing
- TESTING_DOCS_UPDATED.md → 08_TESTING.md
- PROJECTS_TESTING_CREATED.md → 08_TESTING.md

### Implementation Progress
- IMPLEMENTATION_PLAN.md → 00_PROJECT_STATUS.md
- UPDATE_SUMMARY.md → 00_PROJECT_STATUS.md
- STATUS.md → 00_PROJECT_STATUS.md
- PAPER_SCORING_COMPLETE.md → 00_PROJECT_STATUS.md
- ENDPOINT_NAMES_UPDATED.md → 00_PROJECT_STATUS.md
- NAMING_CONVENTION_UPDATE.md → 00_PROJECT_STATUS.md

### Features & Guides
- GET_PROJECTS_BY_USERID.md → 03_API.md
- HOW_USERID_WORKS.md → 05_WORKFLOWS.md
- PROMPTS_GUIDE.md → (LLM implementation details)
- OPENAI_MODEL_PRICING.md → (Reference material)
- STAGE2_QUERIES_EXPLAINED.md → 03_API.md
- STAGE5_IMPLEMENTATION.md → 03_API.md
- README_BACKEND.md → 01_SETUP.md
- README_STAGE5.md → 03_API.md

### Troubleshooting
- TROUBLESHOOTING.md → 07_TROUBLESHOOTING.md

---

## Can I Delete These Files?

**Not recommended** for now. Keep them archived for:
- Historical reference
- Recovering specific details if needed
- Audit trail of project evolution

**Future cleanup**: After 6 months of using the new documentation structure, these can be safely deleted if no longer needed.

---

## How to Find Information Now

Instead of searching through 48 files, use the 10 core files:

| Looking for... | Check this file |
|----------------|-----------------|
| Current project status | `00_PROJECT_STATUS.md` |
| How to set up | `01_SETUP.md` |
| System architecture | `02_ARCHITECTURE.md` |
| API endpoints | `03_API.md` |
| Database schema | `04_DATABASE.md` |
| How workflows work | `05_WORKFLOWS.md` |
| Why we made decisions | `06_DECISIONS.md` |
| Fixing issues | `07_TROUBLESHOOTING.md` |
| Testing | `08_TESTING.md` |
| Deployment | `09_DEPLOYMENT.md` |

---

**For the new documentation structure, see the parent directory (`documentation/`)**
