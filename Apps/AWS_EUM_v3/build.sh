#!/bin/bash

# AWS EUM v3.0.1 Build Script
# This script builds and tags the Docker image with CSP fixes

set -e

echo "🚀 Building AWS EUM v3.0.1 with CSP fixes..."

# Build the Docker image
echo "📦 Building Docker image..."
docker build \
  -t ghcr.io/n85uk/aws-eum-v3:3.0.1 \
  -t ghcr.io/n85uk/aws-eum-v3:latest \
  -f Dockerfile \
  .

echo "✅ Docker image built successfully!"

# Display image information
echo "📊 Image Information:"
docker images ghcr.io/n85uk/aws-eum-v3

# Optional: Test the image
echo "🧪 Testing image (optional)..."
echo "To test the image, run:"
echo "docker run -d -p 8280:80 -e DISABLE_CSP=true ghcr.io/n85uk/aws-eum-v3:3.0.1"

# Push to registry (uncomment when ready)
echo "📤 To push to registry:"
echo "docker push ghcr.io/n85uk/aws-eum-v3:3.0.1"
echo "docker push ghcr.io/n85uk/aws-eum-v3:latest"

echo "🎉 Build process completed!"
echo ""
echo "📋 Version Information:"
echo "- Version: 3.0.1"
echo "- Features: CSP configuration, Chart.js analytics, dark mode"
echo "- Network Support: Default bridge, custom bridge networks (br0.x)"
echo "- CSP Fix: Set DISABLE_CSP=true for custom bridge networks"
echo ""
echo "📚 Documentation:"
echo "- README.md - Main documentation"
echo "- CSP_TROUBLESHOOTING.md - CSP configuration guide"
echo "- BR0_NETWORK_FIX.md - Quick fix for br0.2 networks"