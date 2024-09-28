#!/bin/bash

java -XX:CRaCCheckpointTo=/crac -jar /app/hello-api.jar&
sleep 10
jcmd /app/hello-api.jar JDK.checkpoint
sleep 10