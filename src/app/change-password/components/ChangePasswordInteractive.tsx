'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { supabase } from '@/lib/supabase';

const ChangePasswordInteractive = () => {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    setIsHydrated(true);
    checkAuthAndRequirement();
  }, []);

  const checkAuthAndRequirement = async () => {
    try {
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      setUserEmail(user.email || '');

      // Check if password change is required
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('requires_password_change')
        .eq('id', user.id)
        .single();

      if (profile && !profile.requires_password_change) {
        // Password change not required, redirect to dashboard
        const userRole = localStorage.getItem('userRole');
        if (userRole === 'admin') {
          router.push('/admin-dashboard');
        } else if (userRole === 'commission') {
          router.push('/electoral-commission-panel');
        } else {
          router.push('/student-dashboard');
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    }
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return 'Password must contain at least one special character (!@#$%^&*)';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      // Get current user and session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('No valid session found');
        alert('Your session has expired. Please login again with your temporary password.');
        router.push('/login');
        return;
      }

      const user = session.user;
      console.log('Changing password for user:', user.id);

      // Call API endpoint to change password (uses service role to bypass RLS)
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          newPassword: newPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Password change failed:', data.error);
        setError(data.error || 'Failed to change password. Please try again.');
        return;
      }

      console.log('✅ Password changed successfully via API');

      // Sign out to clear the old session
      await supabase.auth.signOut();
      console.log('✅ Session cleared');

      // Clear local storage
      localStorage.clear();

      // Show success message and redirect to login
      alert('Password changed successfully! Please login with your new password.');
      
      // Force redirect
      window.location.href = '/login';

    } catch (error: any) {
      console.error('Error changing password:', error);
      setError(error.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="LockClosedIcon" size={32} variant="outline" className="text-warning" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
              Change Your Password
            </h1>
            <p className="text-muted-foreground text-sm">
              For security reasons, you must change your temporary password before continuing
            </p>
          </div>

          {/* Alert Box */}
          <div className="bg-warning/10 border border-warning/30 rounded-md p-4 mb-6">
            <div className="flex items-start gap-3">
              <Icon name="ExclamationTriangleIcon" size={20} variant="solid" className="text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-warning font-medium mb-1">Password Change Required</p>
                <p className="text-xs text-warning/80">
                  Your account was created with a temporary password. Please create a new secure password to continue.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Current Password */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-foreground mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-12"
                  placeholder="Enter your temporary password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon
                    name={showCurrentPassword ? 'EyeSlashIcon' : 'EyeIcon'}
                    size={20}
                    variant="outline"
                  />
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-foreground mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-12"
                  placeholder="Create a strong password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon
                    name={showNewPassword ? 'EyeSlashIcon' : 'EyeIcon'}
                    size={20}
                    variant="outline"
                  />
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-12"
                  placeholder="Re-enter your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon
                    name={showConfirmPassword ? 'EyeSlashIcon' : 'EyeIcon'}
                    size={20}
                    variant="outline"
                  />
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-muted rounded-md p-4">
              <p className="text-xs font-medium text-foreground mb-2">Password must contain:</p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Icon name="CheckCircleIcon" size={14} variant="solid" className="text-success" />
                  At least 8 characters
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="CheckCircleIcon" size={14} variant="solid" className="text-success" />
                  One uppercase letter (A-Z)
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="CheckCircleIcon" size={14} variant="solid" className="text-success" />
                  One lowercase letter (a-z)
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="CheckCircleIcon" size={14} variant="solid" className="text-success" />
                  One number (0-9)
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="CheckCircleIcon" size={14} variant="solid" className="text-success" />
                  One special character (!@#$%^&*)
                </li>
              </ul>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-error/10 border border-error/30 rounded-md p-3">
                <p className="text-sm text-error flex items-center gap-2">
                  <Icon name="ExclamationCircleIcon" size={16} variant="solid" />
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-all duration-250 ease-smooth disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Changing Password...
                </>
              ) : (
                <>
                  <Icon name="LockClosedIcon" size={20} variant="outline" />
                  Change Password
                </>
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-center text-muted-foreground">
              Logged in as: <span className="font-medium text-foreground">{userEmail}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordInteractive;
