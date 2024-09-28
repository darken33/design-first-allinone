#!/bin/sh
docker-compose start
echo KAFKA_BOOTSTRAP_SERVER=broker:9092
echo KAFKA_CONTROL_CENTER_URL=http://0.0.0.0:9021
echo KAFKA_SCHEMA_REGISTRY_URL=http://0.0.0.0:8090
