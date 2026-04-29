# Feature Specification: Hello API Node.js — AsyncAPI Event-Driven Architecture

**Feature Branch**: `002-hello-api-eda`
**Created**: 2026-04-29
**Status**: Draft
**Input**: Extension de `001-hello-api-node` avec publication d'événements Kafka via contrat AsyncAPI 3.0

**Conference Context**: DevFest Nantes — "Design-First APIs avec OpenAPI & AsyncAPI"
**Demo Objective**: Montrer comment étendre une API REST existante avec une couche événementielle
asynchrone en partant d'un contrat AsyncAPI 3.0, générer du code TypeScript pour le producteur
Kafka, puis intégrer la publication d'événements dans les handlers existants.

**Depends On**: `specs/001-hello-api-node/spec.md` — l'API REST doit être opérationnelle avant
d'ajouter cette couche.

---

## Clarifications

### Session 2026-04-29

- Q: Comportement du health endpoint en cas de panne Kafka ? → A: Option A — `/health` ignore Kafka (toujours UP si le process tourne) ; l'état Kafka est loggé mais n'impacte pas la probe liveness K8s
- Q: Outillage de génération de code TypeScript depuis AsyncAPI ? → A: Option B — `@asyncapi/generator` + template officiel `@asyncapi/typescript-node-template` ; génération officielle AsyncAPI, une commande, types TypeScript stricts
- Q: Comportement en cas d'erreur Kafka transitoire — retry avant HTTP 500 ? → A: Option A — aucun retry ; première erreur Kafka → HTTP 500 immédiat (fail-fast) ; les retries introduiraient une latence variable et un risque de doublons, tous deux hors périmètre
- Q: Provisionnement Kafka pour les tests d'intégration ? → A: Image Docker Kafka indépendante (ex: `bitnami/kafka`) dédiée aux tests, séparée du `docker-compose.yml` applicatif

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Développeur apprend AsyncAPI-First Design (Priority: P1) 🎯 MVP

**Context**: Lors de la conférence DevFest Nantes, un développeur découvre comment définir un
contrat d'événements avec AsyncAPI avant d'écrire la moindre ligne de code.

**Why this priority**: C'est le cœur pédagogique de la section EDA. Sans la compréhension du
workflow AsyncAPI-First, l'intégration événementielle n'a aucune valeur pédagogique.

**User Flow**:

1. Voir le **contrat AsyncAPI** (`hello-asyncapi-3-full.yaml`) — canal `event.hello.v1`,
   opération `sendHelloMessage`, schéma `HelloMessagePayload`
2. Comprendre la structure : `channels → operations → messages → schemas`
3. Voir la **génération de code** TypeScript depuis le YAML AsyncAPI (types + interface producteur)
4. Constater que les **types TypeScript** générés imposent le contrat événementiel à la compilation
5. Implémenter la **couche service** en appelant le producteur généré après chaque salutation
6. Valider avec des **tests** que chaque appel REST déclenche exactement un événement publié

**Independent Test**: Valider que le contrat AsyncAPI + code généré + tests d'intégration forment
un cycle cohérent et reproductible, indépendamment de la couche REST.

**Acceptance Scenarios**:

1. **Given** Developer runs `npm run generate:events`, **When** AsyncAPI codegen executes,
   **Then** TypeScript types (`HelloMessagePayload`, interface producteur) sont générés,
   strictement typés, sans modification manuelle requise
   - `HelloMessagePayload` has field `message: string` with pattern constraint `^Hello .+$`
   - Generated producer interface matches `sendHelloMessage` operation from AsyncAPI spec
   - Zero `any` types in generated output

2. **Given** Developer implements event publishing in `HelloService`, **When** Calls
   `GET /api/hello/Philippe`, **Then** Exactly one Kafka event is published on `event.hello.v1`
   with payload `{ "message": "Hello Philippe" }`
   - Payload matches `HelloMessagePayload` schema
   - Event published (awaited) before HTTP 200 is returned
   - Kafka `groupId` is `my-group-id`

3. **Given** Developer modifies the AsyncAPI schema (e.g., adds a field to `HelloMessagePayload`),
   **When** Runs `npm run generate:events`, **Then** TypeScript compilation fails at all call sites
   not providing the new field — demonstrating contract-first enforcement

---

### User Story 2 — Démo live : flux EDA en action aux côtés du REST (Priority: P1) 🎯 MVP

**Context**: Le présentateur DevFest Nantes montre, en direct, comment un appel REST unique
déclenche un événement Kafka asynchrone.

**Why this priority**: La démo live doit clairement montrer la chaîne
`requête REST → logique métier → événement Kafka`. C'est le moment le plus visuellement
impactant de la section EDA.

**User Flow**:

1. Montrer l'**AsyncAPI YAML** (3 min) — contrat minimal, un canal, un message
2. Lancer `npm run generate:events` (2 min) — types générés en temps réel
3. Ajouter l'**appel producteur** dans `HelloService` (5 min) — une ligne, type-safe
4. Lancer `npm test` (2 min) — tous les tests passent, y compris la publication d'événements
5. Appeler l'API avec cURL (2 min) — l'événement apparaît dans le consumer Kafka
6. Montrer le **payload** dans le topic (2 min) — conformité avec le schéma AsyncAPI visible

**Independent Test**: Démo complète du début à la fin < 20 min, zéro erreur, payload de
l'événement visible et conforme au schéma AsyncAPI.

**Acceptance Scenarios**:

1. **Given** Présentateur appelle `GET /api/hello/World`, **When** L'API répond HTTP 200,
   **Then** Un consumer Kafka sur `event.hello.v1` reçoit `{ "message": "Hello World" }` en
   moins d'une seconde
   - Message est du JSON valide
   - Payload est strictement conforme au schéma `HelloMessagePayload`

2. **Given** Kafka est disponible, **When** `GET /api/hello` et `GET /api/hello/:name` sont
   tous les deux appelés, **Then** Chaque appel produit exactement un événement sur
   `event.hello.v1` — ni doublon, ni événement manquant

3. **Given** Le contrat AsyncAPI est affiché en parallèle des types TypeScript générés,
   **When** L'audience compare les deux, **Then** Le mapping est clairement 1:1
   - JSON Schema dans le YAML → Interface TypeScript
   - Adresse du channel → Nom du topic Kafka
   - Opération `sendHelloMessage` → Signature de la méthode du producteur généré

---

### User Story 3 — Consommateur externe vérifie la publication d'événements (Priority: P2)

**Context**: Un système externe (test d'intégration, service consommateur) veut vérifier que
l'appel à Hello API produit des événements consommables par d'autres services.

**Why this priority**: Fonctionnalité secondaire ; le focus est sur la production et la conformité
au contrat, pas sur la consommation.

**User Flow**:

1. Un consumer externe s'abonne à `event.hello.v1` (groupId `my-group-id`)
2. Appelle `GET /api/hello/Alice`
3. Reçoit l'événement `{ "message": "Hello Alice" }` sur le topic Kafka
4. Valide le payload contre le schéma `HelloMessagePayload`

**Independent Test**: Un test d'intégration s'abonnant à `event.hello.v1` confirme la réception
d'un payload correctement formé après chaque appel REST valide.

**Acceptance Scenarios**:

1. **Given** Kafka est disponible et un consumer est abonné, **When** `GET /api/hello` est
   appelé, **Then** Le consumer reçoit `{ "message": "Hello World" }` sur `event.hello.v1`

2. **Given** Kafka est **indisponible** lors de l'appel `GET /api/hello/Philippe`,
   **Then** La réponse REST est HTTP 500 avec un corps `ApiErrorResponse` (sans stack trace),
   aucun événement n'est publié

3. **Given** La validation échoue (ex: `name = "a"`), **When** `GET /api/hello/a` est appelé,
   **Then** HTTP 400 est retourné et **aucun** événement n'est publié sur `event.hello.v1`

---

### Edge Cases

- **Kafka broker indisponible au démarrage** → Le service démarre avec succès (initialisation
  résiliente), mais chaque appel API tentant de publier un événement retourne HTTP 500 avec
  `ApiErrorResponse`
- **Kafka broker qui devient indisponible en cours de fonctionnement** → L'appel API suivant
  retourne HTTP 500 ; le service doit se rétablir automatiquement quand Kafka redevient disponible
  (sans redémarrage manuel)
- **Échec de validation avant l'appel service** → Le middleware rejette la requête (HTTP 400)
  avant toute publication d'événement — garantie zéro événement parasite
- **Tentative de double publication** → Exactement un événement par requête ; aucun retry dans le
  service, donc aucun risque de doublons dans `event.hello.v1`
- **Payload dont le message ne respecte pas le pattern `^Hello .+$`** → Violation de contrat
  attrapée par la sécurité des types à la compilation, impossible à runtime

---

## Requirements *(mandatory)*

### Functional Requirements — Publication d'événements

- **FR-001**: Le service DOIT publier un événement `HelloMessagePayload` sur le topic Kafka
  `event.hello.v1` après chaque réponse de salutation réussie (HTTP 200)
- **FR-002**: Le payload de l'événement DOIT être `{ "message": "Hello <name>" }` où `<name>`
  correspond au message de salutation retourné
- **FR-003**: L'événement DOIT être publié avec le Kafka `groupId` `my-group-id` tel que défini
  dans le contrat AsyncAPI
- **FR-004**: Si Kafka est indisponible ou lance une erreur, l'API DOIT retourner HTTP 500 avec un corps
  `ApiErrorResponse` **immédiatement** (fail-fast, aucun retry) ; aucun succès partiel n'est acceptable
  (vénement sans réponse, ou réponse sans événement)
- **FR-005**: Un échec de validation DOIT NE PAS produire d'événement Kafka ; la réponse HTTP 400
  est retournée sans effets de bord

### Functional Requirements — Contrat AsyncAPI

- **FR-006**: Le fichier AsyncAPI (`hello-asyncapi-3-full.yaml`) DOIT être l'unique source de
  vérité pour le contrat événementiel (canal, schéma du payload, groupId)
- **FR-007**: Les types TypeScript (`HelloMessagePayload`, interface du producteur) DOIVENT être
  auto-générés depuis la spec AsyncAPI (zéro modification manuelle des fichiers générés)
- **FR-008**: Les types générés DOIVENT être conformes au mode strict TypeScript (pas de `any`,
  pas de types implicites)
- **FR-009**: La commande `npm run generate:events` DOIT regénérer les types événementiels depuis
  la spec AsyncAPI via `@asyncapi/generator` + template `@asyncapi/typescript-node-template`, sans erreur
- **FR-010**: Le code événementiel généré NE DOIT PAS être commité dans git (`.gitignore`)

### Functional Requirements — Intégration architecturale

- **FR-011**: La publication d'événements DOIT être encapsulée derrière une interface
  (`EventProducerInterface`) pour permettre le mock dans les tests unitaires
- **FR-012**: `HelloService` DOIT appeler le producteur d'événements après le calcul du message
  de salutation, avant de retourner la réponse
- **FR-013**: Le producteur d'événements DOIT être injecté dans `HelloService` par injection de
  dépendances (découplage)
- **FR-014**: La gestion des erreurs Kafka DOIT être propagée comme HTTP 500 via le middleware
  centralisé existant (pas de nouveaux blocs try-catch dans les controllers)

### Functional Requirements — Tests

- **FR-015**: Les tests unitaires pour `HelloService` DOIVENT mocker le producteur d'événements
  et vérifier qu'il est appelé avec le `HelloMessagePayload` correct à chaque requête valide
- **FR-016**: Les tests unitaires DOIVENT vérifier que le producteur d'événements N'EST PAS
  appelé en cas d'échec de validation
- **FR-017**: Les tests unitaires DOIVENT vérifier que HTTP 500 est retourné quand le producteur
  d'événements lance une erreur
- **FR-018**: Les tests d'intégration DOIVENT utiliser une image Docker Kafka indépendante
  (ex: `bitnami/kafka` ou `confluentinc/cp-kafka`) dédiée aux tests et séparée du
  `docker-compose.yml` applicatif, pour vérifier la publication end-to-end
- **FR-019**: Les tests d'intégration DOIVENT vérifier que le payload reçu sur `event.hello.v1`
  est conforme au schéma `HelloMessagePayload`

### Functional Requirements — Observabilité

- **FR-020**: Chaque tentative de publication d'événement DOIT être loggée au niveau INFO
  (topic, résumé du payload — sans PII au-delà du message de salutation)
- **FR-021**: Les erreurs de connexion Kafka DOIVENT être loggées au niveau ERROR avec un contexte
  suffisant pour le diagnostic (pas de stack trace dans les réponses HTTP)
- **FR-022**: Le endpoint `GET /health` DOIT rester indépendant de Kafka — il retourne HTTP 200
  tant que le process Node.js est opérationnel, quelle que soit la disponibilité du broker Kafka ;
  l'état Kafka est tracé dans les logs mais n'impacte pas la probe liveness Kubernetes

### Key Entities

- **HelloMessagePayload**: Payload de l'événement publié sur `event.hello.v1`. Contient
  `message: string` avec le pattern `^Hello .+$`. Auto-généré depuis la spec AsyncAPI.
- **EventProducerInterface**: Abstraction pour la publication d'événements Kafka
  (`sendHelloMessage(payload: HelloMessagePayload): Promise<void>`). Permet le mock dans les tests.
- **KafkaProducerAdapter**: Implémentation concrète de `EventProducerInterface` via le client
  Kafka. Encapsule toutes les dépendances Kafka.
- **HelloService** (étendu): Service domaine existant étendu pour appeler `EventProducerInterface`
  après le calcul de la salutation.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Chaque appel API valide (`GET /api/hello`, `GET /api/hello/:name`) produit
  exactement un événement sur `event.hello.v1` — 100 % de corrélation, zéro perte en conditions
  normales
- **SC-002**: L'indisponibilité de Kafka est détectée et reportée en HTTP 500 dans 100 % des cas,
  sans stack trace exposée aux clients
- **SC-003**: Les échecs de validation produisent zéro événement Kafka — garantie d'absence
  d'événements parasites depuis des requêtes invalides
- **SC-004**: Les types TypeScript générés imposent le contrat `HelloMessagePayload` à la
  compilation — zéro violation de type possible à runtime
- **SC-005**: La suite de tests unitaires couvre tous les chemins de publication d'événements
  (happy path, panne Kafka, bypass validation) — couverture de branches ≥ 80 % sur `HelloService`
- **SC-006**: La latence supplémentaire due à la publication d'événements est inférieure à 100 ms
  (mesurée de la requête REST à l'accusé de réception Kafka) en conditions normales
- **SC-007**: La démo live du flux EDA complet (AsyncAPI → generate → implement → test →
  observer l'événement) se termine en moins de 20 minutes sans erreur

---

## Assumptions

1. Kafka tourne en local sur `localhost:9092` pour le développement ; en production l'adresse
   est surchargée via la variable d'environnement `KAFKA_BROKERS`
2. L'API REST (`specs/001-hello-api-node`) est entièrement opérationnelle avant que cette
   fonctionnalité soit développée en couche supérieure
3. Aucune authentification n'est requise sur le broker Kafka pour le développement local
4. Le service est **producteur d'événements uniquement** ; la consommation des événements de
   `event.hello.v1` est hors périmètre de cette application
5. La publication d'événements est **synchrone du point de vue du service** — le service attend
   l'accusé de réception Kafka avant de retourner la réponse HTTP ; le fire-and-forget pur est
   hors périmètre
6. La spec AsyncAPI (`hello-asyncapi-3-full.yaml`) est finalisée et ne changera pas durant le
   développement de cette fonctionnalité
7. Le `groupId` `my-group-id` du contrat AsyncAPI est utilisé pour le binding producteur ;
   la gestion des consumer groups est hors périmètre
8. Docker Compose fournira une instance Kafka locale pour le développement et les tests
   d'intégration (pas de Kafka cloud requis)

---

## Constraints & Non-Functional Goals

### Performance Expectations

- **Latence publication événement** : < 100 ms par événement (Kafka local, partition unique)
- **Overhead latence API global** : Augmentation du temps de réponse REST < 100 ms par rapport
  à la baseline pré-EDA (SC-006)
- **Overhead mémoire** : < 50 MB de mémoire résidente additionnelle pour le client Kafka

### Security Posture

- **Pas de PII dans les événements** : Le champ `message` contient uniquement la chaîne de
  salutation — pas d'identifiants utilisateur, pas de tokens
- **Credentials Kafka** : Si SASL/TLS requis en production, les credentials DOIVENT être injectés
  via variables d'environnement (non hardcodés)
- **Réponses d'erreur** : Les erreurs Kafka NE DOIVENT PAS exposer les adresses du broker ou
  la topologie interne dans les réponses HTTP

### Developer Experience

- **AsyncAPI-First** : Contrat défini avant tout code — même discipline que l'OpenAPI-First de
  la feature 001
- **Tests isolés** : Tous les tests unitaires mockent le producteur Kafka ; pas de Kafka réel
  requis pour la suite de tests unitaires
- **Configuration via env vars** : `KAFKA_BROKERS`, `KAFKA_CLIENT_ID`, `KAFKA_GROUP_ID`
  configurables sans modification du code

---

## Out of Scope *(Explicitly excluded)*

❌ **Hors périmètre de cette feature** :

- Consommation d'événements depuis `event.hello.v1`
- Dead-letter queue / stratégies de retry
- Garanties de livraison exactly-once (transactions Kafka)
- Intégration Schema Registry (Avro/Protobuf)
- Tracing OpenTelemetry pour les événements
- Event sourcing ou patterns CQRS
- Topics Kafka multiples
- Publication d'événements en batch

---

## Definition of Done

✅ **Feature est DONE quand** :

1. ✅ Spec AsyncAPI inchangée et traitée comme source de vérité
2. ✅ `npm run generate:events` produit des types TypeScript sans erreur
3. ✅ Tous les functional requirements implémentés (FR-001 à FR-021)
4. ✅ Tous les acceptance scenarios passent (tests unitaires + intégration)
5. ✅ Aucune stack trace exposée dans les réponses HTTP d'erreur
6. ✅ Tests unitaires mockent le producteur et couvrent toutes les branches de `HelloService`
7. ✅ Tests d'intégration confirment la publication end-to-end via image Docker Kafka dédiée aux tests
8. ✅ Couverture de tests ≥ 80 % pour le nouveau code
9. ✅ Code passe TypeScript strict, ESLint, Prettier
10. ✅ `.gitignore` mis à jour pour exclure les types événementiels générés
11. ✅ Démo live exécutée avec succès (< 20 min, zéro erreur)

---

## Dependencies & Blockers

**Hard Dependency (Blocking)** :

- `specs/001-hello-api-node` — l'API REST doit être entièrement opérationnelle
- Spec AsyncAPI (`hello-asyncapi-3-full.yaml`) doit être finalisée
- Image Docker Kafka indépendante (ex: `bitnami/kafka`) disponible pour les tests d'intégration

**Soft Dependencies** :

- `@asyncapi/generator` + template `@asyncapi/typescript-node-template` pour la génération de code
  TypeScript depuis la spec AsyncAPI
- Image Docker Kafka dédiée aux tests (ex: `bitnami/kafka`, `confluentinc/cp-kafka`)
  — séparée du `docker-compose.yml` applicatif

---

**Version**: 1.0.0 | **Created**: 2026-04-29 | **Status**: Draft | **Extends**: `001-hello-api-node`
