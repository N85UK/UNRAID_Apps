# AWS EUM X Deployment Guide

## 🚀 Deployment Options

### Option 1: Unraid Community Apps (Recommended)

#### Step 1: Add Template Repository
1. Open Unraid web interface
2. Navigate to **Docker** tab
3. Click **Add Container**
4. Scroll down to **Template repositories**
5. Add this URL:
   ```
   https://raw.githubusercontent.com/N85UK/UNRAID_Apps/main/Apps/AWS_EUM_X/my-aws-eum-x.xml
   ```
6. Click **Save**

#### Step 2: Install from Template
1. Click **Add Container** again
2. Select **AWS_EUM_X** from the user templates dropdown
3. Configure required settings:
   - **AWS_ACCESS_KEY_ID**: Your IAM access key
   - **AWS_SECRET_ACCESS_KEY**: Your IAM secret key
   - **AWS_REGION**: Your AWS region (e.g., us-east-1)
   - **Host Port**: Any available port (e.g., 8080)
4. Click **Apply**

#### Step 3: Access Web UI
1. Navigate to `http://your-unraid-ip:8080`
2. Complete the first-run wizard
3. Test with DryRun before enabling real sends

---

### Option 2: Direct Docker Command

```bash
docker run -d \
  --name aws-eum-x \
  --restart unless-stopped \
  -p 8080:80 \
  -e AWS_ACCESS_KEY_ID=your_access_key \
  -e AWS_SECRET_ACCESS_KEY=your_secret_key \
  -e AWS_REGION=us-east-1 \
  -e SENDS_ENABLED=false \
  -e LOG_LEVEL=info \
  -v /mnt/user/appdata/aws-eum-x:/app/data \
  ghcr.io/n85uk/aws-eum-x:latest
```

---

### Option 3: Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  aws-eum-x:
    image: ghcr.io/n85uk/aws-eum-x:latest
    container_name: aws-eum-x
    restart: unless-stopped
    ports:
      - "8080:80"
    environment:
      AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}
      AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY}
      AWS_REGION: us-east-1
      SENDS_ENABLED: "false"
      SENDS_SIMULATE: "true"
      LOG_LEVEL: info
      RATE_LIMIT_PARTS_PER_SECOND: "1.0"
      DISABLE_CSP: "true"
    volumes:
      - ./data:/app/data
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://127.0.0.1:80/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s
```

Create `.env` file:
```env
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
```

Deploy:
```bash
docker-compose up -d
```

---

### Option 4: Kubernetes

Apply this manifest:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: aws-eum-x-credentials
type: Opaque
stringData:
  access-key-id: your_access_key_here
  secret-access-key: your_secret_key_here

---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: aws-eum-x-data
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aws-eum-x
  labels:
    app: aws-eum-x
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
          name: http
        env:
        - name: AWS_REGION
          value: "us-east-1"
        - name: AWS_ACCESS_KEY_ID
          valueFrom:
            secretKeyRef:
              name: aws-eum-x-credentials
              key: access-key-id
        - name: AWS_SECRET_ACCESS_KEY
          valueFrom:
            secretKeyRef:
              name: aws-eum-x-credentials
              key: secret-access-key
        - name: SENDS_ENABLED
          value: "false"
        - name: LOG_LEVEL
          value: "info"
        livenessProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 10
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /ready
            port: http
          initialDelaySeconds: 5
          periodSeconds: 10
        volumeMounts:
        - name: data
          mountPath: /app/data
        resources:
          limits:
            memory: "512Mi"
            cpu: "500m"
          requests:
            memory: "256Mi"
            cpu: "100m"
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: aws-eum-x-data

---
apiVersion: v1
kind: Service
metadata:
  name: aws-eum-x
spec:
  selector:
    app: aws-eum-x
  ports:
  - port: 80
    targetPort: http
    name: http
  type: ClusterIP
```

---

## 🔧 Configuration

### Required Environment Variables
- `AWS_ACCESS_KEY_ID` - IAM access key with Pinpoint permissions
- `AWS_SECRET_ACCESS_KEY` - IAM secret access key
- `AWS_REGION` - AWS region (e.g., us-east-1, eu-west-2)

### Important Optional Variables
- `SENDS_ENABLED=false` - **Safety feature**: Must be `true` to send real SMS
- `SENDS_SIMULATE=true` - Simulate sends for testing
- `LOG_LEVEL=info` - Logging verbosity (error, warn, info, debug, trace)
- `RATE_LIMIT_PARTS_PER_SECOND=1.0` - MPS throttling limit
- `DISABLE_CSP=true` - Disable CSP for custom networks (Unraid br0.x)

### Volume Mounts
- **Container Path**: `/app/data`
- **Recommended Host Path**: `/mnt/user/appdata/aws-eum-x`
- **Purpose**: Stores message history and configuration

---

## ✅ Post-Deployment Checklist

### 1. Verify Container is Running
```bash
docker ps | grep aws-eum-x
```

### 2. Check Health
```bash
curl http://localhost:8080/health
```

Expected response:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "build": "2025-10-16T00:00:00Z",
  "uptime": 123.45
}
```

### 3. Check AWS Readiness
```bash
curl http://localhost:8080/ready
```

Expected response (when AWS configured):
```json
{
  "ready": true,
  "aws": {
    "ok": true,
    "phoneNumbers": 2
  }
}
```

### 4. Complete First-Run Wizard
1. Open `http://your-ip:8080` in browser
2. Follow 3-step setup wizard
3. Test credentials
4. Verify phone numbers are discovered

### 5. Test with DryRun
```bash
curl -X POST http://localhost:8080/api/test/dry-run \
  -H "Content-Type: application/json" \
  -d '{
    "DestinationPhoneNumber": "+1234567890",
    "MessageBody": "Test message"
  }'
```

### 6. Enable Real Sends (when ready)
Update environment variable:
```bash
SENDS_ENABLED=true
```

Restart container to apply changes.

---

## 🔍 Monitoring

### Health Checks
- **Liveness**: `GET /health` - Returns 200 if app is alive
- **Readiness**: `GET /ready` - Returns 200 if AWS is connected, 503 otherwise
- **AWS Probe**: `GET /probe/aws` - Dedicated AWS connectivity test

### Logging
View container logs:
```bash
docker logs -f aws-eum-x
```

Logs are structured JSON with automatic secret redaction.

### Metrics
Check queue status:
```bash
curl http://localhost:8080/api/queue/status
```

View last sends:
```bash
curl http://localhost:8080/api/last-sends
```

---

## 🐛 Troubleshooting

### Container won't start
```bash
# Check logs
docker logs aws-eum-x

# Check for port conflicts
netstat -tulpn | grep 8080

# Try different port
docker run ... -p 8081:80 ...
```

### AWS connection fails
```bash
# Test credentials
curl -X POST http://localhost:8080/api/test/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "accessKeyId": "AKIA...",
    "secretAccessKey": "...",
    "region": "us-east-1"
  }'

# Check AWS probe
curl http://localhost:8080/probe/aws
```

### Data directory not writable
```bash
# Check permissions on host
ls -la /mnt/user/appdata/aws-eum-x

# Fix permissions
chmod 755 /mnt/user/appdata/aws-eum-x
```

### Generate support bundle
```bash
docker exec aws-eum-x npm run support-bundle

# View bundle
docker exec aws-eum-x cat /app/data/support-bundles/aws-eum-x-support-*.txt
```

---

## 🔄 Updates

### Watchtower (Automatic)
If you have Watchtower running, it will automatically update the container when new images are published.

### Manual Update
```bash
# Pull latest image
docker pull ghcr.io/n85uk/aws-eum-x:latest

# Stop and remove old container
docker stop aws-eum-x
docker rm aws-eum-x

# Start new container (use same command as initial deployment)
docker run -d --name aws-eum-x ...
```

### Docker Compose Update
```bash
docker-compose pull
docker-compose up -d
```

---

## 📦 Backup and Restore

### Backup Data
```bash
# Backup data directory
tar -czf aws-eum-x-backup-$(date +%Y%m%d).tar.gz \
  /mnt/user/appdata/aws-eum-x
```

### Restore Data
```bash
# Stop container
docker stop aws-eum-x

# Restore backup
tar -xzf aws-eum-x-backup-20251016.tar.gz -C /

# Start container
docker start aws-eum-x
```

---

## 🔗 Resources

- **Template URL**: https://raw.githubusercontent.com/N85UK/UNRAID_Apps/main/Apps/AWS_EUM_X/my-aws-eum-x.xml
- **Docker Image**: ghcr.io/n85uk/aws-eum-x:latest
- **GitHub**: https://github.com/N85UK/UNRAID_Apps
- **Issues**: https://github.com/N85UK/UNRAID_Apps/issues

---

**Need help?** Open an issue on GitHub or check the full [README.md](README.md) for more details.
