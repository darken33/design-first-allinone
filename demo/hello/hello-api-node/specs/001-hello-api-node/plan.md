# Implementation Plan: HelloAPI Node.js – Design-First REST API

**Branch**: `001-hello-api-node` | **Date**: 2026-04-24 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/001-hello-api-node/spec.md`  
**Conference**: BordeauxJS – "Design-First APIs avec OpenAPI & AsyncAPI"

---

## Summary

**Objective**: Create a **production-grade, yet simple** REST API in Node.js/TypeScript that demonstrates Contract-First API design using OpenAPI 3.0. The API exposes two endpoints (`GET /api/v1/hello` and `GET /api/v1/hello/{name}`) plus health checks, entirely generated from an OpenAPI specification.

**Technical Approach**:
1. **Contract-First**: OpenAPI 3.0 YAML is the single source of truth
2. **Code Generation**: TypeScript types/interfaces generated automatically (zero manual edits)
3. **Layered Architecture**: Controllers → Services → Domain (testable layers)
4. **Type Safety**: TypeScript strict mode + Zod validation
5. **Testing**: Unit tests (services) + Integration tests (endpoints via supertest)
6. **Deployment**: Docker + Kubernetes ready (health checks, graceful shutdown)

**Value Proposition for Conference**:
- Demonstrates that OpenAPI is **not just documentation** – it's a **development contract**
- Shows how code generation **prevents bugs** (types catch misalignment)
- Proves that layered architecture is **practical, not over-engineering**
- Proves container-native design is **straightforward** (not magic)

---

## Technical Context

**Language/Version**: TypeScript 5.x+ (strict mode)  
**Runtime**: Node.js 20 LTS (or 22 LTS)  
**Primary Framework**: Express.js 4.x+  
**Primary Dependencies**:
- **openapi-typescript-codegen** (or `orval`): Generate types from OpenAPI YAML
- **zod**: Input validation (matches OpenAPI constraints)
- **jest** (or vitest): Test runner
- **supertest**: HTTP testing library
- **pino** (or winston): Structured logging
- **docker**: Container runtime
- **kubernetes**: Orchestration platform (optional for live demo)

**Secondary Dependencies**:
- **eslint** + **prettier**: Code quality + formatting
- **nodemon**: Dev auto-reload
- **dotenv**: Env var management
- **helmet**: Security headers

**Storage**: None (stateless API) – N/A  
**Testing Framework**: Jest 5.x + Supertest (HTTP)  
**Target Platform**: Linux containers (Docker), Kubernetes clusters  
**Project Type**: Microservice REST API (single, self-contained)  

**Performance Goals**:
- Latency P50: < 20ms (single request)
- Latency P99: < 100ms (with scheduling)
- Throughput: ≥ 500 req/sec per instance
- Startup: < 2 sec cold start
- Memory: < 100MB resident

**Constraints**:
- Response time P99: < 500ms (K8s probe timeout)
- No external dependencies in health check (immediate response)
- Input validation strict: pattern + length constraints enforced
- Error messages: No stacktraces exposed to client

**Scale/Scope**: 2 endpoints + 1 health check = 3 routes, ~500 lines of code (with tests), ~200MB Docker image

---

## Constitution Check

*GATE 1: Must pass before Phase 0 research begins*

The HelloAPI Node.js project adheres to **all 6 core principles** in the Constitution:

| Principle | Requirement | This Project | Status |
|-----------|-------------|--------------|--------|
| **I. Express Microservice-First** | Framework + TypeScript mandatory; DI pattern; Layered architecture | ✅ Express 4.x + TypeScript strict; Layered src/ structure (controllers → services → domain) | ✅ PASS |
| **II. Contract-First Design** | OpenAPI 3.0 source of truth; Auto-generated types; Zero manual edits to DTOs | ✅ OpenAPI 3.0 YAML spec; Code generation via openapi-typescript-codegen; DTOs auto-generated | ✅ PASS |
| **III. Layered Architecture** | Controllers → Services → Domain; Clear separation; No biz logic in config | ✅ `src/api/controllers`, `src/services`, `src/domain/models`; No logic in config/ | ✅ PASS |
| **IV. Test Coverage** | Unit tests (mocked) + Integration tests (real); ≥ 80% coverage; Deterministic | ✅ Jest unit tests for HelloService + Supertest integration tests; isolated, deterministic | ✅ PASS |
| **V. Node.js LTS + TypeScript** | Node 20+; TypeScript strict; ESLint + Prettier; npm audit zero CVEs | ✅ Node 20 LTS; TypeScript strict: true; ESLint/Prettier gates in build | ✅ PASS |
| **VI. Container-Native** | Dockerfile; Health checks; Graceful SIGTERM; K8s-ready; < 2 sec startup | ✅ Multi-stage Dockerfile; GET /health endpoint; SIGTERM handler; K8s liveness probe config | ✅ PASS |

**Constitution Check Result**: ✅ **ALL 6 PRINCIPLES COMPLIANT** – Project can proceed to implementation.

---

## Project Structure

### Documentation (This Feature)

```text
specs/001-hello-api-node/
├── plan.md                    # This file (Architecture plan)
├── spec.md                    # Feature specification (user stories, requirements)
├── openapi.yaml               # OpenAPI 3.0 contract (source of truth)
├── research.md                # Phase 0: Research findings (to be created)
├── data-model.md              # Phase 1: Entity definitions (to be created)
├── quickstart.md              # Phase 1: Setup guide (to be created)
├── contracts/                 # Phase 1: API contracts (to be created)
│   └── hello-api-contract.json # Contract for Pact testing (optional)
├── checklists/
│   └── requirements.md        # Quality validation (created during clarify phase)
└── README.md                  # Overview & navigation
```

### Source Code (Repository Root)

```text
hello-api-node/
├── src/
│   ├── api/
│   │   ├── controllers/       # Express route handlers (req/res orchestration)
│   │   │   └── hello.controller.ts
│   │   └── validations.ts     # Zod/Joi validation schemas (match OpenAPI)
│   ├── services/
│   │   ├── hello.service.ts   # Business logic (HelloService interface + impl)
│   │   └── hello.service.spec.ts    # Unit tests (mocked dependencies)
│   ├── domain/
│   │   ├── models/            # Domain entities (HelloOutput, error models)
│   │   └── errors.ts          # Custom error classes
│   ├── config/
│   │   ├── express.ts         # Express app factory
│   │   ├── middleware.ts      # Error handling, logging middleware
│   │   └── security.ts        # CORS, helmet headers
│   ├── generated/             # Auto-generated from OpenAPI (gitignored)
│   │   ├── types.ts           # TypeScript types (HelloDto, etc.)
│   │   └── api-client.ts      # API client (optional, for testing)
│   ├── health.ts              # Health check endpoint
│   ├── index.ts               # App entry point
│   └── logger.ts              # Structured logging setup (pino)
│
├── tests/
│   ├── integration/
│   │   └── hello.api.spec.ts  # Integration tests (supertest)
│   └── fixtures/              # Test data, mocks
│       └── hello-fixtures.ts
│
├── Dockerfile                 # Multi-stage build (Node build → Alpine runtime)
├── docker-compose.yml         # Local development (optional)
├── .dockerignore              # Docker build optimization
├── .gitignore                 # Generated code, node_modules, etc.
├── .env.example               # Environment variable template
├── tsconfig.json              # TypeScript strict config
├── eslintrc.json              # ESLint rules
├── .prettierrc                # Prettier formatting
├── package.json               # Dependencies + build scripts
├── package-lock.json          # Locked versions
├── jest.config.js             # Jest test runner config
└── kubernetes/                # K8s manifests (optional)
    ├── deployment.yaml        # K8s Deployment (2 replicas)
    ├── service.yaml           # K8s Service (LoadBalancer/ClusterIP)
    └── health-probe.yaml      # Liveness/readiness probes config
```

**Structure Decision**: **Single-project layout** (Option 1 from template – appropriate for microservice)
- Single src/ directory with clear layering (api → services → domain)
- Generated code isolated in src/generated/ (not committed)
- Tests co-located with implementation (src/**/*.spec.ts pattern)
- Infrastructure isolated (Dockerfile, K8s at root)
- Clear separation: **business logic** (no HTTP concerns), **controllers** (no biz logic)

---

## Complexity Tracking

> *No Constitution violations. No complexity justifications needed.*

**Rationale**: Project is deliberately simple (2 business endpoints) to illustrate Contract-First clearly without drowning in complexity. Layered architecture is minimum viable for demonstrating patterns; not over-engineered.

---

## Phase 0: Research & Pre-Design

**Purpose**: Resolve technical questions + validate technology choices  
**Duration**: 2-3 hours research  
**Output**: `research.md` documenting decisions

### Research Tasks

**T0.1 – OpenAPI Code Generation Strategy**
- Question: `openapi-typescript-codegen` vs `orval` – which is better for this use case?
- Research needed: Feature comparison, maturity, community support, DX
- Decision criteria: Ease of integration in build process, quality of generated types
- Output: Selected tool + rationale

**T0.2 – Input Validation Library**
- Question: `zod` vs `joi` – which aligns better with Express + TypeScript strict?
- Research needed: Error message quality, schema definition syntax, performance
- Decision criteria: Contract alignment (OpenAPI constraints) + developer experience
- Output: Selected library + schema examples

**T0.3 – Testing Strategy for Generated Code**
- Question: How to test auto-generated types + validate they match OpenAPI contract?
- Research needed: Contract testing tools (Pact), type guards, integration test patterns
- Decision criteria: Confidence that implementation matches spec
- Output: Testing approach + tool selection

**T0.4 – Docker Image Optimization**
- Question: Multi-stage build with Alpine – what's the achievable image size?
- Research needed: Base images (node:20-alpine, distroless, etc.), build caching
- Decision criteria: < 300MB target, fast deployment
- Output: Dockerfile template + optimization rationale

**T0.5 – GitHub Actions CI/CD Pipeline**
- Question: What stages must run for every commit? (lint, test, build, deploy?)
- Research needed: GitHub Actions templates, secrets management, deployment strategies
- Decision criteria: Fast feedback, zero manual steps
- Output: .github/workflows/ci.yml template

### Research Output File: `research.md`

Format:
```markdown
# Research Summary – HelloAPI Node.js

## R1: OpenAPI Code Generation
**Decision**: Use `orval` (or `openapi-typescript-codegen`)
**Rationale**: [Why this choice]
**Alternatives Considered**: [What else we looked at]
**Evidence**: [Links, benchmarks, community activity]

[Similar format for R2–R5...]
```

---

## Phase 1: Design & Contracts

**Purpose**: Define architecture, data models, API contracts, and implementation approach  
**Duration**: 4-6 hours design + artifact creation  
**Prerequisites**: `research.md` complete  
**Outputs**: `data-model.md`, `contracts/`, `quickstart.md`

### 1a. Data Model Design

**Task: Extract Entities from Spec**

From the spec, entities identified:

| Entity | Fields | Validations | State | Persistence |
|--------|--------|-------------|-------|-------------|
| **HelloOutput** | `message: string` | Required, non-empty | Immutable | Transient (response DTO) |
| **ValidationError** | `timestamp, status, error, message, path` | Required, non-empty | Immutable | Transient (error response) |
| **HealthStatus** | `status: "healthy"\|"degraded"\|"unhealthy"`, `uptime?: number` | Enum, optional | Immutable | Transient (health response) |

**Output File**: `data-model.md`
```markdown
# Data Model – HelloAPI Node.js

## Entities

### HelloOutput (Response DTO – Auto-generated from OpenAPI)
- **Purpose**: Greeting message response
- **Fields**: { message: string }
- **Immutable**: Yes (generated, read-only in code)
- **Generation**: Auto from OpenAPI schema

### ValidationError (Standard HTTP Error Response)
- **Purpose**: Structured error for client
- **Fields**: { timestamp, status, error, message, path }
- **Custom**: Yes (custom error handler)

### HealthStatus (Health Check Response)
- **Purpose**: K8s liveness probe
- **Fields**: { status: "healthy"|"degraded", uptime: number }
- **Immutable**: Yes

## Relationships
- No database relationships (stateless)
- All DTOs are response objects (no request/command objects needed for simple endpoints)

## Validation Rules
- HelloOutput.message: Non-null, non-empty
- HealthStatus.status: Enum (healthy|degraded|unhealthy)
```

### 1b. API Contracts (OpenAPI)

**Task: Finalize OpenAPI Specification**

Contract already defined in `openapi.yaml` (see attachment). Includes:
- 3 paths: `/api/v1/hello`, `/api/v1/hello/{name}`, `/health`
- Schemas: HelloDto, HealthDto, ApiErrorResponse
- Validations: pattern, minLength, maxLength
- HTTP codes: 200, 400, 500, 503

**Output**: `openpapi.yaml` (already created during spec phase) ✅

### 1c. Integration Contracts (Optional – Pact)

**Task: Define Contract Tests (Consumer-Driven Testing)**

For demonstration purposes, contract tests are written as integration tests (supertest), not Pact.

**Output**: `hello.api.spec.ts` (integration test suite)

### 1d. Quickstart Guide

**Task: Create Setup & Demo Instructions**

**Output File**: `quickstart.md`
```markdown
# Quickstart – HelloAPI Node.js

## Prerequisites
- Node.js 20 LTS
- npm 9+
- Docker (optional)
- kubectl (optional, for K8s demo)

## Local Setup (5 min)

1. Clone & install:
   \`\`\`bash
   git clone [repo]
   cd hello-api-node
   npm install
   \`\`\`

2. Generate types from OpenAPI:
   \`\`\`bash
   npm run generate:api
   \`\`\`

3. Run in dev mode:
   \`\`\`bash
   npm run dev
   \`\`\`

4. Test endpoints:
   \`\`\`bash
   curl http://localhost:3000/api/v1/hello
   curl http://localhost:3000/api/v1/hello/Philippe
   curl http://localhost:3000/health
   \`\`\`

5. Run tests:
   \`\`\`bash
   npm test
   npm run test:integration
   \`\`\`

## Docker Build (2 min)

\`\`\`bash
docker build -t hello-api-node .
docker run -p 3000:3000 hello-api-node
\`\`\`

## Kubernetes Deploy (5 min)

\`\`\`bash
kubectl apply -f kubernetes/
kubectl port-forward svc/hello-api-node 3000:3000
curl http://localhost:3000/health
\`\`\`

## Live Demo Flow (25 min)

1. **Show OpenAPI spec** (5 min)
   - Open openapi.yaml in editor
   - Explain paths, parameters, schemas

2. **Generate code** (2 min)
   - Run \`npm run generate:api\`
   - Show generated types in src/generated/

3. **Implement handler** (5 min)
   - Show src/api/controllers/hello.controller.ts
   - Explain orchestration pattern

4. **Run tests** (3 min)
   - \`npm test\` – unit tests pass
   - \`npm run test:integration\` – integration tests pass

5. **Deploy to K8s** (5 min)
   - \`kubectl apply -f kubernetes/\`
   - Show GET /health succeeds
   - Show load balancer routing

6. **Q&A & Learnings** (5 min)
   - Recap: Contract-First benefits
   - Type safety prevents bugs
   - Layered architecture is practical
\`\`\`

---

## Phase 1: Agent Context Update

**Task**: Update AI agent context files with Node.js/TypeScript specifics

**Files to Create/Update**:
- `.instructions.md` (or Copilot instructions) – Add Node.js/TypeScript patterns
- `.specify/copilot-instructions.md` – Add BordeauxJS conference context

**Example Instructions to Add**:
```markdown
# Node.js/TypeScript Development Patterns (HelloAPI)

- Use Express.js for routing (not Fastify for this demo – simpler)
- Use TypeScript strict mode (require @ tsconfig.json)
- Use Zod for input validation (matches OpenAPI constraints)
- Use Jest for testing (not Vitest – Jest is default)
- Use Supertest for HTTP testing (not native http module)
- Use Pino for logging (structured JSON, not console.log)
- Generated code goes in src/generated/ (gitignored)
- No manual DTO edits (regenerate from OpenAPI)
- Validation flow: Extract → Trim → Validate → Use
- Error messages auto-generated by Zod (no custom strings)
```

**Output**: Instructions files updated ✅

---

## Constitution Check (Re-evaluation Post-Design)

*GATE 2: Must pass before Phase 2 tasks begin*

**Re-check all 6 principles** against the architecture plan above:

| Principle | Design Compliance | Status |
|-----------|-------------------|--------|
| **I. Express Microservice-First** | ✅ Express 4.x + TypeScript; src/ layered structure; DI via constructors | ✅ PASS |
| **II. Contract-First Design** | ✅ OpenAPI YAML is single source; Code generation from spec; Zero manual edits to DTOs | ✅ PASS |
| **III. Layered Architecture** | ✅ controllers/ → services/ → domain/; Clear separation; No biz logic in config/ | ✅ PASS |
| **IV. Test Coverage** | ✅ Unit tests (HelloService + mocks) + Integration tests (Supertest); ≥ 80% target | ✅ PASS |
| **V. Node.js LTS + TypeScript** | ✅ Node 20 LTS; TypeScript strict; ESLint/Prettier/npm audit gates | ✅ PASS |
| **VI. Container-Native** | ✅ Multi-stage Dockerfile; /health endpoint; SIGTERM handler; K8s deployment.yaml | ✅ PASS |

**Re-evaluation Result**: ✅ **ALL 6 PRINCIPLES STILL COMPLIANT** – No violations introduced by design.

---

## Build & Deployment Pipeline

### build.ts (npm run build)
1. `npm run lint` – ESLint + Prettier check
2. `npm run type-check` – TypeScript strict compile (tsc --strict)
3. `npm run generate:api` – Regenerate types from OpenAPI
4. `npm run test` – Unit tests
5. `npm run test:integration` – Integration tests
6. `npm run build:dist` – Compile TypeScript to dist/

### Docker Build (Multi-stage)
1. **Stage 1 (Builder)**:
   - Base: node:20-alpine
   - Copy package*.json
   - `npm ci`
   - Copy src/
   - `npm run build:dist` + `npm run generate:api`

2. **Stage 2 (Runtime)**:
   - Base: node:20-alpine (~150MB vs 500MB with full toolchain)
   - Copy dist/, node_modules from builder
   - Health check: curl /health
   - Expose 3000

### Kubernetes Deployment
- 2 replicas (for HA)
- Liveness probe: GET /health every 10s
- Readiness probe: (optional) GET /health immediately
- Resource requests: 128Mi RAM, 200m CPU
- Resource limits: 256Mi RAM, 500m CPU
- Graceful shutdown: 30s termination grace period

### CI/CD Pipeline (GitHub Actions)
1. **On Push to feature branch**:
   - Run `npm run lint`
   - Run `npm run test`
   - Run `npm run test:integration`
   - Build Docker image (but don't push)

2. **On Merge to main**:
   - All above + Docker push to registry
   - Deploy to staging K8s cluster

---

## Success Criteria (Revisited)

**Design Plan enables all 7 Success Criteria from spec**:

| S# | Criterion | Architecture Support |
|----|-----------|---------------------|
| **S1** | Contract-First workflow reproducible | ✅ OpenAPI → code gen → impl → tests cycle clear |
| **S2** | Type safety prevents errors | ✅ All types generated from spec; strict TypeScript |
| **S3** | API conforms to OpenAPI spec | ✅ Generated types enforce contract; tests validate |
| **S4** | Dev loop is fast | ✅ Nodemon + Jest watch mode; watch tests auto-run |
| **S5** | Health check is production-ready | ✅ GET /health endpoint implemented; K8s probe config |
| **S6** | Deployment is straightforward | ✅ Dockerfile + K8s manifests included; one-line deploy |
| **S7** | Conference demo is professional | ✅ 25-min live demo scripted; all components tested |

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| OpenAPI spec not final | Low | Medium | Spec marked "Clarified v1.0.0" – frozen for implementation |
| Code generation tool breaks | Low | High | Research phase validates tool maturity; pin versions in package-lock.json |
| Performance doesn't meet targets | Low | Low | Targets are aspirational; no SLA commitments (POC) |
| Docker image too large | Low | Low | Multi-stage build + Alpine base image; size target < 300MB |
| Live demo environment fails | Medium | High | Local Docker setup as backup; pre-recorded demo as fallback |
| Audience doesn't understand layering | Medium | Medium | Explicit diagram in quickstart; demo highlights each layer |

---

## Timeline

| Phase | Duration | Artifacts | Status |
|-------|----------|-----------|--------|
| **Phase 0 – Research** | 2-3 hours | research.md | Next (start before Phase 1) |
| **Phase 1 – Design** | 4-6 hours | data-model.md, quickstart.md, contracts/ | Next (after research) |
| **Phase 2 – Tasks** | N/A | tasks.md (generated by /speckit.tasks) | After Phase 1 |
| **Implementation** | 10-15 hours | Code (all src/, tests/, Dockerfile, K8s) | After tasks |
| **Demo Prep** | 2-3 hours | Demo script, dry run, Q&A prep | Before conference |

**Conference Date**: BordeauxJS (assumed 2026-Q2)  
**Recommended Start**: 2026-04-25 (tomorrow) – Phase 0 research  
**Target Implementation Complete**: 2026-05-10  
**Target Demo Dry-Run**: 2026-05-15

---

## Dependencies & Prerequisites

**Hard Blockers** (must be resolved before implementation):
- ✅ OpenAPI specification finalised (spec.md v1.0.0 – Clarified)
- ✅ Constitution alignment validated (6/6 principles pass)
- ⏳ Research phase completed (T0.1 through T0.5)

**Soft Prerequisites** (nice-to-have):
- Kubernetes cluster for live K8s demo (can mock with Docker Compose)
- GitHub Actions repo (can run locally first)
- Conference venue WiFi validated (for live demo contingency)

---

## Approval & Sign-Off

| Role | Approval | Notes |
|------|----------|-------|
| **Architecture Lead** | ⏳ Pending | Plan ready for review |
| **Conference Organizer** | ⏳ Pending | Demo feasibility validated |
| **Implementation Lead** | ⏳ Pending | Ready to start Phase 0 research |

---

**Plan Version**: 1.0.0 (Ready for Research Phase)  
**Created**: 2026-04-24  
**Last Updated**: 2026-04-24  
**Next Step**: Execute Phase 0 research → Create `/speckit.plan`'s output (research.md)