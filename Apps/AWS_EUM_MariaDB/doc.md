%name: AWS End User Messaging MariaDB (Enterprise)
%slug: AWS_EUM_MariaDB
%version: 1.0.0
%author: N85UK
%category: Utilities
%description: Enterprise SMS web application with multi-user authentication, role-based access control, and MariaDB/MySQL database integration for team environments.

# AWS End User Messaging MariaDB - Enterprise Edition

This template deploys the AWS EUM MariaDB Enterprise edition with advanced multi-user authentication, role-based access control, and external database integration. Designed for organizations requiring team-based SMS management with comprehensive audit trails and user management.

## 🏢 Enterprise Features

### Multi-User Authentication

- **JWT Authentication**: Secure token-based authentication with bcrypt password hashing
- **Role-Based Access Control**: Admin, User, and ReadOnly permission levels
- **Session Management**: Secure session handling with automatic timeout
- **User Registration**: Admin-controlled user account creation and management
- **Password Security**: Encrypted password storage with bcrypt hashing

### Advanced Database Integration

- **External Database**: MariaDB/MySQL database support for scalable data storage
- **Connection Pooling**: Optimized database connections for high performance
- **Automated Migrations**: Database schema setup and updates during startup
- **Data Persistence**: All user data, messages, and settings stored in database
- **Backup Ready**: Standard database backup and recovery procedures

### Enterprise Security

- **API Key Management**: Programmatic access with secure API keys
- **Comprehensive Audit Trails**: Detailed logging of all user actions and message activity
- **Permission Inheritance**: Fine-grained access control for different user roles
- **Security Headers**: Advanced security headers and CSRF protection
- **Input Validation**: Enterprise-grade input sanitization and validation

## 👥 User Role System

### Admin Role

- **Full System Access**: Complete control over all features and settings
- **User Management**: Create, modify, and delete user accounts
- **Message Access**: View and manage all messages from all users
- **Analytics Dashboard**: Access to comprehensive system analytics and reporting
- **API Key Management**: Generate and manage system API keys
- **Configuration Control**: Modify system settings and AWS configuration

### User Role

- **Send Messages**: Full SMS sending capabilities via AWS Pinpoint
- **Personal History**: View and manage own message history
- **Basic Analytics**: Personal usage statistics and cost tracking
- **Profile Management**: Update own profile and password
- **Limited Access**: Cannot access other users' data or system settings

### ReadOnly Role

- **View Messages**: Read-only access to allowed message data
- **View Analytics**: Access to analytics dashboards without modification rights
- **No Sending**: Cannot send SMS messages or modify any data
- **Audit Access**: Can view audit logs and system reports
- **Research Role**: Perfect for compliance officers or data analysts

## 🔧 Environment Variables

### Required AWS Configuration

- `AWS_ACCESS_KEY_ID` - AWS access key with Pinpoint permissions
- `AWS_SECRET_ACCESS_KEY` - AWS secret access key

### Required Database Configuration

- `DB_HOST` - MariaDB/MySQL database host
- `DB_PORT` (default: 3306) - Database port
- `DB_NAME` - Database name for the application
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password

### Optional Configuration

- `AWS_REGION` (default: eu-west-2) - AWS region for Pinpoint service
- `PORT` (default: 80) - Application port
- `ORIGINATORS` - Comma-separated list of custom originators (label:arn format)
- `JWT_SECRET` - JWT token secret (auto-generated if not provided)
- `SESSION_TIMEOUT` (default: 24) - Session timeout in hours
- `BCRYPT_ROUNDS` (default: 12) - Password hashing complexity
- `API_RATE_LIMIT` (default: 100) - API requests per hour per user

## 🐳 Docker Deployment

### Image

- **Repository**: `ghcr.io/n85uk/aws-eum-mariadb:latest`
- **Architecture**: x86_64, ARM64
- **Base**: Alpine Linux for security and minimal footprint

### Required External Services

- **MariaDB/MySQL**: External database server (not included in container)

### Volumes

- `/app/data` - Application data and logs (mount to UNRAID appdata)
- `/app/uploads` - File uploads and attachments

### Ports

- `80` - Web interface (map to desired host port)

### Dependencies

- MariaDB 10.5+ or MySQL 8.0+ database server
- Network access to AWS Pinpoint service

## 🗄️ Database Schema

### Advanced 7-Table Structure

- **users**: User accounts with encrypted passwords and role assignments
- **messages**: SMS message records with sender tracking and delivery status
- **audit_logs**: Comprehensive audit trail of all user actions
- **api_keys**: Secure API key management with permission scoping
- **user_sessions**: Active session tracking and management
- **system_settings**: Application configuration and AWS settings
- **message_analytics**: Advanced analytics data with aggregated statistics

### Database Features

- **Foreign Key Constraints**: Ensure data integrity across all tables
- **Indexes**: Optimized for performance on large datasets
- **Timestamps**: Automatic creation and update tracking
- **Soft Deletes**: Preserve audit trail for deleted records
- **Data Migration**: Seamless upgrades with automatic schema updates

## 🚀 GitHub Actions Integration

Enterprise CI/CD pipeline:

- **Triggers**: Push to main branch, releases, manual dispatch
- **Registry**: GitHub Container Registry (ghcr.io)
- **Multi-platform**: Supports x86_64 and ARM64 architectures
- **Security Scanning**: Automated vulnerability scanning and dependency auditing
- **Database Testing**: Integration tests with MariaDB containers
- **Quality Gates**: Code quality checks and security validation

## 📊 Enterprise Analytics

### Advanced Reporting

- **User Activity Dashboard**: Track user engagement and message volume
- **Cost Analytics**: Detailed AWS cost breakdown by user and department
- **Usage Trends**: Historical analysis with forecasting capabilities
- **Performance Metrics**: System performance and response time monitoring
- **Audit Reports**: Compliance-ready audit trails and user activity reports

### Real-time Monitoring

- **Live Dashboard**: Real-time system status and user activity
- **WebSocket Updates**: Live updates for administrators
- **Alert System**: Configurable alerts for system events and thresholds
- **Health Checks**: Continuous monitoring of system components

## 🔒 Security Features

### Enterprise-Grade Security

- **Password Policies**: Configurable password complexity requirements
- **Account Lockout**: Automatic lockout after failed login attempts
- **Session Security**: Secure session management with timeout controls
- **API Security**: Rate limiting and API key-based authentication
- **Data Encryption**: Encrypted storage of sensitive data
- **Compliance Ready**: Meets enterprise security and compliance requirements

### Audit and Compliance

- **Full Audit Trail**: Complete logging of all user actions and system events
- **Data Retention**: Configurable data retention policies
- **Export Capabilities**: Export audit logs and reports for compliance
- **Role Separation**: Clear separation of duties between admin and user roles

## 🎯 Target Organizations

### Enterprise Use Cases

- **Corporate Teams**: Multi-department SMS management with role-based access
- **Service Providers**: Customer communication platforms with user management
- **Compliance Organizations**: Environments requiring detailed audit trails
- **Development Teams**: Multi-user development and testing environments
- **Support Teams**: Customer service teams with message tracking and analytics

### Scalability

- **Team Size**: Supports 5-500+ users depending on database configuration
- **Message Volume**: Handles high-volume SMS campaigns with database optimization
- **Geographic Distribution**: Multi-region support with database replication
- **Integration Ready**: API endpoints for integration with existing enterprise systems

## 📈 Usage Statistics

- **GitHub Actions**: ✅ All workflows building successfully with enterprise testing
- **Container Registry**: Available on GHCR with multi-architecture support
- **Database Support**: Tested with MariaDB 10.5+ and MySQL 8.0+
- **Version**: 1.0.0 (Enterprise Edition)
- **Last Updated**: October 2025
- **Status**: Production Ready for Enterprise Deployment

## 🛠️ Setup Requirements

### Minimum System Requirements

- **Database Server**: MariaDB 10.5+ or MySQL 8.0+ with 2GB+ RAM
- **Application Server**: 512MB RAM minimum, 1GB+ recommended
- **Storage**: 10GB+ for database growth and application data
- **Network**: Reliable connectivity to AWS services and database

### Recommended Architecture

- **Load Balancer**: For high-availability deployments
- **Database Clustering**: Master-slave replication for data redundancy
- **Backup Strategy**: Regular database backups with point-in-time recovery
- **Monitoring**: Application and database monitoring with alerting

---

**Copyright (c) 2025 N85UK - Licensed under MIT License**
**Enterprise Edition with Multi-User Authentication and Database Integration**
