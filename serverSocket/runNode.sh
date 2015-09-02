#!/bin/bash

# diretoria do projeto para se fazer o clone
/home/linaro/WiFinder-Sensor
git pull https://github.com/ruifgdias/WiFinder-Sensor

# Diretoria para iniciar o servidor http
cd /home/linaro/WiFinder-Sensor/serverSocket
node main.js