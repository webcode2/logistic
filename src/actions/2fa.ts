'use server';

import prisma from '@/lib/prisma';
import { generateSecret, generateQRCodeUrl, generateQRCodeDataUrl, generateBackupCodes, hashBackupCodes, verifyBackupCode, verifyToken } from '@/lib/2fa-utils';
import { formatError } from '@/lib/utils';


/**
 * Get current user profile
 */
export async function getCurrentUser(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        twoFactorEnabled: true,
        twoFactorVerified: true,
        requiresTwoFA: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    return { success: true, user };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('getCurrentUser error:', message);
    return { success: false, error: formatError(error, 'Failed to fetch user profile.') };
  }
}

/**
 * Update user profile (name, phone)
 */
export async function updateUserProfile(
  userId: string,
  data: { name?: string; phone?: string }
) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        phone: data.phone,
        updated_at: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        twoFactorEnabled: true,
        twoFactorVerified: true,
        created_at: true,
        updated_at: true,
      },
    });

    return { success: true, user };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('updateUserProfile error:', message);
    return { success: false, error: formatError(error, 'Failed to update profile.') };
  }
}

/**
 * Initiate 2FA setup - generates temporary secret and QR code
 * Secret is NOT returned to client for security - only QR code URL
 * Returns backup codes that MUST be saved by user
 */
export async function initiate2FASetup(userId: string) {
  try {
    // Verify user exists and 2FA is not already enabled
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        twoFactorEnabled: true,
        twoFactorVerified: true,
      },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Prevent re-enabling if already enabled or verified
    if (user.twoFactorEnabled || user.twoFactorVerified) {
      return {
        success: false,
        error: '2FA is already enabled for this account. Disable it first if you want to re-configure.',
      };
    }

    // Generate TOTP secret server-side only
    const secret = await generateSecret(user.email);

    // Generate backup codes
    const backupCodes = await generateBackupCodes();

    // Generate QR code provisioning URI (OTPAuth string)
    const otpAuth = await generateQRCodeUrl(user.email, secret);
    // Convert OTPAuth URI to a PNG data URL for client-side <img>
    const qrcodeUrl = await generateQRCodeDataUrl(otpAuth);

    // Store temporary setup data with expiration (15 minutes)
    const setupExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorTempSecret: secret,
        twoFactorTempSecretExpiresAt: setupExpiresAt,
        twoFactorTempBackupCodes: backupCodes,
      },
    });

    return {
      success: true,
      // Return QR code URL and backup codes, but NOT the raw secret
      qrcodeUrl,
      backupCodes,
      expiresIn: 15 * 60 * 1000, // 15 minutes in milliseconds
      message: 'Scan the QR code with your authenticator app. Save the backup codes in a safe place.',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('initiate2FASetup error:', message);
    return { success: false, error: formatError(error, 'Failed to initiate 2FA setup.') };
  }
}

/**
 * Verify 2FA setup - validates TOTP code and enables 2FA
 * Called after user scans QR code and enters code from authenticator
 */
export async function verify2FASetup(userId: string, verificationCode: string) {
  try {
    // Validate code format
    if (!/^\d{6}$/.test(verificationCode.trim())) {
      return { success: false, error: 'Invalid verification code format. Must be 6 digits.' };
    }

    // Fetch user and temporary setup data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        twoFactorEnabled: true,
        twoFactorVerified: true,
        twoFactorTempSecret: true,
        twoFactorTempSecretExpiresAt: true,
        twoFactorTempBackupCodes: true,
      },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Check if 2FA already enabled/verified
    if (user.twoFactorEnabled || user.twoFactorVerified) {
      return {
        success: false,
        error: '2FA is already enabled. Cannot re-enable.',
      };
    }

    // Check if temporary secret exists and hasn't expired
    if (!user.twoFactorTempSecret || !user.twoFactorTempSecretExpiresAt) {
      return { success: false, error: 'Setup session not found. Please initiate setup again.' };
    }

    const now = new Date();
    const expiresAt = user.twoFactorTempSecretExpiresAt as Date;
    if (now > expiresAt) {
      // Clean up expired setup
      await prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorTempSecret: null,
          twoFactorTempSecretExpiresAt: null,
          twoFactorTempBackupCodes: [],
        },
      });
      return { success: false, error: 'Setup session expired. Please initiate setup again.' };
    }

    // Use temporary secret directly to verify the code
    const tempSecret = user.twoFactorTempSecret as string;
    const isValidCode = await verifyToken(tempSecret, verificationCode.trim());
    if (!isValidCode) {
      return { success: false, error: 'Invalid verification code. Please check and try again.' };
    }

    // Code is valid - now permanently enable 2FA
    // Hash backup codes before storing
    const hashedBackupCodes = await hashBackupCodes(user.twoFactorTempBackupCodes || []);

    // Update user: move temp secret to permanent, hash backup codes, enable 2FA
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        // Move from temporary to permanent storage
        twoFactorSecret: tempSecret,
        twoFactorBackupCodes: hashedBackupCodes,
        twoFactorEnabled: true,
        twoFactorVerified: true,
        // Clear temporary setup data
        twoFactorTempSecret: null,
        twoFactorTempSecretExpiresAt: null,
        twoFactorTempBackupCodes: [],
        updated_at: new Date(),
      },
      select: {
        id: true,
        email: true,
        twoFactorEnabled: true,
        twoFactorVerified: true,
      },
    });

    return {
      success: true,
      user: updatedUser,
      message: '2FA has been successfully enabled. Your backup codes have been saved securely.',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('verify2FASetup error:', message);
    return { success: false, error: formatError(error, 'Failed to enable 2FA verification.') };
  }
}

/**
 * Disable 2FA using backup code for verification
 */
export async function disable2FA(userId: string, backupCode: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        twoFactorBackupCodes: true,
        twoFactorEnabled: true,
        twoFactorVerified: true,
      },
    });

    if (!user || !user.twoFactorEnabled) {
      return { success: false, error: '2FA is not enabled for this account' };
    }

    // Verify backup code against hashed codes
    const hashedCodes = user.twoFactorBackupCodes || [];
    let validCode = false;

    for (const hashedCode of hashedCodes) {
      if (verifyBackupCode(hashedCode, backupCode.trim())) {
        validCode = true;
        break;
      }
    }

    if (!validCode) {
      return { success: false, error: 'Invalid backup code' };
    }

    // Disable 2FA and clear all related data
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorVerified: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: [],
        twoFactorTempSecret: null,
        twoFactorTempSecretExpiresAt: null,
        twoFactorTempBackupCodes: [],
        updated_at: new Date(),
      },
    });

    return {
      success: true,
      message: '2FA has been disabled',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('disable2FA error:', message);
    return { success: false, error: formatError(error, 'Failed to disable 2FA.') };
  }
}

/**
 * Regenerate backup codes for existing 2FA setup
 */
export async function regenerateBackupCodes(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        twoFactorEnabled: true,
        twoFactorVerified: true,
      },
    });

    if (!user || !user.twoFactorEnabled) {
      return { success: false, error: '2FA must be enabled to regenerate backup codes' };
    }

    // Generate new backup codes
    const newCodes = await generateBackupCodes();
    const hashedCodes = await hashBackupCodes(newCodes);

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorBackupCodes: hashedCodes,
        updated_at: new Date(),
      },
    });

    return {
      success: true,
      backupCodes: newCodes,
      message: 'Backup codes have been regenerated. Save them in a safe place. The old codes are no longer valid.',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('regenerateBackupCodes error:', message);
    return { success: false, error: formatError(error, 'Failed to regenerate backup codes.') };
  }
}
