'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Eye, EyeOff } from 'lucide-react';
import { validateLogin } from '@/utils/validateLogin';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const validation = validateLogin({ email, password, rememberMe });
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(email, password, rememberMe);
      if (success) {
        const userRole = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).role : 'student';
        const dashboardPath = `/dashboard/${userRole.toLowerCase()}`;
        router.push(dashboardPath);
      } else {
        setError('Invalid email or password');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = email.trim().length >= 5 && password.trim().length >= 1;

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-primary/25 to-primary-hover/25 blur-3xl opacity-80 animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] rounded-full bg-gradient-to-tr from-emerald-400/15 to-sky-400/15 blur-3xl opacity-80 animate-pulse" />

      <div className="relative grid grid-cols-1 lg:grid-cols-2 flex-1">
        {/* Illustration Panel */}
        <div className="hidden lg:flex items-center justify-center p-12 bg-gradient-to-br from-primary/10 to-white">
          <div className="max-w-lg w-full space-y-10">
            <div className="relative">
              <img
                src="/schoobus-amico.png"
                alt="School bus illustration"
                className="w-full h-auto animate-bounce"
                style={{
                  animation: 'moveBus 6.5s linear infinite'
                }}
              />
            </div>
            
            <style jsx>{`
              @keyframes moveBus {
                0% {
                  transform: translateY(-20px);
                }
                50% {
                  transform: translateY(20px);
                }
                100% {
                  transform: translateY(-20px);
                }
              }
            `}</style>

            

            {/* Developed By Section */}
            <div className="mt-12 text-center">
              <p className="text-sm font-medium text-text-secondary">
                Developed by: <span className="font-semibold text-primary">Hazem Essam</span> &{' '}
                <span className="font-semibold text-primary">Youssry Essam</span>
              </p>
              <p className="text-sm text-text-muted mt-1">📞 01094575914 & 01289529751</p>
       
            </div>
          </div>
        </div>

        {/* Form Panel */}
        <div className="flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            <div className="group relative">
              <div className="absolute -inset-[2px] rounded-3xl bg-gradient-to-r from-primary/50 via-primary-hover/50 to-primary/50 opacity-70 blur-xl transition-opacity duration-500 group-hover:opacity-90" aria-hidden="true" />
              <Card className="relative shadow-2xl border border-white/10 bg-background/70 backdrop-blur-xl rounded-2xl">
                <CardHeader className="text-center space-y-2">
                  <CardTitle className="text-3xl font-bold text-text-primary">Welcome back 👋</CardTitle>
                  <CardDescription className="text-base text-text-secondary">Login to Book Your Bus</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-text-primary mb-2">
                        Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        autoComplete="email"
                        required
                        className="h-11 rounded-xl bg-background/70 transition-colors focus:ring-2 focus:ring-primary/40 focus:border-primary"
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-semibold text-text-primary mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          autoComplete="current-password"
                          required
                          className="h-11 pr-10 rounded-xl bg-background/70 transition-colors focus:ring-2 focus:ring-primary/40 focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                        />
                        <span className="text-sm text-text-secondary">Remember me</span>
                      </label>
                    </div>

                    {error && (
                      <div className="text-error text-sm bg-red-50 border border-red-200 p-4 rounded-lg">
                        {error}
                      </div>
                    )}

                    <Button type="submit" className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary-hover text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5 active:translate-y-0" disabled={isLoading || !isFormValid}>
                      {isLoading ? 'Signing in...' : 'Sign in'}
                    </Button>
                  </form>

                  <div className="mt-6 text-center">
                    <Link href="/auth/forgot-password" className="text-sm text-primary hover:text-primary-hover font-medium">
                      Forgot your password?
                    </Link>
                  </div>

                  <p className="mt-4 text-center text-xs text-text-muted">
                    By continuing, you agree to our Terms and Privacy Policy.
                  </p>

                  <div className="mt-6 text-center">
                    <span className="text-sm text-text-muted">Don&apos;t have an account? </span>
                    <Link href="/register" className="text-sm text-primary hover:text-primary-hover font-medium">
                      Sign up
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
