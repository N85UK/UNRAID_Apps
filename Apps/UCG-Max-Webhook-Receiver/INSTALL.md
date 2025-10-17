# UCG Max Webhook Receiver - Installation Guide

## Prerequisites

- Unraid 6.9+ or Docker-compatible system
- PostgreSQL database (can be deployed via docker-compose)
- UCG Max device configured for webhooks
- Basic understanding of Docker and environment variables

## 🚀 Quick Start (Unraid Community Apps)

### Step 1: Install from Community Apps

1. Open Unraid Dashboard
2. Navigate to **Apps** tab
3. Search for "UCG Max Webhook Receiver"
4. Click **Install**

### Step 2: Configure Required Settings

**Required Configuration:**
- **Web UI Port**: `8000` (or your preferred port)
- **Secret Key**: Generate a random string (e.g., `openssl rand -hex 32`)
- **HMAC Secret**: Shared secret for webhook verification
- **Admin Username**: `admin` (or your choice)
- **Admin Password**: Strong password (CHANGE FROM DEFAULT!)

**Database Configuration:**
- **DATABASE_URL**: `postgresql://ucgmax:password@host:5432/ucgmax`
  - You need a PostgreSQL database
  - See "Database Setup" section below

### Step 3: Start the Container

1. Click **Apply** to create and start the container
2. Wait for initialization (30-60 seconds)
3. Access WebUI at `http://YOUR-SERVER-IP:8000`

## 🗄️ Database Setup

**Option 1: Using Docker Compose (Testing/Development)**

```yaml
services:
  db:

```bash
cd /mnt/user/appdata/ucg-max-webhook
docker-compose up -d
```

This will create:
- PostgreSQL database
- PGAdmin for database management
- Web application

### Option 2: External PostgreSQL (Recommended for Production)

1. **Install PostgreSQL** (if not already installed)
   ```bash
   # On Unraid, install PostgreSQL from Community Apps
   # Or use existing PostgreSQL instance
   ```

2. **Create Database and User**
   ```sql
   CREATE DATABASE ucgmax;
   CREATE USER ucgmax WITH ENCRYPTED PASSWORD 'your-strong-password';
   GRANT ALL PRIVILEGES ON DATABASE ucgmax TO ucgmax;
   ```

3. **Update DATABASE_URL** in container settings
   ```
   postgresql://ucgmax:your-strong-password@postgres-server:5432/ucgmax
   ```

## 🔐 Security Configuration

### Generate Secure Keys

```bash
# Secret Key (for JWT tokens)
openssl rand -hex 32

# HMAC Secret (for webhook verification)
openssl rand -hex 32
```

### Configure UCG Max to Send Webhooks

1. **Log into UCG Max device**
2. **Navigate to Alerts/Notifications settings**
3. **Add Webhook Destination:**
   - **URL**: `http://YOUR-SERVER-IP:8000/webhook/ucgmax`
   - **Method**: `POST`
   - **Headers**:
     ```
     Content-Type: application/json
     X-Hub-Signature-256: <computed HMAC>
     ```
   - Or use Bearer token:
     ```
     Authorization: Bearer YOUR-BEARER-TOKEN
     ```

### Webhook Payload Format

```json
{
  "alert_id": "unique-alert-id",
  "source": "UCG Max",
  "device": "UCG-Max-001",
  "severity": "critical",
  "type": "internet_disconnected",
  "timestamp": "2025-10-17T20:00:00Z",
  "summary": "Internet disconnected on br0.100",
  "details": {
    "latency_ms": 234,
    "packet_loss_pct": 12.5,
    "interface": "br0.100",
    "uptime": "12345s"
  },
  "raw_payload": {}
}
```

## 🧪 Testing the Installation

### 1. Health Check

```bash
curl http://YOUR-SERVER-IP:8000/health
# Expected: {"status":"healthy","service":"ucg-max-webhook-receiver"}
```

### 2. Readiness Check

```bash
curl http://YOUR-SERVER-IP:8000/ready
# Expected: {"status":"ready","database":"connected"}
```

### 3. Send Test Webhook

```bash
curl -X POST http://YOUR-SERVER-IP:8000/webhook/ucgmax \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR-BEARER-TOKEN" \
  -d '{
    "alert_id": "test-001",
    "source": "UCG Max",
    "device": "Test-Device",
    "severity": "info",
    "type": "test_alert",
    "timestamp": "2025-10-17T20:00:00Z",
    "summary": "Test alert from installation",
    "details": {},
    "raw_payload": {}
  }'
```

### 4. Access Web UI

1. Navigate to `http://YOUR-SERVER-IP:8000`
2. Login with admin credentials
3. View your test alert

## 📊 Web Interface Features

- **Dashboard**: View metrics and recent alerts
- **Alert List**: Browse, search, and filter all alerts
- **Alert Details**: View full alert information including JSON payloads
- **CSV Export**: Download alerts for analysis
- **Filters**: By severity, device, type, date range

## 🔧 Advanced Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `SECRET_KEY` | Yes | - | JWT secret for authentication |
| `HMAC_SECRET` | Yes | - | HMAC secret for webhook verification |
| `BEARER_TOKEN` | No | - | Alternative bearer token auth |
| `ADMIN_USER` | Yes | `admin` | Admin username |
| `ADMIN_PASSWORD` | Yes | - | Admin password |
| `ALERT_RETENTION_DAYS` | No | `30` | Days to keep alerts |
| `RATE_LIMIT_REQUESTS` | No | `100` | Max requests per window |
| `RATE_LIMIT_WINDOW` | No | `60` | Rate limit window (seconds) |
| `LOG_LEVEL` | No | `INFO` | Logging level |

### Reverse Proxy Setup (HTTPS)

#### Nginx Proxy Manager

1. Add new proxy host
2. **Domain**: `ucg-webhook.yourdomain.com`
3. **Scheme**: `http`
4. **Forward Hostname/IP**: `YOUR-SERVER-IP`
5. **Forward Port**: `8000`
6. Enable **Websockets Support**
7. Enable **Force SSL**

#### Cloudflare Tunnel

```bash
cloudflared tunnel route dns ucg-webhook ucg-webhook.yourdomain.com
cloudflared tunnel create ucg-webhook
```

Add to config:
```yaml
ingress:
  - hostname: ucg-webhook.yourdomain.com
    service: http://localhost:8000
  - service: http_status:404
```

## 📝 Maintenance

### View Logs

```bash
docker logs ucg-max-webhook-receiver
```

### Backup Database

```bash
docker exec postgres-container pg_dump -U ucgmax ucgmax > backup.sql
```

### Update Container

1. Navigate to Docker tab in Unraid
2. Click **Update** on UCG-Max-Webhook-Receiver
3. Or pull latest:
   ```bash
   docker pull ghcr.io/n85uk/ucg-max-webhook-receiver:latest
   docker-compose up -d
   ```

## 🐛 Troubleshooting

### Issue: Container won't start

**Check logs:**
```bash
docker logs ucg-max-webhook-receiver
```

**Common causes:**
- Database not accessible (check DATABASE_URL)
- Port 8000 already in use
- Missing required environment variables

### Issue: Webhooks not received

**Verify:**
1. Health check passes: `curl http://server:8000/health`
2. Check firewall rules
3. - Verify HMAC secret matches between UCG Max and server

## Support

4. Check container logs for authentication errors

### Issue: Database connection failed

**Check:**

1. PostgreSQL container is running
2. DATABASE_URL is correct
3. Network connectivity between containers
4. PostgreSQL user has correct permissions

## 🆘 Support

- **GitHub Issues**: <https://github.com/N85UK/UNRAID_Apps/issues>
- **Documentation**: <https://github.com/N85UK/UNRAID_Apps/wiki>
- **Unraid Forums**: <https://forums.unraid.net/>

## 📄 License

MIT License - see LICENSE file for details
