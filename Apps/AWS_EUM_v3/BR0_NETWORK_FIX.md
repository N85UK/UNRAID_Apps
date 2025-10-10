# Quick Fix for br0.2 Network Issues

## 🚨 Problem
AWS EUM v3.0.1 charts, icons, and dark mode don't work on custom bridge networks (br0.2, br0.100, etc.)

## ⚡ Solution
Add one environment variable:

### UNRAID
1. Edit AWS EUM v3.0.1 container
2. Add environment variable:
   - **Variable**: `DISABLE_CSP`
   - **Value**: `true`
3. Apply and restart

### Docker Compose
```yaml
environment:
  - DISABLE_CSP=true
```

### Docker Run
```bash
docker run -d -e DISABLE_CSP=true -p 8280:80 ghcr.io/n85uk/aws-eum-v3:3.0.1
```

## ✅ Verification
After restart:
- Charts load properly
- Dark mode toggle works
- Icons display correctly
- No console CSP errors

---
**This fixes all external resource loading issues on custom bridge networks.**