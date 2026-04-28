import type { Request, Response, NextFunction } from 'express';
import { logger } from '../logger';

/**
 * Pino-based request logging middleware.
 * Logs: method, path, status code, response time.
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  // Listen for the finish event to capture status code
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`
    });
  });

  next();
};
