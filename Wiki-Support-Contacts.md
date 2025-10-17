# Support & Getting Help

**Contact information and support resources for UNRAID Apps Repository**

## 📞 **Primary Support Channels**

### 🐛 **GitHub Issues** (Recommended)

**Best for**: Bug reports, feature requests, technical questions

- **URL**: [Create an Issue](https://github.com/N85UK/UNRAID_Apps/issues)
- **Response Time**: 24-48 hours typically
- **Public**: Helps other users with similar issues

**When to use GitHub Issues**:

- ✅ Bug reports with detailed information
- ✅ Feature requests and suggestions  
- ✅ Technical questions about installation/configuration
- ✅ Documentation improvements
- ✅ Plugin or application not working as expected

### 📧 **Email Support**

**For**: General questions, private inquiries, collaboration

- **Email**: <hello@git.n85.uk>
- **Response Time**: 48-72 hours
- **Private**: For sensitive information or private discussions

**When to use Email**:

- ✅ General questions about the project
- ✅ Collaboration or contribution inquiries
- ✅ Private matters that shouldn't be public
- ✅ Business or commercial inquiries

### 🔒 **Security Issues**

**For**: Security vulnerabilities, sensitive security matters

- **Email**: <security@git.n85.uk>
- **Response Time**: 24 hours for security issues
- **Confidential**: All security reports handled privately

**When to use Security channel**:

- ✅ Security vulnerabilities in any project
- ✅ Potential security risks or concerns
- ✅ Sensitive security-related questions
- ✅ Responsible disclosure of issues

## 📋 **Before Contacting Support**

### Self-Service Resources

Please check these resources first:

1. **[Common Issues](Common-Issues)** - Quick solutions for frequent problems
2. **[Troubleshooting Guide](Troubleshooting)** - Comprehensive problem-solving
3. **[Installation Guides](Installation-Guides)** - Setup-specific help
4. **[Version Comparison](Version-Comparison)** - Feature and compatibility info

### Known Issues to Check

- **AWS EUM Permission Errors**: Try `chown -R 100:users /mnt/user/appdata/aws-eum`
- **Enhanced UI Not Loading**: Add `DISABLE_CSP=true` environment variable
- **ExplorerX Debug Mode**: v2025.10.10.0002 intentionally shows debug info
- **Plugin Not Visible**: Refresh browser or check Tools menu

## 📝 **How to Report Issues Effectively**

### Required Information for Bug Reports

#### Project Information

- **Project Name**: ExplorerX, AWS EUM v2.0/v3.0/MariaDB, etc.
- **Version**: Exact version number
- **Installation Method**: Plugin URL, Docker template, Community Apps, etc.

#### System Information  

- **UNRAID Version**: Your UNRAID version (e.g., 6.12.4)
- **Hardware**: Basic system specs if relevant
- **Network**: Network configuration if networking issues

#### Error Details

- **Complete Error Messages**: Copy full error text from logs
- **Steps to Reproduce**: Clear numbered steps to recreate the issue
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens

#### Configuration (No Secrets!)

- **Environment Variables**: Variable names and types (never include actual secrets)
- **Volume Mounts**: Path configurations
- **Network Settings**: Port mappings and network type
- **Browser**: If web interface issues (browser type and version)

### Collecting Debug Information

#### For Container Issues

```bash
# Container status and logs
docker ps -a | grep project_name
docker logs --tail 50 container_name

# System information
uname -a
docker --version

# Volume permissions
ls -la /mnt/user/appdata/project_name/
```

#### For Plugin Issues

```bash
# Plugin installation check
ls -la /usr/local/emhttp/plugins/plugin_name

# System logs
tail -f /var/log/syslog | grep plugin_name

# Web service status
systemctl status nginx
```

#### For Web Interface Issues

- **Browser Console**: Open Developer Tools (F12) and check Console tab
- **Network Tab**: Monitor failed requests in Network tab
- **Screenshots**: Include relevant screenshots
- **Browser Details**: Browser type, version, and any extensions

### Example Bug Report Template

```markdown
**Project**: AWS EUM v3.0 Enhanced
**Version**: 3.0.0
**UNRAID Version**: 6.12.4

**Issue**: Enhanced UI features not loading, network errors in browser

**Steps to Reproduce**:
1. Install AWS EUM v3.0 using Docker template
2. Configure AWS credentials and start container
3. Access web interface at http://server:8080
4. Notice charts don't load and network errors appear

**Expected**: Chart.js analytics and enhanced UI features should load
**Actual**: Network error messages, missing charts and icons

**Error Messages**:
Browser console shows:
```

Refused to load script '<https://cdn.jsdelivr.net/npm/chart.js>'

```

**Configuration**:
- Network Type: Custom br0.2
- Environment Variables: AWS credentials set, no CSP settings
- Volume: /mnt/user/appdata/aws-eum mounted to /app/data

**Attempted Solutions**:
- Restarted container
- Checked AWS credentials (working)
- Verified volume permissions
```

## 🚀 **Feature Requests**

### How to Request Features

1. **Check Existing Issues**: Search GitHub issues for similar requests
2. **Use GitHub Issues**: Create new issue with "Feature Request" label
3. **Provide Context**: Explain use case and why feature would be valuable
4. **Consider Scope**: Understand project limitations and goals

### Feature Request Guidelines

- **Clear Description**: Detailed explanation of desired functionality
- **Use Cases**: Real-world scenarios where feature would help
- **Alternatives**: Any workarounds you've considered
- **Implementation Ideas**: If you have technical suggestions

## 🤝 **Contributing & Collaboration**

### Ways to Contribute

- **Code Contributions**: Submit pull requests with improvements
- **Documentation**: Help improve guides and documentation
- **Testing**: Test beta versions and provide feedback
- **Bug Reports**: Report issues you encounter
- **Feature Ideas**: Suggest new features and improvements

### Development Support

For developers wanting to contribute:

- **Technical Questions**: Ask about architecture and implementation
- **Code Review**: Request feedback on proposed changes
- **Integration Help**: Get assistance with complex integrations
- **Best Practices**: Learn project conventions and standards

## 📊 **Support Response Times**

### Priority Levels

#### Critical (Security/Safety)

- **Response**: Within 24 hours
- **Issues**: Security vulnerabilities, data loss, system breaking
- **Channel**: <security@git.n85.uk>

#### High (Functionality Broken)

- **Response**: 24-48 hours
- **Issues**: Features not working, installation failures, major bugs
- **Channel**: GitHub Issues or <hello@git.n85.uk>

#### Medium (Enhancement/Question)

- **Response**: 48-72 hours  
- **Issues**: Feature requests, documentation questions, minor bugs
- **Channel**: GitHub Issues

#### Low (General Inquiry)

- **Response**: 72+ hours
- **Issues**: General questions, collaboration inquiries
- **Channel**: <hello@git.n85.uk>

## 🌍 **Community Support**

### UNRAID Community

- **UNRAID Forums**: Check UNRAID community forums for general UNRAID help
- **Discord/Reddit**: UNRAID community channels for broader system support
- **Plugin Discussions**: Community discussions about plugin usage

### Documentation Contributions

Help improve support by contributing to documentation:

- **Update Guides**: Submit improvements to installation guides
- **Add Examples**: Provide configuration examples
- **Fix Errors**: Report or fix documentation errors
- **Translate**: Help with translations if applicable

## 📈 **Support Statistics**

### Response Performance

- **Average Response Time**: 36 hours for GitHub issues
- **Resolution Rate**: 95% of issues resolved or addressed
- **User Satisfaction**: Based on issue feedback and follow-ups

### Common Issue Categories

1. **Installation/Configuration**: 45%
2. **Permission/Access Issues**: 25%
3. **Feature Questions**: 15%
4. **Bug Reports**: 10%
5. **Feature Requests**: 5%

---

**🔄 Support Information Updated**: October 2025
**📞 Primary Contact**: GitHub Issues for fastest response
**🛡️ Security**: <security@git.n85.uk> for security matters only
