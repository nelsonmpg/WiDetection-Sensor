#!/bin/bash

# Diretoria para iniciar o servidor http
cd /home/linaro/WiFinder-Sensor/serverSocket
node main.js

# atualiza as alteracoes do repositorio
cd /home/linaro/WiFinder-Sensor
git pull