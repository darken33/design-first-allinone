# DEMO-SCRIPT – HelloAPI Contract-First Design (25 min)

**Événement**: BordeauxJS Conference  
**Thème**: Contract-First API Design avec Node.js, TypeScript & OpenAPI  
**Durée**: 25 minutes  
**Pré-requis**: Projet installé (`npm install` + `npm run generate:api` + `npm run dev`)

---

## Préparation Avant la Démo

### Setup (10 min avant)

```bash
# Terminal 1 : serveur en cours
cd hello-api-node
npm run dev
# Laisser tourner

# Terminal 2 : prêt pour les commandes live
cd hello-api-node
```

### Vérification pré-démo

```bash
# Vérifier que le serveur répond
curl http://localhost:3000/health
# Attendu: {"status":"healthy","uptime":X}

curl http://localhost:3000/api/hello/Test
# Attendu: {"message":"Hello Test"}
```

### Fenêtres à avoir ouvertes

- **Éditeur**: `specs/001-hello-api-node/openapi.yaml`
- **Éditeur**: `src/generated/types.ts`
- **Éditeur**: `src/api/controllers/hello.controller.ts`
- **Éditeur**: `src/services/hello.service.ts`
- **Terminal 1**: `npm run dev` (serveur actif)
- **Terminal 2**: prêt pour curl

---

## Script Détaillé

### Segment 1 – Présentation du Contrat OpenAPI (5 min)

**Message clé**: "La spec OpenAPI est notre contrat de développement, pas juste de la documentation."

#### 1.1 – Ouvrir openapi.yaml (2 min)

```bash
cat specs/001-hello-api-node/openapi.yaml
```

Pointer et expliquer :
- `paths: /api/hello` et `/api/hello/{name}` – les 2 routes
- `parameters: name` avec `minLength: 2`, `maxLength: 25`, `pattern` – validation définie dans le contrat
- `responses: HelloDto` – la structure de réponse

**À dire** :
> "Ce fichier YAML définit précisément ce que fait notre API avant d'écrire une seule ligne de code TypeScript.
> Les endpoints, les paramètres, les validations, les réponses — tout est là.
> C'est le **source of truth** de notre API."

#### 1.2 – Expliquer le Contract-First (3 min)

**À dire** :
> "En Contract-First, on commence par le contrat, pas par le code.
> Ça force à réfléchir à l'interface publique de l'API avant son implémentation.
> Les consommateurs de l'API peuvent travailler en parallèle avec le contrat comme référence.
> Et si le contrat change, le build TypeScript échoue — on détecte les breaking changes à la compilation."

---

### Segment 2 – Génération de Code depuis le Contrat (2 min)

**Message clé**: "Les types TypeScript sont générés automatiquement depuis la spec — zéro saisie manuelle."

#### 2.1 – Montrer la génération (1 min)

```bash
# Montrer la commande (types déjà générés, mais montrer ce que ça fait)
cat package.json | grep generate
# "generate:api": "orval --config orval.config.mjs"

# Montrer le résultat
cat src/generated/types.ts
```

**Pointer** :
- `export type HelloDto = { message: string; }`
- `export type HealthDto = { status: string; uptime: number; }`
- `export type ApiErrorResponse = { timestamp: string; status: number; ... }`

#### 2.2 – Type Safety (1 min)

**À dire** :
> "Ces types correspondent exactement au schéma OpenAPI.
> Si je modifie le contrat OpenAPI et que mon code utilise toujours l'ancien type, TypeScript refuse de compiler.
> C'est un filet de sécurité gratuit."

---

### Segment 3 – Implémentation et Validation (5 min)

**Message clé**: "Le code implémente le contrat — les couches sont séparées, testables indépendamment."

#### 3.1 – Montrer le Controller (2 min)

```bash
# Ouvrir dans l'éditeur
code src/api/controllers/hello.controller.ts
```

**Pointer** :
- Import du type généré `HelloDto`
- Extraction du paramètre `name` depuis `req.params`
- Appel du service
- Retour structuré conforme au type

**À dire** :
> "Le controller orchestre : il extrait les données HTTP, délègue au service, retourne la réponse.
> Pas de logique métier ici — juste du câblage."

#### 3.2 – Montrer le Service (1 min)

```bash
code src/services/hello.service.ts
```

**Pointer** :
- Logique pure sans dépendance HTTP
- Interface `IHelloService` (injection de dépendances)

**À dire** :
> "La logique métier est isolée dans le service.
> Aucune dépendance à Express — c'est une fonction pure, facile à tester."

#### 3.3 – Démo Live de la Validation (2 min)

```bash
# Happy path
curl http://localhost:3000/api/hello
# {"message":"Hello World"}

curl http://localhost:3000/api/hello/Philippe
# {"message":"Hello Philippe"}

curl http://localhost:3000/api/hello/Jean-Paul
# {"message":"Hello Jean-Paul"}

# Validation errors (matching OpenAPI constraints)
curl -i http://localhost:3000/api/hello/a
# HTTP/1.1 400 Bad Request
# {"timestamp":"...","status":400,"error":"Bad Request","message":"...","path":"..."}

curl -i http://localhost:3000/api/hello/123invalid
# HTTP/1.1 400 Bad Request
```

**À dire** :
> "La validation reflète exactement les contraintes définies dans l'OpenAPI.
> Le client reçoit une erreur structurée — même format défini dans le contrat."

---

### Segment 4 – Tests (3 min)

**Message clé**: "Les tests valident que l'implémentation respecte le contrat."

#### 4.1 – Tests unitaires (1 min)

```bash
# Dans Terminal 2 (pas besoin de stopper le serveur)
npm test -- --testPathPattern="spec" --no-coverage 2>&1 | tail -20
```

**À dire** :
> "Les tests unitaires tournent sans serveur HTTP — rapides et isolés."

#### 4.2 – Tests d'intégration (1 min)

```bash
npm run test:integration 2>&1 | tail -20
```

**À dire** :
> "Les tests d'intégration valident les endpoints HTTP complets.
> Ils vérifient que l'implémentation correspond au contrat OpenAPI."

#### 4.3 – Contract tests (1 min)

```bash
npm test -- --testPathPattern="contract" --no-coverage 2>&1 | tail -10
```

**À dire** :
> "Les contract tests vérifient que les types générés correspondent à l'OpenAPI.
> C'est un guard contre la dérive entre spec et implémentation."

---

### Segment 5 – Containerisation et Déploiement (5 min)

**Message clé**: "Du code au container en une commande — prêt pour Kubernetes."

#### 5.1 – Montrer le Dockerfile (1 min)

```bash
cat Dockerfile
```

**Pointer** :
- Stage 1 (builder) : compilation TypeScript + génération de types
- Stage 2 (runtime) : image Alpine légère, ~200MB

#### 5.2 – Build Docker (2 min)

```bash
docker build -t hello-api-node:demo . 2>&1 | tail -5
docker images hello-api-node
# Size ~200MB
```

**Pendant le build, montrer** :
```bash
ls kubernetes/
# deployment.yaml, service.yaml
```

**À dire** :
> "Le Dockerfile génère les types depuis l'OpenAPI pendant le build.
> L'image finale n'inclut que le JavaScript compilé — pas les sources TypeScript."

#### 5.3 – Kubernetes Readiness (2 min)

```bash
cat kubernetes/deployment.yaml
```

**Pointer** :
- `replicas: 2`
- `livenessProbe` sur `GET /health`
- `resources.limits` CPU + mémoire

**À dire** :
> "La probe de liveness utilise notre endpoint `/health`.
> Kubernetes redémarre automatiquement les pods qui ne répondent plus."

---

### Segment 6 – Récapitulatif et Q&A (5 min)

#### 6.1 – Récapitulatif (3 min)

**À dire** :

> **"Ce qu'on a vu aujourd'hui :"**
>
> 1. **OpenAPI est votre contrat** — pas juste de la doc. Il guide toute la conception.
> 2. **La génération de code** (orval) élimine la saisie manuelle des types et évite les incohérences.
> 3. **L'architecture en couches** (Controller → Service → Validation) rend chaque partie testable isolément.
> 4. **Les tests valident le contrat** — pas juste le comportement interne.
> 5. **Container-native** dès le départ — Docker + K8s manifests inclus.

#### 6.2 – Q&A (2 min)

**Questions fréquentes** :

| Question | Réponse |
|----------|---------|
| "Pourquoi Contract-First plutôt que code-first ?" | L'API est une frontière publique — définir l'interface avant le code force à réfléchir aux consommateurs d'abord. |
| "Comment garder l'OpenAPI en sync ?" | Les contract tests détectent les dérives ; le CI/CD bloque si les types générés ne compilent plus. |
| "orval ou openapi-generator ?" | orval est plus idiomatique TypeScript, supporte React Query / SWR. openapi-generator est plus polyglotte. |
| "Zod vs class-validator ?" | Zod est purement TypeScript, plus léger, infère les types. class-validator nécessite des decorators et reflect-metadata. |
| "En production ?" | Base solide. Ajouter : auth (JWT/OAuth), base de données, rate limiting, monitoring (Prometheus/Grafana). |

---

## Plan de Contingence

### Si le serveur ne démarre pas

```bash
# Vérifier le port
lsof -i :3000
kill -9 <PID>
npm run dev
```

### Si npm run dev échoue (erreur TypeScript)

```bash
# Utiliser la version compilée
npm run build && node dist/index.js
```

### Si curl ne répond pas

```bash
# Tester directement avec Node
node -e "require('http').get('http://localhost:3000/health', r => r.pipe(process.stdout))"
```

### Si le build Docker est trop long

Passer directement à la démo K8s avec l'image pré-buildée :
```bash
docker run -p 3000:3000 hello-api-node:latest
```

---

## Timings Résumé

| Segment | Durée | Commandes clés |
|---------|-------|----------------|
| 1. OpenAPI Contract | 5 min | `cat openapi.yaml` |
| 2. Code Generation | 2 min | `cat src/generated/types.ts` |
| 3. Implementation + Validation | 5 min | `curl` x5 |
| 4. Tests | 3 min | `npm test`, `npm run test:integration` |
| 5. Docker + K8s | 5 min | `docker build`, `cat kubernetes/deployment.yaml` |
| 6. Recap + Q&A | 5 min | — |
| **Total** | **25 min** | |
