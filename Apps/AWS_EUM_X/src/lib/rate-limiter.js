const logger = require('./logger');
const config = require('./config');

class RateLimiter {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.tokens = 0;
    this.lastRefill = Date.now();
    this.stats = {
      sent: 0,
      queued: 0,
      rejected: 0,
      errors: 0
    };
  }

  initialize() {
    const rateLimitConfig = config.get('features.rateLimit');
    this.enabled = rateLimitConfig.enabled;
    this.maxTokens = rateLimitConfig.burstSize;
    this.refillRate = rateLimitConfig.messagesPerSecond;
    this.tokens = this.maxTokens;
    
    // Start token refill timer
    this.refillInterval = setInterval(() => this.refillTokens(), 1000);
    
    logger.info({
      enabled: this.enabled,
      messagesPerSecond: this.refillRate,
      burstSize: this.maxTokens
    }, 'Rate limiter initialized');
  }

  refillTokens() {
    if (!this.enabled) return;
    
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    const tokensToAdd = Math.floor(elapsed * this.refillRate);
    
    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
      this.lastRefill = now;
    }
    
    // Process queue if we have tokens
    if (this.tokens > 0 && this.queue.length > 0 && !this.processing) {
      this.processQueue();
    }
  }

  async send(sendFunction, params) {
    if (!this.enabled) {
      // Rate limiting disabled, send immediately
      return await sendFunction(params);
    }

    return new Promise((resolve, reject) => {
      const task = {
        sendFunction,
        params,
        resolve,
        reject,
        queuedAt: Date.now(),
        attempts: 0
      };

      if (this.tokens > 0) {
        // We have tokens, send immediately
        this.consumeToken();
        this.executeTask(task);
      } else {
        // Queue the message
        this.queue.push(task);
        this.stats.queued++;
        logger.debug({ queueSize: this.queue.length }, 'Message queued due to rate limit');
      }
    });
  }

  consumeToken() {
    if (this.tokens > 0) {
      this.tokens--;
      return true;
    }
    return false;
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0 && this.tokens > 0) {
      const task = this.queue.shift();
      this.consumeToken();
      
      // Execute task without blocking the queue
      this.executeTask(task).catch(error => {
        logger.error({ error: error.message }, 'Error executing queued task');
      });
      
      // Small delay between sends
      await this.sleep(100);
    }
    
    this.processing = false;
  }

  async executeTask(task) {
    try {
      task.attempts++;
      const result = await task.sendFunction(task.params);
      this.stats.sent++;
      task.resolve(result);
    } catch (error) {
      // Check if error is retryable
      if (error.retryable && task.attempts < 3) {
        logger.warn({
          attempts: task.attempts,
          error: error.errorType
        }, 'Retrying failed message');
        
        // Re-queue with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, task.attempts), 10000);
        await this.sleep(delay);
        this.queue.unshift(task); // Add to front of queue
      } else {
        this.stats.errors++;
        task.reject(error);
      }
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStats() {
    return {
      ...this.stats,
      queueSize: this.queue.length,
      availableTokens: this.tokens,
      maxTokens: this.maxTokens,
      refillRate: this.refillRate,
      enabled: this.enabled
    };
  }

  getQueueInfo() {
    return {
      size: this.queue.length,
      messages: this.queue.map(task => ({
        phoneNumber: task.params.phoneNumber,
        queuedAt: task.queuedAt,
        attempts: task.attempts,
        waitTime: Date.now() - task.queuedAt
      }))
    };
  }

  clearQueue() {
    const cleared = this.queue.length;
    this.queue = [];
    logger.info({ cleared }, 'Message queue cleared');
    return cleared;
  }

  shutdown() {
    if (this.refillInterval) {
      clearInterval(this.refillInterval);
    }
    
    // Reject all queued messages
    this.queue.forEach(task => {
      task.reject(new Error('Rate limiter shutting down'));
    });
    
    this.queue = [];
    logger.info('Rate limiter shut down');
  }
}

module.exports = new RateLimiter();
