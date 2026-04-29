<!--
## Sync Impact Report

**Version change**: N/A → 1.0.0 (initial constitution)
**Modified principles**: none (initial creation)
**Added sections**: Core Principles (I–VIII), Technology Stack, Development Workflow, Governance
**Removed sections**: none
**Templates updated**:
  - .specify/templates/plan-template.md ✅ (Constitution Check section aligned)
  - .specify/templates/spec-template.md ✅ (no changes needed)
  - .specify/templates/tasks-template.md ✅ (no changes needed)
**Deferred TODOs**: none
-->

# Hello API (EDA) Constitution

## Core Principles

### I. API-First (NON-NEGOTIABLE)

Every feature MUST begin with a contract definition before any implementation:

- REST endpoints MUST be defined in an OpenAPI specification file (`hello.yaml`) before writing Java code.
- Asynchronous events MUST be defined in an AsyncAPI specification file (`hello-asyncapi-3-full.yaml`) before writing producers or consumers.
- Server stubs, delegate interfaces, and producer classes are ALWAYS generated via build-time plugins
  (openapi-generator-maven-plugin, ZenWave SDK); they are NEVER written by hand.
- Generated code MUST NOT be modified manually; all business logic lives exclusively in the
  implementation classes that implement or extend the generated contracts.

**Rationale**: Contracts are the single source of truth for communication. Generating code from
contracts eliminates drift and enforces schema compliance at compile time.

### II. Event-Driven Architecture (EDA)

Services MUST communicate asynchronously through domain events wherever decoupling is required:

- Kafka (via Spring Cloud Streams) is the event bus; topic naming MUST follow `event.<domain>.v<version>`
  (e.g., `event.hello.v1`).
- Spring Cloud Function bean names MUST match the AsyncAPI `operationId` (e.g., `send-hello-message`,
  `receive-hello-message`).
- Events MUST be versioned in the topic name; a breaking change MUST increment the version suffix.
- Synchronous REST calls between internal services are FORBIDDEN; use events.

**Rationale**: EDA enables loose coupling, independent deployability, and resilience under load
spikes, consistent with the DevFest Nantes demo goals.

### III. Hexagonal Architecture (Ports & Adapters)

Package structure MUST enforce a strict boundary between business logic and infrastructure:

```
com.sqli.pbousquet.helloapi
├── api/          ← Inbound adapters (REST delegate implementations)
│   └── impl/
├── hello/
│   ├── api/      ← Inbound port interfaces (HelloService)
│   ├── domain/   ← Business logic implementations (HelloServiceImpl)
│   └── spi/      ← Outbound port interfaces (secondary ports)
└── config/       ← Infrastructure configuration (Spring beans, security, converters)
```

- Business logic in `domain/` MUST NOT import Spring Web, Kafka, or any infrastructure library directly.
- Outbound calls (events, external services) MUST go through an `spi/` interface.
- The `api/` delegate MUST delegate 100 % of logic to a `hello/api/` service interface; it MUST
  contain no business logic.

**Rationale**: Hexagonal layering keeps the domain testable in isolation and limits the blast
radius of infrastructure changes.

### IV. Test-First Development

Unit tests MUST be written before or alongside implementation; they MUST NOT be deferred:

- Every `domain/` service implementation MUST have a corresponding unit test class.
- Every `api/impl/` delegate MUST have a unit test that mocks the service interface.
- Tests MUST use JUnit 5 (JUnit 4 vintage allowed only for legacy compatibility) and Mockito for
  dependency isolation.
- A PR MUST NOT be merged if any unit test fails or if the `domain/` layer has no test coverage.

**Rationale**: Tests are the executable specification of domain behaviour and the safety net for
future refactoring.

### V. Observability

Every service deployment MUST expose operational visibility:

- Spring Actuator MUST expose at minimum `/actuator/health` (with `show-details: always`) and
  `/actuator/info`.
- Git build metadata MUST be embedded in the `info` endpoint (`management.info.git.mode: full`).
- Application version MUST be sourced from `pom.xml` via the `@version@` placeholder, never
  hard-coded.
- All business operations MUST emit structured SLF4J log events at appropriate levels (INFO for
  normal flow, WARN for recoverable issues, ERROR for failures).
- Stack traces MUST NOT be exposed in HTTP error responses (`include-stacktrace: never`).

**Rationale**: Health probes are required by the Kubernetes deployment; structured logs and
version info are essential for incident diagnosis in production.

### VI. Security by Default

Security controls MUST be applied at every layer:

- Spring Security MUST be configured on every service, even if all endpoints are currently public.
- Content-Security-Policy and CORS headers MUST be explicitly set via `WebSecurityConfig`; wildcard
  origins (`*`) are acceptable only during development and MUST be restricted before production
  promotion.
- Input MUST be validated at the API boundary using Bean Validation (Jakarta Validation + Hibernate
  Validator); domain logic MUST NOT re-validate what the contract already enforces.
- Credentials, secrets, and broker addresses MUST NOT be committed to source control; they MUST be
  injected via environment variables or Kubernetes secrets at runtime.
- HTTP Basic auth and CSRF protection are disabled intentionally for stateless API operation; this
  decision MUST be documented in `WebSecurityConfig`.

**Rationale**: Security posture established at project inception is cheaper than retrofitting it
later; explicit headers prevent default-insecure browser behaviour.

### VII. Container-Native & Cloud-Native Deployment

The service MUST be deployable as a container in Kubernetes without manual intervention:

- The Docker image MUST be built on `azul/zulu-openjdk` with CRaC (Coordinated Restore at
  Checkpoint) support to minimise cold-start time.
- Kubernetes manifests MUST define resource `requests` and `limits` (memory + CPU) for every
  container.
- Liveness and readiness probes MUST target `/actuator/health` with appropriate
  `initialDelaySeconds`.
- Deployments MUST use `RollingUpdate` strategy with `maxSurge: 1` and `maxUnavailable: 1`.
- External access MUST be routed through an Ingress resource; services MUST use `ClusterIP` type
  internally.

**Rationale**: CRaC improves startup time by an order of magnitude; resource limits prevent
noisy-neighbour problems; probes ensure zero-downtime rolling updates.

### VIII. Simplicity & YAGNI

Add complexity only when there is a concrete, justified need:

- New abstractions, layers, or dependencies MUST be justified against a specific requirement; no
  speculative infrastructure is allowed.
- The `spi/` package MUST only be populated when an outbound port is actually required; an empty
  `spi/` directory is acceptable and expected in early development.
- Lombok MUST be used to eliminate boilerplate (getters, setters, constructors) rather than writing
  them by hand.
- Avoid over-engineering the generated DTO layer; extend generated models through composition, not
  inheritance.

**Rationale**: Premature complexity is the primary source of maintenance debt in microservices.

## Technology Stack

| Concern | Choice | Version |
|---|---|---|
| Language | Java | 25 |
| Framework | Spring Boot | 4.0.0-M1 |
| Messaging | Spring Cloud Streams + Kafka | 2025.1.0-M1 |
| REST contract | OpenAPI Generator (Maven plugin) | 6.2.1 |
| Event contract | ZenWave SDK (AsyncAPI) | 2.1.0 |
| API docs | SpringDoc OpenAPI | 2.8.9 |
| Validation | Hibernate Validator (Jakarta) | 9.0.1.Final |
| Boilerplate reduction | Lombok | 1.18.38 |
| Testing | JUnit 5 + JUnit 4 Vintage + Mockito | Spring Boot managed |
| Build | Maven | — |
| Container | Docker on Azul Zulu JDK 17 CRaC | 17-jdk-crac-latest |
| Orchestration | Kubernetes (k8s manifests) | — |
| CI | Jenkins (declarative pipeline) | — |

All version upgrades MUST pass the full test suite before being committed.

## Development Workflow

1. **Contract First**: Update `hello.yaml` or `hello-asyncapi-3-full.yaml` for any new endpoint
   or event before touching Java code.
2. **Generate**: Run `mvn generate-sources` to regenerate stubs and producer interfaces.
3. **Implement**: Write or update the `domain/` logic and `api/impl/` delegate; add or update
   tests in `src/test/`.
4. **Validate locally**: `mvn clean verify` MUST pass with zero failures.
5. **Review**: All changes require a PR; PRs MUST pass the Constitution Check in the plan template
   before merge.
6. **CI**: Jenkins pipeline MUST clean workspace before each build; pipeline stages are extended
   as the project matures.
7. **Deploy**: Kubernetes manifests are applied after a successful CI build; the Ingress hostname
   is `hello-api.localhost` in development.

## Governance

- This constitution supersedes all other development practices and guidelines for `hello-api-eda`.
- Any amendment MUST be proposed as a PR that updates this file and increments `CONSTITUTION_VERSION`
  following semantic versioning:
  - **MAJOR**: removal or incompatible redefinition of a principle.
  - **MINOR**: addition of a new principle or material expansion of an existing one.
  - **PATCH**: clarifications, wording improvements, typo fixes.
- All PRs and code reviews MUST verify compliance with the Core Principles above; violations MUST
  be documented in the plan's **Complexity Tracking** table with explicit justification.
- Principles labelled **(NON-NEGOTIABLE)** require unanimous team agreement to amend.
- The constitution MUST be reviewed at each major framework or Java version upgrade.

**Version**: 1.0.0 | **Ratified**: 2026-04-28 | **Last Amended**: 2026-04-28
