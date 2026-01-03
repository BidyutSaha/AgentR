/*
  Warnings:

  - You are about to drop the `system_config` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "system_config";

-- CreateTable
CREATE TABLE "credits_multiplier_history" (
    "id" TEXT NOT NULL,
    "usd_to_credits_multiplier" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "updated_by" TEXT,
    "effective_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effective_to" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credits_multiplier_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "default_credits_history" (
    "id" TEXT NOT NULL,
    "default_credits" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "updated_by" TEXT,
    "effective_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effective_to" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "default_credits_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_credits_transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "admin_id" TEXT,
    "transaction_type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "balance_before" DOUBLE PRECISION NOT NULL,
    "balance_after" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_credits_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "credits_multiplier_history_is_active_effective_from_idx" ON "credits_multiplier_history"("is_active", "effective_from");

-- CreateIndex
CREATE INDEX "default_credits_history_is_active_effective_from_idx" ON "default_credits_history"("is_active", "effective_from");

-- CreateIndex
CREATE INDEX "user_credits_transactions_user_id_created_at_idx" ON "user_credits_transactions"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "user_credits_transactions_admin_id_idx" ON "user_credits_transactions"("admin_id");

-- CreateIndex
CREATE INDEX "user_credits_transactions_transaction_type_idx" ON "user_credits_transactions"("transaction_type");

-- AddForeignKey
ALTER TABLE "user_credits_transactions" ADD CONSTRAINT "user_credits_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
