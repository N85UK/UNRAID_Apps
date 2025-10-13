# 🎉 AWS EUM MariaDB v2.1.3 - Auto Database Initialization

**Release Date:** October 13, 2025  
**Feature:** Automatic Database Setup  
**Impact:** Zero-configuration database initialization  
**Status:** ✅ Production Ready

---

## 🚀 What's New

### Automatic Database Creation

**Before v2.1.3:**
```sql
-- You had to manually run:
CREATE DATABASE aws_eum CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'aws_eum'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON aws_eum.* TO 'aws_eum'@'%';
FLUSH PRIVILEGES;

-- Then run migrations:
npm run migrate
```

**Now in v2.1.3:**
```bash
# Just start the container!
docker run -e DB_HOST=mariadb \
           -e DB_USER=root \
           -e DB_PASSWORD=rootpass \
           ghcr.io/n85uk/aws-eum-mariadb:latest

# Everything is created automatically! ✨
```

---

## ✨ Features

### 1. **Database Auto-Creation**
- Checks if database exists on startup
- Creates database automatically if missing
- Sets proper character set (utf8mb4) and collation
- No manual SQL commands needed!

### 2. **Table Auto-Creation**
Creates all 7 required tables automatically:

| Table | Purpose |
|-------|---------|
| `users` | User accounts and authentication |
| `messages` | SMS message history and tracking |
| `originators` | AWS phone numbers and sender IDs |
| `settings` | Application configuration |
| `analytics` | Message statistics and analytics |
| `sessions` | User session management |
| `api_keys` | External API integration keys |

### 3. **Default Settings**
Automatically inserts 10 default settings:

- `app_name`: "AWS End User Messaging"
- `app_version`: "2.1.3"
- `max_message_length`: 1600
- `cost_per_segment`: 0.0075
- `default_country_code`: "+44"
- `enable_analytics`: true
- `analytics_retention_days`: 365
- `rate_limit_messages`: 10
- `session_timeout`: 3600
- `enable_registration`: false

### 4. **Default Admin User**
Creates admin account on first run if no users exist:

- **Username:** `admin` (or `ADMIN_USERNAME` env var)
- **Password:** `admin123` (or `ADMIN_PASSWORD` env var)
- **Role:** admin
- **Email:** `admin@localhost`

⚠️ **IMPORTANT:** Change default password immediately!

### 5. **Smart Health Checks**
- Verifies database connection on startup
- Checks if all tables exist
- Reports missing tables and creates them
- Provides detailed status information

### 6. **Enhanced Logging**
Beautiful formatted console output:

```
═══════════════════════════════════════════════════════════
  AWS End User Messaging - MariaDB Enterprise Edition
  Version: 2.1.3
═══════════════════════════════════════════════════════════

🔧 Database not initialized - running auto-setup...

🔄 Initializing database...
📊 Checking database: aws_eum
✅ Database aws_eum ready
🏗️  Creating tables...
  ✅ Table 'users' ready
  ✅ Table 'messages' ready
  ✅ Table 'originators' ready
  ✅ Table 'settings' ready
  ✅ Table 'analytics' ready
  ✅ Table 'sessions' ready
  ✅ Table 'api_keys' ready
✅ All 7 tables created successfully
⚙️  Configuring default settings...
✅ Default settings configured
👤 Creating default admin user...
✅ Default admin user created: admin

⚠️  WARNING: Default admin password is being used!
   Please change the password immediately after first login
   Or set ADMIN_PASSWORD environment variable

🎉 Database initialization complete!

═══════════════════════════════════════════════════════════
🚀 AWS EUM v2.1.3 server running on port 80
🌐 HTTP Server: http://0.0.0.0:80
🌍 AWS Region: eu-west-2
═══════════════════════════════════════════════════════════
```

---

## 🎯 Use Cases

### 1. **Fresh Installation**
Just provide database credentials - everything else is automatic:

```yaml
# docker-compose.yml
version: '3.8'
services:
  mariadb:
    image: mariadb:10.5
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: aws_eum  # Optional - will be created anyway
      
  aws-eum:
    image: ghcr.io/n85uk/aws-eum-mariadb:latest
    environment:
      DB_HOST: mariadb
      DB_USER: root
      DB_PASSWORD: rootpass
      DB_NAME: aws_eum
      AWS_ACCESS_KEY_ID: AKIA...
      AWS_SECRET_ACCESS_KEY: xxx...
      JWT_SECRET: your-random-32-char-string
      SESSION_SECRET: another-random-32-char-string
    ports:
      - "80:80"
    depends_on:
      - mariadb
```

**That's it!** Start the containers and everything is configured automatically.

### 2. **UNRAID Deployment**
1. Install MariaDB from Community Applications
2. Install AWS_EUM_MariaDB from Community Applications
3. Configure environment variables in template
4. Start container - database initializes automatically!

### 3. **Migration from SQLite (v3)**
Moving from AWS_EUM_v3 to MariaDB edition:

1. Deploy MariaDB container
2. Deploy AWS_EUM_MariaDB with database credentials
3. Database tables created automatically
4. Start sending messages!

*(Note: Message history from v3 not automatically migrated - manual export/import if needed)*

### 4. **Development Environment**
```bash
# Local development with Docker
docker run -d --name mariadb \
  -e MYSQL_ROOT_PASSWORD=dev \
  mariadb:10.5

docker run --name aws-eum \
  --link mariadb:mariadb \
  -e DB_HOST=mariadb \
  -e DB_USER=root \
  -e DB_PASSWORD=dev \
  -e DB_NAME=aws_eum_dev \
  -e AWS_ACCESS_KEY_ID=test \
  -e AWS_SECRET_ACCESS_KEY=test \
  -e JWT_SECRET=$(openssl rand -base64 32) \
  -e SESSION_SECRET=$(openssl rand -base64 32) \
  -p 3000:80 \
  ghcr.io/n85uk/aws-eum-mariadb:latest

# Database created and initialized automatically!
```

---

## 🔧 Configuration

### Required Environment Variables

Only database credentials are required:

```bash
DB_HOST=your-mariadb-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=aws_eum  # Optional, defaults to 'aws_eum'
```

### Optional Environment Variables

```bash
# Database Connection
DB_PORT=3306                    # Default: 3306
DB_CONNECTION_LIMIT=10          # Default: 10
DB_TIMEOUT=60000                # Default: 60000ms

# Admin Account (for first-time setup)
ADMIN_USERNAME=admin            # Default: 'admin'
ADMIN_PASSWORD=SecurePass123    # Default: 'admin123' (CHANGE THIS!)

# AWS Configuration (required for SMS)
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=xxx...
AWS_REGION=eu-west-2            # Default: 'eu-west-2'

# Security (required)
JWT_SECRET=random-32-char-string
SESSION_SECRET=another-random-32-char-string
SESSION_TIMEOUT=3600            # Default: 3600 seconds (1 hour)

# Application Settings
RATE_LIMIT_MESSAGES=10          # Default: 10 per minute
MAX_MESSAGE_LENGTH=1600         # Default: 1600 characters
```

---

## 📊 Database Schema

### Tables Created Automatically

#### 1. **users**
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role ENUM('admin', 'user', 'readonly') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 2. **messages**
```sql
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message_id VARCHAR(255) UNIQUE NOT NULL,
    user_id INT,
    originator VARCHAR(100) NOT NULL,
    destination VARCHAR(20) NOT NULL,
    message_text TEXT NOT NULL,
    message_length INT NOT NULL,
    segments INT NOT NULL DEFAULT 1,
    status ENUM('pending', 'sent', 'delivered', 'failed') DEFAULT 'pending',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

#### 3. **originators**
```sql
CREATE TABLE originators (
    id INT AUTO_INCREMENT PRIMARY KEY,
    value VARCHAR(100) UNIQUE NOT NULL,
    label VARCHAR(255) NOT NULL,
    type ENUM('phone_number', 'sender_id') NOT NULL,
    country_code VARCHAR(5),
    is_active BOOLEAN DEFAULT TRUE,
    last_used TIMESTAMP NULL,
    total_messages INT DEFAULT 0
);
```

*Plus 4 more tables: settings, analytics, sessions, api_keys*

---

## 🔐 Security Best Practices

### 1. **Change Default Password**
```sql
-- After first login, change the password:
UPDATE users SET password_hash = ? WHERE username = 'admin';
```

Or use the UI (when multi-user features are enabled).

### 2. **Set Custom Admin Credentials**
```bash
# In docker-compose.yml or UNRAID template:
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=YourSecurePassword123!
```

### 3. **Generate Strong Secrets**
```bash
# Generate JWT and Session secrets:
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For SESSION_SECRET
```

### 4. **Database User Permissions**
For production, create a dedicated database user:

```sql
CREATE USER 'aws_eum'@'%' IDENTIFIED BY 'secure-password';
GRANT ALL PRIVILEGES ON aws_eum.* TO 'aws_eum'@'%';
FLUSH PRIVILEGES;
```

Then use these credentials in your deployment.

---

## 🆘 Troubleshooting

### Database Connection Failed

**Error:** `❌ Database connection failed: ECONNREFUSED`

**Solution:**
1. Check MariaDB/MySQL is running: `docker ps`
2. Verify DB_HOST is correct (container name or IP)
3. Check DB_PORT (default: 3306)
4. Ensure database server is accessible from container

### Access Denied

**Error:** `❌ Database connection failed: ER_ACCESS_DENIED_ERROR`

**Solution:**
1. Verify DB_USER and DB_PASSWORD are correct
2. Check user has access from container hostname
3. User needs CREATE DATABASE privilege for first-time setup

### Tables Already Exist

**Behavior:** Application detects existing tables and skips creation

**Console:**
```
✅ Database 'aws_eum' already initialized
📊 Found 7 tables
```

This is normal and safe - existing data is preserved.

### Admin User Already Exists

**Behavior:** Default admin user creation skipped if users exist

**Console:**
```
👤 Found 1 existing user(s)
```

This is normal - application doesn't create duplicate admin users.

### Database Timeout

**Error:** Connection timeout during initialization

**Solution:**
1. Increase DB_TIMEOUT: `DB_TIMEOUT=120000` (120 seconds)
2. Check database server performance
3. Verify network connectivity is stable

---

## 🎓 Examples

### Example 1: Basic UNRAID Setup

```xml
<!-- In UNRAID template -->
<Config Name="DB_HOST" Default="mariadb.local" />
<Config Name="DB_USER" Default="root" />
<Config Name="DB_PASSWORD" Default="" Mask="true" />
<Config Name="DB_NAME" Default="aws_eum" />
<Config Name="ADMIN_PASSWORD" Default="admin123" Mask="true" />
```

Start container → Database created automatically → Login with admin/admin123 → Change password!

### Example 2: Docker Compose Full Stack

```yaml
version: '3.8'

services:
  mariadb:
    image: mariadb:10.5
    container_name: mariadb
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
    volumes:
      - mariadb_data:/var/lib/mysql
    restart: unless-stopped
    
  aws-eum-mariadb:
    image: ghcr.io/n85uk/aws-eum-mariadb:latest
    container_name: aws-eum-mariadb
    environment:
      # Database
      DB_HOST: mariadb
      DB_USER: root
      DB_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      DB_NAME: aws_eum
      
      # Admin Account
      ADMIN_USERNAME: ${ADMIN_USERNAME:-admin}
      ADMIN_PASSWORD: ${ADMIN_PASSWORD}
      
      # AWS
      AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}
      AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY}
      AWS_REGION: ${AWS_REGION:-eu-west-2}
      
      # Security
      JWT_SECRET: ${JWT_SECRET}
      SESSION_SECRET: ${SESSION_SECRET}
    ports:
      - "80:80"
    depends_on:
      - mariadb
    restart: unless-stopped
    
volumes:
  mariadb_data:
```

### Example 3: Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aws-eum-mariadb
spec:
  replicas: 1
  template:
    spec:
      containers:
      - name: aws-eum
        image: ghcr.io/n85uk/aws-eum-mariadb:latest
        env:
        - name: DB_HOST
          value: "mariadb-service"
        - name: DB_USER
          valueFrom:
            secretKeyRef:
              name: mariadb-secret
              key: username
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mariadb-secret
              key: password
        - name: ADMIN_PASSWORD
          valueFrom:
            secretKeyRef:
              name: admin-secret
              key: password
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: secret
```

---

## 📈 Benefits

### For Users
- ✅ **Zero Configuration** - Just provide DB credentials
- ✅ **Instant Setup** - No manual SQL commands
- ✅ **Clear Feedback** - Know exactly what's happening
- ✅ **Error Guidance** - Helpful troubleshooting messages
- ✅ **Time Savings** - Setup in seconds, not minutes

### For Administrators
- ✅ **Consistent Setup** - Same process every time
- ✅ **Easy Deployment** - Works with any orchestration tool
- ✅ **Automated Testing** - Deploy test environments quickly
- ✅ **Version Control** - Schema always matches application version
- ✅ **No Manual Migrations** - Updates handle schema changes

### For Developers
- ✅ **Quick Dev Environment** - Spin up instances instantly
- ✅ **Reproducible Setup** - Same schema every time
- ✅ **Easy Integration Testing** - Fresh database for each test
- ✅ **Schema in Code** - Database schema version controlled
- ✅ **CI/CD Friendly** - Automated deployment pipelines

---

## ✅ Migration Guide

### From Manual Setup (v2.1.0 - v2.1.2)

**Old Process:**
1. Create database manually
2. Run migration script
3. Create admin user
4. Insert settings

**New Process:**
1. Just start the container!

**Existing Installations:**
- Tables already exist → Skipped (data preserved)
- Users already exist → Skipped
- Settings already exist → Preserved

**No action required for upgrades!**

### From v3 (SQLite)

**Differences:**
- v3 uses SQLite (file-based)
- MariaDB uses external database server

**Migration Steps:**
1. Deploy MariaDB server
2. Deploy MariaDB edition with DB credentials
3. Database initializes automatically
4. Manually migrate history if needed (CSV export/import)

---

## 🎉 Success Criteria

After starting v2.1.3:

✅ Database created automatically  
✅ All 7 tables exist  
✅ Default settings inserted  
✅ Admin user created (if first run)  
✅ Server starts successfully  
✅ Web UI accessible  
✅ No manual SQL commands needed  
✅ Clear console output with status  

---

## 📞 Support

### If Database Won't Initialize

1. **Check logs:** `docker logs aws-eum-mariadb`
2. **Verify credentials:** Echo environment variables
3. **Test connection:** `docker exec mariadb mysql -u root -p`
4. **Check privileges:** User needs CREATE DATABASE permission
5. **Network connectivity:** Ensure containers can communicate

### Common Issues

**Q: Can I use existing database?**  
A: Yes! Application detects existing tables and preserves data.

**Q: What if tables are corrupted?**  
A: Drop the database and restart - fresh tables created automatically.

**Q: Can I customize admin username?**  
A: Yes! Set `ADMIN_USERNAME` environment variable.

**Q: Is existing data safe?**  
A: Yes! Application only creates tables if they don't exist (CREATE TABLE IF NOT EXISTS).

**Q: Can I skip admin user creation?**  
A: Yes - if any users exist, admin creation is skipped.

---

## 📚 Technical Details

### Initialization Flow

```
Start Application
    ↓
Check Database Status
    ↓
Database Exists? ───NO──→ Create Database
    ↓ YES                      ↓
All Tables Exist? ─NO──→ Create Tables
    ↓ YES                      ↓
Settings Exist? ───NO──→ Insert Settings
    ↓ YES                      ↓
Users Exist? ──────NO──→ Create Admin
    ↓ YES                      ↓
Start HTTP Server
```

### Module Structure

```
lib/
├── db-init.js       ← New auto-initialization module
├── database.js      ← Database operations (unchanged)
└── auth.js          ← Authentication (unchanged)
```

### Error Handling

- Connection failures → Clear error messages + troubleshooting
- Permission errors → Guidance on user privileges
- Timeout errors → Suggestion to increase timeout
- Fatal errors → Exit with helpful information

---

**Version:** 2.1.3  
**Status:** ✅ Production Ready  
**Feature:** Auto Database Initialization  
**Impact:** Zero-configuration database setup  

**Enjoy seamless database initialization!** 🎉
