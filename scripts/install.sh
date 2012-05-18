#!/bin/sh

if [[ $OSTYPE == darwin* ]]; then
	launch_agents_dir=$HOME/Library/LaunchAgents/
	name='com.chrome.devtools.autosave.launchd.plist'
	cp -v `dirname $0`/$name $launch_agents_dir
    launchctl load $launch_agents_dir/$name
fi
