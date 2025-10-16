const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { WebSocketServer } = require('ws');
const http = require('http');
const https = require('https');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { PinpointSMSVoiceV2Client, SendTextMessageCommand } = require('@aws-sdk/client-pinpoint-sms-voice-v2');
const { SNSClient } = require('@aws-sdk/client-sns');
const MessageDatabase = require('./database');

const APP_VERSION = '1.0.5';
const PORT = process.env.PORT || 80;
const DATA_DIR = process.env.DATA_DIR || '/app/data';

// Ensure data directory exists
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log(`📁 Created data directory: ${DATA_DIR}`);
  } else {
    console.log(`📁 Data directory exists: ${DATA_DIR}`);
  }
  
  // Test write permissions
  const testFile = path.join(DATA_DIR, '.write-test');
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
  console.log(`✅ Data directory is writable: ${DATA_DIR}`);
} catch (error) {
  console.error(`❌ ERROR: Cannot create/write to data directory: ${DATA_DIR}`);
  console.error(`   Error: ${error.message}`);
  console.error(`   User: ${process.getuid ? process.getuid() : 'unknown'}`);
  console.error(`   This is likely a volume mount permission issue.`);
  process.exit(1);
}

// Initialize AWS clients
const smsClient = new PinpointSMSVoiceV2Client({ 
  region: process.env.AWS_REGION || 'eu-west-2' 
});

// Initialize database
const dbPath = path.join(DATA_DIR, 'messages.db');
console.log(`💾 Database path: ${dbPath}`);
const db = new MessageDatabase(dbPath);

// Initialize Express
const app = express();
const server = http.createServer(app);

// Initialize WebSocket
const wss = new WebSocketServer({ server });

// Middleware
app.use(helmet({
  contentSecurityPolicy: process.env.DISABLE_CSP === 'true' ? false : {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  }
}));

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
// SNS sends messages with text/plain content-type
app.use(bodyParser.text({ type: 'text/plain', limit: '10mb' }));
app.use(express.static('public'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// WebSocket connection management
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('🔌 WebSocket client connected');
  clients.add(ws);

  ws.on('close', () => {
    console.log('🔌 WebSocket client disconnected');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
    clients.delete(ws);
  });
});

// Broadcast to all connected WebSocket clients
function broadcastMessage(data) {
  const message = JSON.stringify(data);
  clients.forEach((client) => {
    if (client.readyState === 1) { // OPEN
      client.send(message);
    }
  });
}

// Initialize configured phone numbers
const CONFIGURED_NUMBERS = [
  { phone: '+447418367358', label: 'Primary Two-Way Number' },
  { phone: '+447418373704', label: 'Secondary Two-Way Number' }
];

// Initialize phone numbers in database
(async () => {
  for (const num of CONFIGURED_NUMBERS) {
    try {
      db.addPhoneNumber(num.phone, num.label);
    } catch (err) {
      // Ignore duplicate errors
      if (!err.message.includes('UNIQUE')) {
        console.error('Error adding phone number:', err);
      }
    }
  }
  console.log('✅ Phone numbers initialized');
})();

// Routes

// Home page
app.get('/', (req, res) => {
  const stats = db.getStats();
  const phoneNumbers = db.getPhoneNumbers();
  res.render('index', { 
    version: APP_VERSION,
    stats,
    phoneNumbers
  });
});

// Get all conversations
app.get('/api/conversations', (req, res) => {
  try {
    const conversations = db.getConversations();
    res.json({ success: true, conversations });
  } catch (error) {
    console.error('❌ Error fetching conversations:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get conversation messages
app.get('/api/conversations/:phoneNumber/messages', (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const messages = db.getConversationMessages(phoneNumber);
    
    // Mark as read
    db.markConversationRead(phoneNumber);
    
    res.json({ success: true, messages });
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send SMS
app.post('/api/send', async (req, res) => {
  try {
    const { from, to, message } = req.body;

    if (!from || !to || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: from, to, message' 
      });
    }

    console.log(`📤 Sending SMS from ${from} to ${to}`);

    const command = new SendTextMessageCommand({
      DestinationPhoneNumber: to,
      OriginationIdentity: from,
      MessageBody: message
    });

    const result = await smsClient.send(command);
    
    // Save to database
    const messageId = db.saveMessage({
      message_id: result.MessageId,
      from_number: from,
      to_number: to,
      body: message,
      direction: 'outbound',
      status: 'sent',
      timestamp: Date.now()
    });

    // Broadcast to WebSocket clients
    broadcastMessage({
      type: 'message',
      data: {
        id: messageId,
        from_number: from,
        to_number: to,
        body: message,
        direction: 'outbound',
        timestamp: Date.now()
      }
    });

    res.json({ 
      success: true, 
      messageId: result.MessageId,
      dbId: messageId
    });

  } catch (error) {
    console.error('❌ Error sending SMS:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// SNS webhook endpoint for incoming SMS
app.post('/webhook/sms', async (req, res) => {
  try {
    console.log('📥 SNS webhook headers:', {
      'content-type': req.headers['content-type'],
      'x-amz-sns-message-type': req.headers['x-amz-sns-message-type'],
      'x-amz-sns-topic-arn': req.headers['x-amz-sns-topic-arn']
    });
    console.log('📥 SNS webhook body type:', typeof req.body);
    
    // Parse SNS message (can come as text/plain or application/json)
    let snsMessage;
    if (typeof req.body === 'string') {
      try {
        snsMessage = JSON.parse(req.body);
      } catch (e) {
        console.error('❌ Failed to parse SNS message:', req.body);
        return res.status(400).json({ success: false, error: 'Invalid JSON' });
      }
    } else {
      snsMessage = req.body;
    }

    console.log('📥 Received SNS webhook:', JSON.stringify(snsMessage, null, 2));

    // Handle SNS subscription confirmation
    if (req.headers['x-amz-sns-message-type'] === 'SubscriptionConfirmation' || snsMessage.Type === 'SubscriptionConfirmation') {
      const subscribeUrl = snsMessage.SubscribeURL;
      console.log('📝 SNS Subscription Confirmation URL:', subscribeUrl);
      
      if (subscribeUrl) {
        try {
          // Auto-confirm subscription by visiting the SubscribeURL
          const response = await new Promise((resolve, reject) => {
            https.get(subscribeUrl, (res) => {
              let data = '';
              res.on('data', chunk => data += chunk);
              res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
            }).on('error', reject);
          });
          
          console.log('✅ SNS Subscription confirmed automatically:', response.statusCode);
          return res.status(200).json({ 
            success: true, 
            message: 'Subscription confirmed',
            statusCode: response.statusCode
          });
        } catch (error) {
          console.error('❌ Failed to confirm subscription:', error.message);
          return res.status(200).json({ 
            success: false, 
            message: 'Failed to confirm subscription. Please visit: ' + subscribeUrl,
            error: error.message 
          });
        }
      } else {
        console.error('❌ SubscribeURL not found in message');
        return res.status(200).json({ 
          success: false, 
          message: 'SubscribeURL not found',
          receivedMessage: snsMessage
        });
      }
    }

    // Handle actual SMS notification
    if (req.headers['x-amz-sns-message-type'] === 'Notification' || snsMessage.Type === 'Notification') {
      // The Message field contains the actual SMS data as a JSON string
      const message = typeof snsMessage.Message === 'string' 
        ? JSON.parse(snsMessage.Message) 
        : snsMessage.Message;

      console.log('📨 Parsed SMS message:', JSON.stringify(message, null, 2));

      const inboundMessage = {
        message_id: message.messageId || `inbound_${Date.now()}`,
        from_number: message.originationNumber,
        to_number: message.destinationNumber,
        body: message.messageBody,
        direction: 'inbound',
        status: 'received',
        timestamp: Date.now()
      };

      console.log('📨 Inbound SMS:', inboundMessage);

      // Save to database
      const messageId = db.saveMessage(inboundMessage);

      // Check for keyword auto-reply
      const autoReply = db.findKeywordMatch(inboundMessage.body);
      if (autoReply) {
        console.log('🤖 Auto-reply triggered:', autoReply);
        
        // Send auto-reply
        const command = new SendTextMessageCommand({
          DestinationPhoneNumber: inboundMessage.from_number,
          OriginationIdentity: inboundMessage.to_number,
          MessageBody: autoReply
        });

        const replyResult = await smsClient.send(command);
        
        // Save auto-reply to database
        db.saveMessage({
          message_id: replyResult.MessageId,
          from_number: inboundMessage.to_number,
          to_number: inboundMessage.from_number,
          body: autoReply,
          direction: 'outbound',
          status: 'sent',
          timestamp: Date.now()
        });
      }

      // Broadcast to WebSocket clients
      broadcastMessage({
        type: 'message',
        data: {
          id: messageId,
          ...inboundMessage
        }
      });

      res.status(200).json({ success: true, messageId });
      return;
    }
    
    // Unknown message type
    console.log('⚠️ Unknown SNS message type:', {
      header: req.headers['x-amz-sns-message-type'],
      type: snsMessage.Type,
      message: snsMessage
    });
    res.status(200).json({ 
      success: true, 
      message: 'Received but not processed',
      type: snsMessage.Type || 'unknown'
    });

  } catch (error) {
    console.error('❌ Error processing SNS webhook:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Keyword management
app.get('/api/keywords', (req, res) => {
  try {
    const keywords = db.getAllKeywords();
    res.json({ success: true, keywords });
  } catch (error) {
    console.error('❌ Error fetching keywords:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/keywords', (req, res) => {
  try {
    const { trigger, response } = req.body;
    
    if (!trigger || !response) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: trigger, response' 
      });
    }

    const result = db.addKeyword(trigger, response);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('❌ Error adding keyword:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/keywords/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { trigger, response, active } = req.body;
    
    db.updateKeyword(parseInt(id), trigger, response, active);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error updating keyword:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/keywords/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.deleteKeyword(parseInt(id));
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error deleting keyword:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Statistics
app.get('/api/stats', (req, res) => {
  try {
    const stats = db.getStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    version: APP_VERSION,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║   AWS Two-Way SMS v${APP_VERSION}                 ║
║   Real-time Messaging with Auto-Replies      ║
╚═══════════════════════════════════════════════╝

🚀 Server running on port ${PORT}
🔌 WebSocket server active
📱 Phone numbers: ${CONFIGURED_NUMBERS.map(n => n.phone).join(', ')}
💾 Database: ${dbPath}
🌐 Environment: ${process.env.NODE_ENV || 'development'}

📍 Endpoints:
   - Web UI: http://0.0.0.0:${PORT}
   - SNS Webhook: http://0.0.0.0:${PORT}/webhook/sms
   - Health: http://0.0.0.0:${PORT}/health
   - WebSocket: ws://0.0.0.0:${PORT}
`);
});

// Error handling for server
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⏸️  SIGTERM received, closing server...');
  server.close(() => {
    db.close();
    console.log('👋 Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n⏸️  SIGINT received, closing server...');
  server.close(() => {
    db.close();
    console.log('👋 Server closed');
    process.exit(0);
  });
});

module.exports = { app, server, wss };
