import { Request, Response } from 'express';
import { ApiSuccessResponse } from '../types/api';

export async function getHealth(req: Request, res: Response): Promise<void> {
    const response: ApiSuccessResponse = {
        data: {
            status: 'ok',
            time: new Date().toISOString(),
        },
        meta: {
            requestId: req.requestId,
        },
    };

    res.status(200).json(response);
}
