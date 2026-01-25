'use client';

import React, { useState, useEffect } from 'react';
import LoginForm from './LoginForm';
import ElectionAnnouncements from './ElectionAnnouncements';
import SystemStatus from './SystemStatus';

const LoginInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-8">
              <div className="h-96 bg-muted animate-pulse rounded-lg" />
            </div>
            <div className="space-y-8">
              <div className="h-96 bg-muted animate-pulse rounded-lg" />
              <div className="h-64 bg-muted animate-pulse rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleLoginSubmit = (email: string, password: string) => {
    console.log('Login submitted:', { email, password });
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <svg
              width="64"
              height="64"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="transition-transform duration-250 ease-smooth hover:scale-105"
            >
              <rect width="48" height="48" rx="12" fill="var(--color-primary)" />
              <path
                d="M24 12L14 18V26C14 31.52 18.02 36.52 24 38C29.98 36.52 34 31.52 34 26V18L24 12Z"
                fill="var(--color-primary-foreground)"
              />
              <path
                d="M22 28L18 24L19.41 22.59L22 25.17L28.59 18.58L30 20L22 28Z"
                fill="var(--color-accent)"
              />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-semibold text-foreground mb-4">
            UTASVotes Electoral System
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Secure digital campus electoral platform for University of Technical and Applied
            Sciences
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-8">
            <LoginForm onSubmit={handleLoginSubmit} />

            <div className="hidden lg:block">
              <SystemStatus />
            </div>
          </div>

          <div className="space-y-8">
            <ElectionAnnouncements />

            <div className="lg:hidden">
              <SystemStatus />
            </div>

            <div className="bg-card/80 backdrop-blur-md border border-border rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
                Need Help?
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-background/50 rounded-md">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-medium text-sm">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Use your institutional email
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Login with your @cktutas.edu.gh email address
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-background/50 rounded-md">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-medium text-sm">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Forgot your password?</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click &quot;Forgot password?&quot; to reset your credentials
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-background/50 rounded-md">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-medium text-sm">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Contact support</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Email support@cktutas.edu.gh for technical assistance
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm text-muted-foreground">
              Secured by UTAS Electoral Commission
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginInteractive;
