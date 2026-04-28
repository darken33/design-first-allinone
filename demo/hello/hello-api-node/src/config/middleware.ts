import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './environment';

/**
 * Configure CORS, Helmet, and body parser middleware.
 */
export const configureMiddleware = (app: express.Application): void => {
  // Security headers
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: env.CORS_ORIGINS,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
    })
  );

  // Body parser
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
};
