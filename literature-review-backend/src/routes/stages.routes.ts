import { Router } from 'express';
import { validate } from '../middlewares/validate';
import { postIntent, postQueries, postCategorize } from '../controllers/stages.controller';
import { intentRequestSchema } from '../services/intent/intent.schema';
import { queriesRequestSchema } from '../services/queries/queries.schema';
import { categorizeRequestSchema } from '../services/categorize/categorize.schema';

const router = Router();

// Stage 1: Intent Decomposition
router.post('/intent', validate(intentRequestSchema), postIntent);

// Stage 2: Query Generation
router.post('/queries', validate(queriesRequestSchema), postQueries);

// Stage 3: Retrieval (to be added)
// router.post('/retrieve', validate(retrievalRequestSchema), postRetrieve);

// Stage 4: Filter (to be added)
// router.post('/filter', validate(filterRequestSchema), postFilter);

// Paper Scoring (Stage 5+6+7 Merged): Semantic Matching, Categorization & Gap Analysis
router.post('/score', validate(categorizeRequestSchema), postCategorize);

// Stage 8: Final Gaps (to be added - aggregate analysis)
// router.post('/gaps', validate(gapsRequestSchema), postGaps);

export default router;
