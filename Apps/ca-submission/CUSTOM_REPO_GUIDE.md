# Adding Custom Repository to UNraid

## 🎯 Quick Setup for Your AWS EUM App

You can add your GitHub repository as a custom repository in UNraid's Community Applications. This allows you to install your app immediately without waiting for official approval!

## 📋 Steps to Add Custom Repository

### 1. Open UNraid Web UI

- Go to **Settings** → **Community Applications**

### 2. Add Custom Repository

- Scroll down to **"Custom Repositories"**
- Click **"Add Repository"**

### 3. Enter Repository Details

```
Repository URL: https://github.com/N85UK/UnRiaid_Apps
Repository Branch: main
```

- Click **"Save"**

### 4. Refresh Community Applications

- Go back to the **Community Applications** tab
- Click the **refresh icon** (circular arrows) at the top

### 5. Find and Install Your App

- Search for **"AWS EUM"** or **"AWS End User Messaging"**
- Click **"Install"**
- Configure the settings (AWS credentials, etc.)
- Click **"Apply"**

## 🔧 Repository Structure

Your repository is properly structured for Community Applications:

```
UnRiaid_Apps/
├── AWS_EUM/                    # Your app directory
│   ├── template.cfg           # CA template (required)
│   ├── doc.md                 # CA documentation (required)
│   ├── README_CA.md           # CA README
│   ├── README_publish.md      # Publishing guide
│   ├── Dockerfile             # Container definition
│   └── docker-compose.yml     # Alternative install
└── ca-submission/             # Additional files
    ├── INSTALLATION_GUIDE.md
    ├── quick-install.sh
    └── ...
```

## ✅ Template Configuration

Your `template.cfg` is properly configured with:

- **Repository**: `ghcr.io/n85uk/aws-eum:latest`
- **Required environment variables**: AWS credentials
- **Optional variables**: Region, originators
- **Volume mappings**: App data persistence

## 🚀 Benefits of Custom Repository

- ✅ **Immediate access** - No waiting for approval
- ✅ **Automatic updates** - When you push new versions
- ✅ **Same interface** - Installs just like official apps
- ✅ **Easy management** - Update/reinstall through CA

## 📝 Notes

- The repository must be **public** for UNraid to access it
- Changes to `template.cfg` require refreshing the repository
- You can have multiple custom repositories
- Official submission is still recommended for broader availability

## 🔄 Updating Your App

When you make changes:

1. Update your code and push to GitHub
2. Go to Community Applications → Settings
3. Click **"Force Update All Repositories"**
4. Your app will show as having an update available

This is perfect for testing and development! 🎉
