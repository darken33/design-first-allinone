/**
 * Unit Tests for HelloService
 * Tests greeting generation and Kafka event publishing behaviour.
 */
import { HelloService } from './hello.service';
import type { IHelloService } from './interfaces/hello.service.interface';
import type { IEventProducer } from './interfaces/event-producer.interface';
import HelloMessagePayload from '../generated/events/HelloMessagePayload';

const makeEventProducer = (impl?: Partial<IEventProducer>): jest.Mocked<IEventProducer> =>
  ({
    sendHelloMessage: jest.fn().mockResolvedValue(undefined),
    ...impl
  }) as jest.Mocked<IEventProducer>;

describe('HelloService', () => {
  let mockProducer: jest.Mocked<IEventProducer>;
  let service: IHelloService;

  beforeEach(() => {
    mockProducer = makeEventProducer();
    service = new HelloService(mockProducer);
  });

  describe('sayHello — greeting message', () => {
    it('should return "Hello World" when called without name', async () => {
      const result = await service.sayHello();
      expect(result).toBe('Hello World');
    });

    it('should return "Hello World" when called with empty string', async () => {
      const result = await service.sayHello('');
      expect(result).toBe('Hello World');
    });

    it('should return personalized greeting with valid name', async () => {
      const result = await service.sayHello('Philippe');
      expect(result).toBe('Hello Philippe');
    });

    it('should handle names with spaces', async () => {
      expect(await service.sayHello('Jean Paul')).toBe('Hello Jean Paul');
    });

    it('should handle names with hyphens', async () => {
      expect(await service.sayHello('Marie-Claire')).toBe('Hello Marie-Claire');
    });

    it('should handle names with apostrophes', async () => {
      expect(await service.sayHello("O'Brien")).toBe("Hello O'Brien");
    });

    it('should preserve exact name format provided', async () => {
      expect(await service.sayHello('JoHn DoE')).toBe('Hello JoHn DoE');
    });

    it('should work with long names', async () => {
      const longName = 'A'.repeat(25);
      expect(await service.sayHello(longName)).toBe(`Hello ${longName}`);
    });
  });

  describe('sayHello — event publishing (happy path)', () => {
    it('should call sendHelloMessage once per request (no name)', async () => {
      await service.sayHello();
      expect(mockProducer.sendHelloMessage).toHaveBeenCalledTimes(1);
    });

    it('should call sendHelloMessage with correct payload for "Hello World"', async () => {
      await service.sayHello();
      const [payload]: [HelloMessagePayload] = mockProducer.sendHelloMessage.mock.calls[0] as [
        HelloMessagePayload
      ];
      expect(payload.message).toBe('Hello World');
    });

    it('should call sendHelloMessage with correct payload for named greeting', async () => {
      await service.sayHello('Philippe');
      const [payload]: [HelloMessagePayload] = mockProducer.sendHelloMessage.mock.calls[0] as [
        HelloMessagePayload
      ];
      expect(payload.message).toBe('Hello Philippe');
    });

    it('should await event publishing before returning', async () => {
      const order: string[] = [];
      mockProducer.sendHelloMessage.mockImplementation(async () => {
        order.push('event');
      });
      const result = await service.sayHello('Alice');
      order.push('returned');
      expect(order).toEqual(['event', 'returned']);
      expect(result).toBe('Hello Alice');
    });
  });

  describe('sayHello — Kafka error handling (FR-004)', () => {
    it('should propagate Kafka error so middleware returns HTTP 500', async () => {
      mockProducer.sendHelloMessage.mockRejectedValue(new Error('Kafka broker unavailable'));
      await expect(service.sayHello('Alice')).rejects.toThrow('Kafka broker unavailable');
    });

    it('should not return a greeting when Kafka publish fails', async () => {
      mockProducer.sendHelloMessage.mockRejectedValue(new Error('timeout'));
      let result: string | undefined;
      try {
        result = await service.sayHello();
      } catch {
        // expected
      }
      expect(result).toBeUndefined();
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
  });
});
