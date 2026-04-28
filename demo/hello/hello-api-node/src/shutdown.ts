import { logger } from './logger';
import type { Server } from 'http';

const SHUTDOWN_TIMEOUT = 30000; // 30 seconds

/**
 * Setup graceful shutdown handlers for SIGTERM and SIGINT.
 * Gives the application time to close connections and flush logs.
 */
export const setupGracefulShutdown = (server: Server): void => {
  const handleShutdown = (signal: string) => {
    logger.info(`Received ${signal}, starting graceful shutdown`);

    const shutdownTimer = setTimeout(() => {
      logger.error('Shutdown timeout - forcing exit');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT);

    server.close(() => {
      clearTimeout(shutdownTimer);
      logger.info('Server closed gracefully');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};
