# HelloAPI Node.js – Spécification Complète

## 📋 Vue d'ensemble

Ce répertoire contient la **spécification complète** du projet **HelloAPI Node.js** – une démonstration pedagogique de **Design-First API** pour la conférence BordeauxJS.

**Scope**: REST API simple (2 endpoints Hello + 1 health check) implémentée entièrement depuis un contrat OpenAPI 3.0.

**Valeur pédagogique**: Montrer comment construire une API production-grade en partant du contrat (YAML → code généré → implémentation → tests).

---

## 📁 Structure du Répertoire

```
001-hello-api-node/
├── spec.md                          # Spécification complète (USER STORIES + REQUIREMENTS)
├── openapi.yaml                     # Contrat OpenAPI 3.0 (Source of truth)
├── checklists/
│   └── requirements.md              # Validation de qualité de la spec
└── README.md                        # Ce fichier
```

---

## 🎯 Cas d'Utilisation Principaux

### User Story 1 (P1 – MVP): Developer Learns Contract-First Design

**Objectif**: Montrer à un développeur le workflow complet Contract-First:
1. Voir le contrat OpenAPI
2. Générer les types TypeScript
3. Implémenter les handlers
4. Tester contre le contrat
5. Packager et déployer

**Valeur**: Developer comprend que **OpenAPI est une vraie spécification**, pas juste de la documentation.

### User Story 2 (P1 – MVP): Live Demo for Conference

**Objectif**: Exécuter le workflow complet en 25 minutes devant l'audience.

**Valeur**: Audience voit la magie de Contract-First en action – zéro confusion, types safety, test rapides.

### User Story 3 (P2): API Consumption

**Objectif**: API fonctionne comme prévu, réponses valides, erreurs claires.

**Valeur**: Operational reliability.

---

## 📊 Contrat OpenAPI

Le fichier [openapi.yaml](./openapi.yaml) définit:

### Endpoints Disponibles

| Path | Méthode | Description | Paramètres |
|------|---------|-------------|-----------|
| `/api/hello` | GET | Salutation générique | Aucun |
| `/api/hello/{name}` | GET | Salutation personnalisée | `name` (2-25 chars, alphanum+ponctuation) |
| `/health` | GET | Probe santé (K8s liveness) | Aucun |

### Réponses

**200 OK** (Success):
```json
{
  "message": "Hello Philippe"
}
```

**400 Bad Request** (Validation Error):
```json
{
  "timestamp": "2026-04-24T10:30:00.000Z",
  "status": 400,
  "error": "Bad Request",
  "message": "name must match pattern: ^[a-zA-Z ,.'-]+$",
  "path": "/api/hello/123-invalid"
}
```

**200 OK** (Health):
```json
{
  "status": "healthy",
  "uptime": 12345
}
```

---

## ✅ Critères de Succès

La spécification définit **7 critères de succès** mesurables:

| ID | Critère | Mesure | Cible |
|----|---------|--------|-------|
| **S1** | Workflow reproductible | Newbie suit la démo | 100% success rate |
| **S2** | Type safety | Prevents errors | Zero TypesMismatchErrors |
| **S3** | OpenAPI compliance | Tests d'intégration | 100% pass rate |
| **S4** | Dev loop rapide | Edit → test → see results | < 5 sec |
| **S5** | Health check robust | K8s probe reliability | 99.99% success |
| **S6** | Deployment smooth | Build → deploy → run | Zero rollbacks |
| **S7** | Conference professionnelle | Demo flawless | Standing ovation 👏 |

---

## 🛠️ Exigences Fonctionnelles

### API Endpoints (FR-001 à FR-007)

- ✅ GET /api/hello MUST return `{ "message": "Hello World" }`
- ✅ GET /api/hello/{name} MUST return `{ "message": "Hello {name}" }`
- ✅ {name} MUST validate: minLength=2, maxLength=25, pattern=`^[a-zA-Z ,.'-]+$`
- ✅ Invalid {name} MUST return HTTP 400 + structured error JSON
- ✅ All responses MUST have `Content-Type: application/json`

### Health Endpoint (FR-008 à FR-010)

- ✅ GET /health MUST return HTTP 200 with `{ "status": "healthy" }`
- ✅ Response time MUST be < 500ms
- ✅ No external dependencies

### Code Generation & Contract (FR-011 à FR-015)

- ✅ OpenAPI spec is single source of truth
- ✅ TypeScript types auto-generated (zero manual edits)
- ✅ Generated code TypeScript strict-compliant
- ✅ Build: `npm run generate:api` regenerates types
- ✅ Generated code NOT committed (`.gitignore`)

### Architecture (FR-016 à FR-020)

- ✅ Controllers in `src/api/controllers/` (Delegate pattern)
- ✅ Business logic in `src/services/HelloService`
- ✅ Service interface-based
- ✅ Validation via zod/joi schemas
- ✅ Error handling centralized

### Testing (FR-021 à FR-025)

- ✅ Unit tests: HelloService (mocked deps)
- ✅ Integration tests: All endpoints (supertest)
- ✅ Happy path + validation errors covered
- ✅ Tests isolated (no order dependencies)

### Deployment (FR-026 à FR-029)

- ✅ Containerizable (Dockerfile present)
- ✅ No manual config (env vars only)
- ✅ K8s livenessProbe configured
- ✅ Graceful SIGTERM shutdown

### Code Quality (FR-030 à FR-033)

- ✅ TypeScript strict mode
- ✅ ESLint zero warnings
- ✅ Prettier formatting
- ✅ `npm audit` zero vulnerabilities

---

## 🎓 Learning Outcomes for Conference

**What audience learns**:

1. **OpenAPI is a development contract** – Not just documentation you write after code.
2. **Code generation prevents bugs** – Types are generated; misalignment is caught at compile time.
3. **Layered architecture is practical** – Controllers → Services → Domain; enables testing & scaling.
4. **Container-native is a design pattern** – Health checks, graceful shutdown, env config; not magic.

---

## 📋 Architecture Pattern

```
┌─────────────────────────────────────┐
│ HTTP Request (Express.js)           │
└─────────────┬───────────────────────┘
              ↓
┌─────────────────────────────────────────────────────┐
│ API Layer (src/api/controllers/hello.controller.ts) │
│ - Extract request params                             │
│ - Validate via Zod schema                            │
│ - Call service                                       │
└─────────────┬───────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────┐
│ Service Layer (src/services/hello.service.ts)       │
│ - Business logic (string interpolation)              │
│ - No HTTP concerns                                   │
│ - Easily testable (unit tests, no Express needed)   │
└─────────────┬───────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────┐
│ Response (HelloDto)                                  │
│ - Serialized to JSON                                │
│ - Matches OpenAPI schema                            │
│ - Type-safe (generated from spec)                   │
└─────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ HTTP Response (application/json)    │
└─────────────────────────────────────┘
```

---

## 🚀 Out of Scope (MVP Focus)

❌ **Not included in this spec** (can be added later):

- AsyncAPI/event messaging
- WebSocket/streaming
- Query parameters or filters
- Database integration
- Authentication/Authorization
- Rate limiting
- Prometheus metrics
- Distributed tracing

---

## 📝 Assumptions

| No. | Assumption | Rationale |
|-----|-----------|-----------|
| 1 | Default greeting: "World" | Convention, matches Java version |
| 2 | {name} is path parameter | REST best practice for resource ID |
| 3 | Preserve whitespace in name | Respect user intent |
| 4 | No i18n (multi-language) | Out of scope for MVP |
| 5 | No HTTP caching headers | Cheap computation, fresh every time |
| 6 | CORS allow-all in dev/staging | Restrict in production via env config |
| 7 | Log all requests (INFO level) | Standard observability |
| 8 | Port: 3000 (not 8080) | Node.js convention |
| 9 | No external services in health | Immediate response for K8s |
| 10 | Trim disabled | Preserve exact user input |

---

## ✨ Quality Validation

**Checklist Status**: ✅ **SPECIFICATION QUALITY PASSED**

See [checklists/requirements.md](./checklists/requirements.md) for full validation details.

**Summary**:
- ✅ All mandatory sections complete
- ✅ Requirements testable and unambiguous
- ✅ Success criteria measurable & technology-agnostic
- ✅ Edge cases identified
- ✅ Scope clearly bounded
- ✅ Demo-ready for BordeauxJS (25 min, zero blockers)

---

## 🔗 Related Documents

- **Constitution**: [../../.specify/memory/constitution.md](../../.specify/memory/constitution.md) – 6 principles for Node.js projects
- **OpenAPI Latest Version**: [openapi.yaml](./openapi.yaml) – Spec reference
- **Architecture Analysis**: To be created during planning phase

---

## 👥 Status & Sign-Off

| Role | Status |
|------|--------|
| Specification Author | ✅ Complete |
| Architecture Review | ⏳ Pending |
| Conference Lead | ⏳ Pending |
| Implementation | ⏳ Next Phase(/speckit.plan) |

---

## 📞 Questions & Clarifications

**One outstanding clarification note** (low priority):

- **Duplicate parameters**: Path params can't be duplicated in HTTP, so non-issue. Default: use first value, document in code.

**Resolution**: ✅ Proceed to planning phase.

---

**Version**: 0.1.0 (Draft)  
**Created**: 2026-04-24  
**Status**: Ready for Architecture Planning  
**Next Step**: `/speckit.plan` for detailed design