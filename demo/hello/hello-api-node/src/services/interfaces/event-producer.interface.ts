import HelloMessagePayload from '../../generated/events/HelloMessagePayload';

/**
 * Outgoing port — abstracts event publishing from domain logic.
 * Implemented by KafkaProducerAdapter; mocked in unit tests.
 */
export interface IEventProducer {
  /**
   * Publishes a hello message to the Kafka topic `event.hello.v1`.
   * @throws {Error} if Kafka is unavailable or the message cannot be acknowledged.
   */
  sendHelloMessage(payload: HelloMessagePayload): Promise<void>;
}

export { HelloMessagePayload };
