'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, LogIn, AlertCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { loginAction, verify2FACode, verify2FABackupCode } from '@/actions/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<'credentials' | 'totp' | 'backup'>('credentials');
  const [userId, setUserId] = useState<string | null>(null);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    startTransition(async () => {
      try {
        const result = await loginAction(email, password);
        console.log('Login result:', result);
        
        if (result.success && result.user?.id) {
          setUserId(result.user.id);
          
          // Check if 2FA is enabled from login response
          if (result.twoFactorEnabled && result.twoFactorVerified) {
            setStep('totp');
          } else {
            // No 2FA, redirect to admin
            console.log('No 2FA required, redirecting to admin');
            router.push('/admin');
          }
        } else {
          setError(result.message || 'Login failed');
        }
      } catch (error) {
        console.error('Unexpected error during login:', error);
        setError('An unexpected error occurred. Please try again.');
      }
    });
  };

  const handleTOTPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!totpCode.trim()) {
      setError('Please enter your 2FA code.');
      return;
    }

    if (!userId) {
      setError('Session error. Please try logging in again.');
      return;
    }

    startTransition(async () => {
      try {
        const result = await verify2FACode({userId:userId, totpCode:totpCode});

console.log('2FA verification result:', result);


        if (result.success) {
          router.push('/admin');
        } else {
          setError(result.message || 'Invalid 2FA code');
        }
      } catch (error) {
        
        console.log('Error verifying 2FA code:', error);
        console.error('Error verifying 2FA code:', error);
        setError('An unexpected error occurred. Please try again.');
      }
    });
    
  };

  const handleBackupCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!backupCode.trim()) {
      setError('Please enter your backup code.');
      return;
    }

    if (!userId) {
      setError('Session error. Please try logging in again.');
      return;
    }

    startTransition(async () => {
      try {
        const result = await verify2FABackupCode(userId, backupCode);
        if (result.success) {
          router.push('/admin');
        } else {
          setError(result.message || 'Invalid backup code');
        }
      } catch (error) {
        console.error('Error verifying backup code:', error);
        setError('An unexpected error occurred. Please try again.');
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-foreground py-12 px-4">
      <Card className="w-full max-w-md border-0 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
            {step === 'credentials' ? (
              <Truck className="h-8 w-8 text-primary-foreground" />
            ) : (
              <Shield className="h-8 w-8 text-primary-foreground" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {step === 'credentials' ? 'Admin Login' : 'Verify 2FA'}
          </CardTitle>
          <CardDescription>
            {step === 'credentials'
              ? 'Sign in to access the admin dashboard'
              : 'Enter your 2FA code from your authenticator app'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'credentials' && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="border-0">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter your email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  disabled={isPending} 
                  autoComplete="email" 
                  className="h-12" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Enter your password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  disabled={isPending} 
                  autoComplete="current-password" 
                  className="h-12" 
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30" 
                disabled={isPending}
              >
                {isPending ? 'Signing in...' : (<><LogIn className="mr-2 h-4 w-4" /> Sign In</>)}
              </Button>
            </form>
          )}

          {step === 'totp' && (
            <form onSubmit={useBackupCode ? handleBackupCodeSubmit : handleTOTPSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="border-0">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {!useBackupCode ? (
                <>
                  <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Open your authenticator app and enter the 6-digit code
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="totp">2FA Code</Label>
                    <Input 
                      id="totp" 
                      type="text" 
                      placeholder="000000" 
                      value={totpCode} 
                      onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                      disabled={isPending} 
                      maxLength={6}
                      className="h-12 text-center text-2xl tracking-widest font-mono" 
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-primary hover:bg-primary/90" 
                    disabled={isPending || totpCode.length !== 6}
                  >
                    {isPending ? 'Verifying...' : 'Verify Code'}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setUseBackupCode(true)}
                    disabled={isPending}
                  >
                    Don't have access? Use backup code
                  </Button>
                </>
              ) : (
                <>
                  <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      Enter one of your backup codes (8 characters, spaces optional)
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="backup">Backup Code</Label>
                    <Input 
                      id="backup" 
                      type="text" 
                      placeholder="XXXXXXXX" 
                      value={backupCode} 
                      onChange={(e) => setBackupCode(e.target.value.toUpperCase())} 
                      disabled={isPending} 
                      className="h-12 text-center font-mono" 
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-primary hover:bg-primary/90" 
                    disabled={isPending}
                  >
                    {isPending ? 'Verifying...' : 'Verify Backup Code'}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setUseBackupCode(false)}
                    disabled={isPending}
                  >
                    Back to 2FA code
                  </Button>
                </>
              )}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
