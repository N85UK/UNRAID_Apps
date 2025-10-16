const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const config = require('./config');

class MessageHistory {
  constructor() {
    this.historyFile = path.join(config.dataDir, 'history.json');
    this.maxHistory = config.get('app.maxMessageHistory');
    this.history = this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.historyFile)) {
        const data = fs.readFileSync(this.historyFile, 'utf8');
        const history = JSON.parse(data);
        logger.info({ count: history.length }, 'Message history loaded');
        return history;
      }
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to load message history');
    }
    return [];
  }

  save() {
    try {
      fs.writeFileSync(this.historyFile, JSON.stringify(this.history, null, 2));
      return true;
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to save message history');
      return false;
    }
  }

  add(message) {
    const entry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      type: message.type || 'SMS',
      phoneNumber: logger.redactPhone(message.phoneNumber),
      phoneNumberHash: this.hashPhoneNumber(message.phoneNumber),
      message: message.message ? message.message.substring(0, 500) : '', // Limit stored message length
      messageId: message.messageId,
      originationIdentity: message.originationIdentity,
      status: message.status || 'sent',
      segments: message.segments,
      cost: message.cost,
      error: message.error
    };

    this.history.unshift(entry);

    // Trim to max size
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(0, this.maxHistory);
    }

    this.save();
    return entry;
  }

  getAll(options = {}) {
    const { page = 1, pageSize = 25, filter = {} } = options;
    
    let filtered = [...this.history];

    // Apply filters
    if (filter.type) {
      filtered = filtered.filter(m => m.type === filter.type);
    }
    
    if (filter.status) {
      filtered = filtered.filter(m => m.status === filter.status);
    }

    if (filter.dateFrom) {
      filtered = filtered.filter(m => new Date(m.timestamp) >= new Date(filter.dateFrom));
    }

    if (filter.dateTo) {
      filtered = filtered.filter(m => new Date(m.timestamp) <= new Date(filter.dateTo));
    }

    // Pagination
    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = filtered.slice(start, end);

    return {
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  getById(id) {
    return this.history.find(m => m.id === id);
  }

  getStats(days = 7) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const recent = this.history.filter(m => 
      new Date(m.timestamp) >= cutoff
    );

    const stats = {
      total: recent.length,
      sent: recent.filter(m => m.status === 'sent').length,
      failed: recent.filter(m => m.status === 'failed').length,
      byType: {},
      totalCost: 0,
      byDay: {}
    };

    recent.forEach(msg => {
      // By type
      stats.byType[msg.type] = (stats.byType[msg.type] || 0) + 1;

      // Cost
      if (msg.cost) {
        stats.totalCost += parseFloat(msg.cost);
      }

      // By day
      const day = msg.timestamp.split('T')[0];
      stats.byDay[day] = (stats.byDay[day] || 0) + 1;
    });

    return stats;
  }

  exportCSV() {
    const headers = ['Timestamp', 'Type', 'Phone Number', 'Message', 'Message ID', 'Status', 'Segments', 'Cost'];
    const rows = this.history.map(msg => [
      msg.timestamp,
      msg.type,
      msg.phoneNumber,
      msg.message ? msg.message.replace(/"/g, '""') : '',
      msg.messageId || '',
      msg.status,
      msg.segments || '',
      msg.cost || ''
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csv;
  }

  clear() {
    this.history = [];
    this.save();
    logger.info('Message history cleared');
  }

  generateId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  hashPhoneNumber(phoneNumber) {
    // Simple hash for grouping by recipient without storing full number
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(phoneNumber).digest('hex').substr(0, 16);
  }
}

module.exports = new MessageHistory();
