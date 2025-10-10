# Changelog

All notable changes to the UNRAID Apps project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2025.10.10.05.00] - 2025-10-10

### Added
- ExplorerX Plugin v2025.10.10.05.00
- Automated release process via GitHub Actions
- Enhanced plugin documentation

### Changed
- Updated plugin manifest and packaging
- Improved installation reliability

### Fixed
- Package download URL issues
- MD5 hash validation

## [Unreleased]

## [2025.10.10.04.00] - 2025-10-10

### Added
- ExplorerX Plugin v2025.10.10.05.00
- Automated release process via GitHub Actions
- Enhanced plugin documentation

### Changed
- Updated plugin manifest and packaging
- Improved installation reliability

### Fixed
- Package download URL issues
- MD5 hash validation

## [Unreleased]

## [2025.10.10.03.00] - 2025-10-10

### Added
- ExplorerX Plugin v2025.10.10.05.00
- Automated release process via GitHub Actions
- Enhanced plugin documentation

### Changed
- Updated plugin manifest and packaging
- Improved installation reliability

### Fixed
- Package download URL issues
- MD5 hash validation

## [Unreleased]

## [2025.10.10.02.00] - 2025-10-10

### Added
- ExplorerX Plugin v2025.10.10.05.00
- Automated release process via GitHub Actions
- Enhanced plugin documentation

### Changed
- Updated plugin manifest and packaging
- Improved installation reliability

### Fixed
- Package download URL issues
- MD5 hash validation

## [Unreleased]

## [2025.10.09.01.00] - 2025-10-09

### Added
- ExplorerX Plugin v2025.10.10.05.00
- Automated release process via GitHub Actions
- Enhanced plugin documentation

### Changed
- Updated plugin manifest and packaging
- Improved installation reliability

### Fixed
- Package download URL issues
- MD5 hash validation

## [Unreleased]

### Fixed
- **ExplorerX Plugin v2025.10.10.05.00**: VERIFICATION FIX - Fixed package verification script XML entity issue
- **ExplorerX Plugin**: Corrected verification logic that was causing "Failed to download correct package" errors
- **ExplorerX Plugin**: Removed problematic wget re-download attempts in verification script
- **ExplorerX Plugin**: Simplified verification to check package exists and validate MD5 hash
- **ExplorerX Plugin**: CRITICAL FIX - Resolved blank page issue when navigating to /ExplorerX
- **ExplorerX Plugin**: Fixed launch URL mismatch between "ExplorerX" and "explorerx.page" filename  
- **ExplorerX Plugin**: Fixed invalid page header formatting preventing UNRAID recognition
- **ExplorerX Plugin**: Fixed package compression format (xz instead of gzip for .txz files)
- **AWS EUM Docker Builds**: Fixed GitHub Actions workflow failures
- Resolved npm ci dependency conflicts after node_modules cleanup
- Updated test workflows to use npm install instead of npm ci
- Fixed Alpine Linux package manager compatibility in Dockerfiles

## [2025.10.09] - 2025-10-09

### Added
- **AWS EUM v3.0**: Enhanced UI edition with Chart.js integration, dark mode, and modern design
- **AWS EUM MariaDB**: Enterprise edition with multi-user authentication and database integration
- Comprehensive .dockerignore files for optimized Docker builds
- Enhanced .gitignore with Node.js patterns and development files

### Changed
- **Docker Configuration**: Updated all Dockerfiles for Alpine Linux compatibility
- **Dependency Management**: Switched from npm ci to npm install for fresh installations
- **Build Process**: Removed corrupted node_modules and package-lock.json files
- **GitHub Actions**: Updated workflows for reliable Docker image building and publishing

### Fixed
- **Critical Docker Builds**: Resolved all GitHub Actions workflow failures
- **Dependency Corruption**: Cleaned up 11,000+ corrupted dependency files
- **Alpine Linux Support**: Fixed package manager commands (apk vs apt-get)
- **Build Context**: Optimized Docker builds with proper ignore patterns

### Removed
- Corrupted node_modules directories across all AWS EUM versions
- Unnecessary build artifacts and development files
- Duplicate and outdated workflow configurations

## [2025.10.06.02.00] - 2025-10-06

### Added
- ExplorerX Plugin v2025.10.10.05.00 - **SAFE VERSION**
- Completely safe installation scripts that only touch ExplorerX files
- Standalone tab interface (not in Tools menu)
- Simple file browser with directory navigation
- Enhanced error handling and recovery

### Changed
- Completely rewritten installation scripts for safety
- Removed all dangerous global plugin directory modifications
- Simplified interface to single-pane file browser
- Updated all documentation to reflect current functionality

### Fixed
- **CRITICAL**: Fixed installation scripts that were breaking plugin systems
- Removed dangerous `chown -R root:root /usr/local/emhttp/plugins/` commands
- Safe permission handling only for ExplorerX directory
- Fixed plugin interface to be standalone tab

### Removed
- Complex multi-pane interface (simplified to basic file browser)
- Unnecessary CSS and JavaScript files
- Dangerous global plugin permission modifications

## [0.1.1] - 2025-10-04

### Fixed
- **ExplorerX Plugin**: Fixed webGUI Error 500 during plugin uninstall
- Added proper service restart in uninstall script
- Added PHP cache clearing during uninstall
- Improved cleanup of temporary files and references

## [0.1.0] - 2025-10-04

### Added
- **ExplorerX Plugin**: Initial release with multi-pane file browser
- **AWS EUM v2.0**: SMS messaging application via AWS Pinpoint
- **UNRAID API Integration**: Bounty submission for file management API
- Multi-pane file browser with dual-pane navigation
- Background task queue with progress tracking
- ZIP/unzip support and checksum generation
- CSRF protection and path validation security
- Native UNRAID integration without Docker overhead

---

## Release Notes

### Latest Improvements (2025.10.09)
- ✅ **All GitHub Actions workflows now building successfully**
- ✅ **Docker images publishing to GitHub Container Registry**
- ✅ **Clean dependency management with npm install**
- ✅ **Alpine Linux compatibility in all Dockerfiles**
- ✅ **Optimized build contexts with .dockerignore files**

### Docker Images Available
- **AWS EUM v2.0**: `ghcr.io/n85uk/aws-eum:latest`
- **AWS EUM v3.0**: `ghcr.io/n85uk/aws-eum-v3:latest`  
- **AWS EUM MariaDB**: `ghcr.io/n85uk/aws-eum-mariadb:latest`

### Installation Requirements
- **ExplorerX Plugin**: UNRAID 7.2.0-rc.1+ (native, no Docker)
- **AWS EUM Applications**: Docker support required

### Support
For issues, feature requests, or contributions:
- 📧 **Email**: hello@git.n85.uk
- 🐛 **Issues**: https://github.com/N85UK/UNRAID_Apps/issues
- 🔒 **Security**: security@git.n85.uk