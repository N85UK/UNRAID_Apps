#!/bin/bash

# ExplorerX Package Builder
# Builds proper .txz packages for UNRAID

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Get version from plugin manifest
VERSION=$(grep '<!ENTITY version' explorerx.plg | sed 's/.*"\([^"]*\)".*/\1/')

if [ -z "$VERSION" ]; then
    echo "ERROR: Could not extract version from explorerx.plg"
    exit 1
fi

PACKAGE_NAME="explorerx-${VERSION}-x86_64-1.txz"
PACKAGE_PATH="packages/$PACKAGE_NAME"

echo "================================================="
echo "ExplorerX Package Builder"
echo "================================================="
echo "Version: $VERSION"
echo "Package: $PACKAGE_NAME"
echo ""

# Check if source directory exists
if [ ! -d "source" ]; then
    echo "ERROR: source directory not found"
    exit 1
fi

# Create packages directory if it doesn't exist
mkdir -p packages

# Build package using xz compression (required for .txz)
echo "Building package..."
if tar -cJf "$PACKAGE_PATH" -C source .; then
    echo "✅ Package created successfully: $PACKAGE_PATH"
else
    echo "❌ Failed to create package"
    exit 1
fi

# Calculate MD5 hash
echo "Calculating MD5 hash..."
MD5_HASH=$(md5sum "$PACKAGE_PATH" | cut -d' ' -f1)
echo "MD5: $MD5_HASH"

# Create .md5 file
echo "$MD5_HASH  $PACKAGE_NAME" > "${PACKAGE_PATH}.md5"
echo "✅ MD5 file created: ${PACKAGE_PATH}.md5"

# Get package size
PACKAGE_SIZE=$(ls -lh "$PACKAGE_PATH" | awk '{print $5}')
echo "Package size: $PACKAGE_SIZE"

# Verify package contents
echo ""
echo "Verifying package contents..."
if tar -tJf "$PACKAGE_PATH" > /dev/null 2>&1; then
    echo "✅ Package verification successful"
    FILE_COUNT=$(tar -tJf "$PACKAGE_PATH" | wc -l)
    echo "Files in package: $FILE_COUNT"
else
    echo "❌ Package verification failed"
    exit 1
fi

echo ""
echo "================================================="
echo "Package Build Complete!"
echo "================================================="
echo ""
echo "Package: $PACKAGE_PATH"
echo "MD5: $MD5_HASH"
echo "Size: $PACKAGE_SIZE"
echo ""
echo "Next steps:"
echo "1. Update MD5 hash in explorerx.plg:"
echo "   <!ENTITY md5       \"$MD5_HASH\">"
echo ""
echo "2. Update MD5 hash in version.json:"
echo "   \"md5\": \"$MD5_HASH\","
echo ""
echo "3. Test installation in UNRAID"
echo "4. Commit and push changes"
echo ""