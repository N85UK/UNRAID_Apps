# Security Policy

## Supported Versions

We actively support the following versions with security updates:

| Component | Version | Supported |
|-----------|---------|-----------|
| File Manager Plugin | 2025.10.03 | ✅ |
| AWS EUM | Current | ✅ |

## Security Standards

### Our Commitment
We take the security of UnRaid Apps seriously. Our security practices include:

- **Regular Security Reviews**: Code is reviewed for security vulnerabilities
- **Dependency Management**: Regular updates of dependencies to address known vulnerabilities
- **Input Validation**: All user inputs are validated and sanitized
- **Access Controls**: Role-based access control implementation
- **Secure Defaults**: Secure configurations by default
- **Data Protection**: Proper handling of sensitive information

### Security Features

#### File Manager Plugin
- **Authentication**: Integration with UNRAID user authentication
- **Authorization**: Role-based file access permissions
- **Input Validation**: Sanitization of file paths and user inputs
- **Secure File Operations**: Prevention of directory traversal attacks
- **Session Management**: Secure session handling and timeout

#### AWS EUM
- **IAM Integration**: Proper AWS Identity and Access Management
- **Encryption**: Data encryption in transit and at rest
- **API Security**: Secure API endpoints with proper authentication
- **Audit Logging**: Comprehensive logging of security events

## Reporting Security Vulnerabilities

### Responsible Disclosure
We encourage responsible disclosure of security vulnerabilities. Please **DO NOT** report security vulnerabilities through public GitHub issues.

### How to Report
To report a security vulnerability, please email us directly at:

**security@git.n85.uk**

Or create a private security advisory on GitHub:
1. Go to the repository's Security tab
2. Click "Report a vulnerability"
3. Fill out the security advisory form

### Information to Include
When reporting a security vulnerability, please include:

- **Type of vulnerability** (e.g., SQL injection, XSS, authentication bypass)
- **Component affected** (File Manager Plugin, AWS EUM, etc.)
- **Version affected** 
- **Steps to reproduce** the vulnerability
- **Potential impact** of the vulnerability
- **Suggested fix** (if you have one)
- **Your contact information** for follow-up questions

### What to Expect

#### Response Timeline
- **Initial Response**: Within 24-48 hours of report
- **Assessment**: Within 5 business days
- **Fix Development**: Depends on severity and complexity
- **Public Disclosure**: After fix is deployed and users have time to update

#### Our Process
1. **Acknowledge** receipt of your vulnerability report
2. **Assess** the vulnerability and determine severity
3. **Develop** a fix for the vulnerability
4. **Test** the fix thoroughly
5. **Deploy** the fix in a security update
6. **Publicly disclose** the vulnerability (with your permission)

#### Severity Classification
We use the following severity levels:

- **Critical**: Immediate threat to system security
- **High**: Significant security risk requiring urgent attention
- **Medium**: Important security issue requiring timely resolution
- **Low**: Minor security concern with limited impact

## Security Best Practices for Users

### Installation Security
- **Verify Plugin Sources**: Only install plugins from trusted sources
- **Check Hashes**: Verify MD5/SHA checksums before installation
- **Review Permissions**: Understand what permissions plugins require
- **Network Security**: Ensure proper firewall configuration

### Operational Security
- **Regular Updates**: Keep plugins updated to latest versions
- **Access Control**: Configure proper user permissions and roles
- **Monitor Logs**: Review system and plugin logs regularly
- **Backup Configuration**: Maintain secure backups of configurations

### File Manager Plugin Security
- **User Permissions**: Configure appropriate file access permissions
- **Network Access**: Limit network access to trusted users
- **File Validation**: Be cautious when uploading/downloading files
- **Session Security**: Log out when finished, especially on shared systems

### AWS EUM Security
- **IAM Policies**: Use least privilege principle for AWS permissions
- **API Keys**: Secure storage and rotation of API credentials
- **Network Policies**: Implement proper VPC and security group configurations
- **Audit Trails**: Enable and monitor AWS CloudTrail logs

## Security Updates

### Notification Process
Security updates are communicated through:
- **GitHub Security Advisories**
- **Repository README updates**
- **Plugin update notifications in UNRAID**
- **CHANGELOG.md entries marked as security fixes**

### Update Priority
- **Critical/High**: Immediate update recommended
- **Medium**: Update within 7 days
- **Low**: Update with next regular maintenance

### Automatic Updates
- UNRAID plugins can be configured for automatic updates
- Review security update notes before applying
- Test in non-production environments when possible

## Security Compliance

### Standards Alignment
Our security practices align with:
- **OWASP Guidelines**: Web application security best practices
- **CWE/SANS Top 25**: Common weakness enumeration
- **NIST Framework**: Cybersecurity framework guidelines
- **AWS Security Best Practices**: For cloud components

### Regular Assessments
- **Code Security Reviews**: Regular static analysis
- **Dependency Scanning**: Automated vulnerability scanning
- **Penetration Testing**: Periodic security testing
- **Compliance Audits**: Regular compliance verification

## Contact Information

### Security Team
For security-related inquiries:
- **Email**: security@git.n85.uk
- **GitHub**: Private security advisories
- **Response Time**: 24-48 hours

### General Support
For non-security issues:
- **Email**: hello@git.n85.uk
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Community support and questions

## Acknowledgments

We thank the following for their contributions to our security:
- Security researchers who responsibly disclose vulnerabilities
- Community members who report security concerns
- Contributors who implement security improvements

## Legal

### Safe Harbor
We support safe harbor for security researchers who:
- Report vulnerabilities through proper channels
- Do not access or modify user data
- Do not disrupt our services
- Follow responsible disclosure practices

### Bounty Program
Currently, we do not offer a formal bug bounty program, but we deeply appreciate security research and will acknowledge contributors in our security acknowledgments.

---

**Last Updated**: October 3, 2025
**Version**: 1.1

This security policy is subject to updates. Please check regularly for changes.