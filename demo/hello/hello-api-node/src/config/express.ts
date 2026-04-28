import express, { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { configureMiddleware } from './middleware';
import { requestLogger } from '../middleware/request-logger';
import { errorHandler } from '../middleware/error-handler';
import { helloRoutes } from '../api/routes/hello.routes';

/**
 * Express app factory.
 * Creates and configures the Express application without binding to a port.
 * Registers all application routes.
 */
export const createApp = (): Express => {
  const app = express();

  // Configure standard middleware
  configureMiddleware(app);

  // Logging middleware
  app.use(requestLogger);

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({
      status: 'healthy',
      uptime: Math.floor(process.uptime())
    });
  });

  // API routes
  app.use('/api', helloRoutes);

  // Swagger UI
  const swaggerSpec = YAML.load(path.resolve(__dirname, '../../specs/001-hello-api-node/openapi.yaml')) as object;
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
};
