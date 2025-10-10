# AWS End User Messaging v3.0.1 - Enhanced UI Edition

🎨 **Beautiful interface with dark mode, Chart.js analytics, and configurable CSP for all network types**

## 🚀 **Production Ready - Auto-deployed via GitHub Actions**

✅ **Status**: Production ready with CSP fixes for custom bridge networks  
📦 **Docker Image**: `ghcr.io/n85uk/aws-eum-v3:3.0.1`  
🔄 **CI/CD**: Automated builds with Alpine Linux optimization
🌐 **Network Support**: Default bridge, br0.2, br0.100, and all custom networks

## ✨ Enhanced Features in v3.0

### 🌙 **Advanced Dark Mode**
- Beautiful toggle between light and dark themes
- Automatic theme persistence across sessions
- System preference detection and automatic switching
- Optimized color schemes for readability in both modes

### 📊 **Real-time Analytics with Chart.js**
- **Dynamic charts** powered by Chart.js for beautiful data visualization
- **Message delivery metrics** with real-time updates
- **Cost analysis charts** showing spending trends over time
- **Interactive dashboards** with hover effects and animations
- **Performance metrics** displaying response times and success rates

### 🎨 **Modern Material Design**
- **Smooth animations** and micro-interactions
- **Enhanced typography** with Google Fonts integration
- **Responsive grid system** for perfect mobile adaptation
- **Material Design components** with elevation and shadows
- **Progressive enhancement** for all devices
- **Automatic phone number detection** - Pulls all available phone numbers from your AWS account
- **Real-time originator refresh** - Click refresh to update available numbers
- **Smart caching** - Reduces AWS API calls while keeping data fresh

### 📱 **Enhanced Message Support**
- **Long message support** - Send messages up to 1,600 characters
- **Automatic SMS segmentation** - Long messages split into multiple SMS segments
- **Real-time cost estimation** - See how many SMS segments your message will use
- **Message preview** - See exactly how your long message will be split

### 🛡️ **Enhanced Security & Performance**
- **Rate limiting** with `express-rate-limit` and `rate-limiter-flexible`
- **Helmet.js security** with comprehensive CSP and security headers
- **Advanced validation** with sanitization for all inputs
- **Error boundaries** with graceful degradation and recovery
- **Performance monitoring** with real-time metrics

### 🔧 **Improved UNRAID Integration**
- **Streamlined configuration** through UNRAID templates
- **Better health monitoring** with detailed status reporting
- **Enhanced logging** with structured output for debugging
- **Resource optimization** with Alpine Linux base image

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
| **CSP Configuration** | | **Content Security Policy Settings** |
| `DISABLE_CSP` | `false` | Disable CSP headers (allows external resources) |
| `NETWORK_HOST` | `http://10.0.2.11` | Network host for CSP whitelist |
| `CSP_POLICY` | - | Custom CSP policy as JSON (advanced) |

#### CSP Configuration Examples

For **custom bridge networks** (e.g., br0.2) where external CDNs are blocked:

```bash
# Recommended: Simple solution - disable CSP completely
DISABLE_CSP=true

# Alternative: Network-specific solution - whitelist your network
NETWORK_HOST=http://192.168.2.1

# Advanced: Custom permissive CSP policy (JSON format)
CSP_POLICY={"defaultSrc":["'self'","'unsafe-inline'","'unsafe-eval'","data:","http:","https:"],"styleSrc":["'self'","'unsafe-inline'","http:","https:","cdnjs.cloudflare.com","cdn.jsdelivr.net"],"scriptSrc":["'self'","'unsafe-inline'","'unsafe-eval'","http:","https:","cdnjs.cloudflare.com","cdn.jsdelivr.net"]}
```

**Quick Fix for br0.2 Networks:**
1. Add environment variable: `DISABLE_CSP=true`
2. Restart container
3. All features (charts, dark mode, icons) will work perfectly

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