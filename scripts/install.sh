#!/bin/sh

if [ -d $HOME/Library/LaunchAgents/ -o -d /etc/init ]; then
    echo 'To start autosave on OS launch run:
    npm run-script -g autosave autostart
'
fi
