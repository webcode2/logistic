'use client';

import { useState, useTransition } from 'react';
import { LogOut, Lock, Shield, Key, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile, initiate2FASetup, verify2FASetup, disable2FA, regenerateBackupCodes } from '@/actions/2fa';
import { logoutAction } from '@/actions/auth';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  twoFactorEnabled: boolean;
  twoFactorVerified: boolean;
  requiresTwoFA: boolean;
  created_at: Date;
  updated_at: Date;
}

interface ProfileSettingsProps {
  user: User;
}

export default function ProfileSettings({ user }: ProfileSettingsProps) {
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [is2FASetupOpen, setIs2FASetupOpen] = useState(false);
  const [is2FADisableOpen, setIs2FADisableOpen] = useState(false);
  const [isBackupCodesOpen, setIsBackupCodesOpen] = useState(false);

  const [setupQRCode, setSetupQRCode] = useState('');
  const [setupBackupCodes, setSetupBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleUpdateProfile = () => {
    startTransition(async () => {
      try {
        const res = await updateUserProfile(user.id, { name, phone });
        if (res.success) {
          toast({
            title: 'Success',
            description: 'Profile updated successfully',
          });
        } else {
          toast({
            title: 'Error',
            description: res.error || 'Failed to update profile',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to update profile',
          variant: 'destructive',
        });
      }
    });
  };

  const handleInitiate2FA = () => {
    startTransition(async () => {
      try {
        const res = await initiate2FASetup(user.id);
        if (res.success) {
          setSetupQRCode(res.qrcodeUrl);
          setSetupBackupCodes(res.backupCodes);
          setIs2FASetupOpen(true);
        } else {
          toast({
            title: 'Error',
            description: res.error || 'Failed to initiate 2FA setup',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to initiate 2FA',
          variant: 'destructive',
        });
      }
    });
  };

  const handleVerify2FA = () => {
    if (!verificationCode.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter the verification code',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      try {
        const res = await verify2FASetup(user.id, verificationCode);
        if (res.success) {
          toast({
            title: 'Success',
            description: res.message || '2FA enabled successfully',
          });
          setIs2FASetupOpen(false);
          setVerificationCode('');
          router.refresh();
        } else {
          toast({
            title: 'Error',
            description: res.error || 'Failed to verify 2FA',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to verify 2FA',
          variant: 'destructive',
        });
      }
    });
  };

  const handleDisable2FA = () => {
    if (!disableCode.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a backup code',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      try {
        const res = await disable2FA(user.id, disableCode);
        if (res.success) {
          toast({
            title: 'Success',
            description: res.message || '2FA disabled successfully',
          });
          setIs2FADisableOpen(false);
          setDisableCode('');
          router.refresh();
        } else {
          toast({
            title: 'Error',
            description: res.error || 'Failed to disable 2FA',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to disable 2FA',
          variant: 'destructive',
        });
      }
    });
  };

  const handleRegenerateBackupCodes = () => {
    startTransition(async () => {
      try {
        const res = await regenerateBackupCodes(user.id);
        if (res.success) {
          setBackupCodes(res.backupCodes);
          setIsBackupCodesOpen(true);
          toast({
            title: 'Success',
            description: res.message || 'Backup codes regenerated',
          });
        } else {
          toast({
            title: 'Error',
            description: res.error || 'Failed to regenerate backup codes',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to regenerate backup codes',
          variant: 'destructive',
        });
      }
    });
  };

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      router.push('/login');
    });
  };

  const copyToClipboard = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-foreground to-foreground/90 text-background rounded-t-lg">
          <CardTitle className="text-background">Profile Settings</CardTitle>
          <CardDescription className="text-background/70">Manage your account information</CardDescription>
        </CardHeader>
        <CardContent className="pt-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-base font-semibold">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="h-10 bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="name" className="text-base font-semibold">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="h-10"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="phone" className="text-base font-semibold">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="h-10"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">Member Since</Label>
              <Input
                type="text"
                value={new Date(user.created_at).toLocaleDateString()}
                disabled
                className="h-10 bg-muted"
              />
            </div>
          </div>

          <Button onClick={handleUpdateProfile} disabled={isPending} className="bg-primary">
            Save Profile
          </Button>
        </CardContent>
      </Card>

      {/* 2FA Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-foreground to-foreground/90 text-background rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-background flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription className="text-background/70 mt-1">
                Add an extra layer of security to your account
              </CardDescription>
            </div>
            {user.twoFactorEnabled && (
              <Badge className="bg-green-600 h-fit">Enabled</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-8 space-y-6">
          {user.twoFactorEnabled ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  ✓ Two-Factor Authentication is active
                </p>
                <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                  Your account is protected with an authenticator app.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={handleRegenerateBackupCodes}
                  disabled={isPending}
                  className="h-10"
                >
                  <Key className="h-4 w-4 mr-2" />
                  New Backup Codes
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setIs2FADisableOpen(true)}
                  disabled={isPending}
                  className="h-10"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Disable 2FA
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  ⚠ Two-Factor Authentication is not enabled
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                  We recommend enabling 2FA to secure your account.
                </p>
              </div>

              <Button
                onClick={handleInitiate2FA}
                disabled={isPending}
                className="bg-primary w-full h-10"
              >
                <Shield className="h-4 w-4 mr-2" />
                Enable 2FA
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-foreground to-foreground/90 text-background rounded-t-lg">
          <CardTitle className="text-background">Session</CardTitle>
          <CardDescription className="text-background/70">Manage your login sessions</CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <Button
            variant="destructive"
            onClick={handleLogout}
            disabled={isPending}
            className="h-10"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </CardContent>
      </Card>

      {/* 2FA Setup Dialog */}
      <Dialog open={is2FASetupOpen} onOpenChange={setIs2FASetupOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Enable Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* QR Code Section */}
            <div className="flex flex-col items-center space-y-4 p-6 bg-muted rounded-lg">
              <p className="text-sm font-medium">Scan with your authenticator app:</p>
              <div className="p-4 bg-white rounded-lg">
                {setupQRCode ? (
                  <img src={setupQRCode} alt="QR code" width={200} height={200} />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center bg-gray-100">
                    <p className="text-sm text-gray-500">Loading QR code...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Verification Code Input */}
            <div className="space-y-3">
              <Label htmlFor="verification-code" className="text-base font-semibold">
                Enter the 6-digit code
              </Label>
              <Input
                id="verification-code"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="h-10 text-center text-2xl tracking-widest"
              />
            </div>

            {/* Backup Codes */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Backup codes</Label>
              <p className="text-sm text-muted-foreground">
                Save these codes in a safe place. You can use them to access your account if you lose access to your authenticator app.
              </p>
              <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg">
                {setupBackupCodes.map((code, index) => (
                  <div key={index} className="font-mono text-sm">
                    {code}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIs2FASetupOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerify2FA}
              disabled={isPending || verificationCode.length !== 6}
              className="bg-primary"
            >
              {isPending ? 'Verifying...' : 'Verify and Enable'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2FA Disable Dialog */}
      <Dialog open={is2FADisableOpen} onOpenChange={setIs2FADisableOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter one of your backup codes to disable 2FA
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              This action will disable two-factor authentication on your account. You can re-enable it anytime.
            </p>
            <div className="space-y-3">
              <Label htmlFor="disable-code" className="text-base font-semibold">
                Backup Code
              </Label>
              <Input
                id="disable-code"
                placeholder="Enter a backup code"
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value.toUpperCase())}
                className="h-10"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIs2FADisableOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisable2FA}
              disabled={isPending || !disableCode.trim()}
            >
              {isPending ? 'Disabling...' : 'Disable 2FA'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog open={isBackupCodesOpen} onOpenChange={setIsBackupCodesOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              New Backup Codes
            </DialogTitle>
            <DialogDescription>
              Save these codes in a safe place
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg">
              {backupCodes.map((code, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-background rounded border cursor-pointer hover:bg-muted/50"
                  onClick={() => copyToClipboard(code, index)}
                >
                  <span className="font-mono text-sm">{code}</span>
                  {copiedIndex === index ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setIsBackupCodesOpen(false)}
              className="bg-primary w-full"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
