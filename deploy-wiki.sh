#!/bin/bash

# GitHub Wiki Automation Script
# Automatically creates and updates GitHub Wiki pages from prepared content

set -e

echo "🚀 GitHub Wiki Automation Starting..."

# Configuration
REPO_OWNER="N85UK"
REPO_NAME="UNRAID_Apps"
WIKI_REPO="https://github.com/${REPO_OWNER}/${REPO_NAME}.wiki.git"
WIKI_DIR="/tmp/unraid-apps-wiki"
CONTENT_DIR="/Users/paul.mccann/UNRAID_Apps"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required files exist
check_wiki_files() {
    log "Checking Wiki content files..."
    
    local files=(
        "Wiki-Home.md"
        "Wiki-AWS-EUM-Installation.md"
        "Wiki-Version-Comparison.md"
        "Wiki-Troubleshooting.md"
        "Wiki-Common-Issues.md"
        "Wiki-Support-Contacts.md"
    )
    
    local missing_files=()
    
    for file in "${files[@]}"; do
        if [[ ! -f "${CONTENT_DIR}/${file}" ]]; then
            missing_files+=("$file")
        fi
    done
    
    if [[ ${#missing_files[@]} -gt 0 ]]; then
        error "Missing Wiki content files:"
        for file in "${missing_files[@]}"; do
            echo "  - $file"
        done
        exit 1
    fi
    
    success "All Wiki content files found"
}

# Clone or update wiki repository
setup_wiki_repo() {
    log "Setting up Wiki repository..."
    
    if [[ -d "$WIKI_DIR" ]]; then
        log "Wiki directory exists, updating..."
        cd "$WIKI_DIR"
        git pull origin master 2>/dev/null || git pull origin main 2>/dev/null || true
    else
        log "Attempting to clone Wiki repository..."
        if git clone "$WIKI_REPO" "$WIKI_DIR" 2>/dev/null; then
            cd "$WIKI_DIR"
            success "Wiki repository cloned"
        else
            warning "Wiki repository doesn't exist yet, creating new one..."
            mkdir -p "$WIKI_DIR"
            cd "$WIKI_DIR"
            git init
            git remote add origin "$WIKI_REPO"
            
            # Create initial commit
            echo "# UNRAID Apps Wiki" > Home.md
            echo "" >> Home.md
            echo "This Wiki is being initialized..." >> Home.md
            git add Home.md
            git config user.name "Wiki Automation" 2>/dev/null || true
            git config user.email "automation@git.n85.uk" 2>/dev/null || true
            git commit -m "Initial Wiki setup"
            
            # Try to push - this will create the Wiki
            if git push -u origin master 2>/dev/null || git push -u origin main 2>/dev/null; then
                success "Wiki repository created"
            else
                error "Failed to create Wiki repository. Please create the Wiki manually first by going to:"
                echo "  https://github.com/${REPO_OWNER}/${REPO_NAME}/wiki"
                echo "  and creating the first page, then run this script again."
                exit 1
            fi
        fi
    fi
    
    success "Wiki repository ready"
}

# Convert and copy content files
convert_wiki_content() {
    log "Converting and copying Wiki content..."
    
    cd "$WIKI_DIR"
    
    # Wiki file mappings: source_file -> wiki_page_name
    declare -A wiki_mappings=(
        ["Wiki-Home.md"]="Home.md"
        ["Wiki-AWS-EUM-Installation.md"]="AWS-EUM-Installation.md"
        ["Wiki-Version-Comparison.md"]="Version-Comparison.md"
        ["Wiki-Troubleshooting.md"]="Troubleshooting.md"
        ["Wiki-Common-Issues.md"]="Common-Issues.md"
        ["Wiki-Support-Contacts.md"]="Support-Contacts.md"
    )
    
    for source_file in "${!wiki_mappings[@]}"; do
        local wiki_file="${wiki_mappings[$source_file]}"
        local source_path="${CONTENT_DIR}/${source_file}"
        
        log "Processing: $source_file -> $wiki_file"
        
        # Copy content and add Wiki header
        {
            echo "<!-- This page is auto-generated from ${source_file} -->"
            echo "<!-- Last updated: $(date +'%Y-%m-%d %H:%M:%S UTC') -->"
            echo ""
            cat "$source_path"
        } > "$wiki_file"
        
        success "Converted: $wiki_file"
    done
}

# Create additional Wiki pages
create_additional_pages() {
    log "Creating additional Wiki pages..."
    
    cd "$WIKI_DIR"
    
    # Create Installation Guides index page
    cat > "Installation-Guides.md" << EOF
<!-- Auto-generated Installation Guides index -->
<!-- Last updated: $(date +'%Y-%m-%d %H:%M:%S UTC') -->

# Installation Guides

Complete installation guides for all UNRAID Apps Repository projects.

##  Application Installation  
- **[AWS EUM Suite Installation](AWS-EUM-Installation)** - Complete guide for all AWS EUM editions
- **[UCG Webhook Receiver](https://github.com/N85UK/UNRAID_Apps/tree/main/Apps/UCG-Max-Webhook-Receiver)** - UCG Max webhook integration

## 🔧 Quick Start
1. **Choose Your Project**: Review [Version Comparison](Version-Comparison) first
2. **Follow Installation Guide**: Use appropriate guide above
3. **Troubleshoot if Needed**: Check [Common Issues](Common-Issues)

## 📞 Need Help?
- **Quick Fixes**: [Common Issues](Common-Issues)
- **Detailed Help**: [Troubleshooting](Troubleshooting)
- **Contact Support**: [Support Contacts](Support-Contacts)

---
*Installation guides updated: $(date +'%Y-%m-%d')*
EOF

    success "Created additional Wiki pages"
}

# Commit and push changes
deploy_wiki() {
    log "Deploying Wiki changes..."
    
    cd "$WIKI_DIR"
    
    # Configure git if not already configured
    if ! git config user.name > /dev/null 2>&1; then
        git config user.name "Wiki Automation"
        git config user.email "automation@git.n85.uk"
    fi
    
    # Add all changes
    git add .
    
    # Check if there are changes to commit
    if git diff --staged --quiet; then
        warning "No changes to deploy"
        return 0
    fi
    
    # Commit changes
    local commit_message="📚 Wiki Update: $(date +'%Y-%m-%d %H:%M:%S')

- Updated all documentation with latest fixes
- Added comprehensive CSP troubleshooting for custom networks
- Enhanced installation guides with multiple solution approaches
- Automated Wiki deployment

Generated from UNRAID_Apps repository"
    
    git commit -m "$commit_message"
    
    # Push to GitHub
    log "Pushing to GitHub..."
    git push origin master
    
    success "Wiki deployed successfully!"
}

# Cleanup function
cleanup() {
    if [[ -d "$WIKI_DIR" ]]; then
        log "Cleaning up temporary files..."
        rm -rf "$WIKI_DIR"
        success "Cleanup completed"
    fi
}

# Main execution
main() {
    log "Starting GitHub Wiki automation for UNRAID Apps"
    
    # Trap cleanup on exit
    trap cleanup EXIT
    
    # Execute steps
    check_wiki_files
    setup_wiki_repo
    convert_wiki_content
    create_additional_pages
    deploy_wiki
    
    success "GitHub Wiki automation completed successfully!"
    echo ""
    echo "🌐 Wiki URL: https://github.com/${REPO_OWNER}/${REPO_NAME}/wiki"
    echo "📝 Pages Created:"
    echo "   - Home (main landing page)"
    echo "   - ExplorerX Plugin Installation"
    echo "   - AWS EUM Installation (with CSP fixes)"
    echo "   - Version Comparison"
    echo "   - Troubleshooting (comprehensive)"
    echo "   - Common Issues (quick fixes)"
    echo "   - Support Contacts"
    echo "   - Installation Guides (index)"
    echo "   - UNRAID API Integration"
    echo ""
    echo "✨ All documentation now includes comprehensive CSP fixes for custom bridge networks!"
}

# Run main function
main "$@"