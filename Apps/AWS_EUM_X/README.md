# AWS End User Messaging X (AWS_EUM_X)

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)

**Modern, secure, and feature-rich SMS, MMS, and Voice messaging application for Unraid using AWS End User Messaging.**

---

## 📋 Table of Contents

- [What is AWS EUM X?](#what-is-aws-eum-x)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Security Model](#security-model)
- [Usage Guide](#usage-guide)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## What is AWS EUM X?

AWS EUM X is a modernized successor to AWS_EUM, providing a clean, secure, and observable interface to AWS End User Messaging services. It's designed specifically for Unraid users who need reliable SMS/MMS delivery with enterprise-grade features and a user-friendly interface.

### Who is this for?

- **Home Lab Enthusiasts**: Send notifications, alerts, and 2FA codes from your Unraid server
- **Small Businesses**: Appointment reminders, delivery notifications, marketing campaigns
- **Developers**: Test SMS integrations without complex AWS console navigation
- **System Administrators**: Monitor infrastructure via SMS alerts

---

## Key Features

### ✅ Core Messaging

- **SMS**: Send text messages to any mobile number worldwide
- **MMS**: Send multimedia messages with images (up to 5MB)
- **Voice** (Coming Soon): Text-to-speech voice calls
- **Two-Way SMS** (Roadmap): Receive and respond to incoming messages

### 🛡️ Security & Compliance

- **Non-Root Container**: Runs as unprivileged user (UID 1001) on port 8080
- **Secret Redaction**: Logs and UI never expose AWS credentials or full phone numbers
- **CSRF Protection**: Prevents cross-site request forgery attacks
- **Input Validation**: Server-side validation of all user inputs
- **Opt-Out Compliance**: Automatic checking against AWS opt-out lists
- **Least Privilege IAM**: Example policies with minimum required permissions

### 🚀 User Experience

- **First-Run Wizard**: 5-step guided setup for new users
- **Live Dashboard**: Real-time status tiles (AWS health, quota, messages sent)
- **Inline Validation**: Immediate feedback on form inputs
- **Test Message Button**: Safely validate configuration without spamming users
- **Dark Mode Ready**: Modern UI with theme support

### 📊 Observability

- **Structured Logging**: JSON logs with configurable verbosity
- **Health Endpoints**: `/health` and `/health/ready` for monitoring
- **Message History**: Track last 1,000 messages with filtering
- **Statistics Dashboard**: View trends, costs, and delivery rates
- **Export Capability**: Download message history as CSV

### ⚙️ Operations

- **Rate Limiting**: Built-in token bucket with configurable limits (default: 5 msg/sec)
- **Queue Management**: Automatic retry with exponential backoff
- **Configuration Export/Import**: Backup and restore settings as JSON/YAML
- **Support Bundle**: One-click diagnostic export for troubleshooting
- **Graceful Shutdown**: Proper signal handling and queue draining

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       User Browser                           │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTPS (via Unraid/Reverse Proxy)
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              AWS EUM X Container (Port 8080)                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Express Server                                         │ │
│  │  ├─ EJS Views (First-Run Wizard, Dashboard, Settings)  │ │
│  │  ├─ CSRF Protection                                     │ │
│  │  ├─ Input Validation (Joi schemas)                      │ │
│  │  └─ Structured Logging (Pino)                           │ │
│  └────────────┬───────────────────────────────────────────┘ │
│               │                                              │
│  ┌────────────▼───────────────────────────────────────────┐ │
│  │  Business Logic Layer                                   │ │
│  │  ├─ Rate Limiter (Token Bucket)                         │ │
│  │  ├─ Message Queue (File-backed with Worker)              │ │
│  │  ├─ Persistence Layer (SQLite Database)                 │ │
│  │  └─ Configuration Manager                               │ │
│  └────────────┬───────────────────────────────────────────┘ │
│               │                                              │
│  ┌────────────▼───────────────────────────────────────────┐ │
│  │  AWS SDK Client (@aws-sdk/client-pinpoint-sms-voice-v2)│ │
│  │  ├─ IAM Role Support (Instance Profile)                │ │
│  │  ├─ Static Credentials (Fallback)                       │ │
│  │  ├─ Exponential Backoff                                 │ │
│  │  └─ Error Enhancement                                   │ │
│  └────────────┬───────────────────────────────────────────┘ │
└───────────────┼─────────────────────────────────────────────┘
                │ AWS SDK API Calls
                ▼
┌─────────────────────────────────────────────────────────────┐
│         AWS End User Messaging (Pinpoint SMS/Voice v2)      │
│  ├─ Phone Pools                                              │
│  ├─ Configuration Sets (Event Destinations)                  │
│  ├─ Opt-Out Lists                                            │
│  └─ Send SMS/MMS API                                         │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. User submits message via web UI
2. CSRF token validated
3. Input validated against Joi schemas
4. Phone number checked against opt-out list
5. Message queued by rate limiter
6. AWS SDK sends message to Pinpoint
7. Result logged and stored in history
8. Success/error returned to UI

---

## Installation

### Prerequisites

- **Unraid 6.9+** (or Docker-compatible system)
- **AWS Account** with End User Messaging enabled
- **IAM User or Role** with SMS permissions (see [Security Model](#security-model))
- **Origination Identity** (Phone number, Sender ID, or Phone Pool) registered in AWS

### Option 1: Community Applications (Recommended)

1. Open Unraid Web UI
2. Go to **Apps** tab
3. Search for **"AWS EUM X"**
4. Click **Install**
5. Configure environment variables (see [Configuration](#configuration))
6. Click **Apply**

### Option 2: Manual Docker Installation

```bash
docker run -d \
  --name aws-eum-x \
  -p 3000:3000 \
  -e AWS_REGION=us-east-1 \
  -e AWS_AUTH_METHOD=iam_role \
  -v /mnt/user/appdata/aws-eum-x/config:/app/config \
  -v /mnt/user/appdata/aws-eum-x/data:/app/data \
  --restart unless-stopped \
  ghcr.io/n85uk/aws-eum-x:latest
```

### Option 3: Docker Compose

```yaml
version: '3.8'
services:
  aws-eum-x:
    image: ghcr.io/n85uk/aws-eum-x:latest
    container_name: aws-eum-x
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - AWS_REGION=us-east-1
      - AWS_AUTH_METHOD=auto
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
    volumes:
      - ./config:/app/config
      - ./data:/app/data
```

---

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `AWS_REGION` | AWS region for Pinpoint (e.g., `us-east-1`, `eu-west-2`) | `us-east-1` | ✅ |
| `AWS_AUTH_METHOD` | Auth method: `auto`, `iam_role`, or `access_keys` | `auto` | ⬜ |
| `AWS_ACCESS_KEY_ID` | AWS access key (if using `access_keys` method) | - | ⚠️ |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key (if using `access_keys` method) | - | ⚠️ |
| `PORT` | HTTP port for web UI | `3000` | ⬜ |
| `HOST` | Bind address | `0.0.0.0` | ⬜ |
| `LOG_LEVEL` | Logging level: `debug`, `info`, `warn`, `error` | `info` | ⬜ |
| `RATE_LIMIT_TPS` | Max messages per second | `5` | ⬜ |
| `RATE_LIMIT_BURST` | Burst capacity (token bucket size) | `10` | ⬜ |
| `MAX_HISTORY` | Max messages to store in history | `1000` | ⬜ |
| `SESSION_SECRET` | Session encryption secret (auto-generated if not set) | - | ⬜ |
| `ENABLE_WIZARD` | Show first-run wizard | `true` | ⬜ |
| `SMS_CONFIG_SET_ARN` | AWS Configuration Set ARN (optional) | - | ⬜ |
| `OPT_OUT_LIST` | AWS Opt-Out List name (optional) | - | ⬜ |

### Volumes

| Path | Description | Required |
|------|-------------|----------|
| `/app/config` | Configuration files, wizard state | ✅ |
| `/app/data` | SQLite database, queue state, logs | ✅ |

---

## Security Model

### Least Privilege IAM Policy

**Recommended**: Use IAM roles with instance profiles or ECS task roles.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PinpointSMSSendOnly",
      "Effect": "Allow",
      "Action": [
        "sms-voice:SendTextMessage"
      ],
      "Resource": "*"
    },
    {
      "Sid": "PinpointReadOnly",
      "Effect": "Allow",
      "Action": [
        "sms-voice:DescribePools",
        "sms-voice:DescribePhoneNumbers",
        "sms-voice:DescribeConfigurationSets",
        "sms-voice:DescribeOptOutLists",
        "sms-voice:DescribeOptedOutNumbers",
        "sms-voice:DescribeAccountAttributes",
        "sms-voice:DescribeSpendLimits"
      ],
      "Resource": "*"
    }
  ]
}
```

### Security Checklist

- ✅ Run as non-root user (UID 1000)
- ✅ Use IAM roles instead of static keys when possible
- ✅ Enable CSRF protection (enabled by default)
- ✅ Use HTTPS with reverse proxy (Nginx Proxy Manager, Traefik, Caddy)
- ✅ Set strong `SESSION_SECRET` (auto-generated if not provided)
- ✅ Restrict network access via Unraid firewall or Docker network
- ✅ Enable opt-out checking to comply with regulations
- ✅ Review logs regularly for suspicious activity
- ✅ Update image regularly for security patches

### GDPR Considerations

- Phone numbers are redacted in logs (last 4 digits shown)
- Message history can be cleared via UI
- Export functionality allows data portability
- No data is shared with third parties (only AWS)

---

## Usage Guide

### First Run

1. Access `http://your-unraid-ip:3000`
2. Follow 5-step wizard:
   - **Step 1**: Welcome & prerequisites
   - **Step 2**: AWS credentials (IAM role or access keys)
   - **Step 3**: Select region and discover resources
   - **Step 4**: Configure features (opt-out, rate limits)
   - **Step 5**: Send test message
3. Click **Complete Setup**

### Sending Messages

1. Go to **Dashboard** (home page)
2. Select **Origination Identity** from dropdown
3. Enter **Phone Number** in E.164 format (e.g., `+447700900000`)
4. Type **Message** (160 chars = 1 SMS segment)
5. Click **Send SMS**
6. View result in **Message History** below

### Managing Configuration

1. Go to **Settings** page
2. Update AWS region, auth method, or features
3. Click **Save Configuration**
4. Optionally **Export Configuration** for backup

### Viewing Statistics

1. Go to **Observability** page
2. View charts for:
   - Messages sent (last 7/30 days)
   - Success vs failure rate
   - Cost estimates
   - Queue depth over time

### Exporting Data

**Message History CSV:**

1. Go to **Actions** page
2. Click **Export History**
3. Save CSV file

**Configuration Backup:**

1. Go to **Settings** page
2. Click **Export Configuration**
3. Save JSON file

**Support Bundle:**

1. Go to **Actions** page
2. Click **Generate Support Bundle**
3. Save ZIP file (includes logs, config, system info)

---

## Troubleshooting

### Common Issues

#### 1. **AWS credentials invalid (InvalidClientTokenId)**

**Symptoms**: Health check shows red, dashboard displays error

**Solutions**:

- Verify `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are correct
- Check IAM user has required permissions (see [Security Model](#security-model))
- Ensure credentials are not expired (if using temporary credentials)

#### 2. **Phone number validation failed**

**Symptoms**: "Phone number must be in E.164 format" error

**Solutions**:

- Ensure number starts with `+` (e.g., `+1234567890`)
- Include country code (e.g., `+1` for US, `+44` for UK)
- Remove spaces, dashes, or parentheses

#### 3. **Message queued but not sending**

**Symptoms**: Messages stuck in queue

**Solutions**:

- Check **Observability** page for rate limit status
- Reduce `RATE_LIMIT_TPS` if approaching AWS limits
- Check AWS quota limits: `aws sms-voice describe-spend-limits`
- Review CloudWatch logs for throttling errors

#### 4. **Recipient opted out**

**Symptoms**: Error "Recipient has opted out of receiving messages"

**Solutions**:

- Verify recipient did not text "STOP" to your number
- Check AWS opt-out list: Console > Pinpoint > Opt-out lists
- Remove number from opt-out list if legitimately opted back in

#### 5. **Container won't start**

**Symptoms**: Container restarts repeatedly

**Solutions**:

- Check logs: `docker logs aws-eum-x`
- Verify volume permissions: `chown -R 1000:1000 /mnt/user/appdata/aws-eum-x`
- Ensure port 3000 is not in use: `netstat -tuln | grep 3000`
- Validate environment variables (no special characters in unquoted values)

### Debug Logs

Enable verbose logging:

```bash
docker exec aws-eum-x sh -c "export LOG_LEVEL=debug"
# Restart container
docker restart aws-eum-x
```

View logs:

```bash
docker logs -f aws-eum-x
```

---

## API Documentation

### Health Endpoints

**GET `/health`**
Returns overall system health.

```json
{
  "status": "ok",
  "uptime": 3600,
  "timestamp": "2025-10-16T14:30:00.000Z",
  "version": "1.0.0",
  "aws": { "status": "ok", "latency": 145, "region": "us-east-1" },
  "rateLimiter": { "enabled": true, "queueSize": 0, "tokensAvailable": 10 }
}
```

**GET `/health/ready`**
Returns 200 if AWS is reachable, 503 otherwise.

### Message Endpoints

**POST `/api/send-sms`**
Send an SMS message.

```json
{
  "phoneNumber": "+447700900000",
  "message": "Hello from AWS EUM X!",
  "originationIdentity": "arn:aws:sms-voice:...",
  "messageType": "TRANSACTIONAL"
}
```

**POST `/api/send-test`**
Send a test message.

```json
{
  "phoneNumber": "+447700900000",
  "originationIdentity": "arn:aws:sms-voice:..."
}
```

---

## Roadmap

### v1.1 (Q4 2025)

- [ ] MMS support with media upload
- [ ] Message templates with variable substitution
- [ ] Bulk import from CSV
- [ ] Enhanced cost tracking

### v1.2 (Q1 2026)

- [ ] Two-way SMS (receive and respond)
- [ ] Voice messaging (text-to-speech)
- [ ] Prometheus metrics endpoint
- [ ] Webhook event replay

### v2.0 (Q2 2026)

- [ ] WhatsApp Business integration (AWS Social Messaging)
- [ ] Push notifications (AWS Push)
- [ ] Multi-tenant support
- [ ] Role-based access control

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, coding standards, and PR guidelines.

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Support

- **Issues**: [GitHub Issues](https://github.com/N85UK/UNRAID_Apps/issues)
- **Discussions**: [GitHub Discussions](https://github.com/N85UK/UNRAID_Apps/discussions)
- **Documentation**: [Wiki](https://github.com/N85UK/UNRAID_Apps/wiki)
- **AWS Support**: [AWS End User Messaging Docs](https://docs.aws.amazon.com/end-user-messaging/)

---

**Made with ❤️ for the Unraid community**
