#!/bin/bash
# File Manager Plugin Installation Script
# This script is called during plugin installation

set -euo pipefail

PLUGIN_NAME="file-manager"
PLUGIN_DIR="/usr/local/emhttp/plugins/$PLUGIN_NAME"
CONFIG_DIR="/boot/config/plugins/$PLUGIN_NAME"
LOG_DIR="/var/log/$PLUGIN_NAME"

echo "Installing File Manager Plugin..."

# Create required directories
mkdir -p "$PLUGIN_DIR"
mkdir -p "$CONFIG_DIR/config"
mkdir -p "$LOG_DIR"

# Set proper permissions
chmod 755 "$PLUGIN_DIR"
chmod 755 "$CONFIG_DIR"
chmod 755 "$LOG_DIR"

# Install FileBrowser binary if not present
if [ ! -f /usr/local/bin/filebrowser ]; then
    echo "Installing FileBrowser binary..."
    
    ARCH=$(uname -m)
    case $ARCH in
        x86_64)
            FB_ARCH="linux-amd64"
            ;;
        aarch64)
            FB_ARCH="linux-arm64"
            ;;
        armv7l)
            FB_ARCH="linux-armv7"
            ;;
        *)
            echo "Error: Unsupported architecture: $ARCH"
            exit 1
            ;;
    esac
    
    FB_VERSION="v2.44.0"
    FB_URL="https://github.com/filebrowser/filebrowser/releases/download/${FB_VERSION}/linux-${FB_ARCH}-filebrowser.tar.gz"
    
    echo "Downloading FileBrowser ${FB_VERSION} for linux-${FB_ARCH}..."
    if wget -O /tmp/filebrowser.tar.gz "$FB_URL"; then
        tar -xzf /tmp/filebrowser.tar.gz -C /tmp/
        mv /tmp/filebrowser /usr/local/bin/filebrowser
        chmod +x /usr/local/bin/filebrowser
        rm -f /tmp/filebrowser.tar.gz
        echo "FileBrowser binary installed successfully"
    else
        echo "Warning: Failed to download FileBrowser binary"
        echo "You may need to install it manually"
    fi
else
    echo "FileBrowser binary already exists"
fi

# Create default configuration if not exists
CONFIG_FILE="$CONFIG_DIR/config/settings.ini"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Creating default configuration..."
    cat > "$CONFIG_FILE" << 'EOL'
[filemanager]
enabled=yes
port=8080
log_level=info

[security]
rate_limit=120
rate_window=60000
audit_enabled=yes

[paths]
virtual_roots_enabled=yes

[ui]
theme=auto
locale=en
EOL
    chmod 644 "$CONFIG_FILE"
fi

# Create systemd service file for auto-start (optional)
SERVICE_FILE="/etc/systemd/system/file-manager.service"
if [ ! -f "$SERVICE_FILE" ] && command -v systemctl >/dev/null 2>&1; then
    echo "Creating systemd service..."
    cat > "$SERVICE_FILE" << 'EOL'
[Unit]
Description=File Manager Plugin Service
After=network.target

[Service]
Type=simple
User=root
Group=root
ExecStart=/usr/local/bin/filebrowser --config /boot/config/plugins/file-manager/config/filebrowser.json
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOL
    systemctl daemon-reload
fi

# Install Node.js dependencies if in development mode
if [ -f "$PLUGIN_DIR/package.json" ]; then
    echo "Installing Node.js dependencies..."
    cd "$PLUGIN_DIR"
    if command -v npm >/dev/null 2>&1; then
        npm install --production
    else
        echo "Warning: npm not found, skipping dependency installation"
    fi
fi

# Create log rotation configuration
LOGROTATE_FILE="/etc/logrotate.d/file-manager"
if [ ! -f "$LOGROTATE_FILE" ]; then
    echo "Setting up log rotation..."
    cat > "$LOGROTATE_FILE" << 'EOL'
/var/log/file-manager/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
}
EOL
fi

# Set up proper ownership
chown -R root:root "$PLUGIN_DIR"
chown -R root:root "$CONFIG_DIR"
chown -R root:root "$LOG_DIR"

# Start the FileBrowser service if binary is available
if [ -f /usr/local/bin/filebrowser ]; then
    echo "Starting FileBrowser service..."
    # Kill any existing instances
    pkill -f filebrowser 2>/dev/null || true
    
    # Create FileBrowser config if it doesn't exist
    FB_CONFIG="$CONFIG_DIR/config/filebrowser.json"
    if [ ! -f "$FB_CONFIG" ]; then
        echo "Creating FileBrowser configuration..."
        cat > "$FB_CONFIG" << 'EOL'
{
  "port": 8080,
  "baseURL": "",
  "address": "0.0.0.0",
  "log": "stdout",
  "database": "/boot/config/plugins/file-manager/config/filebrowser.db",
  "root": "/mnt"
}
EOL
    fi
    
    # Start FileBrowser in background
    nohup /usr/local/bin/filebrowser --config "$FB_CONFIG" > "$LOG_DIR/filebrowser.log" 2>&1 &
    echo "FileBrowser service started on port 8080"
else
    echo "Warning: FileBrowser binary not found, service not started"
fi

echo "File Manager Plugin installation completed successfully"
echo "Access the file manager through Settings -> File Manager"
echo "Default port: 8080"

exit 0