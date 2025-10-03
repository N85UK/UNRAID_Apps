# Changelog

All notable changes to the UNRAID File Manager Plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial plugin development
- Modern web interface with responsive design
- File management capabilities (upload, download, move, copy, delete)
- User authentication and authorization
- Real-time file system monitoring
- Mobile-responsive design
- Dark/light theme support

### Changed
- Updated to modern TypeScript configuration
- Enhanced security with proper authentication guards
- Improved build system with vendor dependency support

### Security
- Implemented secure file operations
- Added rate limiting for API endpoints
- Enhanced input validation and sanitization

# Changelog

All notable changes to this project will be documented in this file.

## [2025.10.03.3] - 2025-10-03 (v1.2 - Cross-Server Compatibility)

### Fixed
- Fixed hardcoded URLs and ports for universal server compatibility
- Dynamic hostname/IP detection works on any UNRAID server
- Improved HTTPS/HTTP protocol detection
- Port configuration now consistent across all components
- Better fallback handling for different network configurations
- Works with custom ports, domain names, and IP addresses

## [2025.10.03.2] - 2025-10-03 (v1.1 - Admin Setup)

### Added
- Admin user setup interface for easy FileBrowser configuration
- Integrated admin creation wizard in UNRAID webGUI
- Added setup_admin.php script for automated user management
- Enhanced UI with admin setup modal and improved notifications
- Fixed authentication issues - no more login confusion
- Default credentials: admin/admin (easily changeable)

## [2025.10.03.1] - 2025-10-03 (v1 Release)

### Added
- First stable production release
- UNRAID 7.2+ native API integration (compatible with 7.2.0-rc.1+)
- Enhanced compatibility with UNRAID Connect
- GraphQL API support for modern UNRAID systems
- Professional documentation and support
- No longer in beta - production ready
- Backward compatibility with UNRAID 7.0+ systems

### Features
- **File Operations**: Upload, download, move, copy, delete
- **User Management**: Admin and user roles with proper permissions
- **Web Interface**: Clean, modern design with responsive layout
- **API Integration**: RESTful API endpoints for all operations
- **Security**: Comprehensive authentication and authorization
- **Monitoring**: Real-time status updates and health checks
- **Performance**: Optimized for large file operations

### Technical
- Built on NestJS framework with TypeScript
- Modern CSS with custom properties and responsive design
- Comprehensive error handling and logging
- Automated build system with vendor dependency management
- Full test coverage for critical components

### Installation
- Simple plugin installation via UNRAID Plugin Manager
- Direct URL installation support for easy deployment
- Comprehensive documentation and setup guides