# Activity Diagrams - Complete List

**Location**: `documentation/diagrams/activities/`  
**Format**: PlantUML (`.puml`)  
**Total Diagrams**: 18 (matching sequence diagrams)  
**Last Updated**: 2026-01-11

---

## Purpose

Activity diagrams show the **flow of control** and **decision points** in business processes. They complement sequence diagrams by focusing on:
- Decision logic (if/else conditions)
- Parallel processing (fork/join)
- Loops and iterations
- Error handling paths
- Business rules

---

## ✅ Created Diagrams (18/18) - COMPLETE!

### Auth Flows (5/5) ✅
1. ✅ **user-registration-activity.puml** - Registration flow with validations
2. ✅ **login-token-activity.puml** - Login flow with checks
3. ✅ **token-refresh-activity.puml** - Token refresh logic with rotation
4. ✅ **password-reset-activity.puml** - Two-step password reset
5. ✅ **email-verification-activity.puml** - Email verification logic

### LLM Processing (3/3) ✅
6. ✅ **intent-decomposition-activity.puml** - Stage 1 processing flow
7. ✅ **query-generation-activity.puml** - Stage 2 processing flow
8. ✅ **paper-scoring-activity.puml** - Stage 3 processing flow

### Core Workflows (4/4) ✅
9. ✅ **project-creation-activity.puml** - Project creation flow
10. ✅ **paper-addition-activity.puml** - Paper addition flow
11. ✅ **bulk-paper-upload-activity.puml** - CSV upload flow
12. ✅ **project-export-activity.puml** - Excel export flow

### Credits & Billing (3/3) ✅
13. ✅ **credits-deduction-activity.puml** - Credit deduction logic
14. ✅ **admin-credit-recharge-activity.puml** - Admin recharge flow
15. ✅ **llm-usage-tracking-activity.puml** - Usage tracking flow

### Jobs (2/2) ✅
16. ✅ **job-retry-activity.puml** - Job retry logic with resilience
17. ✅ **job-monitoring-activity.puml** - Job monitoring flow

### Admin (1/1) ✅
18. ✅ **config-update-activity.puml** - Type 2 SCD update flow

---

## 📁 Directory Structure

```
documentation/diagrams/activities/
├── auth/
│   ├── user-registration-activity.puml ✅
│   ├── login-token-activity.puml ✅
│   ├── token-refresh-activity.puml ✅
│   ├── password-reset-activity.puml ✅
│   └── email-verification-activity.puml ✅
├── llm/
│   ├── intent-decomposition-activity.puml ✅
│   ├── query-generation-activity.puml ✅
│   └── paper-scoring-activity.puml ✅
├── core/
│   ├── project-creation-activity.puml ✅
│   ├── paper-addition-activity.puml ✅
│   ├── bulk-paper-upload-activity.puml ✅
│   └── project-export-activity.puml ✅
├── credits/
│   ├── credits-deduction-activity.puml ✅
│   ├── admin-credit-recharge-activity.puml ✅
│   └── llm-usage-tracking-activity.puml ✅
├── jobs/
│   ├── job-retry-activity.puml ✅
│   └── job-monitoring-activity.puml ✅
└── admin/
    └── config-update-activity.puml ✅
```

---

## 🎯 Activity Diagram Conventions

All activity diagrams follow these conventions:

1. **Start/Stop**: Clear entry and exit points
2. **Decision Nodes**: Diamond shapes for if/else logic
3. **Partitions**: Group related activities (e.g., "Atomic Transaction")
4. **Fork/Join**: Show parallel processing
5. **Notes**: Explain business rules
6. **Error Paths**: Show all failure scenarios
7. **Colors**: Use colors to highlight critical paths (optional)

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

## 🔍 Difference: Activity vs Sequence Diagrams

| Aspect | Sequence Diagram | Activity Diagram |
|--------|------------------|------------------|
| **Focus** | Object interactions | Process flow |
| **Perspective** | Component communication | Business logic |
| **Best For** | API calls, messaging | Decision trees, workflows |
| **Shows** | Who does what | What happens when |
| **Timing** | Temporal sequence | Logical flow |

**Use Both**: Sequence diagrams show HOW components interact, Activity diagrams show WHAT decisions are made.

---

## 🔗 Related Documentation

- **Sequence Diagrams**: `documentation/diagrams/sequences/` (18/18 complete)
- **Database ER Diagram**: `documentation/diagrams/database-er-diagram.puml`
- **API Documentation**: `documentation/03_API.md`
- **Business Logic**: `PROJECT_OVERVIEW.md`

---

**Status**: 18/18 diagrams created (100% complete) ✅  
**Next Steps**: All activity diagrams complete! Combined with sequence diagrams, we now have comprehensive visual documentation of all system workflows.
