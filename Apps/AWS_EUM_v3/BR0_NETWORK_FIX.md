# Quick Fix for br0.2 Network CSP Issues

## 🚨 Problem
AWS EUM v3.0 fails to load charts, icons, and dark mode on custom bridge networks (br0.2, br0.100, etc.) due to Content Security Policy blocking external CDN resources.

## ⚡ Quick Solution

**Option 1: Disable CSP (Recommended for custom networks)**

Add this environment variable to your docker-compose.yml:

```yaml
environment:
  - DISABLE_CSP=true
```

**Option 2: Network-specific configuration**

For br0.2 network:
```yaml
environment:
  - NETWORK_HOST=http://192.168.2.1
```

## 🔧 Implementation

### UNRAID Template
1. Edit the AWS EUM v3.0 container
2. Add environment variable:
   - **Variable**: `DISABLE_CSP`
   - **Value**: `true`
3. Apply changes and restart container

### Docker Compose
```yaml
version: '3.8'
services:
  aws-eum:
    image: ghcr.io/n85uk/aws-eum-v3:latest
    environment:
      - DISABLE_CSP=true  # Add this line
      # ... other environment variables
```

### Docker Run
```bash
docker run -d \
  -e DISABLE_CSP=true \
  -p 8280:80 \
  ghcr.io/n85uk/aws-eum-v3:latest
```

## ✅ Verification

After restart:
1. Open application in browser
2. Check browser console (F12) - no CSP errors
3. Verify charts load properly
4. Test dark mode toggle
5. Confirm icons display correctly

## 📋 Alternative Solutions

If you prefer not to disable CSP entirely, see [CSP_TROUBLESHOOTING.md](./CSP_TROUBLESHOOTING.md) for advanced configuration options.

---

**This fix resolves:**
- ❌ Charts not loading
- ❌ Dark mode not working  
- ❌ Missing Font Awesome icons
- ❌ Console CSP violation errors
- ❌ External CDN resource blocking