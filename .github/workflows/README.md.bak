# GitHub Actions Workflows

This directory contains automated workflows for building and publishing applications.

## Active Workflows

### AWS EUM v3
- **`docker-build-aws-eum-v3.yml`** - Builds and pushes AWS EUM v3 Docker images
  - Triggers: Push to `main` branch when `Apps/AWS_EUM_v3/**` changes
  - Manual trigger: Workflow dispatch available
  - Output: `ghcr.io/n85uk/aws-eum-v3:latest` and `ghcr.io/n85uk/aws-eum-v3:X.X.X`
  - Platforms: linux/amd64, linux/arm64

### ExplorerX Plugin
- **`release-explorerx.yml`** - Builds ExplorerX plugin packages
- **`update-explorerx-version.yml`** - Updates version in plugin files
- **`test-explorerx.yml`** - Tests ExplorerX builds

### Other Services
- **`build-and-publish-mariadb.yml`** - Builds MariaDB containers
- **`build-and-publish.yml`** - Legacy builder for old AWS EUM versions
- **`make-package-public.yml`** - Package visibility management

### Development Workflows
- **`pr-check.yml`** - Validates pull requests
- **`version-bump.yml`** - Manual version bumping tool
- **`update-docs.yml`** - Documentation updates

## How to Manually Trigger AWS EUM v3 Build

1. Go to: https://github.com/N85UK/UNRAID_Apps/actions
2. Click "Build and Push AWS EUM v3 Docker Image"
3. Click "Run workflow" dropdown
4. Select branch: `main`
5. Click "Run workflow" button

## Workflow Cleanup History

**October 11, 2025** - Removed duplicate/obsolete workflows:
- ❌ `build-and-publish-v3.yml` (duplicate of docker-build-aws-eum-v3.yml)
- ❌ `build-all-versions.yml` (legacy multi-version builder)
- ❌ `test-build.yml` (test file)
- ❌ `test-docker-build.yml` (test file)

## Troubleshooting

### Build Fails
- Check GitHub Actions logs for specific errors
- Verify Docker image builds locally: `docker build -t test Apps/AWS_EUM_v3/`
- Check package.json has valid version number

### Image Not Updating
- Verify workflow completed successfully (green checkmark)
- Pull with `docker pull ghcr.io/n85uk/aws-eum-v3:latest`
- Check image digest: `docker inspect ghcr.io/n85uk/aws-eum-v3:latest | grep Digest`

### Permissions Issues
- Ensure `packages: write` permission is set in workflow
- Check repository settings → Actions → General → Workflow permissions
