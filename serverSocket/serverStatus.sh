#!/bin/bash

# Memoria total, usada e free
free | grep Mem | tr -s ' ' |  cut -d' ' -f2,3,4

# cpu usage
top -bn 1 | awk 'NR>7{s+=$9} END {print s/4}'

# disk size
df -h | head -2 | tail -1 | tr -s ' ' | cut -d' ' -f2,3,4,5

