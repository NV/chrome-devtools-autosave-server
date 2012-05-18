#!/bin/sh

if [[ $OSTYPE == darwin* ]]; then
    launch_agents_dir=$HOME/library/launchagents/
    name='com.chrome.devtools.autosave.launchd'
    filename=$name.plist
    cp -v `dirname $0`/$filename $launch_agents_dir
    launchctl remove $name >/dev/null 2>/dev/null
    launchctl load $launch_agents_dir/$filename
fi
