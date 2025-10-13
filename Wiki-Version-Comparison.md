# Version Comparison Guide

**Comprehensive comparison of all UNRAID Apps Repository projects and their variants**

## 📁 **ExplorerX Plugin Versions**

### Version Timeline
| Version | Status | Release Date | Key Features |
|---------|--------|--------------|--------------|
| **v2025.10.10.0002** | 🔧 **Current (Debug)** | Oct 2025 | Enhanced debugging, interface investigation |
| **v2025.10.10.0002** | ✅ Previous Working | Oct 2025 | Working interface, Tools menu integration |
| **v2025.10.10.0002** | ✅ Safe Stable | Oct 2025 | Safe installation, basic file browser |

### Current Debug Version (v2025.10.10.0002)
**Purpose**: Investigating interface rendering issues
- 🔧 **Debug Features**: Enhanced API logging and error reporting
- 🔍 **Investigation**: Resolving HTML code display instead of file browser
- 📊 **Debugging Tools**: Browser console output and debug panels
- ✅ **Safety**: 100% safe installation, no system interference
- 🛠️ **Access**: Via Tools → ExplorerX (shows debug information)

### Feature Comparison
| Feature | Debug v0002 | Working v0001 | Safe v02.00 |
|---------|-------------|---------------|-------------|
| **Installation Safety** | ✅ | ✅ | ✅ |
| **File Browser Interface** | 🔧 Debug Mode | ✅ Working | ✅ Working |
| **Tools Menu Integration** | ✅ | ✅ | ✅ |
| **Debug Logging** | ✅ Enhanced | ❌ | ❌ |
| **Error Reporting** | ✅ Comprehensive | ✅ Basic | ✅ Basic |
| **Interface Status** | 🔧 Debug Info | ✅ File Browser | ✅ File Browser |

## 📧 **AWS EUM Suite Comparison**

### Edition Overview
| Edition | Version | Target Users | Complexity | Database | Multi-User |
|---------|---------|--------------|------------|-----------|------------|
| **v2.0 Stable** | 2.0.0 | New users, simple setups | ⭐ Simple | File-based | ❌ Single |
| **v3.0 Enhanced** | 3.0.0 | Modern UI enthusiasts | ⭐⭐ Moderate | File-based | ❌ Single |
| **MariaDB Enterprise** | 1.0.0 | Teams, enterprises | ⭐⭐⭐ Advanced | MariaDB/MySQL | ✅ Multi-user |

### Comprehensive Feature Matrix

#### **Core SMS Functionality**
| Feature | v2.0 Stable | v3.0 Enhanced | MariaDB Enterprise |
|---------|-------------|---------------|-------------------|
| **AWS Pinpoint Integration** | ✅ | ✅ | ✅ |
| **SMS Sending** | ✅ | ✅ | ✅ |
| **Message History** | ✅ | ✅ | ✅ |
| **Cost Estimation** | ✅ | ✅ | ✅ |
| **Originator Management** | ✅ | ✅ | ✅ |
| **Multi-segment Messages** | ✅ | ✅ | ✅ |
| **Rate Limiting** | ✅ | ✅ | ✅ |

#### **User Interface**
| Feature | v2.0 Stable | v3.0 Enhanced | MariaDB Enterprise |
|---------|-------------|---------------|-------------------|
| **Interface Style** | Clean & Simple | Modern Material Design | Enterprise Dashboard |
| **Dark Mode** | ❌ | ✅ Persistent Toggle | ✅ User Preferences |
| **Responsive Design** | ✅ Basic | ✅ Fully Responsive | ✅ Enterprise Mobile |
| **Real-time Updates** | ❌ | ✅ WebSocket | ✅ Live Dashboard |
| **Modern Animations** | ❌ | ✅ Smooth Transitions | ✅ Professional |
| **Mobile Optimization** | ✅ Basic | ✅ Mobile-first | ✅ Enterprise Mobile |

#### **Analytics & Reporting**
| Feature | v2.0 Stable | v3.0 Enhanced | MariaDB Enterprise |
|---------|-------------|---------------|-------------------|
| **Basic Analytics** | ✅ | ✅ | ✅ |
| **Chart.js Integration** | ❌ | ✅ Real-time Charts | ✅ Advanced Analytics |
| **Usage Statistics** | ✅ Basic | ✅ Visual Charts | ✅ Comprehensive Reports |
| **Cost Analytics** | ✅ Simple | ✅ Chart-based | ✅ Detailed Breakdown |
| **Historical Data** | ✅ File Storage | ✅ Enhanced Storage | ✅ Database Analytics |
| **Export Capabilities** | ❌ | ✅ Basic | ✅ Advanced Export |

#### **Authentication & Security**
| Feature | v2.0 Stable | v3.0 Enhanced | MariaDB Enterprise |
|---------|-------------|---------------|-------------------|
| **Authentication** | None Required | None Required | ✅ JWT + bcrypt |
| **User Management** | ❌ | ❌ | ✅ Full User Management |
| **Role-Based Access** | ❌ | ❌ | ✅ Admin/User/ReadOnly |
| **Session Management** | ❌ | ❌ | ✅ Secure Sessions |
| **API Key Management** | ❌ | ❌ | ✅ Enterprise API Keys |
| **Audit Trails** | Basic Logs | Enhanced Logs | ✅ Comprehensive |

#### **Data Storage**
| Feature | v2.0 Stable | v3.0 Enhanced | MariaDB Enterprise |
|---------|-------------|---------------|-------------------|
| **Storage Type** | File-based | File-based | External Database |
| **Database Support** | ❌ | ❌ | ✅ MariaDB/MySQL |
| **Connection Pooling** | ❌ | ❌ | ✅ Optimized |
| **Automated Migrations** | ❌ | ❌ | ✅ Schema Updates |
| **Backup Integration** | Manual | Manual | ✅ Database Backup |
| **Scalability** | Limited | Limited | ✅ High Scalability |

#### **Enterprise Features**
| Feature | v2.0 Stable | v3.0 Enhanced | MariaDB Enterprise |
|---------|-------------|---------------|-------------------|
| **Multi-User Support** | ❌ | ❌ | ✅ Unlimited Users |
| **User Roles** | N/A | N/A | ✅ 3 Role Levels |
| **Team Management** | ❌ | ❌ | ✅ Department Support |
| **Compliance Features** | Basic | Enhanced | ✅ Enterprise Grade |
| **API Integration** | Basic | Enhanced | ✅ Full REST API |
| **SSO Support** | ❌ | ❌ | 🔄 Planned |

### **Performance Comparison**

#### **Resource Usage**
| Metric | v2.0 Stable | v3.0 Enhanced | MariaDB Enterprise |
|--------|-------------|---------------|-------------------|
| **Memory Usage** | ~128MB | ~256MB | ~512MB |
| **Disk Space** | ~50MB | ~100MB | ~200MB + Database |
| **CPU Usage** | Low | Low-Medium | Medium |
| **Network** | Minimal | Moderate | Moderate-High |
| **Dependencies** | Node.js only | Node.js + Chart.js | Node.js + Database |

#### **Scalability**
| Aspect | v2.0 Stable | v3.0 Enhanced | MariaDB Enterprise |
|--------|-------------|---------------|-------------------|
| **Concurrent Users** | 1 | 1 | 5-500+ |
| **Message Volume** | Low-Medium | Medium | High |
| **Data Retention** | File limits | File limits | Database scaling |
| **Geographic Distribution** | Single instance | Single instance | Multi-region ready |

### **Use Case Recommendations**

#### **Choose v2.0 Stable If:**
- 🎯 **New to SMS automation**
- 🎯 **Simple, reliable messaging needs**
- 🎯 **Minimal resource usage requirements**
- 🎯 **Single user environment**
- 🎯 **Quick setup priority**
- 🎯 **Production stability critical**

#### **Choose v3.0 Enhanced If:**
- 🎯 **Modern UI appreciation**
- 🎯 **Visual analytics requirements**
- 🎯 **Dark mode preference**
- 🎯 **Chart-based reporting needs**
- 🎯 **Mobile-first usage**
- 🎯 **Real-time updates desired**

#### **Choose MariaDB Enterprise If:**
- 🎯 **Team/multi-user environment**
- 🎯 **Role-based access control needs**
- 🎯 **Compliance requirements**
- 🎯 **High message volumes**
- 🎯 **Database integration existing**
- 🎯 **Enterprise security standards**
- 🎯 **Audit trail requirements**
- 🎯 **API integration needs**

## 🏆 **UNRAID API Integration**

### Bounty Submission Status
| Component | Status | Completeness | Ready for Integration |
|-----------|--------|--------------|----------------------|
| **NestJS Module** | ✅ Complete | 100% | ✅ Yes |
| **Vue.js WebGUI** | ✅ Complete | 100% | ✅ Yes |
| **Authentication Bridge** | ✅ Complete | 100% | ✅ Yes |
| **HTTP/WebSocket Proxy** | ✅ Complete | 100% | ✅ Yes |
| **Service Lifecycle** | ✅ Complete | 100% | ✅ Yes |
| **Documentation** | ✅ Complete | 100% | ✅ Yes |

### Integration Requirements Met
- ✅ **FileBrowser Integration**: NestJS subprocess management
- ✅ **UNRAID Session Bridge**: Cookie to header authentication
- ✅ **API Compliance**: Follows UNRAID API patterns
- ✅ **WebGUI Pattern**: Matches LogViewer Vue.js structure
- ✅ **Configuration**: JSON config following API standards
- ✅ **Virtual Roots**: UNRAID path configuration support

## 🔧 **Migration Between Versions**

### AWS EUM Version Migration

#### **v2.0 → v3.0 Enhanced**
1. **Backup Data**: Export message history from v2.0
2. **Install v3.0**: Deploy new container alongside v2.0
3. **Migrate Settings**: Transfer AWS configuration
4. **Import Data**: Restore message history (if needed)
5. **Verify Features**: Test dark mode and chart functionality
6. **Remove v2.0**: Safely remove old container

#### **v2.0/v3.0 → MariaDB Enterprise**
1. **Database Setup**: Prepare MariaDB/MySQL database
2. **Data Export**: Export existing message data
3. **Install Enterprise**: Deploy with database configuration
4. **Create Users**: Set up user accounts and roles
5. **Import Data**: Migrate historical data to database
6. **Configure Access**: Set up role-based permissions
7. **Test Multi-User**: Verify user management functionality

### ExplorerX Version Updates
- **Automatic Updates**: Plugin system handles version updates
- **Safe Upgrades**: Only ExplorerX files modified during updates
- **Rollback Support**: Previous versions can be restored if needed
- **Debug to Stable**: Future stable version will replace debug version automatically

## 📊 **Decision Matrix**

### Quick Selection Guide

**If you need...**
- **Simple SMS sending** → AWS EUM v2.0 Stable
- **Modern interface with charts** → AWS EUM v3.0 Enhanced  
- **Team SMS management** → AWS EUM MariaDB Enterprise
- **File management (working)** → Wait for ExplorerX stable update
- **File management (debug help)** → ExplorerX v2025.10.10.0002 Debug
- **UNRAID API integration** → Use provided bounty submission

**If you are...**
- **Beginner** → Start with v2.0 Stable
- **UI enthusiast** → Choose v3.0 Enhanced
- **Enterprise admin** → Deploy MariaDB Enterprise
- **Developer** → Use UNRAID API integration
- **Troubleshooter** → Help with ExplorerX debug version

---

**🔄 Updates**: This comparison is updated regularly as new versions are released. Current as of October 2025 with all major documentation updates applied.

**📞 Questions?** Contact support at hello@git.n85.uk for help choosing the right version for your needs.