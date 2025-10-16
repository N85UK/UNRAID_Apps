#!/usr/bin/env node

/**
 * Database initialization script
 * Run with: npm run init-db
 */

const MessageDatabase = require('../database');
const path = require('path');

console.log('🔧 Initializing AWS Two-Way SMS Database...\n');

// Create data directory if it doesn't exist
const fs = require('fs');
const dataDir = path.join(__dirname, '..', 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('✅ Created data directory:', dataDir);
}

// Initialize database
const dbPath = path.join(dataDir, 'messages.db');
console.log('📍 Database path:', dbPath);

const db = new MessageDatabase(dbPath);

// Add sample keywords
console.log('\n📝 Adding sample keywords...');

const sampleKeywords = [
  { trigger: 'HELP', response: 'Welcome! Available commands: INFO, HOURS, STOP' },
  { trigger: 'INFO', response: 'This is an automated SMS system. Reply HELP for available commands.' },
  { trigger: 'HOURS', response: 'We are available Monday-Friday 9AM-5PM, Saturday 10AM-2PM.' },
  { trigger: 'STOP', response: 'You have been unsubscribed. Reply START to resume messages.' },
  { trigger: 'START', response: 'Welcome back! You are now subscribed to receive messages.' }
];

for (const kw of sampleKeywords) {
  try {
    db.addKeyword(kw.trigger, kw.response);
    console.log(`  ✅ Added keyword: ${kw.trigger}`);
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      console.log(`  ⏭️  Keyword already exists: ${kw.trigger}`);
    } else {
      console.error(`  ❌ Error adding keyword ${kw.trigger}:`, err.message);
    }
  }
}

// Add configured phone numbers
console.log('\n📱 Adding configured phone numbers...');

const phoneNumbers = [
  { phone: '+447418367358', label: 'Primary Two-Way Number' },
  { phone: '+447418373704', label: 'Secondary Two-Way Number' }
];

for (const num of phoneNumbers) {
  try {
    db.addPhoneNumber(num.phone, num.label);
    console.log(`  ✅ Added phone: ${num.phone} (${num.label})`);
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      console.log(`  ⏭️  Phone already exists: ${num.phone}`);
    } else {
      console.error(`  ❌ Error adding phone ${num.phone}:`, err.message);
    }
  }
}

// Show stats
console.log('\n📊 Database Statistics:');
const stats = db.getStats();
console.log(`  - Total Messages: ${stats.totalMessages}`);
console.log(`  - Total Conversations: ${stats.totalConversations}`);
console.log(`  - Unread Messages: ${stats.unreadMessages}`);

const keywords = db.getAllKeywords();
console.log(`  - Active Keywords: ${keywords.filter(k => k.active).length}`);

const phones = db.getPhoneNumbers();
console.log(`  - Configured Numbers: ${phones.length}`);

db.close();

console.log('\n✅ Database initialization complete!\n');
console.log('🚀 You can now start the server with: npm start\n');
