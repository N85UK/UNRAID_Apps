#!/bin/bash

# Version Validation Script for AWS EUM v3.0.1
# Checks that all files have consistent version information

echo "🔍 Validating version consistency across all files..."

TARGET_VERSION="3.0.1"
CURRENT_DATE="2025-10-10"

echo "Target Version: $TARGET_VERSION"
echo "Target Date: $CURRENT_DATE"
echo ""

# Function to check version in file
check_version() {
    local file=$1
    local pattern=$2
    local description=$3
    
    if [ -f "$file" ]; then
        local found=$(grep -o "$pattern" "$file" || echo "NOT_FOUND")
        if [[ "$found" == *"$TARGET_VERSION"* ]]; then
            echo "✅ $description: $found"
        else
            echo "❌ $description: $found (expected $TARGET_VERSION)"
        fi
    else
        echo "❌ $description: File not found ($file)"
    fi
}

# Function to check date in file
check_date() {
    local file=$1
    local pattern=$2
    local description=$3
    
    if [ -f "$file" ]; then
        local found=$(grep -o "$pattern" "$file" || echo "NOT_FOUND")
        if [[ "$found" == *"$CURRENT_DATE"* ]]; then
            echo "✅ $description: $found"
        else
            echo "❌ $description: $found (expected $CURRENT_DATE)"
        fi
    else
        echo "❌ $description: File not found ($file)"
    fi
}

echo "📋 Checking version numbers..."

# Check package.json
check_version "package.json" '"version": "[^"]*"' "package.json version"

# Check server.js
check_version "server.js" "CURRENT_VERSION = '[^']*'" "server.js version"

# Check template.cfg
check_version "template.cfg" "Version: [0-9.]*" "template.cfg version"

# Check doc.md
check_version "doc.md" "%version: [0-9.]*" "doc.md version"

# Check Dockerfile
check_version "Dockerfile" 'version="[^"]*"' "Dockerfile version"

echo ""
echo "📅 Checking dates..."

# Check CHANGELOG.md dates
check_date "CHANGELOG.md" "\[3\.0\.1\] - [0-9-]*" "CHANGELOG.md v3.0.1 date"
check_date "CHANGELOG.md" "\[3\.0\.0\] - [0-9-]*" "CHANGELOG.md v3.0.0 date"

echo ""
echo "📝 Checking documentation consistency..."

# Check if key files exist
files_to_check=(
    "README.md"
    "CHANGELOG.md"
    "CSP_TROUBLESHOOTING.md"
    "BR0_NETWORK_FIX.md"
    "DEPLOYMENT_GUIDE.md"
    "ULTIMATE_SOLUTION_SUMMARY.md"
    "template.cfg"
    "doc.md"
    "Dockerfile"
    "docker-compose.yml"
    ".env.example"
    "build.sh"
)

echo "📁 Checking file existence..."
for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done

echo ""
echo "🔧 Checking CSP configuration documentation..."

# Check if CSP environment variables are documented
csp_vars=("DISABLE_CSP" "NETWORK_HOST" "CSP_POLICY")
files_with_csp=("README.md" "template.cfg" "doc.md" ".env.example")

for var in "${csp_vars[@]}"; do
    echo "Checking $var documentation:"
    for file in "${files_with_csp[@]}"; do
        if [ -f "$file" ] && grep -q "$var" "$file"; then
            echo "  ✅ $file contains $var"
        else
            echo "  ❌ $file missing $var"
        fi
    done
done

echo ""
echo "🎯 Summary:"
echo "- Target version: $TARGET_VERSION"
echo "- All files should reference v3.0.1"
echo "- CSP configuration should be documented"
echo "- Build script should be executable"
echo "- Docker image should be buildable"

echo ""
echo "🚀 Next steps:"
echo "1. Fix any version inconsistencies shown above"
echo "2. Run './build.sh' to build Docker image"
echo "3. Test deployment with 'DISABLE_CSP=true'"
echo "4. Push to GitHub Container Registry"
echo "5. Update UNRAID Community Applications"

# Check if build script is executable
if [ -x "build.sh" ]; then
    echo "✅ build.sh is executable"
else
    echo "❌ build.sh is not executable (run: chmod +x build.sh)"
fi