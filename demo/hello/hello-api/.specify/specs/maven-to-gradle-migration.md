# Feature Specification: Migration Maven → Gradle (double build)

**Feature Branch**: `[###-maven-to-gradle]`  
**Created**: 23 janvier 2026  
**Status**: Draft  
**Input**: Migration technique pour supporter Gradle en plus de Maven (POC HelloAPI)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Construire l'appli avec Gradle (Priority: P1)

En tant que développeur, je peux cloner le repo et produire le même JAR exécutable via `./gradlew build` sans dépendre de Maven.

**Why this priority**: Cœur de la migration; prouve la parité fonctionnelle du build.

**Independent Test**: Lancer `./gradlew clean build` sur une machine neuve → obtient un JAR identique fonctionnel dans `build/libs/`.

**Acceptance Scenarios**:
1. **Given** un poste sans Maven installé, **When** j'exécute `./gradlew clean build`, **Then** le build réussit et produit un JAR exécutable.
2. **Given** le JAR Gradle, **When** je lance `java -jar build/libs/hello-api-*.jar`, **Then** l'appli démarre et répond 200 sur `/api/v1/hello`.

---

### User Story 2 - Tests via Gradle (Priority: P1)

En tant que développeur/CI, je peux exécuter la même suite de tests via Gradle (`./gradlew test`) avec des résultats équivalents à Maven.

**Why this priority**: Garantit la qualité et la non-régression pendant la migration.

**Independent Test**: `./gradlew test` passe avec le même périmètre de tests que `mvn test`.

**Acceptance Scenarios**:
1. **Given** la suite de tests existante, **When** j'exécute `./gradlew test`, **Then** tous les tests passent avec un rapport JUnit XML généré.
2. **Given** un échec induit, **When** j'exécute `./gradlew test`, **Then** le job échoue avec un rapport exploitable (exit code ≠ 0).

---

### User Story 3 - Génération OpenAPI via Gradle (Priority: P2)

En tant que développeur, je peux régénérer les artefacts OpenAPI via une tâche Gradle dédiée (ex: `./gradlew openapiGenerate`).

**Why this priority**: Assure la continuité du flux contract-first sans dépendance à Maven uniquement.

**Independent Test**: Exécuter la tâche Gradle supprime/regénère les sources dans `build/generated/` et le build reste réussi.

**Acceptance Scenarios**:
1. **Given** le contrat OpenAPI existant, **When** j'exécute `./gradlew openapiGenerate`, **Then** les classes générées sont mises à jour et le build suivant réussit.

---

### User Story 4 - CI Gradle optionnelle (Priority: P2)

En tant que mainteneur CI, je peux ajouter un job Gradle parallèle pour comparer avec Maven sans casser le pipeline existant.

**Why this priority**: Permet l'expérimentation Gradle sans risquer la chaîne Maven.

**Independent Test**: Un job CI (manuel ou optionnel) exécute `./gradlew clean build` et publie les rapports; le pipeline principal Maven reste inchangé.

**Acceptance Scenarios**:
1. **Given** la pipeline existante, **When** le job Gradle est déclenché, **Then** il s'exécute en parallèle et n'empêche pas le job Maven de passer.

---

### Edge Cases

- Que faire si la version Java configurée par Gradle diffère de celle de Maven (Java 25) ?
- Comment gérer les paths générés (Maven `target/` vs Gradle `build/`) pour éviter la confusion dans les IDE/CI ?
- Que faire si les plugins Maven (ex: openapi-generator) n'ont pas d'équivalent direct ou nécessitent une configuration différente ?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le projet DOIT fournir un build Gradle reproductible (`./gradlew clean build`) produisant un JAR exécutable équivalent au build Maven.
- **FR-002**: Le build Gradle DOIT utiliser la même version de Java cible (Java 25) que Maven.
- **FR-003**: Les dépendances DOIVENT être alignées entre Maven (pom.xml) et Gradle (build.gradle[.kts]) pour éviter les divergences de versions.
- **FR-004**: Les tâches Gradle standard DOIVENT fonctionner: `clean`, `build`, `test`, `bootJar` (ou équivalent), `openapiGenerate` (ou tâche équivalente).
- **FR-005**: Les tests DOIVENT s'exécuter sous Gradle avec la même couverture et les mêmes rapports JUnit XML exploitables en CI.
- **FR-006**: Les sources générées OpenAPI DOIVENT être produites dans un répertoire dédié (ex: `build/generated/`) et intégrées au classpath Gradle.
- **FR-007**: Le README/guide développeur DOIT documenter les commandes Gradle (build, test, génération OpenAPI) et l'équivalence avec Maven.
- **FR-008**: La configuration CI DOIT permettre d'exécuter un job Gradle optionnel sans remplacer le job Maven existant.
- **FR-009**: Les artefacts de sortie Gradle (JAR, rapports) DOIVENT être ignorés proprement par VCS (mise à jour `.gitignore` si nécessaire).
- **FR-010**: Aucun changement fonctionnel applicatif ne DOIT être introduit par la migration (parité de comportement).
- **FR-011**: Les scripts existants (entrypoint, Dockerfile) DOIVENT continuer de fonctionner avec l'artefact Maven; l'artefact Gradle est fourni à des fins d'étude.
- **FR-012**: [NEEDS CLARIFICATION: Choix DSL Gradle — Kotlin DSL (build.gradle.kts) ou Groovy (build.gradle) ?]
- **FR-013**: [NEEDS CLARIFICATION: Gestion des verrous de dépendances — utiliser Gradle version catalog / lockfiles ?]

### Key Entities *(include if feature involves data/build artifacts)*

- **Build artifacts**: JAR exécutable produit par Gradle (équivalent Maven), rapports de tests JUnit XML, répertoire `build/`.
- **Dependency descriptors**: `build.gradle[.kts]`, `settings.gradle[.kts]`, éventuel `gradle/libs.versions.toml` si catalogues utilisés.
- **Generated sources**: Code OpenAPI généré dans `build/generated/` (ou chemin équivalent) pour compilation et IDE.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `./gradlew clean build` réussit sur une machine sans Maven, en < 5 minutes en cold cache.
- **SC-002**: Le JAR produit par Gradle démarre et répond 200 sur `/api/v1/hello` en < 5 secondes.
- **SC-003**: `./gradlew test` exécute 100% des tests existants et génère des rapports JUnit consommables par CI.
- **SC-004**: Les versions de dépendances Maven vs Gradle sont identiques (pas d'écart détecté via comparaison automatisée ou revue).
- **SC-005**: La pipeline CI peut exécuter un job Gradle optionnel sans impacter le job Maven (0 régressions CI).
- **SC-006**: La documentation développeur contient les commandes Gradle principales (build, test, openapi) et la parité Maven/Gradle.
- **SC-007**: Pas de régressions fonctionnelles observées dans les tests d'intégration HTTP après build Gradle.
