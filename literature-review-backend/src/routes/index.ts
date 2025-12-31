import { Router } from 'express';
import healthRoutes from './health.routes';
import stagesRoutes from './stages.routes';
import authRoutes from './auth.routes';
import userProjectRoutes from './userProject.routes';

const router = Router();

// Mount routes
router.use('/v1', healthRoutes);
router.use('/v1/auth', authRoutes);
router.use('/v1/user-projects', userProjectRoutes);
router.use('/v1/stages', stagesRoutes);

export default router;
