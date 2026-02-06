'use server';

import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';
import { verifyToken, verifyBackupCode } from '@/lib/2fa-utils';
import { formatError } from '@/lib/utils';

/**
 * Helper function to set session cookies
 */
async function setSessionCookies(userId: string): Promise<void> {
  const token = `${userId}-${Date.now()}`;
  const cookieStore = await cookies();

  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60, // 24 hours
  });

  try {
    cookieStore.set('userId', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
    });
  } catch (cookieError) {
    console.error('Error setting userId cookie:', cookieError);
  }
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    name?: string | null;
    role?: string;
  };
  twoFactorEnabled?: boolean;
  twoFactorVerified?: boolean;
}

export async function loginAction(
  email: string,
  password: string
): Promise<LoginResponse> {
  try {
    if (!email.trim() || !password.trim()) {
      return {
        success: false,
        message: 'Please enter both email and password.',
      };
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        password: true,
        email: true,
        name: true,
        role: true,
        twoFactorEnabled: true,
        twoFactorVerified: true,
      },
    });
    console.log('User found:', user);

    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password.',
      };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid email or password.',
      };
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Only set session cookies if 2FA is NOT enabled
    if (!user.twoFactorEnabled) {
      await setSessionCookies(user.id);
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'USER',
      },
      twoFactorEnabled: user.twoFactorEnabled ?? false,
      twoFactorVerified: user.twoFactorVerified ?? false,
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: formatError(error, 'An error occurred during login. Please try again.'),
    };
  }
}

export async function logoutAction(): Promise<{ success: boolean }> {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
  cookieStore.delete('userId');
  return { success: true };
}

export async function getAuthStatus(): Promise<{
  isAuthenticated: boolean;
  user?: {
    id: string;
    email: string;
    name?: string | null;
    role?: string;
  };
  role?: string;
}> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');
  const userId = cookieStore.get('userId');

  if (token && userId?.value) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId.value },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      if (user) {
        return {
          isAuthenticated: true,
          user,
          role: user.role,
        };
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  }

  return {
    isAuthenticated: false,
  };
}



/**
 * Verify TOTP code for 2FA authentication
 * Decrypts stored secret and validates the provided code
 * Sets session cookies upon successful verification
 */
export async function verify2FACode(
  { userId, totpCode }: { userId: string; totpCode: string }
): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    console.log('Verifying 2FA code for userId:', userId);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        twoFactorEnabled: true,
        twoFactorVerified: true,
        twoFactorSecret: true,
      },
    });

    console.log('Verifying 2FA for user:', user);

    if (!user?.twoFactorEnabled || !user?.twoFactorVerified) {
      return {
        success: false,
        message: '2FA is not enabled for this account',
      };
    }
    console.log('User 2FA secret retrieved.');

    if (!user.twoFactorSecret) {
      return {
        success: false,
        message: '2FA secret not found',
      };
    }

    // Verify the TOTP code directly with the stored secret
    const isValid = await verifyToken(user.twoFactorSecret, totpCode);
    if (!isValid) {
      return {
        success: false,
        message: 'Invalid 2FA code. Please try again.',
      };
    }

    // Set session cookies after successful 2FA verification
    await setSessionCookies(userId);

    return { success: true };
  } catch (error) {
    console.error('Error verifying 2FA code:', error);
    return {
      success: false,
      message: formatError(error, 'Error verifying 2FA code.'),
    };
  }
}


/**
 * Verify backup code for 2FA authentication (fallback)
 * Compares against hashed backup codes and removes used code
 */
export async function verify2FABackupCode(
  userId: string,
  backupCode: string
): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        twoFactorEnabled: true,
        twoFactorVerified: true,
        twoFactorBackupCodes: true,
      },
    });

    if (!user?.twoFactorEnabled || !user?.twoFactorVerified) {
      return {
        success: false,
        message: '2FA is not enabled for this account',
      };
    }

    // Normalize and trim the input code
    const normalizedCode = backupCode.trim();
    const hashedCodes = user.twoFactorBackupCodes || [];

    // Find and verify the backup code against hashed versions
    let codeFound = false;
    let usedCodeIndex = -1;

    for (let i = 0; i < hashedCodes.length; i++) {
      try {
        if (verifyBackupCode(hashedCodes[i], normalizedCode)) {
          codeFound = true;
          usedCodeIndex = i;
          break;
        }
      } catch (error) {
        // Continue checking other codes if this one has length mismatch
        continue;
      }
    }

    if (!codeFound) {
      return {
        success: false,
        message: 'Invalid backup code',
      };
    }

    // Remove the used backup code
    const updatedCodes = hashedCodes.filter((_, i) => i !== usedCodeIndex);

    // Update user with remaining backup codes
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorBackupCodes: updatedCodes,
      },
    });

    // Set session cookies after successful backup code verification
    await setSessionCookies(userId);

    return {
      success: true,
      message: `Backup code verified. ${updatedCodes.length} codes remaining.`,
    };
  } catch (error) {
    console.error('Error verifying backup code:', error);
    return {
      success: false,
      message: formatError(error, 'Error verifying backup code.'),
    };
  }
}
