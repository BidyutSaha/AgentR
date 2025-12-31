import { Request, Response } from 'express';
import { ApiSuccessResponse, StageOutput } from '../types/api';
import { processIntent } from '../services/intent/intent.service';
import { processQueries } from '../services/queries/queries.service';
import { processCategorize } from '../services/categorize/categorize.service';
import { IntentRequest } from '../services/intent/intent.schema';
import { QueriesRequest } from '../services/queries/queries.schema';
import { CategorizeRequest } from '../services/categorize/categorize.schema';

/**
 * Stage 1: Intent Decomposition
 * POST /v1/stages/intent
 */
export async function postIntent(req: Request, res: Response): Promise<void> {
    const requestData: IntentRequest = req.body;

    // Process intent
    const result = await processIntent(requestData);

    // Build stage output
    const stageOutput: StageOutput = {
        stage: 'intent',
        version: '1.0',
        generatedAt: new Date().toISOString(),
        output: result.output,
        usage: result.usage,
    };

    // Build API response
    const response: ApiSuccessResponse = {
        data: stageOutput,
        meta: {
            requestId: req.requestId,
        },
    };

    res.status(200).json(response);
}

/**
 * Stage 2: Query Generation
 * POST /v1/stages/queries
 */
export async function postQueries(req: Request, res: Response): Promise<void> {
    const requestData: QueriesRequest = req.body;

    // Process queries
    const result = await processQueries(requestData);

    // Build stage output
    const stageOutput: StageOutput = {
        stage: 'queries',
        version: '1.0',
        generatedAt: new Date().toISOString(),
        output: result.output,
        usage: result.usage,
    };

    // Build API response
    const response: ApiSuccessResponse = {
        data: stageOutput,
        meta: {
            requestId: req.requestId,
        },
    };

    res.status(200).json(response);
}


/**
 * Paper Scoring (Stage 5+6+7 Merged): Semantic Matching, Categorization & Gap Analysis
 * POST /v1/stages/score
 */
export async function postCategorize(req: Request, res: Response): Promise<void> {
    const requestData: CategorizeRequest = req.body;

    // Process paper scoring
    const result = await processCategorize(requestData);

    // Build stage output
    const stageOutput: StageOutput = {
        stage: 'score',
        version: '1.0',
        generatedAt: new Date().toISOString(),
        output: result.output,
        usage: result.usage,
    };

    // Build API response
    const response: ApiSuccessResponse = {
        data: stageOutput,
        meta: {
            requestId: req.requestId,
        },
    };

    res.status(200).json(response);
}
