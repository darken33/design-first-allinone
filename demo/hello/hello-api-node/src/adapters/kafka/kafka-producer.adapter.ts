import { Kafka, Producer, logLevel } from 'kafkajs';
import type { IEventProducer } from '../../services/interfaces/event-producer.interface';
import HelloMessagePayload from '../../generated/events/HelloMessagePayload';
import { logger } from '../../logger';

const KAFKA_TOPIC = process.env.KAFKA_TOPIC_HELLO ?? 'event.hello.v1';

/**
 * Kafka implementation of IEventProducer.
 * Publishes HelloMessagePayload to the configured topic using kafkajs.
 * Lifecycle: call connect() at app startup, disconnect() in SIGTERM handler.
 */
export class KafkaProducerAdapter implements IEventProducer {
  private readonly producer: Producer;

  constructor() {
    const kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID ?? 'hello-api-node',
      brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
      logLevel: logLevel.ERROR
    });
    this.producer = kafka.producer();
  }

  async connect(): Promise<void> {
    await this.producer.connect();
    logger.info('Kafka producer connected');
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
    logger.info('Kafka producer disconnected');
  }

  async sendHelloMessage(payload: HelloMessagePayload): Promise<void> {
    const message = payload.message;
    logger.info({ topic: KAFKA_TOPIC, message }, 'Publishing hello event');
    await this.producer.send({
      topic: KAFKA_TOPIC,
      messages: [{ value: JSON.stringify({ message }) }]
    });
  }
}
