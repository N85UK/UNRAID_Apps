# Git Flow Automation - Visual Guide

## Complete Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEVELOPER WORKSTATION                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ git push
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         GITHUB                                   │
│                                                                  │
│  ┌────────────┐      ┌────────────┐      ┌────────────┐       │
│  │   main     │◄─────│  release/  │◄─────│  develop   │       │
│  │  (latest)  │      │   X.Y.Z    │      │  (develop) │       │
│  └─────┬──────┘      └────────────┘      └──────┬─────┘       │
│        │                                          │              │
│        │ Push/Tag                                 │ Push         │
│        ▼                                          ▼              │
│  ┌─────────────────────────────────────────────────────┐       │
│  │          GitHub Actions Workflows                    │       │
│  │  ┌──────────────────────────────────────────────┐  │       │
│  │  │  1. Docker Build & Push                      │  │       │
│  │  │     - Build multi-arch image                 │  │       │
│  │  │     - Run tests                              │  │       │
│  │  │     - Push to registry                       │  │       │
│  │  └──────────────────────────────────────────────┘  │       │
│  │  ┌──────────────────────────────────────────────┐  │       │
│  │  │  2. Pull Request Checks                      │  │       │
│  │  │     - Syntax validation                      │  │       │
│  │  │     - Version consistency                    │  │       │
│  │  │     - Docker build test                      │  │       │
│  │  └──────────────────────────────────────────────┘  │       │
│  │  ┌──────────────────────────────────────────────┐  │       │
│  │  │  3. Version Bump (Manual Trigger)            │  │       │
│  │  │     - Update versions                        │  │       │
│  │  │     - Create release                         │  │       │
│  │  │     - Trigger build                          │  │       │
│  │  └──────────────────────────────────────────────┘  │       │
│  └─────────────────────────────────────────────────────┘       │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           │ Push Docker Image
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              GitHub Container Registry (ghcr.io)                 │
│                                                                  │
│  ghcr.io/n85uk/aws-eum-v3:                                      │
│    ├── latest    (from main branch)                             │
│    ├── develop   (from develop branch)                          │
│    ├── 3.0.7     (from tag v3.0.7)                             │
│    └── v3        (latest 3.x.x)                                 │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           │ docker pull
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      UNRAID / DOCKER                             │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  AWS EUM v3 Container                                    │  │
│  │  - Auto-updates with Watchtower                          │  │
│  │  - Health monitoring                                     │  │
│  │  - Running on br0.2 network                              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Branch Flow

```
Feature Development:
┌─────────────┐
│  Developer  │
└──────┬──────┘
       │
       │ 1. Create feature branch
       ▼
┌─────────────────────┐
│ feature/my-feature  │
└──────┬──────────────┘
       │
       │ 2. Make changes & commit
       │    git commit -m "feat: add feature"
       ▼
┌─────────────────────┐
│  Push to GitHub     │
└──────┬──────────────┘
       │
       │ 3. Create Pull Request
       ▼
┌─────────────────────┐     ┌──────────────────┐
│  PR Checks Running  │────▶│  ✅ All Passed   │
└──────┬──────────────┘     └──────────────────┘
       │
       │ 4. Review & Approve
       ▼
┌─────────────────────┐
│   Merge to develop  │────▶ Triggers build of :develop tag
└──────┬──────────────┘
       │
       │ 5. When ready for production
       ▼
┌─────────────────────┐
│  Create Release     │
│  (Manual workflow)  │
└──────┬──────────────┘
       │
       │ 6. Version bump & tag
       ▼
┌─────────────────────┐
│   Merge to main     │────▶ Triggers build of :latest tag
└─────────────────────┘
```

## CI/CD Pipeline

```
┌──────────────────────────────────────────────────────────────┐
│                     CODE PUSHED                               │
└────────────────────┬─────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
   ┌──────────┐          ┌──────────────┐
   │   main   │          │   develop    │
   └────┬─────┘          └──────┬───────┘
        │                       │
        ├── Extract version     ├── Extract version
        ├── Build amd64         ├── Build amd64
        ├── Build arm64         ├── Build arm64
        ├── Run tests           ├── Run tests
        ├── Tag: latest         ├── Tag: develop
        ├── Tag: 3.0.7          └── Push to registry
        ├── Tag: v3             
        └── Push to registry    
                     │
                     ▼
        ┌─────────────────────┐
        │  GitHub Container   │
        │     Registry        │
        └──────────┬──────────┘
                   │
                   ▼
        ┌─────────────────────┐
        │  Docker Image Ready │
        │  for Deployment     │
        └─────────────────────┘
```

## Version Bump Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  Developer wants to release new version                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Go to GitHub Actions → Version Bump and Release            │
│  Click "Run workflow"                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Select options:                                            │
│    Branch: main                                             │
│    Bump type: patch | minor | major                         │
│    App: AWS_EUM                                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Automated workflow executes:                               │
│    1. npm version patch/minor/major                         │
│    2. Update server.js APP_VERSION                          │
│    3. Update Dockerfile version                             │
│    4. Create CHANGELOG.md entry                             │
│    5. Git commit with message                               │
│    6. Create Git tag (v3.0.8)                              │
│    7. Push to GitHub                                        │
│    8. Create GitHub Release                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Docker Build workflow automatically triggered              │
│  Builds and pushes new versioned image                      │
└─────────────────────────────────────────────────────────────┘
```

## Pull Request Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Developer creates PR: feature/X → develop                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  PR Checks Workflow Starts                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┬─────────────────┬──────────┐
         ▼                       ▼                 ▼          ▼
  ┌──────────────┐      ┌──────────────┐   ┌─────────┐  ┌────────┐
  │   Syntax     │      │   Version    │   │  File   │  │ Docker │
  │ Validation   │      │ Consistency  │   │ Checks  │  │ Build  │
  └──────┬───────┘      └──────┬───────┘   └────┬────┘  └───┬────┘
         │                     │                 │           │
         └─────────────┬───────┴─────────────────┴───────────┘
                       │
                       ▼
              ┌────────────────┐
              │  All Pass? ✅  │
              └────────┬───────┘
                       │
                       ├── ✅ Success → Ready to merge
                       └── ❌ Failed  → Fix and push again
```

## Deployment to UNRAID

```
┌─────────────────────────────────────────────────────────────┐
│  New Docker image available in registry                     │
│  ghcr.io/n85uk/aws-eum-v3:latest                           │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────────┐
         ▼                           ▼
┌─────────────────┐         ┌─────────────────┐
│  Watchtower     │         │  Manual Update  │
│  (Automatic)    │         │  (UNRAID UI)    │
└────────┬────────┘         └────────┬────────┘
         │                           │
         ├── Check every 5 min       ├── Click "Force Update"
         ├── Detect new image        ├── Pull new image
         ├── Pull new image          ├── Stop container
         ├── Stop container          ├── Start with new image
         └── Start with new image    └── Verify running
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  AWS EUM v3 Container Running                               │
│    - New version deployed                                   │
│    - Health checks passing                                  │
│    - Accessible at http://10.0.2.11:80                     │
└─────────────────────────────────────────────────────────────┘
```

## Hotfix Emergency Flow

```
┌─────────────────────────────────────────────────────────────┐
│  🚨 Critical bug discovered in production                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  git checkout main                                          │
│  git checkout -b hotfix/critical-fix                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Make fix & commit                                          │
│  git commit -m "fix: critical security issue"               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  git push origin hotfix/critical-fix                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Create PR: hotfix/critical-fix → main                      │
│  PR checks run and pass                                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Merge to main (builds :latest immediately)                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├──▶ Merge back to develop
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  New image available with fix in ~5 minutes                 │
│  Watchtower auto-updates production containers              │
└─────────────────────────────────────────────────────────────┘
```

## Timeline Example

```
Day 1:
09:00  Developer starts feature branch
12:00  Commits code, pushes to GitHub
12:02  Creates Pull Request
12:03  PR checks start running (syntax, versions, build)
12:06  All checks pass ✅
14:00  Team reviews and approves
14:05  Merge to develop
14:06  Docker build starts for :develop tag
14:12  Image available: ghcr.io/n85uk/aws-eum-v3:develop

Day 5:
10:00  Multiple features merged to develop
10:00  Run "Version Bump and Release" workflow
10:01  Select: minor bump (3.0.7 → 3.1.0)
10:02  Workflow updates all versions, creates tag
10:03  Pushes tag v3.1.0 to GitHub
10:04  Docker build starts for :latest
10:10  Image available: ghcr.io/n85uk/aws-eum-v3:latest
10:15  Watchtower detects new image
10:20  Production containers auto-update
10:25  Version 3.1.0 live in production! 🎉
```

## Key Points

✅ **Automatic** - Push code → Docker image built
✅ **Fast** - 5-10 minutes from commit to registry
✅ **Safe** - All changes tested before deployment
✅ **Traceable** - Every version tagged and documented
✅ **Rollback Ready** - Keep all version tags
✅ **Multi-platform** - Works on amd64 and arm64

---

**Questions?** See `QUICK_START_GITFLOW.md` or `.github-workflows-guide.md`
