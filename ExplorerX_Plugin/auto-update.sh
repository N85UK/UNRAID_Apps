#!/bin/bash

# ExplorerX Auto-Update Script
# Automatically handles version bumping, documentation updates, and git commits
# Usage: ./auto-update.sh [increment_type] "commit message"

set -e  # Exit on any error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Parse arguments
INCREMENT_TYPE=${1:-"patch"}
COMMIT_MESSAGE=${2:-"Auto-update: $INCREMENT_TYPE version increment"}

# Validate increment type
case $INCREMENT_TYPE in
    "patch"|"minor"|"major"|"build")
        ;;
    *)
        if [[ ! $INCREMENT_TYPE =~ ^[0-9]{4}\.[0-9]{2}\.[0-9]{2}\.[0-9]{2}\.[0-9]{2}$ ]]; then
            print_error "Invalid increment type or version format"
            echo "Usage: $0 [patch|minor|major|build|YYYY.MM.DD.XX.XX] \"commit message\""
            echo "Examples:"
            echo "  $0 patch \"Fix file listing bug\""
            echo "  $0 minor \"Add new feature\""
            echo "  $0 2025.10.05.02.00 \"Custom version\""
            exit 1
        fi
        ;;
esac

print_status "Starting auto-update process..."
echo "Increment Type: $INCREMENT_TYPE"
echo "Commit Message: $COMMIT_MESSAGE"
echo ""

# Step 1: Get current version and calculate new version
print_status "Calculating new version..."
CURRENT_VERSION=$(grep '<!ENTITY version' explorerx.plg | sed 's/.*"\([^"]*\)".*/\1/')
DATE=$(date +%Y.%m.%d)

if [[ $INCREMENT_TYPE =~ ^[0-9]{4}\.[0-9]{2}\.[0-9]{2}\.[0-9]{2}\.[0-9]{2}$ ]]; then
    # Custom version provided
    NEW_VERSION=$INCREMENT_TYPE
else
    # Calculate based on increment type
    if [[ $CURRENT_VERSION == $DATE.* ]]; then
        # Same day, increment based on type
        PATCH=$(echo $CURRENT_VERSION | cut -d'.' -f4)
        BUILD=$(echo $CURRENT_VERSION | cut -d'.' -f5)
        
        case $INCREMENT_TYPE in
            "patch")
                NEW_PATCH=$((PATCH + 1))
                NEW_VERSION="$DATE.$NEW_PATCH.$BUILD"
                ;;
            "minor"|"build")
                NEW_BUILD=$((BUILD + 1))
                NEW_VERSION="$DATE.$PATCH.$NEW_BUILD"
                ;;
            "major")
                NEW_VERSION="$DATE.02.00"
                ;;
        esac
    else
        # New day, start fresh based on type
        case $INCREMENT_TYPE in
            "patch")
                NEW_VERSION="$DATE.01.00"
                ;;
            "minor"|"build")
                NEW_VERSION="$DATE.01.01"
                ;;
            "major")
                NEW_VERSION="$DATE.02.00"
                ;;
        esac
    fi
fi

print_success "Version: $CURRENT_VERSION → $NEW_VERSION"

# Step 2: Update version in all files
print_status "Updating version references..."

# Update plugin manifest using perl with safer quoting
perl -i.bak -pe "s/<!ENTITY version\\s+\"[^\"]*\">/<!ENTITY version   \"$NEW_VERSION\">/" explorerx.plg
print_success "Updated explorerx.plg"

# Update version.json
perl -i.bak -pe "s/\"version\": \"[^\"]*\"/\"version\": \"$NEW_VERSION\"/" version.json
perl -i.bak -pe "s|explorerx-[0-9.]*-x86_64-1\\.txz|explorerx-$NEW_VERSION-x86_64-1.txz|g" version.json
print_success "Updated version.json"

# Step 3: Update changelog in plugin manifest
print_status "Updating changelog..."
CURRENT_DATE=$(date +%Y-%m-%d)

# Create backup of original file
cp explorerx.plg explorerx.plg.bak

# Create new changelog entry and update the file
{
    # Print everything up to the <CHANGES> line
    awk '/<CHANGES>/ {print; exit} {print}' explorerx.plg.bak
    
    # Add new changelog entry
    echo "###v$NEW_VERSION ($CURRENT_DATE)"
    echo "- $COMMIT_MESSAGE"
    echo "- Updated to version $NEW_VERSION" 
    echo "- Auto-generated documentation updates"
    echo "- Package rebuilt with latest changes"
    echo ""
    
    # Print everything after the first ###v line (skip the old first entry header)
    awk 'BEGIN{found=0} /<CHANGES>/ {found=1; next} found && /^###v/ && !seen {seen=1; next} found {print}' explorerx.plg.bak
} > explorerx.plg.tmp

mv explorerx.plg.tmp explorerx.plg

print_success "Updated changelog in plugin manifest"

# Step 4: Update version.json changelog
print_status "Updating version.json changelog..."
TEMP_JSON=$(mktemp)
jq --arg version "$NEW_VERSION" --arg date "$CURRENT_DATE" --arg message "$COMMIT_MESSAGE" '
  .changelog[0] = {
    "version": $version,
    "date": $date,
    "changes": [
      $message,
      ("Updated to version " + $version),
      "Auto-generated documentation updates",
      "Package rebuilt with latest changes"
    ]
  }
' version.json > "$TEMP_JSON" && mv "$TEMP_JSON" version.json

print_success "Updated version.json changelog"

# Step 5: Build new package
print_status "Building new package..."
if [ -f "./build-package.sh" ]; then
    ./build-package.sh > /dev/null 2>&1
    NEW_MD5=$(md5sum "packages/explorerx-$NEW_VERSION-x86_64-1.txz" | cut -d' ' -f1)
    
    # Update MD5 in files
    perl -i.bak -pe "s/<!ENTITY md5\\s+\"[^\"]*\">/<!ENTITY md5       \"$NEW_MD5\">/" explorerx.plg
    perl -i.bak -pe "s/\"md5\": \"[^\"]*\"/\"md5\": \"$NEW_MD5\"/" version.json
    echo "$NEW_MD5  explorerx-$NEW_VERSION-x86_64-1.txz" > "packages/explorerx-$NEW_VERSION-x86_64-1.txz.md5"
    
    print_success "Built package with MD5: $NEW_MD5"
else
    print_warning "build-package.sh not found, creating package manually..."
    tar -cJf "packages/explorerx-$NEW_VERSION-x86_64-1.txz" -C source .
    NEW_MD5=$(md5sum "packages/explorerx-$NEW_VERSION-x86_64-1.txz" | cut -d' ' -f1)
    
    # Update MD5 in files  
    perl -i.bak -pe "s/<!ENTITY md5\\s+\"[^\"]*\">/<!ENTITY md5       \"$NEW_MD5\">/" explorerx.plg
    perl -i.bak -pe "s/\"md5\": \"[^\"]*\"/\"md5\": \"$NEW_MD5\"/" version.json
    echo "$NEW_MD5  explorerx-$NEW_VERSION-x86_64-1.txz" > "packages/explorerx-$NEW_VERSION-x86_64-1.txz.md5"
    
    print_success "Built package with MD5: $NEW_MD5"
fi

# Step 6: Generate/Update README if it doesn't exist
if [ ! -f "README.md" ]; then
    print_status "Creating README.md..."
    cat > README.md << EOF
# ExplorerX Plugin

![Version](https://img.shields.io/badge/version-$NEW_VERSION-blue)
![UNRAID](https://img.shields.io/badge/unraid-7.2.0+-orange)
![License](https://img.shields.io/badge/license-MIT-green)

A simple, native file manager plugin for UNRAID that provides clean directory navigation and file operations.

## Features

- 🗂️ **Simple file browser interface**
- 📁 **Directory navigation with breadcrumbs**  
- 📋 **File listing with type, size, and modification date**
- 🔄 **Auto-update notifications**
- 🚀 **Zero Docker overhead - pure native implementation**
- 🎨 **Clean, responsive UI design**

## Installation

### Method 1: Direct Plugin Installation (Recommended)

1. Go to **Plugins** → **Install Plugin** in UNRAID
2. Enter this URL:
   \`\`\`
   https://raw.githubusercontent.com/N85UK/UNRAID_Apps/main/ExplorerX_Plugin/explorerx.plg
   \`\`\`
3. Click **Install**
4. Navigate to **Tools** → **ExplorerX**

### Method 2: Community Applications

1. Install **Community Applications** plugin (if not already installed)
2. Go to **Apps** tab  
3. Search for "**ExplorerX**"
4. Click **Install**

## Requirements

- **UNRAID Version:** 7.2.0-rc.1 or later
- **Architecture:** x86_64
- **Memory:** 20MB RAM minimum
- **Storage:** 10MB disk space

## Version History

### v$NEW_VERSION ($CURRENT_DATE)
- $COMMIT_MESSAGE
- Updated to version $NEW_VERSION
- Auto-generated documentation updates

## Support

- **Issues:** [GitHub Issues](https://github.com/N85UK/UNRAID_Apps/issues)
- **Forum:** [UNRAID Community Forums](https://forums.unraid.net)

## License

MIT License - see LICENSE file for details.

---

**Author:** N85UK  
**Current Version:** $NEW_VERSION  
**Last Updated:** $CURRENT_DATE
EOF
    print_success "Created README.md"
else
    # Update existing README version references
    sed -i.bak "s/version-[0-9.]*/version-$NEW_VERSION/" README.md
    sed -i.bak "s/### v[0-9.]*.*)/### v$NEW_VERSION ($CURRENT_DATE)/" README.md
    sed -i.bak "s/\\*\\*Current Version:\\*\\* [0-9.]*/\\*\\*Current Version:\\*\\* $NEW_VERSION/" README.md
    sed -i.bak "s/\\*\\*Last Updated:\\*\\* [0-9-]*/\\*\\*Last Updated:\\*\\* $CURRENT_DATE/" README.md
    print_success "Updated README.md"
fi

# Step 7: Clean up backup files
rm -f *.bak

# Step 8: Git operations
print_status "Committing changes to git..."

# Add all changes
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    print_warning "No changes to commit"
    exit 0
fi

# Create detailed commit message
DETAILED_COMMIT="🔄 v$NEW_VERSION: $COMMIT_MESSAGE

✨ Changes:
- Version bump: $CURRENT_VERSION → $NEW_VERSION
- Updated plugin manifest and version.json
- Rebuilt package with MD5: $NEW_MD5
- Updated documentation and README
- Auto-generated changelog entries

📦 Package: explorerx-$NEW_VERSION-x86_64-1.txz
🔐 MD5: $NEW_MD5
📅 Date: $CURRENT_DATE"

# Commit changes
git commit -m "$DETAILED_COMMIT"
print_success "Changes committed to git"

# Push to origin
print_status "Pushing to GitHub..."
if git push origin main; then
    print_success "Changes pushed to GitHub successfully!"
else
    print_error "Failed to push to GitHub"
    exit 1
fi

# Step 9: Summary
echo ""
echo "================================================="
print_success "AUTO-UPDATE COMPLETE!"
echo "================================================="
echo ""
echo "📋 **Summary:**"
echo "   Version: $CURRENT_VERSION → $NEW_VERSION"
echo "   Package: explorerx-$NEW_VERSION-x86_64-1.txz"
echo "   MD5: $NEW_MD5"
echo "   Date: $CURRENT_DATE"
echo ""
echo "🔗 **Plugin URL:**"
echo "   https://raw.githubusercontent.com/N85UK/UNRAID_Apps/main/ExplorerX_Plugin/explorerx.plg"
echo ""
echo "✅ **Updated Files:**"
echo "   - explorerx.plg (version, MD5, changelog)"
echo "   - version.json (version, MD5, changelog, download URL)"
echo "   - README.md (version references, history)"
echo "   - Package files (rebuilt and uploaded)"
echo ""
echo "🚀 **Next Steps:**"
echo "   - Plugin is ready for installation"
echo "   - GitHub Actions workflows will run automatically"
echo "   - Documentation will be updated via workflows"
echo ""