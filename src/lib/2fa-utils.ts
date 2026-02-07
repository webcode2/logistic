'use server';

import { authenticator } from 'otplib';
import crypto from 'crypto';

// Configure TOTP
authenticator.options = {
  step: 30, // 30 second window
  window: [1, 1], // Allow 1 step before and after current time
};

export async function generateSecret(email: string, serviceName: string = process.env.APP_NAME): Promise<string> {
  return authenticator.generateSecret();
}

export async function generateQRCodeUrl(email: string, secret: string, serviceName: string = process.env.APP_NAME): Promise<string> {
  const otpAuth = authenticator.keyuri(email, serviceName, secret);
  return otpAuth;
}

export async function generateQRCodeDataUrl(otpAuthUrl: string): Promise<string> {
  try {
    // Dynamic import for better Next.js server action compatibility
    const QRCodeModule = await import('qrcode');
    const QRCode = QRCodeModule.default || QRCodeModule;
    const dataUrl = await QRCode.toDataURL(otpAuthUrl);
    return dataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function verifyToken(secret: string, token: string): Promise<boolean> {
  try {
    // Handle potentially encrypted secret
    const decryptedSecret = decryptSecret(secret);
    return authenticator.verify({ token, secret: decryptedSecret });
  } catch (error) {
    // If decryption fails, it might be an unencrypted legacy secret
    try {
      return authenticator.verify({ token, secret });
    } catch (innerError) {
      console.error('Error verifying token:', innerError);
      return false;
    }
  }
}

/**
 * Encrypt a secret using AES-256-CBC
 */
export function encryptSecret(secret: string): string {
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey) {
    console.warn('ENCRYPTION_KEY not found in environment. Secret will not be encrypted.');
    return secret;
  }

  try {
    // Use a fixed salt or derivation if needed, but here we assume the key is 32 bytes
    // The key in .env is 32 base64 characters? Let's check.
    // .env says: yJakLgA4E+ugIqUGBpxpnLAP+lQ3ZWhV8KG81+RbUrc=
    const key = Buffer.from(encryptionKey, 'base64');
    if (key.length !== 32) {
      throw new Error(`Invalid encryption key length: ${key.length} bytes (expected 32)`);
    }

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(secret, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Return IV + Encrypted Data
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption failed:', error);
    return secret;
  }
}

/**
 * Decrypt a secret using AES-256-CBC
 */
export function decryptSecret(encryptedData: string): string {
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey || !encryptedData.includes(':')) {
    return encryptedData;
  }

  try {
    const key = Buffer.from(encryptionKey, 'base64');
    const [ivHex, encryptedText] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    // If decryption fails, return original data (it might be unencrypted)
    return encryptedData;
  }
}























/**
 * Generate secure backup codes (10 codes of 8 uppercase alphanumeric characters)
 * Format: 8 random hex characters per code
 */
export async function generateBackupCodes(): Promise<string[]> {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    // Generate 6 random bytes (48 bits) for each code
    const bytes = crypto.randomBytes(6);
    // Convert to base36 (0-9, A-Z) and take first 8 characters
    const code = bytes.toString('hex').toUpperCase().substring(0, 8);
    codes.push(code);
  }
  return codes;
}

/**
 * Hash a single backup code using PBKDF2 for secure storage
 * Never store plain backup codes in the database
 */
export async function hashBackupCode(code: string): Promise<string> {
  return crypto
    .pbkdf2Sync(code, 'backup-code-salt', 100000, 32, 'sha256')
    .toString('hex');
}

/**
 * Hash multiple backup codes for database storage
 */
export async function hashBackupCodes(codes: string[]): Promise<string[]> {
  return Promise.all(codes.map(hashBackupCode));
}

/**
 * Verify a backup code against its hash
 * Uses constant-time comparison to prevent timing attacks
 */
export async function verifyBackupCode(hashedCode: string, plainCode: string): Promise<boolean> {
  try {
    const hash = await hashBackupCode(plainCode);
    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hashedCode)).valueOf();
  } catch (error) {
    // timingSafeEqual throws if buffers are different lengths
    return false;
  }
}
