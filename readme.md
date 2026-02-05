# winzo kwin script

Adds a shortcut to set the active window to almost maximized. Pressing the shortcut again will restore the original size and position.
Changing the window size or position when almost maximized will restore the original size on drag start.

## development

run `sh ./install.sh` to copy the plugin into the kwin scripts folder. This removes any pre-existing scripts with the same name. It also disables and enables the script to ensure it is reinitialized.

run `sh ./inspect-logs.sh` to watch kwin script logs.
