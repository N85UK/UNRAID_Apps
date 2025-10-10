# Content Security Policy (CSP) Troubleshooting Guide

## 🛡️ Overview

AWS EUM v3.0 uses Content Security Policy (CSP) headers for security. However, CSP can block external resources like Chart.js, Font Awesome, and other CDN assets when running on custom bridge networks.

## 🚨 Common CSP Issues

### Symptoms
- Dark mode toggle not working
- Missing charts and graphs
- Console errors about blocked resources
- Missing icons or styling
- Browser developer console shows CSP violations

### Typical Error Messages
```
Refused to load the script 'https://cdn.jsdelivr.net/npm/chart.js' because it violates the following Content Security Policy directive
Refused to load the stylesheet 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
```

## 🔧 Solutions

### Solution 1: Disable CSP (Simplest)

**Best for**: Quick fixes, custom bridge networks, development

```bash
# In docker-compose.yml or UNRAID template
environment:
  - DISABLE_CSP=true
```

**Pros**: 
- ✅ Allows all external resources
- ✅ Fixes all CSP-related issues
- ✅ Simple to implement

**Cons**: 
- ⚠️ Reduces security
- ⚠️ May not be suitable for production

### Solution 2: Network-Specific CSP

**Best for**: Custom bridge networks with known IP ranges

```bash
# For br0.2 network with gateway 192.168.2.1
environment:
  - NETWORK_HOST=http://192.168.2.1
  
# For br0.100 network
environment:
  - NETWORK_HOST=http://192.168.100.1
```

**Pros**: 
- ✅ Maintains some security
- ✅ Allows your network traffic
- ✅ Blocks unauthorized external access

**Cons**: 
- ⚠️ May still block some external CDNs
- ⚠️ Requires network configuration knowledge

### Solution 3: Custom Permissive CSP Policy

**Best for**: Advanced users who want fine-grained control

```bash
# Permissive policy allowing major CDNs
environment:
  - CSP_POLICY={"defaultSrc":["'self'","'unsafe-inline'","'unsafe-eval'","data:","http:","https:"],"styleSrc":["'self'","'unsafe-inline'","http:","https:","cdnjs.cloudflare.com","cdn.jsdelivr.net"],"scriptSrc":["'self'","'unsafe-inline'","'unsafe-eval'","http:","https:","cdnjs.cloudflare.com","cdn.jsdelivr.net"],"imgSrc":["'self'","data:","http:","https:"],"connectSrc":["'self'","http:","https:"],"fontSrc":["'self'","data:","http:","https:","cdnjs.cloudflare.com"]}
```

**Pros**: 
- ✅ Granular control over allowed resources
- ✅ Allows specific CDNs while blocking others
- ✅ Maintains reasonable security

**Cons**: 
- ⚠️ Complex to configure
- ⚠️ Requires JSON knowledge
- ⚠️ Hard to troubleshoot

## 🌐 Network-Specific Configurations

### Default Bridge Network
```bash
# Usually works out of the box
DISABLE_CSP=false
NETWORK_HOST=http://10.0.2.11  # Default
```

### Custom Bridge Networks (br0.x)
```bash
# Option 1: Disable CSP entirely (recommended)
DISABLE_CSP=true

# Option 2: Set network host
NETWORK_HOST=http://[your-network-gateway]
```

### Common Network Configurations
```bash
# br0.2 network
NETWORK_HOST=http://192.168.2.1

# br0.100 network  
NETWORK_HOST=http://192.168.100.1

# br0.50 network
NETWORK_HOST=http://192.168.50.1
```

## 🔍 Debugging CSP Issues

### 1. Check Browser Console
Open browser developer tools (F12) and look for CSP violation errors:

```
Content Security Policy: The page's settings blocked the loading of a resource at https://cdn.jsdelivr.net/npm/chart.js
```

### 2. Test with CSP Disabled
Temporarily disable CSP to confirm it's the cause:

```bash
docker exec -it aws-eum-v3 sh
export DISABLE_CSP=true
# Restart container to apply changes
```

### 3. Network Connectivity Test
Test if external resources are accessible from your container:

```bash
# Test from container
docker exec -it aws-eum-v3 wget -q --spider https://cdn.jsdelivr.net/npm/chart.js
echo $?  # Should return 0 if accessible
```

### 4. Check CSP Headers
Use browser developer tools to inspect response headers:

```
Content-Security-Policy: default-src 'self' http://10.0.2.11; style-src 'self' 'unsafe-inline' http://10.0.2.11;
```

## 🛠️ Implementation Steps

### Step 1: Identify Your Network
```bash
# Find your docker network gateway
docker network inspect bridge | grep Gateway
# or for custom networks
docker network inspect br0.2 | grep Gateway
```

### Step 2: Choose Configuration Method
- **Quick fix**: Set `DISABLE_CSP=true`
- **Network-specific**: Set `NETWORK_HOST=http://[gateway-ip]`
- **Advanced**: Set custom `CSP_POLICY`

### Step 3: Update Configuration
**For docker-compose:**
```yaml
environment:
  - DISABLE_CSP=true  # or your chosen option
```

**For UNRAID template:**
Add environment variable in the template configuration.

### Step 4: Restart Container
```bash
docker restart aws-eum-v3
```

### Step 5: Test
- Open application in browser
- Check for CSP violations in console
- Verify charts and styling load correctly

## 📚 Additional Resources

### CSP Policy Generator
Use online CSP generators for custom policies:
- [CSP Generator](https://www.cspisawesome.com/generator)
- [Mozilla CSP Guidelines](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

### Common CDNs Used by AWS EUM v3
- `cdn.jsdelivr.net` - Chart.js library
- `cdnjs.cloudflare.com` - Font Awesome icons
- `fonts.googleapis.com` - Google Fonts
- `unpkg.com` - Various JavaScript libraries

### Testing URLs
Test these URLs to verify external access:
- https://cdn.jsdelivr.net/npm/chart.js
- https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css
- https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap

## 🎯 Quick Resolution Checklist

- [ ] Browser console shows CSP violations
- [ ] Charts/dark mode not working
- [ ] Running on custom bridge network (br0.x)
- [ ] Set `DISABLE_CSP=true` in environment
- [ ] Restart container
- [ ] Test application functionality
- [ ] Verify no CSP errors in console

---

**Need Help?** Check the main troubleshooting guide or create an issue with:
- Your network configuration
- Browser console errors  
- Docker network inspect output
- Current environment variables