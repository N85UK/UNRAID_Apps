const {
  PinpointSMSVoiceV2Client,
  SendTextMessageCommand,
  DescribePoolsCommand,
  DescribePhoneNumbersCommand,
  DescribeConfigurationSetsCommand,
  // DescribeOptOutListsCommand, // Reserved for future use
  DescribeOptedOutNumbersCommand,
  DescribeAccountAttributesCommand,
  DescribeSpendLimitsCommand
} = require('@aws-sdk/client-pinpoint-sms-voice-v2');
const { fromEnv, fromInstanceMetadata } = require('@aws-sdk/credential-providers');
const logger = require('./logger');
const config = require('./config');

class AWSClient {
  constructor() {
    this.client = null;
    this.credentialsInitialized = false;
    this.lastHealthCheck = null;
    this.healthCheckCache = { status: 'unknown', timestamp: 0 };
  }

  async initialize() {
    if (this.credentialsInitialized) {
      return this.client;
    }

    const awsConfig = config.get('aws');
    const clientConfig = {
      region: awsConfig.region,
      maxAttempts: awsConfig.maxRetries,
      requestHandler: {
        requestTimeout: awsConfig.requestTimeout
      }
    };

    // Determine credentials based on auth method
    try {
      switch (awsConfig.authMethod) {
        case 'iam_role':
          logger.info('Using IAM role credentials');
          clientConfig.credentials = fromInstanceMetadata({
            timeout: 5000,
            maxRetries: 2
          });
          break;
          
        case 'access_keys':
          if (!awsConfig.credentials.accessKeyId || !awsConfig.credentials.secretAccessKey) {
            throw new Error('Access keys not configured');
          }
          logger.info('Using static access keys');
          clientConfig.credentials = {
            accessKeyId: awsConfig.credentials.accessKeyId,
            secretAccessKey: awsConfig.credentials.secretAccessKey
          };
          break;
          
        case 'auto':
        default:
          // Try IAM role first, then fall back to access keys
          try {
            logger.info('Auto-detecting credentials (trying IAM role first)');
            clientConfig.credentials = fromInstanceMetadata({
              timeout: 2000,
              maxRetries: 1
            });
          } catch {
            if (awsConfig.credentials.accessKeyId && awsConfig.credentials.secretAccessKey) {
              logger.info('IAM role not available, using access keys');
              clientConfig.credentials = {
                accessKeyId: awsConfig.credentials.accessKeyId,
                secretAccessKey: awsConfig.credentials.secretAccessKey
              };
            } else {
              logger.info('Falling back to environment credentials');
              clientConfig.credentials = fromEnv();
            }
          }
      }

      this.client = new PinpointSMSVoiceV2Client(clientConfig);
      this.credentialsInitialized = true;
      
      logger.info({ region: awsConfig.region }, 'AWS client initialized');
      return this.client;
      
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to initialize AWS client');
      throw error;
    }
  }

  async healthCheck() {
    // Cache health check for 30 seconds
    if (this.healthCheckCache.timestamp > Date.now() - 30000) {
      return this.healthCheckCache;
    }

    try {
      await this.initialize();
      
      // Try a lightweight API call
      const command = new DescribeAccountAttributesCommand({
        MaxResults: 1
      });
      
      const startTime = Date.now();
      await this.client.send(command);
      const latency = Date.now() - startTime;
      
      this.healthCheckCache = {
        status: 'ok',
        timestamp: Date.now(),
        latency,
        region: config.get('aws.region')
      };
      
      return this.healthCheckCache;
      
    } catch (error) {
      logger.error({ error: error.message }, 'AWS health check failed');
      
      this.healthCheckCache = {
        status: 'error',
        timestamp: Date.now(),
        error: error.name || 'UnknownError',
        message: this.sanitizeErrorMessage(error.message)
      };
      
      return this.healthCheckCache;
    }
  }

  async sendSMS(params) {
    await this.initialize();
    
    const {
      phoneNumber,
      message,
      originationIdentity,
      messageType = 'TRANSACTIONAL',
      configurationSetName,
      maxPrice
    } = params;

    const commandParams = {
      DestinationPhoneNumber: phoneNumber,
      MessageBody: message,
      OriginationIdentity: originationIdentity,
      MessageType: messageType
    };

    if (configurationSetName) {
      commandParams.ConfigurationSetName = configurationSetName;
    }

    if (maxPrice) {
      commandParams.MaxPrice = maxPrice;
    }

    try {
      const command = new SendTextMessageCommand(commandParams);
      const result = await this.client.send(command);
      
      logger.info({
        messageId: result.MessageId,
        to: logger.redactPhone(phoneNumber),
        type: messageType
      }, 'SMS sent successfully');
      
      return {
        success: true,
        messageId: result.MessageId
      };
      
    } catch (error) {
      logger.error({
        error: error.name,
        message: error.message,
        to: logger.redactPhone(phoneNumber)
      }, 'Failed to send SMS');
      
      throw this.enhanceError(error);
    }
  }

  async sendMMS(params) {
    await this.initialize();
    
    const {
      phoneNumber,
      message,
      mediaUrls,
      originationIdentity,
      messageType = 'TRANSACTIONAL',
      configurationSetName
    } = params;

    const commandParams = {
      DestinationPhoneNumber: phoneNumber,
      MessageBody: message,
      OriginationIdentity: originationIdentity,
      MessageType: messageType,
      MediaUrls: mediaUrls
    };

    if (configurationSetName) {
      commandParams.ConfigurationSetName = configurationSetName;
    }

    try {
      const command = new SendTextMessageCommand(commandParams);
      const result = await this.client.send(command);
      
      logger.info({
        messageId: result.MessageId,
        to: logger.redactPhone(phoneNumber),
        type: 'MMS',
        mediaCount: mediaUrls.length
      }, 'MMS sent successfully');
      
      return {
        success: true,
        messageId: result.MessageId
      };
      
    } catch (error) {
      logger.error({
        error: error.name,
        message: error.message,
        to: logger.redactPhone(phoneNumber)
      }, 'Failed to send MMS');
      
      throw this.enhanceError(error);
    }
  }

  async listPhonePools(nextToken = null) {
    await this.initialize();
    
    try {
      const command = new DescribePoolsCommand({
        MaxResults: 20,
        NextToken: nextToken
      });
      
      const result = await this.client.send(command);
      return {
        pools: result.Pools || [],
        nextToken: result.NextToken
      };
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to list phone pools');
      throw this.enhanceError(error);
    }
  }

  async listPhoneNumbers(nextToken = null) {
    await this.initialize();
    
    try {
      const command = new DescribePhoneNumbersCommand({
        MaxResults: 20,
        NextToken: nextToken
      });
      
      const result = await this.client.send(command);
      return {
        phoneNumbers: result.PhoneNumbers || [],
        nextToken: result.NextToken
      };
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to list phone numbers');
      throw this.enhanceError(error);
    }
  }

  async listConfigurationSets() {
    await this.initialize();
    
    try {
      const command = new DescribeConfigurationSetsCommand({
        MaxResults: 20
      });
      
      const result = await this.client.send(command);
      return result.ConfigurationSets || [];
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to list configuration sets');
      throw this.enhanceError(error);
    }
  }

  async checkOptOut(phoneNumber) {
    await this.initialize();
    
    const optOutConfig = config.get('features.optOut');
    if (!optOutConfig.enabled || !optOutConfig.optOutListName) {
      return { optedOut: false };
    }

    try {
      const command = new DescribeOptedOutNumbersCommand({
        OptOutListName: optOutConfig.optOutListName,
        OptedOutNumbers: [phoneNumber]
      });
      
      const result = await this.client.send(command);
      const optedOut = result.OptedOutNumbers && result.OptedOutNumbers.length > 0;
      
      return { optedOut };
    } catch (error) {
      logger.warn({ error: error.message }, 'Failed to check opt-out status');
      // Don't block sending if opt-out check fails
      return { optedOut: false, error: error.message };
    }
  }

  async getAccountAttributes() {
    await this.initialize();
    
    try {
      const command = new DescribeAccountAttributesCommand({});
      const result = await this.client.send(command);
      return result.AccountAttributes || [];
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to get account attributes');
      throw this.enhanceError(error);
    }
  }

  async getSpendLimits() {
    await this.initialize();
    
    try {
      const command = new DescribeSpendLimitsCommand({});
      const result = await this.client.send(command);
      return result.SpendLimits || [];
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to get spend limits');
      throw this.enhanceError(error);
    }
  }

  enhanceError(error) {
    const errorMap = {
      'ThrottlingException': {
        userMessage: 'AWS rate limit exceeded. Please try again in a moment.',
        retryable: true,
        retryAfter: 5000
      },
      'InvalidParameterException': {
        userMessage: 'Invalid request parameters. Please check your input.',
        retryable: false
      },
      'ResourceNotFoundException': {
        userMessage: 'AWS resource not found. Please check your configuration.',
        retryable: false
      },
      'AccessDeniedException': {
        userMessage: 'AWS credentials do not have required permissions.',
        retryable: false
      },
      'ValidationException': {
        userMessage: 'Request validation failed. Please check your input.',
        retryable: false
      },
      'ServiceQuotaExceededException': {
        userMessage: 'AWS service quota exceeded. Contact AWS support to increase limits.',
        retryable: false
      }
    };

    const errorType = error.name || 'UnknownError';
    const enhancedInfo = errorMap[errorType] || {
      userMessage: 'An unexpected error occurred.',
      retryable: false
    };

    return {
      ...error,
      errorType,
      ...enhancedInfo,
      originalMessage: error.message
    };
  }

  sanitizeErrorMessage(message) {
    if (!message) return 'Unknown error';
    
    // Remove potential sensitive information from error messages
    return message
      .replace(/arn:aws:[^:]+:[^:]+:[^:]+:[^/\s]+/g, '[ARN]')
      .replace(/AKIA[0-9A-Z]{16}/g, '[ACCESS_KEY]')
      .replace(/\+\d{10,15}/g, '[PHONE]');
  }
}

module.exports = new AWSClient();
