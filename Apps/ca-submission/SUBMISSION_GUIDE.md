# UNraid Community Applications - AWS EUM Submission

## 📋 Submission Files

This directory contains the complete submission package for the AWS End User Messaging application.

### Files Included

- `template.cfg` - UNraid CA template configuration
- `doc.md` - Application documentation with CA metadata

## 🚀 Submission Process

### Method 1: GitHub Issue (Recommended)

1. Go to: <https://github.com/Squidly271/community.applications/issues>
2. Click **"New Issue"**
3. Use title: `Add AWS End User Messaging (EUM) Application`
4. Copy the template below into the issue body
5. Attach the `template.cfg` and `doc.md` files

### Method 2: Pull Request (Alternative)

If you have access to submit PRs directly:

1. Fork <https://github.com/Squidly271/community.applications>
2. Add your template files to the appropriate location
3. Submit a pull request

## 📝 Issue Template

```markdown
## Application Submission: AWS End User Messaging (EUM)

### Application Details
- **Name**: AWS End User Messaging (EUM)
- **Category**: Utilities
- **Docker Image**: ghcr.io/n85uk/aws-eum:latest
- **Author**: N85UK
- **Description**: Web-based SMS sending application using AWS Pinpoint SMS services

### Features
- Web interface for sending SMS messages
- AWS Pinpoint SMS integration
- Configurable originators (phone numbers)
- Message history tracking
- Secure credential management

### Technical Details
- **Base Image**: Node.js 20 on Debian
- **Ports**: 80 (web interface)
- **Volumes**: /app/data (message history)
- **Environment Variables**:
  - AWS_ACCESS_KEY_ID (required)
  - AWS_SECRET_ACCESS_KEY (required)
  - AWS_REGION (default: eu-west-2)
  - ORIGINATORS (optional)

### Security & Compliance
- ✅ No secrets included in image or templates
- ✅ User provides own AWS credentials
- ✅ Follows CA security policies
- ✅ Environment variables properly exposed

### Testing
- ✅ Docker image built and published successfully
- ✅ Manual testing completed
- ✅ Template validation passed

### Files Attached
- `template.cfg` - CA template configuration
- `doc.md` - Application documentation

### Additional Notes
- Image is publicly available on GitHub Container Registry
- Comprehensive documentation provided
- Ready for production deployment
```

## ✅ Pre-Submission Checklist

- [x] Docker image published and accessible
- [x] Template follows CA standards
- [x] Documentation complete with metadata
- [x] Security compliance verified
- [x] No secrets in repository or image
- [x] Environment variables properly configured
- [x] Category assignment appropriate
- [x] Testing completed successfully

## 📞 Support

For questions about this submission:

- **Repository**: <https://github.com/N85UK/UNRAID_Apps>
- **Documentation**: See README files in AWS_EUM directory
- **Issues**: Create issues in the main repository

## 🎯 Next Steps

1. Create the GitHub issue with the template above
2. Attach `template.cfg` and `doc.md`
3. Wait for CA maintainer review
4. Address any feedback or requested changes
5. Once approved, your app will appear in UNraid Community Apps!
