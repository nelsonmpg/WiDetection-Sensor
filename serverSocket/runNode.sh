#!/bin/bash

# alteracao das permicoes dos scripts
cd /home/linaro/WiFinder-Sensor
sudo chmod 755 ./*.sh
sudo chmod 755 ./*.exp

# Diretoria para iniciar o servidor http
cd /home/linaro/WiFinder-Sensor/serverSocket
node main.js

# atualiza as alteracoes do repositorio
cd /home/linaro/WiFinder-Sensor
git pull