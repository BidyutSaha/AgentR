-- ============================================================================
-- Mandatory Data Seed (SQL Export)
-- Generated from: scripts/seed-mandatory-data.ts
-- Date: 2026-01-03
-- ============================================================================

-- 1. LLM Model Pricing (GPT-5 Mini)
INSERT INTO "llm_model_pricing" (
  "id", 
  "model_name", 
  "provider", 
  "pricing_tier", 
  "input_usd_price_per_million_tokens", 
  "output_usd_price_per_million_tokens", 
  "cached_input_usd_price_per_million_tokens", 
  "is_active", 
  "is_latest", 
  "effective_from", 
  "description", 
  "notes", 
  "created_at", 
  "updated_at"
) VALUES (
  gen_random_uuid(), -- id
  'gpt-5-mini',      -- model_name
  'openai',          -- provider
  'standard',        -- pricing_tier
  0.25,             -- input (USD)
  0.025,            -- output (USD)
  2.0,              -- cached_input (USD)
  true,             -- is_active
  true,             -- is_latest
  NOW(),            -- effective_from
  'Seeded pricing for gpt-5-mini', -- description
  'Auto-generated via mandatory-data.sql', -- notes
  NOW(),            -- created_at
  NOW()             -- updated_at
);

-- 2. Credits Multiplier (1 USD = 100 Credits)
INSERT INTO "credits_multiplier_history" (
  "id", 
  "usd_to_credits_multiplier", 
  "description", 
  "updated_by", 
  "effective_from", 
  "is_active", 
  "created_at"
) VALUES (
  gen_random_uuid(),
  100.0,
  'Initial Seed',
  'system-seed',
  NOW(),
  true,
  NOW()
);

-- 3. Default Credits (50 Credits on Signup)
INSERT INTO "default_credits_history" (
  "id", 
  "default_credits", 
  "description", 
  "updated_by", 
  "effective_from", 
  "is_active", 
  "created_at"
) VALUES (
  gen_random_uuid(),
  50.0,
  'Initial Seed',
  'system-seed',
  NOW(),
  true,
  NOW()
);
