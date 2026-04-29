# HelloAPI Node.js

A Contract-First REST API demo built with Node.js, TypeScript, Express, and OpenAPI.  
Showcased at BordeauxJS Conference as a live Contract-First design workflow demonstration.

## Overview

**Design philosophy**: The OpenAPI spec is the source of truth — types are generated from it, implementation follows it, tests validate it.

```
openapi.yaml → (orval) → src/generated/types.ts → implementation → tests
```

## Prerequisites

- **Node.js**: 20 LTS (`node --version`)
- **npm**: 9+ (`npm --version`)
- **Docker** (optional, for containerized run)
- **kubectl** (optional, for Kubernetes deployment)

## Local Setup

```bash
# Install dependencies
npm install

# Generate TypeScript types from OpenAPI spec
npm run generate:api

# Start dev server (auto-reload)
npm run dev
# Server listening on port 3000
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/v1/hello` | Generic greeting |
| GET | `/api/v1/hello/:name` | Personalized greeting |

```bash
curl http://localhost:3000/health
# {"status":"healthy","uptime":12.3}

curl http://localhost:3000/api/v1/hello
# {"message":"Hello World"}

curl http://localhost:3000/api/v1/hello/Philippe
# {"message":"Hello Philippe"}

# Validation error
curl -i http://localhost:3000/api/v1/hello/a
# HTTP/1.1 400 Bad Request
```

See [API-USAGE.md](specs/001-hello-api-node/API-USAGE.md) for full client documentation.

## Testing

```bash
# Unit tests + coverage
npm test

# Integration tests
npm run test:integration

# Contract tests
npm run test:contract

# All tests with coverage report
npm test -- --coverage
```

Coverage targets: ≥ 80% statements, branches, functions, lines.

## Build

```bash
# Compile TypeScript to dist/
npm run build

# Type check (no emit)
npm run type-check

# Lint
npm run lint

# Format
npm run format
```

## Docker

```bash
# Build image
docker build -t hello-api-node:latest .

# Run container
docker run -p 3000:3000 hello-api-node:latest

# With Docker Compose
docker compose up
```

## Kubernetes Deployment

```bash
# Apply manifests (deployment + service)
kubectl apply -f kubernetes/

# Verify
kubectl get deployments hello-api-node
kubectl get pods -l app=hello-api-node

# Port-forward for local access
kubectl port-forward svc/hello-api-node 3000:3000
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP listen port |
| `NODE_ENV` | `development` | Environment mode |
| `LOG_LEVEL` | `info` | Pino log level |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed origins (comma-separated) |
| `KAFKA_BROKERS` | `localhost:9092` | Comma-separated list of Kafka brokers |
| `KAFKA_CLIENT_ID` | `hello-api-node` | Kafka producer client identifier |
| `KAFKA_TOPIC_HELLO` | `event.hello.v1` | Topic where hello events are published |

Copy `.env.example` to `.env` and adjust as needed.

## Event-Driven Architecture (AsyncAPI)

This service publishes a Kafka event on every `GET /api/v1/hello[/:name]` request.  
The event schema follows the AsyncAPI 3.0 contract in [`hello-api-java/hello-asyncapi-3-full.yaml`](hello-api-java/hello-asyncapi-3-full.yaml).

### Code generation

TypeScript types for the Kafka payload are auto-generated from the AsyncAPI spec via [modelina](https://modelina.org):

```bash
npm run generate:events
# → src/generated/events/HelloMessagePayload.ts (gitignored)
```

Run this command after any change to the AsyncAPI spec or after a clean checkout.

### Published event

**Topic**: `event.hello.v1`  
**Payload** (JSON):
```json
{ "message": "Hello World" }
```

### Running EDA integration tests (requires Docker)

```bash
# Start Kafka, run tests, tear down Kafka automatically:
npm run test:events
```

This uses `docker-compose.test.yml` (bitnami/kafka:3.7, KRaft mode, port 9093).  
Tests in `tests/integration/hello-events.spec.ts` subscribe to `event.hello.v1` and assert payload correctness.

### Architecture

```
GET /api/v1/hello[/:name]
  → HelloController
    → HelloService.sayHello()
      → IEventProducer.sendHelloMessage()     ← interface (domain boundary)
        → KafkaProducerAdapter                ← kafkajs implementation
          → Kafka topic: event.hello.v1
```

Kafka errors propagate via `next(error)` to the centralized error handler → HTTP 500.  
`GET /health` is independent of Kafka state (FR-022).

## Project Structure

```
src/
  adapters/
    kafka/           # KafkaProducerAdapter (kafkajs implementation of IEventProducer)
  api/
    controllers/     # HTTP request handlers
    routes/          # Express route definitions
  config/            # App configuration (Express, middleware, env)
  domain/models/     # Domain types
  generated/         # Auto-generated types from OpenAPI + AsyncAPI (do not edit)
  middleware/        # Express middleware (error handling, logging, validation)
  services/
    interfaces/      # IHelloService, IEventProducer (domain ports)
                     # Business logic
  validations/       # Zod validation schemas
tests/
  contract/          # Contract compliance tests
  integration/       # HTTP integration tests (including hello-events.spec.ts)
  setup-kafka.js     # Jest globalSetup: starts Docker Kafka
  teardown-kafka.js  # Jest globalTeardown: stops Docker Kafka
specs/001-hello-api-node/  # OpenAPI spec and documentation
specs/002-hello-api-eda/   # AsyncAPI EDA spec and documentation
kubernetes/          # Kubernetes manifests
```

## Documentation

**REST API (001)**
- [OpenAPI Spec](specs/001-hello-api-node/openapi.yaml)
- [Feature Spec](specs/001-hello-api-node/spec.md)
- [Technical Plan](specs/001-hello-api-node/plan.md)
- [API Usage Guide](specs/001-hello-api-node/API-USAGE.md)
- [Demo Script](specs/001-hello-api-node/DEMO-SCRIPT.md)
- [QuickStart](specs/001-hello-api-node/quickstart.md)

**EDA / AsyncAPI (002)**
- [AsyncAPI Spec](hello-api-java/hello-asyncapi-3-full.yaml)
- [EDA Feature Spec](specs/002-hello-api-eda/spec.md)
- [EDA Technical Plan](specs/002-hello-api-eda/plan.md)

**General**
- [Contributing](CONTRIBUTING.md)
