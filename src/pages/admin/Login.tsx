import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { EyeIcon, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth.service';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null); // Clear previous error

    try {
      await login({ email, password });
      toast.success('Login successful');

      // Get the redirect path from location state or use default admin dashboard path
      const state = location.state as { from?: string } | null;
      const redirectTo = state?.from || '/admin/';

      // Navigate to the redirect path after a short delay to allow the toast to be seen
      setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 500);
    } catch (error: any) {
      console.error('Login error:', error);
      const msg = error.message || 'Failed to login';
      setErrorMessage(msg); // Set inline error
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the admin panel</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <EyeIcon size={20} />}
                </button>
              </div>
              {errorMessage && (
                <div className="text-red-500 text-sm mt-1">{errorMessage}</div>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </CardContent>

          <CardFooter>

            <Button
              variant="link"
              className="w-full"
              type="button"
              onClick={() => navigate('/admin-register')}
            >
              Don't have an account? Register
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
