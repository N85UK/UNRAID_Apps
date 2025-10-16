const Database = require('better-sqlite3');
const path = require('path');

class MessageDatabase {
  constructor(dbPath = './data/messages.db') {
    this.db = new Database(dbPath, { verbose: console.log });
    this.initializeTables();
  }

  initializeTables() {
    // Messages table - stores all SMS messages
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message_id TEXT UNIQUE,
        from_number TEXT NOT NULL,
        to_number TEXT NOT NULL,
        body TEXT NOT NULL,
        direction TEXT NOT NULL CHECK(direction IN ('inbound', 'outbound')),
        status TEXT DEFAULT 'delivered',
        timestamp INTEGER NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      );
      
      CREATE INDEX IF NOT EXISTS idx_messages_from ON messages(from_number);
      CREATE INDEX IF NOT EXISTS idx_messages_to ON messages(to_number);
      CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
    `);

    // Conversations table - aggregates message threads
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone_number TEXT UNIQUE NOT NULL,
        last_message TEXT,
        last_message_time INTEGER,
        unread_count INTEGER DEFAULT 0,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      );
      
      CREATE INDEX IF NOT EXISTS idx_conversations_phone ON conversations(phone_number);
    `);

    // Keywords table - auto-reply triggers
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS keywords (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trigger TEXT UNIQUE NOT NULL COLLATE NOCASE,
        response TEXT NOT NULL,
        active INTEGER DEFAULT 1,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      );
    `);

    // Phone numbers table - configured two-way numbers
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS phone_numbers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone_number TEXT UNIQUE NOT NULL,
        label TEXT,
        active INTEGER DEFAULT 1,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      );
    `);

    console.log('✅ Database tables initialized');
  }

  // Message operations
  saveMessage(data) {
    const stmt = this.db.prepare(`
      INSERT INTO messages (message_id, from_number, to_number, body, direction, status, timestamp)
      VALUES (@message_id, @from_number, @to_number, @body, @direction, @status, @timestamp)
    `);
    
    const result = stmt.run({
      message_id: data.message_id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      from_number: data.from_number,
      to_number: data.to_number,
      body: data.body,
      direction: data.direction,
      status: data.status || 'delivered',
      timestamp: data.timestamp || Date.now()
    });

    // Update conversation
    this.updateConversation(
      data.direction === 'inbound' ? data.from_number : data.to_number,
      data.body,
      data.timestamp || Date.now(),
      data.direction === 'inbound' ? 1 : 0
    );

    return result.lastInsertRowid;
  }

  getMessages(limit = 100, offset = 0) {
    const stmt = this.db.prepare(`
      SELECT * FROM messages 
      ORDER BY timestamp DESC 
      LIMIT ? OFFSET ?
    `);
    return stmt.all(limit, offset);
  }

  getConversationMessages(phoneNumber, limit = 50) {
    const stmt = this.db.prepare(`
      SELECT * FROM messages 
      WHERE from_number = ? OR to_number = ?
      ORDER BY timestamp DESC 
      LIMIT ?
    `);
    return stmt.all(phoneNumber, phoneNumber, limit);
  }

  // Conversation operations
  updateConversation(phoneNumber, lastMessage, timestamp, incrementUnread = 0) {
    const stmt = this.db.prepare(`
      INSERT INTO conversations (phone_number, last_message, last_message_time, unread_count)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(phone_number) DO UPDATE SET
        last_message = excluded.last_message,
        last_message_time = excluded.last_message_time,
        unread_count = unread_count + excluded.unread_count,
        updated_at = strftime('%s', 'now')
    `);
    return stmt.run(phoneNumber, lastMessage, timestamp, incrementUnread);
  }

  getConversations() {
    const stmt = this.db.prepare(`
      SELECT * FROM conversations 
      ORDER BY last_message_time DESC
    `);
    return stmt.all();
  }

  markConversationRead(phoneNumber) {
    const stmt = this.db.prepare(`
      UPDATE conversations 
      SET unread_count = 0 
      WHERE phone_number = ?
    `);
    return stmt.run(phoneNumber);
  }

  // Keyword operations
  addKeyword(trigger, response) {
    const stmt = this.db.prepare(`
      INSERT INTO keywords (trigger, response)
      VALUES (?, ?)
    `);
    return stmt.run(trigger, response);
  }

  updateKeyword(id, trigger, response, active) {
    const stmt = this.db.prepare(`
      UPDATE keywords 
      SET trigger = ?, response = ?, active = ?, updated_at = strftime('%s', 'now')
      WHERE id = ?
    `);
    return stmt.run(trigger, response, active ? 1 : 0, id);
  }

  deleteKeyword(id) {
    const stmt = this.db.prepare('DELETE FROM keywords WHERE id = ?');
    return stmt.run(id);
  }

  getKeywords() {
    const stmt = this.db.prepare('SELECT * FROM keywords WHERE active = 1');
    return stmt.all();
  }

  getAllKeywords() {
    const stmt = this.db.prepare('SELECT * FROM keywords ORDER BY created_at DESC');
    return stmt.all();
  }

  findKeywordMatch(messageBody) {
    const keywords = this.getKeywords();
    const normalizedBody = messageBody.trim().toLowerCase();
    
    for (const keyword of keywords) {
      const triggerPattern = keyword.trigger.toLowerCase();
      if (normalizedBody.includes(triggerPattern) || normalizedBody === triggerPattern) {
        return keyword.response;
      }
    }
    return null;
  }

  // Phone number operations
  addPhoneNumber(phoneNumber, label) {
    const stmt = this.db.prepare(`
      INSERT INTO phone_numbers (phone_number, label)
      VALUES (?, ?)
    `);
    return stmt.run(phoneNumber, label);
  }

  getPhoneNumbers() {
    const stmt = this.db.prepare('SELECT * FROM phone_numbers WHERE active = 1');
    return stmt.all();
  }

  // Statistics
  getStats() {
    const totalMessages = this.db.prepare('SELECT COUNT(*) as count FROM messages').get();
    const totalConversations = this.db.prepare('SELECT COUNT(*) as count FROM conversations').get();
    const unreadCount = this.db.prepare('SELECT SUM(unread_count) as count FROM conversations').get();
    const todayMessages = this.db.prepare(`
      SELECT COUNT(*) as count FROM messages 
      WHERE timestamp >= strftime('%s', 'now', 'start of day') * 1000
    `).get();

    return {
      totalMessages: totalMessages.count,
      totalConversations: totalConversations.count,
      unreadMessages: unreadCount.count || 0,
      todayMessages: todayMessages.count
    };
  }

  close() {
    this.db.close();
  }
}

module.exports = MessageDatabase;
