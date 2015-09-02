#!/bin/bash

ps auxf |grep 'air' |`awk '{ print "kill " $2 }'`

ps auxf |grep 'mainSKT' |`awk '{ print "kill " $2 }'`

ps auxf |grep './lib/socket' |`awk '{ print "kill " $2 }'`

echo "Stop All Process!!!"
