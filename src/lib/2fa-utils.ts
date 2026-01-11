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
        return authenticator.verify({ token, secret });
    } catch (error) {
        console.error('Error verifying token:', error);
        return false;
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
