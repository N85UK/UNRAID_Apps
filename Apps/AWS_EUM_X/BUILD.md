# Build and Release Guide

## 🏗️ Building the Docker Image

### Prerequisites
- Docker installed locally
- GitHub account with repository access
- GitHub Actions enabled on repository

---

## Local Build

### Build for Single Platform (fast)
```bash
cd Apps/AWS_EUM_X

# Build for your current platform
docker build -t aws-eum-x:local .

# Test the build
docker run -d --name test -p 3000:80 aws-eum-x:local
curl http://localhost:3000/health
docker stop test && docker rm test
```

### Build Multi-Platform (amd64 + arm64)
```bash
# Create buildx builder (one time)
docker buildx create --name multiarch --use
docker buildx inspect --bootstrap

# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ghcr.io/n85uk/aws-eum-x:latest \
  --push \
  .
```

---

## Automated GitHub Actions Build

### Automatic Build Triggers

The GitHub Actions workflow (`.github/workflows/build-aws-eum-x.yml`) automatically builds and publishes when:

1. **Push to main branch** with changes in:
   - `Apps/AWS_EUM_X/**`
   - `.github/workflows/build-aws-eum-x.yml`

2. **Pull request** with changes in AWS_EUM_X (builds but doesn't publish)

3. **Manual workflow dispatch** (allows custom version tag)

### Workflow Steps

1. **Checkout code**
2. **Set up QEMU** (for multi-arch builds)
3. **Set up Docker Buildx**
4. **Login to GitHub Container Registry** (GHCR)
5. **Extract metadata** (tags, labels)
6. **Get version** from `package.json`
7. **Build and push** Docker image
   - Platforms: `linux/amd64`, `linux/arm64`
   - Tags: `latest`, `<version>`
8. **Run smoke tests** on built image
9. **Generate release notes**
10. **Create GitHub release** (manual dispatch only)

---

## Manual Release Process

### 1. Update Version
Edit `Apps/AWS_EUM_X/package.json`:
```json
{
  "version": "1.0.1"
}
```

### 2. Update CHANGELOG
Add entry to `Apps/AWS_EUM_X/CHANGELOG.md`:
```markdown
## [1.0.1] - 2025-10-16

### Added
- New feature description

### Fixed
- Bug fix description
```

### 3. Commit and Push
```bash
git add Apps/AWS_EUM_X/package.json Apps/AWS_EUM_X/CHANGELOG.md
git commit -m "Release v1.0.1"
git push origin main
```

### 4. Monitor Build
1. Go to GitHub Actions tab
2. Watch "Build and Push AWS_EUM_X Docker Image" workflow
3. Verify build succeeds
4. Check smoke tests pass

### 5. Create GitHub Release (Optional)
Use workflow dispatch with version tag:
1. Go to Actions → "Build and Push AWS_EUM_X Docker Image"
2. Click "Run workflow"
3. Enter version (e.g., `1.0.1`)
4. Click "Run workflow"

This creates a GitHub release with automated release notes.

---

## Verifying the Build

### Check Image was Published
```bash
# List tags for the image
docker pull ghcr.io/n85uk/aws-eum-x:latest
docker pull ghcr.io/n85uk/aws-eum-x:1.0.0

# Inspect image
docker inspect ghcr.io/n85uk/aws-eum-x:latest
```

### Test the Published Image
```bash
docker run -d \
  --name aws-eum-x-verify \
  -p 9000:80 \
  -e SENDS_ENABLED=false \
  ghcr.io/n85uk/aws-eum-x:latest

# Wait for startup
sleep 5

# Test endpoints
curl http://localhost:9000/health
curl http://localhost:9000/ready

# Check logs
docker logs aws-eum-x-verify

# Cleanup
docker stop aws-eum-x-verify
docker rm aws-eum-x-verify
```

---

## Unraid Template Testing

### 1. Update Template (if needed)
Edit `Apps/AWS_EUM_X/my-aws-eum-x.xml` if configuration changed.

### 2. Commit Template Changes
```bash
git add Apps/AWS_EUM_X/my-aws-eum-x.xml
git commit -m "Update Unraid template for v1.0.1"
git push origin main
```

### 3. Verify Template URL
The template will be accessible at:
```
https://raw.githubusercontent.com/N85UK/UNRAID_Apps/main/Apps/AWS_EUM_X/my-aws-eum-x.xml
```

### 4. Test Installation on Unraid
1. Add template repository URL in Unraid Docker settings
2. Select AWS_EUM_X template
3. Verify all fields appear correctly
4. Install container
5. Check logs for successful startup
6. Test web UI and first-run wizard

---

## GitHub Container Registry (GHCR)

### Authentication
GitHub Actions automatically authenticates using `GITHUB_TOKEN`.

For local publishing:
```bash
# Create personal access token with write:packages scope
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Push image
docker push ghcr.io/n85uk/aws-eum-x:latest
```

### Image Visibility
Images are public by default. To verify:
1. Go to https://github.com/N85UK/UNRAID_Apps/pkgs/container/aws-eum-x
2. Check visibility settings
3. Ensure "Public" is selected

---

## Build Artifacts

### Docker Image Tags
- `ghcr.io/n85uk/aws-eum-x:latest` - Always points to latest main build
- `ghcr.io/n85uk/aws-eum-x:1.0.0` - Specific version from package.json
- `ghcr.io/n85uk/aws-eum-x:main-<sha>` - Commit-specific builds

### Labels
Each image includes metadata labels:
- `org.opencontainers.image.title=AWS EUM X`
- `org.opencontainers.image.description=...`
- `org.opencontainers.image.vendor=N85UK`
- `org.opencontainers.image.source=...`
- `org.opencontainers.image.version=1.0.0`

### Build Args
- `BUILD_TIMESTAMP` - Set from commit timestamp
- `APP_VERSION` - Set from package.json

---

## Troubleshooting Builds

### Build fails on GitHub Actions
```bash
# Check logs in GitHub Actions
# Look for specific error messages

# Common issues:
# - Docker layer cache issues → Clear cache, rebuild
# - Permission errors → Check GITHUB_TOKEN permissions
# - Test failures → Review smoke test logs
```

### Multi-arch build issues
```bash
# Recreate buildx builder
docker buildx rm multiarch
docker buildx create --name multiarch --use
docker buildx inspect --bootstrap
```

### Image too large
```bash
# Check image size
docker images ghcr.io/n85uk/aws-eum-x:latest

# Review .dockerignore
cat .dockerignore

# Analyze layers
docker history ghcr.io/n85uk/aws-eum-x:latest
```

---

## Release Checklist

- [ ] Version bumped in `package.json`
- [ ] CHANGELOG.md updated with changes
- [ ] All tests passing locally
- [ ] Code committed and pushed to main
- [ ] GitHub Actions build succeeded
- [ ] Docker image published to GHCR
- [ ] Smoke tests passed in CI
- [ ] Template XML updated (if needed)
- [ ] Tested installation on Unraid
- [ ] GitHub release created (optional)
- [ ] Documentation updated

---

## Continuous Integration

### Smoke Tests in CI
The workflow runs these tests on every build:
1. Health endpoint returns 200
2. Ready endpoint responds
3. Probe endpoint responds
4. Container starts successfully
5. Logs are clean (no startup errors)

### Adding More Tests
Edit `.github/workflows/build-aws-eum-x.yml`:
```yaml
- name: Run smoke tests
  run: |
    # Add your test commands here
    curl -f http://localhost:8080/api/queue/status || exit 1
```

---

## Resources

- **GitHub Actions Workflow**: `.github/workflows/build-aws-eum-x.yml`
- **Dockerfile**: `Apps/AWS_EUM_X/Dockerfile`
- **Template**: `Apps/AWS_EUM_X/my-aws-eum-x.xml`
- **GHCR Package**: https://github.com/N85UK/UNRAID_Apps/pkgs/container/aws-eum-x

---

**Ready to deploy?** See [DEPLOYMENT.md](DEPLOYMENT.md) for installation instructions.
