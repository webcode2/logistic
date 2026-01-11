'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getCurrentUser } from '@/actions/2fa';
import { logoutAction, getAuthStatus } from '@/actions/auth';
import ProfileSettings from '@/components/admin/ProfileSettings';

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

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      // Check authentication status
      const authStatus = await getAuthStatus();
      if (!authStatus.isAuthenticated || !authStatus.user?.id) {
        router.push('/login');
        return;
      }

      // Fetch user profile
      const res = await getCurrentUser(authStatus.user.id);
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        toast({
          title: 'Error',
          description: res.error || 'Failed to load user profile',
          variant: 'destructive',
        });
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutAction();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-foreground text-background sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Settings className="h-5 w-5" />
                <h1 className="text-xl font-bold">Profile Settings</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-foreground text-background sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Settings className="h-5 w-5" />
              <div>
                <h1 className="text-xl font-bold">Profile Settings</h1>
                <p className="text-sm text-background/70">Manage your account preferences</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-background/20 text-background hover:bg-background hover:text-foreground"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <ProfileSettings user={user} />
      </main>
    </div>
  );
}
