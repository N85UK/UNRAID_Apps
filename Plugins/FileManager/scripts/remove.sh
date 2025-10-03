#!/bin/bash
# File Manager Plugin Removal Script
# This script is called during plugin removal

set -euo pipefail

PLUGIN_NAME="file-manager"
PLUGIN_DIR="/usr/local/emhttp/plugins/$PLUGIN_NAME"
CONFIG_DIR="/boot/config/plugins/$PLUGIN_NAME"
LOG_DIR="/var/log/$PLUGIN_NAME"

echo "Removing File Manager Plugin..."

# Stop any running FileBrowser processes
if pgrep -f "filebrowser" > /dev/null; then
    echo "Stopping FileBrowser processes..."
    pkill -TERM -f "filebrowser" || true
    sleep 2
    # Force kill if still running
    pkill -KILL -f "filebrowser" || true
fi

# Stop systemd service if it exists
if systemctl is-active --quiet file-manager 2>/dev/null; then
    echo "Stopping file-manager service..."
    systemctl stop file-manager || true
    systemctl disable file-manager || true
fi

# Remove systemd service file
if [ -f "/etc/systemd/system/file-manager.service" ]; then
    echo "Removing systemd service file..."
    rm -f "/etc/systemd/system/file-manager.service"
    systemctl daemon-reload || true
fi

# Remove log rotation configuration
if [ -f "/etc/logrotate.d/file-manager" ]; then
    echo "Removing log rotation configuration..."
    rm -f "/etc/logrotate.d/file-manager"
fi

# Remove plugin files
if [ -d "$PLUGIN_DIR" ]; then
    echo "Removing plugin directory: $PLUGIN_DIR"
    rm -rf "$PLUGIN_DIR"
fi

# Remove log files
if [ -d "$LOG_DIR" ]; then
    echo "Removing log directory: $LOG_DIR"
    rm -rf "$LOG_DIR"
fi

# Optionally remove FileBrowser binary (commented out to avoid breaking other uses)
# if [ -f "/usr/local/bin/filebrowser" ]; then
#     echo "Removing FileBrowser binary..."
#     rm -f "/usr/local/bin/filebrowser"
# fi

# Optionally remove configuration (commented out to preserve user settings)
# if [ -d "$CONFIG_DIR" ]; then
#     echo "Removing configuration directory: $CONFIG_DIR"
#     rm -rf "$CONFIG_DIR"
# fi

echo "File Manager Plugin removed successfully"
echo "Note: Configuration files in $CONFIG_DIR have been preserved"
echo "Note: FileBrowser binary has been preserved for potential other uses"

exit 0