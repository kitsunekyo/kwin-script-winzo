#!/usr/bin/env bash
# Fail fast and safely:
# -e  exit immediately if any command returns a non-zero status
# -u  treat use of unset variables as an error
# -o pipefail  make a pipeline fail if any command in it fails (not just the last)
set -euo pipefail

PLUGIN_DIR="${HOME}/.local/share/kwin/scripts/winzo"
PACKAGE_PATH="${HOME}/code/kwin-winzo"

rm -rf "$PLUGIN_DIR"

kpackagetool6 --type=KWin/Script -i "$PACKAGE_PATH"

kpackagetool6 --type=KWin/Script --list

qdbus org.kde.KWin /Scripting unloadScript "winzo"
qdbus org.kde.KWin /Scripting start


# reload alternative
# kwriteconfig6 --file kwinrc --group Plugins --key myscriptEnabled false
# qdbus org.kde.KWin /KWin reconfigure
# kwriteconfig6 --file kwinrc --group Plugins --key myscriptEnabled true
# qdbus org.kde.KWin /KWin reconfigure
