# AWS EUM v3.0.5 - Publishing Information

## 📦 Current Release: v3.0.1

### Image Information
- **Registry**: GitHub Container Registry (GHCR)
- **Image**: `ghcr.io/n85uk/aws-eum-v3:3.0.1`
- **Latest**: `ghcr.io/n85uk/aws-eum-v3:latest`
- **Status**: ✅ Ready for publishing
- **Features**: Enhanced UI + CSP fixes for custom bridge networks

### 🔄 Build & Publish Process

**Build the Image:**
```bash
# Build with version tags
docker build -t ghcr.io/n85uk/aws-eum-v3:3.0.1 -t ghcr.io/n85uk/aws-eum-v3:latest .

# Or use the build script
./build.sh
```

**Publish to GHCR:**
```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u N85UK --password-stdin

# Push both tags
docker push ghcr.io/n85uk/aws-eum-v3:3.0.1
docker push ghcr.io/n85uk/aws-eum-v3:latest
```

### 🆕 v3.0.1 Key Features
- **CSP Configuration**: Environment variables for Content Security Policy
- **Network Compatibility**: Fixes for br0.2, br0.100, custom bridge networks
- **One-line Fix**: `DISABLE_CSP=true` resolves all CSP issues
- **Enhanced UI**: Chart.js analytics, dark mode, modern interface
- **AWS Integration**: Automatic phone number discovery

### 📋 Build Configuration

**Workflow File**: `.github/workflows/build-and-publish.yml`
**Build Steps**:
- Node.js 20 setup
- Dependencies installation (`npm ci`)
- Docker build with proper naming
- GHCR authentication and push

**Environment Variables**:
- Repository owner converted to lowercase for Docker compatibility
- Automatic tagging with `latest`

### 🌐 Making the Package Public (Optional)

The image is currently private to your GitHub account. To make it publicly accessible:

1. Go to: https://github.com/orgs/N85UK/packages/container/package/aws-eum
2. Click **"Package settings"**
3. Set **"Package visibility"** to **"Public"**
4. Confirm the change

**Note**: Public packages can be pulled without GitHub authentication.

### 🏷️ Tagging Strategy

Current setup uses `latest` tag. For production deployments, consider:

- **Release-based**: Use `${{ github.ref_name }}` for version tags
- **Commit-based**: Use `${{ github.sha }}` for unique builds
- **Manual tags**: Push specific version tags

### 🔍 Verification

To verify the published image:

```bash
# Check if image exists
docker pull ghcr.io/n85uk/aws-eum:latest

# Run the image
docker run -p 80:80 ghcr.io/n85uk/aws-eum:latest
```

### 📊 Build History

View build history and logs at:
https://github.com/N85UK/UnRiaid_Apps/actions

### 🛠️ Troubleshooting

**Build fails?**
- Check GitHub Actions logs for detailed error messages
- Verify Node.js and Docker configurations
- Ensure all dependencies are properly listed in `package.json`

**Image not found?**
- Confirm the image name: `ghcr.io/n85uk/aws-eum:latest`
- Check package visibility settings
- Verify GitHub token permissions

**Authentication issues?**
- The workflow uses `GITHUB_TOKEN` automatically
- No manual authentication setup required

### 📝 Notes

- The workflow uses `${{ secrets.GITHUB_TOKEN }}` for automatic GHCR authentication
- Repository owner name is converted to lowercase for Docker compatibility
- Images are rebuilt on every push to `main` branch
- Failed builds don't overwrite successful images
