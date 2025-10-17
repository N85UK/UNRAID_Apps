# Troubleshooting Guide

**Complete troubleshooting guide for N85UK UNRAID Apps**

## � **AWS EUM v3.0.1 Issues**

### Charts/Icons/Dark Mode Not Working

**Most Common Issue**: External resources blocked on custom networks

**✅ Quick Fix**: Add environment variable `DISABLE_CSP=true`

**Detailed Steps**:

1. Edit AWS EUM v3 container in UNRAID
2. Go to environment variables section
3. Add new variable:
   - **Variable**: `DISABLE_CSP`
   - **Value**: `true`
4. Apply changes and restart container

**Alternative Solutions**:

- Change from custom bridge network to default bridge
- Set `NETWORK_HOST=http://[your-gateway-ip]` for network-specific fix

### AWS Connection Problems

**Symptoms**: No phone numbers, connection errors, credential issues

**✅ Solutions**:

1. **Verify AWS Credentials**: Ensure access key and secret are correct
2. **Check Region**: AWS region must match where phone numbers are registered
3. **IAM Permissions**: User needs SMS/Pinpoint permissions
4. **Test AWS Access**: Use container health check endpoint

### Container Permission Issues

**Symptoms**: `EACCES: permission denied` errors

**✅ Fix File Permissions**:

```bash
chown -R 100:users /mnt/user/appdata/aws-eum
chmod -R 755 /mnt/user/appdata/aws-eum
docker restart aws-eum
```

### Network Compatibility Guide

| Network Type | CSP Setting | Status |
|-------------|-------------|--------|
| Default Bridge | Keep enabled | ✅ Works |
| br0.2/br0.100 | `DISABLE_CSP=true` | ✅ Fixed |
| Custom Bridge | `DISABLE_CSP=true` | ✅ Fixed |

#### Issue: Installation Fails

**Symptoms**: Error during plugin download or installation
**Solutions**:

1. **Check Internet Connectivity**: Ensure UNRAID has internet access
2. **Verify Plugin URL**: Use the exact URL from the project's plugin manifest file
3. **Retry Installation**: Wait a few minutes and try again
4. **Check System Logs**: Review UNRAID system logs for specific errors

## 📧 **AWS EUM Suite Issues**

### Permission Problems (Common Issue)

#### Issue: EACCES Permission Denied Errors

**Symptoms**:

```
Error saving update info: EACCES: permission denied, open '/app/data/update-info.json'
```

**Root Cause**: User ID mismatch between container and host directory ownership

**Diagnosis Steps**:

```bash
# Check host directory permissions
ls -la /mnt/user/appdata/aws-eum

# Check container user
docker exec AWS-EUM-v3 whoami
docker exec AWS-EUM-v3 id

# Check container's view of the mount
docker exec AWS-EUM-v3 ls -la /app/data
```

**Solution**:

```bash
# Fix ownership to match container user (UID 100)
chown -R 100:users /mnt/user/appdata/aws-eum
chmod -R 755 /mnt/user/appdata/aws-eum

# Restart container after fixing permissions
```

**Alternative Solution** (if UID 100 doesn't work):

```bash
# More permissive approach
chmod -R 777 /mnt/user/appdata/aws-eum
```

### Content Security Policy (CSP) Issues

#### Issue: Enhanced UI Features Not Loading

**Symptoms**:

- Network error messages in browser
- Chart.js analytics not displaying
- Font icons missing
- Console errors about blocked resources

**Browser Console Errors**:

```
Refused to load script 'https://cdn.jsdelivr.net/npm/chart.js'
Refused to load stylesheet 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
```

**Solution 1: Comprehensive CSP Disable (Works on All Networks)**:

```bash
# Add ALL these environment variables for maximum compatibility:
DISABLE_CSP=true
CSP_DISABLED=true
NODE_TLS_REJECT_UNAUTHORIZED=0
CSP_ALLOW_UNSAFE_INLINE=true
CSP_ALLOW_UNSAFE_EVAL=true
NODE_OPTIONS="--dns-result-order=ipv4first"
DNS_SERVERS="8.8.8.8,8.8.4.4"
```

**Solution 2: Custom CSP Policy (Advanced)**:

```bash
# Environment variable for custom CSP policy
CSP_POLICY="default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.googleapis.com https://fonts.gstatic.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com;"
```

**Solution 3: Network Configuration**:

1. **Change Network Type** from `Custom: br0.X` to `Bridge`
2. **Restart Container**
3. **Alternative**: Configure custom network DNS in UNRAID settings

**Solution 4: Container-Level DNS Fix for Custom Networks**:

```bash
# For users who must use custom networks
# Add these environment variables:
RESOLV_CONF_OVERRIDE=true
DNS_SERVERS="8.8.8.8,8.8.4.4,1.1.1.1,1.0.0.1"
DNS_SEARCH=""
DNS_OPTIONS="timeout:2 attempts:3"
```

### AWS Connection Issues

#### Issue: AWS Credentials Invalid

**Symptoms**:

- "AWS credentials error" in logs
- "Cannot connect to Pinpoint" messages
- SMS sending fails

**Solutions**:

1. **Verify Credentials**: Test with AWS CLI if available
2. **Check Permissions**: Ensure IAM user has Pinpoint SMS permissions
3. **Verify Region**: Confirm `AWS_REGION` matches your Pinpoint setup
4. **Network Access**: Ensure container can reach AWS services

**Required AWS Permissions**:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "sms-voice:SendTextMessage",
                "sms-voice:GetOriginationPhoneNumbers",
                "sms-voice:GetOrigIdentities",
                "pinpoint:SendMessages",
                "pinpoint:GetUserEndpoints"
            ],
            "Resource": "*"
        }
    ]
}
```

### Database Connection Issues (MariaDB Edition)

#### Issue: Database Connection Fails

**Symptoms**:

- "Database connection error" in logs
- Application crashes on startup
- Container exits immediately

**Diagnosis Steps**:

```bash
# Test database connectivity from UNRAID
mysql -h database_host -u username -p database_name

# Check if database exists
mysql -h database_host -u username -p -e "SHOW DATABASES;"
```

**Solutions**:

1. **Verify Database Server**: Ensure MariaDB/MySQL is running and accessible
2. **Check Credentials**: Verify username, password, and database name
3. **Test Network**: Ensure UNRAID can reach database server
4. **Check Firewall**: Verify database port (3306) is accessible
5. **Verify Permissions**: Ensure database user has required privileges

**Database Setup Commands**:

```sql
-- Create database
CREATE DATABASE aws_eum_enterprise;

-- Create user with proper permissions
CREATE USER 'aws_eum_user'@'%' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON aws_eum_enterprise.* TO 'aws_eum_user'@'%';
FLUSH PRIVILEGES;
```

### Container Startup Issues

#### Issue: Container Won't Start

**Symptoms**: Container exits immediately or fails to start

**Diagnosis Steps**:

```bash
# Check container logs
docker logs container_name

# Check container status
docker ps -a | grep aws-eum
```

**Common Solutions**:

1. **Check Environment Variables**: Ensure all required variables are set
2. **Verify Port Conflicts**: Ensure chosen port isn't in use
3. **Check Volume Mounts**: Verify paths exist and have correct permissions
4. **Review Logs**: Look for specific error messages in container logs

## 🏆 **UNRAID API Integration Issues**

### Integration Problems

#### Issue: Module Not Loading

**Symptoms**: UNRAID API doesn't recognize the FileManager module

**Solutions**:

1. **Verify Module Path**: Ensure module is in correct directory structure
2. **Check Imports**: Verify all required imports are included
3. **Review Dependencies**: Ensure all npm dependencies are installed
4. **Check TypeScript**: Verify TypeScript compilation is successful

#### Issue: Authentication Bridge Fails

**Symptoms**: File manager doesn't respect UNRAID user sessions

**Solutions**:

1. **Check Cookie Parsing**: Verify UNRAID session cookies are being read
2. **Verify Token Bridge**: Ensure token-bridge.service is working correctly
3. **Test Headers**: Check if proper headers are being passed to FileBrowser
4. **Review Permissions**: Verify permission mapping is working

## 🔧 **General Troubleshooting Steps**

### Step 1: Check Logs

Always start by checking the relevant logs:

```bash
# Container logs
docker logs container_name

# UNRAID system logs
tail -f /var/log/syslog

# Plugin logs (if applicable)
tail -f /var/log/plugins/plugin_name.log
```

### Step 2: Verify Configuration

- **Environment Variables**: Ensure all required variables are set
- **Volume Mounts**: Check paths exist and have correct permissions
- **Network Settings**: Verify network configuration
- **Port Mapping**: Ensure no port conflicts

### Step 3: Test Connectivity

- **Internal Services**: Test container-to-container communication
- **External Services**: Verify internet access and external API connectivity
- **Database**: Test database connections if applicable

### Step 4: Check Resources

- **Memory Usage**: Ensure sufficient RAM available
- **Disk Space**: Verify adequate storage space
- **CPU**: Check for CPU limitations

## 📞 **Getting Additional Help**

### Support Channels

- **📧 Email**: <hello@git.n85.uk>
- **🐛 GitHub Issues**: [Create an Issue](https://github.com/N85UK/UNRAID_Apps/issues)
- **🔒 Security Issues**: <security@git.n85.uk>

### When Reporting Issues

Include the following information:

1. **Project Version**: Exact version number
2. **UNRAID Version**: Your UNRAID version
3. **Error Messages**: Complete error messages from logs
4. **Browser Console**: JavaScript errors if applicable
5. **Configuration**: Environment variables and settings (no secrets)
6. **Steps to Reproduce**: Clear steps to recreate the issue

### Debug Information Collection

For faster support, collect this information:

```bash
# System information
uname -a
docker --version

# Container status
docker ps -a | grep project_name

# Recent logs
docker logs --tail 50 container_name

# Volume permissions
ls -la /mnt/user/appdata/project_name/
```

---

**🔄 Updated**: October 2025 with latest troubleshooting procedures and known issues
**📚 More Help**: Check [Installation Guides](Installation-Guides) for setup-specific issues
