# API Contract: Hello Service

**Type**: Consommateur HTTP (frontend → backend)
**Source**: `openapi.yaml` (Hello API v1.0.0)
**Base URL (dev)**: `http://localhost:3000` — proxyfié via Angular dev server

---

## Endpoints consommés

### 1. `GET /api/v1/hello` — Salutation générique

**Déclenchement**: Au chargement de la page (ngOnInit / effect)
**Paramètres**: aucun

**Réponses attendues**:

| Code HTTP | Type | Description |
|-----------|------|-------------|
| 200 | `HelloDto` | Message de salutation retourné |
| 500 | `ApiErrorResponse` | Erreur serveur interne |

**Comportement frontend**:
- `200` → afficher `data.message` dans la zone de salutation
- `500` / erreur réseau → afficher un message d'erreur convivial

---

### 2. `GET /api/v1/hello/{name}` — Salutation personnalisée

**Déclenchement**: Sur soumission du formulaire (prénom valide)
**Paramètres**:

| Paramètre | Position | Type | Contraintes |
|-----------|----------|------|-------------|
| `name` | path | `string` | 2–25 chars, `^[a-zA-Z ,.'-]+$` |

**Réponses attendues**:

| Code HTTP | Type | Description |
|-----------|------|-------------|
| 200 | `HelloDto` | Message personnalisé |
| 400 | `ApiErrorResponse` | Validation échouée (paramètre invalide) |
| 500 | `ApiErrorResponse` | Erreur serveur interne |

**Comportement frontend**:
- `200` → afficher `data.message` dans la zone de salutation
- `400` → afficher `error.message` comme erreur de validation
- `500` / erreur réseau → afficher message d'erreur convivial

---

### 3. `GET /health` — État de santé

**Déclenchement**: Au chargement de la page (ngOnInit / effect)
**Paramètres**: aucun

**Réponses attendues**:

| Code HTTP | Type | Description |
|-----------|------|-------------|
| 200 | `HealthDto` | Statut healthy |
| 503 | `HealthDto` | Service dégradé ou indisponible |

**Comportement frontend**:
- `200` + `status: 'healthy'` → badge vert
- `200` + `status: 'degraded'` → badge orange
- `200` + `status: 'unhealthy'` → badge rouge
- `503` / erreur réseau → badge gris "indisponible"

---

## Configuration du proxy Angular (dev)

Fichier `proxy.conf.json` à créer à la racine du projet Angular :

```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  },
  "/health": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true
  }
}
```

Référencé dans `angular.json` :
```json
"serve": {
  "options": {
    "proxyConfig": "proxy.conf.json"
  }
}
```

---

## Service Angular : `HelloService`

Interface publique exposée par le service (couche traitement) :

```typescript
class HelloService {
  getGreeting(): Observable<HelloDto>
  getPersonalizedGreeting(name: string): Observable<HelloDto>
  getHealth(): Observable<HealthDto>
}
```

**Injection**: `providedIn: 'root'`
**Client HTTP**: `HttpClient` (`@angular/common/http`)
**Gestion d'erreurs**: `catchError` — les erreurs HTTP sont transformées en `ApiErrorResponse`
