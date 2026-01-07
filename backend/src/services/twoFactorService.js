import crypto from 'crypto';
import { authenticator } from 'otplib';

/**
 * Two-Factor Authentication Service
 */

/**
 * Generate 2FA secret for user
 */
export const generateTwoFactorSecret = (userEmail) => {
  const secret = authenticator.generateSecret();
  const serviceName = process.env.APP_NAME || 'LMS Platform';
  
  const otpAuthUrl = authenticator.keyuri(
    userEmail,
    serviceName,
    secret
  );

  return {
    secret,
    otpAuthUrl,
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpAuthUrl)}`,
  };
};

/**
 * Generate backup codes
 */
export const generateBackupCodes = () => {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return codes;
};

/**
 * Verify 2FA token
 */
export const verifyTwoFactorToken = (secret, token) => {
  try {
    return authenticator.verify({
      token,
      secret,
    });
  } catch (error) {
    return false;
  }
};

/**
 * Verify backup code
 */
export const verifyBackupCode = (backupCodes, code) => {
  if (!Array.isArray(backupCodes)) {
    return false;
  }
  return backupCodes.includes(code.toUpperCase());
};

export default {
  generateTwoFactorSecret,
  generateBackupCodes,
  verifyTwoFactorToken,
  verifyBackupCode,
};
