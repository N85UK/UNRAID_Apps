#!/bin/bash
##
# ExplorerX Installation Script
# Runs during plugin installation to set up directories and configuration
##

set -euo pipefail

PLUGIN_NAME="explorerx"
PLUGIN_DIR="/usr/local/emhttp/plugins/$PLUGIN_NAME"
CONFIG_DIR="/boot/config/plugins/$PLUGIN_NAME"
LOG_DIR="/var/log/$PLUGIN_NAME"
TMP_DIR="/tmp/$PLUGIN_NAME"

echo "=========================================="
echo "ExplorerX Installation Script"
echo "=========================================="

# Create required directories
echo "Creating directories..."
mkdir -p "$PLUGIN_DIR" 2>/dev/null || true
mkdir -p "$CONFIG_DIR" 2>/dev/null || true
mkdir -p "$LOG_DIR" 2>/dev/null || true
mkdir -p "$TMP_DIR" 2>/dev/null || true

# Set proper permissions
echo "Setting permissions..."
chmod 755 "$PLUGIN_DIR" 2>/dev/null || true
chmod 755 "$CONFIG_DIR" 2>/dev/null || true
chmod 755 "$LOG_DIR" 2>/dev/null || true
chmod 1777 "$TMP_DIR" 2>/dev/null || true

# Ensure plugin files are executable
if [ -d "$PLUGIN_DIR/scripts" ]; then
    chmod +x "$PLUGIN_DIR/scripts"/*.sh 2>/dev/null || true
fi

# Create default configuration if not exists
CONFIG_FILE="$CONFIG_DIR/settings.cfg"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Creating default configuration..."
    cat > "$CONFIG_FILE" << 'EOFCONFIG'
# ExplorerX Configuration
# Created: $(date)

# Security: Default root path (do not modify unless you know what you're doing)
ROOT_PATH=/mnt

# Features
ENABLE_ZIP=true
ENABLE_CHECKSUMS=true
ENABLE_PREVIEWS=true
ENABLE_BULK_OPS=true

# Background task limits
MAX_CONCURRENT_TASKS=3
TASK_TIMEOUT=3600

# UI preferences
DEFAULT_VIEW=list
SHOW_HIDDEN_FILES=false
DUAL_PANE_DEFAULT=false

# Logging
LOG_LEVEL=info
LOG_RETENTION_DAYS=7
EOFCONFIG
    chmod 644 "$CONFIG_FILE"
    echo "✓ Configuration created"
fi

# Initialize task queue
QUEUE_FILE="$CONFIG_DIR/queue.json"
if [ ! -f "$QUEUE_FILE" ]; then
    echo '{"tasks":[],"version":"0.1.1"}' > "$QUEUE_FILE"
    chmod 644 "$QUEUE_FILE"
    echo "✓ Task queue initialized"
fi

# Create log file
LOG_FILE="$LOG_DIR/explorerx.log"
if [ ! -f "$LOG_FILE" ]; then
    touch "$LOG_FILE"
    chmod 644 "$LOG_FILE"
    echo "[$(date)] ExplorerX installed" >> "$LOG_FILE"
fi

# Verify PHP is available
if ! command -v php &> /dev/null; then
    echo "WARNING: PHP not found. Plugin may not function correctly."
else
    PHP_VERSION=$(php -r 'echo PHP_VERSION;')
    echo "✓ PHP $PHP_VERSION detected"
fi

# Check for required PHP extensions
echo "Checking PHP extensions..."
REQUIRED_EXTS=("json" "zip")
MISSING_EXTS=()

for ext in "${REQUIRED_EXTS[@]}"; do
    if ! php -m | grep -qi "^$ext$"; then
        MISSING_EXTS+=("$ext")
    fi
done

if [ ${#MISSING_EXTS[@]} -gt 0 ]; then
    echo "WARNING: Missing PHP extensions: ${MISSING_EXTS[*]}"
    echo "Some features may not work correctly."
else
    echo "✓ All required PHP extensions available"
fi

# Create a test file to verify write permissions
TEST_FILE="$TMP_DIR/test_write_$$"
if echo "test" > "$TEST_FILE" 2>/dev/null; then
    rm -f "$TEST_FILE"
    echo "✓ Write permissions verified"
else
    echo "WARNING: Cannot write to $TMP_DIR"
fi

echo ""
echo "=========================================="
echo "ExplorerX Installation Complete!"
echo "=========================================="
echo ""
echo "Access ExplorerX via: Tools → ExplorerX"
echo ""
echo "Configuration:"
echo "  Config file: $CONFIG_FILE"
echo "  Log file: $LOG_FILE"
echo "  Queue file: $QUEUE_FILE"
echo ""
echo "For support and documentation:"
echo "  https://github.com/N85UK/UNRAID_Apps"
echo "=========================================="

exit 0
