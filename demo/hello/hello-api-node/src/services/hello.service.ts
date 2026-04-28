/**
 * HelloService Implementation
 * Implements IHelloService with business logic for greeting
 */
import type { IHelloService } from './interfaces/hello.service.interface';

export class HelloService implements IHelloService {
  /**
   * Generate a greeting message
   * @param name - Optional name to greet
   * @returns Personalized greeting or "Hello World" if no name provided
   */
  sayHello(name?: string): string {
    if (!name) {
      return 'Hello World';
    }
    return `Hello ${name}`;
  }
}
