#!/bin/bash
# File Manager Plugin Installation Script

set -euo pipefail

PLUGIN_NAME="file-manager"
PLUGIN_DIR="/usr/local/emhttp/plugins/$PLUGIN_NAME"
CONFIG_DIR="/boot/config/plugins/$PLUGIN_NAME"
LOG_DIR="/var/log/$PLUGIN_NAME"

echo "Starting File Manager Plugin installation..."

# Create required directories
mkdir -p "$PLUGIN_DIR" 2>/dev/null || true
mkdir -p "$CONFIG_DIR" 2>/dev/null || true
mkdir -p "$LOG_DIR" 2>/dev/null || true

# Set proper permissions
chmod 755 "$PLUGIN_DIR" 2>/dev/null || true
chmod 755 "$CONFIG_DIR" 2>/dev/null || true
chmod 755 "$LOG_DIR" 2>/dev/null || true

# Create default configuration
CONFIG_FILE="$CONFIG_DIR/settings.cfg"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Creating default configuration..."
    cat > "$CONFIG_FILE" << 'EOL'
service="enabled"
port="8080"
logging="info"
EOL
    chmod 644 "$CONFIG_FILE"
fi

echo "File Manager Plugin installation completed"
echo ""
echo "Next steps:"
echo "1. Go to Settings -> File Manager"
echo "2. Click 'Install FileBrowser Binary'"
echo "3. Click 'Setup Admin User'"
echo "4. Click 'Start Service'"
echo ""
echo "Default access: http://your-server:8080"

exit 0