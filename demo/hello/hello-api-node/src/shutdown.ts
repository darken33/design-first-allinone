import { logger } from './logger';
import type { Server } from 'http';
import type { KafkaProducerAdapter } from './adapters/kafka/kafka-producer.adapter';

const SHUTDOWN_TIMEOUT = 30000; // 30 seconds

/**
 * Setup graceful shutdown handlers for SIGTERM and SIGINT.
 * Disconnects Kafka producer and closes the HTTP server cleanly.
 */
export const setupGracefulShutdown = (
  server: Server,
  kafkaProducer: KafkaProducerAdapter
): void => {
  const handleShutdown = (signal: string) => {
    logger.info(`Received ${signal}, starting graceful shutdown`);

    const shutdownTimer = setTimeout(() => {
      logger.error('Shutdown timeout - forcing exit');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT);

    server.close(async () => {
      clearTimeout(shutdownTimer);
      try {
        await kafkaProducer.disconnect();
      } catch (err) {
        logger.error(err, 'Error disconnecting Kafka producer during shutdown');
      }
      logger.info('Server closed gracefully');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};
