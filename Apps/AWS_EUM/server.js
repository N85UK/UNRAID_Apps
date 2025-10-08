const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const { 
    PinpointSMSVoiceV2Client, 
    SendTextMessageCommand,
    DescribePhoneNumbersCommand,
    DescribeSenderIdsCommand
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

// Message history and cache
let messageHistory = [];
let cachedOriginators = null;
let cacheExpiry = 0;

// Rate limiting
const HISTORY_RETENTION = parseInt(process.env.HISTORY_RETENTION) || 100;

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
    hsts: false, // Disable HTTPS strict transport security
}));

// Force HTTP headers (disable any HTTPS redirects)
app.use((req, res, next) => {
    // Remove any HTTPS enforcement headers
    res.removeHeader('Strict-Transport-Security');
    // Ensure we're serving over HTTP
    res.setHeader('X-Forwarded-Proto', 'http');
    // Fix CORS and origin issues
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'false');
    next();
});

// Rate limiting
const rateLimiter = new RateLimiterMemory({
    keyPrefix: 'sms_send',
    points: parseInt(process.env.RATE_LIMIT_MESSAGES) || 10, // Messages per window
    duration: 60, // per 60 seconds
});

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.set('view engine', 'ejs');

// Static files with multiple approaches to ensure they work
// Method 1: Standard express.static
app.use('/css', express.static(path.join(__dirname, 'public', 'css'), {
    setHeaders: (res, path) => {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=3600');
    }
}));

app.use('/js', express.static(path.join(__dirname, 'public', 'js'), {
    setHeaders: (res, path) => {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=3600');
    }
}));

// Method 2: Explicit routes for critical files
app.get('/css/style.css', (req, res) => {
    const cssPath = path.join(__dirname, 'public', 'css', 'style.css');
    console.log(`🎨 CSS requested: ${req.url} from ${req.ip}`);
    console.log(`📄 CSS path: ${cssPath}`);
    console.log(`📋 User-Agent: ${req.get('User-Agent')}`);
    
    if (fs.existsSync(cssPath)) {
        try {
            const cssContent = fs.readFileSync(cssPath, 'utf8');
            console.log(`✅ CSS loaded: ${cssContent.length} characters`);
            
            // Set all possible CSS headers
            res.setHeader('Content-Type', 'text/css; charset=utf-8');
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('Access-Control-Allow-Origin', '*');
            
            res.send(cssContent);
        } catch (error) {
            console.error('❌ Error reading CSS file:', error);
            res.status(500).send('Error reading CSS file');
        }
    } else {
        console.error(`❌ CSS file not found: ${cssPath}`);
        res.status(404).send('CSS file not found');
    }
});

app.get('/js/app.js', (req, res) => {
    const jsPath = path.join(__dirname, 'public', 'js', 'app.js');
    if (fs.existsSync(jsPath)) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.sendFile(jsPath);
    } else {
        res.status(404).send('JS file not found');
    }
});

// Method 3: General static file serving as fallback
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css; charset=utf-8');
        } else if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        } else if (filePath.endsWith('.ico')) {
            res.setHeader('Content-Type', 'image/x-icon');
        }
        res.setHeader('Cache-Control', 'public, max-age=3600');
    }
}));

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

// Initialize AWS client\ninitializeAWSClient();\n\n// Cache for AWS data (using variables declared above)\nconst CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch originators from AWS
// Function to fetch originators from AWS
async function fetchOriginatorsFromAWS() {
  try {
    console.log('🔍 Fetching originators from AWS...');
    
    if (!smsClient) {
      console.error('❌ SMS client not initialized');
      return [];
    }
    
    let allOriginators = [];
    
    // Fetch Phone Numbers
    try {
      console.log('📱 Fetching phone numbers...');
      const phoneCommand = new DescribePhoneNumbersCommand({});
      const phoneResponse = await smsClient.send(phoneCommand);
      
      const phoneNumbers = phoneResponse.PhoneNumbers
        ?.filter(phoneNumber => phoneNumber.PhoneNumber)
        ?.map(phoneNumber => {
          // Extract country from phone number if country code is missing
          let country = phoneNumber.PhoneNumberCountryCode;
          if (!country && phoneNumber.PhoneNumber.startsWith('+44')) {
            country = 'GB';
          } else if (!country && phoneNumber.PhoneNumber.startsWith('+1')) {
            country = 'US';
          } else if (!country) {
            country = 'Unknown';
          }
          
          return {
            value: phoneNumber.PhoneNumber,
            name: `${phoneNumber.PhoneNumber} (Phone Number - ${country})`,
            type: 'PhoneNumber',
            country: country
          };
        }) || [];
      
      allOriginators = allOriginators.concat(phoneNumbers);
      console.log(`📱 Found ${phoneNumbers.length} phone numbers`);
    } catch (phoneError) {
      console.error('❌ Error fetching phone numbers:', phoneError.message);
    }
    
    // Fetch Sender IDs
    try {
      console.log('🏷️  Fetching sender IDs...');
      const senderCommand = new DescribeSenderIdsCommand({});
      const senderResponse = await smsClient.send(senderCommand);
      
      console.log('� Sender ID response keys:', Object.keys(senderResponse));
      console.log('📋 Number of sender IDs found:', senderResponse.SenderIds?.length || 0);
      
      const senderIds = senderResponse.SenderIds
        ?.filter(senderId => senderId.SenderId)
        ?.map(senderId => ({
          value: senderId.SenderId,
          name: `${senderId.SenderId} (Sender ID - ${senderId.IsoCountryCode || 'Unknown'})`,
          type: 'SenderId',
          country: senderId.IsoCountryCode
        })) || [];
      
      allOriginators = allOriginators.concat(senderIds);
      console.log(`🏷️  Found ${senderIds.length} sender IDs`);
    } catch (senderError) {
      console.error('❌ Error fetching sender IDs:', senderError.message);
      console.error('� Error code:', senderError.code || 'unknown');
      console.error('🔧 Error name:', senderError.name || 'unknown');
      // Don't fail completely if sender IDs can't be fetched
    }
    
    console.log(`✅ Total found: ${allOriginators.length} originators (${allOriginators.filter(o => o.type === 'PhoneNumber').length} phone numbers, ${allOriginators.filter(o => o.type === 'SenderId').length} sender IDs)`);
    return allOriginators;
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
      console.error('   • Required permissions: pinpoint-sms-voice-v2:DescribePhoneNumbers, pinpoint-sms-voice-v2:DescribeSenderIds');
      console.error('   • Check your IAM user or role has the correct policies');
    } else if (error.message.includes('region')) {
      console.error('🌍 AWS Region Issue:');
      console.error(`   • Current region: ${process.env.AWS_REGION || 'eu-west-2'}`);
      console.error('   • Ensure your phone numbers and sender IDs are in this region');
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
            aws_originators: Object.keys(originators).filter(k => !k.includes('Manual')).length,
            aws_phone_numbers: Object.keys(originators).filter(k => k.includes('Phone Number')).length,
            aws_sender_ids: Object.keys(originators).filter(k => k.includes('Sender ID')).length
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
        const count = Object.keys(originators).length;
        
        res.json({
            success: true,
            count: count,
            originators: originators,
            message: `Found ${count} originators`
        });
    } catch (error) {
        console.error('Error fetching originators:', error);
        res.status(500).json({ 
            success: false,
            error: error.message,
            count: 0,
            originators: {}
        });
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
        
        let phoneNumbers = 0;
        let senderIds = 0;
        let errors = [];
        
        // Test phone numbers
        try {
            const phoneCommand = new DescribePhoneNumbersCommand({ MaxResults: 10 });
            const phoneResponse = await smsClient.send(phoneCommand);
            phoneNumbers = phoneResponse.PhoneNumbers?.length || 0;
        } catch (phoneError) {
            errors.push(`Phone Numbers: ${phoneError.message}`);
        }
        
        // Test sender IDs
        try {
            const senderCommand = new DescribeSenderIdsCommand({ MaxResults: 10 });
            const senderResponse = await smsClient.send(senderCommand);
            senderIds = senderResponse.SenderIds?.length || 0;
        } catch (senderError) {
            errors.push(`Sender IDs: ${senderError.message}`);
        }
        
        res.json({
            success: errors.length === 0,
            configured: true,
            region: process.env.AWS_REGION || 'eu-west-2',
            phoneNumbers: phoneNumbers,
            senderIds: senderIds,
            totalOriginators: phoneNumbers + senderIds,
            errors: errors,
            message: errors.length === 0 ? 'AWS connection successful' : 'Partial connection issues'
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
                'Required: pinpoint-sms-voice-v2:DescribeSenderIds',
                'Check IAM policies'
            ];
        } else if (error.message.includes('region')) {
            errorType = 'region';
            suggestions = [
                `Current region: ${process.env.AWS_REGION || 'eu-west-2'}`,
                'Ensure originators exist in this region',
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

// Debug route for static file issues
app.get('/api/debug/static', (req, res) => {
    const path = require('path');
    
    try {
        const publicDir = path.join(__dirname, 'public');
        const cssDir = path.join(publicDir, 'css');
        const jsDir = path.join(publicDir, 'js');
        const cssFile = path.join(cssDir, 'style.css');
        const jsFile = path.join(jsDir, 'app.js');
        
        const files = {
            __dirname: __dirname,
            publicDir: publicDir,
            publicExists: fs.existsSync(publicDir),
            cssDir: cssDir,
            cssExists: fs.existsSync(cssFile),
            cssSize: fs.existsSync(cssFile) ? fs.statSync(cssFile).size : 0,
            jsDir: jsDir,
            jsExists: fs.existsSync(jsFile),
            jsSize: fs.existsSync(jsFile) ? fs.statSync(jsFile).size : 0,
            protocol: req.protocol,
            host: req.get('host'),
            baseUrl: req.baseUrl,
            originalUrl: req.originalUrl
        };
        
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Test route for CSS content
app.get('/api/debug/css-content', (req, res) => {
    const cssPath = path.join(__dirname, 'public', 'css', 'style.css');
    if (fs.existsSync(cssPath)) {
        const content = fs.readFileSync(cssPath, 'utf8');
        res.setHeader('Content-Type', 'text/plain');
        res.send(content.substring(0, 500) + '...'); // First 500 chars
    } else {
        res.status(404).send('CSS file not found at: ' + cssPath);
    }
});

// Test route with embedded CSS to verify styling
app.get('/api/debug/test-css', (req, res) => {
    const testHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>CSS Test</title>
        <style>
            body { font-family: Arial; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); margin: 0; padding: 20px; }
            .test-container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
            h1 { color: #232f3e; text-align: center; }
            .status { padding: 10px; background: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; color: #155724; }
        </style>
    </head>
    <body>
        <div class="test-container">
            <h1>🎨 CSS Test Page</h1>
            <div class="status">✅ If you see this styled properly, CSS rendering works!</div>
            <p>This page has embedded CSS to test if the browser can render styles correctly.</p>
            <a href="/">← Back to main page</a>
        </div>
    </body>
    </html>`;
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(testHtml);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 AWS EUM v${CURRENT_VERSION} server running on port ${PORT}`);
    console.log(`🌐 HTTP Server: http://0.0.0.0:${PORT}`);
    console.log(`🌍 AWS Region: ${process.env.AWS_REGION || 'eu-west-2'}`);
    
    // Verify static file structure
    const publicDir = path.join(__dirname, 'public');
    const cssFile = path.join(publicDir, 'css', 'style.css');
    const jsFile = path.join(publicDir, 'js', 'app.js');
    
    console.log(`📁 Public directory: ${publicDir}`);
    console.log(`📄 CSS file exists: ${fs.existsSync(cssFile)} (${cssFile})`);
    console.log(`📄 JS file exists: ${fs.existsSync(jsFile)} (${jsFile})`);
    
    if (fs.existsSync(cssFile)) {
        const cssSize = fs.statSync(cssFile).size;
        console.log(`📊 CSS file size: ${cssSize} bytes`);
    }
    
    const awsConfigured = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
    console.log(`🔐 AWS Configured: ${awsConfigured}`);
    
    if (awsConfigured) {
        const accessKey = process.env.AWS_ACCESS_KEY_ID;
        console.log(`🔑 AWS Access Key: ${accessKey.substring(0, 4)}****${accessKey.substring(accessKey.length - 4)}`);
        console.log(`💡 Test AWS connection at: http://0.0.0.0:${PORT}/api/aws/test`);
    } else {
        console.log('⚠️  Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY to enable AWS features');
    }
    
    console.log(`🔄 Auto-update: ${AUTO_UPDATE_CHECK ? 'enabled' : 'disabled'}`);
    console.log(`🧪 Debug static files: http://0.0.0.0:${PORT}/api/debug/static`);
    console.log(`🎨 CSS direct access: http://0.0.0.0:${PORT}/css/style.css`);
    
    // Start update checker
    startUpdateChecker();
    
    // Initial fetch of originators
    if (smsClient) {
        getOriginators().then(originators => {
            console.log(`📞 Total originators available: ${Object.keys(originators).length}`);
        });
    }
});