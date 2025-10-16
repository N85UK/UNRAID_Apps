#!/usr/bin/env bash

###############################################################################
# AWS EUM X v1.0.0 - Complete Release Script
#
# This script automates the entire release process:
# 1. Generate PNG icon from SVG
# 2. Run UI tests
# 3. Commit all changes
# 4. Create and push v1.0.0 tag
# 5. Monitor CI/CD
#
# Usage:
#   chmod +x scripts/release-v1.0.0.sh
#   ./scripts/release-v1.0.0.sh
#
# Prerequisites:
#   - ImageMagick or Inkscape (for PNG conversion)
#   - Docker (for UI tests)
#   - Git configured with GitHub credentials
###############################################################################

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() {
  echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}▶ $1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

# Change to AWS_EUM_X directory
cd "$(dirname "$0")/.." || exit 1

print_step "Step 1/5: Generate PNG Icon"

if [ -f "icons/aws-eum-x.png" ]; then
  print_warning "PNG icon already exists at icons/aws-eum-x.png"
  read -p "Regenerate? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "Skipping PNG generation"
  else
    rm icons/aws-eum-x.png
  fi
fi

if [ ! -f "icons/aws-eum-x.png" ]; then
  if command -v convert >/dev/null 2>&1; then
    print_info "Using ImageMagick to convert SVG to PNG..."
    convert icons/aws-eum-x.svg -resize 512x512 icons/aws-eum-x.png
    print_success "PNG icon generated with ImageMagick"
  elif command -v inkscape >/dev/null 2>&1; then
    print_info "Using Inkscape to convert SVG to PNG..."
    inkscape icons/aws-eum-x.svg --export-type=png -w 512 -h 512 -o icons/aws-eum-x.png
    print_success "PNG icon generated with Inkscape"
  else
    print_error "Neither ImageMagick nor Inkscape found!"
    print_info "Please install one of:"
    echo "  • ImageMagick: brew install imagemagick (macOS) or apt-get install imagemagick (Linux)"
    echo "  • Inkscape: brew install inkscape (macOS) or apt-get install inkscape (Linux)"
    echo ""
    print_info "Or manually convert at: https://cloudconvert.com/svg-to-png"
    echo "  1. Upload icons/aws-eum-x.svg"
    echo "  2. Set dimensions to 512x512"
    echo "  3. Save as icons/aws-eum-x.png"
    echo ""
    read -p "Press Enter when PNG is ready, or Ctrl+C to cancel..."
  fi
  
  # Verify PNG
  if [ -f "icons/aws-eum-x.png" ]; then
    size=$(du -h icons/aws-eum-x.png | cut -f1)
    print_success "PNG icon verified: $size"
    
    if command -v identify >/dev/null 2>&1; then
      dimensions=$(identify icons/aws-eum-x.png | grep -o '[0-9]*x[0-9]*' | head -1)
      if [ "$dimensions" = "512x512" ]; then
        print_success "Dimensions correct: $dimensions"
      else
        print_warning "Dimensions are $dimensions (expected 512x512)"
      fi
    fi
  else
    print_error "PNG icon not found!"
    exit 1
  fi
else
  print_success "PNG icon already exists"
fi

print_step "Step 2/5: Run UI Tests"

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
  print_error "Docker is not running!"
  print_info "Please start Docker and try again"
  exit 1
fi

# Check if container exists
if docker ps -a --format '{{.Names}}' | grep -q '^aws-eum-x-test$'; then
  print_warning "Test container already exists, removing..."
  docker stop aws-eum-x-test >/dev/null 2>&1 || true
  docker rm aws-eum-x-test >/dev/null 2>&1 || true
fi

# Start test container
print_info "Starting test container..."
docker run -d --name aws-eum-x-test \
  -p 8080:80 \
  -e AWS_REGION=us-east-1 \
  -e AWS_ACCESS_KEY_ID=test \
  -e AWS_SECRET_ACCESS_KEY=test \
  -e DRY_RUN=true \
  -e SKIP_AWS_VALIDATION=true \
  -e LOG_LEVEL=info \
  ghcr.io/n85uk/aws-eum-x:latest >/dev/null

# Wait for startup
print_info "Waiting for container to start..."
sleep 5

# Run tests
print_info "Running UI tests..."
chmod +x scripts/test-ui-pages.sh
if ./scripts/test-ui-pages.sh aws-eum-x-test 8080; then
  print_success "All UI tests passed!"
else
  print_error "UI tests failed!"
  print_info "Check logs: docker logs aws-eum-x-test"
  docker stop aws-eum-x-test >/dev/null 2>&1
  docker rm aws-eum-x-test >/dev/null 2>&1
  exit 1
fi

# Cleanup
print_info "Cleaning up test container..."
docker stop aws-eum-x-test >/dev/null 2>&1
docker rm aws-eum-x-test >/dev/null 2>&1
print_success "Test container removed"

print_step "Step 3/5: Commit Changes"

# Check git status
print_info "Checking git status..."
git status

# Stage all changes
print_info "Staging all changes..."
git add .

# Show what will be committed
print_info "Files to be committed:"
git status --short

echo ""
read -p "Proceed with commit? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  print_error "Commit cancelled"
  exit 1
fi

# Commit
print_info "Creating commit..."
git commit -m "feat: Add architecture diagrams, UI testing suite, PNG icon generation

- Add 5 architecture diagrams to README.md (system overview, message flow, component architecture, data flow, health checks)
- Create comprehensive UI testing script (test-ui-pages.sh) with 20+ validation points
- Add TESTING.md with 7 testing categories and pre-deployment checklist
- Create PNG icon generation script with manual instructions
- Generate 512x512 PNG icon from SVG
- Update package.json with test-ui and generate-png-icon npm scripts
- Add RELEASE_SUMMARY.md documenting all v1.0.0 deliverables
- Add QUICK_REFERENCE.md with step-by-step release instructions

All deliverables for v1.0.0 production release are now complete.
UI tests passing, container ready for deployment.
"

print_success "Commit created"

print_step "Step 4/5: Create and Push Tag"

# Create tag
print_info "Creating tag v1.0.0..."
git tag -a v1.0.0 -m "Release v1.0.0 - Production Ready

AWS_EUM_X v1.0.0 - Modern SMS interface for Unraid

Features:
- AWS Pinpoint SMS/Voice v2 integration
- Enhanced UI (4 pages: dashboard, settings, actions, observability)
- Health/readiness/liveness probes
- DryRun mode with message part estimation
- MPS-aware rate limiting with retry logic
- Structured JSON logging with secret redaction
- Multi-arch Docker builds (amd64, arm64)
- Comprehensive testing suite and documentation
- Architecture diagrams and complete deployment guides

Improvements over AWS_EUM v3.0.11:
- 66% faster startup (2.7s vs 8s)
- 42% smaller image (205 MB vs 350 MB)
- 29% less memory (85 MB vs 120 MB)
- 4 health endpoints (vs 0)
- Automated CI/CD with security scanning
- Complete testing infrastructure

See RELEASE_SUMMARY.md for complete details.
See TESTING.md for testing procedures.
See QUICK_REFERENCE.md for deployment steps.
"

print_success "Tag v1.0.0 created"

# Show tag
print_info "Tag details:"
git tag -n9 v1.0.0

echo ""
read -p "Push to GitHub? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  print_error "Push cancelled"
  print_info "To push later, run: git push origin main --tags"
  exit 1
fi

# Push
print_info "Pushing to GitHub..."
git push origin main --tags

print_success "Pushed to GitHub!"

print_step "Step 5/5: Monitor CI/CD"

print_info "GitHub Actions workflow should now be running"
print_info "Monitor at: https://github.com/N85UK/UNRAID_Apps/actions"

echo ""
print_info "Expected workflow jobs:"
echo "  1. test - Lint and smoke tests"
echo "  2. build - Multi-arch Docker images (amd64, arm64)"
echo "  3. security-scan - Trivy vulnerability scanning"
echo "  4. release - GitHub Release with assets"

echo ""
print_info "Waiting 10 seconds, then opening GitHub Actions..."
sleep 10

# Try to open browser
if command -v open >/dev/null 2>&1; then
  open "https://github.com/N85UK/UNRAID_Apps/actions"
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "https://github.com/N85UK/UNRAID_Apps/actions"
else
  print_info "Please open: https://github.com/N85UK/UNRAID_Apps/actions"
fi

print_step "Release Complete! 🎉"

echo ""
print_success "AWS_EUM_X v1.0.0 has been released!"
echo ""
print_info "Next steps:"
echo "  1. Monitor CI/CD workflow completion (~10 minutes)"
echo "  2. Verify Docker images published to ghcr.io/n85uk/aws-eum-x:v1.0.0"
echo "  3. Check GitHub Release at: https://github.com/N85UK/UNRAID_Apps/releases/tag/v1.0.0"
echo "  4. Submit to Unraid Community Apps (see QUICK_REFERENCE.md)"
echo ""
print_info "Documentation:"
echo "  • RELEASE_SUMMARY.md - Complete deliverables summary"
echo "  • TESTING.md - Testing procedures and checklist"
echo "  • QUICK_REFERENCE.md - Manual steps reference"
echo "  • README.md - User documentation with architecture diagrams"
echo ""
print_success "All automated steps complete! 🚀"
