<!--
=== SYNC IMPACT REPORT ===
Version: 0.1.0 → 1.0.0 (Initial Node.js Constitution - Conference Edition)
Rationale: Adapted from hello-api-java Constitution (1.0.0) for Node.js/TypeScript stack. Maintains alignment on Design-First (OpenAPI/AsyncAPI), Contract-First, Layered Architecture, Testing, Container-Native, and Kubernetes-Ready principles while leveraging Express/TypeScript ecosystem.

New Principles:
  - I. Express/Node.js Microservice-First Architecture (API-driven, TypeScript)
  - II. OpenAPI/AsyncAPI Contract-First Design (Design-First methodology)
  - III. Layered Architecture with Clear Separation of Concerns (src/* structure)
  - IV. Test Coverage with Unit & Integration Tests (Jest/Vitest + Supertest)
  - V. Node.js LTS with Modern Features & Security (Node 20+ LTS, TypeScript)
  - VI. Container-Native & Kubernetes-Ready Deployment (Docker + K8s)

Additional Sections:
  - Development Workflow & Quality Gates
  - Observability & Operational Excellence

Modified Templates: plan, spec, tasks (require review for TypeScript/Node.js specific guidance)
Status: Configuration pending - ready for conference demo (BordeauxJS - Design First APIs)
=== END SYNC IMPACT REPORT ===
-->

# HelloAPI Node.js Constitution

Architecture et pratiques de développement pour HelloAPI Node.js – une API Express/TypeScript microservice avec Design-First OpenAPI & AsyncAPI.

## Préface

Cette constitution est adaptée de la constitution **hello-api-java** pour une stack **Node.js/TypeScript**. Elle préserve les 6 principes architecturaux core tout en s'alignant sur l'écosystème Node.js moderne. Le projet HelloAPI Node.js démontre les bonnes pratiques de **Contract-First API Design** (OpenAPI 3.0) et **Event-Driven Design** (AsyncAPI) pour la conférence **BordeauxJS**.

---

## Core Principles

### I. Express/Node.js Microservice-First Architecture

Chaque fonctionnalité doit être conçue comme un service microservice complet exposant une API REST (et optionnellement WebSocket/SSE).

**Non-négociable:**
- Toute nouvelle fonctionnalité commence par la définition du contrat API **OpenAPI 3.0** ou **AsyncAPI 3.0**
- Le service DOIT être containerisable et déployable indépendamment
- La séparation en couches (**controllers** → **services** → **domain** → **repositories**) est obligatoire
- Injection de dépendances par **constructor** ou **factory pattern** (pas de globals)
- Framework: **Express.js** (ou Fastify pour haute perf) + **TypeScript** obligatoire
- Utilisation du pattern **Adapter/Delegate** pour découpler la génération OpenAPI de la logique métier

**Stack Requis:**
- **Runtime**: Node.js 20 LTS ou supérieur (22 LTS préféré dès disponible)
- **Language**: TypeScript 5.x+
- **Framework**: Express.js 4.x+ (ou Fastify 4.x+)
- **OpenAPI Generation**: `openapi-typescript-codegen` ou `orval` (pour DTOs/API routes)
- **Async Messaging** (optionnel): AsyncAPI + rabbitmq-client ou kafka-js

**Rationale:** Cette approche garantit une scalabilité, une testabilité et une maintenabilité optimales. Contract-First force une documentation vivante et une cohérence API/implémentation. TypeScript offre la sécurité de type ; le pattern Adapter réduit le couplage.

### II. OpenAPI/AsyncAPI Contract-First Design

Le contrat API est la source de vérité. La génération de code à partir du contrat OpenAPI ou AsyncAPI est obligatoire.

**Non-négociable:**
- **Tous les contrats API DOIVENT être définis en YAML/JSON OpenAPI 3.0+** (requis)
- **Les contrats de messaging (événements) en AsyncAPI 3.0+** (recommandé pour Design-First)
- Les interfaces/clients TypeScript sont générés par `orval`, `openapi-typescript-codegen`, ou similaire
- Les DTOs générés ne DOIVENT PAS être modifiés manuellement (ils sont régénérés)
- La validation des payloads via **zod**, **joi**, ou **class-validator** est obligatoire
- Les tests de contrat (e.g., Pact) DOIVENT vérifier que l'impl respecte le contrat OpenAPI

**Workflow Contract-First:**
```
1. Définir le contrat OpenAPI.yaml (Design phase)
2. Générer les types TypeScript + interfaces @types
3. Approver le contrat (API Review)
4. Implémenter les resolvers/handlers
5. Tests d'intégration contre contrat
6. C'est le contrat qui drive les tests, pas le code
```

**Rationale:** Contract-First évite les désynchronisations API/implémentation et force une documentation vivante et testable. La génération automatique réduit les erreurs manuelles. Pour les conférences Design-First, ce pattern est démontrable et élégant.

### III. Layered Architecture with Clear Separation of Concerns

L'architecture suit un modèle en couches strictement défini.

**Architecture obligatoire:**
```
src/
├── api/
│   ├── controllers/        # Express routes & handlers (req/res)
│   └── validations.ts      # Input validation (zod/joi schemas)
├── services/
│   └── hello.service.ts    # Logique métier orchestration
├── domain/
│   ├── models/             # Entities/Domain Models
│   └── repositories/       # Data access abstractions
├── config/
│   ├── express.ts          # Configuration Express
│   └── security.ts         # CORS, CSP, headers
└── index.ts                # Application entry point
```

**Non-négociable:**
- La couche `api` contient UNIQUEMENT les routes Express et middlewares HTTP
- La couche `services` contient la logique métier (@injectable Service)
- La couche `domain` contient les models et abstractions repository
- Zéro logique métier dans `config/`
- Toute dépendance externe (DB, cache, API) passe par le pattern **Repository** ou **Adapter**
- Export/Import clarifiés : pas d'import circulaires

**Rationale:** Cette hiérarchie explicite facilite la navigation, les tests unitaires isolés, et les évolutions sans risque de casse en cascade. Elle reste familière aux développeurs Java en migration.

### IV. Test Coverage with Unit & Integration Tests

Les tests sont un composant architectural, pas une activité post-code.

**Non-négociable:**
- Tests unitaires pour chaque `*.service.ts` (mocks des dépendances)
- Tests d'intégration pour chaque endpoint API avec **supertest** + framework de test
- Couverture minimale: Happy paths + cas d'erreur (validation, exceptions métier)
- Tous les tests DOIVENT être nommés avec `.describe()` et `.it()` descriptifs
- Les tests unitaires (e.g., `hello.service.spec.ts`) n'utilisent PAS le serveur Express
- Les tests d'intégration (e.g., `hello.api.spec.ts`) utilisent **supertest** + serveur réel
- Les fixtures de test DOIVENT être **déterministes** et **indépendantes** de l'ordre d'exécution

**Framework & Tools obligatoires:**
- **Test Runner**: Jest (défaut Node.js) ou Vitest (plus rapide)
- **Mocking**: Jest built-in ou Sinon.js
- **HTTP Testing**: Supertest pour E2E sur Express
- **Assertions**: Jest matchers ou Chai (lisibles)

**Test Organization:**
```typescript
// Unit test (hello.service.spec.ts)
describe('HelloService', () => {
  let service: HelloService;
  let mockRepository: Partial<HelloRepository>;
  
  beforeEach(() => {
    mockRepository = { findById: jest.fn() };
    service = new HelloService(mockRepository as HelloRepository);
  });
  
  it('should return greeting when name is provided', async () => {
    // Arrange, Act, Assert
  });
});

// Integration test (hello.api.spec.ts)
describe('GET /api/hello/:name', () => {
  let app: Express;
  let request: SuperTest;
  
  beforeAll(() => {
    app = createExpressApp();
    request = supertest(app);
  });
  
  it('should return 200 with greeting', async () => {
    await request.get('/api/hello/Alice').expect(200);
  });
});
```

**Rationale:** Tests robustes garantissent que les refactorings ne cassent rien et que les contrats API restent cohérents. Jest natif accélère feedback dev; supertest simplifie tests HTTP.

### V. Node.js LTS with Modern Features & Security

Le projet adopte Node.js LTS et applique les bonnes pratiques modernes TypeScript.

**Non-négociable:**
- **Runtime**: Node.js 20 LTS ou 22 LTS (versions Long-Term Support)
- **Language**: TypeScript 5.x+ compilé strict (`strict: true` en `tsconfig.json`)
- **ES2022+** modules et syntaxe moderne (async/await, destructuring, etc.)
- ESM par défaut (import/export) ; CommonJS accepté en complémentarité
- Gestion d'erreurs globale: `Error` classes métier + middleware `@error-handler`
- Validation inputs: **zod** ou **joi** sur tous les payloads HTTP
- Sécurité des dépendances: Audit via `npm audit`, Snyk recommandé

**Security Baseline:**
- **CORS**: Explicite, pas `*` en production (liste blanche origins)
- **Helmet.js**: Obligatoire pour headers de sécurité (CSP, X-Frame-Options, etc.)
- **HTTPS**: Obligatoire en prod (terminé au LB/Ingress K8s)
- **Secrets**: PAS de secrets en code ; env vars (NODE_ENV, API_KEY_*) via .env ou Secret Manager
- **Rate Limiting**: Obligatoire sur endpoints publics (express-rate-limit)
- **Input Validation**: Rejeter payloads > 1MB, validate JSON schema strictement
- **Logging**: Logs structurés JSON (pino ou winston) → zero secrets in logs

**Dev Experience:**
- **ESLint + Prettier**: Formatage automatique & code quality gates
- **Source Maps**: Génération en dev/prod pour debugging
- **Hot Reload**: Nodemon en dev pour feedback rapide

**Rationale:** Node.js LTS offre stabilité et support 3 ans. TypeScript strict prévient bugs courants. ESM est le futur du langage. Helmet + zod fournirent une base de sécurité solide.

### VI. Container-Native & Kubernetes-Ready Deployment

Le projet est conçu pour fonctionner nativement en conteneurs et Kubernetes.

**Non-négociable:**
- **Dockerfile**: Builder multi-stage (Node build → Alpine runtime) → image ~200MB
- **Port exposure**: Port accessible via ENV `PORT` (défaut 3000)
- **Healthchecks**: GET `/health` → 200 OK si service OK (liveness probe K8s)
- **Info endpoint**: GET `/info` → JSON avec version (lié au package.json)
- **Configuration externe**: Env vars (NODE_ENV, LOG_LEVEL, DATABASE_URL, etc.)
- **K8s Deployment**: 2+ replicas, requests/limits fixés (128Mi/200m req, 256Mi/500m limit)
- **Startup rapide**: Visé < 2 sec cold start (+ warm start ~500ms)
- **Signal Handling**: SIGTERM → graceful shutdown (fermer connexions DB, caches)

**Docker & K8s Requirements:**
```dockerfile
# Dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=prod && npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --only=prod
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s CMD node healthcheck.js
EXPOSE ${PORT:-3000}
CMD ["node", "dist/index.js"]
```

**K8s Manifest Requirements:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello-api-node
  labels:
    app: hello-api-node
spec:
  replicas: 2
  selector:
    matchLabels:
      app: hello-api-node
  template:
    metadata:
      labels:
        app: hello-api-node
    spec:
      containers:
      - name: api
        image: registry.example.com/hello-api-node:1.0.0
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: LOG_LEVEL
          value: "info"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 2
          periodSeconds: 5
        resources:
          requests:
            memory: "128Mi"
            cpu: "200m"
          limits:
            memory: "256Mi"
            cpu: "500m"
```

**Rationale:** Container-native garantit un déploiement cohérent dev→staging→prod. Kubernetes abstracts infra; healthchecks fournissent telemetry pour orchestration. Alpine réduit taille/surface d'attaque.

---

## Development Workflow & Quality Gates

### Source Code & Version Control

- **Branche principale**: `main` ou `master` (protégée, CI obligatoire)
- **Workflow**: Feature branch → PR + Review → Tests ✅ → Merge → Auto-deploy
- **Commit messages**: Descriptifs en anglais (e.g., `feat(api): add hello endpoint`, `fix(security): update CSP policy`)
- **Versioning**: Semantic Versioning (MAJOR.MINOR.PATCH) dans `package.json`
- **Tag Git**: Sur chaque release (e.g., `v1.0.1`)
- **Branch naming**: `feature/`, `fix/`, `chore/` pour clarté

### Build & Packaging

- **Package Manager**: npm >= 9 ou yarn >= 3 (npm par défaut)
- **Build**: TypeScript compilation via `npm run build`
- **Clean build**: `npm run clean && npm run build`
- **Tous les artifacts** (dist/, tarballs) DOIVENT passer les tests
- **Artifacts repository**: Docker registry (private) pour images

### CI/CD Pipeline (GitHub Actions / GitLab CI / Jenkins)

- **Trigger**: Push sur feature branch + PR opening
- **Stages obligatoires:**
  1. **INSTALL & BUILD**: `npm ci && npm run build` (deterministic deps + compile)
  2. **LINT**: `npm run lint` (ESLint)
  3. **TEST**: `npm run test` (jest avec coverage)
  4. **DOCKER BUILD**: Build image, scan avec Trivy (optionnel)
  5. **DEPLOY STAGING**: Deploy sur K8s staging si `main` merge
  6. **SMOKE TESTS**: GET `/health`, `/info` endpoints
- **Failure → Bloquer merge + notifier équipe**
- **Coverage gate**: Minimum 70% coverage (adaptable par équipe)

### Security & Compliance

- **Validation inputs**: Tous inputs REST DOIVENT être validés (zod/joi)
- **Error handling**: Catch global via middleware, logs structurés, pas de stack traces au client
- **Secrets**: PAS de secrets en code ; env vars ou Secret Manager (Vault, AWS Secrets Manager)
- **Dépendances**: `npm audit` requis; Snyk ou Dependabot pour monitoring CVE
- **OWASP Top 10**: Injection, auth, XSS, CSRF, broken auth mitigées par design
- **Rate Limiting**: express-rate-limit sur endpoints publics

---

## Observability & Operational Excellence

### Logging & Monitoring

- **Framework**: **pino** (rapide, structuré JSON) ou **winston** (flexible)
- **Level par défaut**: INFO ; DEBUG en staging/dev seulement
- **Format**: JSON structuré en production (facilite parsing/alerting)
- **Correlation IDs**: MDC (Mapped Diagnostic Context) pour tracer requêtes cross-service
- **No Secrets**: Audit logs → pas de tokens, API keys, etc.

**Example Pino Setup:**
```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'production' 
    ? undefined  // JSON to stdout
    : {
      target: 'pino-pretty',
      options: { colorize: true }
    }
});
```

### Health & Readiness

- **Endpoint**: GET `/health` → `{ status: 'ok', uptime: 1234 }`
- **Liveness probe**: K8s ping toutes les 10 sec, timeout 3 sec
- **Readiness probe**: Optionnel ; peut vérifier DB connectivity
- **Graceful shutdown**: SIGTERM → fermer connexions, flush logs (timeour 30 sec)

### Metrics & APM

- **prom-client**: Prometheus metrics (optionnel)
- **OpenTelemetry**: Ready for tracing (integration future)
- **APM**: Datadog/New Relic setup docs (annexe)

---

## Governance

### Constitution Compliance

- Cette constitution est la **source unique de vérité** pour architecture et pratiques Node.js
- **Toute violation DOIT être justifiée** en revue de code ; exceptions documentées
- **Modifications requièrent:**
  1. Proposition documentée + rationale
  2. Approbation lead archi + équipe dev
  3. Bump de version (semantic versioning)
  4. Migration plan pour code existant (si breaking)

### Code Review & PR Process

- **Reviewer duties:**
  - ✅ Respect des 6 principes (couches, tests, Design-First)
  - ✅ Zéro logique métier en config/routes générées
  - ✅ Test coverage (unit + intégration, >70%)
  - ✅ Pas de secrets/hardcoding
  - ✅ ESLint + Prettier ✅
  - ✅ TypeScript strict compile sans warnings
  
- **Auto-checks (CI):**
  - Build DOIT passer (`npm run build`)
  - Tests DOIVENT tous passer (`npm test`)
  - ESLint + Prettier DOIVENT passer
  - TypeScript DOIT compiler strict (`npm run type-check`)

### Amendment Process

- **PATCH version (v1.0.1):** Typos, clarifications, aucun impact functional
- **MINOR version (v1.1.0):** Nouvelles recommandations, nouveau framework permis, nouvelles sections optionnelles
- **MAJOR version (v2.0.0):** Changement architectural (e.g., migration ESM, Express → Fastify, Node 18 → 22)

**Changes processus:**
- Mineure → simple PR approval
- MAJOR → discussion équipe + planning migration

### Compliance Audit

- **Audit architectural semestriel**: Vérifier adhérence aux 6 principes
- **Tools**: Manual review + ESLint rules + `npm audit`
- **Non-conformités**: Documentées dans issue tracker ; priorité assignée

---

## Appendix: Design-First API Demo (BordeauxJS Conference)

Cet appendice guide la conférence **Design-First APIs avec OpenAPI & AsyncAPI**.

### Live Demo Setup

1. **Part 1 – OpenAPI Design Phase** (15 min)
   - Montrer `openapi.yaml` complet (3 endpoints: GET /health, GET /hello/:name, POST /hello)
   - Syntaxe OpenAPI 3.0 : paths, parameters, request/response schemas
   - Validation via Swagger Editor en ligne (swagger.io)

2. **Part 2 – Code Generation** (5 min)
   - `npx orval --input openapi.yaml --output-target typescript-fetch`
   - Montrer les types générés (`src/gen/`)
   - Type safety en implémentation

3. **Part 3 – Implémentation & Tests** (15 min)
   - Implémenter les handlers (`src/api/controllers/hello.controller.ts`)
   - Écrire tests d'intégration contre le contrat
   - Workflow: Red → Green → Refactor

4. **Part 4 – Async Design (Bonus)** (5 min)
   - Montrer `asyncapi.yaml` pour événements (e.g., "greeting.received")
   - Montrer consumer simple (fan-in pattern avec RabbitMQ)

### References

- **OpenAPI Spec**: https://spec.openapis.org/oas/v3.0.3
- **AsyncAPI Spec**: https://www.asyncapi.com/
- **Orval**: https://orval.dev/
- **Express Best Practices**: https://expressjs.com/en/advanced/best-practice-performance.html
- **Node.js Production Best Practices**: https://nodejs.org/en/docs/guides/nodejs-performance/

---

**Version**: 1.0.0 | **Ratified**: 2026-04-24 | **Last Amended**: 2026-04-24
