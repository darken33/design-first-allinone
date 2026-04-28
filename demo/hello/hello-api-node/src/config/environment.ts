import dotenv from 'dotenv';

// Load env variables
dotenv.config();

interface Environment {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  LOG_LEVEL: string;
  CORS_ORIGINS: string[];
}

/**
 * Validate and export environment variables.
 */
export const getEnvironment = (): Environment => {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const nodeEnv = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';
  const logLevel = process.env.LOG_LEVEL || 'info';
  const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',');

  return {
    PORT: port,
    NODE_ENV: nodeEnv,
    LOG_LEVEL: logLevel,
    CORS_ORIGINS: corsOrigins
  };
};

export const env = getEnvironment();
