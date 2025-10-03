const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { PinpointSMSVoiceV2Client, SendTextMessageCommand } = require('@aws-sdk/client-pinpoint-sms-voice-v2');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 80;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// AWS Pinpoint SMS client
const smsClient = new PinpointSMSVoiceV2Client({
    region: process.env.AWS_REGION || 'eu-west-2',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Parse originators from environment variable
function getOriginators() {
    const originatorsStr = process.env.ORIGINATORS || '';
    if (!originatorsStr) return {};

    const originators = {};
    originatorsStr.split(',').forEach(pair => {
        const [label, arn] = pair.split(':');
        if (label && arn) {
            originators[label.trim()] = arn.trim();
        }
    });
    return originators;
}

// Routes
app.get('/', (req, res) => {
    const originators = getOriginators();
    const history = getMessageHistory();
    res.render('index', { originators, history });
});

app.post('/send-sms', async (req, res) => {
    try {
        const { originator, phoneNumber, message } = req.body;

        if (!originator || !phoneNumber || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const originators = getOriginators();
        const originationIdentity = originators[originator];

        if (!originationIdentity) {
            return res.status(400).json({ error: 'Invalid originator' });
        }

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
            messageId: result.MessageId
        });

        res.json({
            success: true,
            messageId: result.MessageId
        });

    } catch (error) {
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

// Start server
app.listen(PORT, () => {
    console.log(`AWS EUM server running on port ${PORT}`);
    console.log(`Originators configured: ${Object.keys(getOriginators()).length}`);
});