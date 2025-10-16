# Testing Guide - AWS EUM X

This document provides comprehensive testing procedures for AWS_EUM_X before production deployment.

---

## 🧪 Testing Overview

AWS_EUM_X includes multiple testing layers:

1. **Smoke Tests** - Basic functionality validation
2. **UI Page Tests** - Web interface rendering and interactivity
3. **API Tests** - Endpoint functionality and validation
4. **Integration Tests** - AWS connectivity and message sending
5. **Performance Tests** - Response time and resource usage

---

## 📋 Pre-Deployment Checklist

Before running tests, ensure:

- [ ] Docker is installed and running
- [ ] Container is built or pulled from registry
- [ ] AWS credentials are available (for integration tests)
- [ ] Test phone number is available (for end-to-end tests)
- [ ] Port 8080 (or custom) is available on host

---

## 1️⃣ Smoke Tests

**Purpose:** Verify basic functionality without AWS credentials.

### Run Automated Smoke Tests

```bash
# From repository root
cd Apps/AWS_EUM_X

# Run smoke tests (requires container to be running)
docker exec aws-eum-x npm run smoke
```

**Expected Output:**
```
✅ Health endpoint returns status ok
✅ Readiness endpoint responds
✅ AWS probe endpoint responds (may fail without creds)
✅ Queue status returns metrics
✅ Send SMS validates required fields
✅ E.164 phone number validation works
```

### Manual Smoke Test

```bash
# Start container in test mode
docker run -d --name aws-eum-x-test \
  -p 8080:80 \
  -e DRY_RUN=true \
  -e SKIP_AWS_VALIDATION=true \
  -e LOG_LEVEL=debug \
  ghcr.io/n85uk/aws-eum-x:latest

# Wait 5 seconds for startup
sleep 5

# Test health endpoint
curl http://localhost:8080/health

# Expected: {"ok":true,"version":"1.0.0","uptime":...}
```

---

## 2️⃣ UI Page Tests

**Purpose:** Validate all web pages render correctly without errors.

### Automated UI Testing Script

```bash
# Make script executable
chmod +x scripts/test-ui-pages.sh

# Run UI tests (container must be running)
./scripts/test-ui-pages.sh aws-eum-x 8080
```

**Script checks:**
- ✅ Container is running and healthy
- ✅ Health endpoints return 200 OK
- ✅ Dashboard page renders with status tiles
- ✅ Settings page displays configuration
- ✅ Actions page shows test message form
- ✅ Observability page shows metrics
- ✅ All pages have valid HTML (no EJS errors)
- ✅ Static assets (CSS, JS) load correctly
- ✅ Response times are <100ms

### Manual UI Testing

**Dashboard Page (`/dashboard`):**
```bash
# Open in browser
open http://localhost:8080/dashboard

# Check for:
# - 6 status tiles (AWS connectivity, queue depth, etc.)
# - Auto-refresh indicator (30s timer)
# - Quick actions buttons
# - No EJS syntax errors (<%= ... %> visible)
```

**Settings Page (`/settings`):**
```bash
open http://localhost:8080/settings

# Check for:
# - Grouped configuration sections
# - AWS documentation links (🔗 icons)
# - Environment variable values displayed
# - No plaintext secrets (should show *****REDACTED)
```

**Actions Page (`/actions`):**
```bash
open http://localhost:8080/actions

# Check for:
# - Test message form (phone, message, DryRun checkbox)
# - Refresh originators button
# - Queue management buttons
# - Support bundle instructions
```

**Observability Page (`/observability`):**
```bash
open http://localhost:8080/observability

# Check for:
# - Metrics tiles (version, uptime, queue, sends)
# - Log viewer with filtering
# - Health endpoint documentation
# - Auto-refresh toggle
```

---

## 3️⃣ API Endpoint Tests

**Purpose:** Validate REST API functionality.

### Health Endpoints

```bash
# Liveness probe (should always return 200)
curl http://localhost:8080/health
# Expected: {"ok":true,"version":"1.0.0",...}

# Readiness probe (200 if AWS configured, 503 if not)
curl http://localhost:8080/ready
# Expected: {"ok":true,"aws":{"connected":true},...}

# AWS connectivity probe
curl http://localhost:8080/probe/aws
# Expected: {"ok":true,"phoneNumbers":2,...} (with valid creds)
```

### Queue Management

```bash
# Get queue status
curl http://localhost:8080/api/queue/status
# Expected: {"ok":true,"queueDepth":0,"tokens":1.0,...}

# Get last 50 sends
curl http://localhost:8080/api/last-sends
# Expected: {"ok":true,"history":[...],...}
```

### Message Validation

```bash
# Test invalid phone number (should fail validation)
curl -X POST http://localhost:8080/api/send-sms \
  -H "Content-Type: application/json" \
  -d '{
    "DestinationPhoneNumber": "invalid",
    "MessageBody": "Test",
    "OriginationIdentity": "+1234567890"
  }'
# Expected: 400 Bad Request with validation error

# Test valid request (DryRun mode, no AWS call)
curl -X POST http://localhost:8080/api/send-sms \
  -H "Content-Type: application/json" \
  -d '{
    "DestinationPhoneNumber": "+12345678901",
    "MessageBody": "Test message",
    "OriginationIdentity": "+19876543210",
    "simulate": true
  }'
# Expected: 202 Accepted with queueId
```

---

## 4️⃣ Integration Tests (AWS)

**Purpose:** Test actual AWS Pinpoint connectivity and message sending.

### Prerequisites

```bash
# Set AWS credentials
export AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"
export AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/..."
export AWS_REGION="us-east-1"

# Restart container with credentials
docker stop aws-eum-x-test
docker run -d --name aws-eum-x-test \
  -p 8080:80 \
  -e AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" \
  -e AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" \
  -e AWS_REGION="$AWS_REGION" \
  -e DRY_RUN=true \
  -e LOG_LEVEL=info \
  ghcr.io/n85uk/aws-eum-x:latest

# Wait for startup
sleep 5
```

### Test AWS Connectivity

```bash
# Test credentials (ephemeral, not persisted)
curl -X POST http://localhost:8080/api/test/credentials \
  -H "Content-Type: application/json" \
  -d "{
    \"accessKeyId\": \"$AWS_ACCESS_KEY_ID\",
    \"secretAccessKey\": \"$AWS_SECRET_ACCESS_KEY\",
    \"region\": \"$AWS_REGION\"
  }"

# Expected: {"ok":true,"phoneNumbers":N,"senderIds":M}
```

### Test DryRun Message

```bash
# Send test message with DryRun=true (no charge)
curl -X POST http://localhost:8080/api/test/dry-run \
  -H "Content-Type: application/json" \
  -d '{
    "DestinationPhoneNumber": "+12345678901",
    "MessageBody": "Test DryRun message",
    "OriginationIdentity": "+19876543210"
  }'

# Expected: {"ok":true,"message":"DryRun succeeded (no message sent)"}
```

### Test Real Message (Optional)

**⚠️ WARNING:** This will send an actual SMS and incur AWS charges.

```bash
# Enable real sends
docker exec aws-eum-x-test sh -c 'export SENDS_ENABLED=true && npm start &'

# Send real message
curl -X POST http://localhost:8080/api/send-sms \
  -H "Content-Type: application/json" \
  -d '{
    "DestinationPhoneNumber": "+1YOUR_TEST_NUMBER",
    "MessageBody": "Test message from AWS EUM X",
    "OriginationIdentity": "+1YOUR_ORIGINATOR"
  }'

# Expected: {"accepted":true,"queueId":"...","parts":1}

# Check send history
curl http://localhost:8080/api/last-sends | jq '.history[0]'

# Expected: {"status":"sent","result":{"MessageId":"msg-xyz"},...}
```

---

## 5️⃣ Performance Tests

**Purpose:** Measure response times and resource usage.

### Response Time Benchmarking

```bash
# Test health endpoint (10 requests)
for i in {1..10}; do
  curl -w "Time: %{time_total}s\n" -o /dev/null -s http://localhost:8080/health
done

# Expected: All responses <100ms
```

### Load Testing with Apache Bench

```bash
# Install Apache Bench (ab)
# macOS: brew install httpd
# Ubuntu: apt-get install apache2-utils

# 100 requests, 10 concurrent
ab -n 100 -c 10 http://localhost:8080/health

# Check metrics:
# - Requests per second (should be >100)
# - Time per request (should be <100ms)
# - Failed requests (should be 0)
```

### Memory Usage

```bash
# Check container memory usage
docker stats aws-eum-x-test --no-stream

# Expected:
# - Idle: ~85 MB
# - Under load: <200 MB
```

### Startup Time

```bash
# Measure container startup to healthy state
time docker run -d --name aws-eum-x-startup \
  -e SKIP_AWS_VALIDATION=true \
  -e DRY_RUN=true \
  ghcr.io/n85uk/aws-eum-x:latest && \
  until docker exec aws-eum-x-startup curl -f http://localhost:80/health 2>/dev/null; do
    sleep 0.1
  done

# Expected: <3 seconds
```

---

## 6️⃣ Security Tests

**Purpose:** Validate security controls and secret handling.

### Secret Redaction Test

```bash
# Check logs for plaintext secrets
docker logs aws-eum-x-test 2>&1 | grep -i "AKIA" || echo "✅ No access keys in logs"
docker logs aws-eum-x-test 2>&1 | grep -i "wJalr" || echo "✅ No secret keys in logs"

# Generate support bundle
docker exec aws-eum-x-test npm run support-bundle

# Copy bundle to host
docker cp aws-eum-x-test:/app/data/support-bundles/. ./support-bundles/

# Verify redaction
cat support-bundles/*.txt | grep -i "REDACTED" && echo "✅ Secrets redacted"
cat support-bundles/*.txt | grep -i "AKIA" && echo "❌ Access key leaked!" || echo "✅ No leaked keys"
```

### CSP Header Test

```bash
# Check Content-Security-Policy header
curl -I http://localhost:8080/dashboard | grep -i "content-security-policy"

# Expected (if DISABLE_CSP=false):
# Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; ...
```

### Non-Root User Test

```bash
# Check container runs as non-root
docker exec aws-eum-x-test whoami
# Expected: appuser (not root)

# Check file permissions
docker exec aws-eum-x-test ls -la /app/data
# Expected: Owner = appuser:appgroup
```

---

## 7️⃣ Regression Tests

**Purpose:** Ensure backward compatibility with AWS_EUM v3.0.x.

### Migration Test

```bash
# Start AWS_EUM v3.0.11 container
docker run -d --name aws-eum-legacy \
  -p 8081:80 \
  -e AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" \
  -e AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" \
  -e AWS_REGION="$AWS_REGION" \
  ghcr.io/n85uk/aws-eum:3.0.11

# Start AWS_EUM_X v1.0.0 container
docker run -d --name aws-eum-x-new \
  -p 8082:80 \
  -e AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" \
  -e AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" \
  -e AWS_REGION="$AWS_REGION" \
  ghcr.io/n85uk/aws-eum-x:1.0.0

# Compare health endpoints
diff <(curl -s http://localhost:8081/health | jq -S .) \
     <(curl -s http://localhost:8082/health | jq -S .)

# Should show minimal differences (version, features)
```

---

## 📊 Test Results Template

Use this template to document test results:

```markdown
## Test Results - AWS EUM X v1.0.0

**Date:** 2025-10-16  
**Tester:** [Your Name]  
**Environment:** Unraid 6.12, Docker 24.x

### Smoke Tests
- [x] Health endpoint: PASS
- [x] Readiness endpoint: PASS
- [x] Queue status: PASS
- [x] E.164 validation: PASS

### UI Tests
- [x] Dashboard renders: PASS (30s auto-refresh working)
- [x] Settings page: PASS (all config visible)
- [x] Actions page: PASS (test message form works)
- [x] Observability: PASS (logs update every 10s)

### Integration Tests
- [x] AWS connectivity: PASS (2 phone numbers, 1 sender ID)
- [x] DryRun test: PASS (no charge)
- [ ] Real message: SKIPPED (not needed for v1.0.0 release)

### Performance
- Startup time: 2.4s
- Health endpoint: 12ms avg
- Memory usage: 87 MB idle

### Security
- [x] Secret redaction: PASS
- [x] Non-root user: PASS
- [x] CSP headers: PASS

### Issues Found
- None

### Recommendation
✅ APPROVED for production release
```

---

## 🐛 Troubleshooting Test Failures

### "Connection refused" errors
```bash
# Check container is running
docker ps | grep aws-eum-x

# Check port mapping
docker port aws-eum-x

# Check logs
docker logs aws-eum-x --tail 50
```

### UI pages show EJS syntax
```bash
# EJS not rendering - check server.js routes
docker exec aws-eum-x cat server.js | grep "app.get"

# Restart container
docker restart aws-eum-x
```

### AWS connectivity fails
```bash
# Verify credentials are set
docker exec aws-eum-x env | grep AWS_

# Test credentials directly
docker exec aws-eum-x npm run test-aws-creds

# Check IAM permissions
aws iam simulate-principal-policy \
  --policy-source-arn arn:aws:iam::ACCOUNT:user/USERNAME \
  --action-names sms-voice:SendTextMessage
```

---

## ✅ Sign-Off Checklist

Before releasing v1.0.0, confirm:

- [ ] All smoke tests pass
- [ ] All UI pages render without errors
- [ ] All API endpoints return expected responses
- [ ] AWS connectivity works with valid credentials
- [ ] DryRun mode prevents actual sends
- [ ] Secrets are redacted in logs and support bundles
- [ ] Container runs as non-root user
- [ ] Startup time is <3 seconds
- [ ] Memory usage is <100 MB idle
- [ ] Response times are <100ms
- [ ] No regressions from AWS_EUM v3.0.x
- [ ] Documentation is up to date
- [ ] CHANGELOG.md is updated for v1.0.0

---

**Next Steps:** After all tests pass, proceed with:
1. Tag release: `git tag v1.0.0`
2. Push to GitHub: `git push origin v1.0.0`
3. CI/CD builds and publishes container
4. Submit to Unraid Community Apps
