plugins {
    id("java")
    id("org.springframework.boot") version "4.0.0-M1"
    id("io.spring.dependency-management") version "1.1.6"
    id("org.openapi.generator") version "7.11.0"
}

springBoot {
    mainClass.set("com.sqli.pbousquet.helloapi.HelloApiApplication")
}

group = "com.sqli.pbousquet"
version = "1.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(25))
    }
}

repositories {
    mavenCentral()
}

// Enable dependency locking for reproducible builds
dependencyLocking {
    lockAllConfigurations()
}

dependencies {
    implementation(libs.spring.boot.starter.web)
    implementation(libs.spring.boot.starter.security)
    implementation(libs.spring.boot.starter.validation)
    implementation(libs.spring.boot.starter.actuator)

    implementation(libs.slf4j.api)

    implementation(libs.springdoc.openapi.ui)
    implementation(libs.springdoc.openapi.common)
    implementation(libs.jackson.databind.nullable)

    implementation(libs.hibernate.validator)
    
    // Explicit SnakeYAML to match Maven resolution
    implementation("org.yaml:snakeyaml:2.4")

    compileOnly(libs.lombok)
    annotationProcessor(libs.lombok)

    testImplementation(libs.spring.boot.starter.test)
    testImplementation(libs.junit.jupiter.engine)
    testImplementation(libs.junit.jupiter.params)
    testImplementation(libs.junit.vintage.engine)
    testImplementation(libs.mockito.core)
}

tasks.test {
    useJUnitPlatform()
}

// OpenAPI generation configuration (parity with Maven)
openApiGenerate {
    generatorName.set("spring")
    inputSpec.set("${project.projectDir}/../hello.yaml")
    outputDir.set(layout.buildDirectory.dir("generated-sources").get().asFile.path)
    apiPackage.set("com.sqli.pbousquet.helloapi.generated.api.server")
    modelPackage.set("com.sqli.pbousquet.helloapi.generated.api.model")
    configOptions.set(mapOf(
        "useTags" to "true",
        "useSpringBoot3" to "true",
        "useSpringController" to "true",
        "useBeanValidation" to "true",
        "performBeanValidation" to "true",
        "hideGenerationTimestamp" to "true",
        "dateLibrary" to "java8",
        "delegatePattern" to "true"
    ))
    generateApiDocumentation.set(false)
    generateModelDocumentation.set(false)
    generateApiTests.set(false)
    generateModelTests.set(false)
}

sourceSets {
    named("main") {
        java.srcDir(layout.buildDirectory.dir("generated-sources/src/main/java"))
        resources.srcDir(layout.buildDirectory.dir("generated-sources/src/main/resources"))
    }
}

tasks.named("compileJava") {
    dependsOn("openApiGenerate")
}

tasks.named("processResources") {
    dependsOn("openApiGenerate")
}
