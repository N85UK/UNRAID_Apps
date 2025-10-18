# UNRAID Apps

A collection of Docker applications packaged for UNRAID Community Applications (CA).

## Applications

### 1. AWS End User Messaging (EUM) v3.0.9

A web-based SMS sending application using AWS Pinpoint SMS services.

**Status**: ✅ Production Ready
**Docker Image**: `ghcr.io/n85uk/aws-eum:latest`
**Category**: Utilities
**Template**: `my-aws-eum-v3.xml`

#### Features

- Modern dark/light mode UI
- AWS Pinpoint SMS integration
- Auto-discovery of phone numbers
- Message history tracking
- Long message support (up to 1,600 characters)

### 2. AWS End User Messaging MariaDB Edition

Enterprise SMS application with multi-user authentication and database persistence.

**Status**: ✅ Production Ready
**Docker Image**: `ghcr.io/n85uk/aws-eum-mariadb:latest`
**Category**: Utilities
**Template**: `my-aws-eum-mariadb.xml`

#### Features

- Multi-user authentication with JWT
- MariaDB/MySQL database persistence
- Advanced analytics and reporting
- Session management
- Enterprise-grade security

### 3. AWS End User Messaging X (EUM X) v0.1.0

Next-generation AWS Pinpoint SMS solution with enhanced security and features.

**Status**: ✅ Production Ready - Security Hardened
**Docker Image**: `ghcr.io/n85uk/aws-eum-x:latest`
**Category**: Utilities
**Template**: `my-aws-eum-x.xml`

#### Features

- SQLite persistence for configuration and messages
- First-run wizard for easy setup
- Dashboard with queue monitoring
- Non-root container (port 8080)
- Comprehensive security documentation
- Rate limiting with token bucket
- Database migrations system

### 4. AWS 2-Way SMS v1.0.0

Bi-directional SMS messaging application for send and receive capabilities.

**Status**: ✅ Production Ready
**Docker Image**: `ghcr.io/n85uk/aws-2way-sms:latest`
**Category**: Utilities
**Template**: `my-aws-2way-sms.xml`

#### Features

- Send and receive SMS messages
- Two-way conversation management
- Message threading and history
- Real-time notifications

### 5. UCG Max Webhook Receiver v1.0.0

Webhook receiver and alert management system for UCG Max network monitoring.

**Status**: ✅ Production Ready
**Docker Image**: `ghcr.io/n85uk/ucg-max-webhook-receiver:latest`
**Category**: Network:Management
**Template**: `my-ucg-max-webhook.xml`

#### Features

- HMAC-SHA256 and Bearer token authentication
- External database support (MariaDB/MySQL/PostgreSQL)
- Web dashboard for alert monitoring
- Search and filter by severity, type, device
- Rate limiting with configurable thresholds
- CSV export functionality
- Automatic database migrations

#### Installation

1. **Via UNRAID Community Applications** (recommended):
   - Once approved, search for "AWS End User Messaging" in the Apps tab
   - Configure your AWS credentials in the template

2. **Manual Docker Installation**:

   ```bash
   docker run -d \
     --name aws-eum \
     -p 80:80 \
     -e AWS_ACCESS_KEY_ID=your_key \
     -e AWS_SECRET_ACCESS_KEY=your_secret \
     -e AWS_REGION=eu-west-2 \
     -v /mnt/user/appdata/aws-eum:/app/data \
     ghcr.io/n85uk/aws-eum:latest
   ```

#### Configuration

- `AWS_ACCESS_KEY_ID`: Your AWS access key (required)
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key (required)
- `AWS_REGION`: AWS region (default: eu-west-2)
- `ORIGINATORS`: Comma-separated list of label:arn pairs for phone numbers

## Development

### Prerequisites

- Node.js 20+
- Docker
- AWS Account with Pinpoint SMS configured

### Building

```bash
cd Apps/AWS_EUM
npm install
npm run build  # if needed
docker build -t aws-eum .
```

### Publishing

The GitHub Actions workflow automatically builds and publishes the Docker image to GHCR on pushes to main branch.

## Community Applications Submission

This repository contains properly formatted templates for UNRAID Community Applications submission.

### Submission Status

- **AWS EUM**: Ready for submission to <https://github.com/Squidly271/community.applications>

### Files Included

- `my-aws-*.xml` - UNRAID CA template configuration (XML format)
- `doc.md` - Application documentation with CA metadata
- Docker image published to GHCR
- Security compliance (no secrets included)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see [LICENSE](../LICENSE) file for details.

## Support

For issues with specific applications, please check their respective documentation or create an issue in this repository.

---

### Copyright (c) 2025 N85UK
