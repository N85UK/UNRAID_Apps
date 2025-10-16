# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in AWS EUM X, please report it responsibly.

### How to Report

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, please report via one of these methods:

1. **GitHub Security Advisories** (Preferred)
   - Go to <https://github.com/N85UK/UNRAID_Apps/security/advisories>
   - Click "Report a vulnerability"
   - Fill out the form with details

2. **Email**
   - Send to: <hello@git.n85.uk>
   - Subject: "[SECURITY] AWS EUM X Vulnerability"
   - Include detailed description, steps to reproduce, and potential impact

### What to Include

Please provide:

- Description of the vulnerability
- Steps to reproduce
- Affected versions
- Potential impact (CVSS score if possible)
- Suggested fix (if you have one)
- Your contact information for follow-up

### Response Timeline

- **Initial Response**: Within 48 hours
- **Triage**: Within 7 days
- **Fix & Release**: Within 30 days (critical), 90 days (high), best effort (medium/low)
- **Public Disclosure**: After fix is released and users have time to update (typically 7-14 days)

## Security Best Practices

### For Users

1. **Keep Updated**: Always use the latest stable version
2. **Use IAM Roles**: Prefer IAM roles over static access keys
3. **Secure Credentials**: Never commit credentials to Git or share in logs
4. **HTTPS Only**: Always use HTTPS with a reverse proxy (never expose HTTP publicly)
5. **Network Isolation**: Run on trusted networks or use VPN
6. **Review Logs**: Regularly check logs for suspicious activity
7. **Least Privilege**: Use minimal IAM permissions (see README for examples)
8. **Enable Opt-Out**: Configure opt-out list checking to comply with regulations

### For Developers/Contributors

1. **Dependency Updates**: Keep npm packages updated, especially security patches
2. **Code Review**: All PRs require review before merge
3. **Static Analysis**: Run ESLint and security scanners before committing
4. **Test Coverage**: Maintain >80% test coverage
5. **Secret Scanning**: Use tools like git-secrets to prevent credential leaks
6. **Input Validation**: Validate all user inputs server-side (never trust client)
7. **Output Encoding**: Encode all user-generated content in views
8. **CSRF Tokens**: Always use CSRF protection on state-changing requests

## Security Features

### Current

- ✅ **Non-Root Container**: Runs as UID 1000 (appuser)
- ✅ **Secret Redaction**: Credentials and phone numbers never logged
- ✅ **CSRF Protection**: All POST requests require valid CSRF token
- ✅ **Input Validation**: Joi schemas validate all user inputs
- ✅ **Helmet.js**: Security headers prevent common attacks (XSS, clickjacking)
- ✅ **Session Security**: HttpOnly, SameSite=Strict cookies
- ✅ **Rate Limiting**: Prevents abuse and DoS
- ✅ **Dependency Scanning**: GitHub Dependabot enabled
- ✅ **Health Checks**: Monitoring endpoints don't expose sensitive data

### Planned

- 🚧 **Image Signing**: Cosign signatures for Docker images
- 🚧 **SBOM**: Software Bill of Materials for dependency tracking
- 🚧 **CVE Scanning**: Automated vulnerability scanning in CI
- 🚧 **Audit Logging**: Detailed audit trail of all actions
- 🚧 **Role-Based Access**: Multi-user support with permissions

## Scope

### In Scope

- Application code (src/, views/, public/)
- Docker container and build process
- Configuration handling
- AWS SDK integration
- Web UI and API endpoints
- Documentation

### Out of Scope

- AWS infrastructure (Pinpoint, IAM, etc.)
- Third-party dependencies (report to upstream)
- Unraid OS or Docker engine
- User misconfiguration (though we'll help with best practices)

## Known Security Considerations

### 1. Session Management

- **Risk**: Session hijacking if cookies intercepted
- **Mitigation**: Use HTTPS with reverse proxy, set `sameSite=strict`
- **User Action**: Deploy behind Nginx Proxy Manager, Traefik, or Caddy with TLS

### 2. Credential Storage

- **Risk**: Static AWS keys stored in environment variables
- **Mitigation**: Support for IAM roles (preferred), encrypted env files
- **User Action**: Use IAM roles when possible, secure Unraid server access

### 3. Message History

- **Risk**: Phone numbers and message content stored in plaintext
- **Mitigation**: Phone numbers redacted in UI, message history limited to 1,000 entries
- **User Action**: Regularly export and clear history, secure volume mount

### 4. Rate Limiting

- **Risk**: Abuse could exhaust AWS quota or incur costs
- **Mitigation**: Built-in rate limiter with configurable limits
- **User Action**: Set conservative `RATE_LIMIT_TPS`, monitor AWS costs

### 5. Dependency Vulnerabilities

- **Risk**: npm packages may have vulnerabilities
- **Mitigation**: Dependabot enabled, regular updates
- **User Action**: Pull latest image regularly (`docker pull ghcr.io/n85uk/aws-eum-x:latest`)

## Compliance

### GDPR

- Phone numbers are hashed in history (SHA-256)
- Export capability allows data portability
- Clear history function enables "right to be forgotten"
- No data shared with third parties (only AWS)

### TCPA/CAN-SPAM

- Opt-out list checking prevents messaging opted-out recipients
- Transactional vs Promotional message type configuration
- Message history for audit trail

## Vulnerability Disclosure Policy

### Public Disclosure

After a vulnerability is fixed:

1. Release patched version
2. Notify users via GitHub release notes
3. Allow 7-14 days for users to update
4. Publish CVE (if applicable) and security advisory
5. Credit reporter (if they wish)

### Bug Bounty

We currently do not offer a bug bounty program. However, we greatly appreciate responsible disclosure and will publicly credit reporters (if desired).

## Contact

- **Security Issues**: <hello@git.n85.uk>
- **General Issues**: <https://github.com/N85UK/UNRAID_Apps/issues>
- **Discussions**: <https://github.com/N85UK/UNRAID_Apps/discussions>

---

**Last Updated**: October 16, 2025
