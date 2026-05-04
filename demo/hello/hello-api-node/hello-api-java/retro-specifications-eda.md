# Feature Specification: Hello API — Service de Salutation Event-Driven

**Feature Branch**: `001-retro-spec-hello-api-eda`
**Created**: 2026-04-28
**Status**: Retro-specification (système existant)
**Type**: Rétro-spécification — le comportement décrit ici reflète le code actuellement en production.

---

## Contexte Métier

Le service **Hello API** est un microservice de démonstration qui illustre comment exposer une API
REST tout en propageant les interactions utilisateurs sous la forme d'événements asynchrones sur
un bus Kafka. Il sert de support pédagogique (DevFest Nantes) pour présenter les patterns
**API-First**, **Event-Driven Architecture** et **Architecture Hexagonale** dans l'écosystème
Spring Boot / Spring Cloud.

---

## User Scenarios & Testing

### User Story 1 — Saluer le Monde (Priority: P1)

Un utilisateur anonyme souhaite obtenir un message de salutation générique, sans fournir aucune
information personnelle.

**Why this priority**: Point d'entrée minimal du service; démontre l'intégration complète
REST → domaine → événement Kafka sur le chemin le plus simple.

**Independent Test**: L'appel `GET /api/v1/hello` doit retourner `{"message":"Hello World"}`
avec HTTP 200, et un événement `HelloMessagePayload{message:"Hello World"}` doit être publié
sur le topic `event.hello.v1`.

**Acceptance Scenarios**:

1. **Given** le service est démarré et Kafka est disponible, **When** un client appelle
   `GET /api/v1/hello`, **Then** la réponse est `HTTP 200` avec le corps
   `{"message": "Hello World"}` et un événement est publié sur `event.hello.v1`.
2. **Given** le service est démarré et Kafka est **indisponible**, **When** un client appelle
   `GET /api/v1/hello`, **Then** la réponse est `HTTP 500` avec un corps `ApiErrorResponse`
   (sans stack trace).

---

### User Story 2 — Saluer une Personne par son Nom (Priority: P1)

Un utilisateur souhaite obtenir un message de salutation personnalisé en fournissant un prénom
ou un nom.

**Why this priority**: Extension directe de US1 avec validation d'entrée; démontre la
validation Bean Validation / OpenAPI et la propagation d'erreur 400.

**Independent Test**: L'appel `GET /api/v1/hello/{name}` avec un nom valide doit retourner
`{"message":"Hello {name}"}` avec HTTP 200, et avec un nom invalide doit retourner HTTP 400
sans exposer de stack trace.

**Acceptance Scenarios**:

1. **Given** un nom valide (2–25 caractères alphabétiques / ponctuation basique, ex: "Philippe"),
   **When** un client appelle `GET /api/v1/hello/Philippe`, **Then** la réponse est `HTTP 200`
   avec `{"message": "Hello Philippe"}` et un événement est publié sur `event.hello.v1`.
2. **Given** un nom trop court (< 2 caractères, ex: "A"), **When** un client appelle
   `GET /api/v1/hello/A`, **Then** la réponse est `HTTP 400` avec un corps `ApiErrorResponse`
   contenant un message d'erreur de validation, sans stack trace.
3. **Given** un nom trop long (> 25 caractères), **When** un client appelle l'endpoint,
   **Then** la réponse est `HTTP 400`.
4. **Given** un nom contenant des caractères interdits (chiffres, `<`, `>`, etc.), **When** un
   client appelle l'endpoint, **Then** la réponse est `HTTP 400`.
5. **Given** le service est démarré et Kafka est disponible, **When** un client appelle
   `GET /api/v1/hello/World`, **Then** un message `{"message":"Hello World"}` est publié sur
   le topic `event.hello.v1` avec le `groupId` `my-group-id`.

---

### User Story 3 — Vérifier la Santé et les Métadonnées du Service (Priority: P2)

Un opérateur (DevOps, SRE, outil de monitoring) souhaite vérifier que le service est opérationnel
et connaître sa version déployée sans avoir à consulter les logs.

**Why this priority**: Requis par les probes Kubernetes liveness/readiness ; essentiel pour les
déploiements sans interruption.

**Independent Test**: `GET /actuator/health` retourne `HTTP 200` avec le détail de santé ;
`GET /actuator/info` retourne les métadonnées git et la version de l'application.

**Acceptance Scenarios**:

1. **Given** le service est démarré, **When** une sonde appelle `GET /actuator/health`,
   **Then** la réponse est `HTTP 200` avec le détail de l'état de chaque composant (base de
   données, broker, etc.).
2. **Given** le service est démarré, **When** un opérateur appelle `GET /actuator/info`,
   **Then** la réponse contient la version de l'application (issue du `pom.xml`) et les
   métadonnées git (branche, commit, date de build).
3. **Given** le service est arrêté ou en cours de démarrage, **When** la sonde readiness appelle
   `/actuator/health`, **Then** la réponse indique un état non-prêt et Kubernetes ne route pas
   de trafic vers ce pod.

---

### Edge Cases

- `name` contenant uniquement des espaces → HTTP 400 (violation du pattern `^[a-zA-Z ,.'-]+$`
  après trim, ou longueur insuffisante).
- `name` avec des caractères d'injection (SQL, HTML, script) → rejeté par le pattern OpenAPI
  avant tout traitement métier.
- Kafka broker indisponible au démarrage → le service démarre quand même (Spring Cloud Streams
  en mode résilient), mais chaque publication d'événement échoue avec HTTP 500.
- CRaC restore (`-XX:CRaCRestoreFrom=./crac`) avec un snapshot périmé → comportement géré par
  la JVM Azul Zulu ; le service doit exposer un état `DOWN` jusqu'à restauration complète.
- Plusieurs consommateurs Kafka externes abonnés à `event.hello.v1` → chaque consommateur reçoit
  les événements selon sa stratégie d'abonnement et son `groupId`, sans impact sur le comportement
  du service Hello API (producteur uniquement).

---

## Requirements

### Functional Requirements

- **FR-001**: Le service DOIT exposer un endpoint `GET /api/v1/hello` retournant
  `{"message": "Hello World"}` avec HTTP 200.
- **FR-002**: Le service DOIT exposer un endpoint `GET /api/v1/hello/{name}` retournant
  `{"message": "Hello {name}"}` avec HTTP 200 lorsque `name` est valide.
- **FR-003**: Le paramètre `name` DOIT être validé : longueur 2–25, caractères autorisés :
  `[a-zA-Z ,.'-]+`.
- **FR-004**: Toute violation de validation DOIT retourner HTTP 400 avec un corps
  `ApiErrorResponse` ; les stack traces ne DOIVENT PAS être exposées.
- **FR-005**: Chaque réponse de salutation réussie DOIT publier un message JSON
  `HelloMessagePayload{message: "Hello <nom>"}` sur le topic Kafka `event.hello.v1`.
- **FR-006**: Le service DOIT exposer `/actuator/health` (avec détail complet) et
  `/actuator/info` (avec version et métadonnées git).
- **FR-007**: La documentation Swagger UI DOIT être accessible à `/swagger-ui.html`.
- **FR-008**: L'image Docker DOIT supporter le démarrage via CRaC restore
  (`-XX:CRaCRestoreFrom=./crac`) pour minimiser le temps de cold-start.
- **FR-009**: Le service DOIT être déployable sur Kubernetes avec 2 replicas, ressources
  bornées, stratégie RollingUpdate, et probes liveness/readiness.

### Key Entities

- **HelloDto**: DTO de réponse REST contenant un unique champ `message` (string). Généré depuis
  `hello.yaml`.
- **ApiErrorResponse**: DTO d'erreur REST contenant `timestamp`, `status`, `error`, `message`,
  `path`. Généré depuis `hello.yaml`.
- **HelloMessagePayload**: Payload d'événement Kafka contenant un champ `message` (string,
  pattern `^Hello .+$`). Généré depuis `hello-asyncapi-3-full.yaml`.
- **HelloService** (port entrant): Interface de domaine `sayHello(String name): String`.
- **HelloServiceImpl** (domaine): Implémentation du port entrant; délègue la publication
  d'événement au producteur généré.
- **DefaultServiceEventsProducer** (adaptateur sortant généré): Abstraction Spring Cloud Streams
  générée par ZenWave SDK; publie via `sendHelloMessage(HelloMessagePayload): boolean`.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Les deux endpoints REST (`/api/v1/hello` et `/api/v1/hello/{name}`) répondent en
  moins d'une seconde en conditions normales (Kafka disponible, service chaud).
- **SC-002**: 100 % des appels REST valides produisent exactement un événement dans
  `event.hello.v1` (zéro perte d'événement en conditions normales).
- **SC-003**: Les noms invalides sont rejetés avec HTTP 400 dans 100 % des cas, sans fuite
  d'information technique dans la réponse.
- **SC-004**: Le service déploie sans interruption de service (zero-downtime rolling update)
  sur Kubernetes grâce aux probes et à la stratégie RollingUpdate.
- **SC-005**: Le temps de démarrage via CRaC restore est inférieur à 1 seconde (vs. démarrage
  JVM classique > 3 secondes).
- **SC-006**: `/actuator/health` répond `UP` dans les 20 secondes suivant le démarrage du pod
  (seuil `initialDelaySeconds` des probes).
- **SC-007**: L'ensemble des tests unitaires (`HelloApiDelegateImplTest`) passe à 100 % lors
  de chaque build Maven (`mvn clean verify`).

---

## Assumptions

1. Kafka tourne en local sur `localhost:9092` pour le développement ; en production l'adresse
   est surchargée par une variable d'environnement ou un secret Kubernetes.
2. Aucune authentification n'est requise sur les endpoints REST (tous publics) ; la configuration
   Spring Security est présente pour être durcie ultérieurement.
3. Le service ne persiste aucune donnée ; il n'y a pas de base de données.
4. Le snapshot CRaC (`./crac`) est créé en amont du déploiement via le script `entrypoint.sh`
   (`JDK.checkpoint`) et packagé dans l'image ou monté en volume.
5. Le service est **producteur d'événements uniquement**; la consommation des événements émis est
  hors périmètre de cette application et relève de services consommateurs externes.
6. L'ingress Kubernetes utilise le hostname `hello-api.localhost` en environnement de
   développement ; ce hostname doit être résolu localement (entrée `/etc/hosts` ou DNS local).
7. Les limites de ressources Kubernetes (256 Mi–512 Mi RAM, 250 m–500 m CPU) sont adaptées à
   une charge de démonstration ; elles doivent être réévaluées pour un usage en charge réelle.
