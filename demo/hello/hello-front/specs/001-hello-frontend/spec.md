# Feature Specification: Application Frontend Hello

**Feature Branch**: `002-hello-frontend`
**Created**: 2026-04-29
**Status**: Draft
**Input**: Application frontend Angular accédant à tous les endpoints de la Hello API (contrat OpenAPI `openapi.yaml`)

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Affichage de la salutation générique (Priority: P1)

En arrivant sur l'application, l'utilisateur voit immédiatement un message de salutation générique
("Hello World") récupéré en temps réel depuis l'API backend, sans aucune interaction requise.

**Why this priority**: C'est le point d'entrée de l'application et la démonstration la plus
immédiate de la connexion au backend. Une seule histoire suffit à prouver que l'intégration
frontend ↔ API fonctionne.

**Independent Test**: Ouvrir l'application dans un navigateur ; le message de salutation générique
apparaît sans interaction de l'utilisateur — l'application est immédiatement fonctionnelle.

**Acceptance Scenarios**:

1. **Given** l'API backend est disponible et l'application est ouverte,
   **When** la page se charge,
   **Then** le message retourné par `GET /api/v1/hello` est affiché dans la zone de salutation.

2. **Given** l'API backend est indisponible au chargement de la page,
   **When** la page se charge,
   **Then** un message d'erreur convivial (sans jargon technique) est affiché à la place de la salutation.

---

### User Story 2 — Salutation personnalisée par saisie d'un prénom (Priority: P2)

L'utilisateur saisit son prénom dans un champ de saisie, soumet le formulaire et voit apparaître
un message de salutation personnalisé ("Hello Philippe") retourné par l'API.

**Why this priority**: Démontre l'interaction utilisateur et la validation des entrées, ce qui
enrichit le POC et couvre l'endpoint le plus riche fonctionnellement.

**Independent Test**: Remplir le champ prénom avec une valeur valide (ex. "Philippe"), soumettre ;
le message personnalisé s'affiche — l'histoire est testable et démontre de la valeur de manière autonome.

**Acceptance Scenarios**:

1. **Given** l'API est disponible et l'utilisateur a saisi un prénom valide (2–25 caractères,
   lettres, espaces et ponctuation simple),
   **When** l'utilisateur soumet le formulaire,
   **Then** le message retourné par `GET /api/v1/hello/{name}` est affiché dans la zone de salutation.

2. **Given** l'utilisateur a saisi un prénom invalide (ex. contenant des chiffres ou moins de 2
   caractères),
   **When** l'utilisateur soumet le formulaire,
   **Then** un message d'erreur de validation clair est affiché (issu de la réponse HTTP 400 de l'API),
   sans quitter la page.

3. **Given** l'utilisateur efface le champ de saisie après avoir obtenu une salutation personnalisée,
   **When** la saisie est vide,
   **Then** le bouton de soumission est désactivé.

---

### User Story 3 — Consultation de l'état de santé de l'API (Priority: P3)

L'utilisateur peut voir en permanence si l'API backend est opérationnelle (healthy, degraded ou
unhealthy) ainsi que son temps de disponibilité, sans action supplémentaire.

**Why this priority**: Complète la couverture de tous les endpoints du contrat OpenAPI. Utile dans
un contexte POC pour vérifier l'état du backend en un coup d'œil.

**Independent Test**: Ouvrir l'application ; un indicateur d'état de santé (ex. badge coloré)
est visible sur la page et reflète la réponse de `GET /health`.

**Acceptance Scenarios**:

1. **Given** l'API retourne `{ "status": "healthy" }`,
   **When** la page est affichée,
   **Then** un indicateur visuel "healthy" (vert) est visible avec le temps de disponibilité si fourni.

2. **Given** l'API retourne `{ "status": "degraded" }` ou `{ "status": "unhealthy" }`,
   **When** la page est affichée,
   **Then** l'indicateur affiche l'état correspondant avec une couleur distincte (ex. orange/rouge).

3. **Given** l'endpoint `/health` est inaccessible (erreur réseau ou HTTP 503),
   **When** la page est affichée,
   **Then** l'indicateur affiche un état "indisponible" sans bloquer le reste de l'interface.

---

### Edge Cases

- Que se passe-t-il si le prénom contient uniquement des espaces ? → Traité comme invalide (2 caractères alphanumériques minimum requis par l'API).
- Que se passe-t-il si l'utilisateur soumet plusieurs requêtes rapidement en succession ? → Chaque soumission déclenche un nouvel appel API ; l'affichage reflète la dernière réponse reçue.
- Que se passe-t-il si l'API retourne une erreur HTTP 500 lors de la salutation personnalisée ? → Le message d'erreur retourné par l'API est affiché de façon conviviale.
- Que se passe-t-il si `uptime` est absent de la réponse `/health` ? → L'indicateur affiche uniquement le statut, sans temps de disponibilité.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: L'application DOIT afficher le message retourné par `GET /api/v1/hello` au chargement de la page, sans interaction de l'utilisateur.
- **FR-002**: L'application DOIT proposer un champ de saisie permettant d'entrer un prénom (2–25 caractères, lettres latines, espaces et ponctuation simple : `. , ' -`).
- **FR-003**: L'application DOIT envoyer une requête à `GET /api/v1/hello/{name}` et afficher le message retourné lorsque l'utilisateur soumet un prénom valide.
- **FR-004**: L'application DOIT afficher le message d'erreur de l'API (champ `message` de `ApiErrorResponse`) si la requête retourne HTTP 400.
- **FR-005**: L'application DOIT désactiver le bouton de soumission lorsque le champ de saisie est vide.
- **FR-006**: L'application DOIT afficher un indicateur visuel de l'état de santé du backend en appelant `GET /health` au chargement de la page.
- **FR-007**: L'application DOIT afficher un message d'erreur convivial si l'API est inaccessible (HTTP 500, HTTP 503 ou erreur réseau), pour toute fonctionnalité concernée.
- **FR-008**: L'application DOIT couvrir les trois endpoints du contrat OpenAPI : `GET /api/v1/hello`, `GET /api/v1/hello/{name}` et `GET /health`.
- **FR-009**: L'application DOIT afficher un indicateur de chargement minimal (spinner ou texte "Chargement...") pendant tout appel API en cours (chargement initial et soumission du formulaire).

### Key Entities

- **Greeting** : Message de salutation retourné par l'API. Attribut : `message` (texte libre).
- **HealthStatus** : État de santé du service backend. Attributs : `status` (healthy | degraded | unhealthy), `uptime` (secondes, optionnel).
- **ApiError** : Erreur retournée par l'API. Attributs : `timestamp` (date-heure), `status` (code HTTP entier), `error` (type d'erreur), `message` (description lisible), `path` (chemin de la requête).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Le message de salutation générique est visible dans les 2 secondes suivant le chargement de la page, sur connexion locale.
- **SC-002**: Le message de salutation personnalisé est affiché dans les 2 secondes suivant la soumission d'un prénom valide.
- **SC-003**: 100 % des endpoints définis dans le contrat OpenAPI (`/api/v1/hello`, `/api/v1/hello/{name}`, `/health`) sont appelés et leurs réponses sont exploitées par l'interface.
- **SC-004**: Tout message d'erreur affiché (validation ou indisponibilité) est compréhensible par un utilisateur non technique, sans code HTTP ni stack trace visible.
- **SC-005**: L'indicateur d'état de santé est visible sans action de l'utilisateur, dès le chargement de la page.

---

## Assumptions

- L'API backend Hello est disponible localement à `http://localhost:3000` pendant le développement.
- L'application cible les navigateurs desktop modernes (Chrome, Firefox, Edge — versions récentes).
- Aucune donnée utilisateur n'est persistée entre les sessions (pas de localStorage ni de cookie).
- La validation côté client du prénom (format et longueur) reflète exactement les règles du contrat OpenAPI : 2–25 caractères, expression régulière `^[a-zA-Z ,.'-]+$`.
- L'interface est rédigée en français.
- L'authentification et la gestion des droits sont hors périmètre (POC).
- L'application est une **page unique** (SPA sans routeur Angular) : les trois zones (salutation générique, formulaire de prénom, indicateur de santé) sont toutes visibles simultanément sans navigation inter-pages.

## Clarifications

### Session 2026-04-29

- Q: Structure de la page (routage ou page unique ?) → A: Page unique — toutes les sections visibles simultanément, pas de routage Angular.
- Q: État de chargement lors des appels API → A: Indicateur minimal — spinner ou texte "Chargement..." affiché pendant les appels.
