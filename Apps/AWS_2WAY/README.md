# AWS Two-Way SMS 📱

Real-time two-way SMS messaging application using AWS Pinpoint SMS Voice V2 API with WebSocket support, SQLite database, and keyword-based auto-replies.

## ✨ Features

- 📨 **Two-Way Messaging**: Send and receive SMS messages
- ⚡ **Real-Time Updates**: WebSocket-based live message notifications
- 💾 **SQLite Database**: Persistent message storage and conversation history
- 🤖 **Auto-Replies**: Keyword-triggered automatic responses
- 💬 **Conversation Threads**: Organized message threads per contact
- 📊 **Statistics Dashboard**: Message counts, conversations, unread tracking
- 🌙 **Dark/Light Mode**: Theme toggle for user preference
- 🔔 **Browser Notifications**: Desktop notifications for incoming messages
- 🔒 **Secure**: Helmet.js security, rate limiting, CSP policies

## 📋 Prerequisites

- Docker and Docker Compose
- AWS Account with Pinpoint SMS Voice V2 configured
- AWS IAM credentials with Pinpoint permissions
- Two-way SMS-enabled phone numbers in AWS Pinpoint
- SNS Topic for incoming SMS webhooks

## 🚀 Quick Start

### 1. Clone and Configure

```bash
cd Apps/AWS_2WAY
cp .env.example .env
nano .env
```

Edit `.env` with your AWS credentials:

```env
AWS_REGION=eu-west-2
AWS_ACCESS_KEY_ID=your_actual_access_key
AWS_SECRET_ACCESS_KEY=your_actual_secret_key
PORT=3000
NODE_ENV=production
DISABLE_CSP=true
```

### 2. Start with Docker Compose

```bash
docker-compose up -d
```

### 3. Access the Application

Open your browser to: `http://localhost:3000`

## 📱 AWS Pinpoint Setup

### Configure Two-Way SMS

1. **Request Phone Numbers** (AWS Console → Pinpoint SMS Voice V2)
   - Navigate to Phone Numbers
   - Request toll-free or long code numbers
   - Enable two-way messaging
   - Configure phone numbers: `+447418367358`, `+447418373704`

2. **Create SNS Topic**

   ```bash
   aws sns create-topic --name aws-2way-sms-incoming
   ```

3. **Configure Phone Number Two-Way Settings**
   - In AWS Console → Pinpoint SMS Voice V2 → Phone Numbers
   - Select your phone number
   - Configure two-way messaging:
     - Enable: ✅
     - SNS Topic ARN: `arn:aws:sns:eu-west-2:YOUR_ACCOUNT:aws-2way-sms-incoming`

4. **Subscribe Webhook to SNS Topic**

   ```bash
   aws sns subscribe \
     --topic-arn arn:aws:sns:eu-west-2:YOUR_ACCOUNT:aws-2way-sms-incoming \
     --protocol https \
     --notification-endpoint https://your-domain.com/webhook/sms
   ```

5. **Confirm Subscription**
   - Check container logs for subscription confirmation URL
   - Visit the URL to confirm (or use AWS Console)

### Required IAM Permissions

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "sms-voice:SendTextMessage",
        "sms-voice:DescribePhoneNumbers",
        "sns:Subscribe",
        "sns:Unsubscribe"
      ],
      "Resource": "*"
    }
  ]
}
```

## 🎯 Usage

### Sending Messages

1. Click **"+ New"** to start a conversation
2. Enter recipient phone number (format: `+44XXXXXXXXXX`)
3. Select sender from dropdown (configured two-way numbers)
4. Type message and click **"Send & Start Conversation"**

### Receiving Messages

- Incoming SMS automatically appear in real-time via WebSocket
- Conversations list updates with unread count badges
- Desktop notifications appear for new messages (if enabled)

### Auto-Reply Keywords

1. Click **"⚙️ Keywords"** button
2. Click **"Add New Keyword"**
3. Enter trigger word (e.g., `HELP`, `INFO`, `HOURS`)
4. Enter auto-reply message
5. Click **"Add Keyword"**

**Example Keywords:**

- Trigger: `HELP` → Response: `Welcome! Reply with INFO for details or HOURS for opening times.`
- Trigger: `HOURS` → Response: `We're open Mon-Fri 9AM-5PM, Sat 10AM-2PM.`
- Trigger: `STOP` → Response: `You've been unsubscribed. Reply START to resume.`

### Managing Conversations

- Click conversation in sidebar to view message history
- Messages marked as read automatically when opened
- Scroll through conversation history
- Reply directly from conversation view

## 🐳 Docker Deployment

### Build Custom Image

```bash
docker build -t aws-2way-sms:1.0.0 .
```

### Run Container

```bash
docker run -d \
  --name aws-2way-sms \
  -p 3000:3000 \
  -e AWS_REGION=eu-west-2 \
  -e AWS_ACCESS_KEY_ID=your_key \
  -e AWS_SECRET_ACCESS_KEY=your_secret \
  -e DISABLE_CSP=true \
  -v $(pwd)/data:/data \
  aws-2way-sms:1.0.0
```

### UNRAID Template

```xml
<?xml version="1.0"?>
<Container version="2">
  <Name>AWS-2WAY-SMS</Name>
  <Repository>ghcr.io/n85uk/aws-2way-sms:latest</Repository>
  <Registry>https://ghcr.io</Registry>
  <Network>br0.2</Network>
  <WebUI>http://[IP]:[PORT:3000]</WebUI>
  <TemplateURL/>
  <Icon>https://raw.githubusercontent.com/n85uk/docker-templates/master/icons/aws-sms.png</Icon>
  <ExtraParams/>
  <PostArgs/>
  <CPUset/>
  <DateInstalled></DateInstalled>
  <DonateText/>
  <DonateLink/>
  <Requires/>
  <Config Name="Web UI Port" Target="3000" Default="3000" Mode="tcp" Description="" Type="Port" Display="always" Required="true" Mask="false">3000</Config>
  <Config Name="AWS Region" Target="AWS_REGION" Default="eu-west-2" Mode="" Description="AWS Region (e.g., eu-west-2, us-east-1)" Type="Variable" Display="always" Required="true" Mask="false"/>
  <Config Name="AWS Access Key ID" Target="AWS_ACCESS_KEY_ID" Default="" Mode="" Description="AWS IAM Access Key ID" Type="Variable" Display="always" Required="true" Mask="false"/>
  <Config Name="AWS Secret Access Key" Target="AWS_SECRET_ACCESS_KEY" Default="" Mode="" Description="AWS IAM Secret Access Key" Type="Variable" Display="always" Required="true" Mask="true"/>
  <Config Name="Disable CSP" Target="DISABLE_CSP" Default="true" Mode="" Description="Disable Content Security Policy for UNRAID compatibility" Type="Variable" Display="always" Required="false" Mask="false">true</Config>
  <Config Name="Data Volume" Target="/data" Default="/mnt/user/appdata/aws-2way-sms" Mode="rw" Description="Database and persistent storage" Type="Path" Display="advanced" Required="true" Mask="false">/mnt/user/appdata/aws-2way-sms</Config>
</Container>
```

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Web UI |
| `/api/conversations` | GET | List all conversations |
| `/api/conversations/:phone/messages` | GET | Get conversation messages |
| `/api/send` | POST | Send SMS message |
| `/api/keywords` | GET | List keywords |
| `/api/keywords` | POST | Add keyword |
| `/api/keywords/:id` | PUT | Update keyword |
| `/api/keywords/:id` | DELETE | Delete keyword |
| `/api/stats` | GET | Get statistics |
| `/webhook/sms` | POST | SNS webhook (incoming SMS) |
| `/health` | GET | Health check |

### Send Message Example

```bash
curl -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -d '{
    "from": "+447418367358",
    "to": "+447700900000",
    "message": "Hello from AWS Two-Way SMS!"
  }'
```

## 🗄️ Database Schema

### Messages Table

```sql
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id TEXT UNIQUE,
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  body TEXT NOT NULL,
  direction TEXT NOT NULL CHECK(direction IN ('inbound', 'outbound')),
  status TEXT DEFAULT 'delivered',
  timestamp INTEGER NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);
```

### Conversations Table

```sql
CREATE TABLE conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone_number TEXT UNIQUE NOT NULL,
  last_message TEXT,
  last_message_time INTEGER,
  unread_count INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);
```

### Keywords Table

```sql
CREATE TABLE keywords (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trigger TEXT UNIQUE NOT NULL COLLATE NOCASE,
  response TEXT NOT NULL,
  active INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);
```

## 🔧 Development

### Local Setup

```bash
npm install
npm run dev
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AWS_REGION` | Yes | `eu-west-2` | AWS region |
| `AWS_ACCESS_KEY_ID` | Yes | - | AWS credentials |
| `AWS_SECRET_ACCESS_KEY` | Yes | - | AWS credentials |
| `PORT` | No | `3000` | Server port |
| `NODE_ENV` | No | `development` | Environment |
| `DISABLE_CSP` | No | `false` | Disable CSP for UNRAID |

## 📝 Logs

View container logs:

```bash
docker-compose logs -f
```

Log output includes:

- ✅ Successful operations
- 📤 Outbound SMS
- 📥 Inbound SMS webhooks
- 🤖 Auto-reply triggers
- 🔌 WebSocket connections
- ❌ Errors with stack traces

## 🛠️ Troubleshooting

### Messages Not Sending

1. Check AWS credentials are correct
2. Verify phone number is enabled for SMS in AWS Pinpoint
3. Check IAM permissions include `sms-voice:SendTextMessage`
4. Review container logs for error messages

### Not Receiving Inbound Messages

1. Verify SNS topic is configured on phone number
2. Confirm webhook subscription is active (check SNS console)
3. Ensure webhook endpoint is publicly accessible (use ngrok for testing)
4. Check SNS topic has correct permissions

### WebSocket Disconnecting

1. Check reverse proxy timeout settings (increase to 300s+)
2. Verify firewall allows WebSocket connections
3. Check browser console for connection errors

### Database Issues

1. Ensure `/data` volume is writable
2. Check disk space availability
3. Review database file permissions

## 🚀 Production Recommendations

1. **Use HTTPS**: Deploy behind reverse proxy with SSL
2. **Rate Limiting**: Adjust limits based on usage patterns
3. **Monitoring**: Set up health check monitoring
4. **Backups**: Regular backups of `/data/messages.db`
5. **Environment Secrets**: Use Docker secrets or vault for credentials
6. **WebSocket Load Balancing**: Configure sticky sessions if using multiple instances

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please open issues or submit pull requests.

## 📞 Support

For issues and questions:

- GitHub Issues: <https://github.com/n85uk/aws-2way-sms/issues>
- Documentation: <https://github.com/n85uk/aws-2way-sms/wiki>

---

**Version:** 1.0.0  
**Author:** N85UK <hello@git.n85.uk>  
**Repository:** <https://github.com/n85uk/aws-2way-sms>
