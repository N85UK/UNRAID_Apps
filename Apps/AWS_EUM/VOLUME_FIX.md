# Volume Permission Fix for v3.0.10

## Problem

Getting errors:

```
Error saving update info: EACCES: permission denied, open '/data/update-info.json'
Error saving message: EACCES: permission denied, open '/data/history.json'
```

## Root Cause

The environment variable `DATA_DIR=/data` is set, but the container's non-root user (`appuser`) doesn't have write permissions to `/data`.

## Solution - Choose ONE of these options

### Option 1: Remove DATA_DIR Variable (RECOMMENDED)

**Easiest fix** - Don't set `DATA_DIR` at all. The app will use `/app/data` internally.

**UNRAID Docker Template:**

```
Container Path: /app/data
Host Path: /mnt/user/appdata/aws-eum
```

**Docker Run:**

```bash
docker run -d \
  --name aws-eum \
  --network br0 \
  --ip 10.0.2.11 \
  -e DISABLE_CSP=true \
  -e AWS_ACCESS_KEY_ID=your_key \
  -e AWS_SECRET_ACCESS_KEY=your_secret \
  -e AWS_REGION=eu-west-2 \
  -v /mnt/user/appdata/aws-eum:/app/data \
  ghcr.io/n85uk/aws-eum:latest
```

**Key Change:**

- ❌ OLD: `-v /mnt/user/appdata/aws-eum:/data` + `-e DATA_DIR=/data`
- ✅ NEW: `-v /mnt/user/appdata/aws-eum:/app/data` (no DATA_DIR var)

### Option 2: Fix Permissions on /data Mount

If you MUST use `/data` path:

1. **Stop the container**
2. **Fix host directory permissions:**

   ```bash
   sudo chown -R 1000:1000 /mnt/user/appdata/aws-eum
   sudo chmod -R 755 /mnt/user/appdata/aws-eum
   ```

3. **Start the container with:**

   ```bash
   docker run -d \
     --name aws-eum \
     --network br0 \
     --ip 10.0.2.11 \
     -e DISABLE_CSP=true \
     -e DATA_DIR=/data \
     -e AWS_ACCESS_KEY_ID=your_key \
     -e AWS_SECRET_ACCESS_KEY=your_secret \
     -e AWS_REGION=eu-west-2 \
     -v /mnt/user/appdata/aws-eum:/data \
     ghcr.io/n85uk/aws-eum:latest
   ```

### Option 3: Run as Root (NOT RECOMMENDED - Security Risk)

Only use this for testing:

Add to your docker run command:

```bash
--user root
```

This disables the security feature of running as non-root user.

## Verification

After applying the fix:

1. **Check container logs:**

   ```bash
   docker logs aws-eum
   ```

2. **Look for success messages:**

   ```
   ✅ Data directory writable: /app/data
   ✅ Message saved to history (total: 1 messages)
   ```

3. **Send a test SMS** and verify it appears in message history

4. **Check files were created:**

   ```bash
   ls -la /mnt/user/appdata/aws-eum/
   ```

   Should show:

   ```
   -rw-r--r-- 1 1000 1000  123 Oct 12 10:30 history.json
   -rw-r--r-- 1 1000 1000  456 Oct 12 10:30 update-info.json
   ```

## Why This Happens

The Dockerfile creates a non-root user `appuser` (UID 1000, GID 1000) for security. When you mount a volume:

- If the host directory has wrong permissions, the container can't write
- The user inside (UID 1000) needs write access to the mounted directory

## Quick Test

To verify permissions work:

```bash
docker exec -it aws-eum sh -c 'touch /app/data/test.txt && ls -la /app/data/test.txt && rm /app/data/test.txt'
```

**Expected output:**

```
-rw-r--r-- 1 appuser appuser 0 Oct 12 10:30 /app/data/test.txt
```

**If you get "Permission denied"**, apply Option 1 or Option 2 above.

## UNRAID Specific Instructions

1. **Stop the AWS EUM container**
2. **Edit the container template**
3. **Find the volume mapping section**
4. **Change:**
   - Container Path: `/data` → `/app/data`
   - Remove any `DATA_DIR` environment variable
5. **Apply changes**
6. **Start the container**

## Still Having Issues?

Check:

1. Host directory exists: `/mnt/user/appdata/aws-eum`
2. Host directory permissions: `ls -la /mnt/user/appdata/`
3. Container can access: `docker exec aws-eum ls -la /app/data`
4. Environment variables: `docker exec aws-eum env | grep DATA`

If `DATA_DIR` shows anything other than `/app/data` (or blank), that's your problem.
