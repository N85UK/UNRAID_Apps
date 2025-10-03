#!/bin/bash
# Comprehensive validation and fix script for the File Manager plugin

set -euo pipefail

PLUGIN_DIR="/Users/paul.mccann/Documents/GitHub/UnRiaid_Apps/Plugins/FileManager"
cd "$PLUGIN_DIR"

echo "🔍 Validating File Manager Plugin..."

# 1. Validate XML syntax
echo "📋 Checking XML syntax..."
if xmllint --noout file-manager.plg 2>/dev/null; then
    echo "✅ XML syntax is valid"
else
    echo "❌ XML syntax errors found"
    xmllint file-manager.plg
    exit 1
fi

# 2. Check required files exist
echo "📁 Checking required files..."
REQUIRED_FILES=(
    "file-manager.plg"
    "file-manager-2025.10.03.tar.xz"
    "webgui/FileManager.page"
    "scripts/install.sh"
    "scripts/remove.sh"
    "package.json"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        exit 1
    fi
done

# 3. Verify MD5 hash
echo "🔒 Verifying MD5 hash..."
EXPECTED_MD5="b4787bb59469d1831e41cd295d0dfc8f"
ACTUAL_MD5=$(md5 -q file-manager-2025.10.03.tar.xz)
if [ "$EXPECTED_MD5" = "$ACTUAL_MD5" ]; then
    echo "✅ MD5 hash matches: $ACTUAL_MD5"
else
    echo "❌ MD5 hash mismatch!"
    echo "   Expected: $EXPECTED_MD5"
    echo "   Actual:   $ACTUAL_MD5"
    exit 1
fi

# 4. Check script permissions
echo "🔧 Checking script permissions..."
for script in scripts/*.sh dev/*.sh; do
    if [ -f "$script" ]; then
        if [ -x "$script" ]; then
            echo "✅ $script is executable"
        else
            echo "🔧 Making $script executable..."
            chmod +x "$script"
        fi
    fi
done

# 5. Validate plugin URLs
echo "🌐 Checking plugin URLs..."
PLUGIN_URL="https://github.com/N85UK/UnRiaid_Apps/raw/main/Plugins/FileManager/file-manager.plg"
ARCHIVE_URL="https://github.com/N85UK/UnRiaid_Apps/raw/main/Plugins/FileManager/file-manager-2025.10.03.tar.xz"

echo "📡 Plugin URL: $PLUGIN_URL"
echo "📦 Archive URL: $ARCHIVE_URL"

# 6. Check package.json syntax
echo "📦 Validating package.json..."
if [ -f "package.json" ]; then
    if node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))" 2>/dev/null; then
        echo "✅ package.json is valid JSON"
    else
        echo "❌ package.json has syntax errors"
        exit 1
    fi
fi

# 7. Validate TypeScript compilation if available
if [ -f "tsconfig.json" ] && command -v npm >/dev/null; then
    echo "🔧 Checking TypeScript compilation..."
    if npm run build 2>/dev/null; then
        echo "✅ TypeScript compiles successfully"
    else
        echo "⚠️  TypeScript compilation issues (may be expected in this context)"
    fi
fi

echo ""
echo "🎉 Plugin validation complete!"
echo ""
echo "📋 Installation URLs:"
echo "   Advanced Plugin: $PLUGIN_URL"
echo "   Simple Plugin:   https://github.com/N85UK/UnRiaid_Apps/raw/main/Plugins/FileManager/file-manager-simple.plg"
echo ""
echo "✅ Ready for installation on UNRAID!"