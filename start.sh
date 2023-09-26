#!/bin/bash

clear
while :
do
    ts-node index.ts
    echo "\e[0;90m┌──────────────────────┐"
    echo "│ \e[1;91mCrash! \e[0;97mRestarting...\e[0m \e[0;90m│"
    echo "└──────────────────────┘\e[0m"
done
