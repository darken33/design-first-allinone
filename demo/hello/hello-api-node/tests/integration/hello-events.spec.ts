/**
 * EDA Integration Tests — Kafka Event Publishing
 *
 * Verifies:
 *   T015 — GET /api/v1/hello publishes a HelloMessagePayload event to event.hello.v1
 *   T016 — Named greeting publishes correct payload; invalid name produces no event
 *   T018 — Kafka unavailable surfaces as HTTP 500 ApiErrorResponse (no stack trace)
 *   T019 — GET /health returns HTTP 200 independent of Kafka state (FR-022)
 *
 * T015/T016 require a live Kafka broker (started via globalSetup in jest.eda.config.js).
 * T018/T019 use a mock producer and run in any environment.
 */
import request from 'supertest';
import type { Express } from 'express';
import type { Consumer } from 'kafkajs';
import { Kafka, logLevel } from 'kafkajs';
import { KafkaProducerAdapter } from '../../src/adapters/kafka/kafka-producer.adapter';
import { HelloService } from '../../src/services/hello.service';
import { createApp } from '../../src/config/express';

// ─── Helpers ────────────────────────────────────────────────────────────────

const TEST_TOPIC = process.env.KAFKA_TOPIC_HELLO ?? 'event.hello.v1';

/**
 * Returns a function that collects Kafka messages from a dedicated consumer.
 * The consumer uses a unique group ID so it never reuses offsets across runs.
 */
function makeMessageCollector(kafka: Kafka) {
  let consumer: Consumer | null = null;
  const received: Array<Record<string, unknown>> = [];

  async function start(): Promise<void> {
    consumer = kafka.consumer({ groupId: `test-collector-${Date.now()}` });
    await consumer.connect();
    await consumer.subscribe({ topic: TEST_TOPIC, fromBeginning: false });
    await consumer.run({
      eachMessage: async ({ message }) => {
        const raw = message.value?.toString() ?? '{}';
        received.push(JSON.parse(raw) as Record<string, unknown>);
      }
    });
    // Allow the consumer group to finish rebalancing before the test sends events
    await new Promise<void>((resolve) => setTimeout(resolve, 1000));
  }

  async function stop(): Promise<void> {
    await consumer?.disconnect();
    consumer = null;
  }

  function drain(): Array<Record<string, unknown>> {
    const copy = [...received];
    received.length = 0;
    return copy;
  }

  function waitForCount(n: number, timeoutMs = 10000): Promise<void> {
    return new Promise((resolve, reject) => {
      const deadline = Date.now() + timeoutMs;
      const interval = setInterval(() => {
        if (received.length >= n) {
          clearInterval(interval);
          resolve();
        } else if (Date.now() > deadline) {
          clearInterval(interval);
          reject(
            new Error(`Timeout: expected ${n} message(s), got ${received.length} on ${TEST_TOPIC}`)
          );
        }
      }, 100);
    });
  }

  return { start, stop, drain, waitForCount, received };
}

// ─── Section 1: Live Kafka tests (T015, T016) ────────────────────────────────

describe('Hello Events — live Kafka integration (T015/T016)', () => {
  let app: Express;
  let kafkaProducer: KafkaProducerAdapter;
  let collector: ReturnType<typeof makeMessageCollector>;

  beforeAll(async () => {
    const brokers = (process.env.KAFKA_BROKERS ?? 'localhost:9093').split(',');
    const kafka = new Kafka({ clientId: 'test-app', brokers, logLevel: logLevel.ERROR });

    kafkaProducer = new KafkaProducerAdapter();
    await kafkaProducer.connect();

    const helloService = new HelloService(kafkaProducer);
    app = createApp(helloService);

    collector = makeMessageCollector(kafka);
    await collector.start();
  }, 30000);

  afterAll(async () => {
    await collector.stop();
    await kafkaProducer.disconnect();
  }, 15000);

  beforeEach(() => {
    collector.drain(); // clear any messages from previous test
  });

  // T015 ─────────────────────────────────────────────────────────────────────

  it('T015 — GET /api/v1/hello publishes {"message":"Hello World"} to event.hello.v1', async () => {
    const response = await request(app).get('/api/v1/hello').expect(200);
    expect(response.body).toEqual({ message: 'Hello World' });

    await collector.waitForCount(1);
    expect(collector.received[0]).toEqual({ message: 'Hello World' });
  }, 20000);

  // T016 ─────────────────────────────────────────────────────────────────────

  it('T016 — GET /api/v1/hello/Philippe publishes {"message":"Hello Philippe"}', async () => {
    await request(app).get('/api/v1/hello/Philippe').expect(200);

    await collector.waitForCount(1);
    expect(collector.received[0]).toEqual({ message: 'Hello Philippe' });
  }, 20000);

  it('T016 — GET /api/v1/hello/a (invalid) returns HTTP 400 and publishes no event', async () => {
    await request(app).get('/api/v1/hello/a').expect(400);

    // Wait briefly to confirm no message arrives
    await new Promise<void>((resolve) => setTimeout(resolve, 2000));
    expect(collector.received).toHaveLength(0);
  }, 10000);
});

// ─── Section 2: Resilience tests — no live Kafka needed (T018, T019) ────────

describe('Hello Events — resilience (T018/T019)', () => {
  const failingProducer = {
    sendHelloMessage: jest.fn().mockRejectedValue(new Error('Kafka broker unreachable'))
  };
  let resilientApp: Express;

  beforeAll(() => {
    const failingService = new HelloService(failingProducer as any);
    resilientApp = createApp(failingService);
  });

  // T018 ─────────────────────────────────────────────────────────────────────

  it('T018 — Kafka unavailable returns HTTP 500 ApiErrorResponse (no stack trace)', async () => {
    const response = await request(resilientApp).get('/api/v1/hello/Alice').expect(500);

    expect(response.body).toHaveProperty('status', 500);
    expect(response.body).toHaveProperty('error');
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).not.toHaveProperty('stack');
  });

  // T019 ─────────────────────────────────────────────────────────────────────

  it('T019 — GET /health returns HTTP 200 even when Kafka producer is failing (FR-022)', async () => {
    const response = await request(resilientApp).get('/health').expect(200);

    expect(response.body.status).toBe('healthy');
    expect(typeof response.body.uptime).toBe('number');
  });
});
