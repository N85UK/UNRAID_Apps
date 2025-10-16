const fs = require('fs');
const path = require('path');
const Joi = require('joi');
const logger = require('./logger');

class Config {
  constructor() {
    this.configDir = process.env.CONFIG_DIR || '/app/config';
    this.dataDir = process.env.DATA_DIR || '/app/data';
    this.configFile = path.join(this.configDir, 'config.json');
    
    // Ensure directories exist
    this.ensureDirectories();
    
    // Load configuration
    this.config = this.load();
  }

  ensureDirectories() {
    [this.configDir, this.dataDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        logger.info({ dir }, 'Created directory');
      }
    });
  }

  getDefaults() {
    return {
      app: {
        port: parseInt(process.env.PORT || '3000', 10),
        host: process.env.HOST || '0.0.0.0',
        sessionSecret: process.env.SESSION_SECRET || this.generateSecret(),
        rateLimitPerMinute: parseInt(process.env.RATE_LIMIT || '60', 10),
        maxMessageHistory: parseInt(process.env.MAX_HISTORY || '1000', 10)
      },
      aws: {
        region: process.env.AWS_REGION || 'us-east-1',
        authMethod: process.env.AWS_AUTH_METHOD || 'auto', // auto, iam_role, access_keys
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
        },
        maxRetries: parseInt(process.env.AWS_MAX_RETRIES || '3', 10),
        requestTimeout: parseInt(process.env.AWS_TIMEOUT || '30000', 10)
      },
      features: {
        sms: {
          enabled: true,
          defaultMessageType: process.env.SMS_MESSAGE_TYPE || 'TRANSACTIONAL',
          maxPricePerMessage: process.env.SMS_MAX_PRICE || undefined,
          configurationSetArn: process.env.SMS_CONFIG_SET_ARN || undefined
        },
        mms: {
          enabled: process.env.MMS_ENABLED === 'true',
          maxAttachmentSize: parseInt(process.env.MMS_MAX_SIZE || '5242880', 10) // 5MB
        },
        optOut: {
          enabled: true,
          checkBeforeSend: true,
          optOutListName: process.env.OPT_OUT_LIST || undefined
        },
        rateLimit: {
          enabled: true,
          messagesPerSecond: parseInt(process.env.RATE_LIMIT_TPS || '5', 10),
          burstSize: parseInt(process.env.RATE_LIMIT_BURST || '10', 10)
        }
      },
      ui: {
        theme: process.env.UI_THEME || 'light',
        pageSize: parseInt(process.env.UI_PAGE_SIZE || '25', 10),
        enableWizard: process.env.ENABLE_WIZARD !== 'false'
      }
    };
  }

  load() {
    try {
      if (fs.existsSync(this.configFile)) {
        const fileConfig = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
        const merged = this.mergeConfig(this.getDefaults(), fileConfig);
        logger.info('Configuration loaded from file');
        return merged;
      }
    } catch (error) {
      logger.warn({ error: error.message }, 'Failed to load config file, using defaults');
    }
    
    return this.getDefaults();
  }

  mergeConfig(defaults, fileConfig) {
    // Deep merge, with environment variables taking precedence
    const merged = JSON.parse(JSON.stringify(defaults));
    
    if (fileConfig.aws) {
      merged.aws = { ...merged.aws, ...fileConfig.aws };
      // Don't override credentials if env vars are set
      if (!process.env.AWS_ACCESS_KEY_ID && fileConfig.aws.credentials) {
        merged.aws.credentials = fileConfig.aws.credentials;
      }
    }
    
    if (fileConfig.features) {
      merged.features = { ...merged.features, ...fileConfig.features };
    }
    
    if (fileConfig.ui) {
      merged.ui = { ...merged.ui, ...fileConfig.ui };
    }
    
    return merged;
  }

  save() {
    try {
      // Don't save sensitive credentials to file
      const toSave = JSON.parse(JSON.stringify(this.config));
      if (toSave.aws && toSave.aws.credentials) {
        delete toSave.aws.credentials;
      }
      
      fs.writeFileSync(this.configFile, JSON.stringify(toSave, null, 2));
      logger.info('Configuration saved');
      return true;
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to save configuration');
      return false;
    }
  }

  get(path) {
    const keys = path.split('.');
    let value = this.config;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  set(path, value) {
    const keys = path.split('.');
    let obj = this.config;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in obj)) {
        obj[key] = {};
      }
      obj = obj[key];
    }
    
    obj[keys[keys.length - 1]] = value;
    return this.save();
  }

  validate() {
    const schema = Joi.object({
      app: Joi.object({
        port: Joi.number().port().required(),
        host: Joi.string().required(),
        sessionSecret: Joi.string().min(32).required(),
        rateLimitPerMinute: Joi.number().min(1).required(),
        maxMessageHistory: Joi.number().min(10).required()
      }),
      aws: Joi.object({
        region: Joi.string().required(),
        authMethod: Joi.string().valid('auto', 'iam_role', 'access_keys').required(),
        credentials: Joi.object({
          accessKeyId: Joi.string().allow(''),
          secretAccessKey: Joi.string().allow('')
        }),
        maxRetries: Joi.number().min(0).max(10),
        requestTimeout: Joi.number().min(1000)
      }),
      features: Joi.object(),
      ui: Joi.object()
    });

    const { error, value } = schema.validate(this.config);
    
    if (error) {
      logger.error({ error: error.details }, 'Configuration validation failed');
      throw new Error(`Invalid configuration: ${error.message}`);
    }
    
    return value;
  }

  generateSecret() {
    return require('crypto').randomBytes(32).toString('hex');
  }

  export() {
    const exported = JSON.parse(JSON.stringify(this.config));
    // Remove sensitive data
    if (exported.aws && exported.aws.credentials) {
      exported.aws.credentials = {
        accessKeyId: exported.aws.credentials.accessKeyId ? '[CONFIGURED]' : '[NOT SET]',
        secretAccessKey: '[REDACTED]'
      };
    }
    return exported;
  }

  import(configData) {
    try {
      // Validate before importing
      const schema = Joi.object({
        aws: Joi.object(),
        features: Joi.object(),
        ui: Joi.object()
      }).unknown(true);

      const { error } = schema.validate(configData);
      if (error) {
        throw new Error(`Invalid import data: ${error.message}`);
      }

      // Merge with current config, preserving credentials from env
      this.config = this.mergeConfig(this.config, configData);
      this.save();
      logger.info('Configuration imported successfully');
      return true;
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to import configuration');
      throw error;
    }
  }

  isFirstRun() {
    // Check if wizard has been completed
    const wizardFile = path.join(this.configDir, '.wizard_completed');
    return !fs.existsSync(wizardFile);
  }

  markWizardComplete() {
    const wizardFile = path.join(this.configDir, '.wizard_completed');
    fs.writeFileSync(wizardFile, new Date().toISOString());
    logger.info('First-run wizard marked as complete');
  }
}

module.exports = new Config();
