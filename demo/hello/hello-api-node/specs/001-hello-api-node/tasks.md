# Tasks: HelloAPI Node.js – Design-First REST API Implementation

**Feature**: `001-hello-api-node` (BordeauxJS Conference Demo)  
**Input**: `spec.md` (3 user stories), `plan.md`, `research.md`, `data-model.md`, `contracts/`  
**Status**: Ready for Phase 2 Implementation  
**Total Tasks**: 48 (organized by phase + story)

---

## Implementation Overview

### Dependencies Graph

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational)
    ├─→ US1 (Developer learns Contract-First)
    │   └─→ US2 (Live demo)
    │       └─→ Phase 4 (Polish & Deployment)
    └─→ US3 (API consumption)
        └─→ Phase 4 (Polish & Deployment)
```

### Parallelization Opportunities

**Setup & Foundational** (Phases 1-2): Sequential (foundational is blocking)  
**User Stories** (US1, US2, US3): Can run in parallel after Foundational complete  
Within each story: Controllers [P] amd Services [P] can run in parallel (then integrate)

### Estimated Timeline

- **Phase 1 (Setup)**: 30 min
- **Phase 2 (Foundational)**: 1-2 hours
- **US1 (Contract setup)**: 1-2 hours
- **US2 (Implementation)**: 2-3 hours
- **US3 (Deployment)**: 1-2 hours
- **Phase 4 (Polish)**: 1 hour
- **Total**: ~8-12 hours (depending on parallelization)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependencies, basic structure  
**Duration**: ~30 min  
**Status**: Must complete before Phase 2

- [ ] T001 Create base directory structure per plan.md in `src/`, `tests/`, `kubernetes/`, `.github/workflows/`
- [ ] T002 Initialize package.json with base dependencies (Express, TypeScript, Node types, zod, jest, supertest, pino)
- [ ] T003 [P] Create tsconfig.json with strict mode enabled (`strict: true`)
- [ ] T004 [P] Create .eslintrc.json with recommended TypeScript rules
- [ ] T005 [P] Create .prettierrc with formatting preferences
- [ ] T006 [P] Create .gitignore with node_modules, dist/, src/generated/, .env
- [ ] T007 [P] Create .env.example with required environment variables (PORT, LOG_LEVEL, NODE_ENV)
- [ ] T008 [P] Create jest.config.js with test configuration (preset: ts-jest)
- [ ] T009 Create package.json npm scripts: dev, build, start, generate:api, test, test:integration, lint, format, type-check

**Checkpoint**: Project structure initialized, build system ready, npm install succeeds

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that all user stories depend on  
**Duration**: ~1-2 hours  
**Status**: Blocking – no user story work starts until complete

### F2.1: Code Generation & Type Safety

- [ ] T010 [P] Install orval and configure orval.config.ts to read `specs/001-hello-api-node/openapi.yaml` and output to `src/generated/types.ts`
- [ ] T011 [P] Run `npm run generate:api` and verify `src/generated/types.ts` contains `HelloDto`, `HealthDto`, `ApiErrorResponse` interfaces
- [ ] T012 [P] Create `src/generated/.gitkeep` file (generated code not committed); verify `.gitignore` excludes `src/generated/`

### F2.2: Validation Setup

- [ ] T013 [P] Install zod (`npm install zod`)
- [ ] T014 Create `src/validations/name.schema.ts` with Zod validation schema matching OpenAPI `name` parameter constraints (minLength: 2, maxLength: 25, pattern, trim)
- [ ] T015 [P] Create `src/validations/index.ts` exporting all validation schemas (NameParamSchema)
- [ ] T016 Create unit test `src/validations/name.schema.spec.ts` verifying schema accepts valid names and rejects invalid ones (edge cases from spec)

### F2.3: Error Handling Middleware

- [ ] T017 Create `src/domain/models/error.ts` defining `ApiErrorResponse` interface with fields: timestamp, status, error, message, path
- [ ] T018 Create `src/middleware/error-handler.ts` implementing Express error handling middleware that catches errors and returns `ApiErrorResponse` in JSON
- [ ] T019 [P] Create `src/middleware/request-logger.ts` implementing Pino-based request logging middleware (logs method, path, status, duration)
- [ ] T020 Create unit test `src/middleware/error-handler.spec.ts` verifying error middleware formats errors correctly

### F2.4: Express App Factory & Configuration

- [ ] T021 Create `src/config/express.ts` implementing Express app factory function that:
  - Creates new Express app instance
  - Applies middleware: logging, CORS, bodyParser
  - Applies error handler middleware (from T018)
  - Returns configured app (not bound to port)
  
- [ ] T022 [P] Create `src/config/middleware.ts` configuring CORS, helmet, bodyParser middleware with sensible defaults
- [ ] T023 [P] Create `src/logger.ts` configuring Pino logger with JSON structured logging
- [ ] T024 [P] Create `src/config/environment.ts` validating and exporting environment variables (PORT, LOG_LEVEL, NODE_ENV)

### F2.5: Health Check Endpoint

- [ ] T025 Create `src/health.ts` as standalone health check handler that:
  - Returns `{ status: "healthy", uptime: process.uptime() }`
  - Responds immediately (no external dependencies)
  - Uses HealthDto from generated types

- [ ] T026 Create integration test `tests/integration/health.api.spec.ts` verifying GET /health returns HTTP 200 with expected structure

### F2.6: Entry Point

- [ ] T027 Create `src/index.ts` as main application entry point that:
  - Imports express app factory from `src/config/express.ts`
  - Registers GET /health endpoint using handler from `src/health.ts`
  - Listens on port from environment (`process.env.PORT`)
  - Logs startup message with port number

- [ ] T028 [P] Create `src/shutdown.ts` implementing graceful SIGTERM handler (closes connections, flushes logs, max 30 sec timeout)
- [ ] T029 Create integration test `tests/integration/app-startup.spec.ts` verifying app starts without errors and runs database/external service checks

### F2.7: Build & Verification

- [ ] T030 Create `Dockerfile` with multi-stage build:
  - Stage 1 (builder): node:20-alpine, npm ci, npm run build, npm run generate:api
  - Stage 2 (runtime): node:20-alpine, copy artifacts, healthcheck, expose 3000, CMD node dist/index.js

- [ ] T031 Run `npm run build` and verify `dist/` contains compiled JavaScript with source maps (if enabled)
- [ ] T032 [P] Run `npm run lint` and verify zero ESLint warnings/errors
- [ ] T033 [P] Run `npm run type-check` and verify TypeScript strict mode has zero errors
- [ ] T034 Run full test suite (`npm test`) and verify all foundational tests pass

**Checkpoint**: Foundation complete – validation works, error handling works, app starts, health check responds – ready for user story implementation

---

## Phase 3: User Story 1 – Developer Learns Contract-First Design (P1) 🎯 MVP

**Goal**: Enable developer to understand and reproduce the Contract-First API design workflow (OpenAPI → Generated Types → Implementation → Tests)

**Independent Test**: Developer can run all Phase 3 tasks in isolation (after Phase 2 complete) and have a working API that passes all acceptance scenarios from spec.md User Story 1

### Tests for User Story 1 (Write FIRST, ensure fail before implementation)

- [ ] T035 [P] [US1] Create contract test `tests/contract/spec-compliance.spec.ts` that:
  - Verifies `src/generated/types.ts` contains expected interfaces (HelloDto, HealthDto, ApiErrorResponse)
  - Validates that generated types match OpenAPI schema exactly (no missing/extra fields)
  - Verifies TypeScript compilation succeeds with strict mode on generated types

- [ ] T036 [P] [US1] Create integration test `tests/integration/hello-contract.spec.ts` verifying:
  - GET /api/hello returns HTTP 200 with `{ message: "Hello World" }`
  - GET /api/hello/{name} accepts valid name and returns personalized greeting
  - Invalid name returns HTTP 400 with structured error
  - Test cases: "Philippe", "Jean Paul", "Marie-Claire", "a" (invalid), "123" (invalid), special chars (invalid)

### Implementation for User Story 1

- [ ] T037 [P] [US1] Create `src/services/interfaces/hello.service.interface.ts` defining `IHelloService` interface with method `sayHello(name: string): string`
- [ ] T038 [P] [US1] Create `src/services/hello.service.ts` implementing `HelloService` class that:
  - Implements `IHelloService`
  - `sayHello(name)` returns concatenated greeting string: `Hello ${name}`

- [ ] T039 [P] [US1] Create unit test `src/services/hello.service.spec.ts` testing HelloService.sayHello() with:
  - Valid names ("Philippe", "Jean Paul", special chars allowed per spec)
  - Error cases (empty string, null, undefined)
  - Coverage: 100% of service code

- [ ] T040 [P] [US1] Create `src/api/controllers/hello.controller.ts` implementing HelloController with handlers:
  - `getHello(req, res)`: Calls service, returns `{ message: string }`
  - `getHelloByName(req, res)`: Extracts name from path param, validates using NameParamSchema, calls service, returns DTO

- [ ] T041 [US1] Create `src/api/routes/hello.routes.ts` registering routes:
  - GET /api/hello → HelloController.getHello
  - GET /api/hello/:name → HelloController.getHelloByName (with validation middleware)

- [ ] T042 [US1] Update `src/index.ts` to:
  - Import and register hello routes from `src/api/routes/hello.routes.ts`
  - Ensure GET /health and hello routes both registered before listen

- [ ] T043 [P] [US1] Create validation middleware `src/middleware/validation.ts` that:
  - Accepts Zod schema as parameter
  - Catches ZodError, converts to ApiErrorResponse, returns HTTP 400
  - Otherwise passes control to next middleware

- [ ] T044 [US1] Update `src/api/routes/hello.routes.ts` to use validation middleware on GET /api/hello/:name route (validates name parameter)

**Checkpoint**: User Story 1 complete – Contract-First workflow functional, all tests pass, API responds correctly

---

## Phase 3: User Story 2 – Live Demo of Contract-First Flow (P1) 🎯 MVP

**Goal**: Enable presenter to run live 25-minute demo during BordeauxJS conference showing: OpenAPI contract definition → code generation → implementation → testing → deployment

**Independent Test**: All Phase 3 User Story 2 tasks can run in parallel with US1 (after Phase 2) and together create a demo-ready application

### Implementation for User Story 2 (Extends US1)

- [ ] T045 [P] [US2] Create demo guide document `specs/001-hello-api-node/DEMO-SCRIPT.md` with:
  - Step-by-step 25-min runthrough (segments: 5+2+5+3+5+5 min)
  - Terminal commands to execute (with expected output)
  - Code snippets to show (OpenAPI, generated types, service, controller)
  - Timing notes for each segment
  - Contingency plans for if something breaks

- [ ] T046 [P] [US2] Create `tests/integration/full-workflow.spec.ts` integration test simulating entire demo workflow:
  - Test that demonstrates all 3 endpoints working
  - Happy path + error paths
  - Validates response structures match generated types

- [ ] T047 [US2] Verify quickstart.md (Part E: Live Demo) contains complete demo script with exact timings and terminal commands

**Checkpoint**: User Story 2 complete – Demo script documented and tested, ready for BordeauxJS presentation

---

## Phase 3: User Story 3 – API Consumption (P2)

**Goal**: Enable external clients (HTTP clients, SDKs, test automation) to call HelloAPI and receive correct responses

**Independent Test**: External HTTP client can call all endpoints per OpenAPI spec and receive valid responses; error responses follow contract

### Implementation for User Story 3

- [ ] T048 [P] [US3] Create `tests/integration/api-consumption.spec.ts` testing API consumption scenarios:
  - curl examples: GET /api/hello, GET /api/hello/Alice, GET /api/hello/invalid
  - Verify Content-Type header is application/json
  - Verify response body structure matches HelloDto
  - Verify error responses have correct structure

- [ ] T049 [US3] Create `src/config/cors.ts` configuring CORS to allow frontend origins (set via environment variable `CORS_ORIGINS`)

- [ ] T050 [P] [US3] Create documentation `specs/001-hello-api-node/API-USAGE.md` with:
  - cURL examples for each endpoint
  - Request/response examples in JSON
  - Error handling guide
  - Rate limiting guidelines (if added post-MVP)

**Checkpoint**: User Story 3 complete – API consumable by external clients, documented

---

## Phase 4: Deployment & Infrastructure (Polish & Cross-cutting)

**Purpose**: Make application production-ready with Kubernetes, Docker registry, CI/CD pipeline

- [ ] T051 [P] Create Kubernetes manifests in `kubernetes/`:
  - `deployment.yaml`: 2 replicas, resource limits (CPU 250m, memory 256Mi), liveness probe on GET /health, readiness probe
  - `service.yaml`: Service exposing port 3000 (ClusterIP or LoadBalancer)
  - Apply SIGTERM handling timeout of 30 sec

- [ ] T052 [P] Create `.github/workflows/ci.yml` with 5 stages:
  - Stage 1: Lint (ESLint) – runs in < 1 min
  - Stage 2: Type-check (TypeScript strict) – runs in < 1 min
  - Stage 3: Unit tests (Jest) with coverage – runs in < 3 min
  - Stage 4: Integration tests (Supertest) – runs in < 3 min
  - Stage 5: Build Docker image – runs in < 5 min
  - Deploy-to-staging (on main branch only) – runs kubectl apply

- [ ] T053 [P] Create `docker-compose.yml` for local development/testing:
  - hello-api-node service: Build from Dockerfile, port 3000, healthcheck
  - Optional: add postgres/redis if needed for future phases

- [ ] T054 [P] Create `.dockerignore` to exclude test files, docs, git history from Docker build context

- [ ] T055 Create `README.md` with:
  - Project overview (Contract-First API demo)
  - Prerequisites (Node 20, npm 9+, Docker, kubectl optional)
  - Local setup (npm install, npm run dev)
  - Testing (npm test, npm run test:integration)
  - Docker (docker build, docker run)
  - Kubernetes deployment (kubectl apply -f kubernetes/)
  - Links to documentation (spec.md, openapi.yaml, quickstart.md)

- [ ] T056 [P] Create CONTRIBUTING.md with:
  - Development workflow
  - Branch naming (spec.md feature branches)
  - Commit message format
  - PR checklist
  - Testing requirements

- [ ] T057 [P] Create security configuration:
  - `src/config/security.ts` applying helmet headers, CSP, X-Frame-Options
  - Configure secure cookie settings (if session/auth added post-MVP)
  - Document security assumptions in README

- [ ] T058 Create `npm audit` fix for any CVE vulnerabilities found during setup

### Docker & Container Validation

- [ ] T059 [P] Build Docker image locally: `docker build -t hello-api-node:test .` and verify:
  - Build succeeds without errors
  - Image size < 300MB (target ~200MB)
  - Image tags correctly

- [ ] T060 [P] Run Docker container: `docker run -p 3000:3000 hello-api-node:test` and verify:
  - Container starts in < 2 sec
  - GET /health responds with HTTP 200
  - GET /api/hello/Docker responds with greeting
  - Container stops cleanly on SIGTERM

### Kubernetes Validation

- [ ] T061 [P] Deploy to local K8s cluster (minikube/kind): `kubectl apply -f kubernetes/` and verify:
  - Deployment creates 2 replicas
  - Pods reach Running state
  - Liveness probe passes (GET /health returns 200)
  - Service is accessible on port 3000

- [ ] T062 [P] Run smoke test in K8s: `kubectl run -it curl... -- curl http://hello-api-node:3000/api/hello/Kubernetes` and verify response

### Documentation Completeness

- [ ] T063 [P] Verify all documentation files exist and have been created:
  - ✅ spec.md (v1.0.0)
  - ✅ plan.md (v1.0.0)
  - ✅ research.md (v1.0.0)
  - ✅ data-model.md (v1.0.0)
  - ✅ contracts/ (4 files)
  - ✅ quickstart.md (v1.0.0)
  - ✅ README.md (api overview)
  - ✅ DEMO-SCRIPT.md (live demo guide)
  - ✅ API-USAGE.md (client guide)
  - ✅ CONTRIBUTING.md (developer guide)

- [ ] T064 [P] Verify TypeScript strict mode compiles entire codebase without warnings: `npm run type-check`

- [ ] T065 [P] Verify all tests pass and coverage targets met: `npm test -- --coverage` (target: ≥ 80%)

- [ ] T066 Run final validation suite:
  - Code quality: `npm run lint` (0 errors)
  - Formatting: `npm run format` (0 issues)
  - Security: `npm audit` (0 vulnerabilities)
  - TypeScript: `npm run type-check` (0 errors)
  - Tests: `npm test && npm run test:integration` (100% pass)
  - Build: `npm run build` (succeeds in < 10 sec)

**Checkpoint**: Application production-ready – all phases complete, full CI/CD pipeline in place, documentation complete

---

## Success Criteria Verification Checklist

### S1: Contract-First Workflow Reproducibility ✅

- [ ] Developer can `npm run generate:api` → types generated in < 30 sec
- [ ] TypeScript types match OpenAPI schema (test in T035)
- [ ] Integration tests validate contract compliance (test in T036)
- [ ] Zero manual type edits required

### S2: Type Safety Prevents Errors ✅

- [ ] Changing OpenAPI breaks TypeScript build (intentional)
- [ ] Developer fixes code → build succeeds
- [ ] Zero runtime type errors in production

### S3: API Conforms to OpenAPI ✅

- [ ] Integration tests validate all endpoints (T036, T048)
- [ ] Error responses follow ApiErrorResponse structure
- [ ] All response codes match OpenAPI (200, 400, 500, 503)

### S4: Development Loop is Fast ✅

- [ ] Build time (clean): < 10 sec (T031)
- [ ] Test execution: < 5 sec per suite (T034)
- [ ] Dev server reload (nodemon): < 2 sec (package.json scripts)

### S5: Health Check is Production-Ready ✅

- [ ] GET /health responds 100% reliability (T026)
- [ ] Response time < 500ms (integration test)
- [ ] K8s liveness probe passes (T061)

### S6: Deployment is Straightforward ✅

- [ ] Dockerfile builds on first try (T031, T059)
- [ ] Image size < 300MB (T059)
- [ ] K8s deployment succeeds in 1 command (T061)

### S7: Conference Demo is Professional ✅

- [ ] All endpoints work in demo (T046)
- [ ] Generated code is visible & understandable (demo script T045)
- [ ] No build failures during demo (T034 validation)
- [ ] Demo script tested end-to-end (T046)

---

## Parallel Execution Examples

### Example 1: Fast Implementation Path (Minimum)

Run sequentially:
1. Phase 1 (Setup) – 30 min
2. Phase 2 (Foundational) – 1-2 hours
3. **US1+US2 in parallel** (Developer learns + demo ready) – 2-3 hours
4. Phase 4 (Deployment) – 1 hour
5. **Total: ~5-7 hours**

### Example 2: Full Implementation Path (Production)

Run sequentially:
1. Phase 1 (Setup) – 30 min
2. Phase 2 (Foundational) – 1-2 hours
3. **US1+US2+US3 all in parallel** – 2-4 hours
4. Phase 4 (Deployment) – 1-2 hours
5. **Total: ~8-12 hours**

### Example 3: Optimized for Conference Demo

Prioritize:
1. Phase 1 (Setup) – ASAP
2. Phase 2 (Foundational) – ASAP
3. **US1+US2 in parallel** (focus here)
4. Skip US3 if time constrained (API consumption can be demonstrated verbally)
5. Phase 4 (Deployment) – after demo

---

## Dependencies Map

```
T001-T009 (Setup)
    ↓
T010-T034 (Foundational) — BLOCKING
    ├─→ T035-T044 (US1: Contract-First)
    │   └─→ T045-T047 (US2: Live Demo)
    │       └─→ T051-T066 (Phase 4: Deployment)
    │
    └─→ T048-T050 (US3: API Consumption)
        └─→ T051-T066 (Phase 4: Deployment)
```

---

## Quality Gates

### Gate 1: Foundational Complete (After T034)
- ✅ All foundational tests pass
- ✅ `npm run lint` zero errors
- ✅ `npm run type-check` zero errors
- ✅ Application starts without errors
- ✅ GET /health responds with HTTP 200

### Gate 2: User Story 1 Complete (After T044)
- ✅ All US1 tests pass (T035, T036, T039)
- ✅ Both GET endpoints functional and tested
- ✅ Validation errors return HTTP 400 with correct format
- ✅ Generated types used without `any` types
- ✅ 100% code coverage for HelloService

### Gate 3: User Story 2 Complete (After T047)
- ✅ Demo script documented and tested end-to-end
- ✅ All demo steps execute in < 25 min
- ✅ Demo passes all acceptance scenarios
- ✅ No build failures during demo

### Gate 4: Deployment Ready (After T066)
- ✅ Docker image builds successfully
- ✅ Docker image size < 300MB
- ✅ Kubernetes deployment succeeds
- ✅ All tests pass (unit + integration)
- ✅ Code quality gates satisfied (lint, type-check, audit)
- ✅ Documentation complete

---

## Task Completion Tracking

**To track progress**: ✅ Mark tasks as completed as they're finished  
**To resume work**: Find last completed task and continue from next one  
**To parallelize**: After Foundational gate (T034), US1/US2/US3 can run independently

---

**Tasks Version**: 1.0.0  
**Generated**: 2026-04-24  
**Next Step**: Begin Phase 1 Setup (T001-T009)