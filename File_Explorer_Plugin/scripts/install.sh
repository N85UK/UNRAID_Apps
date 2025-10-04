#!/bin/bash
set -e

mkdir -p /boot/config/plugins/file-explorer
cp -R "$(dirname "$0")/.." /usr/local/emhttp/plugins/file-explorer || true

# Ensure the FileBrowser binary is installed
if [ ! -x /usr/local/bin/filebrowser ]; then
  echo "FileBrowser binary not found. Please install via the plugin UI or run the installer."
fi

echo "Install script finished"
