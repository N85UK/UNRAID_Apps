#!/usr/bin/env bash
# Build a proper UNRAID plugin .plg file by packaging the filemanager module
# Usage: ./dev/build-plg.sh [--vendor] [--version VERSION]
#   --vendor  : vendor node_modules into the plugin so it is self-contained
#   --version : specify version (default: current date)

set -euo pipefail

BASE_DIR=$(cd "$(dirname "$0")/.." && pwd)
OUT_NAME="file-manager.plg"
TMP_DIR=$(mktemp -d)
PLUGIN_DIR="$TMP_DIR/plugins/file-manager"
VENDOR=false
VERSION=""

# Parse args
for arg in "$@"; do
  case "$arg" in
    --vendor) VENDOR=true ;;
    --version) shift; VERSION="$1" ;;
    *) echo "Unknown arg: $arg" ; exit 1 ;;
  esac
done

# Set version if not provided
if [ -z "$VERSION" ]; then
  VERSION=$(date +%Y.%m.%d)
fi

echo "Building File Manager Plugin v$VERSION"

# Create plugin structure
mkdir -p "$PLUGIN_DIR"
mkdir -p "$PLUGIN_DIR/webgui"
mkdir -p "$PLUGIN_DIR/scripts"
mkdir -p "$PLUGIN_DIR/config"

# Copy core module files
echo "Copying module files..."
if [ -d "$BASE_DIR/src/unraid-api/modules/filemanager" ]; then
  mkdir -p "$PLUGIN_DIR/modules"
  rsync -a "$BASE_DIR/src/unraid-api/modules/filemanager/" "$PLUGIN_DIR/modules/filemanager/"
fi

# Copy webGUI files
echo "Copying webGUI files..."
if [ -d "$BASE_DIR/webgui" ]; then
  rsync -a "$BASE_DIR/webgui/" "$PLUGIN_DIR/"
fi

# Copy scripts
echo "Copying scripts..."
if [ -d "$BASE_DIR/scripts" ]; then
  cp "$BASE_DIR/scripts/"*.sh "$PLUGIN_DIR/scripts/"
  chmod +x "$PLUGIN_DIR/scripts/"*.sh
fi

# Build TypeScript if dist doesn't exist
if [ ! -d "$BASE_DIR/dist" ]; then
  echo "Building TypeScript..."
  cd "$BASE_DIR"
  npm run build
fi

# Copy compiled JavaScript
echo "Copying compiled files..."
if [ -d "$BASE_DIR/dist" ]; then
  rsync -a "$BASE_DIR/dist/" "$PLUGIN_DIR/dist/"
fi

# Optionally vendor node_modules to make the plg self-contained
if [ "$VENDOR" = true ]; then
  echo "Vendor mode: installing dependencies and vendoring node_modules into plugin"
  
  # Run npm install/ci in the file-manager folder
  pushd "$BASE_DIR" >/dev/null
  if [ -f package-lock.json ]; then
    echo "Found package-lock.json, running npm ci"
    npm ci --no-audit --no-fund --omit=dev
  else
    echo "No package-lock.json, running npm install"
    npm install --no-audit --no-fund --omit=dev
  fi
  popd >/dev/null

  # Copy node_modules into plugin path
  echo "Copying node_modules into plugin..."
  mkdir -p "$PLUGIN_DIR/node_modules"
  
  if [ -d "$BASE_DIR/node_modules" ]; then
    SRC_NODE_MODULES="$BASE_DIR/node_modules"
  else
    # Check workspace root
    WORKSPACE_ROOT=$(cd "$BASE_DIR/.." && pwd)
    if [ -d "$WORKSPACE_ROOT/node_modules" ]; then
      SRC_NODE_MODULES="$WORKSPACE_ROOT/node_modules"
    else
      echo "No node_modules found; something went wrong"
      exit 1
    fi
  fi
  
  rsync -a --delete "$SRC_NODE_MODULES/" "$PLUGIN_DIR/node_modules/"
  echo "Vendored $(find "$PLUGIN_DIR/node_modules" -name "package.json" | wc -l) packages"
fi

# Create package.json for the plugin
echo "Creating plugin package.json..."
cat > "$PLUGIN_DIR/package.json" << EOF
{
  "name": "file-manager",
  "version": "$VERSION",
  "description": "UNRAID File Manager Plugin",
  "main": "dist/index.js",
  "scripts": {
    "start": "node dist/index.js"
  },
  "keywords": ["unraid", "file-manager", "plugin"],
  "author": "Paul McCann",
  "license": "GPL-2.0"
}
EOF

# Create plugin configuration files
echo "Creating plugin configuration..."

# Main plugin manifest
cat > "$PLUGIN_DIR/plugin.cfg" << EOF
name=file-manager
version=$VERSION
description=File Manager integration (FileBrowser) for UNRAID
author=Paul McCann
category=Utilities
support=https://github.com/yourusername/unraid-file-manager/issues
icon=icons/file-manager.png
min=6.12.0
max=7.0.0
EOF

# Default settings
cat > "$PLUGIN_DIR/config/settings.ini" << EOF
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
EOF

# Create installation instructions
cat > "$PLUGIN_DIR/README.md" << EOF
# UNRAID File Manager Plugin

A modern web-based file manager for UNRAID servers.

## Features

- Secure authentication via UNRAID API
- Virtual root support for easy navigation
- Rate limiting and audit logging
- Responsive web interface
- File upload/download/management
- Integration with UNRAID theme system

## Installation

1. Copy the .plg file to your UNRAID server
2. Install via Plugins → Install Plugin
3. Access via Settings → File Manager

## Configuration

Configuration files are stored in:
- \`/boot/config/plugins/file-manager/config/settings.ini\`

## Support

For issues and support, visit:
https://github.com/yourusername/unraid-file-manager/issues
EOF

# Create proper XML plugin manifest
echo "Creating XML plugin manifest..."
cat > "$TMP_DIR/file-manager.plg" << 'EOF'
<?xml version='1.0' standalone='yes'?>
<!DOCTYPE PLUGIN [
<!ENTITY name      "file-manager">
<!ENTITY author    "Paul McCann">
<!ENTITY version   "VERSION_PLACEHOLDER">
<!ENTITY md5       "MD5_PLACEHOLDER">
<!ENTITY launch    "Settings/FileManager">
<!ENTITY gitURL    "https://github.com/N85UK/UnRiaid_Apps">
<!ENTITY pluginURL "&gitURL;/raw/main/Plugins/File%20Manager/file-manager.plg">
<!ENTITY support   "&gitURL;/issues">
]>

<PLUGIN name="&name;" author="&author;" version="&version;" launch="&launch;" pluginURL="&pluginURL;" support="&support;" min="6.12.0">

<CHANGES>
###VERSION_PLACEHOLDER
- Initial release of UNRAID File Manager plugin
- NestJS-based file manager with FileBrowser backend
- Secure authentication via UNRAID API
- Rate limiting and audit logging
- Virtual root support for user shares, cache, and disks
- Admin diagnostics and control interface
- WebSocket support for real-time updates
- Integration with UNRAID theme system
</CHANGES>

<FILE Run="/bin/bash">
<INLINE>
# Remove old plugin files
rm -rf /usr/local/emhttp/plugins/&name;
rm -rf /boot/config/plugins/&name;

# Stop any running services
if pgrep -f "filebrowser" > /dev/null; then
  pkill -f "filebrowser"
fi
</INLINE>
</FILE>

<FILE Name="/boot/config/plugins/&name;/&name;-&version;.tar.xz" Run="upgradepkg --install-new">
<URL>&gitURL;/raw/main/Plugins/File%20Manager/&name;-&version;.tar.xz</URL>
<MD5>&md5;</MD5>
</FILE>

<FILE Run="/bin/bash">
<INLINE>
# Extract and install plugin
cd /usr/local/emhttp/plugins
tar -xf /boot/config/plugins/&name;/&name;-&version;.tar.xz

# Run installation script
if [ -f /usr/local/emhttp/plugins/&name;/scripts/install.sh ]; then
  bash /usr/local/emhttp/plugins/&name;/scripts/install.sh
fi

echo "File Manager plugin installed successfully"
</INLINE>
</FILE>

<FILE Run="/bin/bash" Method="remove">
<INLINE>
# Run removal script
if [ -f /usr/local/emhttp/plugins/&name;/scripts/remove.sh ]; then
  bash /usr/local/emhttp/plugins/&name;/scripts/remove.sh
fi

echo "File Manager plugin removed"
</INLINE>
</FILE>

</PLUGIN>
EOF

# Replace placeholders in XML (macOS compatible)
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS sed
  sed -i '' "s/VERSION_PLACEHOLDER/$VERSION/g" "$TMP_DIR/file-manager.plg"
else
  # Linux sed
  sed -i "s/VERSION_PLACEHOLDER/$VERSION/g" "$TMP_DIR/file-manager.plg"
fi

# Create tar.xz archive of plugin files
echo "Creating plugin archive..."
pushd "$TMP_DIR" >/dev/null
tar -caf "$BASE_DIR/file-manager-$VERSION.tar.xz" plugins/
popd >/dev/null

# Calculate MD5 and update XML (macOS compatible)
if command -v md5sum >/dev/null 2>&1; then
  ARCHIVE_MD5=$(md5sum "$BASE_DIR/file-manager-$VERSION.tar.xz" | cut -d' ' -f1)
elif command -v md5 >/dev/null 2>&1; then
  # macOS md5 command
  ARCHIVE_MD5=$(md5 -q "$BASE_DIR/file-manager-$VERSION.tar.xz")
else
  echo "Warning: Neither md5sum nor md5 command found"
  ARCHIVE_MD5="CALCULATE_MD5_MANUALLY"
fi

if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS sed
  sed -i '' "s/MD5_PLACEHOLDER/$ARCHIVE_MD5/g" "$TMP_DIR/file-manager.plg"
else
  # Linux sed
  sed -i "s/MD5_PLACEHOLDER/$ARCHIVE_MD5/g" "$TMP_DIR/file-manager.plg"
fi

# Copy final .plg file
cp "$TMP_DIR/file-manager.plg" "$BASE_DIR/$OUT_NAME"

# Cleanup
rm -rf "$TMP_DIR"

echo ""
echo "✅ Built UNRAID Plugin:"
echo "   📦 Archive: file-manager-$VERSION.tar.xz"
echo "   📄 Plugin: $OUT_NAME"
echo "   🔒 MD5: $ARCHIVE_MD5"
echo "   📁 Vendor: $VENDOR"
echo ""
echo "🚀 To install:"
echo "   1. Copy $OUT_NAME to your UNRAID server"
echo "   2. Install via Plugins → Install Plugin"
echo "   3. Access via Settings → File Manager"
