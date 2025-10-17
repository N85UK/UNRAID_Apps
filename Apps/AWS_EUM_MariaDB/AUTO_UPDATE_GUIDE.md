# AWS EUM Auto-Update Guide

AWS End User Messaging v2.0 includes comprehensive auto-update functionality to keep your application current with the latest features and security updates.

## 🔄 Auto-Update Methods

### 1. UNRAID Native Auto-Update (Recommended)

UNRAID has built-in auto-update functionality that's enabled by default in the template:

**Setup:**

1. Install AWS EUM through Community Applications
2. The template automatically configures update checking
3. UNRAID will notify you of available updates
4. Click "Update" in the Docker tab when prompted

**Configuration:**

- Updates are checked against the GitHub Container Registry
- Automatic notifications appear in UNRAID's Docker interface
- You control when updates are applied

### 2. Application-Level Update Checking

The app includes built-in update checking with web interface notifications:

**Features:**

- Automatic update checking every 24 hours (configurable)
- Visual notifications in the web interface when updates are available
- Manual update checking via API endpoints
- Version comparison and changelog links

**Configuration Variables:**

```bash
AUTO_UPDATE_CHECK=true              # Enable/disable update checking
UPDATE_CHECK_INTERVAL=24            # Check interval in hours
AUTO_UPDATE_APPLY=false             # Auto-apply updates (requires Watchtower)
```

**API Endpoints:**

- `GET /api/updates/status` - Get current update status
- `GET /api/updates/check` - Force update check
- `POST /api/webhook/update` - GitHub webhook for instant notifications

### 3. Watchtower Auto-Update (Advanced)

For fully automatic updates, use the included Watchtower configuration:

**Setup:**

1. Use the `docker-compose-watchtower.yml` file
2. Set `AUTO_UPDATE_APPLY=true` in environment variables
3. Watchtower will automatically update the container when new versions are available

**Benefits:**

- Fully automatic updates
- Configurable update intervals
- Automatic cleanup of old images
- Zero-downtime updates with proper health checks

## 🛠️ Configuration Options

### UNRAID Template Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `AUTO_UPDATE_CHECK` | `true` | Enable automatic update checking |
| `UPDATE_CHECK_INTERVAL` | `24` | Hours between update checks (1-168) |
| `AUTO_UPDATE_APPLY` | `false` | Automatically apply updates (needs Watchtower) |

### Manual Configuration

If installing via Docker command or compose, add these environment variables:

```bash
docker run -d \\
  --name aws-eum \\
  -p 8080:80 \\
  -e AUTO_UPDATE_CHECK=true \\
  -e UPDATE_CHECK_INTERVAL=12 \\
  -e AUTO_UPDATE_APPLY=false \\
  ghcr.io/n85uk/aws-eum:latest
```

## 🚀 Update Process

### Automatic Updates (Watchtower)

1. Watchtower checks for new images every 4 hours
2. Downloads new image if available
3. Gracefully stops current container
4. Starts new container with same configuration
5. Removes old image to save space

### Manual Updates (UNRAID)

1. Application checks GitHub releases API
2. Displays notification if update available
3. User clicks "Update" in UNRAID Docker interface
4. UNRAID handles the update process

### Manual Updates (Command Line)

```bash
# Pull latest image
docker pull ghcr.io/n85uk/aws-eum:latest

# Stop current container
docker stop aws-eum

# Remove current container
docker rm aws-eum

# Start new container with same settings
docker run -d --name aws-eum [your-settings] ghcr.io/n85uk/aws-eum:latest
```

## 🔔 Update Notifications

### Web Interface

- Toast notifications appear when updates are available
- Click "View Release" to see changelog
- Dismissible notifications don't reappear until next update

### UNRAID Interface

- Docker tab shows "Update Available" badge
- Notification center includes update alerts
- Email notifications (if configured in UNRAID)

### Webhook Integration

Configure GitHub webhooks to get instant update notifications:

1. Go to GitHub repository settings
2. Add webhook: `https://your-server.com:8080/api/webhook/update`
3. Set content type to `application/json`
4. Select "Releases" events
5. App will check for updates immediately when releases are published

## 📋 Best Practices

### For Stable Environments

- Use UNRAID native updates
- Set `AUTO_UPDATE_CHECK=true`
- Set `AUTO_UPDATE_APPLY=false`
- Review updates before applying

### For Development/Testing

- Use Watchtower auto-updates
- Set shorter check intervals
- Enable debug logging
- Monitor update logs

### For Critical Production

- Disable auto-apply: `AUTO_UPDATE_APPLY=false`
- Use longer check intervals: `UPDATE_CHECK_INTERVAL=168` (weekly)
- Test updates in staging environment first
- Keep backups of container data

## 🔧 Troubleshooting

### Updates Not Detected

1. Check internet connectivity
2. Verify GitHub API access
3. Check logs for update check errors
4. Manually trigger update check via API

### Auto-Updates Not Working

1. Ensure Watchtower is running
2. Check container labels are correct
3. Verify Watchtower has Docker socket access
4. Check Watchtower logs for errors

### Update Check Failures

```bash
# Check update status
curl http://localhost:8080/api/updates/status

# Force update check
curl http://localhost:8080/api/updates/check

# Check application logs
docker logs aws-eum
```

## 📚 Version Information

- **Current Version**: 2.0.0
- **Update Mechanism**: GitHub Releases API
- **Container Registry**: GitHub Container Registry (ghcr.io)
- **Supported Tags**: `latest`, `2.0.0`, version-specific tags

## 🛡️ Security Considerations

- Updates are verified against official GitHub releases
- Container images are signed and scanned
- No automatic execution of untrusted code
- Update checks use secure HTTPS connections
- Watchtower runs with minimal privileges

## 📞 Support

If you encounter issues with auto-updates:

1. Check the [GitHub Issues](https://github.com/N85UK/UNRAID_Apps/issues)
2. Review application logs for error messages
3. Verify your configuration matches the examples
4. Test manual updates first
5. Create a GitHub issue with logs and configuration details

---

**Note**: Auto-update functionality requires internet access and proper Docker permissions. Always backup your data before enabling automatic updates.
