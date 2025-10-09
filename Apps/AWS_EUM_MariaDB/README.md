# AWS End User Messaging with MariaDB - Enterprise Edition

🏢 **Enterprise-grade SMS messaging platform with external database integration, multi-user support, and advanced analytics**

## 🚀 **Production Ready - Auto-deployed via GitHub Actions**

✅ **Status**: Production ready with automated Docker builds  
📦 **Docker Image**: `ghcr.io/n85uk/aws-eum-mariadb:latest`  
🔄 **CI/CD**: Automated builds with Alpine Linux and clean dependency management

## 🌟 Enterprise Features

### 🗄️ **External Database Integration**
- **MariaDB/MySQL Support**: Store all data in external database
- **Connection Pooling**: High performance with optimized database connections
- **Automatic Migrations**: Database schema setup and updates
- **Data Persistence**: No data loss during container updates
- **Backup Compatible**: Standard database backup procedures

### 👥 **Multi-User Management**
- **Role-Based Access**: Admin, User, and ReadOnly roles
- **Secure Authentication**: JWT tokens with bcrypt password hashing
- **Session Management**: Secure session handling with database storage
- **User Registration**: Optional user registration with admin approval
- **Account Management**: User activation/deactivation controls

### 📊 **Advanced Analytics Dashboard**
- **Historical Data**: Complete message history with trend analysis
- **Real-time Metrics**: Live statistics and performance monitoring
- **Success Rate Tracking**: Delivery status and failure analysis
- **Cost Analytics**: Detailed cost tracking and reporting
- **Export Capabilities**: Data export for external analysis
- **Custom Date Ranges**: Flexible reporting periods

### 🔐 **Enterprise Security**
- **JWT Authentication**: Secure token-based authentication
- **Password Encryption**: bcrypt hashing with salt rounds
- **Session Security**: Secure session management with database storage
- **API Keys**: External system integration with permission-based API access
- **Audit Trails**: Complete user action logging
- **Rate Limiting**: Advanced protection against abuse

## 🚀 Quick Start

### Prerequisites
- External MariaDB/MySQL database server
- Valid AWS account with Pinpoint SMS permissions
- UNRAID server (or Docker environment)

### 1. Database Setup
```sql
-- Create database and user
CREATE DATABASE aws_eum CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'aws_eum'@'%' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON aws_eum.* TO 'aws_eum'@'%';
FLUSH PRIVILEGES;
```

### 2. Container Deployment
```bash
docker run -d \
  --name aws-eum-mariadb \
  -p 8080:80 \
  -e DB_HOST=your_mariadb_server \
  -e DB_USER=aws_eum \
  -e DB_PASSWORD=your_secure_password \
  -e DB_NAME=aws_eum \
  -e AWS_ACCESS_KEY_ID=your_aws_key \
  -e AWS_SECRET_ACCESS_KEY=your_aws_secret \
  -e AWS_REGION=eu-west-2 \
  -e JWT_SECRET=your_jwt_secret_key \
  -e SESSION_SECRET=your_session_secret \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=change_this_password \
  ghcr.io/n85uk/aws-eum-mariadb:latest
```

### 3. Initial Setup
1. Access the web interface: `http://your-server:8080`
2. Login with admin credentials (change the default password immediately!)
3. Configure AWS settings if not set via environment variables
4. Create additional users as needed

## ⚙️ Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | Database server hostname | `mariadb.local` |
| `DB_USER` | Database username | `aws_eum` |
| `DB_PASSWORD` | Database password | `secure_password` |
| `AWS_ACCESS_KEY_ID` | AWS Access Key | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Key | `xxx...` |
| `JWT_SECRET` | JWT signing secret | `random_string_32_chars` |
| `SESSION_SECRET` | Session secret | `random_string_32_chars` |

### Optional Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_PORT` | `3306` | Database port |
| `DB_NAME` | `aws_eum` | Database name |
| `AWS_REGION` | `eu-west-2` | AWS region |
| `ADMIN_USERNAME` | `admin` | Initial admin username |
| `ADMIN_PASSWORD` | `admin123` | Initial admin password |
| `SESSION_TIMEOUT` | `3600` | Session timeout (seconds) |
| `DB_CONNECTION_LIMIT` | `10` | Max database connections |

## 📋 Database Schema

The application automatically creates the following tables:

- **`users`** - User accounts and authentication
- **`messages`** - SMS message history and status
- **`originators`** - AWS phone numbers and sender IDs
- **`settings`** - Application configuration
- **`analytics`** - Message statistics and metrics
- **`sessions`** - User session storage
- **`api_keys`** - External API access tokens

## 🔧 Management Commands

### Database Migration
```bash
# Run inside container
npm run migrate
```

### Database Seeding
```bash
# Create default admin user and sample data
npm run seed
```

### Development Mode
```bash
npm run dev
```

## 🔐 User Roles

### Admin
- Full system access
- User management
- Settings configuration
- All analytics and reports
- API key management

### User
- Send SMS messages
- View own message history
- Access basic analytics
- Update own profile

### ReadOnly
- View shared message history
- Access analytics dashboard
- No sending permissions

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/register` - User registration (if enabled)

### Messages
- `POST /api/sms/send` - Send SMS message
- `GET /api/sms/history` - Get message history
- `GET /api/sms/:id` - Get specific message

### Analytics
- `GET /api/analytics/dashboard` - Dashboard metrics
- `GET /api/analytics/reports` - Detailed reports
- `GET /api/analytics/export` - Export data

### Management
- `GET /api/users` - List users (admin only)
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id` - Update user (admin only)

## � Monitoring & Logging

### Health Checks
- Database connectivity monitoring
- AWS service status checks
- Application health endpoints

### Logging
- Structured JSON logging
- Configurable log levels
- Request/response logging
- Error tracking and alerts

## 🎯 Use Cases

### Small Business
- Team SMS notifications
- Customer communication
- Marketing campaigns
- User accountability

### Enterprise
- Departmental messaging
- Automated alerts
- Integration with existing systems
- Compliance and audit requirements

### Development Teams
- Build notifications
- System alerts
- Integration testing
- Monitoring dashboards

## 🆙 Upgrading from v2.0

1. **Backup existing data** from v2.0 file storage
2. **Set up MariaDB** database server
3. **Deploy MariaDB edition** with database configuration
4. **Import data** using provided migration scripts
5. **Configure users** and permissions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 **Documentation**: [Full Documentation](https://github.com/N85UK/UNRAID_Apps/tree/main/Apps/AWS_EUM_MariaDB)
- 🐛 **Issues**: [GitHub Issues](https://github.com/N85UK/UNRAID_Apps/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/N85UK/UNRAID_Apps/discussions)

---

**AWS End User Messaging MariaDB Edition** - Enterprise messaging built for scale 🏢

### ✨ **AWS Auto-Discovery**
- **Automatic phone number detection** - Pulls all available phone numbers from your AWS account
- **Real-time originator refresh** - Click refresh to update available numbers
- **Smart caching** - Reduces AWS API calls while keeping data fresh

### 📱 **Enhanced Message Support**
- **Long message support** - Send messages up to 1,600 characters
- **Automatic SMS segmentation** - Long messages split into multiple SMS segments
- **Real-time cost estimation** - See how many SMS segments your message will use
- **Message preview** - See exactly how your long message will be split

### 🛡️ **Security & Rate Limiting**
- **Rate limiting** - Prevents SMS abuse with configurable limits
- **Enhanced security** - Helmet.js security headers and CSP
- **Input validation** - Comprehensive validation for all inputs
- **Error handling** - Better error messages and recovery

### 🔧 **UNRAID Integration**
- **Full configuration interface** - Configure everything through UNRAID
- **Dropdown region selection** - Easy AWS region selection
- **Secure credential storage** - AWS credentials stored securely
- **Health monitoring** - Built-in health checks and status monitoring

## 📋 Features

### Core Functionality
- ✅ **Send SMS messages** via AWS Pinpoint SMS service
- ✅ **Automatic AWS integration** - Discovers your phone numbers
- ✅ **Long message support** - Up to 1,600 characters with auto-segmentation
- ✅ **Message history** - Track all sent messages with details
- ✅ **Real-time feedback** - Character counts, segment info, cost estimates

### AWS Integration
- ✅ **Auto-discovery** - Automatically finds your AWS phone numbers
- ✅ **Multiple originators** - Support for multiple phone numbers/sender IDs
- ✅ **Region support** - Works with all AWS regions that support Pinpoint SMS
- ✅ **Manual override** - Option to manually configure originators

### Security & Reliability
- ✅ **Rate limiting** - Configurable SMS per minute limits
- ✅ **Input validation** - Comprehensive validation and sanitization
- ✅ **Error handling** - Graceful error handling and user feedback
- ✅ **Health monitoring** - Built-in health checks and status endpoints

### UNRAID Specific
- ✅ **Complete UNRAID template** - Full configuration through Community Applications
- ✅ **Secure storage** - AWS credentials encrypted and stored securely
- ✅ **Easy installation** - One-click install through Community Applications
- ✅ **Resource limits** - Configurable memory and CPU limits

## 🛠️ Installation

### Via UNRAID Community Applications (Recommended)

1. **Install from Community Applications**:
   - Search for "AWS EUM" in Community Applications
   - Click Install
   - Configure your AWS credentials

2. **Configuration**:
   - **AWS Access Key ID**: Your AWS access key
   - **AWS Secret Access Key**: Your AWS secret key  
   - **AWS Region**: Select your AWS region
   - **Rate Limit**: SMS per minute (default: 10)
   - **Max Message Length**: Maximum characters (default: 1600)

3. **Access**:
   - Navigate to `http://[unraid-ip]:8280`
   - Your phone numbers will be automatically loaded from AWS

### Manual Docker Installation

```bash
docker run -d \
  --name aws-eum \
  -p 8280:80 \
  -e AWS_ACCESS_KEY_ID=your_access_key \
  -e AWS_SECRET_ACCESS_KEY=your_secret_key \
  -e AWS_REGION=eu-west-2 \
  -v /path/to/data:/app/data \
  ghcr.io/n85uk/aws-eum:2.0
```

## 📖 Usage

### Basic SMS Sending

1. **Open the web interface** at `http://[server-ip]:8280`
2. **Select phone number** - Choose from auto-discovered AWS numbers
3. **Enter destination** - Include country code (e.g., +447700900000)
4. **Write message** - Up to 1,600 characters supported
5. **Monitor segments** - See real-time segment count and cost estimate
6. **Send** - Click send and get immediate confirmation

### Long Message Handling

- **Automatic segmentation**: Messages over 160 characters are automatically split
- **Segment preview**: See exactly how your message will be split before sending
- **Cost awareness**: Real-time display of how many SMS segments will be used
- **Character limits**: Support up to 1,600 characters (about 10 SMS segments)

### Phone Number Management

- **Auto-discovery**: App automatically finds your AWS phone numbers
- **Refresh**: Click refresh to update available numbers
- **Manual override**: Optionally configure additional numbers manually
- **Multiple types**: Supports phone numbers, short codes, and sender IDs

## ⚙️ Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `AWS_ACCESS_KEY_ID` | - | AWS access key (required) |
| `AWS_SECRET_ACCESS_KEY` | - | AWS secret key (required) |
| `AWS_REGION` | `eu-west-2` | AWS region |
| `PORT` | `80` | Application port |
| `RATE_LIMIT_MESSAGES` | `10` | SMS per minute limit |
| `MAX_MESSAGE_LENGTH` | `1600` | Max characters per message |
| `HISTORY_RETENTION` | `100` | Number of messages to keep |
| `ORIGINATORS` | - | Manual originators (optional) |
| `ENABLE_DEBUG` | `false` | Enable debug logging |

### AWS Permissions

Your AWS user needs these permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "pinpoint:SendMessages",
                "pinpoint:SendUsersMessages",
                "sms-voice:SendTextMessage",
                "sms-voice:DescribeOriginationIdentities",
                "sms-voice:DescribePhoneNumbers"
            ],
            "Resource": "*"
        }
    ]
}
```

### Testing Configuration

Run the configuration test:

```bash
docker exec aws-eum npm run test
```

## 🔧 Troubleshooting

### Common Issues

**No phone numbers showing:**
- Check AWS credentials are correct
- Verify IAM permissions include SMS permissions
- Ensure correct AWS region
- Click "Refresh Numbers" to retry

**Messages not sending:**
- Verify destination number format (+country code)
- Check AWS account has SMS sending enabled
- Verify rate limits not exceeded
- Check AWS CloudWatch logs

**Configuration errors:**
- Run `npm run test` to test AWS connectivity
- Check UNRAID logs for detailed error messages
- Verify AWS region supports Pinpoint SMS

### Debug Mode

Enable debug logging:
```bash
# In UNRAID template
ENABLE_DEBUG=true
```

### Health Monitoring

Check application health:
```bash
curl http://[server-ip]:8280/health
```

## 🔒 Security

### Best Practices

- **Secure credentials**: Store AWS credentials securely in UNRAID
- **Rate limiting**: Configure appropriate SMS limits to prevent abuse
- **Network security**: Run behind reverse proxy if exposing externally
- **Regular updates**: Keep the application updated

### Built-in Security

- **Content Security Policy**: Prevents XSS attacks
- **Input validation**: All inputs validated and sanitized
- **Rate limiting**: Prevents SMS abuse
- **Non-root user**: Container runs as non-root user
- **Health checks**: Monitor application health

## 📊 Monitoring

### Health Endpoints

- `/health` - Application health status
- `/api/config` - Configuration status
- `/api/originators` - Available phone numbers

### Metrics

- SMS sent count
- Message segment usage
- Error rates
- AWS API response times

## 🔄 Migration from v1.0

### Automatic Migration

Version 2.0 is fully backward compatible:

1. **Stop v1.0 container**
2. **Update to v2.0 image**
3. **Add new environment variables** (optional)
4. **Start container**

Your existing message history will be preserved.

### New Features Available

After upgrading, you'll have access to:
- Auto-discovery of AWS phone numbers
- Long message support
- Enhanced security features
- Better error handling
- Real-time segment calculations

## 📄 License

MIT License - see [LICENSE](LICENSE) file.

## 🤝 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/N85UK/UNRAID_Apps/issues)
- **UNRAID Forums**: Community support
- **Documentation**: See included documentation files

## 🏗️ Development

### Building from Source

```bash
git clone https://github.com/N85UK/UNRAID_Apps.git
cd UNRAID_Apps/Apps/AWS_EUM
docker build -t aws-eum:2.0 .
```

### Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

---

**AWS End User Messaging v2.0** - Enhanced SMS messaging with full UNRAID integration