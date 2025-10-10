%name: AWS End User Messaging v2.0 (Stable)
%slug: AWS_EUM
%version: 2.0.0
%author: N85UK
%category: Utilities
%description: Stable SMS web application for sending SMS via AWS Pinpoint SMS/Voice v2 with reliable delivery tracking and message history.

# AWS End User Messaging v2.0 - Stable Edition

This template deploys the AWS EUM v2.0 Stable edition with proven reliability and core SMS functionality. The application provides a clean web interface for sending SMS messages using AWS Pinpoint SMS/Voice v2.

## 🎯 Core Features

### SMS Functionality
- **AWS Pinpoint Integration**: Send SMS via AWS Pinpoint SMS/Voice v2
- **Auto-fetch Originators**: Automatically retrieves originators from AWS account
- **Message History**: Track sent messages with delivery status
- **Cost Estimation**: Calculate SMS costs before sending
- **Multi-segment Support**: Handle long messages across multiple segments
- **Rate Limiting**: Built-in protection against abuse

### Reliability
- **Stable Production**: Proven in production environments
- **Error Handling**: Comprehensive error reporting and recovery
- **Docker Ready**: Containerized for easy deployment
- **GitHub Actions**: Automated building and publishing

## 🔧 Environment Variables

### Required
- `AWS_ACCESS_KEY_ID` - AWS access key with Pinpoint permissions
- `AWS_SECRET_ACCESS_KEY` - AWS secret access key

### Optional
- `AWS_REGION` (default: eu-west-2) - AWS region for Pinpoint service
- `PORT` (default: 80) - Application port
- `ORIGINATORS` - Comma-separated list of custom originators (label:arn format)
- `HISTORY_RETENTION` (default: 100) - Number of messages to retain in history

## 🐳 Docker Deployment

### Image
- **Repository**: `ghcr.io/n85uk/aws-eum:latest`
- **Architecture**: x86_64, ARM64
- **Base**: Alpine Linux for security and minimal footprint

### Volumes
- `/config/data` - Application data and message history (mount to UNRAID appdata)

### Ports
- `80` - Web interface (map to desired host port)

## 🚀 GitHub Actions Integration

Automated Docker image building and publishing:
- **Triggers**: Push to main branch, releases, manual dispatch
- **Registry**: GitHub Container Registry (ghcr.io)
- **Multi-platform**: Supports x86_64 and ARM64 architectures
- **Security**: Automated vulnerability scanning and dependency updates

## 📊 Version Comparison

| Feature | v2.0 (Stable) | v3.0 (Enhanced) | MariaDB (Enterprise) |
|---------|---------------|-----------------|---------------------|
| Basic SMS | ✅ | ✅ | ✅ |
| Message History | ✅ | ✅ | ✅ |
| Cost Estimation | ✅ | ✅ | ✅ |
| Chart.js Analytics | ❌ | ✅ | ✅ |
| Dark Mode | ❌ | ✅ | ✅ |
| Multi-User Auth | ❌ | ❌ | ✅ |
| Database Storage | ❌ | ❌ | ✅ |
| **Best For** | Simple Setup | Modern UI | Enterprise |

## 🔒 Security Notes

- **No Secrets Included**: Template contains no AWS credentials
- **User-Provided Keys**: All AWS credentials must be provided by end user
- **Rate Limiting**: Built-in protection against abuse
- **Input Validation**: Comprehensive input sanitization
- **Secure Headers**: Basic security headers implementation

## 📁 File Structure

```
AWS_EUM/
├── Dockerfile                 # Alpine Linux container definition
├── docker-compose.yml         # Docker Compose configuration
├── package.json              # Node.js dependencies
├── server.js                 # Express.js application
├── template.cfg              # UNRAID template configuration
├── public/
│   ├── css/style.css         # Clean UI styling
│   └── js/app.js             # Core functionality
└── views/
    └── index.ejs             # HTML template
```

## 🎯 Target Users

- **New Users**: Those wanting simple, reliable SMS functionality
- **Production Environments**: Users needing proven stability
- **Basic Requirements**: Users who need core features without complexity
- **Resource Conscious**: Users preferring minimal resource usage

## 📈 Usage Statistics

- **GitHub Actions**: ✅ All workflows building successfully
- **Container Registry**: Available on GHCR with multi-architecture support
- **Version**: 2.0.0 (Stable Edition)
- **Last Updated**: October 2025
- **Status**: Production Ready

---

**Copyright (c) 2025 N85UK - Licensed under MIT License**
**Stable Edition for Reliable SMS Messaging**
