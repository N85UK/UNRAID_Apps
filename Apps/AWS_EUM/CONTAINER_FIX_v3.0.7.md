# 🚨 URGENT: Docker Container Fix for v3.0.7

## Issue

Your Docker container is running an **old image** that has the `CURRENT_VERSION` bug, causing continuous crashes.

## Status

✅ **Code is fixed** in repository (all `CURRENT_VERSION` → `APP_VERSION`)  
✅ **Git tag v3.0.7 created and pushed**  
🔄 **GitHub Actions is building new Docker image NOW**

## What's Happening

1. ✅ Git tag `v3.0.7` pushed to GitHub
2. 🔄 GitHub Actions workflow triggered automatically
3. 🔄 Building multi-architecture Docker image (amd64, arm64)
4. ⏳ Will push to: `ghcr.io/n85uk/aws-eum:3.0.7` and `:latest`

**Build time:** ~5-10 minutes

## Track Build Progress

Watch the build here:
<https://github.com/N85UK/UNRAID_Apps/actions>

Look for: **"Build and Push AWS EUM v3 Docker Image"** workflow

## Update Your Container (After Build Completes)

### Option 1: UNRAID UI (Recommended)

1. **Wait for build to complete** (~5-10 minutes)
2. Go to **Docker** tab in UNRAID
3. Find **AWS_EUM** container
4. Click **Force Update** (downloads new :latest image)
5. **Start** the container
6. Check logs: `docker logs AWS_EUM` - should show `v3.0.7` running

### Option 2: Command Line

```bash
# Wait for GitHub Actions build to complete, then:

# Stop and remove old container
docker stop AWS_EUM
docker rm AWS_EUM

# Pull new image with fixes
docker pull ghcr.io/n85uk/aws-eum:latest

# Recreate container via UNRAID UI or docker-compose
```

### Option 3: Specific Version Tag

```bash
docker pull ghcr.io/n85uk/aws-eum:3.0.7
# Update your UNRAID template to use :3.0.7 instead of :latest
```

## Verify Fix

After updating, check logs:

```bash
docker logs AWS_EUM | tail -20
```

**Should see:**

```
🚀 AWS EUM v3.0.7 server running on port 80
🌐 HTTP Server: http://0.0.0.0:80
🌍 AWS Region: eu-west-2
✅ Application is up to date
```

**Should NOT see:**

```
ReferenceError: CURRENT_VERSION is not defined
```

## What Was Fixed

| Issue | Status |
|-------|--------|
| Syntax error (line 248) | ✅ Fixed |
| CURRENT_VERSION undefined (7 locations) | ✅ Fixed |
| Missing EJS views directory | ✅ Fixed |
| Version consistency | ✅ Fixed |

## Timeline

- **Now:** Build triggered via git tag
- **~10 mins:** New Docker image available at `ghcr.io/n85uk/aws-eum:latest`
- **After pull:** Container will start successfully
- **Result:** Web UI accessible at <http://10.0.2.11:80>

## If Urgent (Build Locally)

If you can't wait for GitHub Actions:

```bash
cd /Users/paul.mccann/UNRAID_Apps/Apps/AWS_EUM

# Build locally
docker build -t aws-eum:3.0.7 .

# Update UNRAID template to use local image
# Repository: aws-eum
# Tag: 3.0.7
```

## Need Help?

Check build status:

```bash
gh run list --workflow=docker-build-aws-eum.yml --limit 1
```

View build logs:

```bash
gh run watch
```

---

**ETA for working container: 10-15 minutes** (after GitHub Actions completes)

The automated Git Flow is now working - all future commits to `main` will automatically rebuild the Docker image! 🚀
