# UNRAID Apps Repository

A collection of applications and plugins for UNRAID systems, providing enhanced functionality and user experience.

## 🚀 Available Applications

### 📁 File Manager Plugin
**Professional file management for UNRAID**

- **Location**: [`Plugins/FileManager/`](Plugins/FileManager/)
- **Author**: Paul McCann
- **License**: MIT
- **Status**: ✅ Production Ready

**Features:**
- Modern web interface with responsive design
- Secure file operations (upload, download, copy, move, delete)
- User authentication and role-based permissions
- Real-time status monitoring
- Mobile-optimized interface
- NestJS backend with FileBrowser integration

**Installation:**
```
https://github.com/N85UK/UnRiaid_Apps/raw/main/Plugins/FileManager/file-manager.plg
```

### 📧 AWS End User Messaging (EUM)
**Send SMS messages via AWS Pinpoint**

- **Location**: [`Apps/AWS_EUM/`](Apps/AWS_EUM/)
- **Author**: N85UK
- **License**: MIT
- **Status**: ✅ Production Ready

**Features:**
- Send SMS via AWS Pinpoint service
- Web interface for message composition
- Docker container deployment
- Environment-based configuration
- Rate limiting and security features

**Installation:**
```
https://github.com/N85UK/UnRiaid_Apps/raw/main/Apps/AWS_EUM/template.cfg
```

## 📦 Installation Methods

### Option 1: Community Applications (Recommended)
1. Install Community Applications plugin if not already installed
2. Go to **Apps** tab in UNRAID
3. Search for the application name
4. Click **Install**

### Option 2: Direct URL Installation
1. Go to **Plugins** → **Install Plugin** (for plugins) or **Docker** → **Add Container** (for apps)
2. Enter the installation URL from above
3. Click **Install**

### Option 3: Custom Repository
1. Go to **Settings** → **Community Applications**
2. Add custom repository: `https://github.com/N85UK/UnRiaid_Apps`
3. Refresh and install from **Apps** tab

## 🛠️ Development

### Repository Structure
```
UnRiaid_Apps/
├── Apps/                   # Docker applications
│   └── AWS_EUM/           # AWS End User Messaging
├── Plugins/               # UNRAID plugins
│   └── FileManager/       # File Manager Plugin
└── README.md              # This file
```

### Contributing
We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on UNRAID
5. Submit a pull request

### Development Guidelines
- Follow UNRAID plugin/application standards
- Include comprehensive documentation
- Add proper error handling and logging
- Test on multiple UNRAID versions
- Update README and changelog

## 📋 Requirements

### UNRAID Version Support
- **Minimum**: UNRAID 6.8+
- **Recommended**: UNRAID 6.12+
- **Tested**: UNRAID 6.8 through 6.12

### System Requirements
- **Architecture**: x86_64 (Intel/AMD)
- **RAM**: 2GB+ available
- **Storage**: Varies by application
- **Network**: Internet access for installation

## 🆘 Support

### Getting Help
1. **Check Documentation**: Each app/plugin has detailed docs in its folder
2. **Search Issues**: Look through [GitHub Issues](https://github.com/N85UK/UnRiaid_Apps/issues)
3. **UNRAID Forums**: Post in the appropriate plugin/app support thread
4. **Create Issue**: If you find a bug or need help

### Reporting Issues
When reporting issues, please include:
- UNRAID version
- Application/plugin version
- Error messages/logs
- Steps to reproduce
- System information

## 📄 License

This repository and its applications are licensed under the MIT License unless otherwise specified.

```
MIT License

Copyright (c) 2025 N85UK

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgments

- **UNRAID Team**: For creating an excellent platform
- **Community Applications Team**: For the plugin distribution system
- **UNRAID Community**: For feedback, testing, and support
- **Open Source Contributors**: For libraries and tools used

## 📊 Repository Stats

![GitHub stars](https://img.shields.io/github/stars/N85UK/UnRiaid_Apps)
![GitHub forks](https://img.shields.io/github/forks/N85UK/UnRiaid_Apps)
![GitHub issues](https://img.shields.io/github/issues/N85UK/UnRiaid_Apps)
![GitHub license](https://img.shields.io/github/license/N85UK/UnRiaid_Apps)

---

**Made with ❤️ for the UNRAID community**