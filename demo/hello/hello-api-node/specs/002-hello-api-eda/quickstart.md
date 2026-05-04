# Quickstart: Hello API Node.js — AsyncAPI Event-Driven Architecture

**Feature**: `002-hello-api-eda` | **Depends on**: feature `001-hello-api-node` fully operational

---

## Prerequisites

- Node.js 20+ LTS
- npm 9+
- Docker (for Kafka integration tests)
- Feature `001-hello-api-node` already implemented and passing all tests

---

## 1. Install new dependencies

```bash
npm install kafkajs
npm install --save-dev @asyncapi/cli @asyncapi/modelina
```

---

## 2. Generate TypeScript event types

```bash
npm run generate:events
```

Add to `package.json`:
```json
"generate:events": "asyncapi generate models typescript hello-api-java/hello-asyncapi-3-full.yaml -o src/generated/events/"
```

Generated output: `src/generated/events/HelloMessagePayload.ts`

> `src/generated/` is already in `.gitignore` — no further config needed.

---

## 3. Implement the event producer interface

Create `src/services/interfaces/event-producer.interface.ts`:

```typescript
import { HelloMessagePayload } from '../../generated/events/HelloMessagePayload';

export interface IEventProducer {
  sendHelloMessage(payload: HelloMessagePayload): Promise<void>;
}
```

---

## 4. Implement the Kafka adapter

Create `src/adapters/kafka/kafka-producer.adapter.ts`:

```typescript
import { Kafka, Producer } from 'kafkajs';
import { IEventProducer } from '../../services/interfaces/event-producer.interface';
import { HelloMessagePayload } from '../../generated/events/HelloMessagePayload';

export class KafkaProducerAdapter implements IEventProducer {
  private producer: Producer;

  constructor() {
    const kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID ?? 'hello-api-node',
      brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
    });
    this.producer = kafka.producer();
  }

  async connect(): Promise<void> {
    await this.producer.connect();
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
  }

  async sendHelloMessage(payload: HelloMessagePayload): Promise<void> {
    await this.producer.send({
      topic: process.env.KAFKA_TOPIC_HELLO ?? 'event.hello.v1',
      messages: [{ value: JSON.stringify(payload) }],
    });
  }
}
```

---

## 5. Extend HelloService

Update `src/services/hello.service.ts` to accept `IEventProducer`:

```typescript
// Add to constructor
constructor(private readonly eventProducer: IEventProducer) {}

// Extend sayHello
async sayHello(name?: string): Promise<string> {
  const message = name ? `Hello ${name.trim()}` : 'Hello World';
  await this.eventProducer.sendHelloMessage({ message });
  return message;
}
```

---

## 6. Wire up in application bootstrap

Update `src/index.ts`:

```typescript
const kafkaProducer = new KafkaProducerAdapter();
await kafkaProducer.connect(); // best-effort — logs error if Kafka unavailable

const helloService = new HelloService(kafkaProducer);
// ... rest of Express setup
```

Update `src/shutdown.ts` to disconnect Kafka on SIGTERM:

```typescript
await kafkaProducer.disconnect();
```

---

## 7. Run unit tests

```bash
npm test -- --testPathPattern="hello.service"
```

All unit tests mock `IEventProducer` — no Kafka required.

---

## 8. Run integration tests with Kafka

Start the test Kafka instance:

```bash
docker compose -f docker-compose.test.yml up -d
npm run test:integration
docker compose -f docker-compose.test.yml down
```

---

## 9. Verify end-to-end

With Kafka running locally (`localhost:9092`):

```bash
# Start the API
npm run dev

# In another terminal — call the API
curl http://localhost:3000/api/v1/hello
curl http://localhost:3000/api/v1/hello/Philippe

# Consume the events (kafka CLI or kafkacat)
kafka-console-consumer --bootstrap-server localhost:9092 --topic event.hello.v1 --from-beginning
```

Expected event:
```json
{"message":"Hello Philippe"}
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `KAFKA_BROKERS` | `localhost:9092` | Comma-separated broker list |
| `KAFKA_CLIENT_ID` | `hello-api-node` | Kafka client identifier |
| `KAFKA_TOPIC_HELLO` | `event.hello.v1` | Target topic |
