# Research: Hello API Node.js — AsyncAPI Event-Driven Architecture

**Feature**: `002-hello-api-eda` | **Date**: 2026-04-29 | **Status**: Complete

---

## 1. AsyncAPI Code Generation for TypeScript/Node.js

**Decision**: `@asyncapi/generator` + `@asyncapi/nodejs-template`

**Rationale**: Le template officiel `@asyncapi/typescript-node-template` n'est plus maintenu
activement. L'alternative recommandée par AsyncAPI Initiative est `@asyncapi/nodejs-template`
(génère un projet Node.js complet avec handlers) ou `@asyncapi/html-template` pour la doc. Pour
la génération de **types TypeScript purs**, l'outil de référence est **`@asyncapi/modelina`** :
il génère uniquement les modèles de données TypeScript depuis le schéma AsyncAPI, sans
infrastructure de serveur. C'est le choix le plus adapté pour ajouter des types à un projet
Express existant.

**Toolchain retenu** :
- `@asyncapi/modelina` — génère `HelloMessagePayload` et autres modèles en TypeScript strict
- CLI : `asyncapi generate models typescript hello-asyncapi-3-full.yaml --output src/generated/events/`
- Script npm : `"generate:events": "asyncapi generate models typescript hello-asyncapi-3-full.yaml -o src/generated/events/"`

**Alternatives considérées** :
- `@asyncapi/nodejs-template` — génère un projet Node.js complet (trop lourd pour l'extension d'un projet existant)
- `@asyncapi/typescript-node-template` — déprécié/non maintenu activement
- Types écrits manuellement — rompt le principe AsyncAPI-First

---

## 2. Client Kafka pour Node.js/TypeScript

**Decision**: `kafkajs` (v2.x)

**Rationale**: `kafkajs` est le client Kafka le plus populaire et le plus mature pour Node.js.
Il est écrit en TypeScript, dispose de types natifs, supporte Kafka 0.10+ et offre une API
moderne async/await. Il est bien supporté pour les tests d'intégration (instance réelle ou mock).

**Configuration producteur minimale** :
```typescript
import { Kafka, Producer } from 'kafkajs';

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID ?? 'hello-api-node',
  brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
});

const producer: Producer = kafka.producer();
await producer.connect();
await producer.send({
  topic: 'event.hello.v1',
  messages: [{ value: JSON.stringify(payload) }],
});
```

**Gestion du cycle de vie** : `producer.connect()` au démarrage de l'app, `producer.disconnect()`
dans le handler SIGTERM (graceful shutdown existant dans `src/shutdown.ts`).

**Alternatives considérées** :
- `node-rdkafka` — bindings C++ librdkafka, plus performant mais plus complexe à installer
- `@confluentinc/kafka-javascript` — nouveau client Confluent, encore immature (2024)

---

## 3. Pattern d'injection de dépendances pour le producteur Kafka

**Decision**: Constructor injection via interface `IEventProducer`

**Rationale**: Le projet existant (feature 001) utilise déjà le pattern constructor injection
dans `HelloService`. L'extension la plus cohérente est d'injecter `IEventProducer` dans
`HelloService` via son constructeur, sans framework DI supplémentaire (pas de inversify,
tsyringe). Cela reste simple, testable, et aligné sur la constitution (Principle III).

**Interface** :
```typescript
export interface IEventProducer {
  sendHelloMessage(payload: HelloMessagePayload): Promise<void>;
}
```

**Alternatives considérées** :
- `tsyringe` ou `inversify` — over-engineering pour un seul producteur
- Singleton global — non testable, viole Principle III

---

## 4. Tests d'intégration Kafka — Image Docker indépendante

**Decision**: `bitnami/kafka` en mode KRaft (sans Zookeeper) via `docker-compose.test.yml` dédié

**Rationale**: Kafka 3.3+ supporte le mode KRaft (sans Zookeeper), ce qui simplifie drastiquement
le démarrage (un seul conteneur au lieu de deux). `bitnami/kafka` est l'image de référence pour
ce mode, bien documentée et stable. Un `docker-compose.test.yml` séparé du `docker-compose.yml`
applicatif respecte la séparation des concerns (infrastructure de test vs infrastructure de dev).

**Configuration KRaft minimale** :
```yaml
# docker-compose.test.yml
services:
  kafka-test:
    image: bitnami/kafka:3.7
    ports:
      - "9093:9092"
    environment:
      - KAFKA_CFG_NODE_ID=1
      - KAFKA_CFG_PROCESS_ROLES=broker,controller
      - KAFKA_CFG_CONTROLLER_QUORUM_VOTERS=1@kafka-test:9093
      - KAFKA_CFG_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:9093
      - KAFKA_CFG_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092
      - ALLOW_PLAINTEXT_LISTENER=yes
```

**Démarrage dans les tests** : `jest.globalSetup` + `execa` pour `docker compose -f docker-compose.test.yml up -d`, `jest.globalTeardown` pour `down`.

**Alternatives considérées** :
- `testcontainers` (`@testcontainers/kafka`) — élégant mais ajoute une dépendance npm lourde
- `kafkajs-mock` — mock en mémoire, ne teste pas l'intégration réelle du client Kafka

---

## 5. Fail-fast vs resilience Kafka au démarrage

**Decision**: Connexion Kafka différée (lazy connect) + fail-fast à la publication

**Rationale**: Si le producteur tente de se connecter à Kafka au démarrage de l'app et que Kafka
est indisponible, le pod crasherait immédiatement. Or la spec impose que le service démarre
toujours avec succès (Assumption 1). La stratégie retenue : `producer.connect()` est appelé une
seule fois au démarrage (attempt), mais l'échec de connexion est loggé sans crasher l'app. À
chaque requête, si la connexion n'est pas établie ou si l'envoi échoue, le service retourne
HTTP 500 (fail-fast, aucun retry — FR-004).

**Alternatives considérées** :
- Connect obligatoire au démarrage (crash si Kafka absent) — viole l'hypothèse de démarrage résilient
- Reconnect automatique avec backoff exponentiel — introduit une latence variable, hors périmètre

---

## 6. Génération de types AsyncAPI — emplacement et gitignore

**Decision**: `src/generated/events/` (parallèle à `src/generated/` existant pour OpenAPI)

**Rationale**: La feature 001 génère déjà les types OpenAPI dans `src/generated/`. Placer les
types AsyncAPI dans `src/generated/events/` maintient la cohérence du projet et un seul répertoire
`generated/` à exclure du git (`.gitignore` : `src/generated/`).

---

## Décisions finales résumées

| Décision | Choix | Justification |
|----------|-------|---------------|
| AsyncAPI codegen | `@asyncapi/modelina` | Types TypeScript purs, simple à intégrer |
| Client Kafka | `kafkajs` v2.x | Natif TypeScript, mature, async/await |
| DI pattern | Constructor injection via interface | Cohérent avec feature 001, sans framework |
| Tests intégration | `bitnami/kafka` KRaft + `docker-compose.test.yml` | Simple, pas de Zookeeper, isolé |
| Startup Kafka | Lazy connect + fail-fast à la publication | Démarrage résilient, HTTP 500 sur erreur |
| Emplacement types générés | `src/generated/events/` | Cohérence avec OpenAPI existant |
