'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

const ResetPasswordInteractive = () => {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain at least one special character';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: { password?: string; confirmPassword?: string } = {};

    const passwordError = validatePassword(password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Icon name="KeyIcon" size={32} variant="outline" className="text-primary-foreground" />
          </div>
          <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
            Reset Password
          </h1>
          <p className="text-muted-foreground">
            Create a new password for your account
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-card/80 backdrop-blur-md border border-border rounded-lg shadow-lg p-8">
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Icon name="LockClosedIcon" size={20} variant="outline" className="text-muted-foreground" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className={`w-full pl-12 pr-12 py-3 bg-background border ${
                      errors.password ? 'border-error' : 'border-input'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground transition-all duration-250 ease-smooth`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    <Icon
                      name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'}
                      size={20}
                      variant="outline"
                      className="text-muted-foreground hover:text-foreground transition-colors duration-250"
                    />
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-error flex items-center gap-2">
                    <Icon name="ExclamationCircleIcon" size={16} variant="solid" />
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Icon name="LockClosedIcon" size={20} variant="outline" className="text-muted-foreground" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className={`w-full pl-12 pr-12 py-3 bg-background border ${
                      errors.confirmPassword ? 'border-error' : 'border-input'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground transition-all duration-250 ease-smooth`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    <Icon
                      name={showConfirmPassword ? 'EyeSlashIcon' : 'EyeIcon'}
                      size={20}
                      variant="outline"
                      className="text-muted-foreground hover:text-foreground transition-colors duration-250"
                    />
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-error flex items-center gap-2">
                    <Icon name="ExclamationCircleIcon" size={16} variant="solid" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="bg-muted/30 border border-border rounded-md p-4">
                <p className="text-sm font-medium text-foreground mb-2">Password Requirements:</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Icon name="CheckCircleIcon" size={16} variant="solid" className={password.length >= 8 ? 'text-success' : 'text-muted-foreground'} />
                    At least 8 characters
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="CheckCircleIcon" size={16} variant="solid" className={/[A-Z]/.test(password) ? 'text-success' : 'text-muted-foreground'} />
                    One uppercase letter
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="CheckCircleIcon" size={16} variant="solid" className={/[a-z]/.test(password) ? 'text-success' : 'text-muted-foreground'} />
                    One lowercase letter
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="CheckCircleIcon" size={16} variant="solid" className={/[0-9]/.test(password) ? 'text-success' : 'text-muted-foreground'} />
                    One number
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon name="CheckCircleIcon" size={16} variant="solid" className={/[^A-Za-z0-9]/.test(password) ? 'text-success' : 'text-muted-foreground'} />
                    One special character
                  </li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-all duration-250 ease-smooth hover:-translate-y-0.5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Icon name="ArrowPathIcon" size={20} variant="outline" className="animate-spin" />
                    Resetting...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                <Icon name="CheckCircleIcon" size={32} variant="solid" className="text-success" />
              </div>
              <div>
                <h2 className="font-heading font-semibold text-xl text-foreground mb-2">
                  Password Reset Successful
                </h2>
                <p className="text-muted-foreground mb-6">
                  Your password has been reset successfully. You can now log in with your new password.
                </p>
              </div>
              <button
                onClick={() => router.push('/login')}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-all duration-250 ease-smooth"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Remember your password?{' '}
            <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordInteractive;
