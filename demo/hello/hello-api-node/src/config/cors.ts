import cors from 'cors';
import { env } from './environment';

/**
 * CORS middleware configured from CORS_ORIGINS environment variable.
 * Allows requests from frontend origins defined at runtime.
 */
export const corsMiddleware = cors({
  origin: env.CORS_ORIGINS,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
});
