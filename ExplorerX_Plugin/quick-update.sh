#!/bin/bash

# Quick update shortcuts for ExplorerX development
# Usage examples:
#   ./quick-fix.sh "Fixed directory listing bug"
#   ./quick-feature.sh "Added file upload support" 
#   ./quick-major.sh "Major UI overhaul"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

case "$(basename "$0")" in
    "quick-fix.sh")
        "$SCRIPT_DIR/auto-update.sh" patch "$1"
        ;;
    "quick-feature.sh") 
        "$SCRIPT_DIR/auto-update.sh" minor "$1"
        ;;
    "quick-major.sh")
        "$SCRIPT_DIR/auto-update.sh" major "$1"
        ;;
    "quick-build.sh")
        "$SCRIPT_DIR/auto-update.sh" build "$1"
        ;;
    *)
        echo "Unknown script: $(basename "$0")"
        echo "Available shortcuts:"
        echo "  quick-fix.sh    - Patch version increment"
        echo "  quick-feature.sh - Minor version increment" 
        echo "  quick-major.sh  - Major version increment"
        echo "  quick-build.sh  - Build version increment"
        exit 1
        ;;
esac