# AWS EUM v3.0.1 Deployment Guide

## 🚀 Quick Deployment

### For Custom Bridge Networks (br0.2, br0.100, etc.)

**Docker Compose:**
```yaml
version: '3.8'
services:
  aws-eum:
    image: ghcr.io/n85uk/aws-eum-v3:3.0.1
    container_name: aws-eum-v3
    restart: unless-stopped
    ports:
      - "8280:80"
    environment:
      - AWS_ACCESS_KEY_ID=your_access_key
      - AWS_SECRET_ACCESS_KEY=your_secret_key
      - AWS_REGION=eu-west-2
      - DISABLE_CSP=true  # Fix for custom networks
    volumes:
      - ./data:/app/data
    networks:
      - br0.2
```

**Docker Run:**
```bash
docker run -d \
  --name aws-eum-v3 \
  --restart unless-stopped \
  -p 8280:80 \
  -e AWS_ACCESS_KEY_ID=your_access_key \
  -e AWS_SECRET_ACCESS_KEY=your_secret_key \
  -e AWS_REGION=eu-west-2 \
  -e DISABLE_CSP=true \
  -v ./data:/app/data \
  --network br0.2 \
  ghcr.io/n85uk/aws-eum-v3:3.0.1
```

**UNRAID:**
1. Install "AWS EUM v3" from Community Applications
2. Configure AWS credentials
3. Add environment variable: `DISABLE_CSP=true`
4. Select your custom bridge network
5. Apply and start

## 🔧 Configuration Options

### CSP Configuration Matrix

| Network Type | DISABLE_CSP | NETWORK_HOST | Result |
|-------------|-------------|--------------|--------|
| Default Bridge | `false` | (default) | Full security, works out of box |
| br0.2 | `true` | - | All features work, reduced security |
| br0.100 | `true` | - | All features work, reduced security |
| Custom Network | `false` | `http://192.168.x.1` | Network-specific security |

### Environment Variables

#### Required
```bash
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

#### Optional
```bash
AWS_REGION=eu-west-2
PORT=80
RATE_LIMIT_MESSAGES=10
MAX_MESSAGE_LENGTH=1600
HISTORY_RETENTION=100
DISABLE_CSP=false
NETWORK_HOST=http://10.0.2.11
CSP_POLICY=""
```

## 🐳 Build from Source

### Prerequisites
- Docker installed
- Git repository cloned

### Build Process
```bash
# Clone repository
git clone https://github.com/N85UK/UNRAID_Apps.git
cd UNRAID_Apps/Apps/AWS_EUM_v3

# Build image
./build.sh

# Or manually:
docker build -t ghcr.io/n85uk/aws-eum-v3:3.0.1 .
```

### Push to Registry
```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u username --password-stdin

# Push images
docker push ghcr.io/n85uk/aws-eum-v3:3.0.1
docker push ghcr.io/n85uk/aws-eum-v3:latest
```

## 🧪 Testing Deployment

### Basic Functionality Test
```bash
# Start container
docker run -d --name test-aws-eum \
  -p 8280:80 \
  -e DISABLE_CSP=true \
  ghcr.io/n85uk/aws-eum-v3:3.0.1

# Check health
curl http://localhost:8280/health

# View logs
docker logs test-aws-eum

# Access UI
open http://localhost:8280
```

### CSP Testing
```bash
# Test with CSP enabled (should show issues on custom networks)
docker run -d --name test-csp-enabled \
  -p 8281:80 \
  ghcr.io/n85uk/aws-eum-v3:3.0.1

# Test with CSP disabled (should work on all networks)
docker run -d --name test-csp-disabled \
  -p 8282:80 \
  -e DISABLE_CSP=true \
  ghcr.io/n85uk/aws-eum-v3:3.0.1
```

## 🔍 Troubleshooting

### Common Issues

**Charts not loading:**
```bash
# Solution: Disable CSP
-e DISABLE_CSP=true
```

**Dark mode not working:**
```bash
# Solution: Disable CSP or configure network host
-e DISABLE_CSP=true
# OR
-e NETWORK_HOST=http://192.168.2.1
```

**Icons missing:**
```bash
# Solution: Check CSP configuration
-e DISABLE_CSP=true
```

**Container won't start:**
```bash
# Check logs
docker logs aws-eum-v3

# Check image
docker images ghcr.io/n85uk/aws-eum-v3:3.0.1
```

### Debug Mode
```bash
# Enable debug logging
-e ENABLE_DEBUG=true
```

### Health Checks
```bash
# Application health
curl http://localhost:8280/health

# AWS connectivity
curl http://localhost:8280/api/aws/test

# Configuration status
curl http://localhost:8280/api/config
```

## 📚 Documentation References

- [README.md](./README.md) - Main documentation
- [CSP_TROUBLESHOOTING.md](./CSP_TROUBLESHOOTING.md) - Comprehensive CSP guide
- [BR0_NETWORK_FIX.md](./BR0_NETWORK_FIX.md) - Quick br0.2 fix
- [CHANGELOG.md](./CHANGELOG.md) - Version history
- [ULTIMATE_SOLUTION_SUMMARY.md](./ULTIMATE_SOLUTION_SUMMARY.md) - Complete solution overview

## 🎯 Quick Start Checklist

- [ ] Clone/download AWS EUM v3.0.1
- [ ] Configure AWS credentials
- [ ] Set `DISABLE_CSP=true` for custom bridge networks
- [ ] Build/pull Docker image
- [ ] Deploy container
- [ ] Access web interface at http://server:8280
- [ ] Test SMS functionality
- [ ] Verify charts and dark mode work
- [ ] Check console for CSP errors (should be none)

## 🔐 Security Considerations

### CSP Disabled (DISABLE_CSP=true)
- **Pros:** All features work, compatible with any network
- **Cons:** Reduced XSS protection
- **Recommendation:** Use for home/internal networks

### CSP Enabled with Custom Policy
- **Pros:** Maintains security while allowing specific resources
- **Cons:** Complex configuration
- **Recommendation:** Use for production/external-facing deployments

### Network-Specific CSP
- **Pros:** Good balance of security and functionality
- **Cons:** Requires network knowledge
- **Recommendation:** Use when you know your network configuration