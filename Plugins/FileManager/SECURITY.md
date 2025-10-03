# Security Policy

## Supported Versions

We provide security updates for the following versions of the UNRAID File Manager Plugin:

| Version | Supported          |
| ------- | ------------------ |
| 2025.x  | ✅ |
| < 2025  | ❌ |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### 🔒 Private Disclosure (Preferred)

For sensitive security issues, please **DO NOT** create a public GitHub issue. Instead:

1. **GitHub Security Advisory**: Use GitHub's private vulnerability reporting feature
2. **Contact**: Create a private security advisory at [GitHub Security](https://github.com/N85UK/UnRiaid_Apps/security/advisories)
3. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### 📋 Public Disclosure

For less sensitive issues that don't pose immediate risk:

1. Create a [GitHub Issue](https://github.com/N85UK/UnRiaid_Apps/issues)
2. Use the label `security`
3. Provide detailed information

## 🛡️ Security Measures

Our plugin implements several security measures:

### Authentication & Authorization
- **User Authentication**: Secure login system
- **Role-Based Access**: Admin and user permission levels
- **Session Management**: Secure session handling
- **CSRF Protection**: Cross-site request forgery prevention

### Input Validation
- **File Path Validation**: Prevents directory traversal attacks
- **Upload Filtering**: File type and size restrictions
- **Input Sanitization**: All user inputs are validated and sanitized
- **SQL Injection Prevention**: Parameterized queries (where applicable)

### Network Security
- **Rate Limiting**: API endpoint protection
- **HTTPS Support**: Secure connections (when configured)
- **CORS Configuration**: Proper cross-origin resource sharing
- **Security Headers**: Appropriate HTTP security headers

### File Operations
- **Path Sanitization**: Secure file path handling
- **Permission Checks**: Proper file system permission validation
- **Upload Restrictions**: File size and type limitations
- **Quarantine Support**: Malicious file detection (when available)

## 🚨 Known Security Considerations

### User Responsibilities
1. **Regular Updates**: Keep the plugin updated
2. **Strong Passwords**: Use secure authentication
3. **Network Security**: Limit network exposure
4. **Access Control**: Restrict user permissions appropriately

### System Requirements
- UNRAID 6.8+ (for latest security features)
- Modern browser with JavaScript enabled
- Proper file system permissions

## 🔍 Security Audit

### Regular Assessments
- Code review for each release
- Dependency vulnerability scanning
- Security testing in development

### Third-Party Dependencies
We regularly audit our dependencies:
- Automated vulnerability scanning
- Regular updates to latest secure versions
- Minimal dependency footprint

## 📞 Response Process

### Timeline
- **Initial Response**: Within 48 hours
- **Vulnerability Assessment**: Within 1 week
- **Security Patch**: Within 2 weeks (critical issues)
- **Public Disclosure**: After patch release

### Communication
1. **Acknowledgment**: We'll confirm receipt of your report
2. **Investigation**: We'll investigate and assess the impact
3. **Resolution**: We'll develop and test a fix
4. **Release**: We'll release a security update
5. **Credit**: We'll acknowledge your contribution (if desired)

## 🏆 Recognition

Security researchers who responsibly disclose vulnerabilities will be:
- Listed in our security acknowledgments
- Credited in release notes (if desired)
- Invited to test fixes before public release

## 📚 Security Resources

### Best Practices
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [UNRAID Security Guidelines](https://unraid.net/security)
- [Web Application Security](https://cheatsheetseries.owasp.org/)

### Tools
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit) for dependency checking
- [ESLint Security Plugin](https://github.com/nodesecurity/eslint-plugin-security) for code analysis

## 🔧 Security Configuration

### Recommended Settings
```json
{
  "authentication": true,
  "adminOnly": false,
  "rateLimit": true,
  "uploadLimit": "100MB",
  "allowedFileTypes": ["jpg", "png", "pdf", "txt", "zip"],
  "maxConcurrentUsers": 10
}
```

### Network Configuration
```bash
# Recommended firewall rules
iptables -A INPUT -p tcp --dport 8080 -s YOUR_NETWORK/24 -j ACCEPT
iptables -A INPUT -p tcp --dport 8080 -j DROP
```

## 📜 Compliance

This plugin aims to comply with:
- General security best practices
- OWASP guidelines
- Common vulnerability prevention standards

## 📝 Version History

### Security Updates
- **2025.10.03**: Initial security framework
- Future updates will be documented here

---

Thank you for helping keep UNRAID File Manager Plugin secure! 🛡️