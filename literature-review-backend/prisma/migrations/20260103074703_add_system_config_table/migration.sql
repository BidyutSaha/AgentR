/*
  Warnings:

  - You are about to drop the column `cached_input_usd_cents_per_million_tokens` on the `llm_model_pricing` table. All the data in the column will be lost.
  - You are about to drop the column `input_usd_cents_per_million_tokens` on the `llm_model_pricing` table. All the data in the column will be lost.
  - You are about to drop the column `output_usd_cents_per_million_tokens` on the `llm_model_pricing` table. All the data in the column will be lost.
  - You are about to drop the column `input_cost_cents` on the `llm_usage_logs` table. All the data in the column will be lost.
  - You are about to drop the column `output_cost_cents` on the `llm_usage_logs` table. All the data in the column will be lost.
  - You are about to drop the column `total_cost_cents` on the `llm_usage_logs` table. All the data in the column will be lost.
  - Added the required column `input_usd_price_per_million_tokens` to the `llm_model_pricing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `output_usd_price_per_million_tokens` to the `llm_model_pricing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "llm_model_pricing" DROP COLUMN "cached_input_usd_cents_per_million_tokens",
DROP COLUMN "input_usd_cents_per_million_tokens",
DROP COLUMN "output_usd_cents_per_million_tokens",
ADD COLUMN     "cached_input_usd_price_per_million_tokens" DOUBLE PRECISION,
ADD COLUMN     "input_usd_price_per_million_tokens" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "output_usd_price_per_million_tokens" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "llm_usage_logs" DROP COLUMN "input_cost_cents",
DROP COLUMN "output_cost_cents",
DROP COLUMN "total_cost_cents",
ADD COLUMN     "input_cost_usd" DOUBLE PRECISION,
ADD COLUMN     "output_cost_usd" DOUBLE PRECISION,
ADD COLUMN     "total_cost_usd" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "system_config" (
    "id" TEXT NOT NULL,
    "usd_to_credits_multiplier" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    "description" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);
