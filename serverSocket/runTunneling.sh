#!/bin/bash

# verifica se  o tunnel existe se não executa o script para o criar
if [[ $? -ne 0 ]]; then
	sudo killall ssh
	cd /home/linaro/WiFinder-Sensor/serverSocket
	sudo ./expect.exp `cat ConfigSKT.ini | grep "sshaccess" | cut -d" " -f3`
fi