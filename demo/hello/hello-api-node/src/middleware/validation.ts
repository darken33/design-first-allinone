/**
 * Validation Middleware
 * Generic middleware for Zod schema validation
 */
import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { ZodError } from 'zod';
import { logger } from '../logger';
import type { ApiErrorResponse } from '../generated/schemas';

/**
 * Returns a middleware function that validates request data against a Zod schema
 * @param schema - Zod schema to validate against
 * @param source - Where to find the data to validate (params, query, body)
 */
export const validateRequest = (
  schema: ZodSchema,
  source: 'params' | 'query' | 'body' = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const dataToValidate = req[source];
      schema.parse(dataToValidate);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
        const errorResponse: ApiErrorResponse = {
          timestamp: new Date().toISOString(),
          status: 400,
          error: 'Bad Request',
          message: `Validation failed: ${message}`,
          path: req.originalUrl || req.path
        };
        logger.warn({ error: errorResponse }, 'Validation error');
        res.status(400).json(errorResponse);
      } else {
        next(error);
      }
    }
  };
};
