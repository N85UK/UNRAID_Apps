# Changelog

All notable changes to AWS EUM X will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned

- MMS support with media upload
- Message templates
- Bulk CSV import
- Two-way SMS
- Voice messaging

## [1.0.0] - 2025-10-16

### Added

- **First-run wizard** with 5-step guided setup
- **Real-time dashboard** with AWS connectivity status, message stats, and quota usage
- **SMS sending** with E.164 phone number validation
- **Rate limiting** using token bucket algorithm (configurable TPS and burst)
- **Message queue** with exponential backoff retry logic
- **Message history** tracking (last 1,000 messages with pagination)
- **Phone pool auto-discovery** from AWS account
- **Phone number listing** from AWS Pinpoint
- **Configuration set support** for event tracking
- **Opt-out list checking** before sending messages
- **IAM role support** (recommended auth method)
- **Static credentials fallback** for environments without IAM roles
- **Secret redaction** in all logs and UI (credentials, phone numbers)
- **Health check endpoints** (`/health` and `/health/ready`)
- **Structured JSON logging** with configurable log levels
- **CSRF protection** on all POST requests
- **Input validation** using Joi schemas
- **CSV export** for message history
- **Configuration export/import** as JSON
- **Non-root container** (runs as UID 1000)
- **Multi-stage Docker build** for smaller image size
- **Graceful shutdown** with queue draining
- **Comprehensive documentation** (README, SECURITY, CONTRIBUTING)
- **Unraid Community Apps template** (XML)
- **Example IAM policies** with least privilege

### Security

- Container runs as non-root user (`appuser`, UID 1000)
- AWS credentials never logged or exposed in UI
- Phone numbers redacted in logs (last 4 digits shown)
- CSRF tokens on all forms
- Helmet.js security headers
- Session cookies with `httpOnly` and `sameSite` flags
- Input validation on all user inputs

### Performance

- Token bucket rate limiter prevents AWS throttling
- Automatic retry with exponential backoff for transient errors
- Message queue for high-throughput scenarios
- Configurable rate limits (default: 5 msg/sec)

### Operations

- Automatic directory creation for config and data
- Health check script for Docker `HEALTHCHECK`
- Support bundle generation (logs, config, system info)
- Real-time queue monitoring
- Statistics dashboard (7/30 day views)

## [0.1.0] - 2025-10-01 (Internal Beta)

### Added

- Basic SMS sending functionality
- Simple web UI
- Docker containerization

---

## Version Comparison with AWS_EUM

| Feature | AWS_EUM | AWS_EUM_X |
|---------|---------|-----------|
| SMS Sending | ✅ | ✅ |
| MMS Support | ❌ | 🚧 (Planned) |
| First-Run Wizard | ❌ | ✅ |
| Rate Limiting | ❌ | ✅ |
| IAM Role Auth | ❌ | ✅ |
| Secret Redaction | ❌ | ✅ |
| Health Checks | ❌ | ✅ |
| Structured Logging | ❌ | ✅ |
| CSRF Protection | ❌ | ✅ |
| Non-Root User | ❌ | ✅ |
| Message Queue | ❌ | ✅ |
| Opt-Out Checking | ❌ | ✅ |
| Config Export/Import | ❌ | ✅ |
| Support Bundle | ❌ | ✅ |

---

[Unreleased]: https://github.com/N85UK/UNRAID_Apps/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/N85UK/UNRAID_Apps/releases/tag/v1.0.0
[0.1.0]: https://github.com/N85UK/UNRAID_Apps/releases/tag/v0.1.0
