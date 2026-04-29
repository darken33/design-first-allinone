# Data Model: Hello API Node.js — AsyncAPI Event-Driven Architecture

**Feature**: `002-hello-api-eda` | **Date**: 2026-04-29
**Source of Truth**: `hello-api-java/hello-asyncapi-3-full.yaml`

---

## Entities

### HelloMessagePayload *(generated from AsyncAPI)*

**Source**: `components/schemas/HelloMessagePayload` dans `hello-asyncapi-3-full.yaml`
**Generation**: `@asyncapi/modelina` → `src/generated/events/HelloMessagePayload.ts`
**Persistence**: None (event payload only — no database)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `message` | `string` | pattern: `^Hello .+$` | Greeting message (e.g., "Hello Philippe") |

**TypeScript shape** (generated):
```typescript
export class HelloMessagePayload {
  message: string; // pattern: ^Hello .+$
}
```

**Invariants**:
- `message` MUST start with `"Hello "` followed by at least one character
- `message` is constructed from the greeting result, never from raw user input

---

### IEventProducer *(interface — domain contract)*

**Location**: `src/services/interfaces/event-producer.interface.ts`
**Role**: Port sortant (outgoing port) — abstracts Kafka from domain logic

```typescript
export interface IEventProducer {
  sendHelloMessage(payload: HelloMessagePayload): Promise<void>;
}
```

**Contract**:
- Returns `Promise<void>` on success (message acknowledged by Kafka broker)
- Throws `Error` on failure (connection lost, broker unavailable, timeout)
- MUST be awaited before returning HTTP 200

---

### KafkaProducerAdapter *(Kafka implementation)*

**Location**: `src/adapters/kafka/kafka-producer.adapter.ts`
**Implements**: `IEventProducer`
**Depends on**: `kafkajs` Producer
**Config via env vars**:

| Env Var | Default | Description |
|---------|---------|-------------|
| `KAFKA_BROKERS` | `localhost:9092` | Comma-separated broker addresses |
| `KAFKA_CLIENT_ID` | `hello-api-node` | Kafka client identifier |
| `KAFKA_TOPIC_HELLO` | `event.hello.v1` | Target topic (AsyncAPI channel address) |

**Lifecycle**:
- `connect()` — called once at app startup (failure is logged, does not crash app)
- `disconnect()` — called in SIGTERM handler (integrates with `src/shutdown.ts`)

---

### HelloService *(extended)*

**Location**: `src/services/hello.service.ts` *(existing, extended)*
**New dependency**: `IEventProducer` injected via constructor

**Extended constructor**:
```typescript
constructor(
  private readonly eventProducer: IEventProducer
) {}
```

**Extended `sayHello` flow**:
```
sayHello(name?: string): Promise<string>
  1. Compute greeting message ("Hello World" or "Hello <name>")
  2. Build HelloMessagePayload { message }
  3. await eventProducer.sendHelloMessage(payload)  ← fail-fast, no retry
  4. Return message string
```

---

## State Transitions

```
Request received
      │
      ▼
Validation (zod middleware)
  ├─ FAIL → HTTP 400, no event published
  └─ PASS
        │
        ▼
HelloService.sayHello()
  1. Compute greeting
  2. Build HelloMessagePayload
  3. await sendHelloMessage()
     ├─ ERROR → throw → middleware → HTTP 500, ApiErrorResponse
     └─ OK → return message
              │
              ▼
          HTTP 200 + HelloDto
```

---

## Data Flow

```
GET /api/hello/:name
        │
        ▼
HelloController (existing)
        │
        ▼
HelloService.sayHello(name)
        ├── Compute: message = "Hello " + trimmedName
        ├── Payload: HelloMessagePayload { message }
        └── KafkaProducerAdapter.sendHelloMessage(payload)
                │
                ▼
        kafkajs Producer.send()
                │ topic: event.hello.v1
                ▼
        Kafka Broker
        └── Topic: event.hello.v1
                └── Consumer(s) [out of scope]
```

---

## Entities NOT persisted (stateless)

- `HelloDto` — existing REST response DTO (unchanged)
- `ApiErrorResponse` — existing error DTO (unchanged)
- Routing, middleware, controller — all unchanged

---

## Generated vs Handwritten

| File | Origin | Committed |
|------|--------|-----------|
| `src/generated/events/HelloMessagePayload.ts` | `@asyncapi/modelina` codegen | ❌ `.gitignore` |
| `src/services/interfaces/event-producer.interface.ts` | Handwritten | ✅ |
| `src/adapters/kafka/kafka-producer.adapter.ts` | Handwritten | ✅ |
| `src/services/hello.service.ts` | Existing, extended | ✅ |
