// Jest globalTeardown: stops and removes the Kafka test container after the EDA integration test suite
const { execSync } = require('child_process');

module.exports = async function teardown() {
  console.log('\n[Kafka] Stopping test Kafka container...');
  execSync('docker compose -f docker-compose.test.yml down', {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
  console.log('[Kafka] Container stopped.\n');
};
