# Internal Service Contract

**Feature**: `002-hello-api-eda`

---

## IEventProducer Interface

**File**: `src/services/interfaces/event-producer.interface.ts`

```typescript
import { HelloMessagePayload } from '../../generated/events/HelloMessagePayload';

export interface IEventProducer {
  /**
   * Publishes a hello message to the Kafka topic `event.hello.v1`.
   * @param payload - The event payload conforming to HelloMessagePayload schema.
   * @throws Error if Kafka is unavailable or the message cannot be acknowledged.
   */
  sendHelloMessage(payload: HelloMessagePayload): Promise<void>;
}
```

**Contract guarantees**:
- Resolves when Kafka acknowledges receipt
- Rejects (throws) on any broker/network error
- No retry logic inside the implementation

---

## HelloService Extension Contract

**File**: `src/services/hello.service.ts` (existing, extended)

### Signature change

```typescript
// Before (feature 001)
constructor() {}
async sayHello(name?: string): Promise<string>

// After (feature 002)
constructor(private readonly eventProducer: IEventProducer) {}
async sayHello(name?: string): Promise<string>
```

### Behaviour contract

| Input | Event Published | Return | HTTP |
|-------|----------------|--------|------|
| No name | `{ message: "Hello World" }` | `"Hello World"` | 200 |
| Valid name (e.g., "Philippe") | `{ message: "Hello Philippe" }` | `"Hello Philippe"` | 200 |
| Kafka error | None (failed attempt) | Throws | 500 |
| *(Invalid name — caught upstream by middleware before service is called)* | None | — | 400 |

---

## KafkaProducerAdapter Contract

**File**: `src/adapters/kafka/kafka-producer.adapter.ts`

```typescript
export class KafkaProducerAdapter implements IEventProducer {
  constructor(private readonly producer: Producer) {}

  async connect(): Promise<void>;     // call at app startup
  async disconnect(): Promise<void>;  // call in SIGTERM handler
  async sendHelloMessage(payload: HelloMessagePayload): Promise<void>;
}
```

**Lifecycle integration**:
- `connect()` integrated into `src/index.ts` startup sequence
- `disconnect()` integrated into `src/shutdown.ts` SIGTERM handler
