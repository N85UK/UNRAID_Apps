# 🚀 Automated Git Flow & Docker Build System

## Overview

This repository now has **fully automated Git Flow** with GitHub Actions for AWS EUM v3. Changes are automatically built, tested, and deployed to Docker registry.

## 📋 What's Automated

### ✅ Continuous Integration & Deployment
- **Automatic builds** on every push to `main` or `develop`
- **Version tagging** with semantic versioning
- **Multi-architecture images** (amd64, arm64)
- **Automated testing** on pull requests
- **Release management** with one-click version bumps

### ✅ Docker Registry
- Images published to: `ghcr.io/n85uk/aws-eum`
- Tags: `latest`, `develop`, version numbers (e.g., `3.0.7`)
- Automatic cleanup and optimization

### ✅ Quality Checks
- Syntax validation
- Version consistency checks
- Docker build verification
- Required files validation

## 🎯 Quick Actions

### Deploy New Version

**Automated (Recommended):**
1. Go to: [Actions → Version Bump and Release](https://github.com/N85UK/UNRAID_Apps/actions/workflows/version-bump.yml)
2. Click "Run workflow"
3. Select bump type: `patch` | `minor` | `major`
4. Done! ✨

**Manual:**
```bash
git tag v3.0.8
git push origin v3.0.8
```

### Create Feature

```bash
git checkout develop
git checkout -b feature/my-feature
# make changes
git push origin feature/my-feature
# Create PR on GitHub
```

### Pull Latest Image

```bash
# Stable release
docker pull ghcr.io/n85uk/aws-eum:latest

# Development version
docker pull ghcr.io/n85uk/aws-eum:develop

# Specific version
docker pull ghcr.io/n85uk/aws-eum:3.0.7
```

## 📚 Documentation

| File | Purpose |
|------|---------|
| `QUICK_START_GITFLOW.md` | Quick reference for common tasks |
| `.github-workflows-guide.md` | Comprehensive workflow documentation |
| `CONTRIBUTING.md` | Full contribution guidelines |
| `CHANGELOG.md` | Version history and changes |

## 🔄 Workflows

### 1. Docker Build & Push
- **File:** `.github/workflows/docker-build-aws-eum.yml`
- **Triggers:** Push to `main`/`develop`, tags, PRs
- **Actions:** Build, test, push to registry

### 2. Version Bump & Release
- **File:** `.github/workflows/version-bump.yml`
- **Triggers:** Manual workflow dispatch
- **Actions:** Update versions, create release, trigger build

### 3. Pull Request Checks
- **File:** `.github/workflows/pr-check.yml`
- **Triggers:** PRs to `main`/`develop`
- **Actions:** Validate code, check versions, test build

## 🌳 Branch Strategy

```
main (production)
  ↑ merge
  └── release/X.Y.Z
        ↑ merge
develop (integration)
  ↑ merge
  ├── feature/new-feature
  ├── bugfix/fix-issue
  └── hotfix/urgent-fix
```

## 🏷️ Version Tags

Following **Semantic Versioning (SemVer)**:
- **MAJOR.MINOR.PATCH** (e.g., 3.0.7)
- Git tags: `v3.0.7`
- Docker tags: `3.0.7`, `v3`, `latest`

## 🔐 Required Permissions

Repository settings → Actions → General:
- ✅ Read and write permissions
- ✅ Allow GitHub Actions to create and approve pull requests

## 📦 Docker Images

All images available at: https://github.com/N85UK/UNRAID_Apps/pkgs/container/aws-eum

| Tag | Description | Auto-updated |
|-----|-------------|--------------|
| `latest` | Latest stable (main) | ✅ Push to main |
| `develop` | Development | ✅ Push to develop |
| `3.0.7` | Specific version | ✅ Create tag |
| `v3` | Latest 3.x.x | ✅ Any 3.x tag |

## 🎓 Learning Resources

### New to Git Flow?
Start with: `QUICK_START_GITFLOW.md`

### Want to Contribute?
Read: `CONTRIBUTING.md`

### Need Detailed Workflow Info?
See: `.github-workflows-guide.md`

## 🚨 Emergency Procedures

### Rollback Release
```bash
# Pull previous version
docker pull ghcr.io/n85uk/aws-eum:3.0.6

# Update container to use specific tag
```

### Revert Commit
```bash
git revert HEAD
git push origin main
# Triggers automatic rebuild
```

### Delete Bad Tag
```bash
git tag -d v3.0.7
git push origin --delete v3.0.7
# Delete release on GitHub manually
```

## ✨ Benefits

- 🚀 **Fast deployments** - Automated builds in minutes
- 🔒 **Quality assured** - Every change is tested
- 📝 **Clear history** - Conventional commits and changelog
- 🔄 **Easy rollbacks** - Version-tagged images
- 👥 **Team-friendly** - Clear workflow for contributors
- 🐳 **Multi-platform** - Works on all architectures

## 🛠️ Maintenance

### Update Workflows
Edit files in `.github/workflows/`

### Add New Checks
Update `pr-check.yml`

### Modify Build Process
Update `docker-build-aws-eum.yml`

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/N85UK/UNRAID_Apps/issues)
- **Discussions:** [GitHub Discussions](https://github.com/N85UK/UNRAID_Apps/discussions)
- **Documentation:** See files listed above

---

**Happy Shipping! All commits to `main` or `develop` trigger automatic Docker builds.** 🎉
