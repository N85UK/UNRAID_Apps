# Changelog

All notable changes to ExplorerX will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-10-04

### Added
- Initial release of ExplorerX plugin for Unraid 7.2.0-rc.1
- Multi-pane file browser with dual-pane navigation capability
- Comprehensive file operations:
  - Browse, create, rename, delete directories
  - Upload, download, copy, move, delete files
  - Bulk operations with multi-selection support
- Background task queue system for long-running operations
- Security features:
  - CSRF protection on all write operations
  - Path sanitization and traversal prevention
  - Operations restricted to `/mnt` by default
  - Safe delete guards for system paths
- Advanced features:
  - ZIP archive creation and extraction
  - Checksum calculation (MD5, SHA1, SHA256)
  - Quick file previews
  - Directory search functionality
- User interface:
  - Responsive design for mobile and desktop
  - Dark theme matching Unraid 7.2 webGUI
  - Breadcrumb navigation
  - Sortable file listings
  - Context menus
  - Status bar with selection info
- Keyboard shortcuts:
  - Ctrl/Cmd+A: Select all
  - Ctrl/Cmd+C: Copy
  - Ctrl/Cmd+X: Cut
  - Ctrl/Cmd+V: Paste
  - Delete: Delete selected
  - Ctrl/Cmd+N: New folder
  - F2: Rename
  - Ctrl/Cmd+F: Search
  - Backspace: Parent directory
  - Ctrl/Cmd+P: Toggle dual pane
  - F5: Refresh
- Integration with Unraid:
  - Appears in Tools menu
  - Native plugin (no Docker required)
  - Respects Unraid session model
  - Quick links to user shares
- Configuration system:
  - Feature toggles (ZIP, checksums, previews)
  - Configurable task limits
  - UI preference settings
  - Logging controls
- Comprehensive logging and audit trail
- Complete API documentation
- Installation and build scripts
- Extensive testing documentation

### Technical Details
- **Frontend**: Vanilla JavaScript (ES6+), CSS3
- **Backend**: PHP 8.x, Bash
- **Architecture**: Native Unraid plugin with .plg manifest
- **Packaging**: Slackware .txz format
- **Security**: CSRF tokens, path validation, session checks
- **Performance**: Optimized for directories with 20,000+ files

### Installation
Plugin can be installed via URL:
```
https://raw.githubusercontent.com/N85UK/UNRAID_Apps/main/ExplorerX_Plugin/explorerx.plg
```

### Known Limitations
- Background queue is functional but simplified (full implementation planned)
- Preview feature stubbed (implementation planned for v0.2.0)
- Search is directory-local only (recursive search planned)
- Maximum tested file count: 20,000 files per directory

### Requirements
- Unraid 7.2.0-rc.1 or later
- PHP 8.x with JSON and ZIP extensions
- x86_64 architecture

### Compatibility
- Tested on Unraid 7.2.0-rc.1
- Compatible with all modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive (tablets and smartphones)

### Security Notes
- All file operations are logged to `/var/log/explorerx/`
- Operations are restricted to `/mnt` by default
- Protected system paths cannot be deleted
- CSRF protection on all write operations
- Path traversal attempts are blocked and logged

### Documentation
- README.md: Installation and usage guide
- TESTING.md: Comprehensive testing procedures
- CHANGELOG.md: This file
- Inline code documentation

### Support
- Issues: https://github.com/N85UK/UNRAID_Apps/issues
- Documentation: https://github.com/N85UK/UNRAID_Apps/wiki

---

## Version History

### Version Numbering
ExplorerX uses Semantic Versioning:
- **MAJOR**: Breaking changes or major feature releases
- **MINOR**: New features, backwards compatible
- **PATCH**: Bug fixes, security patches

### Release Process
1. Update version in `explorerx.plg` and source files
2. Update `CHANGELOG.md` with changes
3. Build package with `createpackage.sh`
4. Update MD5 hash in `explorerx.plg`
5. Create GitHub release with tag `vX.Y.Z`
6. Upload `.txz` package to release
7. Test installation via URL

### Future Roadmap

#### v0.2.0 (Planned - Q4 2025)
- Full file preview implementation (images, videos, text, PDFs)
- Recursive directory search
- Enhanced background queue with real-time progress
- File editor for text files
- Bookmark/favorite locations
- Thumbnail view for images
- Drag-and-drop file operations
- Multiple theme support

#### v0.3.0 (Planned - Q1 2026)
- Integration with Unraid shares API
- Disk space visualization
- File comparison tool
- Batch rename utility
- FTP/SFTP support
- Cloud storage integration
- Advanced permission management

#### v1.0.0 (Planned - Q2 2026)
- Stable production release
- Full feature parity with requirements
- Comprehensive test coverage
- Performance optimizations
- Multi-language support
- Plugin API for extensions

---

**Note:** This is an initial release focused on core functionality and security. 
Features will be expanded based on community feedback and requirements.

[Unreleased]: https://github.com/N85UK/UNRAID_Apps/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/N85UK/UNRAID_Apps/releases/tag/v0.1.0
