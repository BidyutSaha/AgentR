import { Router } from 'express';
import healthRoutes from './health.routes';
import stagesRoutes from './stages.routes';
import authRoutes from './auth.routes';
import userProjectRoutes from './userProject.routes';
import candidatePaperRoutes from './candidatePaper.routes';
import papersRoutes from './papers.routes';
import llmUsageRoutes from './llmUsage.routes';
import modelPricingRoutes from './modelPricing.routes';
import systemConfigRoutes from './systemConfig.routes';
import adminCreditsRoutes from './adminCredits.routes';
import creditsRoutes from './credits.routes';

const router = Router();

// Mount routes
router.use('/v1', healthRoutes);
router.use('/v1/auth', authRoutes);
router.use('/v1/user-projects', userProjectRoutes);
router.use('/v1/user-projects', candidatePaperRoutes); // Nested routes for papers
router.use('/v1/papers', papersRoutes); // Direct routes for papers
router.use('/v1/stages', stagesRoutes);
router.use('/v1/llm-usage', llmUsageRoutes); // LLM usage tracking
router.use('/v1/admin/model-pricing', modelPricingRoutes); // Admin-only model pricing management
router.use('/v1/admin/system-config', systemConfigRoutes); // Admin-only system configuration
router.use('/v1/admin/credits', adminCreditsRoutes); // Admin-only credits management
router.use('/v1/credits', creditsRoutes); // User credits balance

export default router;
