# Changelog

All notable changes to the UnRaid Apps project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of File Manager Plugin for UNRAID
- Advanced file management capabilities with NestJS backend
- FileBrowser integration for web-based file operations
- Multi-user support with role-based access control
- Real-time file system monitoring
- UNRAID webGUI integration
- Automated installation and configuration scripts
- AWS EUM (Extended User Management) application

### Changed
- Moved plugin directory from "File Manager" to "FileManager" to fix XML parsing issues
- Updated all repository URLs to use correct GitHub raw file paths
- Standardized documentation across all components

### Fixed
- XML parsing error in plugin manifest due to URL encoding issues
- MD5 hash validation for plugin archives
- Installation script permissions and directory structure

### Security
- Added security policy and vulnerability reporting guidelines
- Implemented secure file access controls
- Added input validation for all user inputs

## [2025.10.03.20] - 2025-10-03

### Fixed
- **FileBrowser Binary Installation**: Corrected version command from `--version` to `version` for proper CLI compatibility
- **Installation Failures**: Resolved binary testing errors that prevented successful FileBrowser installation
- **Cross-Platform Compatibility**: Enhanced binary verification across different architectures

### Changed
- Updated plugin version to v2025.10.03.20
- Improved installation script reliability

## [2025.10.03.19] - 2025-10-03

### Added
- **Enhanced FileBrowser Installation System**
  - Network connectivity verification before download attempts
  - Multiple download sources (GitHub primary, JSDeliver and Raw GitHub fallbacks)
  - Comprehensive error handling with detailed diagnostic messages
  - Binary testing before and after installation
  - Automatic retry logic with exponential backoff
  - Timeout handling for network operations
- **Improved Reliability Features**
  - Backup creation for existing binaries during updates
  - Enhanced logging system with debug information
  - Better error recovery and user feedback
  - Input validation and security enhancements

### Changed
- Updated plugin version consistency across all files
- Optimized archive size by removing unused files
- Enhanced user interface with better error messaging
- Improved installation workflow with progress indicators

### Fixed
- Version number mismatches in various files
- Potential installation failures due to network issues
- Incomplete error reporting during binary download
- Archive corruption issues from previous builds

### Security
- Enhanced input validation for all user inputs
- Secure file operations with proper permissions
- Improved error handling to prevent information disclosure

## [Initial] - 2025-01-01

### Added
- Project repository initialization
- Basic project structure
- Initial development environment setup
- AWS EUM application foundation

---

## Release Notes

### File Manager Plugin v2025.10.03.20
This release provides a comprehensive file management solution for UNRAID servers with enhanced installation reliability:

- **Advanced File Operations**: Copy, move, delete, rename, upload, download
- **Web Interface**: Modern, responsive file browser accessible via UNRAID webGUI
- **User Management**: Multi-user support with configurable permissions
- **Real-time Updates**: Live file system monitoring and updates
- **Security**: Role-based access control and secure file operations
- **Integration**: Seamless UNRAID webGUI integration with status monitoring
- **Enhanced Installation**: Fixed FileBrowser binary installation issues

### Installation Requirements
- UNRAID 6.8.0 or higher
- Minimum 1GB available disk space
- Network access for initial plugin download

### Upgrade Path
- New installations: Use the plugin URL directly in UNRAID plugin installer
- Future updates: Will be handled automatically through UNRAID plugin system

### Known Issues
- None at this time

### Support
For issues, feature requests, or contributions, please visit the project repository:
https://github.com/paulmccann140689/UnRiaid_Apps