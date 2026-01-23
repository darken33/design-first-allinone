# Tasks – Migration Maven → Gradle (double build)

Feature: Support Gradle (in addition to Maven) for build/test/OpenAPI, with Kotlin DSL and version catalog + lockfiles, preserving functional parity.

## Phase 1: Setup

- [x] T001 Create Gradle wrapper in demo/hello/hello-api (gradlew, gradlew.bat, gradle/wrapper/) — v9.1.0
- [x] T002 Add settings.gradle.kts in demo/hello/hello-api/settings.gradle.kts
- [x] T003 Add build.gradle.kts baseline in demo/hello/hello-api/build.gradle.kts — OpenAPI v7.11.0 fixed
- [x] T004 Add version catalog file in demo/hello/hello-api/gradle/libs.versions.toml
- [ ] T005 Enable dependency locking in demo/hello/hello-api/gradle.lockfile — [DEFERRED to Phase 2]
- [x] T006 Update .gitignore for Gradle outputs in demo/hello/hello-api/.gitignore

## Phase 2: Foundational

- [x] T007 Align Java toolchain to 25 in demo/hello/hello-api/build.gradle.kts
- [x] T008 Map Maven deps to catalog versions in demo/hello/hello-api/gradle/libs.versions.toml
- [x] T009 Configure Gradle plugins (java, org.springframework.boot, io.spring.dependency-management) in demo/hello/hello-api/build.gradle.kts
- [x] T010 Configure test platform (JUnit 5) and reports in demo/hello/hello-api/build.gradle.kts
- [x] T011 Configure openapi generator plugin/task (org.openapi.generator) in demo/hello/hello-api/build.gradle.kts — v7.11.0
- [x] T012 Add generated sources to sourceSets in demo/hello/hello-api/build.gradle.kts
- [x] T013 Document Gradle commands in .specify/DEVELOPER_GUIDE.md — Phase 1 comprehensive guide added
- [ ] T014 Update docs parity section in .specify/RETROSPECIFICATION.md — [DEFERRED to Phase 2]

## Phase 3: User Story 1 – Build JAR with Gradle (P1)

Goal: `./gradlew clean build` produces a runnable JAR equivalent to Maven.

Independent Test Criteria:
- Run `./gradlew clean build` on a machine without Maven → JAR exists in build/libs and boots.

- [ ] T015 [US1] Set group/version, bootJar configuration in demo/hello/hello-api/build.gradle.kts
- [ ] T016 [US1] Verify bootable JAR starts locally via run script in demo/hello/hello-api/src/scripts/run-gradle-jar.sh
- [ ] T017 [P] [US1] Add README snippet for run command in .specify/DEVELOPER_GUIDE.md

## Phase 4: User Story 2 – Tests via Gradle (P1)

Goal: `./gradlew test` runs the exact same test suite and produces JUnit XML.

Independent Test Criteria:
- `./gradlew test` exits 0 and generates reports under build/test-results/test.

- [ ] T018 [US2] Add test dependencies alignment in demo/hello/hello-api/build.gradle.kts
- [ ] T019 [P] [US2] Ensure JUnit platform enabled and reports configured in demo/hello/hello-api/build.gradle.kts
- [ ] T020 [US2] Validate parity by comparing `mvn test` vs `./gradlew test` in demo/hello/hello-api

## Phase 5: User Story 3 – OpenAPI generation (P2)

Goal: `./gradlew openapiGenerate` regenerates sources into build/generated and compiles.

Independent Test Criteria:
- After generation, `./gradlew build` compiles without manual intervention.

- [ ] T021 [US3] Configure openapiGenerate input/output paths in demo/hello/hello-api/build.gradle.kts
- [ ] T022 [P] [US3] Wire compileJava dependsOn openapiGenerate in demo/hello/hello-api/build.gradle.kts
- [ ] T023 [US3] Update .gitignore to exclude build/generated in demo/hello/hello-api/.gitignore

## Phase 6: User Story 4 – Optional CI job (P2)

Goal: Add an optional CI job to run `./gradlew clean build` without impacting Maven pipeline.

Independent Test Criteria:
- CI job runs successfully, independent from Maven stages.

- [ ] T024 [US4] Add Gradle stage in Jenkinsfile (optional, manual trigger) in demo/hello/hello-api/jenkinsfile
- [ ] T025 [P] [US4] Publish Gradle test reports in Jenkins in demo/hello/hello-api/jenkinsfile

## Final Phase: Polish & Cross-Cutting

- [ ] T026 Add notes on target/ vs build/ paths to avoid IDE confusion in .specify/DEVELOPER_GUIDE.md
- [ ] T027 Add troubleshooting tips (toolchains, wrapper permissions) in .specify/DEVELOPER_GUIDE.md
- [ ] T028 Verify no functional diffs between Maven vs Gradle builds (integration test) in demo/hello/hello-api

## Dependencies

- Complete Phase 1 before Phase 2.
- US1 and US2 depend on Phase 2 tasks T007–T012.
- US3 depends on T011–T012.
- US4 can start after US1 (build success) and T010 (test reports) are done.

## Parallel Execution Examples

- [P] T017 (docs) can run in parallel with T016.
- [P] T019 (JUnit reports) can run in parallel with T018.
- [P] T022 (dependsOn wiring) can run parallel to T021 once paths known.
- [P] T025 (CI report publish) can run parallel to T024 after stage scaffolded.

## Implementation Strategy (MVP first)

- MVP = US1 + US2 (build + tests). Defer US3 (OpenAPI task) and US4 (CI) to subsequent phases.
- Start with wrapper + Kotlin DSL + Java toolchain + dependency alignment.
- Ensure `./gradlew clean build` and `./gradlew test` parity before enabling OpenAPI + CI.
