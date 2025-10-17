# AWS End User Messaging v3.0.6 - Community Applications

Enhanced SMS application with modern UI and configurable CSP for all network types.

## ✅ Status: Ready for CA Submission

### 📦 Package Information

- **Version**: 3.0.6+ (auto-updating)
- **Image**: `ghcr.io/n85uk/aws-eum:latest`
- **Category**: Utilities
- **Network Support**: Default bridge, br0.2, br0.100, all custom networks

### 🆕 v3.0.6 Enhancements

- **Container Fixes**: Resolved startup and environment variable issues
- **Auto-Updates**: Uses :latest tag for automatic updates
- **CSP Fixes**: Configurable Content Security Policy for custom bridge networks
- **Network Compatibility**: One-line fix for br0.x networks (`DISABLE_CSP=true`)
- **Enhanced UI**: Chart.js analytics, dark/light mode toggle
- **AWS Integration**: Automatic phone number discovery from AWS Pinpoint
- **Modern Interface**: Material design with smooth animations

### 🔒 Security & Privacy

- ✅ **No AWS credentials** included in repository or image
- ✅ **User-provided credentials** via UNRAID template
- ✅ **Environment variables** properly configured
- ✅ **Rate limiting** and input validation included
- ✅ **Configurable CSP** for security and compatibility

### 🛠️ Installation Configuration

**Required Environment Variables:**

- `AWS_ACCESS_KEY_ID` - User's AWS access key
- `AWS_SECRET_ACCESS_KEY` - User's AWS secret key
- `AWS_REGION` - AWS region (default: eu-west-2)

**CSP Configuration (for custom networks):**

- `DISABLE_CSP` - Set to 'true' for br0.2, br0.100, custom bridge networks
- `NETWORK_HOST` - Network-specific host for CSP whitelist
- `CSP_POLICY` - Advanced custom CSP policy (JSON)

## 🚀 Installation (After CA Approval)

1. In UNRAID web UI, go to **Apps** tab
2. Search for **"AWS End User Messaging"**
3. Click **Install**
4. Configure your AWS credentials:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION` (default: eu-west-2)
   - `ORIGINATORS` (optional)

## 🧪 Manual Testing

Before CA submission or for development:

```bash
# Using Docker Compose
docker-compose up -d

# Or direct Docker
docker run -d \
  --name aws-eum \
  -p 80:80 \
  -e AWS_ACCESS_KEY_ID=your_key \
  -e AWS_SECRET_ACCESS_KEY=your_secret \
  -e AWS_REGION=eu-west-2 \
  -v ./data:/app/data \
  ghcr.io/n85uk/aws-eum:latest
```

## 📋 CA Submission Checklist

- ✅ **Template Format**: Follows CA standards
- ✅ **Documentation**: Complete with metadata headers
- ✅ **Docker Image**: Publicly available on GHCR
- ✅ **Security**: No secrets, proper environment variable exposure
- ✅ **Testing**: Image builds and runs successfully
- ✅ **Category**: Utilities (appropriate classification)

## 📖 Resources

- **UNRAID CA Policies**: <https://forums.unraid.net/topic/87144-ca-application-policies-privacy-policy/>
- **Community Applications**: <https://docs.unraid.net/unraid-os/using-unraid-to/run-docker-containers/community-applications/>
- **AWS Pinpoint SMS**: <https://docs.aws.amazon.com/pinpoint/latest/userguide/channels-sms.html>

## 🆘 Support

- **Issues**: Create issues in the main repository
- **AWS Setup**: Refer to AWS documentation for Pinpoint configuration
- **UNRAID**: Check UNRAID forums for CA-specific questions

## ⚠️ Important Notes

- **AWS Costs**: SMS sending incurs AWS charges - monitor your usage
- **Phone Numbers**: Must be verified/registered with AWS Pinpoint
- **Regions**: Ensure AWS Pinpoint is available in your region
- **Credentials**: Never share AWS keys - users provide their own

---

**Copyright (c) 2025 N85UK**
