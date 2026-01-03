# 📘 Developer Handover Guide

**Project Name**: AgentR (Literature Review Backend)
**Version**: 1.0.0
**Last Updated**: 2026-01-03

---

## 1. Project Overview
**AgentR** is an AI-powered system designed to automate and enhance the academic literature review process. It helps researchers decompose their research intent, generate search queries, find papers (future), and score candidate papers against their specific research goals.

**Core Value Proposition**:
- Automates the tedious "filtering" phase of research.
- Provides objective, AI-driven scoring of papers.
- Identifies "Research Gaps" automatically.

---

## 2. Key Modules & Functionalities

### 🔐 2.1 Authentication & Security (`src/services/auth`)
- **JWT-Based**: Uses Access (15m) and Refresh Tokens (7d).
- **Security**: Emails must be verified before login. Passwords bcrypt-hashed.
- **Flow**: Register -> Email Verify -> Login -> Access Token.

### 📂 2.2 User Projects (`src/services/userProject.service.ts`)
- A "Project" is a container for a specific research goal (e.g., "AI in Healthcare").
- **Business Logic**: Users define a "User Idea" (abstract/goal). All subsequent analysis depends on this context.

### 🧠 2.3 LLM Analysis Pipeline (`src/services/stages`)
The core "intelligence" runs in sequential stages:
1.  **Stage 1 (Intent)**: Decomposes a raw user idea into structured "Research Components" (Problem, Method, Domain).
    *   *Why?* Raw text is too noisy for search.
2.  **Stage 2 (Queries)**: logical search queries compatible with academic search engines.
    *   *Why?* Helps users find relevant papers effectively.
3.  **Stage 3 & 4**: (Planned) Retrieval and Filtering.
4.  **Stage 5 (Scoring)**: The "Brain". Compares a candidate paper against the User's Idea.
    *   **C1 Score**: Competitor Analysis (How similar is this to my idea? High overlap = Bad for novelty).
    *   **C2 Score**: Supporting Work (Can I use this? High relevance = Good).
    *   **Gap Analysis**: AI identifies what the paper *missed*, highlighting the user's opportunity.

### 💰 2.4 AI Credits & Billing (`src/services/credits.service.ts`)
- **Economy**: Users pay with "AI Credits", not direct cash.
- **Conversion**: Admin sets a `USD -> Credits` multiplier (e.g., $1 = 100 Credits).
- **Usage**: Every LLM call tracks tokens -> calculates USD cost -> converts to Credits -> deducts from User Balance.
- **Ledger**: All manual adjustments (Recharge/Refund) are recorded in `user_credits_transactions`.

---

## 3. Critical Business Logic

### 3.1 The "Double-Entry" Credit System
- **Rule**: Never just "set" a user's balance.
- **Logic**: Balance is effectively the sum of `Transactions` (Manual) - `LLM Usage` (Automatic).
- **Performance**: We cache the current balance in `users.ai_credits_balance` for speed, but the *truth* is in the logs.

### 3.2 Dynamic Pricing
- **Rule**: We don't hardcode LLM prices.
- **Logic**: `llm_model_pricing` table stores price-per-million-tokens.
- **Audit**: If OpenAI changes prices, we create a new pricing record. Old logs *retain* the old calculated cost (Historical immutability).

### 3.3 Semantic Scoring (The "Secret Sauce")
- We don't just ask "is this paper good?".
- We ask specific structural questions: "Does this paper solve the [User's Problem] using [User's Constraint]?".
- This structured prompting reduces hallucination and provides actionable feedback.

---

## 4. Technical Architecture

- **Framework**: Express.js (Node.js) + TypeScript.
- **DB**: PostgreSQL + Prisma ORM.
- **Validation**: Zod (Runtime validation for all inputs).
- **Logging**: Pino (JSON logs for observability).
- **Structure**: Layered (Controller -> Service -> Repository/Prisma).

### Directory Map
```
src/
├── controllers/   # Validates HTTP input, sends HTTP output
├── services/      # PURE Business Logic. No req/res objects here.
├── routes/        # URL definitions + Middleware binding
├── utils/         # Helper functions (LLM clients, Tokens)
└── types/         # TypeScript definitions
```

---

## 5. First Steps for New Developers

1.  **Read the Rules**: Start with `rules.md`. It defines our coding standards.
2.  **Understand the Database**: Look at `documentation/diagrams/database-er-diagram.puml` or `prisma/schema.prisma`.
3.  **Run the Server**: `npm install` -> `npm run dev`.
4.  **Check API**: `documentation/03_API.md` is the contract.

---

## 6. Known "Gotchas"
- **LLM Costs**: Always ensure `llm_model_pricing` is seeded. If missing, cost calculation fails.
- **Transactions**: Transactions are immutable. To fix a mistake, create a *new* correction transaction.
- **Environment**: You typically need `OPENAI_API_KEY` set up locally to run Stages.
