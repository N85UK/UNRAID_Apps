const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const { 
    PinpointSMSVoiceV2Client, 
    SendTextMessageCommand,
    DescribePhoneNumbersCommand
} = require('@aws-sdk/client-pinpoint-sms-voice-v2');
const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 80;

// Auto-update configuration
const AUTO_UPDATE_CHECK = process.env.AUTO_UPDATE_CHECK !== 'false';
const UPDATE_CHECK_INTERVAL = parseInt(process.env.UPDATE_CHECK_INTERVAL) || 24; // hours
const AUTO_UPDATE_APPLY = process.env.AUTO_UPDATE_APPLY === 'true';
const CURRENT_VERSION = '2.0.0';
const GITHUB_REPO = 'N85UK/UNRAID_Apps';
const UPDATE_FILE = '/app/data/update-info.json';

// Update checking state
let updateInfo = { available: false, version: null, url: null, lastCheck: 0 };
let updateCheckTimer = null;

// AWS Client
let smsClient = null;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// Rate limiting
const rateLimiter = new RateLimiterMemory({
    keyPrefix: 'sms_send',
    points: 10, // 10 SMS per window
    duration: 60, // per 60 seconds
});

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// AWS Pinpoint SMS client (using the declaration from above)

function initializeAWSClient() {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        console.warn('⚠️  AWS credentials not configured');
        console.warn('Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables');
        return null;
    }

    // Validate credential format
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    
    if (accessKeyId.length < 16 || accessKeyId.length > 32) {
        console.warn('⚠️  AWS_ACCESS_KEY_ID appears to have invalid format');
    }
    
    if (secretAccessKey.length < 20) {
        console.warn('⚠️  AWS_SECRET_ACCESS_KEY appears to have invalid format');
    }

    try {
        smsClient = new PinpointSMSVoiceV2Client({
            region: process.env.AWS_REGION || 'eu-west-2',
            credentials: {
                accessKeyId: accessKeyId,
                secretAccessKey: secretAccessKey
            }
        });
        
        console.log('✅ AWS SMS client initialized successfully');
        console.log(`📍 Region: ${process.env.AWS_REGION || 'eu-west-2'}`);
        console.log(`🔑 Access Key: ${accessKeyId.substring(0, 4)}****${accessKeyId.substring(accessKeyId.length - 4)}`);
        
        return smsClient;
    } catch (error) {
        console.error('❌ Failed to initialize AWS client:', error.message);
        return null;
    }
}

// Initialize AWS client
initializeAWSClient();

// Cache for AWS data
let cachedOriginators = null;
let cacheExpiry = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch originators from AWS
// Function to fetch originators from AWS
async function fetchOriginatorsFromAWS() {
  try {
    console.log('🔍 Fetching originators from AWS...');
    
    if (!smsClient) {
      console.error('❌ SMS client not initialized');
      return [];
    }
    
    // Test AWS connectivity with a simple call first
    const command = new DescribePhoneNumbersCommand({});
    const response = await smsClient.send(command);
    
    const originators = response.PhoneNumbers
      ?.filter(phoneNumber => phoneNumber.PhoneNumber)
      ?.map(phoneNumber => ({
        value: phoneNumber.PhoneNumber,
        name: `${phoneNumber.PhoneNumber} (${phoneNumber.PhoneNumberCountryCode})`,
        type: 'PhoneNumber'
      })) || [];
    
    console.log(`✅ Found ${originators.length} phone numbers from AWS`);
    return originators;
  } catch (error) {
    console.error('❌ Error fetching originators from AWS:', error.message);
    
    // Provide specific guidance for common errors
    if (error.message.includes('security token')) {
      console.error('🔐 AWS Credential Issue:');
      console.error('   • Check that your AWS_ACCESS_KEY_ID is correct');
      console.error('   • Check that your AWS_SECRET_ACCESS_KEY is correct');
      console.error('   • Ensure credentials are not expired (if using temporary credentials)');
      console.error('   • Verify the credentials belong to the correct AWS account');
    } else if (error.message.includes('not authorized')) {
      console.error('🚫 AWS Permission Issue:');
      console.error('   • Your AWS user needs PinpointSMSVoice permissions');
      console.error('   • Required permission: pinpoint-sms-voice-v2:DescribePhoneNumbers');
      console.error('   • Check your IAM user or role has the correct policies');
    } else if (error.message.includes('region')) {
      console.error('🌍 AWS Region Issue:');
      console.error(`   • Current region: ${process.env.AWS_REGION || 'eu-west-2'}`);
      console.error('   • Ensure your phone numbers are in this region');
      console.error('   • Try changing AWS_REGION environment variable');
    } else {
      console.error('🔧 General AWS Error:');
      console.error(`   • Error code: ${error.code || 'unknown'}`);
      console.error(`   • Error type: ${error.name || 'unknown'}`);
    }
    
    return [];
  }
}

// Update checking functions
async function checkForUpdates() {
  if (!AUTO_UPDATE_CHECK) return null;
  
  try {
    console.log('🔍 Checking for updates...');
    
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}/releases/latest`,
      method: 'GET',
      headers: {
        'User-Agent': 'AWS-EUM-v2.0',
        'Accept': 'application/vnd.github.v3+json'
      }
    };
    
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const release = JSON.parse(data);
            const latestVersion = release.tag_name?.replace(/^v/, '') || release.name;
            const isNewer = latestVersion && latestVersion !== CURRENT_VERSION;
            
            const updateResult = {
              available: isNewer,
              version: latestVersion,
              currentVersion: CURRENT_VERSION,
              url: release.html_url,
              publishedAt: release.published_at,
              description: release.body,
              lastCheck: Date.now()
            };
            
            updateInfo = updateResult;
            saveUpdateInfo(updateResult);
            
            if (isNewer) {
              console.log(`🆕 Update available: v${latestVersion} (current: v${CURRENT_VERSION})`);
            } else {
              console.log('✅ Application is up to date');
            }
            
            resolve(updateResult);
          } catch (error) {
            console.error('Error parsing update response:', error.message);
            reject(error);
          }
        });
      });
      
      req.on('error', (error) => {
        console.error('Error checking for updates:', error.message);
        reject(error);
      });
      
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Update check timeout'));
      });
      
      req.end();
    });
  } catch (error) {
    console.error('Update check failed:', error.message);
    return null;
  }
}

function saveUpdateInfo(info) {
  try {
    const dataDir = path.dirname(UPDATE_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(UPDATE_FILE, JSON.stringify(info, null, 2));
  } catch (error) {
    console.error('Error saving update info:', error.message);
  }
}

function loadUpdateInfo() {
  try {
    if (fs.existsSync(UPDATE_FILE)) {
      const data = fs.readFileSync(UPDATE_FILE, 'utf8');
      updateInfo = JSON.parse(data);
      return updateInfo;
    }
  } catch (error) {
    console.error('Error loading update info:', error.message);
  }
  return updateInfo;
}

function startUpdateChecker() {
  if (!AUTO_UPDATE_CHECK) {
    console.log('📱 Auto-update checking disabled');
    return;
  }
  
  console.log(`📱 Auto-update checking enabled (every ${UPDATE_CHECK_INTERVAL} hours)`);
  
  // Load previous update info
  loadUpdateInfo();
  
  // Check immediately on startup
  setTimeout(() => checkForUpdates(), 5000);
  
  // Set up periodic checking
  updateCheckTimer = setInterval(() => {
    checkForUpdates();
  }, UPDATE_CHECK_INTERVAL * 60 * 60 * 1000);
}

// Get originators (AWS + manual config)
async function getOriginators() {
    let originators = {};

    // Get from AWS if available and cache is expired
    if (smsClient && (!cachedOriginators || Date.now() > cacheExpiry)) {
        const awsOriginators = await fetchOriginatorsFromAWS();
        
        // Convert array to object format
        awsOriginators.forEach(originator => {
            originators[originator.name] = originator.value;
        });
        
        // Cache the results
        cachedOriginators = originators;
        cacheExpiry = Date.now() + 30 * 60 * 1000; // 30 minutes
        
        console.log(`Cached ${awsOriginators.length} originators from AWS`);
    } else if (cachedOriginators) {
        originators = { ...originators, ...cachedOriginators };
    }

    // Add manual configuration
    const originatorsStr = process.env.ORIGINATORS || '';
    if (originatorsStr) {
        originatorsStr.split(',').forEach(pair => {
            const [label, arn] = pair.split(':');
            if (label && arn) {
                originators[`${label.trim()} (Manual)`] = arn.trim();
            }
        });
    }

    return originators;
}

// Calculate message segments (SMS can be up to 160 chars, longer messages are split)
function calculateMessageInfo(message) {
    const message_length = message.length;
    let segments = 1;
    let max_length = 160;

    if (message_length > 160) {
        // Multi-part messages have 153 chars per segment (7 chars for concatenation info)
        max_length = 153;
        segments = Math.ceil(message_length / max_length);
    }

    return {
        length: message_length,
        segments: segments,
        max_length: max_length,
        is_multipart: segments > 1,
        estimated_cost_multiplier: segments
    };
}

// Routes
app.get('/', async (req, res) => {
    try {
        const originators = await getOriginators();
        const history = getMessageHistory();
        const config = {
            aws_configured: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
            aws_region: process.env.AWS_REGION || 'eu-west-2',
            manual_originators: process.env.ORIGINATORS ? process.env.ORIGINATORS.split(',').length : 0,
            aws_originators: Object.keys(originators).filter(k => !k.includes('Manual')).length
        };
        res.render('index', { originators, history, config });
    } catch (error) {
        console.error('Error loading page:', error);
        res.render('index', { 
            originators: {}, 
            history: [], 
            config: { aws_configured: false, error: error.message }
        });
    }
});

app.get('/api/originators', async (req, res) => {
    try {
        const originators = await getOriginators();
        res.json(originators);
    } catch (error) {
        console.error('Error fetching originators:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/config', (req, res) => {
    res.json({
        aws_configured: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
        aws_region: process.env.AWS_REGION || 'eu-west-2',
        manual_originators: process.env.ORIGINATORS ? process.env.ORIGINATORS.split(',').length : 0,
        cache_status: cachedOriginators ? 'cached' : 'empty',
        cache_expires: new Date(cacheExpiry).toISOString()
    });
});

app.post('/api/message-info', (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }
    
    const info = calculateMessageInfo(message);
    res.json(info);
});

app.post('/send-sms', async (req, res) => {
    try {
        // Rate limiting
        await rateLimiter.consume(req.ip);

        const { originator, phoneNumber, message } = req.body;

        if (!originator || !phoneNumber || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (!smsClient) {
            return res.status(500).json({ error: 'AWS not configured. Please check your AWS credentials.' });
        }

        const originators = await getOriginators();
        const originationIdentity = originators[originator];

        if (!originationIdentity) {
            return res.status(400).json({ error: 'Invalid originator selected' });
        }

        // Calculate message info
        const messageInfo = calculateMessageInfo(message);

        const command = new SendTextMessageCommand({
            DestinationPhoneNumber: phoneNumber,
            OriginationIdentity: originationIdentity,
            MessageBody: message,
            MessageType: 'TRANSACTIONAL'
        });

        const result = await smsClient.send(command);

        // Save to history
        saveMessage({
            timestamp: new Date().toISOString(),
            originator,
            phoneNumber,
            message,
            messageId: result.MessageId,
            messageInfo: messageInfo
        });

        res.json({
            success: true,
            messageId: result.MessageId,
            messageInfo: messageInfo
        });

    } catch (error) {
        if (error.remainingHits !== undefined) {
            // Rate limit error
            return res.status(429).json({
                error: 'Rate limit exceeded. Please try again later.',
                retryAfter: Math.round(error.msBeforeNext / 1000)
            });
        }

        console.error('Error sending SMS:', error);
        res.status(500).json({
            error: error.message || 'Failed to send SMS'
        });
    }
});

app.get('/history', (req, res) => {
    const history = getMessageHistory();
    res.json(history);
});

app.post('/api/refresh-originators', async (req, res) => {
    try {
        // Force refresh cache
        cachedOriginators = null;
        cacheExpiry = 0;
        
        const originators = await getOriginators();
        res.json({
            success: true,
            count: Object.keys(originators).length,
            originators: originators
        });
    } catch (error) {
        console.error('Error refreshing originators:', error);
        res.status(500).json({ error: error.message });
    }
});

// Helper functions
function getMessageHistory() {
    try {
        const historyFile = path.join(dataDir, 'history.json');
        if (fs.existsSync(historyFile)) {
            const data = fs.readFileSync(historyFile, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error reading history:', error);
    }
    return [];
}

function saveMessage(message) {
    try {
        const history = getMessageHistory();
        history.unshift(message); // Add to beginning

        // Keep only last 100 messages
        if (history.length > 100) {
            history.splice(100);
        }

        const historyFile = path.join(dataDir, 'history.json');
        fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
    } catch (error) {
        console.error('Error saving message:', error);
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: CURRENT_VERSION,
        aws_configured: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
        originators_cached: !!cachedOriginators,
        updateAvailable: updateInfo.available
    });
});

// Update check endpoint
app.get('/api/updates/check', async (req, res) => {
    try {
        const result = await checkForUpdates();
        res.json(result || updateInfo);
    } catch (error) {
        res.status(500).json({ error: 'Failed to check for updates' });
    }
});

// Get update status
app.get('/api/updates/status', (req, res) => {
    res.json(updateInfo);
});

// AWS credential testing endpoint
app.get('/api/aws/test', async (req, res) => {
    try {
        if (!smsClient) {
            return res.status(500).json({ 
                error: 'AWS client not initialized',
                configured: false,
                message: 'Check AWS credentials are set'
            });
        }
        
        // Test basic AWS connectivity
        const command = new DescribePhoneNumbersCommand({ MaxResults: 1 });
        const response = await smsClient.send(command);
        
        res.json({
            success: true,
            configured: true,
            region: process.env.AWS_REGION || 'eu-west-2',
            phoneNumbers: response.PhoneNumbers?.length || 0,
            message: 'AWS connection successful'
        });
    } catch (error) {
        let errorType = 'unknown';
        let suggestions = [];
        
        if (error.message.includes('security token')) {
            errorType = 'credentials';
            suggestions = [
                'Check AWS_ACCESS_KEY_ID is correct',
                'Check AWS_SECRET_ACCESS_KEY is correct',
                'Ensure credentials are not expired'
            ];
        } else if (error.message.includes('not authorized')) {
            errorType = 'permissions';
            suggestions = [
                'User needs PinpointSMSVoice permissions',
                'Required: pinpoint-sms-voice-v2:DescribePhoneNumbers',
                'Check IAM policies'
            ];
        } else if (error.message.includes('region')) {
            errorType = 'region';
            suggestions = [
                `Current region: ${process.env.AWS_REGION || 'eu-west-2'}`,
                'Ensure phone numbers exist in this region',
                'Try different AWS_REGION'
            ];
        }
        
        res.status(500).json({
            success: false,
            configured: true,
            error: error.message,
            errorType: errorType,
            suggestions: suggestions
        });
    }
});

// Webhook endpoint for GitHub releases
app.post('/api/webhook/update', (req, res) => {
    try {
        const { action, release } = req.body;
        
        if (action === 'published' && release) {
            console.log('🚀 New release webhook received:', release.tag_name);
            
            // Trigger immediate update check
            setTimeout(() => checkForUpdates(), 1000);
            
            res.json({ status: 'webhook received' });
        } else {
            res.json({ status: 'ignored' });
        }
    } catch (error) {
        console.error('Webhook error:', error.message);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 AWS EUM v${CURRENT_VERSION} server running on port ${PORT}`);
    console.log(`🌍 AWS Region: ${process.env.AWS_REGION || 'eu-west-2'}`);
    
    const awsConfigured = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
    console.log(`🔐 AWS Configured: ${awsConfigured}`);
    
    if (awsConfigured) {
        const accessKey = process.env.AWS_ACCESS_KEY_ID;
        console.log(`🔑 AWS Access Key: ${accessKey.substring(0, 4)}****${accessKey.substring(accessKey.length - 4)}`);
        console.log('💡 Test AWS connection at: /api/aws/test');
    } else {
        console.log('⚠️  Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY to enable AWS features');
    }
    
    console.log(`🔄 Auto-update: ${AUTO_UPDATE_CHECK ? 'enabled' : 'disabled'}`);
    
    // Start update checker
    startUpdateChecker();
    
    // Initial fetch of originators
    if (smsClient) {
        getOriginators().then(originators => {
            console.log(`📞 Total originators available: ${Object.keys(originators).length}`);
        });
    }
});