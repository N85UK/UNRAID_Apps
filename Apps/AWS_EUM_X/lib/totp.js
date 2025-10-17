const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

/**
 * Generate a new TOTP secret
 */
function generateSecret(username, issuer = 'AWS EUM X') {
  const secret = speakeasy.generateSecret({
    name: `${issuer} (${username})`,
    issuer: issuer,
    length: 32
  });
  
  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url
  };
}

/**
 * Generate QR code as data URL
 */
async function generateQRCode(otpauthUrl) {
  try {
    const dataUrl = await QRCode.toDataURL(otpauthUrl);
    return dataUrl;
  } catch (err) {
    throw new Error('Failed to generate QR code: ' + err.message);
  }
}

/**
 * Verify a TOTP token
 */
function verifyToken(secret, token) {
  if (!secret || !token) {
    return false;
  }
  
  // Remove any spaces or dashes from token
  const cleanToken = String(token).replace(/[\s-]/g, '');
  
  if (!/^\d{6}$/.test(cleanToken)) {
    return false;
  }
  
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: cleanToken,
    window: 2 // Allow 2 time steps before/after for clock skew
  });
}

module.exports = {
  generateSecret,
  generateQRCode,
  verifyToken
};
