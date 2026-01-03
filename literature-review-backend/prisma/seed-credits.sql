-- Seed initial data for credits system

-- Insert initial multiplier
INSERT INTO credits_multiplier_history (id, usd_to_credits_multiplier, description, is_active, effective_from, created_at) 
VALUES (gen_random_uuid(), 100.0, 'Initial: 1 USD = 100 AI Credits', true, NOW(), NOW());

-- Insert initial default credits
INSERT INTO default_credits_history (id, default_credits, description, is_active, effective_from, created_at) 
VALUES (gen_random_uuid(), 1000.0, 'Initial: 1000 credits for new users', true, NOW(), NOW());
