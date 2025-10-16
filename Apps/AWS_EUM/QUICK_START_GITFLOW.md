# Quick Start: Automated Git Flow

## TL;DR - Common Tasks

### 🚀 Deploy New Version to Production

**Option 1: Automated Version Bump (Recommended)**
```bash
# Go to: https://github.com/N85UK/UNRAID_Apps/actions
# Click: "Version Bump and Release"
# Click: "Run workflow"
# Choose: patch/minor/major
# Done! Automatically builds and pushes Docker image
```

**Option 2: Manual Tag**
```bash
git tag v3.0.8
git push origin v3.0.8
# GitHub Actions automatically builds and pushes
```

### 🐛 Fix a Bug

```bash
# Create bugfix branch
git checkout develop
git checkout -b bugfix/my-fix

# Make changes
git add .
git commit -m "fix: description of fix"
git push origin bugfix/my-fix

# Create PR on GitHub to develop branch
# After merge, it auto-deploys to develop tag
```

### ✨ Add New Feature

```bash
# Create feature branch
git checkout develop
git checkout -b feature/my-feature

# Make changes
git add .
git commit -m "feat: description of feature"
git push origin feature/my-feature

# Create PR on GitHub to develop branch
```

### 🔥 Emergency Hotfix (Production)

```bash
# Create hotfix from main
git checkout main
git checkout -b hotfix/critical-fix

# Make changes
git add .
git commit -m "fix: critical production issue"
git push origin hotfix/critical-fix

# Create PR on GitHub to main branch
# After merge, auto-builds production image
```

### 📦 Pull Latest Docker Image

```bash
# Latest stable
docker pull ghcr.io/n85uk/aws-eum:latest

# Development
docker pull ghcr.io/n85uk/aws-eum:develop

# Specific version
docker pull ghcr.io/n85uk/aws-eum:3.0.7
```

## Automated Workflows

### 1️⃣ Docker Build (Automatic)

**Triggers:**
- ✅ Push to `main` → builds `:latest`
- ✅ Push to `develop` → builds `:develop`
- ✅ Create tag `v3.0.8` → builds `:3.0.8`, `:v3`
- ✅ Pull Request → test build only

**Manual Run:**
Actions → "Build and Push AWS EUM v3 Docker Image" → Run workflow

### 2️⃣ Version Bump (Manual)

**Use when:** Ready to release new version

**Steps:**
1. Go to Actions tab
2. Click "Version Bump and Release"
3. Click "Run workflow"
4. Select:
   - Branch: `main`
   - Bump type: `patch`/`minor`/`major`
   - App: `AWS_EUM`
5. Click "Run workflow"

**What it does:**
- ✅ Updates package.json, server.js, Dockerfile
- ✅ Creates changelog entry
- ✅ Commits changes
- ✅ Creates Git tag
- ✅ Creates GitHub Release
- ✅ Triggers Docker build

### 3️⃣ PR Checks (Automatic)

**Runs on:** Every Pull Request

**Checks:**
- ✅ Syntax validation (`node -c server.js`)
- ✅ Version consistency
- ✅ Required files exist
- ✅ Docker builds successfully

## Branch Strategy

```
main (production - :latest)
  ↑
  └── release/3.1.0
        ↑
develop (development - :develop)
  ↑
  ├── feature/new-thing
  ├── bugfix/fix-thing
  └── hotfix/urgent-thing
```

## Commit Messages

Use **Conventional Commits:**

```bash
feat: add SMS templates
fix: resolve chart rendering
docs: update README
chore: upgrade dependencies
refactor: improve error handling
perf: optimize database queries
test: add unit tests
```

## Version Numbers (SemVer)

- **Patch** (3.0.7 → 3.0.8): Bug fixes, no new features
- **Minor** (3.0.7 → 3.1.0): New features, backwards compatible
- **Major** (3.0.7 → 4.0.0): Breaking changes

## Typical Workflow

### Day-to-Day Development

```bash
# 1. Pull latest develop
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/add-cool-thing

# 3. Make changes and commit
git add .
git commit -m "feat: add cool thing"
git push origin feature/add-cool-thing

# 4. Create PR on GitHub
#    - Base: develop
#    - Compare: feature/add-cool-thing
#    - Fill out template
#    - Wait for checks to pass
#    - Get approval
#    - Merge!

# 5. Delete feature branch
git branch -d feature/add-cool-thing
git push origin --delete feature/add-cool-thing
```

### Release Process

```bash
# When develop is stable and ready for production:

# Option A: Use automated workflow (recommended)
# Go to Actions → Version Bump and Release
# Select bump type, run workflow
# Done!

# Option B: Manual release
git checkout develop
git checkout -b release/3.1.0

# Update versions if needed
# Test thoroughly

git checkout main
git merge release/3.1.0
git tag v3.1.0
git push origin main v3.1.0

git checkout develop
git merge release/3.1.0
git push origin develop
```

## Docker Image Tags

| Tag | Description | Updated When |
|-----|-------------|--------------|
| `latest` | Latest stable release | Push to `main` |
| `develop` | Development version | Push to `develop` |
| `3.0.7` | Specific version | Tag `v3.0.7` |
| `v3` | Latest 3.x.x | Any 3.x.x tag |
| `pr-123` | Pull Request test | PR created |

## Useful Commands

```bash
# View workflow status
gh run list

# View specific run
gh run view <run-id> --log

# List tags
git tag -l

# Delete local tag
git tag -d v3.0.7

# Delete remote tag
git push origin --delete v3.0.7

# List branches
git branch -a

# Clean up merged branches
git branch -d feature/old-feature
```

## Emergency Procedures

### Rollback Docker Image

```bash
# Pull previous version
docker pull ghcr.io/n85uk/aws-eum:3.0.6

# Update UNRAID template to use :3.0.6
# Or update docker-compose.yml
```

### Revert Git Commit

```bash
# Revert last commit (creates new commit)
git revert HEAD
git push origin main

# This triggers new build automatically
```

### Delete Bad Release

```bash
# Delete tag
git tag -d v3.0.7
git push origin --delete v3.0.7

# Delete release on GitHub
# Go to Releases → Click release → Delete release
```

## Troubleshooting

### Build Failed

1. Check Actions tab for error details
2. Verify syntax: `node -c server.js`
3. Check versions match across files
4. Try building locally: `docker build -t test .`

### Version Mismatch

```bash
# These must all match:
grep version package.json    # "version": "3.0.7"
grep APP_VERSION server.js   # const APP_VERSION = '3.0.7';
grep version Dockerfile      # version="3.0.7"
```

### PR Checks Failing

1. Read error message in "Checks" tab
2. Fix the issue locally
3. Commit and push again
4. Checks re-run automatically

### Image Not Updating

1. Check workflow completed successfully
2. Wait 2-3 minutes for registry
3. Pull with `--no-cache`: `docker pull --no-cache ghcr.io/n85uk/aws-eum:latest`
4. Verify image is public in GitHub Packages

## Getting Help

- **Documentation:** See `.github-workflows-guide.md` for details
- **Contributing:** See `CONTRIBUTING.md`
- **Issues:** https://github.com/N85UK/UNRAID_Apps/issues

---

**Remember:** All workflows are automated. Just push your code and let GitHub Actions do the rest! 🚀
