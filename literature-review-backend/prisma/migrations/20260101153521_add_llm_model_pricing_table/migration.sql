-- CreateTable
CREATE TABLE "llm_model_pricing" (
    "id" TEXT NOT NULL,
    "model_name" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'openai',
    "input_price_per_million_tokens" INTEGER NOT NULL,
    "output_price_per_million_tokens" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_latest" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "notes" TEXT,
    "effective_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effective_to" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "llm_model_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "llm_model_pricing_model_name_provider_is_latest_idx" ON "llm_model_pricing"("model_name", "provider", "is_latest");

-- CreateIndex
CREATE INDEX "llm_model_pricing_is_active_is_latest_idx" ON "llm_model_pricing"("is_active", "is_latest");

-- CreateIndex
CREATE INDEX "llm_model_pricing_effective_from_idx" ON "llm_model_pricing"("effective_from");

-- CreateIndex
CREATE UNIQUE INDEX "llm_model_pricing_model_name_provider_effective_from_key" ON "llm_model_pricing"("model_name", "provider", "effective_from");
