/**
 * Jest configuration for EDA (Event-Driven Architecture) integration tests.
 * Starts a real Kafka Docker container via globalSetup before the suite runs.
 *
 * Usage:
 *   npm run test:events
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/hello-events.spec.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        module: 'CommonJS',
        target: 'ES2022',
      },
    }],
  },
  globalSetup: '<rootDir>/tests/setup-kafka.js',
  globalTeardown: '<rootDir>/tests/teardown-kafka.js',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 30000,
};
