#!/bin/bash
# File Manager Plugin Removal Script

PLUGIN_NAME="file-manager"
PLUGIN_DIR="/usr/local/emhttp/plugins/$PLUGIN_NAME"
CONFIG_DIR="/boot/config/plugins/$PLUGIN_NAME"
LOG_DIR="/var/log/$PLUGIN_NAME"

echo "Removing File Manager Plugin..."

# Stop FileBrowser service
if pgrep -f "filebrowser" > /dev/null; then
    echo "Stopping FileBrowser service..."
    pkill -f "filebrowser"
    sleep 2
fi

# Remove FileBrowser binary
if [ -f /usr/local/bin/filebrowser ]; then
    echo "Removing FileBrowser binary..."
    rm -f /usr/local/bin/filebrowser
fi

# Clean up directories (keep config for reinstall)
echo "Cleaning up plugin files..."
rm -rf "$PLUGIN_DIR" 2>/dev/null || true
rm -rf "$LOG_DIR" 2>/dev/null || true

echo "File Manager Plugin removed successfully"
echo "Configuration files preserved in $CONFIG_DIR"

exit 0