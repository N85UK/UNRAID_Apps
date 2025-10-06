# Changelog

All notable changes to the UNRAID Apps project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2025.10.06.02.00] - 2025-10-06

### Added
- ExplorerX Plugin v2025.10.06.02.00 - **SAFE VERSION**
- Completely safe installation scripts that only touch ExplorerX files
- Standalone tab interface (not in Tools menu)
- Simple file browser with directory navigation
- Enhanced error handling and recovery
- Comprehensive documentation cleanup

### Changed
- Completely rewritten installation scripts for safety
- Removed all dangerous global plugin directory modifications
- Simplified interface to single-pane file browser
- Updated all documentation to reflect current functionality

### Fixed
- **CRITICAL**: Fixed installation scripts that were breaking plugin systems
- Removed dangerous `chown -R root:root /usr/local/emhttp/plugins/` commands
- Safe permission handling only for ExplorerX directory
- Eliminated macOS metadata files from packages
- Fixed plugin interface to be standalone tab

### Removed
- Complex multi-pane interface (simplified to basic file browser)
- Unnecessary CSS and JavaScript files
- Dangerous global plugin permission modifications
- Outdated installation scripts and automation

## [2025.10.06.01.00] - 2025-10-06 (Deprecated - Had permission issues)

### Issues
- Still contained dangerous global plugin directory permission changes
- Installation scripts could break other plugins
- **Replaced by v2025.10.06.02.00**
- Updated plugin manifest and packaging
- Improved installation reliability

### Fixed
- Package download URL issues
- MD5 hash validation

## [Unreleased]

## [2025.10.05.07.00] - 2025-10-05

### Added
- ExplorerX Plugin v2025.10.06.02.00
- Automated release process via GitHub Actions
- Enhanced plugin documentation

### Changed
- Updated plugin manifest and packaging
- Improved installation reliability

### Fixed
- Package download URL issues
- MD5 hash validation

## [Unreleased]

## [2025.10.05.06.00] - 2025-10-05

### Added
- ExplorerX Plugin v2025.10.06.02.00
- Automated release process via GitHub Actions
- Enhanced plugin documentation

### Changed
- Updated plugin manifest and packaging
- Improved installation reliability

### Fixed
- Package download URL issues
- MD5 hash validation

## [Unreleased]

## [2025.10.05.05.00] - 2025-10-05

### Added
- ExplorerX Plugin v2025.10.06.02.00
- Automated release process via GitHub Actions
- Enhanced plugin documentation

### Changed
- Updated plugin manifest and packaging
- Improved installation reliability

### Fixed
- Package download URL issues
- MD5 hash validation

## [Unreleased]

## [2025.10.05.04.00] - 2025-10-05

### Added
- ExplorerX Plugin v2025.10.06.02.00
- Automated release process via GitHub Actions
- Enhanced plugin documentation

### Changed
- Updated plugin manifest and packaging
- Improved installation reliability

### Fixed
- Package download URL issues
- MD5 hash validation

## [Unreleased]

## [2025.10.05.03.00] - 2025-10-05

### Added
- ExplorerX Plugin v2025.10.06.02.00
- Automated release process via GitHub Actions
- Enhanced plugin documentation

### Changed
- Updated plugin manifest and packaging
- Improved installation reliability

### Fixed
- Package download URL issues
- MD5 hash validation

## [Unreleased]

### Added
- ExplorerX Plugin with advanced multi-pane file management
- Background task queue for bulk operations
- Native UNRAID integration without Docker overhead
- Enhanced security with path validation and CSRF protection
- Keyboard shortcuts for power users
- ZIP/unzip and checksum support
- Real-time progress monitoring

### Changed
- Repository focus shifted to ExplorerX Plugin as the primary file manager
- Updated documentation to reflect current active projects
- Standardized project structure and naming conventions

### Removed
- **File_Explorer_Plugin**: Old prototype plugin removed as superseded by ExplorerX Plugin
- References to deprecated plugin projects in documentation

### Fixed
- Repository structure cleanup and organization
- Updated installation URLs and references

## [0.1.1] - 2025-10-04

### Fixed
- **ExplorerX Plugin**: Fixed webGUI Error 500 during plugin uninstall
- Added proper service restart in uninstall script
- Added PHP cache clearing during uninstall
- Improved cleanup of temporary files and references

## [0.1.0] - 2025-10-04

### Added
- **ExplorerX Plugin**: Initial release
- Multi-pane file browser with dual-pane navigation
- Bulk file operations (copy, move, delete)
- Background task queue with progress tracking
- Safe path guards restricted to /mnt by default
- Quick file previews (text, image, video)
- Keyboard shortcuts for power users
- ZIP/unzip support for archives
- Checksum generation (MD5, SHA256)
- CSRF protection on all operations
- Path sanitization and traversal prevention
- Responsive UI for mobile devices
- Integration with UNRAID 7.2.0-rc.1 webGUI
- No Docker overhead - pure native implementation
- AWS EUM (Extended User Management) application
- UNRAID API integration bounty submission

### Security
- Added security policy and vulnerability reporting guidelines
- Implemented secure file access controls with path validation
- Added comprehensive input validation for all user inputs
- CSRF protection on all file operations

---

## Release Notes

### ExplorerX Plugin v0.1.1
This release provides a comprehensive native file management solution for UNRAID servers:

- **Advanced File Operations**: Copy, move, delete, rename, upload, download with bulk support
- **Multi-Pane Interface**: Dual-pane navigation for power users
- **Background Processing**: Large operations run in background without blocking UI
- **Security**: Role-based access control, path validation, and CSRF protection
- **Native Integration**: Seamless UNRAID webGUI integration with no Docker overhead
- **Enhanced Reliability**: Fixed uninstall issues and improved error handling

### Installation Requirements
- UNRAID 7.2.0-rc.1 or higher
- x86_64 architecture
- PHP 8.x (included in UNRAID)

### Upgrade Path
- New installations: Use the plugin URL directly in UNRAID plugin installer
- Future updates: Will be handled automatically through UNRAID plugin system

### Known Issues
- None at this time

### Support
For issues, feature requests, or contributions, please visit the project repository:
https://github.com/N85UK/UNRAID_Apps