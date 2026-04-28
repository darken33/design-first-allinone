/**
 * Unit Tests for HelloService
 * Tests business logic for greeting generation
 */
import { HelloService } from './hello.service';
import type { IHelloService } from './interfaces/hello.service.interface';

describe('HelloService', () => {
  let service: IHelloService;

  beforeEach(() => {
    service = new HelloService();
  });

  describe('sayHello', () => {
    it('should return "Hello World" when called without name', () => {
      const result = service.sayHello();
      expect(result).toBe('Hello World');
    });

    it('should return "Hello World" when called with empty string', () => {
      const result = service.sayHello('');
      expect(result).toBe('Hello World');
    });

    it('should return personalized greeting with valid name', () => {
      const result = service.sayHello('Philippe');
      expect(result).toBe('Hello Philippe');
    });

    it('should handle names with spaces', () => {
      const result = service.sayHello('Jean Paul');
      expect(result).toBe('Hello Jean Paul');
    });

    it('should handle names with hyphens', () => {
      const result = service.sayHello('Marie-Claire');
      expect(result).toBe('Hello Marie-Claire');
    });

    it('should handle names with apostrophes', () => {
      const result = service.sayHello('O\'Brien');
      expect(result).toBe('Hello O\'Brien');
    });

    it('should handle names with commas and periods', () => {
      const result = service.sayHello('Mr. Smith, Jr.');
      expect(result).toBe('Hello Mr. Smith, Jr.');
    });

    it('should preserve exact name format provided', () => {
      const result = service.sayHello('JoHn DoE');
      expect(result).toBe('Hello JoHn DoE');
    });

    it('should work with single character names', () => {
      const result = service.sayHello('A');
      expect(result).toBe('Hello A');
    });

    it('should work with long names', () => {
      const longName = 'A'.repeat(25);
      const result = service.sayHello(longName);
      expect(result).toBe(`Hello ${longName}`);
    });
  });

  describe('Implementation Details', () => {
    it('should be instance of HelloService', () => {
      expect(service).toBeInstanceOf(HelloService);
    });

    it('should implement IHelloService interface', () => {
      expect(service).toHaveProperty('sayHello');
      expect(typeof service.sayHello).toBe('function');
    });

    it('should not modify name parameter', () => {
      const originalName = 'Philippe';
      const result = service.sayHello(originalName);
      expect(originalName).toBe('Philippe');
      expect(result).toContain(originalName);
    });
  });
});
