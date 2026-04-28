import { createApp } from './config/express';
import { env } from './config/environment';
import { logger } from './logger';
import { setupGracefulShutdown } from './shutdown';

/**
 * Application entry point.
 * Initializes Express app, registers routes, and starts the server.
 */
const startServer = async (): Promise<void> => {
  try {
    const app = createApp();

    const server = app.listen(env.PORT, () => {
      logger.info(
        {
          port: env.PORT,
          nodeEnv: env.NODE_ENV
        },
        'Server listening'
      );
    });

    setupGracefulShutdown(server);
  } catch (error) {
    logger.error(error, 'Failed to start server');
    process.exit(1);
  }
};

startServer();
