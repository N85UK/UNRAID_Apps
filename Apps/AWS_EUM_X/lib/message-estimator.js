/**
 * SMS Message Part Estimator
 * Calculates encoding, segments, and estimated costs for SMS messages
 * Based on AWS SMS character limits documentation
 */

// GSM-7 character set (most common for Latin scripts)
const GSM_7BIT_CHARS = "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
const GSM_7BIT_EXTENDED = "^{}\\[~]|€";

// Single segment limits
const GSM_SINGLE_SEGMENT = 160;
const UCS2_SINGLE_SEGMENT = 70;

// Multi-segment limits (reduced due to concatenation headers)
const GSM_MULTI_SEGMENT = 153;
const UCS2_MULTI_SEGMENT = 67;

/**
 * Detect if message uses only GSM-7 characters
 */
function isGSM7Bit(message) {
  for (const char of message) {
    if (!GSM_7BIT_CHARS.includes(char) && !GSM_7BIT_EXTENDED.includes(char)) {
      return false;
    }
  }
  return true;
}

/**
 * Count characters considering GSM-7 extended characters (count as 2)
 */
function countGSMCharacters(message) {
  let count = 0;
  for (const char of message) {
    count += GSM_7BIT_EXTENDED.includes(char) ? 2 : 1;
  }
  return count;
}

/**
 * Estimate message parts and encoding
 */
function estimateMessage(message) {
  if (!message || message.length === 0) {
    return {
      encoding: 'GSM-7',
      length: 0,
      segments: 0,
      charsPerSegment: GSM_SINGLE_SEGMENT,
      remainingInSegment: GSM_SINGLE_SEGMENT,
      isMultipart: false,
      estimatedCostMultiplier: 0
    };
  }

  const isGSM = isGSM7Bit(message);
  const encoding = isGSM ? 'GSM-7' : 'UCS-2';
  
  let length, segments, charsPerSegment, remainingInSegment;
  
  if (isGSM) {
    length = countGSMCharacters(message);
    
    if (length <= GSM_SINGLE_SEGMENT) {
      segments = 1;
      charsPerSegment = GSM_SINGLE_SEGMENT;
      remainingInSegment = GSM_SINGLE_SEGMENT - length;
    } else {
      segments = Math.ceil(length / GSM_MULTI_SEGMENT);
      charsPerSegment = GSM_MULTI_SEGMENT;
      remainingInSegment = (segments * GSM_MULTI_SEGMENT) - length;
    }
  } else {
    // UCS-2 encoding (for Unicode characters)
    length = message.length;
    
    if (length <= UCS2_SINGLE_SEGMENT) {
      segments = 1;
      charsPerSegment = UCS2_SINGLE_SEGMENT;
      remainingInSegment = UCS2_SINGLE_SEGMENT - length;
    } else {
      segments = Math.ceil(length / UCS2_MULTI_SEGMENT);
      charsPerSegment = UCS2_MULTI_SEGMENT;
      remainingInSegment = (segments * UCS2_MULTI_SEGMENT) - length;
    }
  }

  return {
    encoding,
    length,
    segments,
    charsPerSegment,
    remainingInSegment,
    isMultipart: segments > 1,
    estimatedCostMultiplier: segments,
    warning: segments > 3 ? 'Long message: consider splitting into multiple sends' : null
  };
}

/**
 * Validate phone number format (E.164)
 */
function validatePhoneNumber(phoneNumber) {
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  
  if (!phoneNumber) {
    return { valid: false, error: 'Phone number is required' };
  }
  
  if (!e164Regex.test(phoneNumber)) {
    return { 
      valid: false, 
      error: 'Phone number must be in E.164 format (e.g., +1234567890)' 
    };
  }
  
  return { valid: true };
}

/**
 * Extract country code from E.164 phone number
 */
function extractCountryCode(phoneNumber) {
  if (!phoneNumber || !phoneNumber.startsWith('+')) {
    return null;
  }
  
  // Common country codes (simplified mapping)
  const countryCodeMap = {
    '+1': 'US/CA',
    '+44': 'GB',
    '+49': 'DE',
    '+33': 'FR',
    '+39': 'IT',
    '+34': 'ES',
    '+91': 'IN',
    '+86': 'CN',
    '+81': 'JP',
    '+61': 'AU',
    '+7': 'RU'
  };
  
  // Check for known prefixes (1-3 digits)
  for (let i = 2; i <= Math.min(4, phoneNumber.length); i++) {
    const prefix = phoneNumber.substring(0, i);
    if (countryCodeMap[prefix]) {
      return { code: prefix.substring(1), country: countryCodeMap[prefix] };
    }
  }
  
  // Fallback to first 1-3 digits
  const code = phoneNumber.substring(1, Math.min(4, phoneNumber.length));
  return { code, country: 'Unknown' };
}

module.exports = {
  estimateMessage,
  validatePhoneNumber,
  extractCountryCode,
  isGSM7Bit,
  countGSMCharacters,
  // Constants for external use
  GSM_SINGLE_SEGMENT,
  GSM_MULTI_SEGMENT,
  UCS2_SINGLE_SEGMENT,
  UCS2_MULTI_SEGMENT
};
