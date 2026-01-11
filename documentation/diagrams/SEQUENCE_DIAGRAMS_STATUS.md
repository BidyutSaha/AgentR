# Sequence Diagrams - Complete List

**Location**: `documentation/diagrams/sequences/`  
**Format**: PlantUML (`.puml`)  
**Total Diagrams**: 18  
**Last Updated**: 2026-01-11

---

## ✅ Created Diagrams (18/18) - COMPLETE!

### Auth Flows (5/5) ✅
1. ✅ **user-registration-sequence.puml** - User registration with email verification and default credits
2. ✅ **login-token-sequence.puml** - Login flow with JWT token generation
3. ✅ **token-refresh-sequence.puml** - Token refresh flow with token rotation
4. ✅ **password-reset-sequence.puml** - Two-step password reset flow
5. ✅ **email-verification-sequence.puml** - Email verification flow

### LLM Processing (3/3) ✅ ⭐ NEW
6. ✅ **intent-decomposition-sequence.puml** - Stage 1: Intent decomposition with OpenAI
7. ✅ **query-generation-sequence.puml** - Stage 2: Query generation with OpenAI
8. ✅ **paper-scoring-sequence.puml** - Stage 3: Paper scoring with OpenAI

### Core Workflows (4/4) ✅
9. ✅ **project-creation-sequence.puml** - Project creation with background job
10. ✅ **paper-addition-sequence.puml** - Paper addition with scoring job
11. ✅ **bulk-paper-upload-sequence.puml** - Bulk CSV upload with parallel processing
12. ✅ **project-export-sequence.puml** - Project export to Excel

### Credits & Billing (3/3) ✅
13. ✅ **credits-deduction-sequence.puml** - Atomic credits deduction transaction
14. ✅ **admin-credit-recharge-sequence.puml** - Admin credit recharge with audit trail
15. ✅ **llm-usage-tracking-sequence.puml** - LLM usage tracking (USD and Credits)

### Jobs (2/2) ✅
16. ✅ **job-retry-sequence.puml** - Job retry and resume flow with resilience
17. ✅ **job-monitoring-sequence.puml** - Job status monitoring with filtering

### Admin (1/1) ✅
18. ✅ **config-update-sequence.puml** - Configuration update (Type 2 SCD)

---

## 📁 Directory Structure

```
documentation/diagrams/sequences/
├── auth/
│   ├── user-registration-sequence.puml ✅
│   ├── login-token-sequence.puml ✅
│   ├── token-refresh-sequence.puml ✅
│   ├── password-reset-sequence.puml ✅
│   └── email-verification-sequence.puml ✅
├── llm/
│   ├── intent-decomposition-sequence.puml ✅
│   ├── query-generation-sequence.puml ✅
│   └── paper-scoring-sequence.puml ✅
├── core/
│   ├── project-creation-sequence.puml ✅
│   ├── paper-addition-sequence.puml ✅
│   ├── bulk-paper-upload-sequence.puml ✅
│   └── project-export-sequence.puml ✅
├── credits/
│   ├── credits-deduction-sequence.puml ✅
│   ├── admin-credit-recharge-sequence.puml ✅
│   └── llm-usage-tracking-sequence.puml ✅
├── jobs/
│   ├── job-retry-sequence.puml ✅
│   └── job-monitoring-sequence.puml ✅
└── admin/
    └── config-update-sequence.puml ✅
```

---

## 📊 Diagram Statistics

| Category | Created | Remaining | Total |
|----------|---------|-----------|-------|
| Auth | 5 | 0 | 5 |
| LLM | 3 | 0 | 3 |
| Core | 4 | 0 | 4 |
| Credits | 3 | 0 | 3 |
| Jobs | 2 | 0 | 2 |
| Admin | 1 | 0 | 1 |
| **Total** | **18** | **0** | **18** |

**Completion**: 100% ✅ ALL DIAGRAMS COMPLETE!

---

## 🎉 All Sequence Diagrams Created!

All 18 sequence diagrams have been successfully created, covering:
- ✅ Complete authentication flows
- ✅ All 3 LLM processing stages
- ✅ Core workflows (project, paper, export)
- ✅ Credits & billing system
- ✅ Background job management
- ✅ Admin configuration

**No remaining work for sequence diagrams!**

---

## 🔍 How to View Diagrams

### Option 1: VS Code with PlantUML Extension
1. Install "PlantUML" extension by jebbs
2. Open any `.puml` file
3. Press `Alt+D` to preview

### Option 2: Online Viewer
1. Copy `.puml` file content
2. Go to https://www.plantuml.com/plantuml/uml/
3. Paste and view

### Option 3: Generate Images
```bash
# Install PlantUML
npm install -g node-plantuml

# Generate PNG
puml generate documentation/diagrams/sequences/**/*.puml --png

# Generate SVG
puml generate documentation/diagrams/sequences/**/*.puml --svg
```

---

## 📝 Diagram Conventions

All sequence diagrams follow these conventions:

1. **Title**: Clear, descriptive title
2. **Participants**: Ordered left-to-right by interaction flow
3. **Activation**: Show when components are active
4. **Notes**: Explain complex logic
5. **Alt/Else**: Show conditional flows
6. **Database Transactions**: Clearly marked BEGIN/COMMIT/ROLLBACK
7. **Async Operations**: Clearly separated with notes

---

## 🔗 Related Documentation

- **Database ER Diagram**: `documentation/diagrams/database-er-diagram.puml`
- **API Documentation**: `documentation/03_API.md`
- **Architecture**: `documentation/02_ARCHITECTURE.md`
- **Business Logic**: `PROJECT_OVERVIEW.md`

---

**Status**: 18/18 diagrams created (100% complete) ✅  
**Next Steps**: All sequence diagrams complete! Focus on documentation updates (Workflows, Troubleshooting, Testing, Deployment)
