# Feature Specification: HelloAPI Node.js – Design-First REST API

**Feature Branch**: `001-hello-api-node`  
**Created**: 2026-04-24  
**Status**: Draft  
**Input**: User description: "HelloAPI Node.js – Design-First démonstration pour BordeauxJS. Port de l'API Java en TypeScript/Express avec OpenAPI Contract-First"

**Conference Context**: BordeauxJS – "Design-First APIs avec OpenAPI & AsyncAPI"  
**Demo Objective**: Montrer comment construire une API production-grade en partant d'un contrat OpenAPI 3.0, générer du code TypeScript, puis implémenter les handlers.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 – Développeur apprend Contract-First Design (Priority: P1) 🎯 MVP

**Context**: Durant la conférence BordeauxJS, un développeur assiste à la démo live.

**Why this priority**: C'est le cœur pédagogique de la conférence. Sans compréhension du workflow Contract-First, le reste n'a pas de valeur.

**User Flow**:
1. Voir le **contrat OpenAPI** (`hello-api-openapi.yaml`) définissant 2 endpoints
2. Comprendre la structure: `paths → parameters → responses → schemas`
3. Voir la **génération de code** TypeScript depuis le YAML
4. Constater que les **types TypeScript** sont auto-générés (DTOs, interfaces)
5. Implémenter les **handlers** en confiance (types safety)
6. Valider avec **tests** que l'implémentation respecte le contrat

**Independent Test**: Valider que le contrat OpenAPI + code généré + tests d'intégration forment un cycle cohérent et reproductible.

**Acceptance Scenarios**:

1. **Given** Developer ouvre le repo, **When** Execute `npm run generate:api`, **Then** Types TypeScript générés matchent le schema OpenAPI 100%
   - Types générés: `HelloDto`, `HelloApiClient`, etc.
   - Aucune modification manuelle requise
   - Types strictement typés (pas `any`)

2. **Given** Developer implémente le handler `GET /api/v1/hello/:name`, **When** Lance tests d'intégration `npm run test:integration`, **Then** Tous les contrats passent (happy path + validation)
   - Endpoint retourne HTTP 200 + `{"message": "Hello Philippe"}`
   - Validation `name` appliquée (minLength: 2, maxLength: 25, pattern)
   - Validation échouée → HTTP 400 + erreur structurée

3. **Given** Developer veut ajouter un nouveau paramètre, **When** Modifie le YAML OpenAPI, **Then** Les types TypeScript se régénèrent, et la compilation TypeScript révèle les points d'impact
   - Type safety previent regressions
   - DevX excellent (IDE autocomplete)

---

### User Story 2 – Démonstration live de la flow Contract-First (Priority: P1) 🎯 MVP

**Context**: Présentateur live à BordeauxJS exécute les étapes devant l'audience.

**Why this priority**: La démo live doit être smooth, reproductible, et montrer immédiatement la valeur du Design-First.

**User Flow**:
1. Montrer le **OpenAPI YAML** (5 min) → structure simple, 2 endpoints
2. Lancer `npm run generate:api` (2 min) → types générés en temps réel
3. Implémenter **un handler manquant** (5 min) → IDE montre les erreurs de type
4. Ajouter **tests d'intégration** (3 min) → tests passent ✅
5. Montrer le **déploiement K8s** (5 min) → app tourne stable

**Independent Test**: Démo complète (début à fin) prend < 25 min, zéro erreur, zéro magie cachée.

**Acceptance Scenarios**:

1. **Given** Présentateur clone le repo, **When** Exécute `npm install && npm run build && npm test`, **Then** Tous les tests passent en < 30 sec, aucune erreur
   - Code génération automatique
   - Typage strict compile
   - Tests intégration rapides

2. **Given** Contrat OpenAPI affiché, **When** Audience voit la corrélation avec les types TypeScript générés, **Then** Comprend clairement le mapping 1:1
   - Schéma JSON dans YAML → Interface TypeScript
   - Path paramètres → Function signature
   - Response codes → HTTP status in code

3. **Given** Déploiement K8s lancé, **When** App démarre, **Then** Health check répond en < 2 sec
   - `GET /health` → `{ "status": "healthy" }`
   - Load balancer considère l'instance ready

---

### User Story 3 – Utilisateur consomme l'API (Priority: P2)

**Context**: Client HTTP (navigateur, client, test automation) appelle l'API.

**Why this priority**: Fonctionnalité secondaire ; le focus est sur la construction, pas sur la consommation.

**User Flow**:
1. Appeler `GET /api/v1/hello` → reçoit salutation générique
2. Appeler `GET /api/v1/hello/Philippe` → reçoit salutation personnalisée
3. Paramètre invalide → reçoit erreur clara (HTTP 400)

**Independent Test**: API fonctionne comme documenté dans OpenAPI.

**Acceptance Scenarios**:

1. **Given** API tourne (POST-deployment), **When** Client HTTP envoie `GET /api/v1/hello`, **Then** Retourne HTTP 200 + `{ "message": "Hello World" }`
   - Content-Type: application/json
   - Body is valid JSON

2. **Given** Paramètre `name` fourni, **When** Envoie `GET /api/v1/hello/Alice`, **Then** Retourne HTTP 200 + `{ "message": "Hello Alice" }`
   - Interpolation correcte
   - Aucune injection vulnérabilité (safe string concat)

3. **Given** Paramètre invalide (ex: "a" = trop court), **When** Envoie `GET /api/v1/hello/a`, **Then** Retourne HTTP 400 + erreur structurée
   - Message: "name must be between 2 and 25 characters"
   - Path du paramètre fautif indiqué

---

### Edge Cases

- **What happens when** `name` parameter is empty string `""`?
  → HTTP 400 (minLength: 2 violation)

- **What happens when** `name` contains special characters not in pattern (ex: `name="; DROP TABLE users; --"`)?
  → HTTP 400 (pattern validation fails, safely)

- **What happens when** `name` exceeds max length (25 chars)?
  → HTTP 400 (maxLength violation)

- **What happens when** API is restarting or unhealthy?
  → GET /health returns HTTP 503 or 200 with `{ "status": "degraded" }`
  → K8s probe detects and removes from load balancer

---

## Clarifications

### Session 2026-04-24

- Q1: Endpoint signature (path vs query parameter, default greeting)? → A: **Option A – Path Parameter**
  - Two endpoints: `GET /api/v1/hello` (generic) + `GET /api/v1/hello/{name}` (with required path param)
  - Clean, RESTful URLs: `/api/v1/hello/Philippe`
  - No query parameter ambiguities
  - No "default parameter" complexity

- Q2: Whitespace handling in `name` parameter? → A: **Option A – Trim THEN Validate**
  - Flow: `" Philippe "` → trim → `"Philippe"` → validate → message: `"Hello Philippe"`
  - Rationale: User-friendly (prevents unnecessary HTTP 400), intelligent normalization
  - HTTP 400 only if validation fails AFTER trimming

- Q3: Error message format for validation failures? → A: **Option A – Auto-generated by Zod/Joi**
  - Validation library generates standard messages
  - Examples: `"name must be at least 2 characters"`, `"name format is invalid"`
  - Zero custom messages; consistent with industry standard
  - No maintenance burden

- Q4: Performance benchmarks baseline? → A: **Option A – Standard Development Baseline**
  - Baseline: Modern laptop (M1/16GB RAM)
  - Scope: Runtime only (after Express boot, TypeScript compiled)
  - Load: Single request (realistic for P50), or moderate concurrency (P99)
  - Measurement: Node.js profiling tools (clinic, 0x) or basic timing
  - Sufficient for POC demo

---

## Requirements *(mandatory)*

### Functional Requirements – API Endpoints

- **FR-001**: Endpoint `GET /api/v1/hello` MUST return HTTP 200 with JSON `{ "message": "Hello World" }` (no parameters)
- **FR-002**: Endpoint `GET /api/v1/hello/{name}` MUST accept `name` as required path parameter
- **FR-003**: Parameter `name` MUST satisfy constraints: minLength=2, maxLength=25, pattern=`^[a-zA-Z ,.'-]+$`
- **FR-004**: Response MUST include `Content-Type: application/json` header
- **FR-005**: Invalid `name` parameter MUST return HTTP 400 Bad Request with structured error JSON
- **FR-006**: Error response MUST include `message` explaining validation failure (no stacktrace)
- **FR-007**: Response HTTP 200 MUST contain exact JSON schema: `{ "message": string }`

### Functional Requirements – Health Endpoint (Minimal)

- **FR-008**: Endpoint `GET /health` MUST return HTTP 200 with `{ "status": "healthy" }` when app is ready
- **FR-009**: Health endpoint MUST respond in < 500ms (K8s liveness probe expectation)
- **FR-010**: Health endpoint MUST have no dependency on external services (immediate return)

### Functional Requirements – Code Generation & Contract

- **FR-011**: OpenAPI specification (`hello-api-openapi.yaml`) MUST be single source of truth for API contract
- **FR-012**: TypeScript types (HelloDto, clients) MUST be auto-generated from OpenAPI spec (zero manual edits)
- **FR-013**: Generated types MUST be TypeScript strict-compliant (no `any`, no implicit types)
- **FR-014**: Build process (`npm run generate:api`) MUST regenerate types from spec without errors
- **FR-015**: Generated code MUST NOT be committed to git (`.gitignore` has `src/gen/`)

### Functional Requirements – Implementation Architecture

- **FR-016**: Handlers MUST be implemented in `src/api/controllers/` (Delegate pattern)
- **FR-017**: Business logic MUST be in `src/services/HelloService` (loose coupling)
- **FR-018**: Service MUST be interface-based (`HelloServiceInterface`)
- **FR-019**: Validation MUST use **zod** or **joi** schemas matching OpenAPI constraints
- **FR-020**: Error handling MUST be centralized in middleware (no try-catch spaghetti)

### Functional Requirements – Testing

- **FR-021**: Unit tests MUST cover HelloService (mocked dependencies) in `src/services/hello.service.spec.ts`
- **FR-022**: Integration tests MUST cover all API endpoints using **supertest** in `src/api/v1/hello.api.spec.ts`
- **FR-023**: Happy path MUST pass (default name & personalized name)
- **FR-024**: Validation errors MUST be tested (invalid name patterns, lengths)
- **FR-025**: Test suite MUST run in isolation (no order dependencies, deterministic)

### Functional Requirements – Deployment & Operations

- **FR-026**: Application MUST be containerizable (Dockerfile present, builds successfully)
- **FR-027**: Docker image MUST run without manual configuration (env vars for config)
- **FR-028**: Kubernetes deployment MUST include livenessProbe pointing to `GET /health`
- **FR-029**: Application MUST gracefully handle SIGTERM (close connections, flush logs, max 30 sec)

### Functional Requirements – Code Quality & Standards

- **FR-030**: Code MUST pass TypeScript strict mode (`tsc --strict`)
- **FR-031**: Code MUST pass ESLint with `npm run lint` (zero warnings)
- **FR-032**: Code MUST be formatted with Prettier (`npm run format`)
- **FR-033**: All dependencies MUST pass security audit (`npm audit` zero vulnerabilities)

---

## Key Entities *(N/A - Stateless API)*

This API is fully **stateless**. No database entities, no persistence layer required.

**Data Transfer Objects** (auto-generated from OpenAPI):
- `HelloDto`: `{ message: string }` – Immutable response DTO

All other objects are intermediate (not persisted).

---

## Success Criteria *(Measurable, Technology-Agnostic, User-Focused)*

### S1: Contract-First Workflow is Reproducible

**Measure**: Newbie developer can follow the demo step-by-step and arrive at same result.  
**Criteria**: 
- Step 1 (View OpenAPI) → Understand schema in < 5 min
- Step 2 (Generate code) → `npm run generate:api` produces types in < 30 sec
- Step 3 (Implement) → Implement handler + pass tests in < 10 min
- **Target**: 100% success rate on first attempt (zero confusion, zero blockers)

### S2: Type Safety Prevents Errors

**Measure**: TypeScript compiler catches API contract violations before runtime.  
**Criteria**:
- Changing OpenAPI schema → TypeScript build fails with clear error
- Developer fixes code → Build succeeds
- Code never shipped with mismatched types
- **Target**: Zero runtime TypesMismatchErrors in production

### S3: API Conforms to OpenAPI Spec

**Measure**: Integration tests validate 100% specification compliance.  
**Criteria**:
- GET /api/v1/hello → Returns exactly `{ "message": "Hello World" }` (no extras)
- GET /api/v1/hello/:name → Validates `name` per spec constraints
- Error codes match OpenAPI (HTTP 400 for validation, etc.)
- **Target**: 100% test pass rate (all acceptance scenarios)

### S4: Development Loop is Fast

**Measure**: Developer can edit, test, and see results < 5 seconds.  
**Criteria**:
- File save → Jest auto-rerun tests (watch mode)
- Build time (clean) < 10 sec
- Test execution < 2 sec per suite
- **Target**: Sub-5-sec feedback loop (developer satisfaction)

### S5: Health Check is Production-Ready

**Measure**: Kubernetes can reliably probe and manage app lifetime.  
**Criteria**:
- GET /health responds 100% reliability (no transient failures)
- Response time < 500ms (K8s timeout expectation)
- No external dependencies checked
- **Target**: 99.99% probe success rate

### S6: Deployment is Straightforward

**Measure**: App can be deployed to K8s in one command.  
**Criteria**:
- Dockerfile builds on first try
- Image size < 300MB (Alpine-based)
- Container starts in < 2 sec
- Health probe passes immediately
- **Target**: Green ✅ deployment (zero rollback incidents)

### S7: Conference Demo is Professional

**Measure**: Live demo runs flawlessly for 25-min audience.  
**Criteria**:
- Zero build failures during demo
- All endpoints respond in real-time
- Generated code is visible + understandable
- Audience understands Contract-First value
- **Target**: Standing ovation 👏 (or at least no questions about bugs)

---

## Assumptions *(Reasonable Defaults for Unspecified Details)*

1. **Endpoints**: Two endpoints – `GET /api/v1/hello` (generic) and `GET /api/v1/hello/{name}` (personalized via path parameter)
   - *(Rationale: REST best practice – path params for resource identification)*
2. **Parameter location**: `name` is a **required path parameter** in `/api/v1/hello/{name}` (e.g., `/api/v1/hello/Philippe`)
   - *(No query parameters; URL is clean and resource-focused)*
3. **Whitespace handling**: Per Q2 clarification – Trim `name` BEFORE validation
   - Flow: Extract → Trim → Validate → Use cleaned value
   - Example: `" Philippe "` → `"Philippe"` → passes validation → message: `"Hello Philippe"`
   - *(Rationale: User-friendly UX)*
4. **Internationalization (i18n)**: Multi-language greetings? → **Out of scope** for this MVP (can add later)
5. **Case sensitivity**: Pattern allows lowercase + uppercase (both "alice" and "ALICE" valid)
6. **Caching**: No HTTP caching headers on response (every request is fresh) – OK since computation is cheap
7. **CORS**: Allow all origins in dev/staging (restrict in production via `.env`)
8. **Request logging**: Log all requests in INFO level (no sensitive data)
9. **Port**: Listen on PORT env var or default 3000 (not 8080 like Java, Node convention)

---

## Constraints & Non-Functional Goals

### Performance Expectations

- **Latency P50**: < 20ms (in-process computation)
- **Latency P99**: < 100ms (with Node.js scheduling overhead)
- **Throughput**: ≥ 500 req/sec per instance (Node.js event loop efficiency)
- **Memory**: < 100MB resident (TypeScript app + Node runtime)
- **Startup time**: < 2 sec cold start (Express boot + dependencies load)

**Performance Baseline** (per Q4 clarification):
- **Machine**: Modern laptop (M1 MacBook, 16GB RAM)
- **Measurement**: Runtime only (post-Express boot, post-TypeScript compile)
- **Load**: Single request (P50), or moderate concurrency (P99)
- **Tools**: Node.js profiling (clinic, 0x) or basic timing
- **Note**: Metrics are aspirational; POC focus is on contract-first workflow, not optimization

### Scalability & Reliability

- **Horizontal scaling**: Stateless → can replicate N times
- **Container orchestration**: Kubernetes ready (health checks, graceful shutdown)
- **Multi-region**: API is region-agnostic (no geo-affinity required)

### Security Posture (POC level)

- **Input validation**: Strict via schema validation (pattern, length constraints)
- **Error messages**: No stacktraces exposed to client
- **Secrets**: None hardcoded (config via env vars)
- **Logging**: No token/PII leak in logs (audit critical paths)
- **Rate limiting**: Not required for POC (can add later)

### Developer Experience

- **TypeScript strict mode**: Mandatory for type safety
- **ESLint + Prettier**: Automatic formatting, zero style disputes
- **Hot reload in dev**: Nodemon watches files, auto-restart
- **Git-friendly**: Generated code not committed (`.gitignore`)

---

## Out of Scope *(Explicitly excluded from this MVP)*

❌ **Not in scope for MVP**:
- AsyncAPI/event messaging (saved for Part 4 of conference bonus)
- WebSocket/streaming endpoints
- Query parameters or form data
- File upload/download
- Pagination or filtering
- Database integration
- Authentication/authorization
- Rate limiting
- API key management
- Prometheus metrics export
- Distributed tracing (OpenTelemetry)
- Multi-language greetings
- Analytics or usage tracking

**Rationale**: MVP focuses on Contract-First workflow clarity. These can be added as extensions in future sprints.

---

## Definition of Done *(When is this feature considered complete?)*

✅ **Feature is DONE when**:

1. ✅ OpenAPI spec is complete and validated (Swagger Editor)
2. ✅ `npm run generate:api` produces TypeScript types without errors
3. ✅ All functional requirements are implemented (FR-001 through FR-033)
4. ✅ All acceptance scenarios pass (unit + integration tests)
5. ✅ Code passes: `tsc --strict`, `eslint`, `prettier`, `npm audit`
6. ✅ Test coverage ≥ 80% (Istanbul report)
7. ✅ Documentation updated (README.md, code comments)
8. ✅ Dockerfile builds and image runs locally
9. ✅ K8s deployment manifests are present and tested
10. ✅ Live demo executed successfully (25 min, zero errors)
11. ✅ Code reviewed + approved (checklist in constitution)
12. ✅ Merged to main branch + tagged `v1.0.0`

---

## Dependencies & Blockers *(What must be done first?)*

**Hard Dependency (Blocking)**:
- OpenAPI specification file (`hello-api-openapi.yaml`) must be finalized before code generation
- Node.js 20 LTS runtime + npm 9+ must be available in dev/CI environment

**Soft Dependencies (Nice-to-Have)**:
- Kubernetes cluster for live testing (can mock with Docker Compose if needed)
- GitHub Actions or Jenkins for CI/CD (can run locally first)
- SonarQube for code quality (optional, use ESLint as baseline)

---

## Next Phases *(Future Enhancements Beyond MVP)*

### Phase 2 – Async Design (Part 4 of Conference)
Add AsyncAPI messaging example (optional, after REST is solid)

### Phase 3 – Query Optimization
Support query parameters, filtering, pagination (if scope expands)

### Phase 4 – Observability
Prometheus metrics, OpenTelemetry tracing

### Phase 5 – Production Hardening
Rate limiting, caching, API versioning strategy

---

## Notes for Specification Review

🎯 **Conference Value**: This spec delivers a **production-grade, yet simple** example of Contract-First API design. Perfect for BordeauxJS because it demonstrates:
- Real-world architecture (3-layer: controllers → services → domain)
- Type safety as a **feature, not a friction** (generates from spec!)
- Testing best practices (unit + integration)
- Kubernetes deployment readiness (health checks, graceful shutdown)

🎓 **Learning Outcomes** for audience:
1. OpenAPI is **not** just documentation – it's a **development contract**
2. Code generation **prevents** bugs (types catch misalignment)
3. Layered architecture is **not** over-engineering (enables testing, scaling)
4. Container-native design is **not** complex (just follows patterns)

---

**Version**: 1.0.0 (Clarified) | **Created**: 2026-04-24 | **Clarified**: 2026-04-24 | **Status**: Ready for Architecture Planning