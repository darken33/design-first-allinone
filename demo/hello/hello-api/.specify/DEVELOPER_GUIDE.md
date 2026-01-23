# HelloAPI – Developer Guide (Patterns & Pratiques)

Guide pratique pour développeurs : comment respecter la constitution HelloAPI au quotidien.

---

## 🚀 Quick Start pour Contributeurs

### 1. Cloner & Préparer

```bash
git clone <repo>
cd hello-api
mvn clean install

# Vérifier que ça build
mvn clean package

# Option Gradle (étude) – nécessite Gradle Wrapper
# Une fois le wrapper ajouté, utiliser:
# ./gradlew clean build
# ./gradlew test
```

### 2. Créer une Feature Branch

```bash
git checkout -b feature/add-goodbye-endpoint
```

### 3. Respecter les Patterns

Voir sections "Patterns" ci-dessous.

### 4. Committer & Pusher

```bash
git add .
git commit -m "feat(api): add goodbye endpoint"
git push origin feature/add-goodbye-endpoint
```

### 5. Créer PR

Titre: `[FEATURE] Add goodbye endpoint`  
Description: Respecter template PR (constitution compliance checklist)

---

## 🏗️ Pattern: Ajouter une Nouvelle Endpoint API

### Étape 1: Définir le Contrat OpenAPI (YAML)

**Fichier:** `../hello.yaml`

```yaml
paths:
  /api/v1/goodbye:
    get:
      operationId: goodbye
      summary: Say goodbye
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GoodbyeDto'

components:
  schemas:
    GoodbyeDto:
      type: object
      properties:
        message:
          type: string
      required:
        - message
```

### Étape 2: Générer Code

```bash
mvn clean openapi-generator:generate
```

**Résultat:** Fichiers auto-générés en `target/generated-sources/`:
- `GoodbyeApi.java` (interface @RequestMapping)
- `GoodbyeApiDelegate.java` (interface à implémenter)
- `GoodbyeDto.java` (DTO)

### Étape 3: Implémenter le Délégué

**Fichier:** `src/main/java/.../api/impl/GoodbyeApiDelegateImpl.java`

```java
package com.sqli.pbousquet.helloapi.api.impl;

import com.sqli.pbousquet.helloapi.generated.api.model.GoodbyeDto;
import com.sqli.pbousquet.helloapi.generated.api.server.GoodbyeApiDelegate;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import com.sqli.pbousquet.helloapi.hello.api.GoodbyeService;

@Component
public class GoodbyeApiDelegateImpl implements GoodbyeApiDelegate {

    private final GoodbyeService service;

    // Constructor injection obligatoire
    GoodbyeApiDelegateImpl(GoodbyeService service) {
        this.service = service;
    }

    @Override
    public ResponseEntity<GoodbyeDto> goodbye() {
        GoodbyeDto result = new GoodbyeDto();
        result.setMessage(service.sayGoodbye());
        return ResponseEntity.ok(result);
    }
}
```

**Points clés:**
- ✅ `@Component` (Spring discovers & injects)
- ✅ Implémenter interface `GoodbyeApiDelegate` (généré)
- ✅ Injection par **constructeur** (pas `@Autowired`)
- ✅ Aucune logique métier ici (déléguer au service)
- ✅ DTOs générés pour request/response

### Étape 4: Créer Interface Métier

**Fichier:** `src/main/java/.../hello/api/GoodbyeService.java`

```java
package com.sqli.pbousquet.helloapi.hello.api;

/**
 * Service métier pour les salutations d'adieu.
 */
public interface GoodbyeService {
    
    /**
     * Génère un message d'adieu.
     * @return message d'adieu
     */
    String sayGoodbye();
}
```

**Points clés:**
- ✅ Interface = contrat métier (mockable)
- ✅ Javadoc complète
- ✅ Zéro implémentation

### Étape 5: Implémenter le Service Métier

**Fichier:** `src/main/java/.../hello/domain/GoodbyeServiceImpl.java`

```java
package com.sqli.pbousquet.helloapi.hello.domain;

import org.springframework.stereotype.Service;
import com.sqli.pbousquet.helloapi.hello.api.GoodbyeService;

/**
 * Implémentation du service d'adieu.
 */
@Service
public class GoodbyeServiceImpl implements GoodbyeService {

    @Override
    public String sayGoodbye() {
        return "Goodbye!";
    }
}
```

**Points clés:**
- ✅ `@Service` (Spring discovers & manages)
- ✅ Implémenter interface métier
- ✅ Logique métier pure (pas de Spring, pas d'HTTP)

### Étape 6: Tests Unitaires

**Fichier:** `src/test/java/.../hello/domain/GoodbyeServiceImplTest.java`

```java
package com.sqli.pbousquet.helloapi.hello.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

import com.sqli.pbousquet.helloapi.hello.api.GoodbyeService;

class GoodbyeServiceImplTest {

    private final GoodbyeService service = new GoodbyeServiceImpl();

    @Test
    @DisplayName("sayGoodbye should return Goodbye!")
    void sayGoodbye_should_return_goodbye() {
        String result = service.sayGoodbye();
        assertEquals("Goodbye!", result);
    }
}
```

**Points clés:**
- ✅ **PAS** de `@SpringBootTest`
- ✅ Instanciation directe
- ✅ Tests rapides (~1ms)
- ✅ `@DisplayName` descriptif

### Étape 7: Tests Délégué

**Fichier:** `src/test/java/.../api/impl/GoodbyeApiDelegateImplTest.java`

```java
package com.sqli.pbousquet.helloapi.api.impl;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import static org.junit.jupiter.api.Assertions.assertEquals;

import com.sqli.pbousquet.helloapi.generated.api.model.GoodbyeDto;
import com.sqli.pbousquet.helloapi.generated.api.server.GoodbyeApiDelegate;
import com.sqli.pbousquet.helloapi.hello.domain.GoodbyeServiceImpl;

class GoodbyeApiDelegateImplTest {

    private final GoodbyeApiDelegate delegate =
        new GoodbyeApiDelegateImpl(new GoodbyeServiceImpl());

    @Test
    @DisplayName("goodbye should return 200 OK with Goodbye! message")
    void goodbye_should_return_200_ok() {
        ResponseEntity<GoodbyeDto> response = delegate.goodbye();
        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Goodbye!", response.getBody().getMessage());
    }
}
```

### Étape 8: Tests d'Intégration

**Fichier:** `src/test/java/.../api/impl/GoodbyeApiIntegrationTest.java`

```java
package com.sqli.pbousquet.helloapi.api.impl;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import com.sqli.pbousquet.helloapi.HelloApiApplication;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = HelloApiApplication.class)
@AutoConfigureMockMvc
class GoodbyeApiIntegrationTest {

    private static final String GOODBYE_ENDPOINT = "/api/v1/goodbye";

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/v1/goodbye should return 200 OK with JSON")
    void getGoodbye_should_return_200_ok() throws Exception {
        mockMvc.perform(get(GOODBYE_ENDPOINT))
            .andExpect(status().isOk())
            .andExpect(content().contentTypeCompatibleWith("application/json"))
            .andExpect(jsonPath("$.message", is("Goodbye!")));
    }
}
```

**Points clés:**
- ✅ `@SpringBootTest` (full context)
- ✅ `MockMvc` pour tester HTTP
- ✅ Hamcrest matchers (`is()`, `jsonPath()`)
- ✅ Tests bout-en-bout

### Étape 9: Build & Vérifier

```bash
# Build complet (compilation + tests)
mvn clean package

# Résultat:
# - Classes compilées en target/classes/
# - Tests exécutés (unit + intégration)
# - Rapports surefire en target/surefire-reports/
# - JAR final: target/hello-api-1.0.1-SNAPSHOT.jar
```

### Étape 10: Committer & PR

```bash
git add .
git commit -m "feat(api): add goodbye endpoint with tests"
git push origin feature/add-goodbye-endpoint

# Créer PR sur GitHub/GitLab
# Checklist items:
# - [ ] Code review checklist (constitution compliance)
# - [ ] Tests passed locally
# - [ ] No breaking changes
```

---

## 🧪 Test Patterns

### Pattern: Test Unitaire Service

```java
class MyServiceImplTest {
    // NO @SpringBootTest
    private final MyService service = new MyServiceImpl();

    @Test
    @DisplayName("specific behavior")
    void specific_behavior_should_return_expected() {
        // Arrange
        String input = "test";
        
        // Act
        String result = service.process(input);
        
        // Assert
        assertEquals("processed test", result);
    }
}
```

### Pattern: Test Intégration API

```java
@SpringBootTest(classes = HelloApiApplication.class)
@AutoConfigureMockMvc
class MyApiIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @Test
    void endpoint_should_return_expected() throws Exception {
        mockMvc.perform(get("/api/v1/endpoint"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.field", is("value")));
    }
}
```

### Pattern: Test avec Mocks Métier

```java
class GoodbyeApiDelegateImplTest {
    private final GoodbyeService mockedService = mock(GoodbyeService.class);
    private final GoodbyeApiDelegate delegate = 
        new GoodbyeApiDelegateImpl(mockedService);

    @Test
    void goodbye_with_custom_message() {
        when(mockedService.sayGoodbye())
            .thenReturn("Custom goodbye");
        
        ResponseEntity<GoodbyeDto> response = delegate.goodbye();
        assertEquals("Custom goodbye", response.getBody().getMessage());
    }
}
```

---

## 🔒 Security Patterns

### Pattern: Valider Inputs

```java
@Component
public class MyApiDelegateImpl implements MyApiDelegate {
    
    @Override
    public ResponseEntity<MyDto> myEndpoint(@Valid @RequestParam String input) {
        // @Valid triggers validation via Hibernate Validator
        // Si validation fails → CustomErrorHandler → 400 Bad Request
        MyDto result = service.process(input);
        return ResponseEntity.ok(result);
    }
}
```

### Pattern: Custom Exception Handling

```java
@ControllerAdvice
public class CustomErrorHandler {
    
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(
        BusinessException e, 
        HttpServletRequest request) {
        return ResponseEntity.badRequest().body(
            new ErrorResponse(e.getMessage(), request.getRequestURI())
        );
    }
}
```

### Pattern: Secrets (Externalisés)

```yaml
# application.yaml (public)
app:
  api-key: ${API_KEY}  # Référence env var

# En runtime:
# $ export API_KEY=secret123
# $ java -jar hello-api.jar
```

---

## 📐 Architecture Patterns

### Pattern: Service Dépendance Externe

Si service a besoin d'une dépendance externe (DB, API, cache):

```java
// 1. Créer interface SPI (Service Provider Interface)
public interface UserRepository {
    User findById(String id);
}

// 2. Service l'injecte
@Service
public class MyServiceImpl implements MyService {
    private final UserRepository repo;
    
    MyServiceImpl(UserRepository repo) {
        this.repo = repo;
    }
    
    public String processUser(String userId) {
        User user = repo.findById(userId);
        return "Hello " + user.getName();
    }
}

// 3. Test unitaire: mock repo
class MyServiceImplTest {
    private final UserRepository mockedRepo = mock(UserRepository.class);
    private final MyService service = new MyServiceImpl(mockedRepo);
    
    @Test
    void processUser_with_mock() {
        when(mockedRepo.findById("123"))
            .thenReturn(new User("123", "Alice"));
        
        String result = service.processUser("123");
        assertEquals("Hello Alice", result);
    }
}

// 4. Test intégration: injecter vraie implémentation
@SpringBootTest
class MyServiceIntegrationTest {
    @Autowired private MyService service;
    @Autowired private UserRepository repo; // Vraie impl
    
    @Test
    void processUser_end_to_end() {
        // Repo initialisé par Spring (e.g., DB en mémoire)
        String result = service.processUser("123");
        // Vérifier résultat réel
    }
}
```

---

## 📝 Documentation Patterns

### Pattern: Javadoc Service

```java
/**
 * Service métier pour les salutations.
 * 
 * Fournit les opérations core de salutation avec support
 * de noms personnalisés.
 * 
 * @since 1.0.0
 */
@Service
public class HelloServiceImpl implements HelloService {
    
    /**
     * Génère un message de salutation personalisé.
     * 
     * @param name le nom de la personne (obligatoire, non-null)
     * @return message "Hello {name}"
     * @throws IllegalArgumentException si name est null ou vide
     * @see HelloService#sayHello(String)
     */
    @Override
    public String sayHello(String name) {
        if (name == null || name.isEmpty()) {
            throw new IllegalArgumentException("Name cannot be null or empty");
        }
        return "Hello " + name;
    }
}
```

### Pattern: OpenAPI Documentation

```yaml
paths:
  /api/v1/hello/{name}:
    get:
      operationId: helloWithName
      summary: Say hello to someone
      description: |
        Generates a personalized hello message for the given name.
        
        This endpoint is the main greeting functionality and supports
        any UTF-8 name string.
      parameters:
        - name: name
          in: path
          required: true
          description: The person's name
          schema:
            type: string
            minLength: 1
            maxLength: 100
      responses:
        '200':
          description: Successfully generated greeting
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/HelloDto'
        '400':
          description: Invalid input (name too long or empty)
```

---

## 🐛 Debugging Guide

### Local Debugging

```bash
# Terminal 1: Start application in debug mode
mvn spring-boot:run -Dspring-boot.run.arguments="--debug"

# Terminal 2: Attach debugger (VS Code / IntelliJ)
# Breakpoints automatiquement stops execution
# Inspect variables, step through code
```

### Logs Inspection

```bash
# Enable DEBUG logs
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dlogging.level.root=DEBUG"

# Check Spring logs
grep "HelloApiDelegateImpl" target/logs/app.log
```

### Test Debugging

```bash
# Run single test with debug
mvn test -Dtest=HelloServiceImplTest#sayHello_should_return_hello_world -Dmaven.surefire.debug

# Breakpoints in IDE will pause execution
```

---

## ✅ Pre-Commit Checklist

Avant de committer:

```bash
# 1. Build complet (compile + tests + package)
mvn clean package

# 2. Vérifier pas de fichiers à ignorer
git status

# 3. Vérifier contenu commits
git diff --cached

# 4. Committer avec message clair
git commit -m "feat(api): description courte en anglais"

# 5. Pusher et créer PR
git push origin feature/...
```

---

## 🎓 Resources

- 📖 **Constitution:** `.specify/memory/constitution.md` (source unique vérité)
- 📖 **Architecture Detailée:** `.specify/ARCHITECTURE_ANALYSIS.md` (deep dive)
- 📖 **Code Review Checklist:** `.specify/CODE_REVIEW_CHECKLIST.md` (PR validation)
- 📖 **JVM Config:** `JVM-CONFIG.md` (debugging/performance)
- 🔗 **Spring Boot Docs:** https://spring.io/projects/spring-boot
- 🔗 **OpenAPI 3.0 Spec:** https://swagger.io/specification/
- 🔗 **JUnit 5 Guide:** https://junit.org/junit5/docs/

---

**LastUpdated:** 2026-01-23 | **Version:** 1.0.0

---

## 🛠️ Gradle v9.1.0 Setup (Phase 1: Production Ready)

### ✅ What's Included

- **Gradle Wrapper**: Automatic download of Gradle 9.1.0 (no manual installation needed)
- **Java 25 Toolchain**: Gradle automatically uses JDK 25 or downloads it
- **OpenAPI Generation**: Plugin v7.11.0 wired to `compileJava` (task dependency)
- **Version Catalog**: `gradle/libs.versions.toml` for dependency version management
- **Spring Boot Integration**: Plugin configured with explicit main class

### 🚀 Quick Start with Gradle

```bash
# Build JAR (no tests - safer for first Gradle run)
./gradlew build -x test

# Build with tests (requires Java 25 tmpdir setup - see troubleshooting)
./gradlew build

# Run tests only
./gradlew test

# Clean build
./gradlew clean build -x test

# Generate OpenAPI sources manually (integrated into build)
./gradlew openApiGenerate

# Run app directly from Gradle
./gradlew bootRun

# Build and run the bootable JAR (helper script)
./src/scripts/run-gradle-jar.sh
```

### 📁 Gradle Directory Structure

```
hello-api/
├── build/                          # Generated artifacts (ignored in VCS)
│   ├── generated-sources/          # OpenAPI-generated Java code
│   ├── libs/hello-api-*.jar        # Packaged JAR
│   └── test-results/               # Test reports
├── gradle/
│   └── wrapper/                    # Gradle distribution files
│       ├── gradle-wrapper.jar
│       └── gradle-wrapper.properties
├── gradlew                         # UNIX wrapper script (commit to VCS!)
├── gradlew.bat                     # Windows wrapper script (commit to VCS!)
├── settings.gradle.kts             # Project settings (Kotlin DSL)
├── build.gradle.kts                # Build configuration (Kotlin DSL)
└── gradle/libs.versions.toml       # Centralized dependency versions
```

### 🔧 Key Gradle Configuration

**build.gradle.kts Highlights:**

```kotlin
// Spring Boot app main class (resolves ambiguity with OpenAPI generator)
springBoot {
    mainClass.set("com.sqli.pbousquet.helloapi.HelloApiApplication")
}

// OpenAPI generation wired to compilation
tasks.named("compileJava") {
    dependsOn("openApiGenerate")
}
tasks.named("processResources") {
    dependsOn("openApiGenerate")
}

// Java 25 toolchain
java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(25))
    }
}
```

### 🧪 Gradle vs Maven: Build Comparison

| Operation | Maven | Gradle |
|-----------|-------|--------|
| Full Build | `mvn clean package` | `./gradlew build` |
| Compile Only | `mvn clean compile` | `./gradlew compileJava` |
| Run Tests | `mvn test` | `./gradlew test` |
| Skip Tests | `mvn clean package -DskipTests` | `./gradlew build -x test` |
| Run App JAR | `java -jar target/*.jar` | `java -jar build/libs/*.jar` |
| IDE Integration | Maven > Gradle in most IDEs | Native support in modern IDEs |
| Incremental Builds | Slower (full recompile) | Faster (task-based incremental) |

### ⚙️ Gradle Performance Tips

1. **Configuration Cache** (speeds up repeated builds):
   ```bash
   ./gradlew build --configuration-cache
   ```

2. **Parallel Builds**:
   ```bash
   ./gradlew build -x test --parallel
   ```

3. **Daemon Reuse** (default – faster):
   ```bash
   ./gradlew build  # Uses daemon (2x faster after first run)
   ./gradlew --no-daemon build  # Single-use process
   ```

### 🐛 Troubleshooting Gradle

**Issue: "Task ':test' encountered an unexpected problem"**

- **Cause**: Java 25 tmpdir configuration issue with test executor
- **Workaround**: 
  ```bash
  ./gradlew build -x test  # Skip tests initially
  # Or set tmpdir explicitly:
  ./gradlew test -Djava.io.tmpdir=/tmp
  ```

**Issue: "Unable to find a single main class"**

- **Cause**: OpenAPI Generator creates `org.openapitools.OpenApiGeneratorApplication`
- **Solution**: Already configured in `build.gradle.kts`:
  ```kotlin
  springBoot { mainClass.set("com.sqli.pbousquet.helloapi.HelloApiApplication") }
  ```

**Issue: "Task X uses output of task Y without declaring dependency"**

- **Cause**: Task dependency missing for generated sources
- **Solution**: Already configured:
  ```kotlin
  tasks.named("compileJava") { dependsOn("openApiGenerate") }
  tasks.named("processResources") { dependsOn("openApiGenerate") }
  ```

**Issue: "Gradle executable not found"**

- **Solution**: Use wrapper scripts (included in VCS):
  ```bash
  # On Unix/Mac/Linux:
  ./gradlew build
  
  # On Windows:
  gradlew.bat build
  ```

### 📊 JAR Verification

After `./gradlew build -x test`:

```bash
# Check JAR exists and size
ls -lh build/libs/hello-api-*.jar

# Verify JAR can start (stops after 5 seconds)
timeout 5 java -jar build/libs/hello-api-*.jar || true

# Compare to Maven JAR:
ls -lh target/hello-api-*.jar  # Should be similar size & structure
```

### ✅ Phase 1 Status

- [x] Gradle 9.1.0 Wrapper generated (supports Java 25)
- [x] `build.gradle.kts` with Kotlin DSL
- [x] Version Catalog (`gradle/libs.versions.toml`) synced to Maven
- [x] OpenAPI Generation plugin v7.11.0 (fixed from 6.2.1)
- [x] Task dependencies for generated sources
- [x] JAR builds successfully
- [x] App starts from Gradle-generated JAR
- [ ] Tests pass (Phase 2 - Java 25 tmpdir config)
- [ ] Dependency lockfiles enabled (Phase 2)
- [ ] CI/CD Gradle stage added (Phase 2)

---

## 🛠️ Notes Gradle vs Maven (étude)

- Sorties: Maven → `target/`, Gradle → `build/` (tous deux ignorés en VCS).
- Java toolchain: configuré sur Java 25 dans Gradle (`java.toolchain`).
- OpenAPI: tâche Gradle `openApiGenerate` régénère vers `build/generated-sources` et est câblée à `compileJava`.
- Wrapper: ajouter `gradlew`/`gradlew.bat` et `gradle/wrapper/*` pour exécuter sans installation préalable.
- Rapports tests: disponibles sous `build/test-results/test` (Gradle) et `target/surefire-reports` (Maven).

### Dépannage

- `permission denied` sur `gradlew` → `chmod +x gradlew`.
- Version Java non trouvée → vérifier `sdkman`, `jEnv` ou `JAVA_HOME`; Gradle toolchain tentera une installation si disponible.
- Conflits IDE (indexation `build/` vs `target/`) → invalider caches IDE si nécessaire.
