# AWS EUM Suite Installation Guide

**Complete installation guide for AWS End User Messaging applications**

## 🎯 **Choose Your Edition**

The AWS EUM Suite offers three distinct editions, each designed for different use cases and requirements:

| Edition | Best For | Key Features | Complexity |
|---------|----------|--------------|------------|
| **v2.0 Stable** | New users, simple setups | Reliable SMS, basic features | ⭐ Simple |
| **v3.0 Enhanced** | Modern UI needs | Chart.js, dark mode, analytics | ⭐⭐ Moderate |
| **MariaDB Enterprise** | Teams, compliance | Multi-user, roles, database | ⭐⭐⭐ Advanced |

## 📦 **AWS EUM v2.0 - Stable Edition**

### Overview
The stable, production-ready version with core SMS functionality and proven reliability.

### Prerequisites
- **Docker**: Docker and Docker Compose installed on your system
- **AWS Account**: Active AWS account with Pinpoint SMS permissions
- **UNRAID**: UNRAID 6.8+ with Docker support
- **Network**: Internet connectivity for AWS API access

### Installation Steps

#### 1. Download Template
```bash
# Method 1: Direct template download
wget https://github.com/N85UK/UNRAID_Apps/raw/main/Apps/AWS_EUM/template.cfg

# Method 2: Via Community Applications
# Search for \"AWS End User Messaging v2.0\" in Apps tab
```

#### 2. Docker Installation via UNRAID Template
1. **Access Docker Tab**
   - Open UNRAID webGUI
   - Navigate to **Docker** tab

2. **Add Container**
   - Click **\"Add Container\"**
   - Select **\"Template\"** dropdown
   - Choose **\"AWS End User Messaging v2.0\"**

3. **Configure Environment Variables**
   ```
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=eu-west-2  # Optional, default region
   PORT=80               # Optional, default port
   ORIGINATORS=Label1:arn1,Label2:arn2  # Optional custom originators
   ```

4. **Set Paths and Ports**
   - **Port**: `8080:80` (or your preferred host port)
   - **Path**: `/mnt/user/appdata/aws-eum:/config/data`

5. **Start Container**
   - Click **\"Apply\"** to create and start the container
   - Wait for container to start successfully

#### 3. Access Application
- **URL**: `http://your-unraid-ip:8080`
- **Interface**: Clean, simple SMS sending interface
- **Features**: Basic SMS, history, cost estimation

### Docker Compose (Alternative)
```yaml
version: '3.8'
services:
  aws-eum:
    image: ghcr.io/n85uk/aws-eum:latest
    container_name: aws-eum
    ports:
      - \"8080:80\"
    environment:
      - AWS_ACCESS_KEY_ID=your_aws_access_key
      - AWS_SECRET_ACCESS_KEY=your_aws_secret_key
      - AWS_REGION=eu-west-2
    volumes:
      - /mnt/user/appdata/aws-eum:/config/data
    restart: unless-stopped
```

## 🎨 **AWS EUM v3.0 - Enhanced UI Edition**

### Overview
Modern interface with Chart.js analytics, dark mode, and advanced visual features.

### Prerequisites
- Same as v2.0 plus:
- **Browser**: Modern browser supporting ES6+ JavaScript
- **Resources**: Slightly higher memory usage for enhanced features

### Installation Steps

#### 1. Download Template
```bash
# Method 1: Direct template download
wget https://github.com/N85UK/UNRAID_Apps/raw/main/Apps/AWS_EUM_v3/template.cfg

# Method 2: Via Community Applications
# Search for \"AWS End User Messaging v3.0 Enhanced\" in Apps tab
```

#### 2. Docker Installation via UNRAID Template
1. **Access Docker Tab** (same as v2.0)
2. **Add Container** with template **\"AWS End User Messaging v3.0 Enhanced\"**
3. **Configure Environment Variables** (same as v2.0 plus):
   ```
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=eu-west-2
   PORT=80
   ORIGINATORS=Label1:arn1,Label2:arn2
   AUTO_UPDATE_CHECK=true          # Enhanced feature
   UPDATE_CHECK_INTERVAL=24        # Enhanced feature
   HISTORY_RETENTION=100           # Enhanced feature
   ```

4. **Set Paths and Ports**
   - **Port**: `8081:80` (different from v2.0 if running both)
   - **Path**: `/mnt/user/appdata/aws-eum-v3:/app/data`

5. **Start Container** and verify startup

#### 3. Access Enhanced Interface
- **URL**: `http://your-unraid-ip:8081`
- **Features**: Dark mode toggle, Chart.js analytics, modern design
- **Mobile**: Fully responsive mobile interface

### Docker Compose (Enhanced)
```yaml
version: '3.8'
services:
  aws-eum-v3:
    image: ghcr.io/n85uk/aws-eum-v3:latest
    container_name: aws-eum-v3
    ports:
      - \"8081:80\"
    environment:
      - AWS_ACCESS_KEY_ID=your_aws_access_key
      - AWS_SECRET_ACCESS_KEY=your_aws_secret_key
      - AWS_REGION=eu-west-2
      - AUTO_UPDATE_CHECK=true
      - HISTORY_RETENTION=100
    volumes:
      - /mnt/user/appdata/aws-eum-v3:/app/data
    restart: unless-stopped
```

## 🏢 **AWS EUM MariaDB - Enterprise Edition**

### Overview
Enterprise-grade solution with multi-user authentication, role-based access control, and external database integration.

### Prerequisites
- **MariaDB/MySQL**: External database server (MariaDB 10.5+ or MySQL 8.0+)
- **Database Access**: Database with create/modify permissions
- **Network**: Database connectivity from UNRAID to database server
- **Security**: Understanding of user management and security practices

### Database Setup

#### 1. Prepare Database
```sql
-- Create database
CREATE DATABASE aws_eum_enterprise;

-- Create user (replace with secure credentials)
CREATE USER 'aws_eum_user'@'%' IDENTIFIED BY 'secure_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON aws_eum_enterprise.* TO 'aws_eum_user'@'%';
FLUSH PRIVILEGES;
```

#### 2. Configure Network Access
- **Firewall**: Ensure database port (3306) is accessible from UNRAID
- **Network**: Configure database server to accept connections from UNRAID IP
- **Security**: Use strong passwords and consider VPN/encryption

### Installation Steps

#### 1. Download Template
```bash
# Method 1: Direct template download
wget https://github.com/N85UK/UNRAID_Apps/raw/main/Apps/AWS_EUM_MariaDB/template.cfg

# Method 2: Via Community Applications
# Search for \"AWS EUM MariaDB Enterprise\" in Apps tab
```

#### 2. Docker Installation with Database Configuration
1. **Add Container** with template **\"AWS EUM MariaDB Enterprise\"**
2. **Configure All Environment Variables**:
   ```
   # AWS Configuration
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=eu-west-2
   
   # Database Configuration (REQUIRED)
   DB_HOST=your_database_host
   DB_PORT=3306
   DB_NAME=aws_eum_enterprise
   DB_USER=aws_eum_user
   DB_PASSWORD=secure_password
   
   # Application Configuration
   PORT=80
   ORIGINATORS=Label1:arn1,Label2:arn2
   JWT_SECRET=auto_generated_if_empty
   SESSION_TIMEOUT=24
   BCRYPT_ROUNDS=12
   API_RATE_LIMIT=100
   ```

3. **Set Paths and Ports**
   - **Port**: `8082:80` (different from other versions)
   - **Path**: `/mnt/user/appdata/aws-eum-mariadb:/app/data`
   - **Uploads**: `/mnt/user/appdata/aws-eum-mariadb/uploads:/app/uploads`

4. **Start Container** and monitor logs for database connection

#### 3. Initial Admin Setup
1. **Access Application**: `http://your-unraid-ip:8082`
2. **First Run**: Application will create database schema automatically
3. **Admin Account**: Default admin user will be created (check logs for credentials)
4. **Change Passwords**: Immediately change default passwords

### Docker Compose (Enterprise)
```yaml
version: '3.8'
services:
  aws-eum-mariadb:
    image: ghcr.io/n85uk/aws-eum-mariadb:latest
    container_name: aws-eum-mariadb
    ports:
      - \"8082:80\"
    environment:
      # AWS Configuration
      - AWS_ACCESS_KEY_ID=your_aws_access_key
      - AWS_SECRET_ACCESS_KEY=your_aws_secret_key
      - AWS_REGION=eu-west-2
      
      # Database Configuration
      - DB_HOST=your_database_host
      - DB_PORT=3306
      - DB_NAME=aws_eum_enterprise
      - DB_USER=aws_eum_user
      - DB_PASSWORD=secure_password
      
      # Security Configuration
      - JWT_SECRET=your_jwt_secret
      - SESSION_TIMEOUT=24
      - BCRYPT_ROUNDS=12
    volumes:
      - /mnt/user/appdata/aws-eum-mariadb:/app/data
      - /mnt/user/appdata/aws-eum-mariadb/uploads:/app/uploads
    restart: unless-stopped
    depends_on:
      - database
      
  # Optional: Include database in same stack
  database:
    image: mariadb:10.11
    container_name: aws-eum-database
    environment:
      - MYSQL_ROOT_PASSWORD=root_password
      - MYSQL_DATABASE=aws_eum_enterprise
      - MYSQL_USER=aws_eum_user
      - MYSQL_PASSWORD=secure_password
    volumes:
      - /mnt/user/appdata/mariadb:/var/lib/mysql
    restart: unless-stopped
```

## 🔧 **Post-Installation Configuration**

### AWS Pinpoint Setup

#### 1. Create AWS Account Resources
1. **Enable Pinpoint SMS**: In AWS Console, enable Pinpoint SMS service
2. **Configure Originator**: Set up sender ID or phone number
3. **Set Spending Limits**: Configure SMS spending limits for cost control
4. **Test Connectivity**: Verify AWS credentials work with Pinpoint

#### 2. Configure Originators (Optional)
```bash
# Format: Label:ARN pairs
ORIGINATORS=\"Marketing:arn:aws:sms:region:account:originator/marketing,Support:arn:aws:sms:region:account:originator/support\"
```

### Security Configuration

#### 1. Environment Variables Security
- **Never Commit Secrets**: Use environment variables, never hardcode credentials
- **Strong Passwords**: Use complex passwords for database access
- **Regular Rotation**: Rotate AWS keys and database passwords regularly
- **Principle of Least Privilege**: Use minimal required AWS permissions

#### 2. Network Security
- **Reverse Proxy**: Consider using reverse proxy (nginx/traefik) for HTTPS
- **Firewall**: Restrict access to application ports
- **Database Security**: Secure database with proper authentication
- **VPN Access**: Consider VPN for enterprise deployments

## 🔍 **Troubleshooting Installation**

### Common Issues

#### Issue: Container Won't Start
**Symptoms**: Docker container exits immediately or fails to start
**Solutions**:
1. **Check Logs**: `docker logs container_name`
2. **Verify Environment**: Ensure all required environment variables are set
3. **AWS Credentials**: Verify AWS credentials are valid and have Pinpoint permissions
4. **Port Conflicts**: Ensure chosen port is not in use
5. **Database Connection**: For MariaDB edition, verify database connectivity

#### Issue: AWS Connection Fails
**Symptoms**: \"AWS credentials error\" or \"Cannot connect to Pinpoint\"
**Solutions**:
1. **Credential Verification**: Test AWS credentials with AWS CLI
2. **Permission Check**: Ensure IAM user has Pinpoint SMS permissions
3. **Region Configuration**: Verify AWS_REGION matches your Pinpoint setup
4. **Network Access**: Ensure container can reach AWS services

#### Issue: Database Connection Fails (MariaDB Edition)
**Symptoms**: \"Database connection error\" or application crashes on startup
**Solutions**:
1. **Network Connectivity**: Test database connection from UNRAID
2. **Credentials**: Verify database username and password
3. **Database Exists**: Ensure database name exists on server
4. **Permissions**: Verify user has sufficient database privileges
5. **Firewall**: Check database server firewall allows UNRAID connections

### Version-Specific Troubleshooting

#### v2.0 Stable Issues
- **Simple Interface**: If interface doesn't load, check browser console
- **File History**: Ensure appdata volume is properly mounted
- **Performance**: v2.0 should use minimal resources

#### v3.0 Enhanced Issues
- **Chart.js Loading**: If charts don't display, check browser JavaScript support
- **Dark Mode**: If theme doesn't persist, check browser local storage
- **Modern Features**: Ensure browser supports ES6+ JavaScript

#### MariaDB Enterprise Issues
- **User Authentication**: Check JWT secret configuration
- **Role Management**: Verify user roles are properly assigned
- **Database Schema**: Check if automatic migration completed successfully
- **Session Management**: Verify session timeout and security settings

## 📊 **Installation Verification**

### Health Check Steps
1. **Container Status**: Verify container is running
   ```bash
   docker ps | grep aws-eum
   ```

2. **Application Access**: Open application URL in browser

3. **AWS Connectivity**: Test sending a simple SMS

4. **Database Connectivity** (MariaDB only): Verify database tables created

5. **Feature Testing**: Test specific features (dark mode, charts, user management)

### Success Indicators
- ✅ Container starts without errors
- ✅ Application loads in browser
- ✅ AWS credentials validated successfully
- ✅ SMS sending functions properly
- ✅ Data persistence works (message history)
- ✅ All features accessible and functional

---

**🚀 Quick Start Summary**:
1. Choose your edition (v2.0 Stable, v3.0 Enhanced, or MariaDB Enterprise)
2. Download appropriate template
3. Configure AWS credentials and environment variables
4. Set up database (MariaDB edition only)
5. Start container and verify functionality
6. Configure AWS Pinpoint and test SMS sending

**📞 Support**: For installation issues, see [Troubleshooting](Common-Issues) or contact support at hello@git.n85.uk