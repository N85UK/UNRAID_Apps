const Joi = require('joi');

// E.164 phone number regex (international format)
const e164Regex = /^\+[1-9]\d{1,14}$/;

// AWS ARN regex
const arnRegex = /^arn:aws:[a-z0-9-]+:[a-z0-9-]*:\d{12}:[a-z0-9-/]+$/i;

const schemas = {
  sendSMS: Joi.object({
    phoneNumber: Joi.string()
      .pattern(e164Regex)
      .required()
      .messages({
        'string.pattern.base': 'Phone number must be in E.164 format (e.g., +447700900000)',
        'any.required': 'Phone number is required'
      }),
    message: Joi.string()
      .min(1)
      .max(1600)
      .required()
      .messages({
        'string.max': 'Message must not exceed 1600 characters',
        'any.required': 'Message is required'
      }),
    originationIdentity: Joi.string()
      .required()
      .messages({
        'any.required': 'Origination identity is required'
      }),
    messageType: Joi.string()
      .valid('TRANSACTIONAL', 'PROMOTIONAL')
      .default('TRANSACTIONAL'),
    configurationSetName: Joi.string().optional(),
    maxPrice: Joi.string().pattern(/^\d+\.\d{2}$/).optional()
  }),

  sendMMS: Joi.object({
    phoneNumber: Joi.string()
      .pattern(e164Regex)
      .required()
      .messages({
        'string.pattern.base': 'Phone number must be in E.164 format (e.g., +447700900000)'
      }),
    message: Joi.string()
      .max(1600)
      .optional()
      .allow(''),
    mediaUrls: Joi.array()
      .items(Joi.string().uri())
      .min(1)
      .max(10)
      .required()
      .messages({
        'array.min': 'At least one media URL is required for MMS',
        'array.max': 'Maximum 10 media attachments allowed'
      }),
    originationIdentity: Joi.string().required(),
    messageType: Joi.string()
      .valid('TRANSACTIONAL', 'PROMOTIONAL')
      .default('TRANSACTIONAL'),
    configurationSetName: Joi.string().optional()
  }),

  updateConfig: Joi.object({
    aws: Joi.object({
      region: Joi.string()
        .valid(
          'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
          'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1',
          'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1',
          'ca-central-1', 'af-south-1', 'sa-east-1'
        )
        .optional(),
      authMethod: Joi.string()
        .valid('auto', 'iam_role', 'access_keys')
        .optional()
    }).optional(),
    features: Joi.object({
      sms: Joi.object({
        defaultMessageType: Joi.string().valid('TRANSACTIONAL', 'PROMOTIONAL').optional(),
        configurationSetArn: Joi.string().pattern(arnRegex).allow(null, '').optional()
      }).optional(),
      optOut: Joi.object({
        enabled: Joi.boolean().optional(),
        checkBeforeSend: Joi.boolean().optional(),
        optOutListName: Joi.string().allow('').optional()
      }).optional(),
      rateLimit: Joi.object({
        enabled: Joi.boolean().optional(),
        messagesPerSecond: Joi.number().min(1).max(100).optional()
      }).optional()
    }).optional(),
    ui: Joi.object({
      theme: Joi.string().valid('light', 'dark').optional(),
      pageSize: Joi.number().min(10).max(100).optional()
    }).optional()
  }),

  wizardStep1: Joi.object({
    aws: Joi.object({
      region: Joi.string().required(),
      authMethod: Joi.string().valid('iam_role', 'access_keys').required(),
      credentials: Joi.object({
        accessKeyId: Joi.string().when('$authMethod', {
          is: 'access_keys',
          then: Joi.required(),
          otherwise: Joi.optional().allow('')
        }),
        secretAccessKey: Joi.string().when('$authMethod', {
          is: 'access_keys',
          then: Joi.required(),
          otherwise: Joi.optional().allow('')
        })
      }).optional()
    })
  }),

  testMessage: Joi.object({
    phoneNumber: Joi.string()
      .pattern(e164Regex)
      .required(),
    originationIdentity: Joi.string().required()
  })
};

function validate(schema, data, options = {}) {
  const { error, value } = schemas[schema].validate(data, {
    abortEarly: false,
    stripUnknown: true,
    ...options
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      type: detail.type
    }));

    return {
      valid: false,
      errors,
      value: null
    };
  }

  return {
    valid: true,
    errors: null,
    value
  };
}

// Helper function to calculate SMS segments
function calculateSMSSegments(message) {
  // eslint-disable-next-line no-useless-escape
  const gsm7Chars = /^[@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&'()*+,\-./:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà\^{}\\\[~\]|€]*$/;
  
  const isGSM7 = gsm7Chars.test(message);
  const length = message.length;
  
  if (isGSM7) {
    if (length <= 160) {
      return { segments: 1, encoding: 'GSM-7', charsPerSegment: 160, remaining: 160 - length };
    } else {
      const segments = Math.ceil(length / 153);
      const remaining = (segments * 153) - length;
      return { segments, encoding: 'GSM-7', charsPerSegment: 153, remaining };
    }
  } else {
    // UCS-2 encoding
    if (length <= 70) {
      return { segments: 1, encoding: 'UCS-2', charsPerSegment: 70, remaining: 70 - length };
    } else {
      const segments = Math.ceil(length / 67);
      const remaining = (segments * 67) - length;
      return { segments, encoding: 'UCS-2', charsPerSegment: 67, remaining };
    }
  }
}

// Helper to estimate cost
function estimateCost(segments, destinationCountry = 'US') {
  // Simplified cost estimation (actual costs vary by destination)
  const costPerSegment = {
    'US': 0.00645,
    'GB': 0.02614,
    'CA': 0.00645,
    'default': 0.03
  };
  
  const cost = costPerSegment[destinationCountry] || costPerSegment.default;
  return (segments * cost).toFixed(4);
}

module.exports = {
  schemas,
  validate,
  calculateSMSSegments,
  estimateCost,
  e164Regex,
  arnRegex
};
