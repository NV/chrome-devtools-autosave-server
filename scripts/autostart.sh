#!/bin/sh

if [ -d "$HOME/Library/LaunchAgents/" ]; then
    # Mac OS X
    launch_agents_dir="$HOME/Library/LaunchAgents/"
    name='com.chrome.devtools.autosave.launchd'
    filename=$name.plist
    cp -v `dirname $0`/$filename "$launch_agents_dir"
    launchctl remove $name >/dev/null 2>/dev/null
    launchctl load "$launch_agents_dir/$filename"
elif [ -d /etc/init ]; then
    # Ubuntu
    cp -v `dirname $0`/autosave.conf /etc/init/
    start autosave
else
    echo 'Unsupported platform'
    exit 1
fi
