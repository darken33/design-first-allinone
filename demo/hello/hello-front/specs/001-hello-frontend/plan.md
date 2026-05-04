# Implementation Plan: Application Frontend Hello

**Branch**: `002-hello-frontend` | **Date**: 2026-04-29 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-hello-frontend/spec.md`

## Summary

Créer une application frontend Angular 20 (page unique, standalone components, Signals) qui
consomme les trois endpoints de la Hello API (`GET /api/v1/hello`, `GET /api/v1/hello/{name}`,
`GET /health`). L'application affiche une salutation générique au chargement, permet la saisie
d'un prénom pour obtenir une salutation personnalisée et affiche un indicateur de santé du backend.
Aucun routage. CSS natif. Template-driven form. Proxy Angular dev pour CORS.

## Technical Context

**Language/Version**: TypeScript ~5.9.3 (compatible Angular 20, `>=5.8 <6.0`)
**Primary Dependencies**: Angular 20.3.x, RxJS ^7.8.2, Zone.js ~0.15.0
**Storage**: N/A — aucune persistance locale
**Testing**: Jasmine + Karma (`ng test`, configuration par défaut Angular CLI)
**Target Platform**: Navigateurs desktop modernes (Chrome, Firefox, Edge — dernières versions)
**Project Type**: SPA (Single Page Application) — frontend web
**Performance Goals**: Affichage des données API dans les 2 secondes sur connexion locale
**Constraints**: Page unique sans routage ; pas d'authentification ; pas de CI/CD ; CSS natif uniquement
**Scale/Scope**: 1 page, 3 endpoints API, 2 composants enfants, 1 service HTTP

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principe | Vérification initiale | Vérification post-design |
|----------|-----------------------|--------------------------|
| I. Versions récentes | ✅ Angular 20.3.x + TypeScript 5.9.x (dernières compatibles) | ✅ confirmé via `npm show` |
| II. CLI en priorité | ✅ `ng new`, `ng generate`, `ng serve`, `ng test` utilisés exclusivement | ✅ quickstart.md CLI-first |
| III. KISS | ✅ Page unique, CSS natif, template-driven form, pas de routing | ✅ 1 service, 2 composants enfants max |
| IV. Séparation UI / Traitement | ✅ `HelloService` pour tous les appels HTTP ; composants = présentation pure | ✅ contracts/hello-api.md définit l'interface service |

**Résultat**: ✅ Tous les gates passent — aucune violation à justifier.

## Project Structure

### Documentation (cette feature)

```text
specs/001-hello-frontend/
├── plan.md              # Ce fichier
├── research.md          # Phase 0 — décisions techniques
├── data-model.md        # Phase 1 — interfaces TypeScript
├── quickstart.md        # Phase 1 — guide démarrage rapide
├── contracts/
│   └── hello-api.md     # Phase 1 — contrat API consommé
├── checklists/
│   └── requirements.md  # Qualité spec
└── tasks.md             # Phase 2 (/speckit.tasks — non créé ici)
```

### Source Code (racine du projet Angular)

```text
hello-front/
├── src/
│   ├── app/
│   │   ├── app.component.ts          ← Composant racine (standalone) — layout principal
│   │   ├── app.component.html        ← Template : 3 zones (greeting, form, health)
│   │   ├── app.component.css
│   │   ├── app.component.spec.ts
│   │   ├── app.config.ts             ← Bootstrap standalone : provideHttpClient(), provideZoneChangeDetection()
│   │   ├── components/
│   │   │   ├── greeting/
│   │   │   │   ├── greeting.component.ts      ← Zone salutation + loading + erreur
│   │   │   │   ├── greeting.component.html
│   │   │   │   └── greeting.component.css
│   │   │   └── health-status/
│   │   │       ├── health-status.component.ts ← Badge santé coloré + uptime
│   │   │       ├── health-status.component.html
│   │   │       └── health-status.component.css
│   │   ├── services/
│   │   │   ├── hello.service.ts               ← HttpClient : getGreeting, getPersonalizedGreeting, getHealth
│   │   │   └── hello.service.spec.ts
│   │   └── models/
│   │       └── hello-api.models.ts            ← Interfaces : HelloDto, HealthDto, ApiErrorResponse, LoadingState<T>
│   ├── index.html
│   └── styles.css                             ← Styles globaux minimaux
├── proxy.conf.json                            ← Proxy dev : /api et /health → localhost:3000
├── angular.json
├── package.json
├── tsconfig.json
├── openapi.yaml                               ← Contrat API (référence)
├── specs/                                     ← Documentation Speckit
└── .specify/                                  ← Configuration Speckit
```

**Structure Decision**: Application Angular standard (CLI-generated). Pas de `NgModule`.
Composants standalone. Un service racine `HelloService`. Interfaces dans `models/`.
Proxy dev dans `proxy.conf.json`.

## Complexity Tracking

Aucune violation de la constitution — section non requise.
