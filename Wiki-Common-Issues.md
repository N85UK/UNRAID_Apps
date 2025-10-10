# Common Issues & Solutions

**Quick reference guide for frequently encountered problems**

## 🚨 **Most Common Issues**

### 1. AWS EUM Permission Denied Error
**Problem**: `EACCES: permission denied, open '/app/data/update-info.json'`
**Frequency**: 90% of AWS EUM installations
**Quick Fix**:
```bash
chown -R 100:users /mnt/user/appdata/aws-eum-v3
chmod -R 755 /mnt/user/appdata/aws-eum-v3
docker restart AWS-EUM-v3
```

### 2. AWS EUM Enhanced UI Not Working
**Problem**: Network errors, missing charts, broken enhanced features
**Cause**: Content Security Policy blocking external resources on custom networks
**Quick Fix Options**:

**Option A - Comprehensive CSP Disable (Recommended)**:
```bash
# Add ALL these environment variables:
DISABLE_CSP=true
CSP_DISABLED=true
NODE_TLS_REJECT_UNAUTHORIZED=0
CSP_ALLOW_UNSAFE_INLINE=true
CSP_ALLOW_UNSAFE_EVAL=true
```

**Option B - Network Change**:
Change from `Custom: br0.X` to `Bridge` network

**Option C - DNS Fix for Custom Networks**:
```bash
# Add these for custom bridge networks:
NODE_OPTIONS="--dns-result-order=ipv4first"
DNS_SERVERS="8.8.8.8,8.8.4.4"
RESOLV_CONF_OVERRIDE=true
```

### 3. ExplorerX Shows Debug Info
**Problem**: Debug panel instead of file browser
**Status**: Expected behavior for v2025.10.10.0002
**Action**: This is intentional while investigating interface issues

### 4. Plugin Not in Tools Menu
**Problem**: Plugin installs but doesn't appear
**Quick Fix**: 
1. Refresh browser (Ctrl+F5)
2. Wait 30 seconds
3. Restart nginx: `/etc/rc.d/rc.nginx restart`

### 5. AWS Connection Fails
**Problem**: Cannot connect to AWS Pinpoint
**Quick Fixes**:
- Verify AWS credentials are correct
- Check IAM permissions include Pinpoint SMS
- Confirm AWS_REGION matches your setup

## 📧 **AWS EUM Specific Issues**

### Container Permission Problems
**User ID Mismatch**: Container runs as UID 100, directory owned by UID 99
```bash
# Diagnosis
docker exec AWS-EUM-v3 id  # Should show uid=100
ls -la /mnt/user/appdata/aws-eum-v3  # Check ownership

# Fix
chown -R 100:users /mnt/user/appdata/aws-eum-v3
```

### Chart.js and Enhanced Features
**CSP Blocking External Resources**:
- Chart.js from cdn.jsdelivr.net blocked
- Font Awesome from cdnjs.cloudflare.com blocked
- **Solution**: `DISABLE_CSP=true` environment variable

### Network Configuration Issues
**Custom Bridge Problems**: 
- Custom network (br0.X) may cause CSP issues
- **Solution**: Switch to Bridge network type

### Database Connection (MariaDB Edition)
**Common Database Issues**:
- Incorrect credentials
- Database doesn't exist
- Network connectivity problems
- Missing privileges

## 📁 **ExplorerX Plugin Issues**

### Current Debug Version Status
**v2025.10.10.0002 Behavior**:
- ✅ **Normal**: Shows debug information instead of file browser
- ✅ **Expected**: Enhanced logging and error reporting
- ✅ **Investigating**: Interface rendering problems
- ❌ **Issue**: If plugin doesn't appear in Tools menu at all

### Installation Problems
**Plugin Download Fails**:
- Check internet connectivity
- Verify plugin URL is correct
- Try installation again after waiting

**Plugin Not Visible**:
- Refresh UNRAID webGUI (Ctrl+F5)
- Check `/usr/local/emhttp/plugins/explorerx` exists
- Restart web services if needed

## 🔧 **Quick Diagnostic Commands**

### Check Container Status
```bash
docker ps -a | grep project_name
docker logs container_name
```

### Check Permissions
```bash
ls -la /mnt/user/appdata/project_name/
docker exec container_name whoami
docker exec container_name id
```

### Test Connectivity
```bash
# Test AWS
curl -s https://pinpoint.eu-west-2.amazonaws.com
# Test database (replace with your details)
mysql -h host -u user -p database
```

### Check Plugin Installation
```bash
ls -la /usr/local/emhttp/plugins/explorerx
cat /usr/local/emhttp/plugins/explorerx/explorerx.page
```

## 🎯 **Quick Resolution Matrix**

| Symptom | Most Likely Cause | Quick Fix |
|---------|-------------------|-----------|
| Permission denied errors | UID mismatch | `chown -R 100:users appdata_dir` |
| Network error in browser | CSP blocking on custom network | Add comprehensive CSP disable vars |
| Charts not loading | External CDN resources blocked | Use Bridge network or DNS fix |
| Plugin not in menu | Cache/refresh issue | Ctrl+F5 or restart nginx |
| AWS connection fails | Credentials/permissions | Verify AWS setup |
| Container won't start | Environment variables | Check required variables |
| Debug info showing | Debug version active | Expected behavior |
| Database connection fails | DB config/network | Verify database setup |

## 📞 **When to Get Help**

### Self-Service First
Try these steps before seeking support:
1. Check this common issues list
2. Review relevant installation guide
3. Check container/system logs
4. Verify configuration matches documentation

### Contact Support When
- Issue not covered in documentation
- Followed troubleshooting steps without success
- Need clarification on expected behavior
- Found a potential bug or security issue

### Support Information to Include
- **Project and version**: Exact version numbers
- **UNRAID version**: Your UNRAID version
- **Error messages**: Complete error text from logs
- **Configuration**: Environment variables (no secrets)
- **Steps taken**: What troubleshooting you've already tried

## 🔄 **Prevention Tips**

### Before Installation
- Read the appropriate installation guide completely
- Ensure system meets requirements
- Have AWS credentials ready (for AWS EUM)
- Plan your port and path mappings

### After Installation
- Check logs immediately for any errors
- Test basic functionality before complex configurations
- Set up monitoring/alerting if needed
- Keep backups of working configurations

### Regular Maintenance
- Monitor container logs periodically
- Keep containers updated
- Review and rotate credentials regularly
- Check for new versions and updates

---

**🔄 Updated**: October 2025 with latest known issues and solutions
**📚 Need More Help?**: Check [Troubleshooting Guide](Troubleshooting) for detailed procedures