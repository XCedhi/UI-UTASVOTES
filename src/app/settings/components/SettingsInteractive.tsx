'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';
import { useTheme } from '@/contexts/ThemeContext';

interface SettingsState {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  electionReminders: boolean;
  resultNotifications: boolean;
  campaignUpdates: boolean;
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
}

const SettingsInteractive = () => {
  const router = useRouter();
  const { theme: currentTheme, setTheme } = useTheme();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsState>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    electionReminders: true,
    resultNotifications: true,
    campaignUpdates: false,
    language: 'en',
    timezone: 'Africa/Accra',
    theme: 'light',
  });

  useEffect(() => {
    setIsHydrated(true);
    // Sync with current theme
    setSettings((prev) => ({ ...prev, theme: currentTheme }));
  }, [currentTheme]);

  const handleToggle = (key: keyof SettingsState) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <Header userRole="student" userName="Loading..." notificationCount={0} />
        <main className="pt-24 pb-12 px-4 lg:px-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="h-96 bg-muted animate-pulse rounded-lg" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        userRole="student"
        userName="John Mensah"
        userAvatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
        notificationCount={3}
        electionStatus={{
          isActive: true,
          name: 'Student Council Elections 2026',
          endTime: '2026-02-15T23:59:59',
        }}
      />

      <main className="pt-24 pb-12 px-4 lg:px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading font-bold text-3xl text-foreground mb-2">Settings</h1>
              <p className="text-muted-foreground">
                Manage your account preferences and notification settings
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-all duration-250"
            >
              <Icon name="ArrowLeftIcon" size={20} variant="outline" />
              Back
            </button>
          </div>

          {/* Notifications Section */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
                <Icon name="BellIcon" size={24} variant="outline" className="text-primary" />
              </div>
              <div>
                <h2 className="font-heading font-semibold text-xl text-foreground">
                  Notifications
                </h2>
                <p className="text-sm text-muted-foreground">Choose how you want to be notified</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                {
                  key: 'emailNotifications',
                  label: 'Email Notifications',
                  description: 'Receive updates via email',
                },
                {
                  key: 'smsNotifications',
                  label: 'SMS Notifications',
                  description: 'Get text messages for important updates',
                },
                {
                  key: 'pushNotifications',
                  label: 'Push Notifications',
                  description: 'Browser notifications for real-time updates',
                },
                {
                  key: 'electionReminders',
                  label: 'Election Reminders',
                  description: 'Reminders about upcoming elections and deadlines',
                },
                {
                  key: 'resultNotifications',
                  label: 'Result Notifications',
                  description: 'Get notified when election results are published',
                },
                {
                  key: 'campaignUpdates',
                  label: 'Campaign Updates',
                  description: 'Updates from candidates and their campaigns',
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors duration-250"
                >
                  <div>
                    <h3 className="font-medium text-foreground mb-1">{item.label}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <button
                    onClick={() => handleToggle(item.key as keyof SettingsState)}
                    className={`w-12 h-6 rounded-full relative transition-colors duration-250 ${
                      settings[item.key as keyof SettingsState]
                        ? 'bg-primary'
                        : 'bg-muted-foreground/30'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-250 ${
                        settings[item.key as keyof SettingsState] ? 'right-0.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Preferences Section */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent/10 rounded-md flex items-center justify-center">
                <Icon name="Cog6ToothIcon" size={24} variant="outline" className="text-accent" />
              </div>
              <div>
                <h2 className="font-heading font-semibold text-xl text-foreground">Preferences</h2>
                <p className="text-sm text-muted-foreground">Customize your experience</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-250"
                >
                  <option value="en">English</option>
                  <option value="tw">Twi</option>
                  <option value="ga">Ga</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-250"
                >
                  <option value="Africa/Accra">Africa/Accra (GMT)</option>
                  <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Theme
                  <span className="ml-2 text-xs text-muted-foreground">(Navy Blue Dark Mode)</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      value: 'light',
                      label: 'Light Mode',
                      icon: 'SunIcon',
                      desc: 'Bright and clean',
                    },
                    {
                      value: 'dark',
                      label: 'Dark Mode',
                      icon: 'MoonIcon',
                      desc: 'Navy blue theme',
                    },
                  ].map((themeOption) => (
                    <button
                      key={themeOption.value}
                      onClick={() => {
                        setTheme(themeOption.value as 'light' | 'dark');
                        setSettings({ ...settings, theme: themeOption.value as any });
                      }}
                      className={`p-6 border-2 rounded-md transition-all duration-250 ${
                        currentTheme === themeOption.value
                          ? 'border-primary bg-primary/10 shadow-md'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Icon
                        name={themeOption.icon as any}
                        size={32}
                        variant="outline"
                        className={
                          currentTheme === themeOption.value
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        }
                      />
                      <p className="text-sm font-medium text-foreground mt-3">
                        {themeOption.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{themeOption.desc}</p>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Dark mode features a professional navy blue color scheme for reduced eye strain
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-4">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-muted text-foreground rounded-md font-medium hover:bg-muted/80 transition-all duration-250"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-all duration-250 ease-smooth hover:-translate-y-0.5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsInteractive;
