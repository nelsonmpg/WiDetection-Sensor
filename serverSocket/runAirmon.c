#include<stdio.h>       //printf
#include <stdlib.h>

int main(int argc, char *argv[]) {
	char command1[128];
	char command2[128];
	snprintf(command1, sizeof(command1), "sudo ./clearFiles.sh %s", argv[1]);
	// execute command clear files
	system(command1);
	
	// executa o comando para fazer o kill dos processo que 
	// possam estar a utilizar a placa wireless
	system("sudo airmon-ng check kill");
	
	sleep(3);
	snprintf(command2, sizeof(command2), "sudo nohup airodump-ng -w %s/scanNetworks --output-format csv --write-interval 15 wlan0mon > /dev/null 2>&1", argv[1]);
	// execute command Run Airmon
	system(command2);
	
	printf("Start Airmon.\n");

  return 0;
}