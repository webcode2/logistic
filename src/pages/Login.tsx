import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Truck, LogIn, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { login } from '@/store/authSlice';
import { mockAdminCredentials, mockAdminUser } from '@/data/mockData';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    if (username === mockAdminCredentials.username && password === mockAdminCredentials.password) {
      const mockToken = `mock-jwt-token-${Date.now()}`;
      dispatch(login({ user: mockAdminUser, token: mockToken }));
      navigate('/admin');
    } else {
      setError('Invalid username or password. Try: admin / admin123');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-foreground py-12 px-4">
      <Card className="w-full max-w-md border-0 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
            <Truck className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>Sign in to access the admin dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="border-0">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" type="text" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} disabled={isLoading} autoComplete="username" className="h-12" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} autoComplete="current-password" className="h-12" />
            </div>
            
            <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30" disabled={isLoading}>
              {isLoading ? 'Signing in...' : (<><LogIn className="mr-2 h-4 w-4" /> Sign In</>)}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-foreground/5 rounded-xl border border-border">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Demo Credentials:</strong><br />
              Username: <code className="text-primary font-bold">admin</code><br />
              Password: <code className="text-primary font-bold">admin123</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
