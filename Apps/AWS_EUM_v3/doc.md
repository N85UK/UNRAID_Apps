%name: AWS End User Messaging v3.0 (Enhanced UI)
%slug: AWS_EUM_v3
%version: 3.0.0
%author: N85UK
%category: Utilities
%description: Enhanced AWS SMS web application with Chart.js analytics, dark mode, and modern UI design for sending SMS via AWS Pinpoint SMS/Voice v2.

# AWS End User Messaging v3.0 - Enhanced UI Edition

This template deploys the AWS EUM v3.0 Enhanced UI edition with modern interface design, Chart.js integration, and advanced features. The application provides a sophisticated web interface for sending SMS messages using AWS Pinpoint SMS/Voice v2.

## ✨ Enhanced Features

### UI/UX Enhancements
- **Modern Design**: Clean, responsive interface with enhanced styling
- **Chart.js Analytics**: Visual SMS statistics and usage charts
- **Dark Mode Support**: Toggle between light and dark themes
- **Real-time Updates**: Live status updates and notifications
- **Advanced Metrics**: Detailed SMS delivery analytics and reporting
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices

### Core Functionality
- Send SMS messages via AWS Pinpoint SMS/Voice v2
- Auto-fetch originators from AWS account
- Message history and delivery tracking
- Cost estimation and usage analytics
- Multi-segment message support
- Rate limiting and error handling

## 🔧 Environment Variables

### Required
- `AWS_ACCESS_KEY_ID` - AWS access key with Pinpoint permissions
- `AWS_SECRET_ACCESS_KEY` - AWS secret access key

### Optional
- `AWS_REGION` (default: eu-west-2) - AWS region for Pinpoint service
- `PORT` (default: 80) - Application port
- `ORIGINATORS` - Comma-separated list of custom originators (label:arn format)
- `AUTO_UPDATE_CHECK` (default: true) - Enable automatic update checking
- `UPDATE_CHECK_INTERVAL` (default: 24) - Update check interval in hours
- `HISTORY_RETENTION` (default: 100) - Number of messages to retain in history

## 🐳 Docker Deployment

### Image
- **Repository**: `ghcr.io/n85uk/aws-eum-v3:latest`
- **Architecture**: x86_64, ARM64
- **Base**: Alpine Linux for security and minimal footprint

### Volumes
- `/app/data` - Application data and message history (mount to UNRAID appdata)

### Ports
- `80` - Web interface (map to desired host port)

## 🚀 GitHub Actions Integration

Automated Docker image building and publishing:
- **Triggers**: Push to main branch, releases, manual dispatch
- **Registry**: GitHub Container Registry (ghcr.io)
- **Multi-platform**: Supports x86_64 and ARM64 architectures
- **Security**: Automated vulnerability scanning and dependency updates

## 📊 Features Comparison

| Feature | v2.0 | v3.0 Enhanced |
|---------|------|----------------|
| Basic SMS | ✅ | ✅ |
| Message History | ✅ | ✅ |
| Cost Estimation | ✅ | ✅ |
| Chart.js Analytics | ❌ | ✅ |
| Dark Mode | ❌ | ✅ |
| Real-time Updates | ❌ | ✅ |
| Advanced Metrics | ❌ | ✅ |
| Modern UI Design | ❌ | ✅ |

## 🔒 Security Notes

- **No Secrets Included**: Template contains no AWS credentials
- **User-Provided Keys**: All AWS credentials must be provided by end user
- **Secure Headers**: Helmet.js integration for security headers
- **Rate Limiting**: Built-in protection against abuse
- **Input Validation**: Comprehensive input sanitization

## 📁 File Structure

```
AWS_EUM_v3/
├── Dockerfile                 # Alpine Linux container definition
├── docker-compose.yml         # Docker Compose configuration
├── package.json              # Node.js dependencies with Chart.js
├── server.js                 # Enhanced Express.js application
├── template.cfg              # UNRAID template configuration
├── public/
│   ├── css/style.css         # Enhanced UI styling
│   └── js/app.js             # Chart.js integration and UI logic
└── views/
    └── index.ejs             # Modern HTML template
```

## 🎯 Target Users

- **Power Users**: Those wanting advanced analytics and modern UI
- **Businesses**: Organizations needing detailed SMS metrics and reporting
- **Developers**: Users who appreciate modern web interfaces and Chart.js integration
- **Analytics-Focused**: Users requiring visual representation of SMS usage

## 📈 Usage Statistics

- **GitHub Actions**: ✅ All workflows building successfully
- **Container Registry**: Available on GHCR with multi-architecture support
- **Version**: 3.0.0 (Enhanced UI Edition)
- **Last Updated**: October 2025

---

**Copyright (c) 2025 N85UK - Licensed under MIT License**
**Enhanced UI Edition with Chart.js Integration**
