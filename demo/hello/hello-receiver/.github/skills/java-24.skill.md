---
description: Enrichir la base de connaissance autour du langage java, en analysant les évolutions du langage étudiées par SQLI pour la version java 24.
version: Java 24 (NON LTS)
released: 2025-03-18
---

# Les nouveautés de Java 24

**Othmane Cheddour** <ocheddour@sqli.com> - Version 1.0

_Relecture par Philippe Bousquet <pbousquet@sqli.com>_

---

## Introduction

SQLI et sa Tech Society mandate, au travers de sa communauté Java, ses experts à analyser chaque nouvelle version de Java et à en faire une synthèse. C'est Othmane Cheddour qui s'est penché sur la version 24 de Java qui sort aujourd'hui 18 mars 2025. Voici ce que nous pouvons retenir de son analyse.

Chaque JEP peut être en mode : Incubator, Experimental, Preview ou Standard (définitions conservées).

## Intégration progressive des projets Leyden et Lilliput

Java 24 intègre progressivement les projets Leyden (réduction du temps de démarrage, consommation mémoire, performances) et Lilliput (réduction de l'empreinte des headers d'objets Java).

### Valhalla et Loom

- Valhalla : travaux autour des value classes, des objets et des generics/primitives.
- Loom : virtual threads (introduits précédemment) et réécriture interne de la JVM.

## Évolutions du langage

Il n'y a pas de fonctionnalité majeure totalement nouvelle, mais plusieurs JEPs sont reconduites en preview.

### JEP 488 — Primitive Types in Patterns, instanceof, and switch (Second Preview)

Permet l'usage des types primitifs dans les patterns `instanceof` et `switch` (exemple) :

```java
int x = 65;
if (x instanceof char c) {
  System.out.println("c = " + c); // Sortie : "c = A"
}
```

### JEP 492 — Flexible Constructor Bodies (Third Preview)

Autorise des instructions et l'initialisation d'attributs avant l'appel à `super()` dans un constructeur :

```java
public class PositiveBigInteger extends BigInteger {
  private final long max;

  public PositiveBigInteger(long value, long max) {
      if (value <= 0)
          throw new IllegalArgumentException("non-positive value");
      this.max = max;
      super(value);
  }
}
```

### JEP 494 — Module Import Declarations (Second Preview)

Permet `import module M` pour importer toutes les classes exportées par un module (ex : `import module java.util;`).

```java
import module java.util;

String[] fruits = new String[] { "apple", "berry", "citrus" };
Map<String, String> m =
    Stream.of(fruits)
          .collect(Collectors.toMap(s -> s.toUpperCase().substring(0,1),
                                    Function.identity()));
```

### JEP 495 — Simple Source Files and Instance Main Methods (Fourth Preview)

Renforce les simplifications des fichiers sources et des `main` (héritées depuis Java 21/23) — ex. :

```java
main() {
  println("Hello, World!");
}
```

## Évolutions des APIs

### JEP 472 — Prepare to Restrict the Use of JNI

Usage de JNI et FFM provoque désormais un avertissement à l'exécution (consistence entre JNI et FFM). Exemple d'avertissements et option pour les supprimer :

```sh
WARNING: A restricted method in java.lang.foreign.Linker has been called
WARNING: Use --enable-native-access=ALL-UNNAMED to avoid a warning for callers in this module
```

Pour désactiver les warnings globalement :

```sh
java --enable-native-access=ALL-UNNAMED ...
```

### JEP 484 — Class-File API

API pour analyser/générer/transformer les fichiers `.class` : builders, code generation (exemples conservés).

### JEP 485 — Stream Gatherers

Permet la création d'opérations intermédiaires personnalisées via `Stream::gather(Gatherer)` (exemple de `limit()` reproduit).

## Sécurité : chiffrement post-quantique

Java 24 intègre des algorithmes post-quantiques (ML-KEM / ML-DSA) : exemples d'utilisation pour génération de clés, encapsulation/décapsulation et signatures.

### JEP 496 — ML-KEM (Key Encapsulation)

```java
KeyPairGenerator g = KeyPairGenerator.getInstance("ML-KEM");
KeyPair kp = g.generateKeyPair();
```

(Extraits d'usage fournis pour encapsulation/décapsulation.)

### JEP 497 — ML-DSA (Digital Signatures)

```java
Signature ss = Signature.getInstance("ML-DSA");
ss.initSign(privateKey);
ss.update(msg);
byte[] sig = ss.sign();
```

### JEP 498 — Warn upon Use of Memory-Access Methods in sun.misc.Unsafe

Émet un warning quand une application appelle directement ou indirectement des méthodes `sun.misc.Unsafe` déjà dépréciées.

```sh
WARNING: A terminally deprecated method in sun.misc.Unsafe has been called
```

### JEP 486 — Permanently Disable the Security Manager

Le Security Manager est définitivement désactivé.

## Previews & Incubators (sélection)

- JEP 478 — Key Derivation Function API (Preview)
- JEP 499 — Structured Concurrency (Fourth Preview)
- JEP 487 — Scoped Values (Fourth Preview)
- JEP 489 — Vector API (Ninth Incubator)

Exemples et usages fournis dans le document d'origine.

## JVM / Runtime

### Garbage Collector

- JEP 404 — Generational Shenandoah (Experimental)
- JEP 475 — Late Barrier Expansion for G1
- JEP 490 — ZGC: Remove the Non-Generational Mode (garder generational par défaut)

```
┌───────────────────────────────────────────────────────────────────────┐
│                               JVM Heap                                │
│                           (-Xms / -Xmx)                               │
│                                                                       │
│  ┌──────────────────────── Young Generation (-Xmn) ─────────────────┐ │
│  │                                                                  │ │
│  │   ┌─────────┐    ┌─────────┐    ┌─────────┐                      │ │
│  │   │  Eden   │ →  │   S0    │ →  │   S1    │  ───►                │ │
│  │   └─────────┘    └─────────┘    └─────────┘     │                │ │
│  │                                                 ▼                │ │
│  └─────────────────────────────────────────────────┬────────────────┘ │
│                                                    │                  │
│                                   ┌────────────────┴────────────────┐ │
│                                   │        Old Generation           │ │
│                                   │      (Tenured Space)            │ │
│                                   └─────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────┐
│                               Metaspace                               │
│                      (hors du Heap, mémoire native)                   │
└───────────────────────────────────────────────────────────────────────┘
```

### Runtime

- JEP 450 — Compact Object Headers (Experimental)
- JEP 483 — Ahead-of-Time Class Loading & Linking (amélioration du temps de démarrage)
- JEP 491 — Synchronize Virtual Threads without Pinning

### Autres

- JEP 493 — Linking Run-Time Images without JMODs (réduction taille JDK)
- JEP 479 & JEP 501 — suppression/dépréciation du port Windows 32-bit x86 / x86 32-bit

## Conclusion

Java 24 est une version de transition avant l'LTS Java 25 : stabilisation des APIs, focus sur performance, réduction de taille mémoire et adoption progressive de projets Leyden / Lilliput.

## Références

- https://openjdk.java.net/projects/leyden/
- https://openjdk.java.net/projects/lilliput/
- https://openjdk.org/projects/jdk/24/
- Autres liens listés dans le document d'origine
