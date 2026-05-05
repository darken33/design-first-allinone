# Tour d'horizon Java 22

**Najah SOUIHER** <nsouiher@sqli.com> - Version 1.0, 18/03/2024

_Relecture par Philippe Bousquet <pbousquet@sqli.com>_

---

## Introduction

Ce document liste les nouvelles features de Java 22, ainsi que les fonctionnalités en preview qui ont évoluées, puis les fonctionnalités dépréciées.

La sortie est prévue pour le 19/03/2024 et c’est la première release après la LTS Java 21 (la prochaine LTS c’est java 25 qui sortira Septembre 2025).

## Nouvelles features

### [JEP 456: Unnamed Variables & Patterns](https://openjdk.org/jeps/456)

Pendant nos développements quotidiens, nous déclarons parfois des variables que nous n'avons pas l'intention d'utiliser, que ce soit pour des raisons de style de code ou parce que le langage nécessite des déclarations de variables dans certains contextes. L'intention de non-utilisation est connue au moment où le code est écrit, mais si elle n'est pas capturée explicitement, les responsables ultérieurs pourraient accidentellement utiliser la variable, violant ainsi l'intention. Si nous pouvions rendre impossible l’utilisation accidentelle de telles variables, le code serait plus informatif, plus lisible et moins sujet aux erreurs.

Les variables et modèles sans nom ont été publiés dans [Java 21 en tant que preview](https://gitlab.bordeaux.sqli.com/workshop/etude/features-java-21/-/blob/master/README.adoc?ref_type=heads#user-content-patterns-et-variables-non-utilis%C3%A9s-1%C3%A8re-preview) sous le nom « pattern et variables sans nom » et seront finalisés dans Java 22 par la proposition d'amélioration 456 du JDK sans aucune modification.

#### Variables inutilisées

Par exemple, la plupart des développeurs ont écrit des blocs catch de cette forme, où le paramètre d'exception `ex` n'est pas utilisé :

```java
String s = ...;
try {
    int i = Integer.parseInt(s);
    ... i ...
} 
catch (NumberFormatException ex) {
    System.out.println("Bad number: " + s); // ex est non utilisée
}
```

Avec Unnamed var:

```java
String s = ...;
try {
    int i = Integer.parseInt(s);
    ... i ...
} 
catch (NumberFormatException _) {        // Unnamed variable
    System.out.println("Bad number: " + s); 
}
```

Les variables sans nom peuvent être utilisées dans plusieurs catch blocs :

```java
try { ... }
catch (Exception _) { ... }                // Unnamed variable
catch (Throwable _) { ... }                // Unnamed variable
```

Dans try-with-resources :

```java
try (var _ = ScopedContext.acquire()) {    // Unnamed variable
    ... no use of acquired resource ...
}
```

Une lambda dont le paramètre n'est pas pertinent :

```java
...stream.collect(Collectors.toMap(String::toUpperCase,
            _ -> "NODATA"));    // Unnamed variable
```

#### Variables Pattern inutilisées

Les variables locales peuvent être déclarées aussi par des type patterns — comme les variables locales connues comme des variables locales pattern — les type patterns aussi peuvent déclarer des variables inutilisées. Considérons le code suivant, qui utilise type patterns dans le case label dans une switch:

```java
sealed abstract class Ball permits RedBall, BlueBall, GreenBall { }
final  class RedBall   extends Ball { }
final  class BlueBall  extends Ball { }
final  class GreenBall extends Ball { }

Ball ball = ...
switch (ball) {
    case RedBall   red   -> process(ball); // red unused
    case BlueBall  blue  -> process(ball); // blue unused
    case GreenBall green -> stopProcessing(); // green unused
}
```

Avec Unnamed var

```java
switch (ball) {
    case RedBall   _ -> process(ball);          // Unnamed pattern variable
    case BlueBall  _ -> process(ball);          // Unnamed pattern variable
    case GreenBall _ -> stopProcessing();       // Unnamed pattern variable
}
```

### [JEP 458: Launch Multi-File Source-Code Programs](https://openjdk.org/jeps/458)

Depuis Java 11, il est possible de lancer un programme depuis un fichier source `.java` sans étape de compilation préalable. Le launcher Java va alors compiler le programme en mémoire automatiquement avant son exécution.

Avec la JEP 458, il est maintenant possible de lancer un programme depuis un fichier source qui utilise une classe définie dans un autre fichier source, ce second fichier sera aussi compilé automatiquement en mémoire. Les fichiers sources sont recherchés dans la hiérarchie de répertoire habituelle en Java qui reflète la structure des packages.

Seuls les fichiers source utilisés par le programme principal seront compilés en mémoire.

### [JEP 454: Foreign Function & Memory API](https://openjdk.org/jeps/454)

Néanmoins, un changement important a été fait dans l’API Foreign Function & Memory qui doit être noté : l’introduction de la notion de méthode limitée (restricted). Certaines méthodes de cette nouvelle API sont marquées comme limitées : pour les utiliser, il faudra utiliser l’option ligne de commande `--enable-native-access=module-name`. Pour l’instant, l’accès à des méthodes limitées génère un warning, mais il se pourrait que leur accès soit interdit dans une future version de la JVM. Les méthodes limitées sont utilisées pour binder une fonction native et/ou une donnée native, ce qui est par nature unsafe. C’est pour cela que son accès doit être donné spécifiquement via une option ligne de commande.

> Le code suivant appelle la `strlen()` fonction de la bibliothèque standard C pour déterminer la longueur de la chaîne « Happy Coding ! » :

```java
public class FFMTest22 {
  public static void main(String[] args) throws Throwable {
    // 1. Get a lookup object for commonly used libraries
    SymbolLookup stdlib = Linker.nativeLinker().defaultLookup();

    // 2. Get a handle to the "strlen" function in the C standard library
    MethodHandle strlen =
        Linker.nativeLinker()
            .downcallHandle(
                stdlib.find("strlen").orElseThrow(),
                FunctionDescriptor.of(ValueLayout.JAVA_LONG, ValueLayout.ADDRESS));

    // 3. Get a confined memory area (one that we can close explicitly)
    try (Arena offHeap = Arena.ofConfined()) {

      // 4. Convert the Java String to a C string and store it in off-heap memory
      MemorySegment str = offHeap.allocateFrom("Happy Coding!");

      // 5. Invoke the foreign function
      long len = (long) strlen.invoke(str);
      System.out.println("len = " + len);
    }
    // 6. Off-heap memory is deallocated at end of try-with-resources
  }
}
```

## Features en Preview ou Incubation

Ces fonctionnalités sont encore en développement. Par défaut, elles ne sont pas accessibles et doivent être activées manuellement.

Les fonctionnalités peuvent, dans une future release, être supprimées ou évoluer.

### [JEP 447 - Instructions avant super(...) (Preview)](https://openjdk.org/jeps/447)

Avant Java 22, quand une classe étend une autre classe et veut appeler le constructeur de la classe parente dans son propre constructeur, la JVM oblige l’appel du constructeur parent à être la première instruction du constructeur de la classe parente. Ceci permet de s’assurer que tous les champs de la classe parente sont initialisés avant la construction de la classe enfant.

Il s’agit d'une fonctionnalité en preview qui autorise des instructions avant l’appel du constructeur parent tant que ceux-ci n’accèdent pas à l’instance en cours de création.

#### validation des paramètres, pré-calculs d’arguments

```java
public class PositiveBigInteger extends BigInteger {

    public PositiveBigInteger(long value) {
        super(value);               // Potentially unnecessary work
        if (value <= 0)
            throw new IllegalArgumentException("non-positive value");
    }

}
```

Avec la JEP 447 :

```java
public class PositiveBigInteger extends BigInteger {

    public PositiveBigInteger(long value) {
        if (value <= 0)
            throw new IllegalArgumentException("non-positive value");
        super(value);
    }

}
```

Le code est plus lisible et évite potentiellement l’exécution inutile du construction parent en cas de non-validité de l’argument.

#### Préparation des arguments du constructeur de superclasse

Parfois, nous devons faire des traitements non triviaux avant l’appel du constructeur de la super classe. Nous pouvons le faire en se référant à des méthodes auxiliaires.

```java
public class Sub extends Super {

    public Sub(String type) {
        super(prepareByteArray(type));
    }

    // Auxiliary method
    private static byte[] prepareByteArray(String type) { 
        if (type == null) 
            throw new IllegalArgumentException("null type");
        return switch (type) {
            case "image" -> ...
            case "gif"   -> ...
            ...
            default      -> ...
        };
    }
}
```

Ce code serait plus lisible si nous pouvions intégrer le code de préparation des arguments directement dans le constructeur de la classe fille.

```java
    public Sub(String type) {
    if (type == null) 
        throw new IllegalArgumentException("null type");
    final byte[] byteArray = switch (type) {
        case "image" -> ...
        case "gif"   -> ...
        ...
        default      -> ...
    };
    super(byteArray);
    }
```

### [JEP 461: Stream Gatherers (Preview)](https://openjdk.org/jeps/461)

Voici une amélioration de l'API Stream en introduisant le support d'opérations intermédiaires personnalisées qui est actuellement en cours de développement. Cette fonctionnalité est actuellement offerte en version préliminaire.

L'API Stream existante propose un ensemble défini d'opérations intermédiaires et terminales. Elle permet d'étendre les opérations terminales via la méthode `Stream::collect(Collector)`, mais ne permet pas d'étendre les opérations intermédiaires. Certaines fonctionnalités nécessitent la combinaison de plusieurs opérateurs intermédiaires pour être réalisées et parfois on arrive pas à un produire un flux qui répond exactement au besoin.

Avec la *JEP 461*, il est maintenant possible de définir ses propres opérations intermédiaires via `Stream::gather(Gatherer)`.

#### Rappel sur la composition du stream

- Stream source : la source qui génère le stream. (ex via `IntStream.of(...)` ou `Collection.stream()`).
- Intermediate operations : les opérateurs intermédiaires qui transforment le Stream. (ex `map(...)`, `filter(...)`, et `limit(...)`).
- Terminal operations : opérations qui résume le stream soit par l'intermédiaire des Collectors ou bien par d’autres opérateurs comme la réduction (`reduce()`), compteur (`count()`), etc.

#### Interface Gatherer<T,A,R>

- `T` : le type d'éléments d'entrée dans l'opération de collecte
- `A` : le type d'état potentiellement mutable de l'opération de collecte (souvent caché en tant que détail d'implémentation)
- `R` : le type d'éléments de sortie de l'opération de collecte

L’interface `java.util.stream.Gatherer` définit les méthodes suivantes :

- `initializer()` : optionnel, permet de maintenir un état lors du traitement des éléments.
- `integrator()` : intègre un nouvel élément depuis la stream entrante, et émet si nécessaire un élément dans la stream de sortie.
- `combiner()` : optionnel, peut être utilisé pour évaluer le gatherer en parallèle pour les stream parallèle.
- `finisher()` : optionnel, appelé quand la stream n’a plus d’élément en entrée.

#### Gatherer prédéfinis

*Java 22* introduit les rassembleurs intégrés suivants dans la classe `java.util.stream.Gatherers` :

- `fold` : Opération qui effectue une transformation ordonnée, semblable à une réduction, pour des scénarios dans lesquels aucune fonction de combinaison ne peut être implémentée, ou pour des réductions qui dépendent intrinsèquement de l'ordre.

```java
// Va renvoyer: Optional["123456789"]
Optional<String> numberString = Stream.of(1, 2, 3, 4, 5, 6, 7, 8, 9)
                .gather(Gatherers.fold(() -> "", (string, number) -> string + number))
                .findFirst();
```

- `mapConcurrent` : une opération qui exécute des opérations simultanément avec une fenêtre fixe de concurrence maximale, à l'aide de VirtualThreads. Cette opération préserve l'ordre du flux!

```java
// Devrait permettre de traiter le mapping de 4 ConnaissanceClientDb en parallèle (maximum) 
public List<ConnaissanceClient> findAll() {
    List<ConnaissanceClientDb> connaissanceClientDbs = dbRepository.findAll();
    return connaissanceClientDbs.stream().mapConcurrent(4, mapper::mapToDomain).collect(Collectors.toList());
}
```

- `windowFixed` : stateful many-to-many gatherer qui regroupe les éléments d’entrée dans des listes d’une taille fixe , émettant les fenêtres en sortie lorsqu’elles sont pleines.

```java
//[[1, 2, 3], [4, 5, 6], [7, 8]].
List<List<Integer>> windows = Stream.of(1, 2, 3, 4, 5, 6, 7, 8)
                                  .gather(Gatherers.windowFixed(3))
                                  .toList();
```

- `windowSliding` : stateful many-to-many gatherer qui regroupe les éléments d’entrée dans des listes d’une taille fournie. Après la première fenêtre, chaque fenêtre suivante est créée à partir d'une copie de son prédécesseur en supprimant le premier élément et en ajoutant l’élément suivant de la stream d’entrée.

```java
// [[1, 2, 3], [2, 3, 4], [3, 4, 5]]
var numbers = List.of(1, 2, 3, 4, 5);
var slidingWindows = numbers.stream().gather(Gatherers.windowSliding(3))
                                     .toList();
```

- `scan` : effectue une analyse de préfixe - une accumulation incrémentielle, à l'aide des fonctions fournies.

```java
// À tester 
public static <T, R> Gatherer<T,?,R> scan(
                Supplier<R> initial,
                BiFunction<? super R,? super T,? extends R> scanner
            )
```

On peut combiner autant de gatherers entre eux jusqu’à arriver à l'opérateur terminal: `stream.gather(...).gather(...).collect(...);`

Les Gatherer sont utilisés pour transformer et manipuler des éléments de flux dans les opérations intermédiaires, tandis que les Collecteur sont utilisés pour finaliser la pipeline de flux avec les opérations de terminales.

### [JEP 457: Class-File API (Preview)](https://openjdk.org/jeps/457)

Java 22 fournit une API standard pour analyser, générer et transformer les fichiers de classe Java. Cela servira initialement à remplacer ASM, le framework de manipulation et d'analyse du bytecode Java.

... (exemples de code et explications conservés) ...

### [JEP 459: String Templates (2nd Preview)](https://openjdk.org/jeps/459)

Il s’agit d’une fonctionnalité qui reste en preview qui a pour but de gagner plus de feedback par rapport à Java 21.

... (exemples et descriptions conservés) ...

### [JEP 462: Concurrence structurée (2nd preview)](https://openjdk.org/jeps/462)

(Description conservée)

### [JEP 463: Classes implicitement déclarées et méthodes main d'instance (2nd preview)](https://openjdk.org/jeps/463)

(Description conservée)

### [JEP 464 / 460: Scoped Values & Vector API](https://openjdk.org/jeps/464)

Descriptions conservées pour Scoped Values et Vector API (7th incubator).

## Dépréciation / suppression

- `Thread.countStackFrames` a été supprimé.
- L’ancienne implémentation de Core Reflection a été supprimée.
- Dépréciations et suppressions dans `sun.misc.Unsafe`.

Il est à noter qu’aucun JEP n'existe pour ces changements, on peut les retrouver dans le bug tracker : https://bugs.openjdk.org/browse/JDK-8328219?jql=project%20%3D%20JDK%20AND%20fixVersion%20%3D%20%2222%22

## Conclusion

Java 22 n’est pas seulement une version de stabilisation après la version 21 qui est LTS mais aussi une version qui introduit des ajouts majeurs tels que les Stream Gatherer, quelques JEPs et la sortie de preview de la Foreign Function & Memory API qui va permettre une utilisation simplifiée de fonctions natives en Java avec une API performante et plus facile d’utilisation que JNI. De plus nous pouvons noter l’introduction de la feature de variable anonymes.

## Sources

- https://openjdk.org/projects/jdk/22/
- https://jdk.java.net/22/release-notes
- https://www.happycoders.eu/java/java-22-features/
