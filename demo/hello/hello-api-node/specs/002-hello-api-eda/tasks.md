# Tasks: Hello API Node.js — AsyncAPI Event-Driven Architecture

**Feature**: `002-hello-api-eda` | **Branch**: `002-hello-api-eda` | **Date**: 2026-04-29
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)
**Depends on**: `001-hello-api-node` fully operational

---

## Phase 1: Setup — Infrastructure & Tooling

**Goal**: Install dependencies, configure AsyncAPI codegen, and set up Kafka test infrastructure.
**Independent Test**: `npm run generate:events` produces `src/generated/events/HelloMessagePayload.ts` without errors.

- [X] T001 Add `kafkajs`, `@asyncapi/cli`, and `@asyncapi/modelina` to package.json dependencies and devDependencies in `package.json`
- [X] T002 Add `"generate:events"` npm script invoking AsyncAPI modelina CLI in `package.json`: `asyncapi generate models typescript hello-api-java/hello-asyncapi-3-full.yaml -o src/generated/events/`
- [X] T003 Confirm `src/generated/` is in `.gitignore` (add if missing) in `.gitignore`
- [X] T004 Create `docker-compose.test.yml` with `bitnami/kafka:3.7` in KRaft mode (single container, port 9093→9092, no Zookeeper) at project root `docker-compose.test.yml`
- [X] T005 Add `KAFKA_BROKERS`, `KAFKA_CLIENT_ID`, and `KAFKA_TOPIC_HELLO` to `.env.example`
- [X] T006 Run `npm install` to install new deps and verify `npm run generate:events` produces `src/generated/events/HelloMessagePayload.ts`

---

## Phase 2: Foundational — Domain Contracts (blocking prerequisite for all User Stories)

**Goal**: Define the `IEventProducer` interface and verify generated types — the contract all other work depends on.
**Independent Test**: TypeScript compilation (`npm run build`) succeeds with `IEventProducer` interface and `HelloMessagePayload` imported together.

- [X] T007 Create `IEventProducer` interface in `src/services/interfaces/event-producer.interface.ts` with `sendHelloMessage(payload: HelloMessagePayload): Promise<void>`
- [X] T008 [P] Verify generated `src/generated/events/HelloMessagePayload.ts` has `message: string` field; if modelina output requires adjustment (class vs interface), document in `research.md`

---

## Phase 3: User Story 1 — AsyncAPI-First Workflow (P1 MVP)

**Story Goal**: Developer runs `npm run generate:events`, gets strict TypeScript types, implements event publishing in `HelloService`, and validates via tests that each REST call triggers exactly one Kafka event.

**Independent Test**: Unit tests for `HelloService` pass with mocked `IEventProducer` — verifying happy path, Kafka error → HTTP 500, and no event on validation failure.

- [X] T009 [US1] Create `KafkaProducerAdapter` implementing `IEventProducer` in `src/adapters/kafka/kafka-producer.adapter.ts` with `connect()`, `disconnect()`, and `sendHelloMessage()` using `kafkajs` Producer; read `KAFKA_BROKERS`, `KAFKA_CLIENT_ID`, `KAFKA_TOPIC_HELLO` from env vars
- [X] T010 [US1] Extend `HelloService` constructor in `src/services/hello.service.ts` to accept `IEventProducer` via constructor injection; update `sayHello()` to `await eventProducer.sendHelloMessage({ message })` after computing greeting, before returning
- [X] T011 [US1] Update `src/index.ts` to instantiate `KafkaProducerAdapter`, call `connect()` at startup (log error on failure, do not crash app), and pass adapter instance to `HelloService` constructor
- [X] T012 [US1] Update `src/shutdown.ts` SIGTERM handler to call `kafkaProducer.disconnect()` alongside existing cleanup
- [X] T013 [P] [US1] Update `src/services/hello.service.spec.ts` unit tests: inject `jest.fn()` mock for `IEventProducer`; add test cases for: (a) happy path — `sendHelloMessage` called with correct `HelloMessagePayload`, (b) Kafka error thrown → HTTP 500 `ApiErrorResponse` returned, (c) `sendHelloMessage` NOT called when validation fails upstream
- [X] T014 [P] [US1] Add logging in `KafkaProducerAdapter.sendHelloMessage()`: INFO log before send (topic + message summary), ERROR log on failure — using existing logger in `src/logger.ts`

---

## Phase 4: User Story 2 — Live Demo Flow (P1 MVP)

**Story Goal**: The full AsyncAPI-First demo chain works end-to-end: `GET /api/v1/hello/World` returns HTTP 200, a Kafka consumer receives `{"message":"Hello World"}`, and the TypeScript→AsyncAPI mapping is clearly visible.

**Independent Test**: Integration test subscribes to `event.hello.v1` via `kafkajs` Consumer, calls `GET /api/v1/hello/World`, and asserts the received payload matches `HelloMessagePayload` schema.

- [X] T015 [US2] Create `tests/integration/hello-events.spec.ts`: start Kafka consumer subscribed to `event.hello.v1`, call `GET /api/v1/hello` via supertest, assert exactly one message received with `{ "message": "Hello World" }` payload conforming to `HelloMessagePayload` schema
- [X] T016 [P] [US2] Extend `tests/integration/hello-events.spec.ts`: add test for `GET /api/v1/hello/Philippe` → consumer receives `{ "message": "Hello Philippe" }`; add test that invalid name `GET /api/v1/hello/a` returns HTTP 400 and zero events published
- [X] T017 [P] [US2] Add Jest `globalSetup` script `tests/setup-kafka.js` that runs `docker compose -f docker-compose.test.yml up -d --wait` and `globalTeardown` that runs `docker compose -f docker-compose.test.yml down` in `package.json` integration test configuration

---

## Phase 5: User Story 3 — External Consumer Verification (P2)

**Story Goal**: An external consumer subscribing to `event.hello.v1` reliably receives well-formed events, and Kafka unavailability is correctly surfaced as HTTP 500 with no event published.

**Independent Test**: Integration test simulates Kafka unavailability by stopping the container mid-test and verifies HTTP 500 + `ApiErrorResponse` is returned (no stack trace), then restores Kafka and verifies normal operation resumes.

- [X] T018 [US3] Add integration test in `tests/integration/hello-events.spec.ts`: simulate Kafka unavailable (close producer connection), call `GET /api/v1/hello/Alice`, assert HTTP 500 + `ApiErrorResponse` body without stack trace field
- [X] T019 [P] [US3] Add integration test: verify `GET /health` returns HTTP 200 even when Kafka producer is disconnected (health endpoint is independent of Kafka state — FR-022)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Goal**: Ensure FR compliance, code quality, and `.gitignore` hygiene.

- [X] T020 [P] Run `npm run build` (TypeScript strict), `npm run lint`, `npm run format` — fix any errors introduced by EDA changes
- [X] T021 [P] Run `npm test` (all unit + integration) — verify coverage ≥ 80% on new files (`kafka-producer.adapter.ts`, updated `hello.service.ts`)
- [X] T022 Verify `src/generated/events/` is absent from git tracking via `git status` and `git ls-files`; add to `.gitignore` if needed in `.gitignore`
- [X] T023 [P] Update `README.md`: add EDA section documenting `npm run generate:events`, required env vars, and `docker-compose.test.yml` usage

---

## Dependencies

```
Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) → Phase 6 (Polish)

T001 → T002 → T006 → T008           (codegen chain)
T003, T004, T005 parallel with T001  (independent setup tasks)
T007 → T009 → T010 → T011           (core domain chain)
T010 → T012                          (shutdown integration)
T010 → T013                          (unit tests depend on HelloService extension)
T011 + T004 + T017 → T015 → T016    (integration tests depend on wiring + Docker)
T015 → T018 → T019                   (US3 depends on US2 integration tests)
T021 depends on all implementation tasks complete
```

## Parallel Execution

**Within Phase 3 (US1)**:
- T013 [P] (unit tests) can be written alongside T009, T010 — mocks are independent of real Kafka
- T014 [P] (logging) is independent of test work

**Within Phase 4 (US2)**:
- T016 [P] and T017 [P] can be written in parallel once T015 is scaffolded

**Within Phase 6 (Polish)**:
- T020, T021, T022, T023 are all independent and parallelizable

## Implementation Strategy

**MVP scope (Phases 1–3 only)**:
Phases 1–3 deliver the complete AsyncAPI-First workflow: codegen, interface, adapter, extended service, and unit tests with mocked Kafka. This is sufficient to demonstrate the Contract-First EDA pattern at DevFest Nantes without requiring a live Kafka instance.

**Full scope (Phases 1–6)**:
Phases 4–5 add end-to-end integration tests with a real Kafka Docker container, validating consumer receipt and failure scenarios. Phase 6 ensures production-grade code quality and documentation.

---

## Task Summary

| Phase | US | Tasks | Parallelizable |
|-------|----|-------|---------------|
| 1 — Setup | — | T001–T006 | T003, T004, T005 in parallel |
| 2 — Foundational | — | T007–T008 | T008 [P] |
| 3 — US1 (P1 MVP) | US1 | T009–T014 | T013 [P], T014 [P] |
| 4 — US2 (P1 MVP) | US2 | T015–T017 | T016 [P], T017 [P] |
| 5 — US3 (P2) | US3 | T018–T019 | T019 [P] |
| 6 — Polish | — | T020–T023 | T020 [P], T021 [P], T022, T023 [P] |

**Total tasks**: 23
**US1 tasks**: 6 (T009–T014)
**US2 tasks**: 3 (T015–T017)
**US3 tasks**: 2 (T018–T019)
**Parallel opportunities**: 12 tasks marked [P]
**MVP scope**: Phases 1–3 = 14 tasks
