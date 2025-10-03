# AWS End User Messaging - Community Applications

This package bundles the AWS SMS App as a Community Applications (CA) template for UNRAID.

## ✅ Status: Ready for CA Submission

The Docker image has been built and published to GitHub Container Registry:
- **Image**: `ghcr.io/n85uk/aws-eum:latest`
- **Build Status**: ✅ Successful
- **CA Template**: ✅ Configured

## 📦 Package Contents

- **Docker Image**: Pre-built and published to GHCR
- **CA Template**: `template.cfg` with proper configuration
- **Documentation**: `doc.md` with CA metadata headers
- **Environment Example**: `.env.example` (no secrets included)
- **Docker Compose**: For manual testing and deployment

## 🔒 Privacy & Security

- ✅ **No AWS credentials** included in repository or image
- ✅ **Environment variables** properly exposed for user configuration
- ✅ **Follows CA policies** for secret management
- ✅ **User provides own AWS credentials** via template

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

- **UNRAID CA Policies**: https://forums.unraid.net/topic/87144-ca-application-policies-privacy-policy/
- **Community Applications**: https://docs.unraid.net/unraid-os/using-unraid-to/run-docker-containers/community-applications/
- **AWS Pinpoint SMS**: https://docs.aws.amazon.com/pinpoint/latest/userguide/channels-sms.html

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
