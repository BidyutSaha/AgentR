/*
  Warnings:

  - A unique constraint covering the columns `[model_name,provider,pricing_tier,effective_from]` on the table `llm_model_pricing` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "llm_model_pricing_model_name_provider_effective_from_key";

-- DropIndex
DROP INDEX "llm_model_pricing_model_name_provider_is_latest_idx";

-- AlterTable
ALTER TABLE "llm_model_pricing" ADD COLUMN     "cached_input_price_per_million_tokens" INTEGER,
ADD COLUMN     "pricing_tier" TEXT NOT NULL DEFAULT 'standard';

-- CreateIndex
CREATE INDEX "llm_model_pricing_model_name_provider_pricing_tier_is_lates_idx" ON "llm_model_pricing"("model_name", "provider", "pricing_tier", "is_latest");

-- CreateIndex
CREATE UNIQUE INDEX "llm_model_pricing_model_name_provider_pricing_tier_effectiv_key" ON "llm_model_pricing"("model_name", "provider", "pricing_tier", "effective_from");
