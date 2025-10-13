#!/bin/bash
# Quick Fix Script for UNRAID - Run this on your UNRAID server

echo "🚨 AWS EUM v3.0.7 Quick Fix"
echo "================================"
echo ""

# Method 1: Pull from GitHub (if build is ready)
echo "📦 Method 1: Pull new image from GitHub Container Registry"
echo "   Checking if build is ready..."
if docker pull ghcr.io/n85uk/aws-eum-v3:3.0.7 2>/dev/null; then
    echo "   ✅ v3.0.7 image downloaded successfully!"
    echo ""
    echo "   Now update your container:"
    echo "   1. Go to UNRAID Docker tab"
    echo "   2. Stop AWS_EUM"
    echo "   3. Edit container"
    echo "   4. Change Repository tag to: 3.0.7"
    echo "   5. Apply and start"
else
    echo "   ⏳ Build not ready yet. Trying :latest..."
    if docker pull ghcr.io/n85uk/aws-eum-v3:latest 2>/dev/null; then
        echo "   ✅ Latest image downloaded!"
    else
        echo "   ⚠️  GitHub build still in progress"
        echo "   Check: https://github.com/N85UK/UNRAID_Apps/actions"
        echo ""
        echo "   Use Method 2 to build locally while waiting"
    fi
fi

echo ""
echo "================================"
echo "📦 Method 2: Build locally (if you have the repo)"
echo ""
echo "If you have access to the source code on UNRAID:"
echo ""
echo "cd /path/to/UNRAID_Apps/Apps/AWS_EUM"
echo "docker build -t aws-eum-v3:3.0.7-fixed ."
echo "docker tag aws-eum-v3:3.0.7-fixed ghcr.io/n85uk/aws-eum-v3:3.0.7"
echo ""
echo "Then update UNRAID template to use local image"
echo ""

echo "================================"
echo "🔍 Current Status Check"
echo ""
docker ps -a --filter "name=AWS_EUM" --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"

echo ""
echo "================================"
echo "📋 Next Steps:"
echo ""
echo "1. Wait for GitHub Actions build (~5-10 minutes)"
echo "2. Or build locally using Method 2"
echo "3. Pull new image: docker pull ghcr.io/n85uk/aws-eum-v3:3.0.7"
echo "4. Update container via UNRAID UI"
echo "5. Verify: docker logs AWS_EUM | grep 'v3.0.7'"
echo ""
