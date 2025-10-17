# AWS Two-Way SMS - Setup Guide

Complete setup instructions for deploying AWS Two-Way SMS messaging system.

## 📋 Table of Contents

1. [AWS Account Setup](#aws-account-setup)
2. [Phone Number Configuration](#phone-number-configuration)
3. [SNS Topic Setup](#sns-topic-setup)
4. [Application Deployment](#application-deployment)
5. [Testing](#testing)
6. [Production Deployment](#production-deployment)

## 🔧 AWS Account Setup

### Step 1: Create IAM User

1. Navigate to **AWS Console → IAM → Users**
2. Click **"Create user"**
3. Username: `aws-2way-sms`
4. Click **"Next"**

### Step 2: Attach Permissions

Create custom policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PinpointSMSPermissions",
      "Effect": "Allow",
      "Action": [
        "sms-voice:SendTextMessage",
        "sms-voice:DescribePhoneNumbers",
        "sms-voice:DescribeOptedOutNumbers",
        "sms-voice:ListPoolOriginationIdentities"
      ],
      "Resource": "*"
    },
    {
      "Sid": "SNSPermissions",
      "Effect": "Allow",
      "Action": [
        "sns:Subscribe",
        "sns:Unsubscribe",
        "sns:Publish"
      ],
      "Resource": "arn:aws:sns:*:*:aws-2way-sms-*"
    }
  ]
}
```

### Step 3: Generate Access Keys

1. Select created user
2. Click **"Security credentials"** tab
3. Click **"Create access key"**
4. Choose **"Application running outside AWS"**
5. Save **Access Key ID** and **Secret Access Key** securely

## 📱 Phone Number Configuration

### Request Phone Numbers

1. Navigate to **AWS Console → Pinpoint SMS Voice V2**
2. Click **"Phone numbers"** → **"Request phone number"**

#### For UK Numbers

- **Country**: United Kingdom
- **Number type**: Toll-free (or Long code)
- **Messaging**: ✅ Two-way messaging enabled
- **Voice**: Optional

Click **"Request phone number"**

#### Configure Two-Way Messaging

1. Select your phone number
2. Click **"Two-way SMS"** tab
3. Enable two-way messaging: **✅**
4. SNS Topic: (will create in next step)

### Phone Numbers to Configure

- `+447418367358` - Primary
- `+447418373704` - Secondary

## 📡 SNS Topic Setup

### Create SNS Topic

```bash
aws sns create-topic \
  --name aws-2way-sms-incoming \
  --region eu-west-2
```

**Output:**

```json
{
  "TopicArn": "arn:aws:sns:eu-west-2:123456789012:aws-2way-sms-incoming"
}
```

### Configure Topic for Phone Number

1. Navigate to **Pinpoint SMS Voice V2 → Phone Numbers**
2. Select phone number
3. Click **"Two-way SMS"** tab
4. Enable: **✅**
5. **SNS Topic ARN**: Paste ARN from above
6. Click **"Save"**

Repeat for all two-way phone numbers.

### Subscribe Webhook (After Deployment)

After deploying the application with a public URL:

```bash
aws sns subscribe \
  --topic-arn arn:aws:sns:eu-west-2:123456789012:aws-2way-sms-incoming \
  --protocol https \
  --notification-endpoint https://your-domain.com/webhook/sms \
  --region eu-west-2
```

## 🐳 Application Deployment

### Method 1: Docker Compose (Recommended)

#### 1. Clone Repository

```bash
cd /mnt/user/appdata
git clone https://github.com/n85uk/aws-2way-sms.git
cd aws-2way-sms
```

#### 2. Configure Environment

```bash
cp .env.example .env
nano .env
```

Edit with your AWS credentials:

```env
AWS_REGION=eu-west-2
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
PORT=3000
NODE_ENV=production
DISABLE_CSP=true
```

#### 3. Start Application

```bash
docker-compose up -d
```

#### 4. Check Logs

```bash
docker-compose logs -f
```

You should see:

```
╔═══════════════════════════════════════════════╗
║   AWS Two-Way SMS v1.0.0                      ║
║   Real-time Messaging with Auto-Replies      ║
╚═══════════════════════════════════════════════╝

🚀 Server running on port 3000
🔌 WebSocket server active
📱 Phone numbers: +447418367358, +447418373704
```

### Method 2: Docker Run

```bash
docker run -d \
  --name aws-2way-sms \
  -p 3000:3000 \
  -e AWS_REGION=eu-west-2 \
  -e AWS_ACCESS_KEY_ID=your_key \
  -e AWS_SECRET_ACCESS_KEY=your_secret \
  -e DISABLE_CSP=true \
  -v /mnt/user/appdata/aws-2way-sms:/data \
  --restart unless-stopped \
  ghcr.io/n85uk/aws-2way-sms:latest
```

### Method 3: UNRAID Template

1. Navigate to **Docker** tab
2. Click **"Add Container"**
3. Click **"Template repositories"**
4. Add: `https://github.com/n85uk/docker-templates`
5. Search for **"AWS Two-Way SMS"**
6. Fill in AWS credentials
7. Click **"Apply"**

## 🧪 Testing

### Test Outbound SMS

1. Open web UI: `http://your-server-ip:3000`
2. Click **"+ New"** conversation
3. Enter test phone number (your mobile)
4. Select sender: **Primary Two-Way Number**
5. Type message: `Hello from AWS Two-Way SMS!`
6. Click **"Send & Start Conversation"**

**Expected:**

- ✅ Message appears in conversation thread
- 📱 SMS received on your mobile phone

### Test Inbound SMS

1. Reply to the SMS from your mobile phone
2. Check web UI - message should appear in real-time

**Expected:**

- ✅ Message appears instantly (WebSocket)
- ✅ Conversation updates with new message
- ✅ Unread count increments
- 🔔 Browser notification appears

### Test Auto-Reply

1. From your mobile, send: `HELP`
2. Wait 1-2 seconds

**Expected:**

- ✅ Receive automatic reply: `Welcome! Available commands: INFO, HOURS, STOP`

## 🌐 Production Deployment

### Prerequisites

- Domain name (e.g., `sms.yourdomain.com`)
- SSL certificate
- Reverse proxy (Nginx/Caddy)

### Nginx Reverse Proxy Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name sms.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
```

### Caddy Reverse Proxy (Simpler)

```caddy
sms.yourdomain.com {
    reverse_proxy localhost:3000
}
```

Caddy automatically handles:

- SSL certificates (Let's Encrypt)
- WebSocket upgrades
- HTTP/2

### Subscribe SNS Webhook (Production)

```bash
aws sns subscribe \
  --topic-arn arn:aws:sns:eu-west-2:123456789012:aws-2way-sms-incoming \
  --protocol https \
  --notification-endpoint https://sms.yourdomain.com/webhook/sms \
  --region eu-west-2
```

### Confirm Subscription

1. Check application logs:

   ```bash
   docker-compose logs | grep "SubscribeURL"
   ```

2. Visit the URL in the logs, or:
   - AWS Console → SNS → Topics → aws-2way-sms-incoming → Subscriptions
   - Click **"Request confirmations"**

**Subscription Status:** Should show **"Confirmed"**

## 🔐 Security Checklist

- ✅ Use environment variables for secrets (never commit `.env`)
- ✅ Enable HTTPS in production
- ✅ Restrict IAM user permissions (principle of least privilege)
- ✅ Enable CSP in production (`DISABLE_CSP=false`)
- ✅ Use strong firewall rules
- ✅ Regular backups of `/data/messages.db`
- ✅ Monitor logs for suspicious activity
- ✅ Rotate AWS access keys periodically

## 📊 Monitoring

### Health Check Endpoint

```bash
curl http://localhost:3000/health
```

**Response:**

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 3600,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Container Health

```bash
docker ps
```

**STATUS** should show: `Up X minutes (healthy)`

### Logs Monitoring

```bash
# Follow logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Filter for errors
docker-compose logs | grep "❌"
```

## 🛠️ Troubleshooting

### Issue: SNS Webhook Not Receiving Messages

**Solution:**

1. Check SNS subscription status (must be "Confirmed")
2. Verify webhook endpoint is publicly accessible
3. Test with: `curl -X POST https://sms.yourdomain.com/webhook/sms`
4. Check container logs for incoming requests

### Issue: WebSocket Disconnecting

**Solution:**

1. Increase reverse proxy timeout: `proxy_read_timeout 300s;`
2. Check browser console for errors
3. Verify firewall allows WebSocket connections

### Issue: Messages Not Sending

**Solution:**

1. Verify AWS credentials are correct
2. Check IAM permissions include `sms-voice:SendTextMessage`
3. Ensure phone numbers are verified in Pinpoint
4. Review container logs for API errors

## 📞 Support

- **GitHub Issues**: <https://github.com/n85uk/aws-2way-sms/issues>
- **Documentation**: See README.md
- **Email**: <hello@git.n85.uk>

---

**Last Updated:** 2024-01-15  
**Version:** 1.0.0
