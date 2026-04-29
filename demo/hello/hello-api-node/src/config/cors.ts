import cors from 'cors';
import { env } from './environment';

const LOCALHOST_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

/**
 * CORS origin resolver.
 * Always allows any localhost / 127.0.0.1 origin (any port) for local development.
 * In all environments, also allows origins listed in CORS_ORIGINS.
 */
const resolveOrigin: cors.CorsOptions['origin'] = (origin, callback) => {
  // Allow same-origin / non-browser requests
  if (!origin) return callback(null, true);
  if (LOCALHOST_PATTERN.test(origin)) return callback(null, true);
  if (env.CORS_ORIGINS.includes(origin)) return callback(null, true);
  callback(new Error(`CORS: origin '${origin}' is not allowed`));
};

export const corsMiddleware = cors({
  origin: resolveOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
});
