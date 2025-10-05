#!/bin/bash

# ExplorerX Version Update Script
# Usage: ./update-version.sh <new_version>

if [ $# -eq 0 ]; then
    echo "Usage: $0 <new_version>"
    echo "Example: $0 0.1.1"
    exit 1
fi

NEW_VERSION=$1
DATE=$(date +%Y-%m-%d)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "================================================="
echo "ExplorerX Version Update Script"
echo "================================================="
echo "New Version: $NEW_VERSION"
echo "Date: $DATE"
echo ""

# Validate version format (simple check)
if ! echo "$NEW_VERSION" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
    echo "ERROR: Invalid version format. Use semantic versioning (e.g., 0.1.1)"
    exit 1
fi

# Update plugin manifest (.plg file)
echo "Updating plugin manifest..."
if [ -f "$SCRIPT_DIR/explorerx.plg" ]; then
    # Update version entity
    sed -i.bak "s/<!ENTITY version   \"[^\"]*\">/<!ENTITY version   \"$NEW_VERSION\">/" "$SCRIPT_DIR/explorerx.plg"
    echo "  ✓ Updated explorerx.plg"
else
    echo "  ⚠ explorerx.plg not found"
fi

# Update version.json
echo "Updating version.json..."
if [ -f "$SCRIPT_DIR/version.json" ]; then
    # Create backup
    cp "$SCRIPT_DIR/version.json" "$SCRIPT_DIR/version.json.bak"
    
    # Update version.json with new version info
    cat > "$SCRIPT_DIR/version.json" << EOF
{
  "version": "$NEW_VERSION",
  "date": "$DATE",
  "download": "https://github.com/N85UK/UNRAID_Apps/raw/main/ExplorerX_Plugin/packages/explorerx-$NEW_VERSION-x86_64-1.txz",
  "md5": "UPDATE_MD5_AFTER_PACKAGE_BUILD",
  "changelog": [
    {
      "version": "$NEW_VERSION",
      "date": "$DATE", 
      "changes": [
        "UPDATE_CHANGELOG_MANUALLY"
      ]
    }
  ],
  "minimum_unraid": "7.2.0-rc.1",
  "plugin_url": "https://github.com/N85UK/UNRAID_Apps/raw/main/ExplorerX_Plugin/explorerx.plg",
  "support_url": "https://github.com/N85UK/UNRAID_Apps/issues",
  "author": "N85UK",
  "description": "Advanced native file manager for UNRAID with multi-pane navigation and bulk operations"
}
EOF
    echo "  ✓ Updated version.json"
else
    echo "  ⚠ version.json not found"
fi

# Update plugin page version
echo "Updating plugin page..."
if [ -f "$SCRIPT_DIR/source/usr/local/emhttp/plugins/explorerx/explorerx.page" ]; then
    sed -i.bak "s/window.pluginVersion = '[^']*'/window.pluginVersion = '$NEW_VERSION'/" "$SCRIPT_DIR/source/usr/local/emhttp/plugins/explorerx/explorerx.page"
    echo "  ✓ Updated explorerx.page"
else
    echo "  ⚠ explorerx.page not found"
fi

echo ""
echo "================================================="
echo "Version Update Complete!"
echo "================================================="
echo ""
echo "Next Steps:"
echo "1. Update CHANGELOG section in explorerx.plg manually"
echo "2. Update changelog in version.json manually"
echo "3. Build new package: ./build-package.sh"
echo "4. Update MD5 hash in both explorerx.plg and version.json"
echo "5. Commit and push to GitHub"
echo ""
echo "Files updated:"
echo "  - explorerx.plg"
echo "  - version.json"
echo "  - explorerx.page"
echo ""
echo "Backup files created:"
echo "  - explorerx.plg.bak"
echo "  - version.json.bak"
echo "  - explorerx.page.bak"
echo ""