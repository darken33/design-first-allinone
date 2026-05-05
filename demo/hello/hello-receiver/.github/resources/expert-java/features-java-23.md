# Tour d'horizon Java 23

**Guillaume BIENFAIT** <gbienfait@sqli.com> - Version 1.0, 00/00/0000

_Relecture par Philippe Bousquet <pbousquet@sqli.com>_

---

## Introduction

Ce document liste les nouvelles features de Java 23, ainsi que les fonctionnalités en preview qui ont évoluées, puis les fonctionnalités dépréciées.

La sortie est prévue pour le *17/09/2024* et c’est la deuxième release après la [LTS Java 21](https://gitlab.bordeaux.sqli.com/workshop/etude/features-java-21/).

### [JEP 467: Markdown Documentation Comments](https://openjdk.org/jeps/467)

Cette JEP permet d'écrire les commentaires JavaDoc en Markdown. Au lieu de `/** ... */` et HTML, les lignes de documentation commencent par `///` et utilisent la syntaxe Markdown (backticks pour le code, listes Markdown, liens `[... ]`).

Exemple (JavaDoc HTML vs Markdown):

```java
// HTML-style (ancienne JavaDoc)
/**
 * Returns a hash code value for the object.
 * <p>
 * The general contract of {@code hashCode} is:
 * <ul>
 * <li>Whenever it is invoked on the same object more than once ...
 */
```

```java
// Markdown-style (nouveau)
/// Returns a hash code value for the object.
///
/// The general contract of `hashCode` is:
///
///   - Whenever it is invoked on the same object more than once ...
``` 

(image compare et explications conservées)

## Features en Preview ou Incubation

> Ces fonctionnalités sont encore en développement et doivent être activées manuellement.

### [JEP 476: Module Import Declarations (Preview)](https://openjdk.org/jeps/476)

Permet d'importer toutes les classes exportées par un module via `import module M`, réduisant les lignes d'import.

Exemple :

```java
import module java.util;

// plus besoin d'importer Map, Stream, Collectors individuellement
```

Règles importantes : conflit de noms cause une erreur (résolu par import direct), et les imports transitifs d'un module importé deviennent accessibles.

### [JEP 455: Primitive Types in Patterns, instanceof, and switch (Preview)](https://openjdk.org/jeps/455)

Autorise l'utilisation des types primitifs dans `instanceof` et `switch` pattern-matching. Tester si une valeur primitive peut être stockée dans un autre type primitif (ex. `int` -> `char`).

Exemple :

```java
int x = 65;
if (x instanceof char c) {
  System.out.println(c); // 'A'
}
```

Principes : types dominants/dominés, exhaustivité du `switch`.

### [JEP 473: Stream Gatherers (Second Preview)](https://openjdk.org/jeps/473)

Réintroduit les Gatherers (déjà vus en Java 22) permettant d'ajouter des opérations intermédiaires personnalisées via `Stream::gather(Gatherer)`. Prédéfinis : `fold`, `mapConcurrent`, `windowFixed`, `windowSliding`, `scan`.

### [JEP 482: Flexible Constructor Bodies (Second Preview)](https://openjdk.org/jeps/482)

Permet d'exécuter des instructions et d'initialiser des champs avant l'appel à `super()` dans les constructeurs des classes dérivées.

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

### [JEP 466: Class-File API (Second Preview)](https://openjdk.org/jeps/466)

API standard pour analyser/générer/transformer les fichiers `.class` (remplace progressivement ASM). Améliorations : simplification de `CodeBuilder`, améliorations des `ConstantPool` et signatures génériques, etc.

### [JEP 477: Implicitly Declared Classes and Instance Main Methods (Third Preview)](https://openjdk.org/jeps/477)

Autorise les méthodes `main` d'instance (non-static) et les classes implicites (fichiers source contenant directement une méthode `main`). Ajout d'un import implicite `java.io.IO` pour les méthodes `println()`/`print()`.

Exemple minimal :

```java
void main() {
  println("Hello world!");
}
```

### [JEP 480: Structured Concurrency (Third Preview)](https://openjdk.org/jeps/480)

Concurrence structurée présentée pour collecte de retours d'expérience; lien avec les virtual threads.

### [JEP 481: Scoped Values (Third Preview)](https://openjdk.org/jeps/481)

Scoped Values (déjà vus) entrent en troisième preview. `ScopedValue.callWhere()` permet maintenant de propager/attraper des exceptions vérifiées correctement.

### [JEP 469: Vector API (Eighth Incubator)](https://openjdk.org/jeps/469)

Huitième incubation pour la Vector API (calculs vectoriels optimisés pour CPU modernes).

## Dépréciations / Suppressions

### [JEP 471: Deprecate Memory-Access Methods in sun.misc.Unsafe](https://openjdk.org/jeps/471)

Les méthodes d'accès mémoire de `sun.misc.Unsafe` sont dépréciées pour suppression au profit d'API standard (VarHandle, FFM API).

Autres suppressions notables :

- `Thread.suspend()`, `Thread.resume()`, `ThreadGroup.suspend()`, `ThreadGroup.resume()` (retirées)
- `ThreadGroup.stop()` (retirée)

## Autres changements

- [JEP 474](https://openjdk.org/jeps/474): ZGC en mode générationnel par défaut.
- [JDK-8330005](https://bugs.openjdk.org/browse/JDK-8330005): Suppression du module `jdk.random` (fonctionnalités déplacées vers `java.base`).
- [JDK-8330276](https://bugs.openjdk.org/browse/JDK-8330276): Méthodes `Console` avec paramètre `Locale` ajouté.
- [JDK-8331202](https://bugs.openjdk.org/browse/JDK-8331202): Ajout de `Instant.until(Instant)`.

## Conclusion

Java 23 apporte principalement l'écriture de JavaDoc en Markdown, des améliorations sur les imports de modules, les patterns avec types primitifs, et des previews continuant l'évolution introduite dans Java 21/22.

---

*Sources*

- https://openjdk.org/projects/jdk/23/
- JEPs liées (liens ci-dessus)
