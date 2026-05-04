import { createApp } from './config/express';
import { env } from './config/environment';
import { logger } from './logger';
import { setupGracefulShutdown } from './shutdown';
import { KafkaProducerAdapter } from './adapters/kafka/kafka-producer.adapter';
import { HelloService } from './services/hello.service';

/**
 * Application entry point.
 * Initializes Kafka producer, Express app, registers routes, and starts the server.
 */
const startServer = async (): Promise<void> => {
  // Create and connect Kafka producer (fail-safe: log error but don't crash)
  const kafkaProducer = new KafkaProducerAdapter();
  try {
    await kafkaProducer.connect();
  } catch (error) {
    logger.error(
      error,
      'Kafka producer failed to connect at startup — events will fail until Kafka is available'
    );
  }

  const helloService = new HelloService(kafkaProducer);

  try {
    const app = createApp(helloService);

    const server = app.listen(env.PORT, () => {
      logger.info(
        {
          port: env.PORT,
          nodeEnv: env.NODE_ENV
        },
        'Server listening'
      );
    });

    setupGracefulShutdown(server, kafkaProducer);
  } catch (error) {
    logger.error(error, 'Failed to start server');
    process.exit(1);
  }
};

startServer();
