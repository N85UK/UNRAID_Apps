# AWS EUM X

> Modern, secure, observable SMS messaging interface for AWS Pinpoint on Unraid

**Version:** 1.0.0  
**Status:** Production Ready ✅  
**License:** MIT

---

## 🎯 Overview

AWS EUM X is a modernized, audit-driven successor to AWS_EUM. It provides a secure, observable interface for sending SMS messages via AWS Pinpoint SMS and Voice v2 API, designed specifically for Unraid Community Apps with production-ready defaults.

### Key Improvements Over AWS_EUM
- ✅ **Structured logging** with automatic secret redaction (pino)
- ✅ **Health & readiness probes** for monitoring and orchestration
- ✅ **First-run wizard** for guided setup
- ✅ **DryRun support** for safe testing without charges
- ✅ **MPS-aware rate limiting** with configurable queue and backoff
- ✅ **Message part estimator** (GSM-7 and UCS-2 encoding)
- ✅ **IAM least-privilege examples** and security documentation
- ✅ **Support bundle generator** with automatic redaction
- ✅ **Non-root container** with proper volume permissions

---

## 🚀 Quick Start

### 1. Install via Unraid Community Apps
Search for "AWS EUM X" in Community Apps and click install.

### 2. Configure Required Settings
- **AWS Access Key ID**: IAM user access key with Pinpoint permissions
- **AWS Secret Access Key**: Corresponding secret key
- **AWS Region**: Region where your SMS resources are provisioned (e.g., `us-east-1`)
- **Host Port**: Any available port on your Unraid server (maps to container port 80)
- **AppData Path**: `/mnt/user/appdata/aws-eum-x` (host) → `/app/data` (container)

### 3. Complete First-Run Wizard
1. Open web UI: `http://your-unraid-ip:port`
2. Follow the 3-step wizard to test AWS credentials
3. Verify phone numbers/sender IDs are discovered

### 4. Test with DryRun
```bash
curl -X POST http://your-unraid-ip:port/api/test/dry-run \
  -H "Content-Type: application/json" \
  -d '{
    "DestinationPhoneNumber": "+1234567890",
    "MessageBody": "Test message",
    "OriginationIdentity": "+1987654321"
  }'
```

### 5. Enable Real Sends
Set `SENDS_ENABLED=true` in template to allow actual SMS sends (default: `false` for safety).

---

## 📊 Observability

### Health Endpoints
- **`GET /health`** - Liveness probe (version, uptime, build info)
- **`GET /ready`** - Readiness probe (AWS connectivity check)
- **`GET /probe/aws`** - Dedicated AWS connectivity test

### Logging
Structured JSON logs with automatic redaction:
```json
{
  "level": "info",
  "msg": "Message sent",
  "queueId": "12345-abc",
  "to": "+1****REDACTED",
  "result": "msg-id-xyz"
}
```

Set `LOG_LEVEL` to `debug` or `trace` for verbose output (secrets still redacted).

### Support Bundle
Generate diagnostic bundle with automatic secret redaction:
```bash
docker exec aws-eum-x npm run support-bundle
```

Output: `/app/data/support-bundles/aws-eum-x-support-YYYY-MM-DD.txt`

---

## 🔒 Security

### Secrets Handling
- ✅ **Never logged** in plain text
- ✅ **Automatic redaction** at logger level
- ✅ **CSP configurable** for custom networks
- ✅ **Non-root user** (appuser) in container
- ✅ **E.164 validation** for phone numbers

### IAM Least-Privilege Policy
See `iam/minimal-policy.json` and `iam/README.md` for:
- Minimal required permissions
- Resource scoping examples
- IAM user creation guide
- Role-based access for EC2/ECS/EKS

Required IAM actions:
```
sms-voice:SendTextMessage
sms-voice:DescribePhoneNumbers
sms-voice:DescribeSenderIds
```

### CSP Configuration
For custom bridge networks (br0.x):
```
DISABLE_CSP=true
```

For strict CSP:
```
DISABLE_CSP=false
NETWORK_HOST=http://10.0.2.0/24
```

---

## 📡 API Reference

### POST /api/send-sms
Queue a message for sending (respects rate limits).

**Request:**
```json
{
  "DestinationPhoneNumber": "+1234567890",
  "MessageBody": "Your message",
  "OriginationIdentity": "+1987654321",
  "idempotencyKey": "unique-id-123",
  "simulate": false
}
```

**Response (202 Accepted):**
```json
{
  "accepted": true,
  "queueId": "12345-abc",
  "parts": 1
}
```

### POST /api/test/credentials
Test AWS credentials without persisting (ephemeral).

**Request:**
```json
{
  "accessKeyId": "AKIAIOSFODNN7EXAMPLE",
  "secretAccessKey": "wJalrXUtnFEMI/K7MDENG/...",
  "region": "us-east-1"
}
```

**Response:**
```json
{
  "ok": true,
  "phoneNumbers": 2
}
```

### POST /api/test/dry-run
Test message sending without actually sending (AWS DryRun).

**Request:**
```json
{
  "DestinationPhoneNumber": "+1234567890",
  "MessageBody": "Test",
  "OriginationIdentity": "+1987654321"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "DryRun succeeded (no message sent)"
}
```

### GET /api/queue/status
Get current queue depth and token availability.

**Response:**
```json
{
  "ok": true,
  "queueDepth": 5,
  "tokens": 0.8,
  "capacity": 1.0
}
```

### GET /api/last-sends
Retrieve last 50 send attempts (success, failed, simulated).

**Response:**
```json
{
  "ok": true,
  "history": [
    {
      "queueId": "12345-abc",
      "status": "sent",
      "result": { "MessageId": "msg-xyz" },
      "at": 1697500000000
    }
  ]
}
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `AWS_ACCESS_KEY_ID` | *(required)* | IAM access key |
| `AWS_SECRET_ACCESS_KEY` | *(required)* | IAM secret key |
| `AWS_REGION` | `us-east-1` | AWS region |
| `DATA_DIR` | `/app/data` | Container data directory |
| `LOG_LEVEL` | `info` | Log level: error, warn, info, debug, trace |
| `LOG_FORMAT` | `json` | Log format: json or pretty |
| `RATE_LIMIT_PARTS_PER_SECOND` | `1.0` | Message parts per second (MPS) |
| `RATE_LIMIT_MAX_QUEUE_SIZE` | `200` | Max queue depth |
| `MAX_SEND_RETRIES` | `5` | Retry attempts for throttled sends |
| `SENDS_ENABLED` | `false` | Enable real SMS sends (safety default) |
| `SENDS_SIMULATE` | `true` | Simulate sends for testing |
| `DISABLE_CSP` | `true` | Disable CSP for custom networks |
| `CACHE_DURATION` | `300000` | Originator cache TTL (ms) |
| `HISTORY_RETENTION` | `100` | Number of messages to keep in history |

---

## 🧪 Testing

### Run Smoke Tests
```bash
docker exec aws-eum-x npm run smoke
```

Tests verify:
- ✅ Health endpoint returns status ok
- ✅ Readiness endpoint responds
- ✅ AWS probe endpoint responds
- ✅ Queue status returns metrics
- ✅ Send SMS validates required fields
- ✅ E.164 phone number validation

### Manual Testing
1. **Test credentials** via `/api/test/credentials`
2. **DryRun send** via `/api/test/dry-run`
3. **Check queue status** via `/api/queue/status`
4. **View send history** via `/api/last-sends`
5. **Generate support bundle** via `npm run support-bundle`

---

## 📦 Deployment

### Docker Compose
```yaml
version: '3.8'
services:
  aws-eum-x:
    image: ghcr.io/n85uk/aws-eum-x:latest
    container_name: aws-eum-x
    ports:
      - "8080:80"
    environment:
      AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}
      AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY}
      AWS_REGION: us-east-1
      SENDS_ENABLED: "false"
      LOG_LEVEL: info
    volumes:
      - ./data:/app/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://127.0.0.1:80/health"]
      interval: 30s
      timeout: 5s
      retries: 3
```

### Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aws-eum-x
spec:
  replicas: 1
  selector:
    matchLabels:
      app: aws-eum-x
  template:
    metadata:
      labels:
        app: aws-eum-x
    spec:
      containers:
      - name: aws-eum-x
        image: ghcr.io/n85uk/aws-eum-x:latest
        ports:
        - containerPort: 80
        env:
        - name: AWS_REGION
          value: "us-east-1"
        - name: AWS_ACCESS_KEY_ID
          valueFrom:
            secretKeyRef:
              name: aws-credentials
              key: access-key-id
        - name: AWS_SECRET_ACCESS_KEY
          valueFrom:
            secretKeyRef:
              name: aws-credentials
              key: secret-access-key
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 10
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /ready
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 10
        volumeMounts:
        - name: data
          mountPath: /app/data
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: aws-eum-x-data
```

---

## 🐛 Troubleshooting

### "AWS client not initialized"
- Verify `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are set
- Check credentials format (20 chars for access key, 40 chars for secret)
- Test credentials via `/api/test/credentials`

### "User is not authorized to perform: sms-voice:SendTextMessage"
- Attach IAM policy from `iam/minimal-policy.json`
- Verify policy includes required actions
- Check region matches policy conditions

### "Data directory not writable"
- Verify volume mount: `/mnt/user/appdata/aws-eum-x` → `/app/data`
- Check host directory permissions: `chmod 755 /mnt/user/appdata/aws-eum-x`
- Verify container runs as non-root (appuser)

### "Rate limit exceeded"
- Increase `RATE_LIMIT_PARTS_PER_SECOND` if your AWS MPS allows
- Check queue status: `/api/queue/status`
- Review AWS MPS limits for your country/originator

### CSP Violations on Custom Network
- Set `DISABLE_CSP=true` for br0.x networks
- Or configure `NETWORK_HOST` to match your network range

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, coding standards, and pull request guidelines.

---

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

## 🔗 Links

- **GitHub Repository:** https://github.com/N85UK/UNRAID_Apps
- **Issues:** https://github.com/N85UK/UNRAID_Apps/issues
- **AWS Pinpoint SMS Docs:** https://docs.aws.amazon.com/pinpoint/latest/apireference_smsvoicev2/
- **Audit Document:** [AUDIT.md](AUDIT.md)
- **Security Policy:** [SECURITY.md](SECURITY.md)

---

**Made with ❤️ for Unraid Community**
