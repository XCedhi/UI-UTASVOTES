'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

const ForgotPasswordInteractive = () => {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@cktutas\.edu\.gh$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please use your institutional email (@cktutas.edu.gh)');
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
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
            <Icon
              name="LockClosedIcon"
              size={32}
              variant="outline"
              className="text-primary-foreground"
            />
          </div>
          <h1 className="font-heading font-bold text-3xl text-foreground mb-2">Forgot Password?</h1>
          <p className="text-muted-foreground">
            Enter your email and we&apos;ll send you instructions to reset your password
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-card/80 backdrop-blur-md border border-border rounded-lg shadow-lg p-8">
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Institutional Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Icon
                      name="EnvelopeIcon"
                      size={20}
                      variant="outline"
                      className="text-muted-foreground"
                    />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@cktutas.edu.gh"
                    className={`w-full pl-12 pr-4 py-3 bg-background border ${
                      error ? 'border-error' : 'border-input'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground transition-all duration-250 ease-smooth`}
                  />
                </div>
                {error && (
                  <p className="mt-2 text-sm text-error flex items-center gap-2">
                    <Icon name="ExclamationCircleIcon" size={16} variant="solid" />
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-all duration-250 ease-smooth hover:-translate-y-0.5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Icon
                      name="ArrowPathIcon"
                      size={20}
                      variant="outline"
                      className="animate-spin"
                    />
                    Sending...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-250 flex items-center justify-center gap-2"
                >
                  <Icon name="ArrowLeftIcon" size={16} variant="outline" />
                  Back to Login
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                <Icon name="CheckCircleIcon" size={32} variant="solid" className="text-success" />
              </div>
              <div>
                <h2 className="font-heading font-semibold text-xl text-foreground mb-2">
                  Check Your Email
                </h2>
                <p className="text-muted-foreground mb-4">
                  We&apos;ve sent password reset instructions to:
                </p>
                <p className="font-medium text-foreground mb-6">{email}</p>
                <p className="text-sm text-muted-foreground">
                  Didn&apos;t receive the email? Check your spam folder or{' '}
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    try again
                  </button>
                </p>
              </div>
              <button
                onClick={() => router.push('/login')}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-all duration-250 ease-smooth"
              >
                Return to Login
              </button>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Need help?{' '}
            <Link href="/contact-admin" className="text-primary hover:text-primary/80 font-medium">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordInteractive;
