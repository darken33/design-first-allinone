# Research: Application Frontend Hello

**Phase**: 0 — Résolution des inconnues
**Date**: 2026-04-29
**Feature**: [spec.md](spec.md)

---

## 1. Versions & Toolchain

### Angular & TypeScript

**Decision**: Angular 20.3.x + TypeScript 5.9.x

**Rationale**: Angular CLI `20.3.4` est disponible en local. La dernière version d'Angular 20 est
`20.3.19`. Angular 20 requiert TypeScript `>=5.8 <6.0` ; la version la plus récente dans cette
plage est `5.9.3`. TypeScript 6.0.x n'est PAS compatible avec Angular 20 (vérifié via
`peerDependencies` de `@angular/compiler-cli@20.3.19`).

**Alternatives considérées**: Angular 21.x (dernière publiée sur npm) — rejeté car le CLI
installé est la version 20 ; montée de version possible via `ng update` mais hors périmètre POC.

**Versions retenues**:
| Paquet | Version |
|--------|---------|
| Angular CLI | 20.3.4 (installé) |
| `@angular/core` | ~20.3.19 |
| TypeScript | ~5.9.3 |
| RxJS | ^7.8.2 |
| Node.js | 22.20.0 |
| npm | 10.9.3 |

---

## 2. Architecture des composants

### Standalone Components (sans NgModules)

**Decision**: Tous les composants DOIVENT être déclarés en mode `standalone: true` (ou sans
`NgModule`, le mode par défaut depuis Angular 19).

**Rationale**: Mode par défaut depuis Angular 19 / 20 via `ng new`. Aligné avec la constitution
(principe II). Élimine la complexité des `NgModule` pour un POC.

**Alternatives considérées**: NgModule classique — rejeté (déprécié dans Angular 20, contraire à
la constitution).

---

## 3. Gestion de l'état : Signals vs RxJS Observables

**Decision**: **Angular Signals** (`signal()`, `computed()`, `effect()`) pour tout l'état local
des composants. RxJS uniquement dans les services HTTP (retour naturel d'`HttpClient`), converti
via `toSignal()` pour l'exposition aux composants.

**Rationale**: Signals sont stable depuis Angular 17, officiellement recommandés pour l'état
local simple (Angular 20). KISS-aligné : moins de boilerplate qu'un Observable. `toSignal()`
permet de consommer un Observable HTTP dans un composant sans `subscribe()` / `unsubscribe()`.

**Pattern résultant**:
```
Service: HttpClient → Observable<T>  (couche traitement)
Composant: toSignal(service.call()) → Signal<T | undefined>  (couche présentation)
```

**Alternatives considérées**:
- RxJS pur + `async` pipe — viable mais plus complexe pour un POC mono-page
- NgRx / state management externe — rejeté (violation KISS flagrante pour 1 page)

---

## 4. Gestion des formulaires

**Decision**: **Template-driven Forms** (`FormsModule`, `ngModel`)

**Rationale**: Un seul champ de saisie de prénom → template-driven est la solution la plus
simple et la plus lisible. Validation déclarée en HTML (`required`, `minlength`, `maxlength`,
`pattern`). Pas besoin du `ReactiveFormsModule`.

**Alternatives considérées**: Reactive Forms (`FormControl`, `FormGroup`) — plus puissant mais
verbeux pour un seul champ ; rejeté (KISS).

---

## 5. Syntaxe de contrôle de flux Angular

**Decision**: Nouvelle syntaxe **`@if` / `@for` / `@switch`** (Angular 17+, défaut Angular 20)

**Rationale**: Syntaxe par défaut générée par `ng new` dans Angular 20. Plus lisible, plus
performante et sans import de directives (`NgIf`, `NgFor`).

**Alternatives considérées**: `*ngIf` / `*ngFor` — compatibles mais dépréciés ; rejeté.

---

## 6. Proxy de développement (CORS)

**Decision**: **`proxy.conf.json`** Angular Dev Server pour forwarder les appels API vers
`http://localhost:3000`.

**Rationale**: L'application tourne sur `http://localhost:4200` et appelle l'API sur
`http://localhost:3000` → origine différente → erreur CORS sans proxy. La configuration du proxy
Angular (`angular.json` + `proxy.conf.json`) résout cela sans toucher au backend.

**Configuration**:
```json
// proxy.conf.json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true
  },
  "/health": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true
  }
}
```

**Alternatives considérées**: Configuration CORS backend — hors périmètre POC. Variables
d'environnement avec URL absolue — ne règle pas le CORS côté navigateur.

---

## 7. Style & UI

**Decision**: **CSS natif** uniquement (pas d'Angular Material)

**Rationale**: KISS. Un POC démo ne nécessite pas de bibliothèque de composants. CSS natif
suffit pour un indicateur coloré (health), un formulaire simple et un affichage de texte.
Réduire les dépendances = projet plus léger et plus rapide à scaffolder.

**Alternatives considérées**: Angular Material — fonctionnalités utiles (MatProgressSpinner,
MatChip pour le badge health) mais dépendance lourde non justifiée pour un POC.

---

## 8. Initialisation du projet Angular

**Decision**: `ng new` exécuté depuis le **répertoire parent** avec `--force` pour initialiser
Angular dans le répertoire existant `hello-front/`.

**Commande**:
```bash
cd /home/pbousquet/DevFestNantes/demo/hello
ng new hello-front --routing=false --style=css --force
```

**Rationale**: Le répertoire `hello-front/` existe déjà (contient `.specify/`, `specs/`,
`openapi.yaml`). `--routing=false` est cohérent avec la décision page unique (constitution,
clarification Q1). `--style=css` pour rester minimal. `--force` pour ne pas bloquer sur
l'existence du répertoire.

**Notes post-init**: Les fichiers `.specify/`, `specs/` et `openapi.yaml` coexistent avec la
structure Angular générée.

---

## Résumé des décisions

| Domaine | Décision retenue | Rejeté |
|---------|-----------------|--------|
| Framework | Angular 20.3.x | Angular 21.x |
| TypeScript | 5.9.3 | 6.0.x (incompatible) |
| Composants | Standalone | NgModule |
| État | Signals + toSignal() | RxJS Observable pur / NgRx |
| Formulaire | Template-driven | Reactive Forms |
| Flux HTML | @if / @for | *ngIf / *ngFor |
| Proxy dev | proxy.conf.json | CORS backend |
| Style | CSS natif | Angular Material |
| Page | SPA sans routage | Routage Angular |
