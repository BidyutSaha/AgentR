# Database Normalization Analysis

**Date**: 2026-01-03
**Scope**: Complete Database Schema (11 Tables)

---

## 1. Executive Summary

The database is designed primarily in **3rd Normal Form (3NF)**, ensuring data integrity and minimizing redundancy. However, specific **intentional denormalizations** have been implemented to optimize performance for high-frequency read operations (e.g., balance checks) and to ensure audit trails (e.g., freezing historical costs).

**Overall Status**: **3NF with Strategic Denormalization**

---

## 2. Default Normalization Standard (3NF)

Most tables adhere to strict 3NF rules:
- **1NF (Atomic Values)**: All columns contain atomic values. No repeating groups.
- **2NF (Full Functional Dependency)**: All non-key attributes depend on the full primary key.
- **3NF (No Transitive Dependency)**: Non-key attributes depend *only* on the primary key.

### Examples of 3NF Compliance:
- **`credits_multiplier_history`**: Temporal data is normalized into a separate history table (Type 2 SCD) rather than overwriting fields in a "Settings" table.
- **`user_projects`**: User details are not repeated; only `user_id` is stored.
- **`user_credits_transactions`**: Transaction details are isolated from the User table.

---

## 3. Strategic Denormalizations

The following deviations from 3NF are intentional design choices:

### 3.1 User Balance Caching (`users.ai_credits_balance`)
- **Deviation**: The `ai_credits_balance` is functionally dependent on the sum of all `user_credits_transactions` and `llm_usage_logs`. Storing it in the `users` table is a transitive dependency (dependent on transactions).
- **Justification**: **Performance**. Calculating balance by summing millions of transaction and log records on every request is inefficient. A cached balance allows O(1) read time for the critical "Can user afford this?" check.

### 3.2 Historical Cost Snapshot (`llm_usage_logs`)
- **Deviation**: `input_cost_usd` could theoretically be derived from `input_tokens` * `price_at_that_time`. Storing the calculated cost is redundant.
- **Justification**: **Auditability & Accuracy**. Prices change over time. Storing the *calculated cost at the moment of usage* freezes the financial fact, preventing historical data changes if pricing configurations are updated later. This effectively treats the log as a "Fact Table" in Data Warehousing terms (Star Schema).

### 3.3 Redundant Foreign Keys (`llm_usage_logs`)
- **Deviation**: The table stores `user_id`, `project_id`, and `paper_id`. Since `paper` belongs to `project` which belongs to `user`, `user_id` is transitive.
- **Justification**: **Query Performance**. This allows querying "All usage by User X" without performing two extra JOINs (Log -> Paper -> Project -> User).

---

## 4. Table-by-Table Analysis

| Table | Normal Form | Notes |
|-------|-------------|-------|
| `users` | **Denormalized (3NF*)** | Contains `ai_credits_balance` (Cached sum). |
| `email_verification_tokens` | **3NF** | Pure dependency on PK. |
| `password_reset_tokens` | **3NF** | Pure dependency on PK. |
| `refresh_tokens` | **3NF** | Pure dependency on PK. |
| `user_projects` | **3NF** | Pure dependency on PK. |
| `candidate_papers` | **1NF / 3NF** | Text fields (`c1_strengths`) store unstructured blocks (1NF), but semantic atomic units. |
| `llm_model_pricing` | **3NF** | temporal versioning via `effective_from` (SCD Type 2). |
| `llm_usage_logs` | **Denormalized (Star)** | Fact table with redundancy for analytical performance. |
| `credits_multiplier_history`| **3NF** | Pure temporal history table. |
| `default_credits_history` | **3NF** | Pure temporal history table. |
| `user_credits_transactions` | **3NF** | Transactional ledger. |

---

## 5. Conclusion

The database schema is robust, following standard relational design principles while pragmatically optimizing for the specific read-heavy and audit-heavy requirements of an AI credit system.
