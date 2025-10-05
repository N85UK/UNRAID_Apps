#!/bin/bash
##
# ExplorerX Package Builder
# Creates a Slackware .txz package for Unraid plugin distribution
##

set -euo pipefail

# Configuration
PLUGIN_NAME="explorerx"
VERSION="0.1.1"
ARCH="x86_64"
BUILD="1"
PACKAGE_NAME="${PLUGIN_NAME}-${VERSION}-${ARCH}-${BUILD}"

# Directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="$SCRIPT_DIR/source"
PACKAGES_DIR="$SCRIPT_DIR/packages"
BUILD_DIR="$SCRIPT_DIR/build"

echo "=========================================="
echo "ExplorerX Package Builder"
echo "Version: $VERSION"
echo "=========================================="

# Validate source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo "ERROR: Source directory not found: $SOURCE_DIR"
    exit 1
fi

# Clean previous build
echo "Cleaning previous build..."
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"
mkdir -p "$PACKAGES_DIR"

# Copy source files to build directory
echo "Copying source files..."
cp -r "$SOURCE_DIR"/* "$BUILD_DIR/"

# Create install script if not exists
if [ ! -f "$BUILD_DIR/install/doinst.sh" ]; then
    echo "Creating install script..."
    mkdir -p "$BUILD_DIR/install"
    cat > "$BUILD_DIR/install/doinst.sh" << 'EOFDOINST'
#!/bin/bash
# ExplorerX post-installation script

# Set permissions
chmod -R 755 /usr/local/emhttp/plugins/explorerx 2>/dev/null || true
chmod +x /usr/local/emhttp/plugins/explorerx/scripts/*.sh 2>/dev/null || true

# Create required directories
mkdir -p /boot/config/plugins/explorerx
mkdir -p /var/log/explorerx
mkdir -p /tmp/explorerx

# Run installation script if exists
if [ -f /usr/local/emhttp/plugins/explorerx/scripts/install.sh ]; then
    bash /usr/local/emhttp/plugins/explorerx/scripts/install.sh
fi

exit 0
EOFDOINST
    chmod +x "$BUILD_DIR/install/doinst.sh"
fi

# Create package description
echo "Creating package description..."
mkdir -p "$BUILD_DIR/install"
cat > "$BUILD_DIR/install/slack-desc" << EOFDESC
         |-----handy-ruler------------------------------------------------------|
$PLUGIN_NAME: ExplorerX (Advanced File Manager for Unraid)
$PLUGIN_NAME:
$PLUGIN_NAME: A powerful, native file manager plugin for Unraid 7.2.0-rc.1
$PLUGIN_NAME: with multi-pane navigation, bulk operations, and background
$PLUGIN_NAME: task queue. Features include dual-pane browsing, bulk file
$PLUGIN_NAME: operations, quick previews, keyboard shortcuts, ZIP support,
$PLUGIN_NAME: and checksum verification.
$PLUGIN_NAME:
$PLUGIN_NAME: Homepage: https://github.com/N85UK/UNRAID_Apps
$PLUGIN_NAME: Version: $VERSION
$PLUGIN_NAME:
EOFDESC

# Set proper permissions
echo "Setting permissions..."
find "$BUILD_DIR" -type f -name "*.sh" -exec chmod +x {} \;
find "$BUILD_DIR" -type f -name "*.php" -exec chmod 644 {} \;
find "$BUILD_DIR" -type f -name "*.js" -exec chmod 644 {} \;
find "$BUILD_DIR" -type f -name "*.css" -exec chmod 644 {} \;
find "$BUILD_DIR" -type d -exec chmod 755 {} \;

# Create the package
echo "Creating package archive..."
cd "$BUILD_DIR"
tar -cJf "$PACKAGES_DIR/${PACKAGE_NAME}.txz" ./*

# Calculate MD5
echo "Calculating MD5 checksum..."
cd "$PACKAGES_DIR"
MD5=$(md5sum "${PACKAGE_NAME}.txz" | awk '{print $1}')
echo "$MD5" > "${PACKAGE_NAME}.txz.md5"

# Display results
PACKAGE_SIZE=$(du -h "${PACKAGE_NAME}.txz" | awk '{print $1}')

echo ""
echo "=========================================="
echo "Package Created Successfully!"
echo "=========================================="
echo "Package: ${PACKAGE_NAME}.txz"
echo "Location: $PACKAGES_DIR"
echo "Size: $PACKAGE_SIZE"
echo "MD5: $MD5"
echo ""
echo "Update explorerx.plg with this MD5:"
echo "<!ENTITY md5       \"$MD5\">"
echo ""
echo "Next steps:"
echo "1. Update explorerx.plg with the MD5 hash above"
echo "2. Commit and push to GitHub"
echo "3. Create a GitHub release v$VERSION"
echo "4. Upload ${PACKAGE_NAME}.txz to the release"
echo "5. Test installation via plugin URL"
echo "=========================================="

exit 0
