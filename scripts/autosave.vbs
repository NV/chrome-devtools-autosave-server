'''''' place this in your windows startup folder.

Set WinScriptHost = CreateObject("WScript.Shell")
WinScriptHost.Run Chr(34) & "autosave" & Chr(34), 0
Set WinScriptHost = Nothing