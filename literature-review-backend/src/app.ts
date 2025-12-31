import express, { Application } from 'express';
import cors from 'cors';
import { requestIdMiddleware } from './middlewares/requestId';
import { requestLoggerMiddleware } from './middlewares/requestLogger';
import { errorHandler } from './middlewares/errorHandler';
import routes from './routes';

export function createApp(): Application {
    const app = express();

    // Middleware
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(requestIdMiddleware);
    app.use(requestLoggerMiddleware);

    // Routes
    app.use('/', routes);

    // Error handling (must be last)
    app.use(errorHandler);

    return app;
}
