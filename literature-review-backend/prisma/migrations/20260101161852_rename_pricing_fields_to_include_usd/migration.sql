/*
  Warnings:

  - You are about to drop the column `cached_input_price_per_million_tokens` on the `llm_model_pricing` table. All the data in the column will be lost.
  - You are about to drop the column `input_price_per_million_tokens` on the `llm_model_pricing` table. All the data in the column will be lost.
  - You are about to drop the column `output_price_per_million_tokens` on the `llm_model_pricing` table. All the data in the column will be lost.
  - Added the required column `input_usd_cents_per_million_tokens` to the `llm_model_pricing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `output_usd_cents_per_million_tokens` to the `llm_model_pricing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "llm_model_pricing" DROP COLUMN "cached_input_price_per_million_tokens",
DROP COLUMN "input_price_per_million_tokens",
DROP COLUMN "output_price_per_million_tokens",
ADD COLUMN     "cached_input_usd_cents_per_million_tokens" INTEGER,
ADD COLUMN     "input_usd_cents_per_million_tokens" INTEGER NOT NULL,
ADD COLUMN     "output_usd_cents_per_million_tokens" INTEGER NOT NULL;
