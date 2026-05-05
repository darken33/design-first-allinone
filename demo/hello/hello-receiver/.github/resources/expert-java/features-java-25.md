# Tour d'horizon de Java 25

**Anthony Baudouin** <abaudouin@sqli.com> - Version 1.0

---

## Introduction

Après deux années d'attente depuis Java 21, l'écosystème Java accueille le 16/09/2025 la nouvelle version Long-Term Support — **Java 25**.

Cette étude présente les nouveautés finalisées, ainsi que les JEPs en preview/expérimental.

### Points clés

- Finalisation de plusieurs previews (Scoped Values, Module Import Declarations, Primitive Types in Patterns, etc.).
- Améliorations performance et démarrage (intégration des travaux Leyden, cache AOT amélioré, profilage JIT intégré dans AOT).
- Nouvelles APIs de sécurité (KDF) et adoption d'algorithmes post-quantiques.

---

## Améliorations du code et des APIs

### JEP 506 — Scoped Values (finalisé)

Scoped Values, introduits en incubation puis preview, sont désormais standards. Ils permettent de partager des valeurs immuables dans un scope d'exécution (adaptés aux virtual threads). Remarque : `ScopedValue.orElse` n'accepte plus `null`.

### JEP 511 — Module Import Declarations (finalisé)

`import module M` permet d'importer toutes les classes exportées par un module (utile pour réduire les import statements). Exemple :

```java
import module java.base;
```

### JEP 512 — Compact Source Files and Instance Main Methods (finalisé)

Finalise les fichiers sources compacts et les `main()` d'instance pour faciliter l'apprentissage et les petits scripts Java. Exemple :

```java
main() {
  println("Hello, World!");
}
```

### JEP 513 — Flexible Constructor Bodies (finalisé)

Permet d'exécuter des instructions (y compris des affectations de champs) avant l'appel à `super()` dans les constructeurs des sous-classes.

### JEP 505 — Structured Concurrency (5ème preview)

Concurrence structurée toujours en preview avec API affinée (factories pour `StructuredTaskScope`, ajout de `Joiners`).

### JEP 507 — Primitive Types in Patterns (finalisé)

Finalise l'usage des types primitifs dans `instanceof`, `switch` et patterns, uniformisant la syntaxe entre primitives et objets.

---

## Performance (Leyden / AOT / runtime)

### JEP 514 — Ahead-of-Time Command-Line Ergonomics

Construction du cache AOT en une seule étape via `-XX:AOTCacheOutput` :

```bash
java -XX:AOTCacheOutput=app.aot -cp app.jar com.example.App ...
```

Et exécution avec le cache :

```bash
java -XX:AOTCache=app.aot -cp app.jar com.example.App ...
```

### JEP 515 — Ahead-of-Time Method Profiling

Incorpore le profilage JIT dans le cache AOT généré durant le run d'entraînement, améliorant le démarrage (meilleur ciblage des méthodes chaudes) au prix d'une légère augmentation de la taille du cache.

### JEP 519 — Compact Object Headers (finalisé)

Réduction de la taille des en-têtes d'objet (gains mémoire/CPU observés sur benchmarks). Activation :

```text
-XX:+CompactObjectHeaders
```

### JEP 521 — Generational Shenandoah (finalisé)

Shenandoah supporte désormais un mode générationnel (option `-XX:ShenandoahGCMode=generational`).

### JEP 502 — Stable Values (preview)

Nouvelle API pour différer l'initialisation des champs immuables jusqu'à la première lecture (lazy immutable values).

---

## Sécurité & crypto

### JEP 510 — Key Derivation Function API (finalisé)

API KDF finalisée (ex. HKDF). Exemple succinct :

```java
KDF hkdf = KDF.getInstance("HKDF-SHA256");
SecretKey key = hkdf.deriveKey("AES", params);
```

### Post-quantum / JEPs 496 & 497 (rappel)

Java a commencé l'intégration d'algorithmes post-quantiques (ML-KEM, ML-DSA) dans les versions précédentes ; Java 25 continue l'évolution de ces capacités.

### JEP 470 — PEM Encodings (preview)

API preview pour lire/écrire des objets cryptographiques au format PEM (`PEMEncoder`, `PEMDecoder`, etc.).

---

## APIs & autres évolutions

- **JEP 472** — Prepare to Restrict the Use of JNI : warnings cohérents pour l'usage natif (JNI/FFM) ; option `--enable-native-access=ALL-UNNAMED` pour supprimer les warnings.
- **JEP 484** — Class-File API : génération et transformation de `.class` via builders.
- **JEP 485** — Stream Gatherers : opérations intermédiaires personnalisées via `Stream::gather(Gatherer)`.

---

## Previews & Incubators (sélection)

- JEP 478 — Key Derivation Function API (preview → finalisé JEP 510)
- JEP 499 — Structured Concurrency (Fourth Preview → 505 ongoing)
- JEP 487 — Scoped Values (Fourth Preview → finalisé JEP 506)
- JEP 489 — Vector API (10ᵗʰ incubation)

---

## JVM / Runtime

### Garbage Collectors / Runtime optimizations

- **JEP 404** — Generational Shenandoah (experimental → finalisé JEP 521)
- **JEP 475** — Late Barrier Expansion for G1 (optimisations JIT/C2)
- **JEP 490** — ZGC: remove non-generational mode (garder generational)
- **JEP 450** — Compact Object Headers (experimental → finalisé JEP 519)
- **JEP 483** — Ahead-of-Time Class Loading & Linking (cache AOT)
- **JEP 491** — Synchronize Virtual Threads without Pinning

---

## Profiling (JFR)

### JEP 518 — JFR Cooperative Sampling

Révision du sampling de Java Flight Recorder pour réduire le biais des safepoints et améliorer la qualité des échantillons (sujet important pour le profiling précis en production).

---

## Conclusion

Java 25, en tant que LTS, finalise de nombreuses previews et apporte plusieurs améliorations centrées sur la performance (Leyden/AOT), la réduction mémoire (Compact Object Headers), et la sécurité (KDF, post-quantum). C'est une release de stabilisation et d'optimisation en vue d'une adoption large.

## Références

- https://openjdk.org/projects/jdk/25/
- Projets Leyden & Lilliput
- Liens et JEPs cités dans le document d'origine
