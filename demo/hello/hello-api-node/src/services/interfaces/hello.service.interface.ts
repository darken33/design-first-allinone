/**
 * HelloService Interface
 * Defines contract for Hello service business logic
 */
export interface IHelloService {
  /**
   * Generate a greeting message
   * @param name - The name to greet (optional)
   * @returns Greeting message
   */
  sayHello(name?: string): string;
}
