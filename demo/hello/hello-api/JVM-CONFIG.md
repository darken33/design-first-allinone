# Configuration JVM pour HelloAPI

Ce projet contient plusieurs configurations JVM optimisées pour différents environnements.

## Configurations disponibles

### 1. Configuration VS Code (launch.json)

Trois configurations sont disponibles dans VS Code :

- **HelloApiApplication** : Configuration de base pour le développement
- **HelloApiApplication (Debug)** : Configuration avec logs détaillés pour le debugging
- **HelloApiApplication (Production)** : Configuration optimisée pour la production

#### Paramètres JVM inclus :

**Développement :**
- `-Xmx512m -Xms256m` : Mémoire heap limitée pour le développement
- `-XX:+UseG1GC` : Garbage Collector G1
- `-XX:G1HeapRegionSize=16m` : Taille des régions G1

**Debug :**
- `-Xmx1g -Xms512m` : Plus de mémoire pour le debugging
- `-XX:+HeapDumpOnOutOfMemoryError` : Dump automatique en cas d'OutOfMemoryError
- Logs détaillés activés

**Production :**
- `-Xmx2g -Xms1g` : Mémoire optimisée pour la production
- `-XX:+EnableJVMCI -XX:+UseJVMCICompiler` : Compilation JIT avancée
- `-XX:MaxGCPauseMillis=100` : Limitation des pauses GC

### 2. Configuration Maven (pom.xml)

Trois profils Maven sont configurés :

```bash
# Développement (par défaut)
mvn spring-boot:run

# Test
mvn spring-boot:run -Ptest

# Production
mvn spring-boot:run -Pprod
```

### 3. Script de configuration (jvm-config.sh)

Un script shell est disponible pour définir les variables d'environnement :

```bash
# Charger les variables
source jvm-config.sh

# Lancer avec Maven
mvn spring-boot:run -Dspring-boot.run.jvmArguments="$JAVA_OPTS"

# Ou directement avec java
java $JAVA_OPTS -jar target/hello-api-1.0.1-SNAPSHOT.jar
```

## Utilisation recommandée

### Pour le développement local :
1. Utilisez la configuration VS Code "HelloApiApplication"
2. Ou lancez avec Maven : `mvn spring-boot:run`

### Pour les tests :
1. Utilisez la configuration VS Code "HelloApiApplication (Debug)"
2. Ou lancez avec Maven : `mvn spring-boot:run -Ptest`

### Pour la production :
1. Compilez le JAR : `mvn clean package -Pprod`
2. Lancez avec : `java $JAVA_OPTS -jar target/hello-api-1.0.1-SNAPSHOT.jar`

## Monitoring et observabilité

Les configurations incluent :
- Dumps de heap automatiques en cas d'erreur
- Logs configurables par environnement
- Métriques Spring Boot Actuator activées

## Personnalisation

Vous pouvez ajuster les paramètres dans :
- `.vscode/launch.json` pour VS Code
- `pom.xml` dans la section `<properties>` pour Maven
- `jvm-config.sh` pour les scripts shell

## Paramètres JVM expliqués

- **-Xmx** : Mémoire heap maximale
- **-Xms** : Mémoire heap initiale
- **-XX:+UseG1GC** : Active le garbage collector G1 (recommandé pour Java 11+)
- **-XX:G1HeapRegionSize** : Taille des régions pour G1GC
- **-XX:MaxGCPauseMillis** : Temps de pause GC maximum souhaité
- **-XX:+UseStringDeduplication** : Optimisation des chaînes de caractères
- **-XX:+OptimizeStringConcat** : Optimisation de la concaténation de chaînes
- **-XX:+HeapDumpOnOutOfMemoryError** : Génère un dump en cas d'erreur mémoire