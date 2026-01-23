<!-- 
=== SYNC IMPACT REPORT ===
Version: 1.0.0 → 1.0.0 (Initial Constitution)
Changes: Initial baseline documentation of HelloAPI architecture principles
New Principles: 
  - I. Spring Boot Microservice First (API-driven architecture)
  - II. OpenAPI/Swagger Contract-First Design
  - III. Layered Architecture with Clear Separation of Concerns
  - IV. Test Coverage with Unit & Integration Tests
  - V. Java 25 LTS with Modern Features & Security
  - VI. Container-Native & Kubernetes-Ready Deployment
Updated Templates: None (First version)
Status: Complete
=== END SYNC IMPACT REPORT ===
-->

# HelloAPI Constitution

Principes d'architecture et pratiques de développement du projet HelloAPI, une API Spring Boot microservice.

## Core Principles

### I. Spring Boot Microservice-First Architecture

Chaque fonctionnalité doit être conçue comme un service microservice complet exposant une API REST.

**Non-négociable:**
- Toute nouvelle fonctionnalité commence par la définition du contrat API OpenAPI/Swagger
- Le service DOIT être containerisable et déployable indépendamment
- La séparation en couches (API → Delegation → Service → Domain) est obligatoire
- Injection de dépendances par constructeur uniquement (pas de `@Autowired` sur les champs)
- Utilisation du pattern Delegate pour découpler la génération OpenAPI de la logique métier

**Rationale:** Cette approche garantit une scalabilité, une testabilité et une maintenabilité optimales. La séparation claire entre contrat API (généré) et implémentation (code métier) réduit le couplage technologique.

### II. OpenAPI/Swagger Contract-First Design

Le contrat API est la source de vérité. La génération de code à partir du contrat OpenAPI est obligatoire.

**Non-négociable:**
- Tous les contrats API DOIVENT être définis en YAML/JSON OpenAPI 3.0.0+
- Les interfaces API sont générées par `openapi-generator-maven-plugin` (délégation + models)
- L'implémentation des déléguées (`Delegate`) est manuelle dans `api/impl/`
- Les DTOs générés ne DOIVENT PAS être modifiés manuellement (ils sont régénérés)
- La validité des payloads via `@Valid` et `Hibernate Validator` est obligatoire

**Rationale:** Contract-first évite les désynchronisations API/implémentation et force une documentation vivante et testable. La génération automatique réduit les erreurs manuelles.

### III. Layered Architecture with Clear Separation of Concerns

L'architecture suit un modèle en couches strictement défini.

**Architecture obligatoire:**
```
api/
├── impl/           # Délégués OpenAPI (implements auto-generated HelloApiDelegate)
hello/
├── api/            # Interfaces métier (e.g., HelloService)
├── domain/         # Implémentations (@Service)
└── spi/            # Contrats pour dépendances externes (optionnel)
config/             # Configuration Spring (@Configuration, @EnableWebSecurity)
```

**Non-négociable:**
- La couche `api` contient UNIQUEMENT les interfaces (contrats métier)
- La couche `domain` contient les implémentations `@Service` ou `@Component`
- La couche `impl` expose les délégués qui orchestrent appels API + logique métier
- Zéro logique métier dans `config/` ou contrôleurs générés
- Toute dépendance externe (DB, cache, etc.) doit passer par le pattern SPI

**Rationale:** Cette hiérarchie explicite facilite la navigation, les tests unitaires isolés, et les évolutions sans risque de casse en cascade.

### IV. Test Coverage with Unit & Integration Tests

Les tests sont un composant architectural, pas une activité post-code.

**Non-négociable:**
- Tests unitaires pour chaque implémentation `@Service` (mocks des dépendances)
- Tests d'intégration pour chaque délégué API avec `@SpringBootTest` + `MockMvc`
- Couverture minimale: Happy paths + cas d'erreur (validation, exceptions métier)
- Tous les tests DOIVENT être nommés avec `@DisplayName` décrivant le scénario
- Les tests unitaires (e.g., `HelloServiceImplTest`) n'utilisent PAS `@SpringBootTest`
- Les tests d'intégration (e.g., `HelloApiIntegrationTest`) utilisent `@SpringBootTest` + `@AutoConfigureMockMvc`
- Les fixtures de test DOIVENT être **déterministes** et **indépendantes** de l'ordre d'exécution

**Tools & Framework:**
- JUnit 5 (Jupiter) obligatoire pour tous les tests
- Mockito pour les mocks/stubs unitaires
- MockMvc pour les tests d'intégration HTTP
- Hamcrest matchers pour les assertions lisibles

**Rationale:** Tests robustes garantissent que les refactorings ne cassent rien et que les contrats API restent cohérents. Séparation unit/intégration → temps de feedback rapide en dev.

### V. Java 25 LTS with Modern Features & Security

Le projet adopte Java 25 (LTS futur) et applique les bonnes pratiques modernes.

**Non-négociable:**
- Compilation cible: Java 25 (`<maven.compiler.target>25</maven.compiler.target>`)
- Spring Boot 4.0.0-M1+ (compatibilité Java 21+)
- Lombok `@Getter`, `@Setter`, `@RequiredArgsConstructor` pour réduire le boilerplate
- Virtual Threads (Project Loom) encouragés pour les tâches I/O-bound
- Records pour les DTOs simples (si applicable; actuellement DTOs générés)
- Gestion des exceptions: `ConstraintViolationException` interceptée par `@ControllerAdvice` global
- Sécurité: `@EnableWebSecurity` avec CORS/CSP headers explicites, authentification disabled pour demo

**Security Baseline:**
- CSRF désactivé (API stateless, requêtes cross-domain attendues)
- CORS permis (`Access-Control-Allow-Origin: *` – à restreindre en production)
- CSP header défini (`Content-Security-Policy: default-src 'self'...`)
- Pas de données sensibles en logs (SLF4J structuré requis)

**Rationale:** Java 25 offre des perfs, une sécurité et une productivité accrues. Lombok réduit la verbosité; les patterns modernes simplifient le code.

### VI. Container-Native & Kubernetes-Ready Deployment

Le projet est conçu pour fonctionner nativement en conteneurs et Kubernetes.

**Non-négociable:**
- Dockerfile simple: `FROM openjdk/openjdk:25-rc` + JAR copié → image ~500MB
- Healthchecks via Spring Actuator: `/actuator/health` (liveness probe)
- Infos d'app exposées: `/actuator/info` avec version dynamique (lié au pom.xml)
- Configuration externe via `application.yaml` (env vars pour prod)
- K8s Deployment: 2 replicas, requests/limits fixés (256Mi/250m req, 512Mi/500m limit)
- Startup rapide visé (~2-5 sec en conteneur)
- CRaC (Coordinated Restore at Checkpoint) exploré pour réduire le startup time

**K8s Resource Manifest Requirements:**
- Deployment avec `matchLabels` et `metadata.labels` alignés
- Service NodePort ou ClusterIP exposé
- Ingress pour routage HTTP/HTTPS (TLS terminé si applicable)
- PodDisruptionBudget pour la résilience (lors de mises à jour)

**Rationale:** Container-native garantit un déploiement cohérent dev→staging→prod. Kubernetes abstracts infrastructure; Actuator fournit telemetry pour orchestration.

## Development Workflow & Quality Gates

### Source Code & Version Control

- Branche principale: `main` ou `master` (protégée)
- Workflow: Feature branch → PR → Reviews → Merge → Auto-deploy
- Commit messages: Descriptifs en anglais (e.g., "feat(api): add hello endpoint", "fix(security): update CSP policy")
- Versioning: Semantic Versioning (MAJOR.MINOR.PATCH) dans `pom.xml`
- Tag Git sur chaque release (e.g., `v1.0.1`)

### Build & Packaging

- Build tool: Maven 3.8.1+ obligatoire
- Clean build requis avant commit: `mvn clean package`
- Tous les artefacts produits (JARs, SARMs, etc.) DOIVENT passer les tests
- Artifacts stockés dans `target/` local; publication en registry privée (registry Maven ou Docker)

### CI/CD Pipeline (Jenkins/GitLab CI)

- Trigger: Push sur feature branch + PR opening
- Stages obligatoires:
  1. **CLEAN & BUILD**: `mvn clean package` (compile + tests)
  2. **CODE QUALITY**: SonarQube scan (optionnel mais recommandé)
  3. **DOCKER BUILD**: Build image Docker, test image (optionnel)
  4. **DEPLOY STAGING**: Deploy sur K8s staging si `main` ou release tag
  5. **SMOKE TESTS**: Vérify healthchecks, endpoints clés
- Failure → Bloquer merge + notifier équipe

### Security & Compliance

- Validation inputs: Tous les inputs REST DOIVENT être validés (`@Valid` + Hibernate Validator)
- Error handling: `CustomErrorHandler` intercepts `ConstraintViolationException`, autres exceptions loggées (pas exposées au client)
- Secrets: PAS de secrets en code; utiliser env vars ou Secret Manager (Vault, K8s Secrets)
- Dépendances: CVE scanning via OWASP Dependency-Check (optionnel) ou Snyk

## Observability & Operational Excellence

### Logging & Monitoring

- Framework: SLF4J + Logback (auto-configuré par Spring Boot)
- Level par défaut: INFO; DEBUG en staging/dev seulement
- Format: JSON structuré en production (facilite parsing/alerting)
- Correlation IDs: À ajouter pour tracer requêtes cross-service

### Actuator & Health

- Endpoints exposés: `/actuator/health`, `/actuator/info` seulement
- Health details: `show-details: always` en dev/test; `when-authorized` en prod
- Liveness probe: `GET /actuator/health` → 200 OK si service OK
- Readiness probe: Optionnel (non configuré actuellement)

### Metrics & APM

- Micrometer auto-inclus par Spring Boot (metrics registry)
- Export optionnel: Prometheus, Datadog, etc. (non configuré actuellement)
- Tracing: OpenTelemetry-ready (à intégrer)

## Governance

### Constitution Compliance

- Cette constitution est la source unique de vérité pour architecture et pratiques
- Toute violation DOIT être justifiée en revue de code; exceptions documentées
- Modifications à la constitution requièrent:
  1. Proposition documentée + rationale
  2. Approbation lead archi + équipe dev
  3. Bump de version (suivre semantic versioning)
  4. Migration plan pour code existant

### Code Review & PR Process

- **Reviewer duties:**
  - Vérifier respect des principes (couches, tests, nommage)
  - Vérifier aucune logique métier en config/controllers générés
  - Vérifier test coverage (unit + intégration)
  - Vérifier pas de secrets/hardcoding
  
- **Auto-checks (CI):**
  - Build DOIT passer (MVN clean package)
  - Tests DOIVENT tous passer
  - Code DOIT compiler sans warnings (si possible)

### Amendment Process

- **PATCH version (v1.0.1):** Typos, clarifications, aucun impact functional
- **MINOR version (v1.1.0):** Nouvelles recommandations, nouveau framework permis
- **MAJOR version (v2.0.0):** Changement architectural (e.g., migration Java version, nouvel ORM)

Changes mineure → simple PR approval; MAJOR → discussion équipe + planning migration.

### Compliance Audit

- Audit architectural semestriel: Vérifier adhérence aux 6 principes
- Tool: Manual review + SonarQube (code smells) + Snyk (CVEs)
- Non-conformités documentées dans issue tracker; priorité assignée

## Templates & Guidance Files

Reference files for developers:

- `.specify/templates/plan-template.md` – Architecture decision template (à créer)
- `.specify/templates/spec-template.md` – API specification boilerplate (à créer)
- `JVM-CONFIG.md` – JVM tuning & debug profiles
- `README.md` – Quick start & project overview (à enrichir)

---

**Version**: 1.0.0 | **Ratified**: 2026-01-23 | **Last Amended**: 2026-01-23
