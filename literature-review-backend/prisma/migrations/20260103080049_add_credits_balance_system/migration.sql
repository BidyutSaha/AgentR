-- AlterTable
ALTER TABLE "system_config" ADD COLUMN     "default_credits_for_new_users" DOUBLE PRECISION NOT NULL DEFAULT 1000.0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "ai_credits_balance" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
