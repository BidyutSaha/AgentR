-- CreateTable
CREATE TABLE "llm_usage_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "project_id" TEXT,
    "paper_id" TEXT,
    "stage" TEXT NOT NULL,
    "model_name" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'openai',
    "input_tokens" INTEGER NOT NULL,
    "output_tokens" INTEGER NOT NULL,
    "total_tokens" INTEGER NOT NULL,
    "input_cost_cents" INTEGER,
    "output_cost_cents" INTEGER,
    "total_cost_cents" INTEGER,
    "duration_ms" INTEGER,
    "request_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'success',
    "error_message" TEXT,
    "metadata" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "llm_usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "llm_usage_logs_user_id_created_at_idx" ON "llm_usage_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "llm_usage_logs_project_id_created_at_idx" ON "llm_usage_logs"("project_id", "created_at");

-- CreateIndex
CREATE INDEX "llm_usage_logs_stage_created_at_idx" ON "llm_usage_logs"("stage", "created_at");

-- CreateIndex
CREATE INDEX "llm_usage_logs_created_at_idx" ON "llm_usage_logs"("created_at");

-- AddForeignKey
ALTER TABLE "llm_usage_logs" ADD CONSTRAINT "llm_usage_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "llm_usage_logs" ADD CONSTRAINT "llm_usage_logs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "user_projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "llm_usage_logs" ADD CONSTRAINT "llm_usage_logs_paper_id_fkey" FOREIGN KEY ("paper_id") REFERENCES "candidate_papers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
