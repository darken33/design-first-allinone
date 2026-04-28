# Configuration JVM pour l'application HelloAPI
# Ce fichier peut être utilisé avec Maven ou directement avec java

# Paramètres de mémoire
JAVA_OPTS="-Xmx1g -Xms512m"

# Garbage Collector G1 (recommandé pour Java 11+)
JAVA_OPTS="$JAVA_OPTS -XX:+UseG1GC"
JAVA_OPTS="$JAVA_OPTS -XX:G1HeapRegionSize=16m"
JAVA_OPTS="$JAVA_OPTS -XX:MaxGCPauseMillis=100"

# Optimisations
JAVA_OPTS="$JAVA_OPTS -XX:+UseStringDeduplication"
JAVA_OPTS="$JAVA_OPTS -XX:+OptimizeStringConcat"

# Monitoring et debugging
JAVA_OPTS="$JAVA_OPTS -XX:+HeapDumpOnOutOfMemoryError"
JAVA_OPTS="$JAVA_OPTS -XX:HeapDumpPath=/tmp/"

# Profils Spring
JAVA_OPTS="$JAVA_OPTS -Dspring.profiles.active=dev"

# Pour utiliser ces paramètres avec Maven :
# mvn spring-boot:run -Dspring-boot.run.jvmArguments="$JAVA_OPTS"

# Pour utiliser avec java directement :
# java $JAVA_OPTS -jar target/hello-api-1.0.1-SNAPSHOT.jar

export JAVA_OPTS