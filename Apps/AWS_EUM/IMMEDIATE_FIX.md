# 🚨 IMMEDIATE FIX - Enable CSP Disable for br0.2 Network

## Your Issue

✅ Container is now running (v3.0.7 fixes worked!)  
❌ CSP is blocking Font Awesome, Chart.js, and other resources  
❌ "Missing required fields" error when sending SMS

## Root Cause

Your container is on **br0.2 network** at **10.0.2.11**, which requires CSP to be disabled, but the template has:
```
DISABLE_CSP = false  ❌
```

## Quick Fix (2 Minutes)

### Step 1: Stop Container
```bash
docker stop AWS_EUM
```

### Step 2: Edit Container in UNRAID

1. Go to **Docker** tab
2. Click **AWS_EUM** container
3. Click **Edit**
4. Find **DISABLE_CSP** setting
5. Change from `false` to **`true`**
6. Click **Apply**

### Step 3: Start Container
The container will restart automatically with CSP disabled.

### Step 4: Verify Fix

1. Open browser: http://10.0.2.11:80
2. Press **Ctrl+Shift+R** (hard refresh)
3. Check console (F12) - **no more CSP errors**
4. Charts should load
5. Send SMS should work

## Alternative: Command Line Fix

If you prefer SSH:

```bash
# Stop container
docker stop AWS_EUM
docker rm AWS_EUM

# Recreate with CSP disabled (add -e DISABLE_CSP=true)
docker run -d \
  --name='AWS_EUM' \
  --net='br0.2' \
  --ip='10.0.2.11' \
  --pids-limit 2048 \
  -e TZ="Europe/London" \
  -e AWS_ACCESS_KEY_ID='YOUR_AWS_ACCESS_KEY' \
  -e AWS_SECRET_ACCESS_KEY='YOUR_AWS_SECRET_KEY' \
  -e AWS_REGION='eu-west-2' \
  -e DISABLE_CSP='true' \
  -e RATE_LIMIT_MESSAGES='10' \
  -e MAX_MESSAGE_LENGTH='1600' \
  -e HISTORY_RETENTION='100' \
  -e AUTO_UPDATE_CHECK='true' \
  -e UPDATE_CHECK_INTERVAL='24' \
  -e AUTO_UPDATE_APPLY='false' \
  -e DATA_DIR='/data' \
  -v '/mnt/user/appdata/aws-eum':'/data':'rw' \
  --restart unless-stopped \
  --memory=512m \
  --cpu-shares=1024 \
  ghcr.io/n85uk/aws-eum:latest
```

## Expected Results After Fix

### Container Logs Should Show:
```
🔒 CSP Configuration:
   - DISABLE_CSP: true          ← Should be TRUE
   - CSP_POLICY: default
   - NETWORK_HOST: http://10.0.2.11
🔓 CSP completely disabled via environment variable  ← This line!
✅ AWS SMS client initialized successfully
📍 Region: eu-west-2
🚀 AWS EUM v3.0.7 server running on port 80
```

### Browser Console Should Show:
- ✅ No CSP errors
- ✅ Font Awesome loads
- ✅ Chart.js loads
- ✅ All resources load from CDN

### Web UI Should Show:
- ✅ Charts display properly
- ✅ Icons display
- ✅ Dark mode toggle works
- ✅ SMS form works without "Missing required fields"

## Why This Happened

The UNRAID template has `DISABLE_CSP` defaulting to `false` because:
- Most users are on default Docker bridge (172.x.x.x)
- CSP works fine on default bridge
- **Custom bridges (br0.x) need CSP disabled**

## Permanent Fix

Update the template default for br0.2 users:

1. Edit `my-aws-eum.xml`
2. Change line:
   ```xml
   <Config Name="DISABLE_CSP" Target="DISABLE_CSP" Default="true" ...
   ```
3. Or just remember to set it to `true` when installing

## Network Reference

| Network Type | DISABLE_CSP | Why |
|--------------|-------------|-----|
| Default bridge (172.x.x.x) | `false` | CSP works fine |
| Custom bridge (br0.2) | `true` | CSP blocks local IPs |
| Custom bridge (br0.100) | `true` | CSP blocks local IPs |
| macvlan | `true` | CSP blocks local IPs |
| host | `false` | Uses localhost |

---

**Fix Time: 2 minutes** - Just change DISABLE_CSP to true and restart! 🚀
