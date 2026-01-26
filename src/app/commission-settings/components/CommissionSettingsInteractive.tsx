'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';
import { useTheme } from '@/contexts/ThemeContext';

interface CommissionSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  electionAlerts: boolean;
  candidateUpdates: boolean;
  resultNotifications: boolean;
  weeklyReports: boolean;
  language: string;
  timezone: string;
  dateFormat: string;
}

const CommissionSettingsInteractive = () => {
  const router = useRouter();
  const { theme: currentTheme, setTheme } = useTheme();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [settings, setSettings] = useState<CommissionSettings>({
    emailNotifications: true,
    smsNotifications: false,
    electionAlerts: true,
    candidateUpdates: true,
    resultNotifications: true,
    weeklyReports: true,
    language: 'en',
    timezone: 'Africa/Accra',
    dateFormat: 'DD/MM/YYYY',
  });

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1500);
  };

  const toggleSetting = (key: keyof CommissionSettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <Header userRole="commission" userName="Loading..." notificationCount={0} />
        <main className="pt-24 pb-12 px-4 lg:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="h-96 bg-muted animate-pulse rounded-lg" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        userRole="commission"
        userName="Electoral Commissioner"
        userAvatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
        notificationCount={3}
      />

      <main className="pt-24 pb-12 px-4 lg:px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
                Commission Settings
              </h1>
              <p className="text-muted-foreground">Configure your preferences and notifications</p>
            </div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-all duration-250"
            >
              <Icon name="ArrowLeftIcon" size={20} variant="outline" />
              Back
            </button>
          </div>

          {/* Success Banner */}
          {saveSuccess && (
            <div className="bg-success/10 border border-success/20 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Icon name="CheckCircleIcon" size={24} variant="solid" className="text-success" />
                <p className="text-success font-medium">Settings saved successfully!</p>
              </div>
            </div>
          )}

          {/* Notifications */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
              Notification Preferences
            </h3>
            <div className="space-y-4">
              {[
                {
                  key: 'emailNotifications',
                  label: 'Email Notifications',
                  description: 'Receive notifications via email',
                  icon: 'EnvelopeIcon',
                },
                {
                  key: 'smsNotifications',
                  label: 'SMS Notifications',
                  description: 'Receive important alerts via SMS',
                  icon: 'DevicePhoneMobileIcon',
                },
                {
                  key: 'electionAlerts',
                  label: 'Election Alerts',
                  description: 'Get notified about election status changes',
                  icon: 'BellAlertIcon',
                },
                {
                  key: 'candidateUpdates',
                  label: 'Candidate Updates',
                  description: 'Notifications for new candidate applications',
                  icon: 'UserGroupIcon',
                },
                {
                  key: 'resultNotifications',
                  label: 'Result Notifications',
                  description: 'Alerts when election results are ready',
                  icon: 'ChartBarIcon',
                },
                {
                  key: 'weeklyReports',
                  label: 'Weekly Reports',
                  description: 'Receive weekly activity summaries',
                  icon: 'DocumentTextIcon',
                },
              ].map((setting) => (
                <div
                  key={setting.key}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      name={setting.icon as any}
                      size={24}
                      variant="outline"
                      className="text-primary"
                    />
                    <div>
                      <p className="font-medium text-foreground">{setting.label}</p>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSetting(setting.key as keyof CommissionSettings)}
                    className={`relative w-12 h-6 rounded-full transition-all duration-250 ${
                      settings[setting.key as keyof CommissionSettings] ? 'bg-success' : 'bg-muted'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-250 ${
                        settings[setting.key as keyof CommissionSettings] ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
              General Preferences
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                >
                  <option value="en">English</option>
                  <option value="fr">French</option>
                  <option value="tw">Twi</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                >
                  <option value="Africa/Accra">Africa/Accra (GMT)</option>
                  <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Date Format
                </label>
                <select
                  value={settings.dateFormat}
                  onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Theme
                  <span className="ml-2 text-xs text-muted-foreground">(Navy Blue Dark Mode)</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      value: 'light',
                      label: 'Light Mode',
                      icon: 'SunIcon',
                      desc: 'Bright interface',
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
                      onClick={() => setTheme(themeOption.value as 'light' | 'dark')}
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
                  Dark mode uses a professional navy blue color scheme
                </p>
              </div>
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
              Privacy & Security
            </h3>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 bg-muted/30 rounded-md hover:bg-muted/50 transition-all duration-250">
                <div className="flex items-center gap-3">
                  <Icon name="KeyIcon" size={24} variant="outline" className="text-primary" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">Change Password</p>
                    <p className="text-sm text-muted-foreground">Update your account password</p>
                  </div>
                </div>
                <Icon
                  name="ChevronRightIcon"
                  size={20}
                  variant="outline"
                  className="text-muted-foreground"
                />
              </button>

              <button className="w-full flex items-center justify-between p-4 bg-muted/30 rounded-md hover:bg-muted/50 transition-all duration-250">
                <div className="flex items-center gap-3">
                  <Icon
                    name="ShieldCheckIcon"
                    size={24}
                    variant="outline"
                    className="text-success"
                  />
                  <div className="text-left">
                    <p className="font-medium text-foreground">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                </div>
                <Icon
                  name="ChevronRightIcon"
                  size={20}
                  variant="outline"
                  className="text-muted-foreground"
                />
              </button>

              <button className="w-full flex items-center justify-between p-4 bg-muted/30 rounded-md hover:bg-muted/50 transition-all duration-250">
                <div className="flex items-center gap-3">
                  <Icon name="ClockIcon" size={24} variant="outline" className="text-accent" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">Activity Log</p>
                    <p className="text-sm text-muted-foreground">
                      View your account activity history
                    </p>
                  </div>
                </div>
                <Icon
                  name="ChevronRightIcon"
                  size={20}
                  variant="outline"
                  className="text-muted-foreground"
                />
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-all duration-250"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-250 ease-smooth shadow-md disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Icon name="CheckCircleIcon" size={20} variant="outline" />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CommissionSettingsInteractive;
