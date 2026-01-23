#!/usr/bin/env bash
set -euo pipefail

# Simple helper to build and run the Gradle JAR locally
# Usage: ./src/scripts/run-gradle-jar.sh

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
PROJECT_DIR=$(cd "$SCRIPT_DIR/.." && pwd)

cd "$PROJECT_DIR"

echo "Building JAR with Gradle..."
./gradlew clean build -x test

JAR=$(ls build/libs/hello-api-*-SNAPSHOT.jar | head -n1)
if [[ -z "$JAR" ]]; then
  echo "JAR not found under build/libs" >&2
  exit 1
fi

echo "Starting JAR: $JAR"
exec java -jar "$JAR"
