import { Request, Response } from 'express';
import { ApiSuccessResponse } from '../types/api';
import {
    createModelPricing,
    listModelPricing,
    updateModelPricing,
    deleteModelPricing,
} from '../services/modelPricing/modelPricing.service';
import {
    CreateModelPricingRequest,
    UpdateModelPricingRequest,
    ListModelPricingQuery,
} from '../services/modelPricing/modelPricing.schema';

/**
 * Create a new LLM model pricing entry
 * POST /v1/admin/model-pricing
 */
export async function createModelPricingController(req: Request, res: Response): Promise<void> {
    const data: CreateModelPricingRequest = req.body;

    const pricing = await createModelPricing(data);

    const response: ApiSuccessResponse = {
        data: pricing,
        meta: {
            requestId: req.requestId,
        },
    };

    res.status(201).json(response);
}

/**
 * List all model pricing entries with optional filters
 * GET /v1/admin/model-pricing
 */
export async function listModelPricingController(req: Request, res: Response): Promise<void> {
    const query: ListModelPricingQuery = req.query as any;

    const result = await listModelPricing(query);

    const response: ApiSuccessResponse = {
        data: result.data,
        meta: {
            requestId: req.requestId,
            pagination: result.pagination,
        },
    };

    res.status(200).json(response);
}

/**
 * Update an existing model pricing entry
 * PATCH /v1/admin/model-pricing/:id
 */
export async function updateModelPricingController(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const data: UpdateModelPricingRequest = req.body;

    const pricing = await updateModelPricing(id, data);

    const response: ApiSuccessResponse = {
        data: pricing,
        meta: {
            requestId: req.requestId,
        },
    };

    res.status(200).json(response);
}

/**
 * Delete a model pricing entry
 * DELETE /v1/admin/model-pricing/:id
 */
export async function deleteModelPricingController(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    await deleteModelPricing(id);

    const response: ApiSuccessResponse = {
        data: { message: 'Model pricing deleted successfully' },
        meta: {
            requestId: req.requestId,
        },
    };

    res.status(200).json(response);
}
