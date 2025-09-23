# AWS End User Messaging - Manual Installation Guide

## 🎯 Quick Start

Your AWS EUM app is ready to install manually! Choose your preferred method below.

## 📋 Prerequisites

- **UNraid Server** with Docker installed
- **AWS Account** with Pinpoint SMS configured
- **AWS Credentials** (Access Key ID and Secret Access Key)

## 🚀 Installation Methods

### Method 1: UNraid Web UI (Recommended)

1. **Open UNraid Web UI**
2. **Go to Docker Tab**
3. **Click "Add Container"**

4. **Basic Settings:**
   - **Name:** `aws-eum`
   - **Repository:** `ghcr.io/n85uk/aws-eum:latest`

5. **Environment Variables** (Config Section):
   ```
   AWS_ACCESS_KEY_ID = your_aws_access_key_here
   AWS_SECRET_ACCESS_KEY = your_aws_secret_key_here
   AWS_REGION = eu-west-2
   ORIGINATORS = (optional)
   ```

6. **Volume Mappings:**
   - **Container Path:** `/app/data`
   - **Host Path:** `/mnt/user/appdata/aws-eum`

7. **Network Settings:**
   - Choose your preferred network (bridge, host, or custom)

8. **Apply & Start**

### Method 2: Docker Compose (Easy)

1. **SSH into your UNraid server**
2. **Create directory:**
   ```bash
   mkdir -p /mnt/user/appdata/aws-eum
   cd /mnt/user/appdata/aws-eum
   ```

3. **Download docker-compose.yml:**
   ```bash
   wget https://raw.githubusercontent.com/N85UK/UnRiaid_Apps/main/AWS_EUM/docker-compose.yml
   ```

4. **Edit environment variables:**
   ```bash
   nano docker-compose.yml
   # Edit the AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and other variables
   ```

5. **Start the container:**
   ```bash
   docker-compose up -d
   ```

### Method 3: Direct Docker Command

```bash
docker run -d \
  --name aws-eum \
  -p 80:80 \
  -e AWS_ACCESS_KEY_ID=your_aws_access_key_here \
  -e AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here \
  -e AWS_REGION=eu-west-2 \
  -v /mnt/user/appdata/aws-eum:/app/data \
  ghcr.io/n85uk/aws-eum:latest
```

## 🔧 Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | Your AWS access key | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |

### Optional Environment Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `AWS_REGION` | AWS region | `eu-west-2` | `us-east-1` |
| `ORIGINATORS` | Phone number mappings | None | `Mobile:+1234567890,Office:+0987654321` |
| `PORT` | Container port | `80` | `8080` |

### Originator Format

The `ORIGINATORS` variable allows you to pre-configure phone numbers:

```
ORIGINATORS=Mobile:+1234567890,Office:+0987654321
```

This creates dropdown options in the web interface.

## 🌐 Access Your App

After installation, access your AWS EUM app at:
- **URL:** `http://your-unraid-server-ip`
- **Port:** 80 (or your configured port)

## 📱 Using the App

1. **Open the web interface**
2. **Select an originator** (if configured)
3. **Enter recipient phone number** (international format: +1234567890)
4. **Type your message** (max 160 characters)
5. **Click "Send SMS"**

## 📊 Monitoring

### Check Container Status
```bash
docker ps | grep aws-eum
```

### View Logs
```bash
docker logs aws-eum
```

### Stop/Restart
```bash
docker stop aws-eum
docker start aws-eum
```

## 🔍 Troubleshooting

### Common Issues

**"Invalid AWS credentials"**
- Verify your AWS keys are correct
- Ensure your AWS account has Pinpoint SMS access
- Check the region matches your Pinpoint setup

**"Container won't start"**
- Check Docker logs: `docker logs aws-eum`
- Verify port 80 isn't already in use
- Ensure volume path exists

**"Cannot send SMS"**
- Verify phone numbers are in international format (+country code)
- Check AWS Pinpoint origination numbers are verified
- Ensure sufficient AWS SMS balance

### AWS Setup Requirements

1. **AWS Account** with billing enabled
2. **Pinpoint SMS** service activated
3. **Phone Numbers** registered and verified
4. **IAM Permissions** for Pinpoint SMS access

## 📞 Support

- **Documentation:** https://github.com/N85UK/UnRiaid_Apps/tree/main/AWS_EUM
- **Issues:** https://github.com/N85UK/UnRiaid_Apps/issues
- **AWS Pinpoint Docs:** https://docs.aws.amazon.com/pinpoint/latest/userguide/channels-sms.html

## 🔄 Upgrading

When updates are available:

```bash
# Using Docker Compose
docker-compose pull
docker-compose up -d

# Or direct Docker
docker pull ghcr.io/n85uk/aws-eum:latest
docker stop aws-eum
docker rm aws-eum
# Then re-run your installation command
```

## ✅ Success Checklist

- [ ] Container is running (`docker ps`)
- [ ] Web interface accessible
- [ ] AWS credentials configured
- [ ] Test SMS sent successfully
- [ ] Data persists between restarts

**Enjoy your AWS End User Messaging application!** 🎉