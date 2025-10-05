#!/bin/bash

# ExplorerX Version Update Script
# Usage: ./update-version.sh [increment_type]
# increment_type: patch (default), minor, major, or specific version like 2025.10.05.02.00

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATE=$(date +%Y.%m.%d)

echo "================================================="
echo "ExplorerX Version Update Script"
echo "================================================="

# Get current version
CURRENT_VERSION=$(grep '<!ENTITY version' "$SCRIPT_DIR/explorerx.plg" | sed 's/.*"\([^"]*\)".*/\1/')
echo "Current Version: $CURRENT_VERSION"

# Determine new version
if [ $# -eq 0 ]; then
    # Default: increment patch version for today
    if [[ $CURRENT_VERSION == $DATE.* ]]; then
        # Same day, increment patch
        PATCH=$(echo $CURRENT_VERSION | cut -d'.' -f4)
        BUILD=$(echo $CURRENT_VERSION | cut -d'.' -f5)
        NEW_PATCH=$((PATCH + 1))
        NEW_VERSION="$DATE.$NEW_PATCH.$BUILD"
    else
        # New day, start fresh
        NEW_VERSION="$DATE.01.00"
    fi
elif [[ $1 =~ ^[0-9]{4}\.[0-9]{2}\.[0-9]{2}\.[0-9]{2}\.[0-9]{2}$ ]]; then
    # Specific version provided
    NEW_VERSION=$1
else
    case $1 in
        "patch")
            if [[ $CURRENT_VERSION == $DATE.* ]]; then
                PATCH=$(echo $CURRENT_VERSION | cut -d'.' -f4)
                BUILD=$(echo $CURRENT_VERSION | cut -d'.' -f5)
                NEW_PATCH=$((PATCH + 1))
                NEW_VERSION="$DATE.$NEW_PATCH.$BUILD"
            else
                NEW_VERSION="$DATE.01.00"
            fi
            ;;
        "minor")
            if [[ $CURRENT_VERSION == $DATE.* ]]; then
                PATCH=$(echo $CURRENT_VERSION | cut -d'.' -f4)
                BUILD=$(echo $CURRENT_VERSION | cut -d'.' -f5)
                NEW_BUILD=$((BUILD + 1))
                NEW_VERSION="$DATE.$PATCH.$NEW_BUILD"
            else
                NEW_VERSION="$DATE.01.01"
            fi
            ;;
        "major")
            NEW_VERSION="$DATE.02.00"
            ;;
        *)
            echo "ERROR: Invalid increment type. Use: patch, minor, major, or specific version (YYYY.MM.DD.XX.XX)"
            exit 1
            ;;
    esac
fi

echo "New Version: $NEW_VERSION"
echo ""

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
echo "3. Build new package: tar -cJf packages/explorerx-\${NEW_VERSION}-x86_64-1.txz -C source ."
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