<!--
  SYNC IMPACT REPORT
  ==================
  Version change  : (none) → 1.0.0 (initial ratification)
  Added sections  : Core Principles (I–IV), Stack Technique, Périmètre du POC, Governance
  Removed sections: n/a
  Templates updated:
    - .specify/templates/plan-template.md  ✅ aligned (no Angular-specific gates required at this stage)
    - .specify/templates/spec-template.md  ✅ aligned
    - .specify/templates/tasks-template.md ✅ aligned (Angular CLI task conventions apply)
  Deferred TODOs  : none
-->

# Hello Front Constitution

## Principes Fondamentaux

### I. Versions récentes — Angular & TypeScript

Les versions stables les plus récentes d'Angular et de TypeScript DOIVENT être utilisées tout au
long du projet. Toute mise à jour DOIT être appliquée via `npm update` ou `ng update` ; aucune
rétrogradation vers une version antérieure n'est autorisée sans justification documentée.

**Rationale** : Bénéficier des dernières fonctionnalités du framework (Signals, standalone
components, control flow syntax) et des optimisations du compilateur TypeScript dès le départ
évite la dette technique dans le contexte d'un POC démonstratif.

### II. CLI en priorité — ng & npm

Angular CLI (`ng`) et npm DOIVENT être les outils de référence pour toute opération sur le
projet : initialisation (`ng new`), génération de composants, services et pipes (`ng generate`),
build (`ng build`), tests (`ng test`), linting (`ng lint`) et mise à jour (`ng update`).
La manipulation manuelle de fichiers de configuration générés par la CLI DOIT rester
exceptionnelle et explicitement justifiée.

**Rationale** : La CLI garantit la cohérence des configurations, respecte les conventions
officielles Angular et évite les erreurs humaines sur les fichiers de scaffolding.

### III. KISS — Simplicité avant tout

Le code DOIT privilégier la solution la plus simple qui répond au besoin. Les abstractions
supplémentaires, les patterns avancés et les optimisations prématurées sont interdits sauf
nécessité démontrée. Le principe YAGNI (You Aren't Gonna Need It) s'applique systématiquement.
Chaque complexité introduite DOIT être justifiée par un besoin fonctionnel réel et immédiat.

**Rationale** : Dans le contexte d'un POC, la lisibilité et la rapidité d'itération priment sur
l'exhaustivité architecturale. Un code simple est plus facile à modifier, présenter et comprendre.

### IV. Séparation UI / Traitement

Les composants Angular (`.component.ts`) DOIVENT être des composants de présentation purs : ils
reçoivent des données via `@Input()` ou s'abonnent à des observables/signals exposés par les
services, et délèguent toute logique métier, appel HTTP et transformation de données à des
services dédiés (`.service.ts`). Un composant NE DOIT PAS contenir de logique de traitement,
de manipulation de données brutes ou d'appels directs à `HttpClient`.

**Rationale** : Cette séparation rend chaque couche indépendamment testable, facilite la
réutilisation des services et clarifie les responsabilités au sein d'une équipe.

## Stack Technique

**Framework** : Angular (dernière version stable LTS)
**Langage** : TypeScript (dernière version compatible avec Angular)
**Gestionnaire de paquets** : npm (pas de yarn ni de pnpm pour ce POC)
**Style** : CSS natif ou Angular Material selon besoin fonctionnel minimal
**Communication HTTP** : `HttpClient` d'Angular (`@angular/common/http`) via un service dédié
**Architecture** : Standalone components (sans NgModules) conformément aux recommandations Angular actuelles
**Tests unitaires** : Jasmine + Karma (configuration par défaut `ng test`)

**API cible** : Hello API — `http://localhost:3000`

- `GET /api/v1/hello` → message de salutation générique
- `GET /api/v1/hello/{name}` → message de salutation personnalisé
- `GET /api/v1/health` → contrôle de santé de l'API

## Périmètre du POC

### Dans le périmètre

- Affichage d'un message de salutation (générique et personnalisé) depuis l'API
- Interaction utilisateur minimale (formulaire de saisie du prénom)
- Gestion basique des erreurs HTTP (affichage du message d'erreur)
- Tests unitaires des services et composants principaux

### Hors périmètre (explicitement exclus)

- **Authentification & Sécurité** : pas de gestion de session, tokens, guards ni HTTPS obligatoire
- **Pipelines CI/CD** : pas de workflows GitHub Actions, GitLab CI ni scripts de déploiement
- **Internationalisation (i18n)**
- **Accessibilité avancée (a11y)**
- **Performance et optimisation bundle**
- **Progressive Web App (PWA)**

## Gouvernance

Cette constitution DOIT être consultée avant toute décision architecturale ou technique sur le
projet. Tout écart par rapport aux principes ci-dessus DOIT être documenté et approuvé
explicitement.

Les amendements sont versionnés selon la politique sémantique suivante :

- **MAJOR** : suppression ou redéfinition incompatible d'un principe existant
- **MINOR** : ajout d'un nouveau principe ou extension significative d'une section
- **PATCH** : clarifications, corrections de formulation, ajustements non-sémantiques

Toute modification DOIT mettre à jour `Last Amended` et incrémenter la version en conséquence.

**Version**: 1.0.0 | **Ratified**: 2026-04-29 | **Last Amended**: 2026-04-29
