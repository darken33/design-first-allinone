# Data Model: Application Frontend Hello

**Phase**: 1 — Conception
**Date**: 2026-04-29
**Source**: [spec.md](spec.md) + [research.md](research.md) + openapi.yaml

---

## Entités du domaine

Ces interfaces TypeScript représentent les données échangées avec la Hello API.
Elles correspondent directement aux schemas OpenAPI (`HelloDto`, `HealthDto`, `ApiErrorResponse`).

### HelloDto

```typescript
interface HelloDto {
  message: string;  // Greeting message, ex: "Hello World" ou "Hello Philippe"
}
```

**Source**: `GET /api/v1/hello` et `GET /api/v1/hello/{name}`
**Contraintes**: `message` toujours présent (required)

---

### HealthDto

```typescript
interface HealthDto {
  status: 'healthy' | 'degraded' | 'unhealthy';  // Health status
  uptime?: number;  // Uptime in seconds (optional)
}
```

**Source**: `GET /health`
**Contraintes**: `status` toujours présent ; `uptime` optionnel

---

### ApiErrorResponse

```typescript
interface ApiErrorResponse {
  timestamp: string;   // ISO 8601 date-time, ex: "2026-04-24T10:30:00.000Z"
  status: number;      // HTTP status code, ex: 400, 500
  error: string;       // Error type, ex: "Bad Request"
  message: string;     // Human-readable error description
  path: string;        // Request path, ex: "/api/v1/hello/123"
}
```

**Source**: Toutes les réponses d'erreur (HTTP 400, 500, 503)
**Contraintes**: `status`, `error`, `message` toujours présents

---

## État de l'interface (UI State)

Ces types décrivent l'état interne des composants Angular (Signals).

### LoadingState\<T\>

Représente le cycle de vie d'un appel API au sein d'un Signal.

```typescript
type LoadingState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };
```

**Utilisation**: wrappé dans un `Signal<LoadingState<T>>` dans les composants.

### HealthIndicatorColor

```typescript
type HealthIndicatorColor = 'green' | 'orange' | 'red' | 'grey';
```

**Mapping**:
| `HealthDto.status` | Couleur |
|-------------------|---------|
| `healthy` | green |
| `degraded` | orange |
| `unhealthy` | red |
| indisponible / erreur | grey |

---

## Règles de validation du prénom

Définies dans le contrat OpenAPI et reflétées côté client (template-driven form) :

| Règle | Valeur |
|-------|--------|
| Longueur minimale | 2 caractères |
| Longueur maximale | 25 caractères |
| Pattern autorisé | `^[a-zA-Z ,.'-]+$` |
| Champ requis | oui |

---

## Dépendances entre entités

```
UserInput (prénom saisi)
  → validation locale (pattern + longueur)
  → GET /api/v1/hello/{name}
  → HelloDto | ApiErrorResponse

Page load
  → GET /api/v1/hello           → HelloDto | ApiErrorResponse
  → GET /health                 → HealthDto | ApiErrorResponse
```
