/**
 * HelloService Implementation
 * Implements IHelloService with business logic for greeting.
 * Publishes a HelloMessagePayload event to Kafka after each successful greeting.
 */
import type { IHelloService } from './interfaces/hello.service.interface';
import type { IEventProducer } from './interfaces/event-producer.interface';
import HelloMessagePayload from '../generated/events/HelloMessagePayload';

export class HelloService implements IHelloService {
  constructor(private readonly eventProducer: IEventProducer) {}

  /**
   * Generate a greeting message and publish it as a Kafka event.
   * @param name - Optional name to greet
   * @returns Personalized greeting or "Hello World" if no name provided
   * @throws Error if Kafka publish fails (propagated as HTTP 500)
   */
  async sayHello(name?: string): Promise<string> {
    const message = name ? `Hello ${name}` : 'Hello World';
    const payload = new HelloMessagePayload({ message });
    await this.eventProducer.sendHelloMessage(payload);
    return message;
  }
}
