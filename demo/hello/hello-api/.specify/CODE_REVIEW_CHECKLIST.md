# HelloAPI – Code Review Checklist

Utiliser cette checklist lors de toute revue de PR pour vérifier conformité à la **Constitution v1.0.0**.

---

## ✅ Architecture & Couches (Principle III)

- [ ] **Séparation des couches respectée**
  - [ ] Code métier = `hello/domain/` (implémentations @Service)
  - [ ] Contrats métier = `hello/api/` (interfaces uniquement)
  - [ ] Orchestration API = `api/impl/` (Delegates @Component)
  - [ ] Configuration Spring = `config/` seulement
  - [ ] Aucune logique métier en `config/` ou contrôleurs générés

- [ ] **Injection de dépendances par constructeur**
  - [ ] Zéro `@Autowired` sur champs
  - [ ] Constructeurs explicites ou Lombok `@RequiredArgsConstructor`
  - [ ] Dépendances finals

- [ ] **Code généré (OpenAPI) jamais modifié**
  - [ ] Fichiers en `generated/api/` ne sont pas modifiés
  - [ ] Délégations (@Component) implémentent `HelloApiDelegate` en `api/impl/`
  - [ ] Aucun import de code généré sauf dans Delegates

---

## 🎯 OpenAPI Contract-First (Principle II)

- [ ] **Contrat API mis à jour**
  - [ ] Fichier YAML (`../hello.yaml`) modifié si changement API
  - [ ] Description OpenAPI complète (operationId, parameters, responses)
  - [ ] Schémas (models) versionnés si breaking change

- [ ] **Code généré à jour**
  - [ ] `mvn clean openapi-generator:generate` exécuté localement
  - [ ] Nouveaux Delegates implémentés en `api/impl/`
  - [ ] Pas de conflit merge (fichiers générés)

- [ ] **DTOs générés utilisés**
  - [ ] Requêtes/réponses utilisent DTOs générés (HelloDto, etc.)
  - [ ] Validations `@Valid` en Delegate
  - [ ] Conversions DTO ↔ objets domaine explicites

---

## 🧪 Test Coverage (Principle IV – NON-NÉGOCIABLE)

- [ ] **Tests unitaires présents**
  - [ ] Fichier `*ImplTest.java` pour chaque implémentation `@Service`
  - [ ] Tests indépendants (pas de `@SpringBootTest`, pas de contexte Spring)
  - [ ] Mocks des dépendances (Mockito)
  - [ ] Cas nominal + edge cases couverts
  - [ ] `@DisplayName` décrivant le scénario testé

- [ ] **Tests d'intégration présents**
  - [ ] Fichier `*IntegrationTest.java` pour Delegates REST
  - [ ] `@SpringBootTest(classes = HelloApiApplication.class)` + `@AutoConfigureMockMvc`
  - [ ] Requêtes HTTP complètes testées (MockMvc)
  - [ ] Status codes, content-type, payloads vérifiés
  - [ ] Assertions Hamcrest (e.g., `is()`, `containsString()`)

- [ ] **Couverture minimale respectée**
  - [ ] Coverage ≥ 80% (idéal: ≥ 90% pour services critiques)
  - [ ] Tous les chemins heureux testés
  - [ ] Erreurs/exceptions testées
  - [ ] Validations d'inputs testées

- [ ] **Tests nommés explicitement**
  - [ ] Format: `{method}_{scenario}_{expected}` (e.g., `helloWorld_should_return_hello_world`)
  - [ ] `@DisplayName` lisible en IDE/rapports

---

## ☕ Java 25 & Modern Practices (Principle V)

- [ ] **Version Java correcte**
  - [ ] Compilation cible: Java 25 (no issues avec features)
  - [ ] Pas de dépendances non-compatibles

- [ ] **Lombok utilisé efficacement**
  - [ ] `@Getter`, `@Setter` sur POJOs/DTOs
  - [ ] `@Service`, `@Component` pour clarté
  - [ ] `@RequiredArgsConstructor` pour injectés finaux
  - [ ] Pas d'accesseurs super complexes (sinon décomposer)

- [ ] **Gestion exceptions & validation**
  - [ ] Inputs validés via `@Valid` + Hibernate Validator
  - [ ] Exceptions métier propres (`*Exception extends Exception`)
  - [ ] Logs non verbeux (pas de stacktraces en prod response)
  - [ ] `CustomErrorHandler` capture exceptions globales

- [ ] **Sécurité baseline**
  - [ ] Aucun secret en code (env vars ou Vault)
  - [ ] Pas de SQL injection (ORM ou prepared statements si DB)
  - [ ] Validations inputs strictes
  - [ ] Headers de sécurité présents (CSP, CORS scoped)

---

## 🐳 Container & K8s Ready (Principle VI)

- [ ] **Dockerfile existant & minimal**
  - [ ] Image base: `openjdk/openjdk:25-rc` (ou plus léger)
  - [ ] JAR copié en `/app/`
  - [ ] Port 8080 exposé
  - [ ] Pas de secrets en Dockerfile

- [ ] **K8s manifests cohérents**
  - [ ] Deployment: replicas ≥ 2
  - [ ] Labels et selectors alignés
  - [ ] Healthchecks définis (liveness, readiness)
  - [ ] Resources requests/limits fixés
  - [ ] Image registry cohérente

- [ ] **Actuator configuré**
  - [ ] `/actuator/health` disponible (liveness probe)
  - [ ] `/actuator/info` expose version
  - [ ] Pas d'endpoints sensibles exposés
  - [ ] `show-details` approprié (dev vs prod)

---

## 📝 Code Quality & Documentation

- [ ] **Code lisible**
  - [ ] Pas de variables/méthodes mal nommées
  - [ ] Pas de code mort/commenté
  - [ ] Complexité cyclomatique raisonnable (< 10)
  - [ ] Fonctions uniques (single responsibility)

- [ ] **Javadoc & commentaires**
  - [ ] Méthodes publiques documentées (paramètres, retour, exceptions)
  - [ ] Classes métier documentées
  - [ ] Commentaires sur logique non-triviale

- [ ] **Pas de TODOs oubliés**
  - [ ] TODOs temporaires supprimés
  - [ ] Issues GitHub/JIRA référencées si applicable

---

## 🔒 Security Checklist

- [ ] **Inputs**
  - [ ] Tous validés via `@Valid` + constraints
  - [ ] Pas d'évaluation dynamique (eval, SpEL exposé)

- [ ] **Secrets**
  - [ ] Aucun secret hardcodé (password, key, token)
  - [ ] Config externalisée via env vars ou Secret Store

- [ ] **Logs**
  - [ ] Pas de données sensibles loggées (PII, credentials)
  - [ ] Structured logging en JSON (prod-ready)

- [ ] **Dependencies**
  - [ ] Pas d'imports de libraries obsolètes/dangereuses
  - [ ] Versions fixées (pas de LATEST ou ranges vagues)

---

## 📋 Performance & Optimization

- [ ] **Resources raisonnables**
  - [ ] Requêtes N+1 évitées
  - [ ] Pas de boucles infinies
  - [ ] Timeouts configurés (API calls externes)

- [ ] **Memory usage**
  - [ ] Pas de fuites (streams fermés, collections à taille fixe)
  - [ ] JVM flags appropriés (GC, Xmx, etc.)

- [ ] **Build reproducible**
  - [ ] `mvn clean package` passe 100% du temps
  - [ ] Pas de dépendances SNAPSHOT (sauf dev)

---

## ✨ Best Practices Supplémentaires

- [ ] **Version Control**
  - [ ] Commits descriptifs en anglais
  - [ ] Pas de fichiers temporaires (target/, .idea/)
  - [ ] `.gitignore` complet

- [ ] **Configuration**
  - [ ] `application.yaml` externalise configs sensibles
  - [ ] Profils Spring utilisés (`application-dev.yaml`, etc.)

- [ ] **Breaking Changes**
  - [ ] API contract versionnée si breaking (v2/)
  - [ ] Migration guide fourni si applicable

---

## 🎯 Checklist Condensée (Quick Review)

Utiliser pour reviews rapides:

```markdown
### Architecture
- [ ] Couches séparées (API/Domain/Config)
- [ ] Injection par constructeur
- [ ] Code généré non modifié

### Tests
- [ ] Unit tests présents
- [ ] Integration tests présents
- [ ] Coverage ≥ 80%

### OpenAPI
- [ ] Contrat YAML à jour
- [ ] Délégations implémentées
- [ ] DTOs générés utilisés

### Code Quality
- [ ] Lisible & documenté
- [ ] Pas de secrets/hardcoding
- [ ] Build `mvn clean package` OK

### Kubernetes
- [ ] Dockerfile OK
- [ ] Healthchecks configurés
- [ ] Resources définis
```

---

## 🚨 Red Flags (À Rejeter)

⛔ **Aucune excuse valide pour:**

1. Code métier en `config/`
2. Modifications fichiers générés (`generated/api/`)
3. Tests absents (unit ou integration)
4. Secrets hardcodés
5. Injection `@Autowired` sur champs
6. Pas de validation inputs
7. Build failing (`mvn clean package` échoue)
8. Délégations manquantes pour nouvelles endpoints

**Action:** Demander corrections avant merge.

---

## 📞 Questions?

Consulter:
- **Constitution:** `.specify/memory/constitution.md`
- **Architecture détaillée:** `.specify/ARCHITECTURE_ANALYSIS.md`
- **Gouvernance:** `.specify/GOVERNANCE_SUMMARY.md`

---

**LastUpdated:** 2026-01-23 | **Version:** 1.0.0
