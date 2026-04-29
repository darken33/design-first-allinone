---
description: "Task list — Application Frontend Hello"
---

# Tasks: Application Frontend Hello

**Input**: Design documents from `/specs/001-hello-frontend/`
**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/hello-api.md ✅ · quickstart.md ✅

**Tests**: Non demandés explicitement — non inclus (conformément aux règles de génération).

**Organisation**: Tâches groupées par user story pour permettre une implémentation et des tests indépendants.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Peut s'exécuter en parallèle (fichiers différents, pas de dépendances)
- **[Story]**: User story concernée (US1, US2, US3)
- Chemins de fichiers exacts inclus dans les descriptions

---

## Phase 1 : Setup — Initialisation du projet Angular

**Objectif**: Scaffolding Angular CLI, configuration du proxy dev, structure de fichiers.

- [x] T001 Initialiser le projet Angular dans le répertoire courant avec `ng new hello-front --routing=false --style=css --directory=. --force` depuis `/home/pbousquet/DevFestNantes/demo/hello/hello-front`
- [x] T002 Vérifier les versions installées (`ng version`) : Angular CLI 20.3.x, TypeScript ~5.9.x, Node 22.x
- [x] T003 [P] Créer le fichier `proxy.conf.json` à la racine du projet avec les règles de forward `/api` et `/health` vers `http://localhost:3000`
- [x] T004 Configurer `angular.json` pour référencer `proxy.conf.json` dans la section `serve > options > proxyConfig`

**Checkpoint** : `ng serve` démarre sans erreur sur `http://localhost:4200`

---

## Phase 2 : Fondations — Infrastructure partagée (bloquante)

**Objectif**: Interfaces TypeScript, configuration bootstrap, service HTTP. Doit être complété avant toute user story.

**⚠️ CRITIQUE** : Aucune user story ne peut démarrer avant la fin de cette phase.

- [x] T005 Créer le fichier `src/app/models/hello-api.models.ts` avec les interfaces `HelloDto`, `HealthDto`, `ApiErrorResponse`, le type `LoadingState<T>` et `HealthIndicatorColor` selon `data-model.md`
- [x] T006 Configurer `src/app/app.config.ts` pour inclure `provideHttpClient()` et `provideZoneChangeDetection({ eventCoalescing: true })` dans le bootstrap standalone
- [x] T007 Générer le service HTTP avec `ng generate service services/hello` dans `src/app/` puis implémenter les trois méthodes dans `src/app/services/hello.service.ts` : `getGreeting(): Observable<HelloDto>`, `getPersonalizedGreeting(name: string): Observable<HelloDto>`, `getHealth(): Observable<HealthDto>` — avec `catchError` transformant les erreurs HTTP en message lisible

**Checkpoint** : `ng build` sans erreur TypeScript ; le service est injectable.

---

## Phase 3 : User Story 1 — Salutation générique (Priority: P1) 🎯 MVP

**Objectif**: Afficher automatiquement le message de `GET /api/v1/hello` au chargement, avec état de chargement et gestion d'erreur.

**Test indépendant**: Ouvrir `http://localhost:4200` — le message "Hello World" de l'API apparaît sans interaction.

- [x] T008 [US1] Générer le composant avec `ng generate component components/greeting` dans `src/app/` — composant standalone dans `src/app/components/greeting/`
- [x] T009 [US1] Implémenter `src/app/components/greeting/greeting.component.ts` : injecter `HelloService`, utiliser `toSignal()` sur `getGreeting()` pour exposer un `Signal<LoadingState<HelloDto>>`, déclencher l'appel au init du composant
- [x] T010 [US1] Rédiger `src/app/components/greeting/greeting.component.html` avec la syntaxe `@if` pour les trois états : chargement (spinner/texte "Chargement..."), succès (affichage de `data.message`), erreur (message convivial sans code HTTP)
- [x] T011 [US1] Ajouter les styles minimal dans `src/app/components/greeting/greeting.component.css` (zone délimitée, typographie message)
- [x] T012 [US1] Intégrer `<app-greeting>` dans `src/app/app.component.html` et déclarer l'import du composant dans `src/app/app.component.ts`

**Checkpoint US1** : La salutation générique s'affiche à l'ouverture de l'application ; couper l'API et recharger → message d'erreur convivial visible.

---

## Phase 4 : User Story 2 — Salutation personnalisée (Priority: P2)

**Objectif**: Formulaire de saisie de prénom avec validation côté client (à la soumission), appel `GET /api/v1/hello/{name}`, affichage de la réponse ou de l'erreur API.

**Test indépendant**: Saisir "Philippe" → soumettre → "Hello Philippe" s'affiche ; saisir "1" → soumettre → message d'erreur de validation visible.

- [x] T013 [P] [US2] Ajouter l'import de `FormsModule` dans `src/app/app.component.ts` (ou dans le composant racine) pour activer les template-driven forms
- [x] T014 [US2] Ajouter dans `src/app/app.component.html` un formulaire template-driven avec un `<input>` lié via `ngModel` au prénom, les attributs de validation HTML (`required`, `minlength="2"`, `maxlength="25"`, `pattern="^[a-zA-Z ,.'-]+$"`), et un bouton de soumission désactivé (`[disabled]`) si le champ est vide
- [x] T015 [US2] Ajouter dans `src/app/app.component.ts` la méthode `onSubmit(name: string)` qui appelle `helloService.getPersonalizedGreeting(name)` et met à jour le signal d'état de la zone de salutation
- [x] T016 [US2] Mettre à jour `src/app/components/greeting/greeting.component.ts` pour accepter un `@Input() state: LoadingState<HelloDto>` passé depuis le composant parent, afin de réutiliser le composant greeting pour les deux cas (générique et personnalisé)
- [x] T017 [US2] Gérer l'affichage de l'erreur HTTP 400 dans `src/app/components/greeting/greeting.component.html` : afficher `ApiErrorResponse.message` en état d'erreur de validation (distinct du message d'erreur générique)
- [x] T018 [US2] Ajouter les styles du formulaire dans `src/app/app.component.css` : champ de saisie, bouton, message d'erreur inline

**Checkpoint US2** : Prénom valide → salutation personnalisée affichée ; prénom invalide → message d'erreur API visible ; champ vide → bouton désactivé.

---

## Phase 5 : User Story 3 — Indicateur d'état de santé (Priority: P3)

**Objectif**: Badge coloré visible en permanence reflétant la réponse de `GET /health`, sans interaction.

**Test indépendant**: Ouvrir l'application → badge vert "healthy" visible ; arrêter l'API → badge gris "indisponible".

- [x] T019 [US3] Générer le composant avec `ng generate component components/health-status` dans `src/app/`
- [x] T020 [US3] Implémenter `src/app/components/health-status/health-status.component.ts` : injecter `HelloService`, utiliser `toSignal()` sur `getHealth()`, calculer la couleur du badge via un `computed()` (`healthy` → green, `degraded` → orange, `unhealthy` → red, erreur/indisponible → grey)
- [x] T021 [US3] Rédiger `src/app/components/health-status/health-status.component.html` : badge `<span>` avec classe CSS dynamique (`[class]`) selon la couleur calculée, texte du statut, uptime en secondes si disponible, texte "Indisponible" en cas d'erreur
- [x] T022 [US3] Ajouter les styles dans `src/app/components/health-status/health-status.component.css` : classes `.badge-green`, `.badge-orange`, `.badge-red`, `.badge-grey` avec couleurs CSS distinctes
- [x] T023 [US3] Intégrer `<app-health-status>` dans `src/app/app.component.html` et déclarer l'import dans `src/app/app.component.ts`

**Checkpoint US3** : Le badge santé est visible dès le chargement ; sa couleur reflète fidèlement l'état retourné par `/health`.

---

## Phase Finale : Finitions & transversaux

**Objectif**: Layout global, titre de l'application, styles généraux, vérification conformité constitution.

- [x] T024 [P] Rédiger le layout global dans `src/app/app.component.html` : titre de l'application en `<h1>`, disposition des trois zones (greeting générique, formulaire + greeting personnalisé, badge health) avec structure HTML sémantique (`<section>`, `<header>`)
- [x] T025 [P] Définir les styles globaux minimalistes dans `src/styles.css` : reset minimal, police, couleurs de base, responsive simple (centrage sur desktop)
- [x] T026 Vérifier la conformité constitution : (I) versions dans `package.json`, (II) aucun composant `NgModule`, (III) complexité justifiée, (IV) aucun appel `HttpClient` dans les composants — corriger si nécessaire
- [x] T027 Exécuter `ng build` et corriger toute erreur TypeScript ou de compilation avant livraison du POC

---

## Dépendances entre User Stories

```
Phase 1 (Setup)
  └── Phase 2 (Fondations)
        ├── Phase 3 (US1) — MVP démontrables indépendamment ✅
        ├── Phase 4 (US2) — dépend de US1 (réutilise greeting component)
        └── Phase 5 (US3) — indépendante de US1 et US2 ✅
```

**US3 peut démarrer en parallèle de US1 une fois les fondations terminées.**

---

## Exemples d'exécution parallèle

**Après T007 (fondations complètes)** :

```
Développeur A : T008 → T009 → T010 → T011 → T012  (US1 — greeting générique)
Développeur B : T019 → T020 → T021 → T022 → T023  (US3 — health status)
```

**Dans la Phase 4 (US2)** :

```
En parallèle : T013 (FormsModule import) et T018 (styles formulaire CSS)
```

---

## Stratégie d'implémentation

**MVP suggéré** : Phases 1 + 2 + 3 (T001–T012) — application fonctionnelle avec salutation générique en ~1h.

**Incréments** :
1. Phases 1–3 → POC minimum démontratable (US1)
2. + Phase 4 → interaction utilisateur (US2)
3. + Phase 5 → couverture complète OpenAPI (US3)
4. + Phase Finale → finitions visuelles

---

## Résumé

| Indicateur | Valeur |
|-----------|--------|
| Total tâches | 27 |
| Phase 1 — Setup | 4 tâches |
| Phase 2 — Fondations | 3 tâches |
| Phase 3 — US1 (P1) | 5 tâches |
| Phase 4 — US2 (P2) | 6 tâches |
| Phase 5 — US3 (P3) | 5 tâches |
| Phase Finale | 4 tâches |
| Tâches parallélisables [P] | 7 |
| Critères de test indépendants | 3 (un par US) |
| MVP scope | Phases 1–3 (T001–T012) |
