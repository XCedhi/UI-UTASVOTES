'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { setUserSession, getRoleDashboard, type UserRole } from '@/lib/auth-utils';
import { supabase } from '@/lib/supabase';

interface LoginFormProps {
  onSubmit?: (email: string, password: string) => void;
}

const LoginForm = ({ onSubmit }: LoginFormProps) => {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="w-full max-w-md mx-auto bg-card/80 backdrop-blur-md border border-border rounded-lg shadow-lg p-8">
        <div className="space-y-6">
          <div className="h-10 bg-muted animate-pulse rounded" />
          <div className="h-12 bg-muted animate-pulse rounded" />
          <div className="h-12 bg-muted animate-pulse rounded" />
          <div className="h-12 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@cktutas\.edu\.gh$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please use your institutional email (@cktutas.edu.gh)';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Attempt to sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('❌ Authentication error:', authError);
        setErrors({
          general: 'Invalid email or password. Please check your credentials and try again.',
        });
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        setErrors({
          general: 'Authentication failed. Please try again.',
        });
        setIsLoading(false);
        return;
      }

      console.log('✅ User authenticated:', authData.user.id);

      // Wait a moment for the session to be fully established
      await new Promise(resolve => setTimeout(resolve, 500));

      // Fetch user profile from database
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        console.error('❌ Profile fetch error:', profileError);
        setErrors({
          general: 'Failed to load user profile. Please contact support.',
        });
        setIsLoading(false);
        return;
      }

      console.log('✅ User profile loaded:', profile);

      // Check if password change is required
      if (profile.requires_password_change) {
        console.log('⚠️ Password change required for user');
        
        // Store session data first
        setUserSession({
          email: profile.email,
          role: profile.role as UserRole,
          name: profile.full_name || 'User',
          avatar: profile.avatar_url,
          accessEndDate: profile.access_end_date,
          originalRole: profile.role as UserRole,
        });

        // Redirect to password change page
        router.push('/change-password');
        return;
      }

      // Track login in database
      try {
        await fetch('/api/auth/track-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: authData.user.id,
            ipAddress: null, // Can be obtained from request headers in production
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
          }),
        });
        console.log('✅ Login tracked in database');
      } catch (trackError) {
        console.error('⚠️ Failed to track login (non-critical):', trackError);
        // Don't fail login if tracking fails
      }

      if (onSubmit) {
        onSubmit(email, password);
      }

      // Store minimal session data in localStorage (for backward compatibility)
      // The actual data will come from AuthContext/database
      setUserSession({
        email: profile.email,
        role: profile.role as UserRole,
        name: profile.full_name || 'User',
        avatar: profile.avatar_url,
        accessEndDate: profile.access_end_date,
        originalRole: profile.role as UserRole,
      });

      // Check for commission expiry
      if (profile.role === 'commission' && profile.access_end_date) {
        try {
          await fetch('/api/check-commission-expiry', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: authData.user.id,
            }),
          });
        } catch (error) {
          console.error('Failed to check commission expiry:', error);
        }
      }

      // Redirect to appropriate dashboard
      router.push(getRoleDashboard(profile.role as UserRole));
    } catch (error: any) {
      console.error('❌ Login error:', error);
      setErrors({
        general: 'An unexpected error occurred. Please try again.',
      });
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider: string) => {
    console.log(`OAuth login with ${provider}`);
    setErrors({ general: `${provider} authentication will be available soon` });
  };

  return (
    <div className="w-full max-w-md mx-auto bg-card/80 backdrop-blur-md border border-border rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-heading font-semibold text-foreground mb-2">Welcome Back</h2>
        <p className="text-muted-foreground">Sign in to access the electoral system</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <div className="p-4 bg-error/10 border border-error rounded-md flex items-start gap-3">
            <Icon
              name="ExclamationTriangleIcon"
              size={20}
              variant="solid"
              className="text-error flex-shrink-0 mt-0.5"
            />
            <p className="text-sm text-error">{errors.general}</p>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            Institutional Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon
                name="EnvelopeIcon"
                size={20}
                variant="outline"
                className="text-muted-foreground"
              />
            </div>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.name@cktutas.edu.gh"
              className={`w-full pl-10 pr-4 py-3 bg-background border ${
                errors.email ? 'border-error' : 'border-input'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground transition-all duration-250 ease-smooth`}
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p className="mt-2 text-sm text-error flex items-center gap-1">
              <Icon name="ExclamationCircleIcon" size={16} variant="solid" />
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon
                name="LockClosedIcon"
                size={20}
                variant="outline"
                className="text-muted-foreground"
              />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className={`w-full pl-10 pr-12 py-3 bg-background border ${
                errors.password ? 'border-error' : 'border-input'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground transition-all duration-250 ease-smooth`}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              disabled={isLoading}
            >
              <Icon
                name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'}
                size={20}
                variant="outline"
                className="text-muted-foreground hover:text-foreground transition-colors duration-250 ease-smooth"
              />
            </button>
          </div>
          {errors.password && (
            <p className="mt-2 text-sm text-error flex items-center gap-1">
              <Icon name="ExclamationCircleIcon" size={16} variant="solid" />
              {errors.password}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
              disabled={isLoading}
            />
            <span className="text-sm text-muted-foreground">Remember me</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:text-primary/80 transition-colors duration-250 ease-smooth"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-250 ease-smooth disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <Icon name="ArrowRightOnRectangleIcon" size={20} variant="outline" />
              <span>Sign In</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-card text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleOAuthLogin('Google')}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-background border border-input rounded-md hover:bg-muted transition-all duration-250 ease-smooth disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-sm font-medium text-foreground">Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleOAuthLogin('Microsoft')}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-background border border-input rounded-md hover:bg-muted transition-all duration-250 ease-smooth disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#f25022" d="M1 1h10v10H1z" />
              <path fill="#00a4ef" d="M13 1h10v10H13z" />
              <path fill="#7fba00" d="M1 13h10v10H1z" />
              <path fill="#ffb900" d="M13 13h10v10H13z" />
            </svg>
            <span className="text-sm font-medium text-foreground">Microsoft</span>
          </button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            href="/contact-admin"
            className="text-primary hover:text-primary/80 font-medium transition-colors duration-250 ease-smooth"
          >
            Contact administrator
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
