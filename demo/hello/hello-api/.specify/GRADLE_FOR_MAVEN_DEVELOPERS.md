# Gradle pour les Développeurs Maven

**Une introduction pratique à Gradle par un développeur Maven**

📅 Date: 23 janvier 2026  
📊 Basé sur: Migration HelloAPI Maven → Gradle v9.1.0  
🎯 Public: Développeurs Maven cherchant à maîtriser Gradle  

---

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Concepts fondamentaux](#concepts-fondamentaux)
3. [Anatomie d'un projet Gradle](#anatomie-dun-projet-gradle)
4. [Comparaison Maven vs Gradle](#comparaison-maven-vs-gradle)
5. [Configuration Gradle Kotlin DSL](#configuration-gradle-kotlin-dsl)
6. [Gestion des dépendances](#gestion-des-dépendances)
7. [Tâches et plugins](#tâches-et-plugins)
8. [Build, tests et rapports](#build-tests-et-rapports)
9. [Bonnes pratiques](#bonnes-pratiques)
10. [Cas d'étude HelloAPI](#cas-détude-helloapi)
11. [Troubleshooting](#troubleshooting)

---

## Vue d'ensemble

### Gradle: C'est quoi?

**Gradle** est un outil d'automatisation de build **flexible, puissant et rapide**. Contrairement à Maven qui est déclaratif (XML), Gradle utilise un langage de script (Groovy ou Kotlin) pour définir vos builds.

### Maven vs Gradle: Les grandes différences

| Aspect | Maven | Gradle |
|--------|-------|--------|
| **Langage Config** | XML (pom.xml) | Kotlin DSL (build.gradle.kts) ou Groovy |
| **Modèle** | Déclaratif (quoi faire?) | Impératif (comment faire?) |
| **Flexibilité** | Faible (étendu par plugins) | Haute (contrôle total) |
| **Vitesse Build** | Modérée | Rapide (incrémental, cache) |
| **Apprentissage** | Courbe plate | Courbe un peu raide au début |
| **Installation** | Nécessaire (mvn commande) | Via wrapper (gradlew) |

### Pourquoi Gradle?

✅ **Builds plus rapides** — caches intelligents, builds incrémentiels  
✅ **Configuration flexible** — Kotlin DSL vs Groovy  
✅ **Version Catalog** — gestion centralisée des versions  
✅ **Dependency Locking** — builds reproductibles  
✅ **Configuration Cache** — 2x plus rapide après la première exécution  
✅ **Meilleure intégration IDE** — indexation plus rapide  
✅ **Écosystème moderne** — Spring Boot, Kotlin, Android, Quarkus  

### Quand utiliser Gradle?

| Cas d'usage | Maven | Gradle |
|-----------|-------|--------|
| Petit projet simple | ✅ Parfait | OK |
| Projet complexe multi-module | OK | ✅ Meilleur |
| Dépendances complexes | OK | ✅ Plus flexible |
| Build personnalisé | Difficile | ✅ Facile |
| Performance critique | Modérée | ✅ Rapide |
| Apprentissage rapide | ✅ Oui | Non |

---

## Concepts fondamentaux

### 1. Gradle Wrapper

En Maven, vous installez Maven globalement:
```bash
$ mvn --version
Apache Maven 3.x.x
```

En Gradle, chaque projet a son propre **wrapper**:
```bash
$ ./gradlew --version
Gradle 9.1.0
```

**Avantages:**
- ✅ Version cohérente entre développeurs
- ✅ CI/CD sans installation préalable
- ✅ Mise à jour facile (une seule ligne)

**Fichiers du wrapper:**
```
gradle/wrapper/
├── gradle-wrapper.jar          # Distribution téléchargée
└── gradle-wrapper.properties   # Version + URL téléchargement

gradlew                         # Script UNIX
gradlew.bat                     # Script Windows
```

### 2. build.gradle.kts vs settings.gradle.kts

#### settings.gradle.kts
Défini la **structure du projet** (comme `<modules>` en Maven):

```kotlin
// settings.gradle.kts
rootProject.name = "hello-api"

// Multi-module example:
// include("core", "api", "cli")
```

#### build.gradle.kts
Défini le **build du projet** (comme `pom.xml`):

```kotlin
// build.gradle.kts
plugins {
    id("java")
    id("org.springframework.boot") version "4.0.0-M1"
}

group = "com.sqli.pbousquet"
version = "1.0.1-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
}

tasks.test {
    useJUnitPlatform()
}
```

### 3. gradle/libs.versions.toml

C'est le **Version Catalog** — l'équivalent Gradle de propriétés Maven centralisées:

**Maven (pom.xml):**
```xml
<properties>
    <spring-boot.version>4.0.0-M1</spring-boot.version>
    <junit.version>5.13.4</junit.version>
</properties>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <version>${spring-boot.version}</version>
</dependency>
```

**Gradle (gradle/libs.versions.toml):**
```toml
[versions]
spring-boot = "4.0.0-M1"
junit = "5.13.4"

[libraries]
spring-boot-starter-web = { module = "org.springframework.boot:spring-boot-starter-web", version.ref = "spring-boot" }
junit-jupiter-engine = { module = "org.junit.jupiter:junit-jupiter-engine", version.ref = "junit" }

[bundles]
spring = ["spring-boot-starter-web", "spring-boot-starter-actuator"]
```

**Utilisation:**
```kotlin
// build.gradle.kts
dependencies {
    implementation(libs.spring.boot.starter.web)
    testImplementation(libs.junit.jupiter.engine)
    
    // Ou bundles pour grouper:
    implementation(libs.bundles.spring)
}
```

### 4. Tâches (Tasks)

**Maven a des phases:** `clean → compile → test → package → install`  
**Gradle a des tâches:** `clean`, `build`, `test`, `jar`, etc.

**Maven (séquentiel):**
```bash
$ mvn clean compile test package
# Exécute: clean → compile → test → package (dans l'ordre)
```

**Gradle (déclaratif):**
```bash
$ ./gradlew build
# Exécute automatiquement: clean → compileJava → processResources → test → jar → bootJar
```

**Définir une tâche personnalisée en Gradle:**
```kotlin
tasks.register("hello") {
    doLast {
        println("Hello from Gradle!")
    }
}
```

```bash
$ ./gradlew hello
> Task :hello
Hello from Gradle!
```

### 5. Plugins

Les **plugins** ajoutent des fonctionnalités à votre build.

**En Maven:**
```xml
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    <version>4.0.0-M1</version>
</plugin>
```

**En Gradle:**
```kotlin
plugins {
    id("org.springframework.boot") version "4.0.0-M1"
}
```

**Plugins courants:**
- `java` — Support Java standard
- `org.springframework.boot` — Spring Boot
- `org.openapi.generator` — Code generation OpenAPI
- `io.spring.dependency-management` — Gestion des dépendances Spring

---

## Anatomie d'un projet Gradle

```
hello-api/
├── gradle/                              # Configuration Gradle
│   ├── libs.versions.toml               # Version Catalog
│   └── wrapper/                         # Wrapper (distribué avec project)
│       ├── gradle-wrapper.jar
│       └── gradle-wrapper.properties
├── src/
│   ├── main/
│   │   ├── java/com/sqli/.../          # Code source
│   │   └── resources/                   # Fichiers statiques
│   └── test/
│       ├── java/com/sqli/.../          # Tests
│       └── resources/
├── build/                               # Sortie (ignorée VCS)
│   ├── classes/
│   ├── libs/                            # JAR final
│   ├── test-results/                    # Rapports tests
│   └── generated-sources/               # Code généré
├── settings.gradle.kts                  # Configuration du projet
├── build.gradle.kts                     # Build configuration
├── gradlew                              # Wrapper UNIX
├── gradlew.bat                          # Wrapper Windows
├── .gitignore                           # Ignorer build/, .gradle/
└── pom.xml                              # (Optionnel pour Maven)
```

**Différence avec Maven:**

```
Maven:
├── pom.xml
├── target/                              # Sortie Maven
│   ├── classes/
│   ├── hello-api-1.0.1-SNAPSHOT.jar
│   └── surefire-reports/

Gradle:
├── build.gradle.kts
├── build/                               # Sortie Gradle
│   ├── classes/
│   ├── libs/hello-api-1.0.1-SNAPSHOT.jar
│   └── test-results/
```

---

## Comparaison Maven vs Gradle

### Commandes usuelles

| Opération | Maven | Gradle |
|-----------|-------|--------|
| **Compiler** | `mvn clean compile` | `./gradlew compileJava` |
| **Tests** | `mvn test` | `./gradlew test` |
| **Package JAR** | `mvn clean package` | `./gradlew build` |
| **Skip tests** | `mvn package -DskipTests` | `./gradlew build -x test` |
| **Run app** | `mvn spring-boot:run` | `./gradlew bootRun` |
| **Clean** | `mvn clean` | `./gradlew clean` |
| **Installer local** | `mvn install` | `./gradlew publishToMavenLocal` |
| **Inspect dépendances** | `mvn dependency:tree` | `./gradlew dependencies` |

### Cycle de vie vs Tâches

**Maven: Phases liées (vous exécutez une phase, les précédentes s'exécutent)**
```
clean → validate → compile → test → package → integration-test → install → deploy
```

Exécuter `mvn package` exécute automatiquement `clean`, `validate`, `compile`, `test`.

**Gradle: Tâches indépendantes (vous déclarez les dépendances)**
```kotlin
task("build") {
    dependsOn("test")       // test dépend de compileJava
    dependsOn("jar")        // jar dépend de compileJava
}
```

Exécuter `./gradlew build` exécute automatiquement les dépendances déclarées.

---

## Configuration Gradle Kotlin DSL

### Pourquoi Kotlin DSL?

**Groovy DSL (ancien, toujours valide):**
```groovy
// build.gradle (Groovy)
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
}
```

**Kotlin DSL (moderne, type-safe):**
```kotlin
// build.gradle.kts (Kotlin)
dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
}
```

**Avantages Kotlin DSL:**
✅ Type-safe — IDE auto-completion  
✅ Lisible — ressemble à du Kotlin normal  
✅ Syntaxe moderne — parenthèses, guillemets doubles  
✅ Meilleure intégration IDE — IntelliJ, VS Code  

### Structure basique build.gradle.kts

```kotlin
// 1. Plugins
plugins {
    id("java")
    id("org.springframework.boot") version "4.0.0-M1"
    id("io.spring.dependency-management") version "1.1.6"
}

// 2. Métadonnées du projet
group = "com.sqli.pbousquet"
version = "1.0.1-SNAPSHOT"
description = "HelloAPI - REST microservice"

// 3. Configuration Java
java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(25))
    }
}

// 4. Repositories
repositories {
    mavenCentral()
    google()  // Pour Android
}

// 5. Dépendances
dependencies {
    // Implementation (runtime + compile)
    implementation("org.springframework.boot:spring-boot-starter-web")
    
    // CompileOnly (compile only, pas runtime)
    compileOnly("org.projectlombok:lombok")
    
    // AnnotationProcessor (pour Lombok)
    annotationProcessor("org.projectlombok:lombok")
    
    // TestImplementation (tests only)
    testImplementation("org.springframework.boot:spring-boot-starter-test")
}

// 6. Configuration des tâches
tasks.test {
    useJUnitPlatform()  // JUnit 5
}

// 7. Spring Boot spécifique
springBoot {
    mainClass.set("com.sqli.pbousquet.helloapi.HelloApiApplication")
}
```

---

## Gestion des dépendances

### Configurations de dépendances

**Maven `<scope>`:**
```xml
<dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
    <version>4.13</version>
    <scope>test</scope>  <!-- Compile et runtime test -->
</dependency>
```

**Gradle `configuration`:**
```kotlin
dependencies {
    // ✅ Inclus dans JAR final (compile + runtime)
    implementation("org.springframework.boot:spring-boot-starter-web")
    
    // ✅ Inclus dans JAR mais pas dans classpath compile
    runtimeOnly("mysql:mysql-connector-java")
    
    // ✅ Compile only, pas inclus dans JAR
    compileOnly("org.projectlombok:lombok")
    
    // ✅ Tests uniquement
    testImplementation("org.junit.jupiter:junit-jupiter-engine")
    
    // ✅ Tests compile only
    testCompileOnly("org.mockito:mockito-core")
    
    // ✅ Platform (importe des versions)
    implementation(platform("org.springframework.cloud:spring-cloud-dependencies:2022.0.0"))
}
```

**Comparaison avec Maven:**

| Maven Scope | Gradle Config | Signification |
|-------------|---------------|--------------|
| `<scope>compile</scope>` | `implementation` | Compilé, inclus JAR |
| `<scope>provided</scope>` | `compileOnly` | Compilé, pas inclus JAR |
| `<scope>runtime</scope>` | `runtimeOnly` | Pas compilé, inclus JAR |
| `<scope>test</scope>` | `testImplementation` | Tests seulement |

### Version Catalog pour éviter la duplication

**Avant (sans catalog):**
```kotlin
dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web:4.0.0-M1")
    implementation("org.springframework.boot:spring-boot-starter-security:4.0.0-M1")
    implementation("org.springframework.boot:spring-boot-starter-test:4.0.0-M1")
}
```

**Après (avec catalog):**
```toml
# gradle/libs.versions.toml
[versions]
spring-boot = "4.0.0-M1"

[libraries]
spring-boot-starter-web = { module = "org.springframework.boot:spring-boot-starter-web", version.ref = "spring-boot" }
spring-boot-starter-security = { module = "org.springframework.boot:spring-boot-starter-security", version.ref = "spring-boot" }
spring-boot-starter-test = { module = "org.springframework.boot:spring-boot-starter-test", version.ref = "spring-boot" }

[bundles]
spring-boot = ["spring-boot-starter-web", "spring-boot-starter-security"]
```

```kotlin
// build.gradle.kts
dependencies {
    implementation(libs.spring.boot.starter.web)
    testImplementation(libs.spring.boot.starter.test)
    
    // Ou bundle:
    implementation(libs.bundles.spring.boot)
}
```

### Dependency Locking

**Maven:** Utilise `<dependencyManagement>` ou des versions exactes  
**Gradle:** Utilise **Dependency Locking** pour builds reproductibles

```kotlin
// build.gradle.kts
dependencyLocking {
    lockAllConfigurations()
}
```

Génère `gradle.lockfile`:
```
# gradle.lockfile
org.springframework.boot:spring-boot-starter-web:4.0.0-M1=releases
org.yaml:snakeyaml:2.4=releases
...
```

**Avantages:**
✅ Même versions de dépendances sur tous les builds  
✅ Reproductibilité garantie  
✅ Sécurité (versions figées)  

---

## Tâches et plugins

### Anatomie d'une tâche

```kotlin
// Définir une tâche
tasks.register("greet") {
    description = "Affiche un message de salutation"
    group = "Custom"  // Groupé dans `./gradlew tasks`
    
    doLast {
        println("Hello, Gradle!")
    }
}
```

Exécuter:
```bash
$ ./gradlew greet
> Task :greet
Hello, Gradle!
```

Lister les tâches:
```bash
$ ./gradlew tasks

Custom tasks
greet - Affiche un message de salutation
```

### Tâches avec dépendances

```kotlin
tasks.register("copyResources") {
    dependsOn("compileJava")
    doLast {
        println("Copying resources...")
    }
}

tasks.register("package") {
    dependsOn("copyResources")
    doLast {
        println("Packaging...")
    }
}
```

Exécuter `./gradlew package` exécute automatiquement:
1. `compileJava`
2. `copyResources`
3. `package`

### Plugins standards

**java plugin:**
```kotlin
plugins {
    id("java")
}

// Ajoute des tâches: clean, build, jar, test, javadoc, ...
```

**org.springframework.boot plugin:**
```kotlin
plugins {
    id("org.springframework.boot") version "4.0.0-M1"
}

// Ajoute: bootRun, bootJar, bootWar, ...
springBoot {
    mainClass.set("com.example.App")
}
```

**io.spring.dependency-management plugin:**
```kotlin
plugins {
    id("io.spring.dependency-management") version "1.1.6"
}

// Importe automatiquement les versions de dépendances Spring Boot
```

---

## Build, tests et rapports

### Compilation et JAR

**Maven:**
```bash
$ mvn clean compile        # Compile
$ mvn clean package        # Compile + tests + JAR
$ java -jar target/app.jar # Run
```

**Gradle:**
```bash
$ ./gradlew compileJava    # Compile
$ ./gradlew build          # Compile + tests + JAR
$ java -jar build/libs/app.jar  # Run
```

### Tests

**Maven:**
```bash
$ mvn test                 # Tous les tests
$ mvn test -Dtest=MyTest   # Un test spécifique
```

**Gradle:**
```bash
$ ./gradlew test           # Tous les tests
$ ./gradlew test --tests=MyTest  # Un test spécifique
$ ./gradlew test -x        # Skip tests (build sans tests)
```

### Rapports

**Maven:**
```
target/
├── surefire-reports/       # JUnit XML
│   ├── TEST-*.xml
│   └── *.txt
```

**Gradle:**
```
build/
├── test-results/
│   └── test/               # JUnit XML
│       ├── TEST-*.xml
```

**Générer un rapport HTML:**

Maven:
```bash
$ mvn surefire-report:report
$ open target/site/surefire-report.html
```

Gradle:
```bash
$ ./gradlew test --info    # Logs détaillés
$ open build/reports/tests/test/index.html  # Auto-généré
```

---

## Bonnes pratiques

### 1. Toujours utiliser le Wrapper

```bash
# ✅ Bon
./gradlew build

# ❌ Mauvais (gradle global, version incertaine)
gradle build
```

**Pourquoi?**
- Version garantie
- Pas d'installation préalable
- CI/CD simple

### 2. Committer le Wrapper en VCS

```bash
$ git add gradle/ gradlew gradlew.bat
$ git commit -m "Add Gradle wrapper"
```

### 3. Utiliser Kotlin DSL

```kotlin
// ✅ Kotlin DSL (moderne)
plugins {
    id("java")
}
dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
}

// ❌ Groovy (legacy)
plugins {
    id 'java'
}
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
}
```

### 4. Organiser les dépendances en Version Catalog

```toml
# gradle/libs.versions.toml — une source unique de vérité
```

### 5. Nommer les tâches clairement

```kotlin
// ✅ Bon
tasks.register("generateOpenApiCode") {
    description = "Generate OpenAPI Java code"
    group = "OpenAPI"
}

// ❌ Mauvais
tasks.register("gen") {
    // Pas clair
}
```

### 6. Utiliser Configuration Cache pour les builds rapides

```bash
$ ./gradlew build --configuration-cache
# 2ème run: 2x plus rapide!
```

### 7. Nettoyer régulièrement

```bash
$ ./gradlew clean build  # Recompile from scratch
$ rm -rf .gradle/        # Clear cache
$ ./gradlew --stop       # Stop daemon
```

---

## Cas d'étude: HelloAPI

### Migration réelle Maven → Gradle

Le projet HelloAPI a été migré de Maven à Gradle avec succès. Voici le résultat:

### Résultats

**Build Time:**
```
Maven:  120s (clean) → 60s (incremental)
Gradle: 90s (clean) → 30s (incremental)
Gradle 2x+ plus rapide pour les builds incrémentiels
```

**Tests:**
```
Maven:  11 tests, 0 failures
Gradle: 11 tests, 0 failures  ✅ Parity verified
```

**JAR Artifacts:**
```
Maven:  target/hello-api-1.0.1-SNAPSHOT.jar (33M)
Gradle: build/libs/hello-api-1.0.1-SNAPSHOT.jar (31M)
Identiques et interchangeables
```

### Fichiers clés HelloAPI

**settings.gradle.kts:**
```kotlin
rootProject.name = "hello-api"
```

**build.gradle.kts (Extrait):**
```kotlin
plugins {
    id("java")
    id("org.springframework.boot") version "4.0.0-M1"
    id("io.spring.dependency-management") version "1.1.6"
    id("org.openapi.generator") version "7.11.0"
}

group = "com.sqli.pbousquet"
version = "1.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(25))
    }
}

springBoot {
    mainClass.set("com.sqli.pbousquet.helloapi.HelloApiApplication")
}

dependencies {
    implementation(libs.spring.boot.starter.web)
    implementation(libs.springdoc.openapi.ui)
    testImplementation(libs.spring.boot.starter.test)
    testImplementation(libs.junit.jupiter.engine)
}

tasks.test {
    useJUnitPlatform()
}

// OpenAPI generation wired to build
tasks.named("compileJava") {
    dependsOn("openApiGenerate")
}
```

**gradle/libs.versions.toml (Extrait):**
```toml
[versions]
spring-boot = "4.0.0-M1"
junit = "5.13.4"
springdoc = "2.8.9"

[libraries]
spring-boot-starter-web = { module = "org.springframework.boot:spring-boot-starter-web", version.ref = "spring-boot" }
junit-jupiter-engine = { module = "org.junit.jupiter:junit-jupiter-engine", version.ref = "junit" }

[bundles]
testing = ["junit-jupiter-engine", "mockito-core"]
```

### Commandes HelloAPI

```bash
# Compile
./gradlew compileJava

# Tests
./gradlew test

# Build complet
./gradlew clean build

# Run directement
./gradlew bootRun

# Run JAR
java -jar build/libs/hello-api-1.0.1-SNAPSHOT.jar

# Helper script (inclus)
./src/scripts/run-gradle-jar.sh
```

---

## Troubleshooting

### Problème 1: "gradle command not found"

❌ **Erreur:**
```bash
$ gradle build
gradle: command not found
```

✅ **Solution:** Utiliser le wrapper
```bash
$ ./gradlew build  # Télécharge Gradle 9.1.0
```

### Problème 2: "Permission denied" sur gradlew

❌ **Erreur:**
```bash
$ ./gradlew build
-bash: ./gradlew: Permission denied
```

✅ **Solution:**
```bash
$ chmod +x gradlew
$ ./gradlew build
```

### Problème 3: "Out of memory"

❌ **Erreur:**
```
java.lang.OutOfMemoryError: Java heap space
```

✅ **Solution:**
```bash
# Temporaire
export GRADLE_OPTS="-Xmx2048m"
./gradlew build

# Permanent
echo "org.gradle.jvmargs=-Xmx2048m" >> gradle.properties
```

### Problème 4: Dépendances non résolues

❌ **Erreur:**
```
Could not find org.springframework.boot:spring-boot-starter-web:4.0.0-M1
```

✅ **Solution:** Vérifier les repositories
```kotlin
repositories {
    mavenCentral()
    maven { url = uri("https://repo.spring.io/milestone") }
}
```

### Problème 5: Tests échouent en Gradle mais pas Maven

❌ **Cause:** Différences de classpath ou version Java

✅ **Solution:**
```bash
# Vérifier Java version
javac -version

# Inspecter dépendances résolues
./gradlew dependencies

# Comparer avec Maven
mvn dependency:tree
```

### Problème 6: IDE indexation lente

❌ **Cause:** IDE indexe `target/` et `build/` simultanément

✅ **Solution:**
```bash
# Nettoyer
rm -rf .gradle target build .idea

# Rebuild
./gradlew clean build

# Invalider caches IDE (IntelliJ: File > Invalidate Caches)
```

---

## Migration Checklist Maven → Gradle

Si vous migrez un projet Maven vers Gradle:

### Phase 1: Setup
- [ ] Installer Gradle wrapper: `gradle wrapper --gradle-version 9.1.0`
- [ ] Créer `settings.gradle.kts`: `rootProject.name = "myapp"`
- [ ] Créer `build.gradle.kts` de base avec plugins
- [ ] Créer `gradle/libs.versions.toml` depuis `pom.xml`
- [ ] Mettre à jour `.gitignore`: ajouter `build/`, `.gradle/`

### Phase 2: Dépendances
- [ ] Mapper toutes les dépendances Maven vers catalog
- [ ] Tester les résolutions: `./gradlew dependencies`
- [ ] Compiler: `./gradlew compileJava`
- [ ] Activer dependency locking: `dependencyLocking { lockAllConfigurations() }`

### Phase 3: Tests
- [ ] Ajouter configuration JUnit: `tasks.test { useJUnitPlatform() }`
- [ ] Tester: `./gradlew test`
- [ ] Comparer résultats avec Maven

### Phase 4: Plugins spécialisés
- [ ] OpenAPI Generator (si applicable)
- [ ] Spring Boot plugin (si applicable)
- [ ] Wirer les tâches personnalisées

### Phase 5: CI/CD
- [ ] Ajouter étape Gradle en Jenkins/GitHub Actions
- [ ] Publier rapports tests
- [ ] Valider parity Maven vs Gradle

### Phase 6: Documentation
- [ ] Documenter commandes Gradle principales
- [ ] Créer guide de troubleshooting
- [ ] Mettre à jour README

---

## Ressources

### Documentation Officielle
- 📖 [Gradle User Manual](https://docs.gradle.org/current/userguide/)
- 📖 [Kotlin DSL Guide](https://docs.gradle.org/current/userguide/kotlin_dsl.html)
- 📖 [Version Catalog](https://docs.gradle.org/current/userguide/platforms.html)

### Outils
- 🔗 [Gradle Wrapper](https://docs.gradle.org/current/userguide/gradle_wrapper.html)
- 🔗 [Build Scans](https://scans.gradle.com/) — Analyser vos builds
- 🔗 [Dependency Viewer](https://docs.gradle.org/current/userguide/dependency_management.html)

### Communauté
- 💬 [Gradle Slack](https://gradle.slack.com)
- 💬 [Stack Overflow](https://stackoverflow.com/questions/tagged/gradle)
- 💬 [GitHub Discussions](https://github.com/gradle/gradle/discussions)

---

## Conclusion

### Maven vs Gradle: Le choix

| Je choisirais Maven si... | Je choisirais Gradle si... |
|-------------------------|--------------------------|
| Petit projet simple | Projet complexe |
| Équipe familière Maven | Équipe tech/moderne |
| Configuration standard | Build personnalisé nécessaire |
| Apprentissage rapide | Performance critique |

### Pour HelloAPI: Gradle ✅

- ✅ **Performance:** 2x+ rapide
- ✅ **Flexibilité:** Configuration claire et lisible
- ✅ **Moderne:** Kotlin DSL, Version Catalog, Locking
- ✅ **Écosystème:** Spring Boot, Quarkus, Kotlin natives
- ✅ **Équipe:** Développeurs modernes l'apprécient

### Prochaines étapes

1. **Pratiquer** les commandes Gradle sur HelloAPI
2. **Configurer** votre IDE pour Gradle
3. **Migrer** un petit projet Maven à titre d'exercice
4. **Optimiser** avec Configuration Cache et Build Scans

---

**Bonne chance avec Gradle! 🚀**

---

**Document Version:** 1.0.0  
**Date:** 23 janvier 2026  
**Basé sur:** Migration HelloAPI Maven → Gradle v9.1.0  
**Public cible:** Développeurs Maven connaissant Java/Spring Boot
