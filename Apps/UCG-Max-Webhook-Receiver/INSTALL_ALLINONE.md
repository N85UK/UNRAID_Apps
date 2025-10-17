# UCG Max Webhook Receiver - All-in-One Edition

## 📦 Overview

This is an **all-in-one** Docker image that includes both the UCG Max Webhook Receiver application and PostgreSQL database in a single container. Perfect for Unraid users who prefer simplicity over separation of concerns.

## 🆚 Standard vs All-in-One

### Standard Edition (Recommended for Production)
- **Separate containers**: Application + PostgreSQL + PGAdmin
- **Best practices**: One process per container
- **Flexible**: Easy to scale, backup, and upgrade independently
- **Template**: `my-ucg-max-webhook.xml`

### All-in-One Edition (Simplified for Home Use)
- **Single container**: Everything included
- **Simple**: One container to manage
- **Perfect for**: Unraid home users who want simplicity
- **Template**: `my-ucg-max-webhook-allinone.xml`

## 🚀 Quick Start (Unraid)

### Option 1: Community Apps (Coming Soon)
1. Open Unraid **Community Apps**
2. Search for "UCG Max Webhook Allinone"
3. Click **Install**
4. Configure required settings
5. Start the container

### Option 2: Template URL
1. Go to **Docker** tab in Unraid
2. Click **Add Container**
3. At the bottom, enter template URL:
   ```
   https://raw.githubusercontent.com/N85UK/UNRAID_Apps/main/Apps/UCG-Max-Webhook-Receiver/my-ucg-max-webhook-allinone.xml
   ```
4. Configure settings
5. Apply

## ⚙️ Required Configuration

### Essential Settings

1. **SECRET_KEY** (Required)
   ```bash
   openssl rand -hex 32
   ```

2. **HMAC_SECRET** (Required)
   ```bash
   openssl rand -hex 32
   ```

3. **ADMIN_PASSWORD** (Required)
   - Set a strong password for the admin dashboard

4. **Data Directory** (Required)
   - Default: `/mnt/user/appdata/ucg-max-webhook/data`
   - This stores your PostgreSQL database

## 📋 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | *none* | JWT token generation key (required) |
| `HMAC_SECRET` | *none* | Webhook HMAC verification key (required) |
| `ADMIN_USER` | `admin` | Admin dashboard username |
| `ADMIN_PASSWORD` | *none* | Admin dashboard password (required) |
| `BEARER_TOKEN` | *none* | Optional alternative auth token |
| `DB_PASSWORD` | `changeme` | Internal PostgreSQL password |
| `ALERT_RETENTION_DAYS` | `30` | Days to keep alert data |
| `RATE_LIMIT_REQUESTS` | `100` | Max requests per window |
| `RATE_LIMIT_WINDOW` | `60` | Rate limit window (seconds) |
| `LOG_LEVEL` | `INFO` | Logging level |

## 🔧 UCG Max Configuration

Configure your UCG Max device to send webhooks to:
```
http://YOUR_UNRAID_IP:8000/webhook/ucgmax
```

### Authentication Headers
Add one of these authentication methods:

**Option A: HMAC (Recommended)**
```
X-Hub-Signature-256: sha256=<hmac_signature>
```

**Option B: Bearer Token**
```
Authorization: Bearer YOUR_BEARER_TOKEN
```

## 📊 Accessing the Dashboard

1. **Web UI**: `http://YOUR_UNRAID_IP:8000`
2. Login with your `ADMIN_USER` and `ADMIN_PASSWORD`
3. View alerts, metrics, and export data

## 💾 Database Management

The all-in-one image includes PostgreSQL internally. No external database configuration needed!

### Backup
```bash
docker exec ucg-max-webhook-allinone pg_dump -U ucgmax ucgmax > backup.sql
```

### Restore
```bash
cat backup.sql | docker exec -i ucg-max-webhook-allinone psql -U ucgmax ucgmax
```

### Database Location
The database files are stored in the mapped data directory:
- Container: `/var/lib/postgresql/data`
- Unraid: `/mnt/user/appdata/ucg-max-webhook/data` (default)

## 🔍 Troubleshooting

### Container won't start
```bash
# Check logs
docker logs ucg-max-webhook-allinone

# Verify data directory permissions
ls -la /mnt/user/appdata/ucg-max-webhook/
```

### Database connection errors
The all-in-one image manages PostgreSQL internally. If you see database errors:
```bash
# Restart the container
docker restart ucg-max-webhook-allinone

# Check PostgreSQL logs
docker exec ucg-max-webhook-allinone cat /var/log/postgresql.log
```

### Webhook not receiving data
1. Check UCG Max webhook configuration
2. Verify HMAC secret matches
3. Check container logs for auth errors

## ⚡ Performance Notes

### All-in-One Trade-offs
- ✅ **Simpler**: Single container to manage
- ✅ **Portable**: Everything in one package
- ⚠️ **Resources**: Uses more memory (PostgreSQL + app in one container)
- ⚠️ **Scaling**: Cannot scale database separately
- ⚠️ **Backups**: Must backup entire container or data volume

### When to Use Standard Edition Instead
- Production environments
- High alert volumes (>1000/day)
- Need independent database scaling
- Require separate database backups
- Want to use external PostgreSQL server

## 🆘 Support

- **GitHub Issues**: https://github.com/N85UK/UNRAID_Apps/issues
- **Documentation**: https://github.com/N85UK/UNRAID_Apps/wiki
- **Unraid Forums**: https://forums.unraid.net/

## 📄 License

MIT License - see LICENSE file for details
