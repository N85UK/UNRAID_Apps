#!/bin/bash
# Complete setup script for the advanced File Manager plugin

set -euo pipefail

echo "🚀 Setting up Advanced File Manager Plugin..."

# Build the plugin
echo "📦 Building plugin..."
./dev/build-plg.sh --vendor

# Verify all required files exist
echo "🔍 Verifying files..."
if [ ! -f "file-manager.plg" ]; then
    echo "❌ Plugin file not found!"
    exit 1
fi

if [ ! -f "file-manager-2025.10.03.tar.xz" ]; then
    echo "❌ Archive file not found!"
    exit 1
fi

echo "✅ Plugin built successfully!"
echo ""
echo "📋 Installation Instructions:"
echo "1. Copy file-manager.plg to your UNRAID server"
echo "2. Install via Plugins → Install Plugin using URL:"
echo "   https://github.com/N85UK/UnRiaid_Apps/raw/main/Plugins/File%20Manager/file-manager.plg"
echo "3. Access via Settings → File Manager"
echo ""
echo "📁 Files created:"
echo "   - file-manager.plg (Plugin manifest)"
echo "   - file-manager-2025.10.03.tar.xz (Plugin archive)"
echo ""
echo "🎯 Next steps:"
echo "   - Commit and push to GitHub"
echo "   - Test installation on UNRAID server"