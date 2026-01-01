import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { requireAdmin } from '../middlewares/adminAuth';
import { validate } from '../middlewares/validate';
import {
    createModelPricingController,
    listModelPricingController,
    updateModelPricingController,
    deleteModelPricingController,
} from '../controllers/modelPricing.controller';
import {
    createModelPricingSchema,
    updateModelPricingSchema,
    listModelPricingQuerySchema,
} from '../services/modelPricing/modelPricing.schema';

const router = Router();

/**
 * @route   POST /v1/admin/model-pricing
 * @desc    Create a new LLM model pricing entry
 * @access  Admin only
 */
router.post(
    '/',
    authenticate,
    requireAdmin,
    validate(createModelPricingSchema),
    createModelPricingController
);

/**
 * @route   GET /v1/admin/model-pricing
 * @desc    List all model pricing entries with optional filters
 * @access  Admin only
 * @query   provider, modelName, isActive, isLatest, page, limit
 */
router.get(
    '/',
    authenticate,
    requireAdmin,
    listModelPricingController
);

/**
 * @route   PATCH /v1/admin/model-pricing/:id
 * @desc    Update an existing model pricing entry
 * @access  Admin only
 */
router.patch(
    '/:id',
    authenticate,
    requireAdmin,
    validate(updateModelPricingSchema),
    updateModelPricingController
);

/**
 * @route   DELETE /v1/admin/model-pricing/:id
 * @desc    Delete a model pricing entry
 * @access  Admin only
 */
router.delete(
    '/:id',
    authenticate,
    requireAdmin,
    deleteModelPricingController
);

export default router;
