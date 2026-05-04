// Jest globalSetup: starts the Kafka test container before the EDA integration test suite
const { execSync } = require('child_process');

module.exports = async function setup() {
  console.log('\n[Kafka] Starting test Kafka container...');
  execSync('docker compose -f docker-compose.test.yml up -d --wait', {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
  console.log('[Kafka] Container ready.\n');
  // Expose broker address to test processes via env var
  process.env.KAFKA_BROKERS = 'localhost:9093';
};
