import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import type { ApiErrorResponse } from '../domain/models/error';

/**
 * Express error handling middleware.
 * Catches all errors and converts them to structured ApiErrorResponse JSON.
 */
export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const timestamp = new Date().toISOString();
  const path = req.originalUrl || req.path;

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const firstError = err.errors[0];
    const message = firstError.message;
    const status = 400;

    const errorResponse: ApiErrorResponse = {
      timestamp,
      status,
      error: 'Bad Request',
      message,
      path
    };

    res.status(status).json(errorResponse);
    return;
  }

  // Handle standard Error objects
  if (err instanceof Error) {
    const status = 'statusCode' in err ? (err.statusCode as number) : 500;
    const message = err.message || 'Internal Server Error';
    const errorName = err.name || 'Error';

    const errorResponse: ApiErrorResponse = {
      timestamp,
      status,
      error: errorName,
      message,
      path
    };

    res.status(status).json(errorResponse);
    return;
  }

  // Handle unknown errors
  const errorResponse: ApiErrorResponse = {
    timestamp,
    status: 500,
    error: 'Internal Server Error',
    message: String(err) || 'An unexpected error occurred',
    path
  };

  res.status(500).json(errorResponse);
};
