'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardTitle, CardHeader } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { Mail, ArrowLeft } from 'lucide-react';
import { authAPI } from '@/lib/api';

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  
  // Get email from URL if available (for resend functionality)
  useEffect(() => {
    const urlEmail = searchParams.get('email');
    if (urlEmail) {
      setEmail(urlEmail);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      console.log('📧 Sending forgot password request for:', email);
      const data = await authAPI.forgotPassword({ email });

      if (data && data.success) {
        // Show success message
        showToast({ 
          type: 'success', 
          title: 'Email Sent!', 
          message: 'Password reset instructions have been sent to your email.' 
        });
        
        // Redirect to verification page with email
        router.push(`/auth/reset-password-verification?email=${encodeURIComponent(email)}`);
      } else {
        setError(data?.error || 'Failed to send reset email. Please try again.');
        showToast({ 
          type: 'error', 
          title: 'Error!', 
          message: data?.error || 'Failed to send reset email. Please try again.' 
        });
      }
      
    } catch (err) {
      console.error('Failed to send reset email:', err);
      setError('Failed to send reset email. Please try again.');
      showToast({ 
        type: 'error', 
        title: 'Error!', 
        message: 'Failed to send reset email. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/auth/login');
  };



  return (
    <div className="min-h-screen relative overflow-hidden bg-background flex items-center justify-center p-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-gradient-to-br from-primary/25 to-primary-hover/25 blur-3xl opacity-70 animate-pulse" />
        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-gradient-to-tr from-emerald-400/15 to-sky-400/15 blur-3xl opacity-70 animate-pulse" />
      </div>
      <div className="w-full max-w-md relative">
        <div className="group relative">
          <div className="absolute -inset-[2px] rounded-3xl bg-gradient-to-r from-primary/50 via-primary-hover/50 to-primary/50 opacity-70 blur-xl transition-opacity duration-500 group-hover:opacity-90" aria-hidden="true" />
          <Card className="relative rounded-2xl border border-white/10 bg-background/70 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-r from-primary to-primary-hover mb-4 shadow-xl">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-text-primary">
            Forgot Password?
          </CardTitle>
          <CardDescription className="text-text-secondary">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full h-11 rounded-xl bg-background/70 transition-colors focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <Button 
              type="submit" 
              disabled={isLoading || !email}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBackToLogin}
                className="flex items-center gap-2 mx-auto text-text-secondary hover:text-text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Button>
            </div>
          </form>
        </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen relative overflow-hidden bg-background flex items-center justify-center p-6">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-28 -left-28 h-72 w-72 rounded-full bg-gradient-to-br from-primary/25 to-primary-hover/25 blur-3xl opacity-70" />
          <div className="absolute -bottom-28 -right-28 h-72 w-72 rounded-full bg-gradient-to-tr from-emerald-400/15 to-sky-400/15 blur-3xl opacity-70" />
        </div>
        <div className="text-center relative">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    }>
      <ForgotPasswordForm />
    </Suspense>
  );
}
